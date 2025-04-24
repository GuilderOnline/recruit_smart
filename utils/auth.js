// utils/auth.js
import grpc from '@grpc/grpc-js';

const VALID_API_KEY = 'niall0000';

export function authenticate(call, callback, next) {
  const metadata = call.metadata.get('api-key');
  const clientKey = metadata[0];

  if (clientKey !== VALID_API_KEY) {
    return callback({
      code: grpc.status.UNAUTHENTICATED,
      message: 'Invalid API key',
    });
  }

  next(); // Allow handler to proceed
}
