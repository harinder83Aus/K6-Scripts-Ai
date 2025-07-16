# K6-Script-Ai

![K6 Logo](https://k6.io/images/k6-logo.svg)

A comprehensive K6 load testing suite for the Odyssey REST API, featuring AI-generated test scripts with complete coverage of all 51 API endpoints.

## 🚀 Features

- **Complete API Coverage**: All 51 endpoints from the Odyssey REST API
- **Multiple Test Scenarios**: Smoke, Load, Stress, Spike, Endurance, Volume testing
- **Smart Data Management**: Randomized test data pools with validation
- **Custom Metrics**: API success rates, response times, error tracking
- **CI/CD Ready**: GitHub Actions, Jenkins, GitLab CI integration examples
- **Production Ready**: Comprehensive error handling and reporting

## 📋 API Coverage

### Message Sending APIs (21 endpoints)
- **SMS APIs (7)**: Basic, Advanced, File List, Personalized, Fully Personalized, Scheduled, Tracking URL
- **Email APIs (5)**: Basic, Advanced, File List, Personalized, Scheduled  
- **Fax APIs (4)**: Basic, Advanced, File List, Scheduled
- **Voice APIs (5)**: Basic, Advanced, File List, Personalized, Scheduled

### Data & Reporting APIs (22 endpoints)
- **Reporting APIs (13)**: Report files, Job summaries, Job items with various filters
- **Reception APIs (8)**: Inbound SMS and Fax handling
- **File Management APIs (8)**: Hosted list and document file operations

## 🛠 Quick Start

### Prerequisites
```bash
# Install K6
# macOS
brew install k6

# Linux (Ubuntu/Debian)
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

### Setup
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/K6-Script-Ai.git
cd K6-Script-Ai

# Set your API token
export AUTH_TOKEN="Bearer YOUR_ODYSSEY_API_TOKEN"
```

### Run Tests
```bash
# Smoke test (quick validation)
npm run test:smoke

# Load test (normal conditions)
npm run test:load

# Stress test (high load)
npm run test:stress

# Test specific API category
npm run test:messaging
npm run test:reporting
npm run test:files
```

## 📊 Test Scenarios

| Scenario | Duration | Max VUs | Purpose |
|----------|----------|---------|---------|
| Smoke | 2 minutes | 5 | Quick validation |
| Load | 18 minutes | 20 | Normal operations |
| Stress | 25 minutes | 40 | Find breaking points |
| Spike | 4 minutes | 50 | Sudden load increases |
| Endurance | 30 minutes | 15 | Long-term stability |

## 🎯 Performance Thresholds

- **Response Time**: 95% < 5s, 99% < 10s
- **Error Rate**: < 10%
- **Success Rate**: > 95%
- **API-Specific**:
  - SMS: 95% < 3s
  - Email: 95% < 4s
  - Fax: 95% < 8s
  - Voice: 95% < 4s
  - Reporting: 95% < 2s

## 📁 File Structure

```
K6-Script-Ai/
├── odyssey-k6-test.js              # Main test script
├── odyssey-k6-config.js            # Configuration & test data
├── odyssey-k6-scenarios.js         # Test scenarios
├── odyssey-k6-execution-guide.md   # Detailed execution guide
├── package.json                    # NPM configuration
├── .gitignore                      # Git ignore rules
├── .github/                        # GitHub Actions workflows
│   └── workflows/
│       └── k6-tests.yml
└── docs/                           # Additional documentation
    └── ...
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
export AUTH_TOKEN="Bearer YOUR_ODYSSEY_API_TOKEN"

# Optional
export TEST_SCENARIO="smoke"        # Test scenario to run
export TEST_CASE="1"               # Specific test case (1-51)
export ENVIRONMENT="test"          # Environment (test/staging/prod)
```

### Test Data
Update `odyssey-k6-config.js` with your test data:
```javascript
testData: {
  phoneNumbers: ['00337123456', '00336123456', ...],
  emailAddresses: ['test@example.com', 'user@example.com', ...],
  faxNumbers: ['00334123456', '00334123457', ...],
  // ... more test data
}
```

## 🚀 CI/CD Integration

### GitHub Actions
```yaml
name: K6 Load Tests
on: [push, pull_request]
jobs:
  k6-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run K6 tests
        run: |
          k6 run --env AUTH_TOKEN="${{ secrets.ODYSSEY_API_TOKEN }}" \
                 --env TEST_SCENARIO=smoke \
                 odyssey-k6-test.js
```

### Jenkins
```groovy
pipeline {
    agent any
    environment {
        AUTH_TOKEN = credentials('odyssey-api-token')
    }
    stages {
        stage('K6 Tests') {
            steps {
                sh 'k6 run --env AUTH_TOKEN="$AUTH_TOKEN" --env TEST_SCENARIO=smoke odyssey-k6-test.js'
            }
        }
    }
}
```

## 📖 Documentation

- [Execution Guide](odyssey-k6-execution-guide.md) - Detailed setup and execution instructions
- [API Reference](docs/api-reference.md) - Complete API endpoint documentation
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions

## 🎭 Test Cases

### Message Sending (1-21)
```bash
# SMS APIs
k6 run --env AUTH_TOKEN="$AUTH_TOKEN" --env TEST_CASE=1 odyssey-k6-test.js  # SMS Basic
k6 run --env AUTH_TOKEN="$AUTH_TOKEN" --env TEST_CASE=2 odyssey-k6-test.js  # SMS Advanced

# Email APIs  
k6 run --env AUTH_TOKEN="$AUTH_TOKEN" --env TEST_CASE=8 odyssey-k6-test.js  # Email Basic
k6 run --env AUTH_TOKEN="$AUTH_TOKEN" --env TEST_CASE=9 odyssey-k6-test.js  # Email Advanced

# Fax APIs
k6 run --env AUTH_TOKEN="$AUTH_TOKEN" --env TEST_CASE=13 odyssey-k6-test.js # Fax Basic

# Voice APIs
k6 run --env AUTH_TOKEN="$AUTH_TOKEN" --env TEST_CASE=17 odyssey-k6-test.js # Voice Basic
```

### Reporting & Data (22-51)
```bash
# Reporting APIs
k6 run --env AUTH_TOKEN="$AUTH_TOKEN" --env TEST_CASE=22 odyssey-k6-test.js # Get Reports
k6 run --env AUTH_TOKEN="$AUTH_TOKEN" --env TEST_CASE=25 odyssey-k6-test.js # Job Summaries

# File Management
k6 run --env AUTH_TOKEN="$AUTH_TOKEN" --env TEST_CASE=44 odyssey-k6-test.js # List Files
k6 run --env AUTH_TOKEN="$AUTH_TOKEN" --env TEST_CASE=46 odyssey-k6-test.js # Add File
```

## 🐛 Troubleshooting

### Common Issues
1. **Authentication Error (401)**
   ```bash
   # Check your token
   echo $AUTH_TOKEN
   # Should start with "Bearer "
   ```

2. **Connection Timeout**
   ```bash
   # Increase timeout
   k6 run --http-timeout 60s odyssey-k6-test.js
   ```

3. **Rate Limiting (429)**
   ```bash
   # Reduce load
   k6 run --vus 5 --duration 2m odyssey-k6-test.js
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [K6](https://k6.io/) for the excellent load testing framework
- [Odyssey Messaging](https://www.odyssey-messaging.com/) for the API
- AI assistance in generating comprehensive test coverage

## 📊 Metrics Dashboard

The test suite generates comprehensive metrics including:
- Response times (average, median, 95th percentile)
- Error rates by API endpoint
- Success rates and throughput
- Custom business metrics
- HTML reports with visualizations

## 🔗 Useful Links

- [K6 Documentation](https://k6.io/docs/)
- [Odyssey API Documentation](https://api.odyssey-services.fr/docs)
- [Performance Testing Best Practices](https://k6.io/docs/testing-guides/)

---

**Made with ❤️ and AI assistance for comprehensive API load testing**