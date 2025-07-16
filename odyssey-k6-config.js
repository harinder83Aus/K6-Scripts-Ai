/**
 * K6 Configuration Module for Odyssey REST API Testing
 * This module provides test data management and configuration options
 */

export const config = {
  // Base configuration
  baseUrl: 'https://api.odyssey-services.fr',
  
  // Environment variables
  authToken: __ENV.AUTH_TOKEN || 'Bearer YOUR_TOKEN_HERE',
  testCase: parseInt(__ENV.TEST_CASE) || 0,
  testScenario: __ENV.TEST_SCENARIO || 'default',
  environment: __ENV.ENVIRONMENT || 'test',
  
  // Test data pools
  testData: {
    phoneNumbers: [
      '00337123456', '00337123457', '00337123458', '00337123459', '00337123460',
      '00336123456', '00336123457', '00336123458', '00336123459', '00336123460',
      '00335123456', '00335123457', '00335123458', '00335123459', '00335123460'
    ],
    
    emailAddresses: [
      'test1@example.com', 'test2@example.com', 'test3@example.com',
      'user1@testdomain.com', 'user2@testdomain.com', 'user3@testdomain.com',
      'demo1@k6test.com', 'demo2@k6test.com', 'demo3@k6test.com',
      'load1@odyssey.test', 'load2@odyssey.test', 'load3@odyssey.test'
    ],
    
    faxNumbers: [
      '00334123456', '00334123457', '00334123458', '00334123459', '00334123460',
      '00333123456', '00333123457', '00333123458', '00333123459', '00333123460'
    ],
    
    companyNames: [
      'K6 Test Company', 'LoadTest Corp', 'API Test Inc', 'Performance Ltd',
      'Benchmark Systems', 'Quality Assurance Co', 'Test Automation LLC',
      'Validation Services', 'Monitoring Solutions', 'Analytics Group'
    ],
    
    userNames: [
      'John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Davis',
      'Diana Wilson', 'Frank Miller', 'Grace Taylor', 'Henry Anderson', 'Ivy Thomas'
    ],
    
    trackingPrefixes: [
      'K6_Test', 'LoadTest', 'PerformanceTest', 'StressTest', 'SmokeTest',
      'ApiTest', 'IntegrationTest', 'EnduranceTest', 'SpikeTest', 'VolumeTest'
    ],
    
    messageTemplates: {
      sms: [
        'Hello World! K6 Load Test Message',
        'This is a K6 performance test SMS',
        'API load testing with K6 - Message {id}',
        'Automated test message from K6 suite',
        'Performance validation SMS - Test {id}'
      ],
      
      email: [
        'This is an email test from Odyssey Messaging K6 Test Suite',
        'Automated email performance test - Message {id}',
        'K6 load testing email validation',
        'API performance test email from K6',
        'Odyssey API load test email - Test {id}'
      ],
      
      voice: [
        'This is a voice message for K6 Test Suite',
        'Automated voice test from K6 performance suite',
        'K6 load testing voice message - Test {id}',
        'API performance validation voice call',
        'Odyssey voice API test - Message {id}'
      ]
    },
    
    // Date and time helpers
    dates: {
      futureDateTime: '2025-12-31T23:59:59.999Z',
      startDate: '2025-01-01T00:00:00.000Z',
      endDate: '2025-12-31T23:59:59.999Z',
      
      // Generate future date (hours from now)
      getFutureDateTime: (hoursFromNow = 24) => {
        const future = new Date();
        future.setHours(future.getHours() + hoursFromNow);
        return future.toISOString();
      },
      
      // Generate date range for filtering
      getDateRange: (daysBack = 30) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - daysBack);
        
        return {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        };
      }
    }
  },
  
  // Test scenarios configuration
  scenarios: {
    smoke: {
      name: 'Smoke Test',
      description: 'Quick validation of all API endpoints',
      duration: '2m',
      vus: 5,
      testCases: [1, 8, 13, 17, 22, 35, 44] // One from each category
    },
    
    load: {
      name: 'Load Test',
      description: 'Normal load testing with moderate user count',
      duration: '10m',
      maxVus: 20,
      testCases: 'all' // All test cases
    },
    
    stress: {
      name: 'Stress Test',
      description: 'High load testing to find breaking points',
      duration: '15m',
      maxVus: 60,
      testCases: 'all'
    },
    
    spike: {
      name: 'Spike Test',
      description: 'Sudden load increase testing',
      duration: '5m',
      maxVus: 100,
      testCases: [1, 2, 3, 8, 9, 10] // Most critical APIs
    },
    
    endurance: {
      name: 'Endurance Test',
      description: 'Long-running test for stability',
      duration: '30m',
      maxVus: 20,
      testCases: 'all'
    },
    
    messaging: {
      name: 'Messaging APIs Test',
      description: 'Focus on message sending APIs',
      duration: '10m',
      maxVus: 25,
      testCases: [...Array(21).keys()].map(i => i + 1) // Cases 1-21
    },
    
    reporting: {
      name: 'Reporting APIs Test',
      description: 'Focus on reporting and querying APIs',
      duration: '8m',
      maxVus: 40,
      testCases: [...Array(13).keys()].map(i => i + 22) // Cases 22-34
    }
  },
  
  // Performance thresholds
  thresholds: {
    // Default thresholds
    default: {
      http_req_duration: ['p(95)<5000', 'p(99)<10000'],
      http_req_failed: ['rate<0.1'],
      checks: ['rate>0.9']
    },
    
    // API-specific thresholds
    sms: {
      http_req_duration: ['p(95)<3000', 'p(99)<5000'],
      http_req_failed: ['rate<0.05'],
      checks: ['rate>0.95']
    },
    
    email: {
      http_req_duration: ['p(95)<4000', 'p(99)<8000'],
      http_req_failed: ['rate<0.05'],
      checks: ['rate>0.95']
    },
    
    fax: {
      http_req_duration: ['p(95)<8000', 'p(99)<15000'],
      http_req_failed: ['rate<0.1'],
      checks: ['rate>0.9']
    },
    
    voice: {
      http_req_duration: ['p(95)<4000', 'p(99)<8000'],
      http_req_failed: ['rate<0.05'],
      checks: ['rate>0.95']
    },
    
    reporting: {
      http_req_duration: ['p(95)<2000', 'p(99)<4000'],
      http_req_failed: ['rate<0.05'],
      checks: ['rate>0.95']
    }
  }
};

