export const appConfig = () => ({
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT!, 10),
  messageLimit: parseInt(process.env.MESSAGE_LIMIT!, 10),
  dispatcher: {
    intervalMs: parseInt(process.env.DISPATCH_INTERVAL_MS!, 10),
    requestTimeoutMs: parseInt(process.env.PROVIDER_REQUEST_TIMEOUT_MS!, 10),
  },
  batchProcess: {
    defaultTotalMessages: parseInt(
      process.env.BATCH_PROCESS_DEFAULT_TOTAL_MESSAGES!,
      10,
    ),
    requestConcurrency: parseInt(
      process.env.BATCH_PROCESS_REQUEST_CONCURRENCY!,
      10,
    ),
  },
  mockProvider: {
    maxMessagesPerSecond: parseInt(
      process.env.MOCK_PROVIDER_MAX_MESSAGES_PER_SECOND!,
      10,
    ),
  },
});
