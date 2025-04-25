import { authenticate } from '../../utils/auth.js';
import grpc from '@grpc/grpc-js';
import { lookup, registerWithRegistry } from '../../RegistryClient.js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the candidate.proto definition
const PROTO_PATH = path.join(__dirname, '../../proto/candidate.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const grpcObject = grpc.loadPackageDefinition(packageDefinition);
const candidateProto = grpcObject.candidate;

// SubmitResume implementation with authentication and scheduling
async function SubmitResume(call, callback) {
  authenticate(call, callback, async () => {
    const { name, email, experience_years, skills } = call.request;

    console.log("📥 Resume received:", call.request);

    const score = (skills.length + experience_years) * 10;

    // Step 1: Send response back to client
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
  });
}


// GetDummyCandidates with authentication
function GetTopCandidates(call, callback) {
  authenticate(call, callback, () => {
    const { title } = call.request; // title (because your proto uses JobDescription.title)
    
    const topCandidates = [
      { name: "Alice", skills: ["JS", "React"], experience_years: 2 },
      { name: "Bob", skills: ["Node", "MongoDB"], experience_years: 3 },
    ];
    
    callback(null, { scores: topCandidates.map(c => ({
      candidate_name: c.name,
      match_percentage: (c.skills.length + c.experience_years) * 10,
    }))});
  });
}
function StreamCandidateMatches(call) {
  const { skill } = call.request;
  const candidates = [
    { name: "Alice", skills: ["Node.js", "React"], experience_years: 2 },
    { name: "Bob", skills: ["Node.js", "MongoDB"], experience_years: 3 },
    { name: "Charlie", skills: ["Python", "Flask"], experience_years: 4 },
  ];

  candidates.forEach((candidate) => {
    if (candidate.skills.includes(skill)) {
      call.write(candidate);
    }
  });

  call.end(); // ✅ Always end the stream
}
function UploadResumes(call, callback) {
  let count = 0;

  call.on('data', (resume) => {
    console.log("📥 Received resume:", resume.name);
    count++;
  });

  call.on('end', () => {
    console.log(`✅ All resumes received: ${count}`);
    callback(null, { total_received: count });
  });

  call.on('error', (err) => {
    console.error("❌ Client stream error:", err);
  });
}
function Chat(call) {
  console.log("🔁 Bi-directional chat started");

  call.on('data', (msg) => {
    console.log(`💬 ${msg.sender}: ${msg.message}`);

    // Echo the message back (for demo)
    call.write({
      sender: "Server",
      message: `Received: ${msg.message}`
    });
  });

  call.on('end', () => {
    console.log("📴 Chat ended");
    call.end();
  });

  call.on('error', (err) => {
    console.error("❌ Chat stream error:", err);
  });
}

// Start gRPC server and register service
function main() {
  const server = new grpc.Server();
  server.addService(candidateProto.CandidateService.service, {
    SubmitResume,
    GetTopCandidates,
    StreamCandidateMatches,
    UploadResumes,
    Chat,
  });

  const address = 'localhost:50051';

  registerWithRegistry('candidate', address);

  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`🟢 CandidateService running at http://${address}`);
  });
}

main();
