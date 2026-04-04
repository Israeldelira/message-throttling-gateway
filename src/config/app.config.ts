export const appConfig = () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  messageLimit: parseInt(process.env.MESSAGE_LIMIT || '100', 10),
});
