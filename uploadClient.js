import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.join(__dirname, 'proto/candidate.proto');

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const client = new grpcObject.candidate.CandidateService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

const call = client.UploadResumes((err, response) => {
  if (err) {
    console.error("❌ Upload failed:", err.message);
  } else {
    console.log(`✅ Server received ${response.total_received} resumes`);
  }
});

const resumes = [
  { name: "Anna", email: "anna@example.com", skills: ["Go", "gRPC"], experience_years: 2 },
  { name: "Ben", email: "ben@example.com", skills: ["Java", "Spring"], experience_years: 4 },
  { name: "Cara", email: "cara@example.com", skills: ["Node.js"], experience_years: 3 },
];

resumes.forEach((resume) => {
  call.write(resume);
});

call.end(); // Important: signal you're done
