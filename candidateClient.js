// Server Streaming
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

// ⬇️ Fix __dirname for ES module style
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, './proto/candidate.proto');

// Load the proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const grpcObj = grpc.loadPackageDefinition(packageDefinition);
const client = new grpcObj.candidate.CandidateService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Send streaming request
const skillToMatch = "Node.js";
const stream = client.StreamCandidateMatches({ skill: skillToMatch });

console.log(`📤 Requesting candidates with skill: ${skillToMatch}\n`);

stream.on('data', (candidate) => {
  console.log("🎯 Match:", candidate);
});

stream.on('end', () => {
  console.log("✅ Done receiving matches.");
});

stream.on('error', (err) => {
  console.error("❌ Stream error:", err.message);
});
