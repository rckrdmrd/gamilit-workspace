# Health Endpoint Testing Guide

Quick reference for testing the `/api/health` endpoint.

## Quick Start

### Basic Health Check
```bash
curl http://localhost:3000/api/health
```

### Pretty JSON Output
```bash
curl http://localhost:3000/api/health | jq '.'
```

### Check HTTP Status Code
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/health
```

## Test Scenarios

### 1. Test Healthy System
```bash
# Should return HTTP 200
curl -i http://localhost:3000/api/health
```

Expected output:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "healthy",
  "timestamp": "2025-11-23T19:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 15,
      "message": "PostgreSQL connected"
    },
    "tables": {
      "status": "healthy",
      "responseTime": 42,
      "message": "All critical tables exist"
    }
  },
  "version": "1.0.0"
}
```

### 2. Test Response Time
```bash
# Should be < 100ms
curl -w "Response Time: %{time_total}s\n" -o /dev/null -s http://localhost:3000/api/health
```

### 3. Test Concurrent Requests
```bash
# Send 5 simultaneous requests
for i in {1..5}; do
  curl -s http://localhost:3000/api/health &
done
wait
```

### 4. Extract Specific Fields
```bash
# Get overall status
curl -s http://localhost:3000/api/health | jq -r '.status'

# Get uptime
curl -s http://localhost:3000/api/health | jq -r '.uptime'

# Get database response time
curl -s http://localhost:3000/api/health | jq -r '.checks.database.responseTime'

# Get environment
curl -s http://localhost:3000/api/health | jq -r '.environment'
```

### 5. Continuous Monitoring
```bash
# Monitor every 10 seconds
watch -n 10 'curl -s http://localhost:3000/api/health | jq ".status"'
```

## Validation Scripts

### Validate Response Structure
```bash
curl -s http://localhost:3000/api/health | jq '
  if (.status and .timestamp and .uptime and .environment and .checks and .version) then
    "✅ Response structure is valid"
  else
    "❌ Response structure is invalid"
  end
'
```

### Check All Required Fields
```bash
#!/bin/bash
# validate-health.sh

RESPONSE=$(curl -s http://localhost:3000/api/health)

# Check required top-level fields
echo "Validating response structure..."

if echo "$RESPONSE" | jq -e '.status' > /dev/null; then
  echo "✅ status field exists"
else
  echo "❌ status field missing"
fi

if echo "$RESPONSE" | jq -e '.timestamp' > /dev/null; then
  echo "✅ timestamp field exists"
else
  echo "❌ timestamp field missing"
fi

if echo "$RESPONSE" | jq -e '.uptime' > /dev/null; then
  echo "✅ uptime field exists"
else
  echo "❌ uptime field missing"
fi

if echo "$RESPONSE" | jq -e '.environment' > /dev/null; then
  echo "✅ environment field exists"
else
  echo "❌ environment field missing"
fi

if echo "$RESPONSE" | jq -e '.checks.database' > /dev/null; then
  echo "✅ database check exists"
else
  echo "❌ database check missing"
fi

if echo "$RESPONSE" | jq -e '.checks.tables' > /dev/null; then
  echo "✅ tables check exists"
else
  echo "❌ tables check missing"
fi

if echo "$RESPONSE" | jq -e '.version' > /dev/null; then
  echo "✅ version field exists"
else
  echo "❌ version field missing"
fi
```

### Performance Test
```bash
#!/bin/bash
# performance-test.sh

echo "Running performance test (10 requests)..."

TOTAL_TIME=0
COUNT=10

for i in $(seq 1 $COUNT); do
  TIME=$(curl -w "%{time_total}" -o /dev/null -s http://localhost:3000/api/health)
  TOTAL_TIME=$(echo "$TOTAL_TIME + $TIME" | bc)
  echo "Request $i: ${TIME}s"
done

AVG_TIME=$(echo "scale=3; $TOTAL_TIME / $COUNT" | bc)
echo ""
echo "Average response time: ${AVG_TIME}s"

if (( $(echo "$AVG_TIME < 0.1" | bc -l) )); then
  echo "✅ Performance target met (< 100ms)"
else
  echo "⚠️  Performance target not met (>= 100ms)"
fi
```

## Integration Examples

### Shell Script Monitoring
```bash
#!/bin/bash
# monitor-health.sh

while true; do
  STATUS=$(curl -s http://localhost:3000/api/health | jq -r '.status')
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

  if [ "$STATUS" = "healthy" ]; then
    echo "[$TIMESTAMP] ✅ System is healthy"
  elif [ "$STATUS" = "degraded" ]; then
    echo "[$TIMESTAMP] ⚠️  System is degraded"
    curl -s http://localhost:3000/api/health | jq '.checks'
  else
    echo "[$TIMESTAMP] ❌ System is unhealthy"
    curl -s http://localhost:3000/api/health | jq '.checks'
  fi

  sleep 30
done
```

