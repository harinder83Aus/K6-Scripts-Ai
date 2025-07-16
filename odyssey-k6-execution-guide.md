# Odyssey API K6 Load Testing - Execution Guide

## Prerequisites and Setup

### 1. Install K6

**macOS:**
```bash
brew install k6
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows:**
```bash
choco install k6
```

**Docker:**
```bash
docker pull grafana/k6
```

### 2. Verify Installation
```bash
k6 version
```

### 3. Setup Environment Variables
```bash
# Required: Your Odyssey API Bearer Token
export AUTH_TOKEN="Bearer YOUR_ODYSSEY_API_TOKEN_HERE"

# Optional: Test configuration
export TEST_SCENARIO="smoke"
export TEST_CASE="0"
export ENVIRONMENT="test"
```

## Quick Start Commands

### Basic Test Execution
```bash
# Run with default settings (smoke test)
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" odyssey-k6-test.js

# Run with specific scenario
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_SCENARIO=load odyssey-k6-test.js

# Run single API test
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_CASE=1 odyssey-k6-test.js
```

## Test Scenarios

### 1. Smoke Test (Development/CI)
**Purpose**: Quick validation of all API categories
**Duration**: 2 minutes
**Virtual Users**: 5

```bash
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_SCENARIO=smoke odyssey-k6-test.js
```

**Expected Results**:
- Tests 7 key API endpoints (one from each category)
- All APIs should respond within 3 seconds
- Error rate should be < 5%
- Success rate should be > 95%

### 2. Load Test (Staging/Production)
**Purpose**: Simulate normal production load
**Duration**: 18 minutes
**Virtual Users**: 0-20 (ramping)

```bash
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_SCENARIO=load odyssey-k6-test.js
```

**Load Pattern**:
- 0-5 users (2 minutes)
- 5-10 users (5 minutes)
- 10-15 users (2 minutes)
- 15 users sustained (5 minutes)
- 15-5 users (2 minutes)
- 5-0 users (2 minutes)

### 3. Stress Test (Capacity Planning)
**Purpose**: Find system breaking points
**Duration**: 25 minutes
**Virtual Users**: 0-40 (ramping)

```bash
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_SCENARIO=stress odyssey-k6-test.js
```

**Load Pattern**:
- Gradual ramp-up to 40 users
- Sustained high load periods
- Controlled ramp-down
- Tests system limits and recovery

### 4. Spike Test (Resilience Testing)
**Purpose**: Test response to sudden load increases
**Duration**: 4 minutes
**Virtual Users**: 5-50 (spikes)

```bash
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_SCENARIO=spike odyssey-k6-test.js
```

**Load Pattern**:
- Normal load (5 users)
- Sudden spike to 50 users
- Back to normal
- Another spike
- Ramp down

### 5. Endurance Test (Stability Testing)
**Purpose**: Test system stability over time
**Duration**: 30 minutes
**Virtual Users**: 15 (constant)

```bash
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_SCENARIO=endurance odyssey-k6-test.js
```

## API-Specific Testing

### Message Sending APIs (Cases 1-21)
```bash
# Test all messaging APIs
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_SCENARIO=messaging_apis odyssey-k6-test.js

# Test specific message type
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_CASE=1 odyssey-k6-test.js  # SMS Basic
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_CASE=8 odyssey-k6-test.js  # Email Basic
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_CASE=13 odyssey-k6-test.js # Fax Basic
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_CASE=17 odyssey-k6-test.js # Voice Basic
```

### Reporting APIs (Cases 22-34)
```bash
# Test all reporting APIs
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_SCENARIO=reporting_apis odyssey-k6-test.js

# Test specific reporting functions
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_CASE=22 odyssey-k6-test.js # Get Report Files
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_CASE=25 odyssey-k6-test.js # Get Job Summaries
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_CASE=31 odyssey-k6-test.js # Get Job Items
```

### Reception APIs (Cases 35-43)
```bash
# Test inbound message handling
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_CASE=35 odyssey-k6-test.js # Inbound SMS
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_CASE=39 odyssey-k6-test.js # Inbound Fax
```

### File Management APIs (Cases 44-51)
```bash
# Test file management
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_SCENARIO=file_management odyssey-k6-test.js

# Test specific file operations
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_CASE=44 odyssey-k6-test.js # Get Hosted List Files
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_CASE=48 odyssey-k6-test.js # Get Hosted Document Files
```

## Advanced Configuration

### Custom Virtual Users and Duration
```bash
# Custom smoke test
k6 run --vus 10 --duration 5m --env AUTH_TOKEN="Bearer YOUR_TOKEN" odyssey-k6-test.js

# Custom load test with stages
k6 run --stage 2m:10,5m:20,2m:0 --env AUTH_TOKEN="Bearer YOUR_TOKEN" odyssey-k6-test.js

