import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

// 👇 Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, 'proto/scheduler.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const grpcObject = grpc.loadPackageDefinition(packageDefinition);
const schedulerProto = grpcObject.scheduler;

const client = new schedulerProto.SchedulerService(
  'localhost:50052',
  grpc.credentials.createInsecure()
);

const interviewRequest = {
  candidate_email: "jane@example.com",
  available_times: ["Monday 10am", "Tuesday 2pm", "Wednesday 4pm"]
};

console.log("📤 Sending from client:", interviewRequest);

client.ScheduleInterview(interviewRequest, (err, response) => {
  if (err) {
    console.error("❌ Error:", err);
    return;
  }

  console.log("✅ Interview Scheduled:", response);

  const cancelRequest = { interview_id: response.interview_id };

  client.CancelInterview(cancelRequest, (err, cancelRes) => {
    if (err) {
      console.error("❌ Error canceling:", err);
    } else {
      console.log("✅ Cancel Interview Response:", cancelRes);
    }
  });
});
