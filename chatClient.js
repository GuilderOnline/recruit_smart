import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, './proto/candidate.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH);
const grpcObj = grpc.loadPackageDefinition(packageDef);
const client = new grpcObj.candidate.CandidateService('localhost:50051', grpc.credentials.createInsecure());

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const call = client.Chat();

call.on('data', (msg) => {
  console.log(`📨 ${msg.sender}: ${msg.message}`);
});

call.on('end', () => {
  console.log("🛑 Chat ended by server.");
  rl.close();
});

function sendMessage() {
  rl.question('You: ', (input) => {
    if (input === 'exit') {
      call.end();
    } else {
      call.write({ sender: "Client", message: input });
      sendMessage();
    }
  });
}

console.log("💬 Chat started. Type messages below. Type 'exit' to end.");
sendMessage();