# High load test
k6 run --vus 50 --duration 10m --env AUTH_TOKEN="Bearer YOUR_TOKEN" odyssey-k6-test.js
```

### Output and Reporting
```bash
# Generate JSON output
k6 run --out json=results.json --env AUTH_TOKEN="Bearer YOUR_TOKEN" odyssey-k6-test.js

# Generate InfluxDB output
k6 run --out influxdb=http://localhost:8086/k6 --env AUTH_TOKEN="Bearer YOUR_TOKEN" odyssey-k6-test.js

# Generate CSV output
k6 run --out csv=results.csv --env AUTH_TOKEN="Bearer YOUR_TOKEN" odyssey-k6-test.js

# Quiet mode (less verbose)
k6 run --quiet --env AUTH_TOKEN="Bearer YOUR_TOKEN" odyssey-k6-test.js
```

### Docker Execution
```bash
# Run in Docker
docker run --rm -i grafana/k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" - < odyssey-k6-test.js

# Run with volume mount
docker run --rm -v $(pwd):/scripts grafana/k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" /scripts/odyssey-k6-test.js
```

## Test Data Configuration

### Update Test Data
Edit `odyssey-k6-config.js` to customize:

```javascript
testData: {
  phoneNumbers: [
    '00337123456',  // Add your test phone numbers
    '00336123456',
    // ... more numbers
  ],
  emailAddresses: [
    'test@yourdomain.com',  // Add your test email addresses
    'user@yourdomain.com',
    // ... more emails
  ],
  faxNumbers: [
    '00334123456',  // Add your test fax numbers
    // ... more fax numbers
  ]
}
```

### Authentication Token
```javascript
// Option 1: Environment variable (recommended)
export AUTH_TOKEN="Bearer YOUR_ACTUAL_TOKEN"

// Option 2: Direct in config file (not recommended for production)
authToken: 'Bearer YOUR_ACTUAL_TOKEN'
```

## Monitoring During Test Execution

### Key Metrics to Watch

**Console Output**:
```
✓ SMS Basic - Status 200
✓ SMS Basic - Response time < 5s
✓ SMS Basic - JobNumber present

checks.........................: 100.00% ✓ 150      ✗ 0
data_received..................: 1.2 MB  40 kB/s
data_sent......................: 89 kB   3.0 kB/s
http_req_blocked...............: avg=1.2ms    min=0s       med=0s       max=15ms     p(90)=0s       p(95)=0s
http_req_connecting............: avg=524.4µs  min=0s       med=0s       max=7ms      p(90)=0s       p(95)=0s
http_req_duration..............: avg=2.1s     min=1.1s     med=1.9s     max=4.2s     p(90)=3.1s     p(95)=3.7s
http_req_failed................: 0.00%   ✓ 0        ✗ 150
http_req_receiving.............: avg=1.2ms    min=0s       med=1ms      max=15ms     p(90)=2ms      p(95)=3ms
http_req_sending...............: avg=124.5µs  min=0s       med=0s       max=2ms      p(90)=0s       p(95)=1ms
http_req_tls_handshaking.......: avg=566.8µs  min=0s       med=0s       max=8ms      p(90)=0s       p(95)=0s
http_req_waiting...............: avg=2.1s     min=1.1s     med=1.9s     max=4.2s     p(90)=3.1s     p(95)=3.7s
http_reqs......................: 150     5.0/s
iteration_duration.............: avg=3.1s     min=2.1s     med=2.9s     max=5.2s     p(90)=4.1s     p(95)=4.7s
iterations.....................: 150     5.0/s
vus............................: 5       min=5      max=5
vus_max........................: 5       min=5      max=5
```

**Success Indicators**:
- ✓ All checks passing
- `http_req_failed: 0.00%` (or very low percentage)
- Response times within thresholds
- No timeout errors

**Warning Signs**:
- ✗ Failed checks
- High `http_req_failed` percentage
- Response times above thresholds
- Connection timeouts

### Performance Thresholds

**Default Thresholds**:
- Response time: 95% < 5s, 99% < 10s
- Error rate: < 10%
- Success rate: > 95%

**API-Specific Thresholds**:
- SMS: 95% < 3s
- Email: 95% < 4s
- Fax: 95% < 8s
- Voice: 95% < 4s
- Reporting: 95% < 2s

## Troubleshooting

### Common Issues and Solutions

#### 1. Authentication Errors
**Error**: `401 Unauthorized`
**Solution**:
```bash
# Check token format
echo $AUTH_TOKEN
# Should start with "Bearer "

# Test token manually
curl -H "Authorization: $AUTH_TOKEN" https://api.odyssey-services.fr/api/V1/JobSummaries?pageSize=1
```

#### 2. Connection Timeouts
**Error**: `ECONNREFUSED` or timeout errors
**Solution**:
```bash
# Increase timeout
k6 run --http-timeout 60s --env AUTH_TOKEN="Bearer YOUR_TOKEN" odyssey-k6-test.js

