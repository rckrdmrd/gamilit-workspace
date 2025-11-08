# SECURITY TESTING STRATEGY

**Proyecto:** Gamilit Platform
**Módulo:** Testing Strategy - Security Testing
**Fecha:** 01 de Noviembre, 2025
**Versión:** 1.0
**Estado:** Documento Técnico
**RFC:** RFC-0001 (Modularización de Documentación)

---

## Tabla de Contenidos

1. [Overview](#overview)
2. [Security Test Coverage](#security-test-coverage)
3. [SAST (Static Application Security Testing)](#sast-static-application-security-testing)
4. [Dependency Scanning](#dependency-scanning)
5. [DAST (Dynamic Application Security Testing)](#dast-dynamic-application-security-testing)
6. [Security Testing Checklist](#security-testing-checklist)

---

## 1. Overview

### 1.1 Definición

Security Testing identifica **vulnerabilidades, amenazas y riesgos** en la aplicación para garantizar la protección de datos y cumplimiento de estándares de seguridad.

### 1.2 Tipos de Security Testing

| Tipo | Descripción | Herramienta |
|------|-------------|-------------|
| **SAST** | Análisis estático del código fuente | SonarQube |
| **DAST** | Análisis dinámico de la aplicación en ejecución | OWASP ZAP |
| **Dependency Scan** | Vulnerabilidades en dependencias | npm audit, Snyk |
| **Penetration Testing** | Simulación de ataques reales | Manual + OWASP ZAP |
| **Security Unit Tests** | Tests específicos de seguridad | Jest/Vitest |

---

## 2. Security Test Coverage

### 2.1 Estado Actual

**✅ Implemented Security Tests:**

1. **SQL Injection Protection** (`rls.middleware.security.test.ts`)
   - ✅ Parameterized queries validation
   - ✅ Malicious input testing
   - ✅ Special characters handling
   - ✅ Multi-statement injection prevention

2. **IDOR Protection** (`idor-protection.test.ts`)
   - ✅ User data isolation
   - ✅ Role-based access control
   - ✅ Cross-user enumeration prevention
   - ✅ Bulk attack scenarios

3. **Token Security** (`security-token-hashing.test.ts`)
   - ✅ Token hashing validation
   - ✅ Token comparison security

4. **Ownership Validation** (`ownership.middleware.test.ts`)
   - ✅ Resource ownership checks

### 2.2 Coverage Percentage

```
Security Test Coverage:
✅ SQL Injection: 100%
✅ IDOR: 100%
✅ Token Hashing: 100%
❌ XSS: 0%
❌ CSRF: 0%
❌ Authentication: 30%
❌ Authorization: 40%
❌ Input Validation: 50%
```

---

## 3. SAST (Static Application Security Testing)

### 3.1 SonarQube Configuration

**sonar-project.properties:**

```properties
sonar.projectKey=gamilit-platform
sonar.projectName=Gamilit Platform
sonar.sources=src
sonar.tests=src/__tests__,tests
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx
sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**

# Language
sonar.language=ts

# Coverage
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.typescript.lcov.reportPaths=coverage/lcov.info

# Security
sonar.security.hotspots.enabled=true
sonar.security.vulnerabilities.enabled=true

# Quality Gates
sonar.qualitygate.wait=true
sonar.qualitygate.timeout=300
```

### 3.2 Security Rules to Enable

**Critical Security Rules:**

- ✅ SQL Injection detection
- ✅ XSS vulnerability detection
- ✅ Hardcoded credentials detection
- ✅ Weak cryptography detection
- ✅ Path traversal detection
- ✅ Command injection detection
- ✅ Insecure random number generation
- ✅ Insufficient input validation
- ✅ Insecure HTTP methods
- ✅ Missing authentication checks

### 3.3 Run SonarQube

```bash
# Using SonarScanner
sonar-scanner

# Using Docker
docker run -d -p 9000:9000 sonarqube:latest

# In CI/CD
sonar-scanner \
  -Dsonar.projectKey=gamilit-platform \
  -Dsonar.sources=src \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=$SONAR_TOKEN
```

---

## 4. Dependency Scanning

### 4.1 npm audit

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Fix including breaking changes
npm audit fix --force

# Get detailed report
npm audit --json > audit-report.json

# Set audit level
npm audit --audit-level=moderate
npm audit --audit-level=high
npm audit --audit-level=critical
```

### 4.2 Snyk

**Installation:**

```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Test for vulnerabilities
snyk test

# Monitor project
snyk monitor

# Interactive fix wizard
snyk wizard
```

**snyk.json Configuration:**

```json
{
  "language-settings": {
    "javascript": {
      "ignoreUnfixable": false
    }
  },
  "severity-threshold": "high",
  "ignore": {
    "SNYK-JS-AXIOS-1234567": {
      "reason": "No fix available, risk accepted",
      "expires": "2025-12-31"
    }
  }
}
```

### 4.3 Automated Scanning

```bash
# Daily scan
0 2 * * * cd /path/to/project && npm audit --audit-level=high

# Weekly Snyk scan
0 3 * * 1 cd /path/to/project && snyk test --severity-threshold=medium
```

### 4.4 CI/CD Integration

```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run npm audit
        run: npm audit --audit-level=high

      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: SonarQube Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

---

## 5. DAST (Dynamic Application Security Testing)

### 5.1 OWASP ZAP

**Baseline Scan:**

```bash
# Docker-based scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://staging.gamilit.com \
  -r zap-report.html \
  -J zap-report.json

# Full scan (longer, more thorough)
docker run -t owasp/zap2docker-stable zap-full-scan.py \
  -t http://staging.gamilit.com \
  -r zap-full-report.html

# API scan
docker run -t owasp/zap2docker-stable zap-api-scan.py \
  -t http://staging.gamilit.com/api \
  -f openapi \
  -r zap-api-report.html
```

**Weekly Automated Scan:**

```bash
# Cron job
0 1 * * 1 docker run -t owasp/zap2docker-stable zap-baseline.py -t http://staging.gamilit.com
```

### 5.2 Burp Suite

**Manual Testing:**

1. Configure browser proxy → Burp Suite
2. Browse application normally
3. Review intercepted requests
4. Test for:
   - SQL Injection
   - XSS
   - CSRF
   - Authentication bypass
   - Authorization flaws

---

## 6. Security Testing Checklist

### 6.1 Authentication & Authorization

**Authentication:**
- [ ] Test password strength requirements
- [ ] Test account lockout after failed attempts
- [ ] Test session timeout
- [ ] Test JWT token expiration
- [ ] Test refresh token rotation
- [ ] Test password reset flow security
- [ ] Test email verification bypass attempts
- [x] Test IDOR vulnerabilities (implemented)
- [ ] Test privilege escalation attempts
- [ ] Test RBAC enforcement

**Example Test:**

```typescript
describe('Authentication Security', () => {
  it('should lock account after 5 failed login attempts', async () => {
    const email = 'test@test.com';

    // Attempt 5 failed logins
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'wrongpassword' })
        .expect(401);
    }

    // 6th attempt should be blocked
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'correctpassword' })
      .expect(429);

    expect(response.body.error.code).toBe('ACCOUNT_LOCKED');
  });

  it('should expire JWT token after configured time', async () => {
    const token = createToken({ expiresIn: '1s' });

    // Wait for token to expire
    await sleep(2000);

    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);

    expect(response.body.error.code).toBe('TOKEN_EXPIRED');
  });
});
```

### 6.2 Input Validation

- [x] Test SQL injection (implemented)
- [ ] Test XSS (reflected, stored, DOM-based)
- [ ] Test CSRF protection
- [ ] Test file upload validation
- [ ] Test command injection
- [ ] Test LDAP injection
- [ ] Test XML injection
- [ ] Test path traversal

**Example: XSS Test**

```typescript
describe('XSS Protection', () => {
  it('should sanitize malicious script tags in user input', async () => {
    const maliciousInput = '<script>alert("XSS")</script>';

    const response = await request(app)
      .post('/api/educational/exercises')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: maliciousInput,
        type: 'crucigrama',
      })
      .expect(201);

    // Should be sanitized
    expect(response.body.data.title).not.toContain('<script>');
    expect(response.body.data.title).toContain('&lt;script&gt;');
  });

  it('should prevent stored XSS in comments', async () => {
    await request(app)
      .post('/api/social/comments')
      .send({
        exerciseId: 'exercise-123',
        comment: '<img src=x onerror=alert("XSS")>',
      })
      .expect(201);

    // Retrieve comment
    const response = await request(app)
      .get('/api/social/comments/exercise-123')
      .expect(200);

    expect(response.body.data.comments[0].comment).not.toContain('onerror=');
  });
});
```

### 6.3 Data Protection

- [x] Test token hashing (implemented)
- [ ] Test password hashing (bcrypt)
- [ ] Test sensitive data exposure in logs
- [ ] Test sensitive data in URLs
- [ ] Test database encryption at rest
- [ ] Test TLS/SSL configuration
- [ ] Test secure cookies (httpOnly, secure, sameSite)

**Example: Password Hashing**

```typescript
describe('Password Security', () => {
  it('should hash passwords with bcrypt', async () => {
    const password = 'SecurePassword123!';

    const user = await createUser({ password });

    // Password should be hashed
    expect(user.password).not.toBe(password);
    expect(user.password.startsWith('$2b$')).toBe(true); // bcrypt prefix

    // Should verify correctly
    const isValid = await bcrypt.compare(password, user.password);
    expect(isValid).toBe(true);
  });

  it('should use sufficient bcrypt rounds', async () => {
    const user = await createUser({ password: 'Test1234!' });

    // Extract rounds from hash
    const rounds = parseInt(user.password.split('$')[2]);

    // Should use at least 10 rounds
    expect(rounds).toBeGreaterThanOrEqual(10);
  });
});
```

### 6.4 API Security

- [ ] Test rate limiting
- [ ] Test API authentication
- [ ] Test API authorization
- [ ] Test excessive data exposure
- [ ] Test mass assignment
- [ ] Test security misconfiguration
- [ ] Test CORS configuration
- [ ] Test HTTP headers (CSP, X-Frame-Options, etc.)

**Example: Rate Limiting**

```typescript
describe('API Rate Limiting', () => {
  it('should rate limit after 100 requests per minute', async () => {
    // Make 100 successful requests
    for (let i = 0; i < 100; i++) {
      await request(app)
        .get('/api/educational/exercises')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
    }

    // 101st request should be rate limited
    const response = await request(app)
      .get('/api/educational/exercises')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(429);

    expect(response.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(response.headers).toHaveProperty('retry-after');
  });
});
```

### 6.5 OWASP Top 10 Coverage

| OWASP Risk | Test Coverage | Status |
|------------|---------------|--------|
| A01: Broken Access Control | IDOR, ownership checks | ✅ 80% |
| A02: Cryptographic Failures | Token hashing, TLS | ✅ 60% |
| A03: Injection | SQL injection | ✅ 100% |
| A04: Insecure Design | Security reviews | ❌ 0% |
| A05: Security Misconfiguration | Header checks | ❌ 20% |
| A06: Vulnerable Components | npm audit, Snyk | ✅ 90% |
| A07: Auth Failures | Session, JWT tests | ⚠️ 40% |
| A08: Data Integrity Failures | Input validation | ⚠️ 50% |
| A09: Logging Failures | Monitoring tests | ❌ 10% |
| A10: SSRF | Network tests | ❌ 0% |

---

## 7. Security Test Data

### 7.1 Malicious Inputs

```typescript
// src/__tests__/fixtures/malicious-inputs.ts

export const MALICIOUS_INPUTS = {
  sql_injection: [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "admin'--",
    "1'; UPDATE users SET role='admin' WHERE id='1'--",
  ],
  xss: [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<iframe src="javascript:alert(\'XSS\')">',
    '"><script>alert(String.fromCharCode(88,83,83))</script>',
  ],
  path_traversal: [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '....//....//....//etc/passwd',
  ],
  command_injection: [
    '; ls -la',
    '| cat /etc/passwd',
    '& ping -c 10 127.0.0.1 &',
  ],
};

// Usage in tests
MALICIOUS_INPUTS.sql_injection.forEach((input) => {
  it(`should reject SQL injection: ${input}`, async () => {
    // Test against endpoint
  });
});
```

---

## Referencias

- [Testing Strategy - Overview](./README.md)
- [Unit Testing](./unit-testing.md)
- [Integration Testing](./integration-testing.md)
- [Test Infrastructure](./test-infrastructure.md)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Documento creado:** 01 de Noviembre, 2025
**Próxima revisión:** Mensual (o después de cada release)
**Owner:** Security Team + QA Team
