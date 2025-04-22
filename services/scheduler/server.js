const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/scheduler.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const proto = grpc.loadPackageDefinition(packageDefinition).scheduler;

// Dummy in-memory interview store
const interviews = {};

function ScheduleInterview(call, callback) {
  const { candidate_email, available_times } = call.request;

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
  const server = new grpc.Server();
  server.addService(proto.SchedulerService.service, {
    ScheduleInterview,
    CancelInterview,
  });

  server.bindAsync("0.0.0.0:50052", grpc.ServerCredentials.createInsecure(), () => {
    console.log("SchedulerService running at http://localhost:50052");
  });
}

main();
