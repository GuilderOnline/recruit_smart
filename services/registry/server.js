import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
// 👇 Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const PROTO_PATH = path.join(__dirname, '../../proto/registry.proto');

// Load .proto definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  defaults: true,
  oneofs: true,
});

const grpcObject = grpc.loadPackageDefinition(packageDefinition);
const registryProto = grpcObject.registry;

// In-memory service registry
const registry = {}; // Format: { service_name: address }

function Register(call, callback) {
  const { service_name, address } = call.request;
  registry[service_name] = address;
  console.log(`📦 Registered: ${service_name} at ${address}`);
  callback(null, { address });
}

function Lookup(call, callback) {
  const { service_name } = call.request;
  const address = registry[service_name] || '';
  console.log(`🔍 Lookup: ${service_name} → ${address || 'not found'}`);
  callback(null, { address });
}

function main() {
  const server = new grpc.Server();
  console.log("🛠️ Adding RegistryService definition to server...");
  server.addService(registryProto.RegistryService.service, {
    Register,
    Lookup,
  });

  server.bindAsync('localhost:5000', grpc.ServerCredentials.createInsecure(), () => {
    console.log('🧭 RegistryService running at http://localhost:5000');
  });
}

main();
