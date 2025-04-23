const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { register } = require('../../RegistryClient');

// ✅ Load the candidate.proto definition
const PROTO_PATH = path.join(__dirname, '../../proto/candidate.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const grpcObject = grpc.loadPackageDefinition(packageDefinition);
const candidateProto = grpcObject.candidate; // 👈 Make sure this matches package name in .proto

// ✅ Dummy logic for SubmitResume and GetDummyCandidates
function SubmitResume(call, callback) {
  const { name, experience_years, skills } = call.request;
  const score = (skills.length + experience_years) * 10;
  callback(null, {
    candidate_name: name,
    match_percentage: score,
  });
}

function GetDummyCandidates(call, callback) {
  callback(null, {
    candidates: [
      { name: "Alice", match_percentage: 80 },
      { name: "Bob", match_percentage: 65 },
    ],
  });
}

// ✅ Start the gRPC server and register with the registry
function main() {
  const server = new grpc.Server();
  server.addService(candidateProto.CandidateService.service, {
    SubmitResume,
    GetDummyCandidates,
  });

  const address = 'localhost:50051';

  register('candidate', address)
    .then(() => console.log("✅ CandidateService registered"))
    .catch((err) => console.error("❌ Failed to register CandidateService:", err.message));

  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`🟢 CandidateService running at http://${address}`);
  });
}

main();
