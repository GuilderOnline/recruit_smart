const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

console.log("🚀 Onboarding server booted up");

const PROTO_PATH = path.join(__dirname, '../../proto/onboarding.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const grpcObject = grpc.loadPackageDefinition(packageDefinition);
const onboardingProto = grpcObject.onboarding;

const onboardings = {}; // in-memory store

function StartOnboarding(call, callback) {
  const { candidate_email } = call.request;
  onboardings[candidate_email] = 'in progress';

  console.log(`🟢 Starting onboarding for ${candidate_email}`);
  callback(null, {
    candidate_email,
    status: 'in progress',
  });
}

function CheckOnboardingStatus(call, callback) {
  const { candidate_email } = call.request;
  const status = onboardings[candidate_email] || 'not started';

  console.log(`📍 Checking status for ${candidate_email}: ${status}`);
  callback(null, {
    candidate_email,
    status,
  });
}

function main() {
  console.log("✅ Registering onboarding service...");

  const server = new grpc.Server();
  server.addService(onboardingProto.OnboardingService.service, {
    StartOnboarding,
    CheckOnboardingStatus,
  });

  server.bindAsync("0.0.0.0:50053", grpc.ServerCredentials.createInsecure(), () => {
    console.log("🟢 OnboardingService running at http://localhost:50053");
  });
}

main();
