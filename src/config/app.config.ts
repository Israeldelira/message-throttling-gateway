export const appConfig = () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  messageLimit: parseInt(process.env.MESSAGE_LIMIT || '100', 10),
  dispatcher: {
    intervalMs: parseInt(process.env.DISPATCH_INTERVAL_MS || '1000', 10),
    maxMessagesPerSecond: parseInt(
      process.env.DISPATCH_MAX_MESSAGES_PER_SECOND ||
        process.env.MESSAGE_LIMIT ||
        '100',
      10,
    ),
    requestTimeoutMs: parseInt(
      process.env.PROVIDER_REQUEST_TIMEOUT_MS || '5000',
      10,
    ),
  },
});
