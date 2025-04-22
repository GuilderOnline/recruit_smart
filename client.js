const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'proto/candidate.proto');

// Load proto definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition).candidate;

// Create gRPC client
const client = new proto.CandidateService('localhost:50051', grpc.credentials.createInsecure());

// Test data
const resume = {
  name: "Jane Doe",
  email: "jane@example.com",
  skills: ["Node.js", "JavaScript", "gRPC"],
  experience_years: 3,
};

// Call the gRPC service
client.SubmitResume(resume, (err, response) => {
  if (err) {
    console.error("❌ Error calling SubmitResume:", err);
    return;
  }

  if (!response || response.match_percentage === undefined) {
    console.error("⚠️ Invalid response from server:", response);
    return;
  }

  console.log(`✅ Received Score for ${response.candidate_name}: ${response.match_percentage.toFixed(2)}%`);
});

