// gui/server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

// ⬇️ Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

app.use(cors());
app.use(bodyParser.json());
// ✅ Add this line to serve HTML/CSS/JS
app.use(express.static(path.join(__dirname, 'public')));

// ⬇️ Load gRPC CandidateService
const PROTO_PATH = path.join(__dirname, '../proto/candidate.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const candidateClient = new grpcObject.candidate.CandidateService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);
// ⬇️ New Route: Get Top Candidates
app.get('/get-top-candidates', (req, res) => {
  const metadata = new grpc.Metadata();
  metadata.set('api-key', 'niall0000'); // Must match auth.js

  candidateClient.GetTopCandidates({ title: "Software Engineer" }, metadata, (err, response) => {
    if (err) {
      console.error("❌ gRPC Error:", err.message);
      return res.status(500).send("Failed to get top candidates");
    }
    res.json(response);
  });
});


app.post('/submit-resume', (req, res) => {
  const resume = req.body;

  const metadata = new grpc.Metadata();
  metadata.set('api-key', 'niall0000'); // ✅ Must match VALID_API_KEY in auth.js

  // ✅ Pass metadata as 2nd argument
  candidateClient.SubmitResume(resume, metadata, (err, response) => {
    if (err) {
      console.error("❌ gRPC Error:", err);
      return res.status(500).json({ error: err.message }); // ✅ Send JSON error
    }
    console.log("✅ gRPC Response:", response);
    res.json(response);
  });
});

// ⬇️ Start server
app.listen(PORT, () => {
  console.log(`🌐 GUI Backend running at http://localhost:${PORT}`);
});
