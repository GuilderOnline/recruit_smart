// RegistryClient.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const REGISTRY_PROTO_PATH = path.join(__dirname, 'proto/registry.proto');

const packageDef = protoLoader.loadSync(REGISTRY_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const grpcObj = grpc.loadPackageDefinition(packageDef);
const RegistryService = grpcObj.registry.RegistryService;

const client = new RegistryService('localhost:5000', grpc.credentials.createInsecure());

function register(service_name, address) {
  return new Promise((resolve, reject) => {
    client.Register({ service_name, address }, (err, response) => {
      if (err) return reject(err);
      console.log(`📡 Registered "${service_name}" at ${address}`);
      resolve(response);
    });
  });
}

function lookup(service_name) {
  return new Promise((resolve, reject) => {
    client.Lookup({ service_name }, (err, response) => {
      if (err) return reject(err);
      resolve(response.address);
    });
  });
}
function registerWithRegistry(serviceName, serviceAddress) {
  const registryProtoPath = path.join(__dirname, 'proto/registry.proto');
  const registryDef = protoLoader.loadSync(registryProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const registryObj = grpc.loadPackageDefinition(registryDef);
  const registryClient = new registryObj.registry.RegistryService(
    'localhost:5000',
    grpc.credentials.createInsecure()
  );

  registryClient.Register({ service_name: serviceName, address: serviceAddress }, (err, res) => {
    if (err) {
      console.error(`❌ Failed to register "${serviceName}":`, err.message);
    } else {
      console.log(`📡 Registered "${serviceName}" at ${serviceAddress}`);
    }
  });
}


module.exports = {
  lookup,
  registerWithRegistry,
};
