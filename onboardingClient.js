const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'proto/onboarding.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const grpcObject = grpc.loadPackageDefinition(packageDefinition);
const onboardingProto = grpcObject.onboarding;

const client = new onboardingProto.OnboardingService(
  'localhost:50053',
  grpc.credentials.createInsecure()
);

const request = { candidate_email: "jane@example.com" };

console.log("📤 Sending onboarding start request...");
client.StartOnboarding(request, (err, response) => {
  if (err) {
    console.error("❌ Error:", err);
    return;
  }

  console.log("✅ Onboarding Started:", response);

  // Check status
  client.CheckOnboardingStatus(request, (err, statusRes) => {
    if (err) {
      console.error("❌ Error checking status:", err);
    } else {
      console.log("📊 Onboarding Status:", statusRes);
    }
  });
});
