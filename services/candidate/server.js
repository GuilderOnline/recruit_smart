const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/candidate.proto');

// Load the .proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const proto = grpc.loadPackageDefinition(packageDefinition).candidate;

// Business logic
function submitResume(call, callback) {
  const { name, experience_years, skills } = call.request;
  const score = (skills.length + experience_years) * 10;
  callback(null, { candidate_name: name, match_percentage: score });
}

function getTopCandidates(call, callback) {
  const { required_skills } = call.request;
  const dummyScores = required_skills.map((skill, i) => ({
    candidate_name: `Candidate ${i + 1}`,
    match_percentage: Math.random() * 100,
  }));
  callback(null, { scores: dummyScores });
}

// Start server
function main() {
  const server = new grpc.Server();
  server.addService(proto.CandidateService.service, {
    SubmitResume: submitResume,
    GetTopCandidates: getTopCandidates,
  });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('🟢 CandidateService running at http://localhost:50051');
    server.start();
  });
}

main();