# Reduce concurrent users
k6 run --vus 5 --env AUTH_TOKEN="Bearer YOUR_TOKEN" odyssey-k6-test.js

# Check network connectivity
ping api.odyssey-services.fr
```

#### 3. Rate Limiting
**Error**: `429 Too Many Requests`
**Solution**:
```bash
# Reduce load
k6 run --vus 5 --duration 2m --env AUTH_TOKEN="Bearer YOUR_TOKEN" odyssey-k6-test.js

# Add delays (edit script to increase sleep time)
# In the script, modify: sleep(Math.random() * 5 + 2); // 2-7 seconds
```

#### 4. Invalid Test Data
**Error**: `400 Bad Request` with validation errors
**Solution**:
- Update phone numbers in `odyssey-k6-config.js`
- Ensure email addresses are valid
- Check date formats match API requirements

#### 5. Memory Issues
**Error**: JavaScript heap out of memory
**Solution**:
```bash
# Use compatibility mode
k6 run --compatibility-mode=base --env AUTH_TOKEN="Bearer YOUR_TOKEN" odyssey-k6-test.js

# Reduce test duration
k6 run --duration 5m --env AUTH_TOKEN="Bearer YOUR_TOKEN" odyssey-k6-test.js
```

## CI/CD Integration

### GitHub Actions
Create `.github/workflows/k6-test.yml`:
```yaml
name: K6 Load Test
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  k6-load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run K6 smoke test
        uses: grafana/k6-action@v0.3.0
        with:
          filename: odyssey-k6-test.js
        env:
          AUTH_TOKEN: ${{ secrets.ODYSSEY_API_TOKEN }}
          TEST_SCENARIO: smoke
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: k6-results
          path: odyssey-api-test-report.html
```

### Jenkins Pipeline
Create `Jenkinsfile`:
```groovy
pipeline {
    agent any
    
    environment {
        AUTH_TOKEN = credentials('odyssey-api-token')
    }
    
    stages {
        stage('Smoke Test') {
            steps {
                sh '''
                    k6 run --env AUTH_TOKEN="$AUTH_TOKEN" \
                           --env TEST_SCENARIO=smoke \
                           --out json=smoke-results.json \
                           odyssey-k6-test.js
                '''
            }
        }
        
        stage('Load Test') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    k6 run --env AUTH_TOKEN="$AUTH_TOKEN" \
                           --env TEST_SCENARIO=load \
                           --out json=load-results.json \
                           odyssey-k6-test.js
                '''
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: '*.json,*.html', fingerprint: true
        }
    }
}
```

### GitLab CI
Create `.gitlab-ci.yml`:
```yaml
stages:
  - test

k6-smoke-test:
  stage: test
  image: grafana/k6:latest
  script:
    - k6 run --env AUTH_TOKEN="$ODYSSEY_API_TOKEN" 
             --env TEST_SCENARIO=smoke 
             odyssey-k6-test.js
  artifacts:
    reports:
      junit: odyssey-api-test-report.html
    paths:
      - odyssey-api-test-report.html
    expire_in: 1 week
  only:
    - merge_requests
    - main

k6-load-test:
  stage: test
  image: grafana/k6:latest
  script:
    - k6 run --env AUTH_TOKEN="$ODYSSEY_API_TOKEN"
             --env TEST_SCENARIO=load
             odyssey-k6-test.js
  artifacts:
    paths:
      - odyssey-api-test-report.html
    expire_in: 1 week
  only:
    - schedules
```

## Best Practices

### Test Planning
1. **Start Small**: Begin with smoke tests before running full load tests
2. **Coordinate**: Notify team members before running load tests
3. **Environment**: Use dedicated test environments when possible
4. **Data**: Use realistic but safe test data
5. **Timing**: Run tests during off-peak hours

### During Testing
1. **Monitor**: Watch both K6 output and server metrics
2. **Be Ready**: Have procedures to stop tests if issues arise
3. **Document**: Record any issues or interesting findings
4. **Communicate**: Keep stakeholders informed of test progress

### After Testing
1. **Analyze**: Review all metrics and identify bottlenecks
2. **Report**: Generate comprehensive test reports
3. **Share**: Communicate findings to relevant teams
4. **Archive**: Store test results for future reference
5. **Action**: Create tickets for any issues found

### Performance Optimization
1. **Gradual Increase**: Gradually increase load to find limits
2. **Baseline**: Establish performance baselines
3. **Regression**: Run tests regularly to catch performance regressions
4. **Correlation**: Correlate K6 results with server metrics

This execution guide provides everything needed to run comprehensive load tests against the Odyssey REST API using K6.