### Python Integration
```python
#!/usr/bin/env python3
# health_check.py

import requests
import sys
from datetime import datetime

def check_health(url='http://localhost:3000/api/health'):
    """Check application health and print status."""
    try:
        response = requests.get(url, timeout=5)
        data = response.json()

        print(f"Timestamp: {datetime.now().isoformat()}")
        print(f"Status: {data['status']}")
        print(f"Uptime: {data['uptime']}s")
        print(f"Environment: {data['environment']}")
        print(f"Version: {data['version']}")
        print("\nChecks:")
        for check_name, check_data in data['checks'].items():
            status_icon = "✅" if check_data['status'] == 'healthy' else "❌"
            print(f"  {status_icon} {check_name}: {check_data['message']} ({check_data['responseTime']}ms)")

        if data['status'] != 'healthy':
            sys.exit(1)

    except requests.RequestException as e:
        print(f"❌ Error checking health: {e}")
        sys.exit(1)

if __name__ == '__main__':
    check_health()
```

### Node.js Integration
```javascript
// health-check.js
const axios = require('axios');

async function checkHealth() {
  try {
    const response = await axios.get('http://localhost:3000/api/health');
    const { data } = response;

    console.log(`Status: ${data.status}`);
    console.log(`Uptime: ${data.uptime}s`);
    console.log(`Environment: ${data.environment}`);

    Object.entries(data.checks).forEach(([name, check]) => {
      const icon = check.status === 'healthy' ? '✅' : '❌';
      console.log(`${icon} ${name}: ${check.message} (${check.responseTime}ms)`);
    });

    process.exit(data.status === 'healthy' ? 0 : 1);
  } catch (error) {
    console.error('Error checking health:', error.message);
    process.exit(1);
  }
}

checkHealth();
```

## Load Balancer Configuration

### NGINX
```nginx
upstream backend {
    server backend1:3000;
    server backend2:3000;
    server backend3:3000;

    # Health check
    health_check interval=10s fails=3 passes=2 uri=/api/health match=health_ok;
}

match health_ok {
    status 200;
    header Content-Type = "application/json";
    body ~ "\"status\":\"healthy\"";
}
```

### HAProxy
```haproxy
backend backend_servers
    balance roundrobin
    option httpchk GET /api/health
    http-check expect status 200
    http-check expect string "healthy"
    server backend1 backend1:3000 check inter 10s fall 3 rise 2
    server backend2 backend2:3000 check inter 10s fall 3 rise 2
```

### Traefik
```yaml
http:
  services:
    backend:
      loadBalancer:
        healthCheck:
          path: /api/health
          interval: 10s
          timeout: 5s
          scheme: http
        servers:
          - url: http://backend1:3000
          - url: http://backend2:3000
```

## Troubleshooting

### Debug Connection Issues
```bash
# Test connectivity
curl -v http://localhost:3000/api/health

# Test DNS resolution
nslookup localhost

# Test port availability
nc -zv localhost 3000

# Check if service is running
curl http://localhost:3000/api/health || echo "Service is down"
```

### Analyze Response
```bash
# Full response with headers
curl -i http://localhost:3000/api/health

# Response time breakdown
curl -w "@-" -o /dev/null -s http://localhost:3000/api/health <<'EOF'
    time_namelookup:  %{time_namelookup}s\n
       time_connect:  %{time_connect}s\n
    time_appconnect:  %{time_appconnect}s\n
   time_pretransfer:  %{time_pretransfer}s\n
      time_redirect:  %{time_redirect}s\n
 time_starttransfer:  %{time_starttransfer}s\n
                    ----------\n
         time_total:  %{time_total}s\n
EOF
```

### Test Error Scenarios
```bash
# Simulate slow network
curl --limit-rate 1k http://localhost:3000/api/health

# Test timeout handling
curl --max-time 1 http://localhost:3000/api/health

# Test with different hosts
curl http://127.0.0.1:3000/api/health
curl http://localhost:3000/api/health
```

## Expected Values

- **Status:** `healthy`, `degraded`, or `unhealthy`
- **HTTP Code:** `200` (healthy) or `503` (degraded/unhealthy)
- **Response Time:** < 100ms average
- **Uptime:** Positive integer (seconds)
- **Environment:** `development`, `staging`, or `production`
- **Version:** Semantic version string (e.g., `1.0.0`)
