import grpc from '@grpc/grpc-js';
import protoLoader  from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

// 👇 Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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
const metadata = new grpc.Metadata();
metadata.set('api-key', 'niall0000'); // Must match server key
// Call the gRPC service
client.SubmitResume(resume, metadata, (err, response) => {
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

