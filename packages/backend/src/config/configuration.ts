export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/school-platform',
  },
  
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  
  swagger: {
    enabled: process.env.NODE_ENV !== 'production',
    path: 'api/docs',
  },
  
  throttler: {
    ttl: parseInt(process.env.THROTTLER_TTL, 10) || 600000, // 10 minutes
    limit: parseInt(process.env.THROTTLER_LIMIT, 10) || 5, // 5 requests per IP
  },
  
  registration: {
    referenceNumberPrefix: 'REG',
    currentYear: new Date().getFullYear(),
  },
});