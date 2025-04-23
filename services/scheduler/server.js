function registerWithRegistry(serviceName, serviceAddress) {
  const protoLoader = require('@grpc/proto-loader');
  const grpc = require('@grpc/grpc-js');
  const path = require('path');

  const registryProtoPath = path.join(__dirname, '../../proto/registry.proto');

  const packageDef = protoLoader.loadSync(registryProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const grpcObj = grpc.loadPackageDefinition(packageDef);
  const registryClient = new grpcObj.registry.RegistryService(
    'localhost:5000', // 🧭 Must match registry server
    grpc.credentials.createInsecure()
  );

  registryClient.Register({ service_name: serviceName, address: serviceAddress }, (err, res) => {
    if (err) {
      console.error('❌ Failed to register with registry:', err);
    } else {
      console.log(`📡 Registered "${serviceName}" at ${serviceAddress}`);
    }
  });
}
