# Odyssey REST API K6 Load Testing Suite

A comprehensive K6 load testing suite for the Odyssey REST API, supporting all 51 endpoints from the original Postman collection.

## Features

### Complete API Coverage
- **SMS APIs (7 endpoints)**: Basic, Advanced, File List, Personalized, Fully Personalized, Scheduled, Tracking URL
- **Email APIs (5 endpoints)**: Basic, Advanced, File List, Personalized, Scheduled  
- **Fax APIs (4 endpoints)**: Basic, Advanced, File List, Scheduled
- **Voice APIs (5 endpoints)**: Basic, Advanced, File List, Personalized, Scheduled
- **Reporting APIs (13 endpoints)**: Report files, Job summaries, Job items with various filters
- **Reception APIs (8 endpoints)**: Inbound SMS and Fax handling
- **File Management APIs (8 endpoints)**: Hosted list and document file operations

### Advanced K6 Features
- **Multiple Test Scenarios**: Smoke, Load, Stress, Spike, Endurance, Volume testing
- **Smart Data Management**: Randomized test data pools with validation
- **Custom Metrics**: API success rates, response times, error tracking
- **Flexible Configuration**: Environment-based settings and parameterization
- **Comprehensive Reporting**: HTML reports with detailed metrics
- **Correlation Support**: JobNumber extraction and reuse across requests

## File Structure

```
odyssey-k6-test.js          # Main test script with all API functions
odyssey-k6-config.js        # Configuration and test data management
odyssey-k6-scenarios.js     # Test scenarios and performance profiles
odyssey-k6-README.md        # This documentation file
odyssey-k6-execution-guide.md # Detailed execution instructions
```

## Quick Start

### 1. Prerequisites
```bash
# Install K6
# macOS
brew install k6

# Linux (Debian/Ubuntu)
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

### 2. Basic Usage
```bash
# Run smoke test (5 users, 2 minutes)
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" odyssey-k6-test.js

# Run specific test scenario
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_SCENARIO=load odyssey-k6-test.js

# Run single API test
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_CASE=1 odyssey-k6-test.js
```

### 3. Environment Variables
```bash
# Required
export AUTH_TOKEN="Bearer YOUR_ODYSSEY_API_TOKEN"

# Optional
export TEST_SCENARIO="smoke"     # smoke, load, stress, spike, endurance
export TEST_CASE="1"             # 1-51 for specific endpoint, 0 for random
export ENVIRONMENT="test"        # test, staging, production
```

## Test Scenarios

### Smoke Test (Quick Validation)
```bash
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_SCENARIO=smoke odyssey-k6-test.js
```
- **Duration**: 2 minutes
- **Virtual Users**: 5
- **Purpose**: Quick validation of all API categories
- **Test Cases**: 1,8,13,17,22,35,44 (one from each category)

### Load Test (Normal Operations)
```bash
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_SCENARIO=load odyssey-k6-test.js
```
- **Duration**: 18 minutes
- **Virtual Users**: 0-20 (ramping)
- **Purpose**: Simulate normal production load
- **Test Cases**: All 51 endpoints

### Stress Test (High Load)
```bash
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_SCENARIO=stress odyssey-k6-test.js
```
- **Duration**: 25 minutes
- **Virtual Users**: 0-40 (ramping)
- **Purpose**: Find system breaking points
- **Test Cases**: All 51 endpoints

### Spike Test (Sudden Load)
```bash
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_SCENARIO=spike odyssey-k6-test.js
```
- **Duration**: 4 minutes
- **Virtual Users**: 5-50 (spikes)
- **Purpose**: Test response to sudden load increases
- **Test Cases**: Critical APIs (1,2,3,8,9,10)

### Endurance Test (Long-term Stability)
```bash
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_SCENARIO=endurance odyssey-k6-test.js
```
- **Duration**: 30 minutes
- **Virtual Users**: 15 (constant)
- **Purpose**: Test system stability over time
- **Test Cases**: All 51 endpoints

## API Test Cases

### Message Sending APIs (Cases 1-21)
```bash
# SMS APIs
1  - Send SMS Basic
2  - Send SMS Advanced  
3  - Send SMS File List
4  - Send SMS Personalized
5  - Send SMS Fully Personalized
6  - Send SMS Scheduled
7  - Send SMS Tracking URL

