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

module.exports = {
  register,
  lookup,
};