// Data helper functions
export const dataHelpers = {
  // Get random item from array
  getRandomItem: (array) => {
    return array[Math.floor(Math.random() * array.length)];
  },
  
  // Get random phone number
  getRandomPhoneNumber: () => {
    return dataHelpers.getRandomItem(config.testData.phoneNumbers);
  },
  
  // Get random email address
  getRandomEmailAddress: () => {
    return dataHelpers.getRandomItem(config.testData.emailAddresses);
  },
  
  // Get random fax number
  getRandomFaxNumber: () => {
    return dataHelpers.getRandomItem(config.testData.faxNumbers);
  },
  
  // Get random company name
  getRandomCompanyName: () => {
    return dataHelpers.getRandomItem(config.testData.companyNames);
  },
  
  // Get random user name
  getRandomUserName: () => {
    return dataHelpers.getRandomItem(config.testData.userNames);
  },
  
  // Generate random ID
  generateRandomId: () => {
    return Math.random().toString(36).substr(2, 9);
  },
  
  // Generate tracking ID
  generateTrackingId: (prefix = 'K6_Test') => {
    return `${prefix}_${dataHelpers.generateRandomId()}`;
  },
  
  // Get message template
  getMessageTemplate: (type, id = null) => {
    const templates = config.testData.messageTemplates[type] || [];
    if (templates.length === 0) return `Default ${type} message`;
    
    let template = dataHelpers.getRandomItem(templates);
    if (id !== null) {
      template = template.replace('{id}', id);
    }
    return template;
  },
  
  // Generate test recipients
  generateTestRecipients: (count = 1, type = 'sms') => {
    const recipients = [];
    
    for (let i = 0; i < count; i++) {
      const recipient = {
        Name: dataHelpers.getRandomUserName(),
        OptionalFields: [dataHelpers.getRandomCompanyName()]
      };
      
      // Add address based on type
      switch (type) {
        case 'sms':
        case 'voice':
          recipient.Address = dataHelpers.getRandomPhoneNumber();
          break;
        case 'email':
          recipient.Address = dataHelpers.getRandomEmailAddress();
          break;
        case 'fax':
          recipient.Address = dataHelpers.getRandomFaxNumber();
          break;
      }
      
      recipients.push(recipient);
    }
    
    return recipients;
  }
};

// Environment-specific configurations
export const environments = {
  test: {
    baseUrl: 'https://api.odyssey-services.fr',
    timeout: 30000,
    retries: 3
  },
  
  staging: {
    baseUrl: 'https://staging-api.odyssey-services.fr',
    timeout: 30000,
    retries: 2
  },
  
  production: {
    baseUrl: 'https://api.odyssey-services.fr',
    timeout: 60000,
    retries: 1
  }
};

// Get environment configuration
export function getEnvironmentConfig(env = 'test') {
  return environments[env] || environments.test;
}

// Validation helpers
export const validators = {
  // Validate phone number format
  isValidPhoneNumber: (phone) => {
    const phoneRegex = /^00\d{9,12}$/;
    return phoneRegex.test(phone);
  },
  
  // Validate email address
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Validate datetime format
  isValidDateTime: (datetime) => {
    const date = new Date(datetime);
    return date instanceof Date && !isNaN(date);
  },
  
  // Validate auth token format
  isValidAuthToken: (token) => {
    return token && token.startsWith('Bearer ') && token.length > 10;
  }
};

export default config;