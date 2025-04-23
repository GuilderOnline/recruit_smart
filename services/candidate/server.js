const grpc = require('@grpc/grpc-js');
const { lookup } = require('../../RegistryClient'); // for dynamic lookup
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { registerWithRegistry } = require('../../RegistryClient');
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
async function SubmitResume(call, callback) {
  const { name, email, experience_years, skills } = call.request;

  console.log("📥 Resume received:", call.request);

  const score = (skills.length + experience_years) * 10;

  // Step 1: send response back to client (non-blocking)
  callback(null, {
    candidate_name: name,
    match_percentage: score,
  });

  // Step 2: Try to schedule interview via SchedulerService
  try {
    const schedulerAddress = await lookup('scheduler');
    if (!schedulerAddress) throw new Error("Scheduler not found");

    const schedulerProtoPath = path.join(__dirname, '../../proto/scheduler.proto');
    const schedulerDef = protoLoader.loadSync(schedulerProtoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const grpcObj = grpc.loadPackageDefinition(schedulerDef);
    const schedulerClient = new grpcObj.scheduler.SchedulerService(
      schedulerAddress,
      grpc.credentials.createInsecure()
    );

    const interviewRequest = {
      candidate_email: email,
      available_times: ["Monday 10am", "Tuesday 3pm"],
    };
    console.log("📤 Attempting to call SchedulerService with:", interviewRequest);

    schedulerClient.ScheduleInterview(interviewRequest, (err, res) => {
      if (err) {
        console.error("❌ Failed to schedule interview:", err.message);
      } else {
        console.log("📅 Interview scheduled via SchedulerService:", res);
      }
    });
  } catch (err) {
    console.error("❌ Error contacting Scheduler:", err.message);
  }
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

  registerWithRegistry('candidate', address); // ✅ Call it directly

  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`🟢 CandidateService running at http://${address}`);
  });
}
main();