# Email APIs
8  - Send Email Basic
9  - Send Email Advanced
10 - Send Email File List
11 - Send Email Personalized
12 - Send Email Scheduled

# Fax APIs
13 - Send Fax Basic
14 - Send Fax Advanced
15 - Send Fax File List
16 - Send Fax Scheduled

# Voice APIs
17 - Send Voice Basic
18 - Send Voice Advanced
19 - Send Voice File List
20 - Send Voice Personalized
21 - Send Voice Scheduled
```

### Reporting APIs (Cases 22-34)
```bash
# Report Management
22 - Get Report Files
23 - Get Report File By Job
24 - Delete Report File

# Job Summaries
25 - Get Job Summaries
26 - Get Job Summary By ID
27 - Get Job Summaries Paged
28 - Get Job Summaries Filtered
29 - Get Job Summaries By Media
30 - Get Job Summaries By Date

# Job Items
31 - Get Job Items
32 - Get Job Items Paged
33 - Get Job Items Filtered
34 - Get Job Items By Date
```

### Reception APIs (Cases 35-43)
```bash
# Inbound SMS
35 - Get Inbound SMS
36 - Get Inbound SMS Paged
37 - Get Inbound SMS By Sender
38 - Get Inbound SMS By Date

# Inbound Fax
39 - Get Inbound Fax
40 - Get Inbound Fax Paged
41 - Get Inbound Fax By Date
42 - Get Inbound Fax File
43 - Delete Inbound Fax File
```

### File Management APIs (Cases 44-51)
```bash
# Hosted List Files
44 - Get Hosted List Files
45 - Get Hosted List File
46 - Add Hosted List File
47 - Delete Hosted List File

# Hosted Document Files
48 - Get Hosted Document Files
49 - Get Hosted Document File
50 - Add Hosted Document File
51 - Delete Hosted Document File
```

## Performance Thresholds

### Default Thresholds
- **Response Time**: 95% < 5s, 99% < 10s
- **Error Rate**: < 10%
- **Success Rate**: > 95%
- **Check Pass Rate**: > 90%

### API-Specific Thresholds
- **SMS APIs**: 95% < 3s, Error rate < 5%
- **Email APIs**: 95% < 4s, Error rate < 5%
- **Fax APIs**: 95% < 8s, Error rate < 10%
- **Voice APIs**: 95% < 4s, Error rate < 5%
- **Reporting APIs**: 95% < 2s, Error rate < 5%

## Custom Test Execution

### Test Specific API Categories
```bash
# Test only messaging APIs
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_SCENARIO=messaging_apis odyssey-k6-test.js

# Test only reporting APIs  
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_SCENARIO=reporting_apis odyssey-k6-test.js

# Test file management
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_SCENARIO=file_management odyssey-k6-test.js
```

### Test Single API Endpoint
```bash
# Test SMS Basic (case 1)
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_CASE=1 odyssey-k6-test.js

# Test Email Advanced (case 9)
k6 run --env AUTH_TOKEN="Bearer YOUR_TOKEN" --env TEST_CASE=9 odyssey-k6-test.js
```

### Custom VU and Duration
```bash
# Custom smoke test
k6 run --vus 10 --duration 5m --env AUTH_TOKEN="Bearer YOUR_TOKEN" odyssey-k6-test.js

