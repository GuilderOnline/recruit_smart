const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

console.log("🚀 Scheduler server booted up");

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

const interviews = {};

function ScheduleInterview(call, callback) {
  console.log("📥 Received from client:", JSON.stringify(call.request, null, 2));

  const { candidate_email, available_times } = call.request;

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
  console.log("✅ Service registered — waiting to bind");

  const server = new grpc.Server();
  server.addService(schedulerProto.SchedulerService.service, {
    ScheduleInterview,
    CancelInterview,
  });

  server.bindAsync("0.0.0.0:50052", grpc.ServerCredentials.createInsecure(), () => {
    console.log("🟢 SchedulerService running at http://localhost:50052");
  });
}

main();
