import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from '../../utils/auth.js';
import { lookup, registerWithRegistry } from '../../RegistryClient.js';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load scheduler.proto
const PROTO_PATH = path.join(__dirname, '../../proto/scheduler.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const grpcObject = grpc.loadPackageDefinition(packageDefinition);
const schedulerProto = grpcObject.scheduler;

const interviews = {}; // In-memory interview store

async function ScheduleInterview(call, callback) {
  authenticate(call, callback, async () => {
    const { candidate_email, available_times } = call.request;
    console.log("📥 Received from client:", JSON.stringify(call.request, null, 2));

    if (!candidate_email || !Array.isArray(available_times)) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Missing or invalid interview request fields.",
      });
    }

    const scheduled_time = available_times[0] || "Next Monday 10 AM";
    const interview_id = `INT-${Math.floor(Math.random() * 10000)}`;

    interviews[interview_id] = {
      candidate_email,
      scheduled_time,
    };

    callback(null, {
      scheduled_time,
      interview_id,
      status: "confirmed",
    });

    // 🔁 Attempt to start onboarding after scheduling
    try {
      const onboardingAddress = await lookup('onboarding');
      const onboardingProtoPath = path.join(__dirname, '../../proto/onboarding.proto');
      const onboardingDef = protoLoader.loadSync(onboardingProtoPath);
      const grpcObj = grpc.loadPackageDefinition(onboardingDef);
      const onboardingClient = new grpcObj.onboarding.OnboardingService(
        onboardingAddress,
        grpc.credentials.createInsecure()
      );

      onboardingClient.StartOnboarding({ candidate_email }, (err, res) => {
        if (err) {
          console.error("❌ Failed to start onboarding:", err.message);
        } else {
          console.log("🚀 Onboarding started:", res);
        }
      });
    } catch (err) {
      console.error("❌ Error contacting OnboardingService:", err.message);
    }
  });
}

function CancelInterview(call, callback) {
  authenticate(call, callback, () => {
    const { interview_id } = call.request;

    if (interviews[interview_id]) {
      delete interviews[interview_id];
      callback(null, { status: "cancelled" });
    } else {
      callback(null, { status: "not found" });
    }
  });
}

function main() {
  const server = new grpc.Server();
  server.addService(schedulerProto.SchedulerService.service, {
    ScheduleInterview,
    CancelInterview,
  });

  const address = 'localhost:50052';
  console.log("🚀 Scheduler server booting up...");

  // Register with Registry
  registerWithRegistry('scheduler', address);

  // Start gRPC server
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`🟢 SchedulerService running at http://${address}`);
  });
}

main();
