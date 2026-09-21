export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/school-platform',
  },
  
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Accept-Language', 'User-Agent'],
  },
  
  swagger: {
    enabled: process.env.NODE_ENV !== 'production',
    path: 'api/docs',
  },
  
  throttler: {
    ttl: parseInt(process.env.THROTTLER_TTL, 10) || 600000, // 10 minutes
    limit: parseInt(process.env.THROTTLER_LIMIT, 10) || 5, // 5 requests per IP
  },
  
  security: {
    helmetEnabled: process.env.HELMET_ENABLED !== 'false',
    rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    ipRateLimit: {
      windowMs: parseInt(process.env.IP_RATE_WINDOW_MS, 10) || 600000, // 10 minutes
      max: parseInt(process.env.IP_RATE_MAX, 10) || 5, // 5 requests per IP
    },
    mobileRateLimit: {
      windowMs: parseInt(process.env.MOBILE_RATE_WINDOW_MS, 10) || 86400000, // 24 hours
      max: parseInt(process.env.MOBILE_RATE_MAX, 10) || 10, // 10 requests per mobile
    },
    payloadLimit: process.env.PAYLOAD_LIMIT || '10mb',
    turnstile: {
      enabled: process.env.TURNSTILE_ENABLED === 'true',
      secretKey: process.env.TURNSTILE_SECRET_KEY || '',
      verifyUrl: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    },
    spamDetection: {
      enabled: process.env.SPAM_DETECTION_ENABLED !== 'false',
      riskThreshold: parseInt(process.env.SPAM_RISK_THRESHOLD, 10) || 50,
    },
  },
  
  registration: {
    referenceNumberPrefix: 'REG',
    currentYear: new Date().getFullYear(),
  },
});