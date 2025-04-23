const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { registerWithRegistry } = require('../../RegistryClient');

// ✅ Load scheduler proto
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

/* ✅ Load registry proto and register this service
function registerWithRegistry(serviceName, serviceAddress) {
  const registryProtoPath = path.join(__dirname, '../../proto/registry.proto');
  const registryDef = protoLoader.loadSync(registryProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const registryObj = grpc.loadPackageDefinition(registryDef);
  const registryClient = new registryObj.registry.RegistryService(
    'localhost:5000',
    grpc.credentials.createInsecure()
  );

  registryClient.Register({ service_name: serviceName, address: serviceAddress }, (err, res) => {
    if (err) {
      console.error(`❌ Failed to register "${serviceName}":`, err.message);
    } else {
      console.log(`📡 Registered "${serviceName}" at ${serviceAddress}`);
    }
  });
}
*/  

// 🧠 Interview data
const interviews = {};

async function ScheduleInterview(call, callback) {
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

  // 👇 AFTER interview is scheduled, try to start onboarding
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
}


function CancelInterview(call, callback) {
  const { interview_id } = call.request;

  if (interviews[interview_id]) {
    delete interviews[interview_id];
    callback(null, { status: "cancelled" });
  } else {
    callback(null, { status: "not found" });
  }
}

function main() {
  const server = new grpc.Server();
  server.addService(schedulerProto.SchedulerService.service, {
    ScheduleInterview,
    CancelInterview,
  });

  const address = 'localhost:50052';
  console.log("🚀 Scheduler server booting up...");

  // Dynamically register with RegistryService
  registerWithRegistry('scheduler', address);

  // Start gRPC server
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`🟢 SchedulerService running at http://${address}`);
  });
}

main();
