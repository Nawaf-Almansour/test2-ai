# Security Documentation

## Overview

This document outlines the comprehensive security measures implemented for the School Platform registration API to protect against common web vulnerabilities and abuse.

## Security Features

### 1. Rate Limiting

#### IP-based Rate Limiting
- **Limit**: 5 requests per IP address every 10 minutes
- **Purpose**: Prevent brute force attacks and automated abuse
- **Implementation**: `express-rate-limit` middleware
- **Response**: HTTP 429 with error code `RATE_LIMIT_EXCEEDED`

#### Mobile-based Rate Limiting
- **Limit**: 10 requests per mobile number per day (24 hours)
- **Purpose**: Prevent spam from the same phone number
- **Key Generation**: Uses mobile number from request body, falls back to IP
- **Response**: HTTP 429 with error code `MOBILE_RATE_LIMIT_EXCEEDED`

### 2. Bot Protection (Cloudflare Turnstile)

#### Server-side Verification
- **Implementation**: Custom `TurnstileService` with Cloudflare API integration
- **Token Validation**: Server-side verification of Turnstile tokens
- **Fail-closed**: Requests without valid tokens are blocked when enabled
- **Response**: HTTP 403 with error code `BOT_DETECTED` or `BOT_PROTECTION_REQUIRED`

#### Configuration
```typescript
// Environment variables
TURNSTILE_ENABLED=true
TURNSTILE_SECRET_KEY=your-secret-key
```

### 3. Security Headers (Helmet)

#### Implemented Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- Content Security Policy with strict rules
- HSTS (HTTP Strict Transport Security)

### 4. CORS Configuration

#### Strict CORS Settings
- **Origin**: Configured frontend URL only
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: Content-Type, Authorization, Accept, Accept-Language, User-Agent
- **Credentials**: Enabled for authenticated requests

### 5. Input Validation and Sanitization

#### XSS Prevention
- HTML tag removal (`<script>`, `<iframe>`, `<object>`, `<embed>`)
- Event handler removal (`onclick`, `onload`, etc.)
- JavaScript protocol removal
- Dangerous data URL filtering
- Control character removal

#### NoSQL Injection Protection
- MongoDB operator removal (`$where`, `$ne`, `$in`, etc.)
- Recursive object sanitization
- Query parameter validation

#### Field-specific Validation
- **Email**: Format validation + dangerous character removal
- **Mobile**: Saudi number format validation (+9665XXXXXXXX)
- **National ID**: 10-digit validation + character filtering
- **Names**: Letters, spaces, hyphens, apostrophes only
- **Notes**: Length limiting (1000 chars) + sanitization

### 6. Spam Detection

#### Risk Factors
- Suspicious content patterns (test, spam, admin, etc.)
- Disposable email domain detection
- Suspicious user agent detection
- Name pattern analysis (repeating chars, numbers)
- Mobile number pattern analysis
- Risk score accumulation (threshold: 50)

#### Response
- HTTP 403 with error code `SPAM_DETECTED`
- Detailed logging for security analysis

### 7. Payload Size Limits

#### Configuration
- **Default**: 10MB maximum payload size
- **Validation**: Content-Length header checking
- **Response**: HTTP 413 with error code `PAYLOAD_TOO_LARGE`

### 8. Privacy-safe Logging

#### Logged Metadata
- Hashed IP addresses (SHA-256, first 16 chars)
- User agent (truncated to 500 chars)
- Accept-Language header
- Request method and path
- Timestamp

#### Never Logged
- Raw IP addresses
- Full request payloads
- National ID numbers
- Private notes
- Personal identifiers

## Configuration

### Environment Variables

```bash
# Security Feature Toggles
HELMET_ENABLED=true
RATE_LIMIT_ENABLED=true
TURNSTILE_ENABLED=true
SPAM_DETECTION_ENABLED=true

# Rate Limiting
IP_RATE_WINDOW_MS=600000    # 10 minutes
IP_RATE_MAX=5               # 5 requests per IP
MOBILE_RATE_WINDOW_MS=86400000  # 24 hours
MOBILE_RATE_MAX=10          # 10 requests per mobile

# Payload Limits
PAYLOAD_LIMIT=10mb

# Bot Protection
TURNSTILE_SECRET_KEY=your-secret-key

# Spam Detection
SPAM_RISK_THRESHOLD=50
```

## Security Best Practices

### 1. Defense in Depth
- Multiple layers of security controls
- Fail-closed configuration
- Comprehensive input validation

### 2. Privacy by Design
- Minimal data collection
- Hashed identifiers
- No sensitive data in logs

### 3. Monitoring and Alerting
- Security violation logging
- Rate limit breach alerts
- Spam detection notifications

### 4. Regular Updates
- Dependency security updates
- Security rule reviews
- Pattern list updates

## Testing

### Security Test Coverage
- Unit tests for all security services
- Integration tests for middleware
- Mocked external service testing
- Edge case validation

### Test Categories
1. **Input Sanitization Tests**
   - XSS prevention
   - NoSQL injection protection
   - Field validation

2. **Rate Limiting Tests**
   - IP-based limiting
   - Mobile-based limiting
   - Payload size validation

3. **Bot Protection Tests**
   - Token validation
   - Network error handling
   - Configuration testing

4. **Spam Detection Tests**
   - Pattern detection
   - Risk scoring
   - Multiple violation handling

## Incident Response

### Security Violation Handling
1. **Rate Limit Exceeded**
   - Log IP hash and endpoint
   - Return HTTP 429
   - Monitor for patterns

2. **Bot Detection**
   - Log attempt details
   - Return HTTP 403
   - Consider IP blocking for repeated attempts

3. **Spam Detection**
   - Log full analysis
   - Return HTTP 403
   - Manual review may be required

4. **Input Validation Failures**
   - Log validation errors
   - Return HTTP 400
   - Monitor for attack patterns

## Compliance

### Data Protection
- No raw IP storage
- Minimal data retention
- Secure data handling

### Security Standards
- OWASP Top 10 mitigation
- Secure coding practices
- Regular security reviews

## Monitoring and Maintenance

### Regular Tasks
- Review security logs
- Update spam patterns
- Monitor rate limit effectiveness
- Update security dependencies

### Alerting
- High rate limit breach alerts
- Spam detection spikes
- Bot protection failures
- Unusual traffic patterns

## Future Enhancements

### Planned Improvements
1. **Advanced Bot Detection**
   - Behavioral analysis
   - Device fingerprinting
   - Machine learning integration

2. **Enhanced Spam Detection**
   - Real-time threat intelligence
   - Pattern learning
   - Reputation scoring

3. **Advanced Rate Limiting**
   - User-based limiting
   - Adaptive thresholds
   - Geographic limiting

4. **Security Analytics**
   - Attack pattern analysis
   - Threat intelligence integration
   - Automated incident response