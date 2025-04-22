const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/onboarding.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const proto = grpc.loadPackageDefinition(packageDefinition).onboarding;

// Dummy in-memory onboarding tracker
const onboardingDB = {};

function InitiateOnboarding(call, callback) {
  const { candidate_email } = call.request;

  onboardingDB[candidate_email] = {
    completed_tasks: [],
    pending_tasks: ["Upload ID", "Sign NDA", "Read Handbook"],
  };

  callback(null, {
    status: "initiated",
    completed_tasks: [],
    pending_tasks: onboardingDB[candidate_email].pending_tasks,
  });
}

function CheckStatus(call, callback) {
  const { candidate_email } = call.request;

  const data = onboardingDB[candidate_email];

  if (!data) {
    return callback(null, {
      status: "not found",
      completed_tasks: [],
      pending_tasks: [],
    });
  }

  callback(null, {
    status: "in progress",
    completed_tasks: data.completed_tasks,
    pending_tasks: data.pending_tasks,
  });
}

function main() {
  const server = new grpc.Server();
  server.addService(proto.OnboardingService.service, {
    InitiateOnboarding,
    CheckStatus,
  });

  server.bindAsync('0.0.0.0:50053', grpc.ServerCredentials.createInsecure(), () => {
    console.log("🟢 OnboardingService running at http://localhost:50053");
  });
}

main();