# Custom load test
k6 run --stage 2m:10,5m:20,2m:0 --env AUTH_TOKEN="Bearer YOUR_TOKEN" odyssey-k6-test.js
```

## Configuration

### Environment Configuration
Edit `odyssey-k6-config.js` to customize:
- **Test Data**: Phone numbers, email addresses, company names
- **API Endpoints**: Base URLs for different environments
- **Message Templates**: Custom message content for different API types
- **Validation Rules**: Data format validation settings

### Test Data Pools
The script includes realistic test data:
- 15 phone numbers for SMS/Voice testing
- 12 email addresses for Email testing
- 10 fax numbers for Fax testing
- 10 company names for personalization
- 10 user names for recipient testing

### Scenario Customization
Edit `odyssey-k6-scenarios.js` to:
- Modify existing scenarios (duration, VUs, stages)
- Create new custom scenarios
- Adjust performance thresholds
- Add environment-specific settings

## Monitoring and Reporting

### Built-in Metrics
- **HTTP Request Duration**: Response times for all API calls
- **HTTP Request Failed**: Error rates and failure analysis
- **API Success Rate**: Custom success rate tracking
- **API Response Time**: API-specific response time metrics
- **Checks**: Validation checks pass/fail rates

### Custom Metrics
- **API Errors Total**: Total count of API errors
- **API Success Rate**: Success rate across all API calls
- **API Response Time**: Detailed response time tracking

### Report Generation
```bash
# Generate HTML report
k6 run --out json=results.json odyssey-k6-test.js
# HTML report automatically generated as 'odyssey-api-test-report.html'
```

## Troubleshooting

### Common Issues

#### Authentication Errors
```bash
# Error: 401 Unauthorized
# Solution: Check your Bearer token
export AUTH_TOKEN="Bearer YOUR_ACTUAL_TOKEN"
```

#### Connection Timeouts
```bash
# Error: Connection timeout
# Solution: Increase timeout or reduce load
k6 run --http-timeout 60s odyssey-k6-test.js
```

#### Rate Limiting
```bash
# Error: 429 Too Many Requests
# Solution: Reduce VUs or add longer think time
# Edit the sleep() values in the script
```

### Performance Issues
```bash
# High memory usage
k6 run --compatibility-mode=base odyssey-k6-test.js

# Reduce log verbosity
k6 run --quiet odyssey-k6-test.js

# Use fewer VUs for initial testing
k6 run --vus 5 odyssey-k6-test.js
```

## Best Practices

### Before Running Tests
1. **Validate Credentials**: Test with single API call first
2. **Check Test Data**: Ensure phone numbers and emails are valid
3. **Coordinate with Team**: Notify stakeholders of test schedule
4. **Monitor Resources**: Check system capacity before load testing

### During Test Execution
1. **Monitor Metrics**: Watch for error rates and response times
2. **System Resources**: Monitor server CPU, memory, and network
3. **Be Prepared to Stop**: Have stop procedures ready if issues arise
4. **Document Issues**: Record any problems for analysis

### After Testing
1. **Analyze Results**: Review all metrics and identify bottlenecks
2. **Generate Reports**: Create comprehensive test reports
3. **Share Findings**: Communicate results to stakeholders
4. **Archive Data**: Store test results for future reference

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: K6 Load Test
on: [push, pull_request]
jobs:
  k6-load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run K6 test
        uses: grafana/k6-action@v0.1.2
        with:
          filename: odyssey-k6-test.js
        env:
          AUTH_TOKEN: ${{ secrets.ODYSSEY_API_TOKEN }}
          TEST_SCENARIO: smoke
```

### Jenkins Pipeline Example
```groovy
pipeline {
    agent any
    environment {
        AUTH_TOKEN = credentials('odyssey-api-token')
    }
    stages {
        stage('K6 Load Test') {
            steps {
                sh 'k6 run --env AUTH_TOKEN="$AUTH_TOKEN" --env TEST_SCENARIO=smoke odyssey-k6-test.js'
            }
        }
    }
}
```

## Support and Resources

### Documentation
- [K6 Documentation](https://k6.io/docs/)
- [K6 JavaScript API](https://k6.io/docs/javascript-api/)
- [K6 Test Scenarios](https://k6.io/docs/using-k6/scenarios/)

### Community
- [K6 Community Forum](https://community.k6.io/)
- [K6 GitHub Repository](https://github.com/grafana/k6)
- [K6 Slack Channel](https://k6.io/slack)

This K6 test suite provides comprehensive coverage of the Odyssey REST API with production-ready load testing capabilities.