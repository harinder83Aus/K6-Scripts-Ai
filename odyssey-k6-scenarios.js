/**
 * K6 Test Scenarios for Odyssey REST API
 * This file contains different test scenarios for various load testing needs
 */

import { config, dataHelpers } from './odyssey-k6-config.js';

export const scenarios = {
  // Smoke Test - Quick validation
  smoke: {
    executor: 'constant-vus',
    vus: 5,
    duration: '2m',
    tags: { test_type: 'smoke' },
    env: { TEST_CASE: '1,8,13,17,22,35,44' } // One from each category
  },
  
  // Load Test - Normal load conditions
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 5 },   // Ramp up to 5 users
      { duration: '5m', target: 10 },  // Stay at 10 users
      { duration: '2m', target: 15 },  // Ramp up to 15 users
      { duration: '5m', target: 15 },  // Stay at 15 users
      { duration: '2m', target: 5 },   // Ramp down to 5 users
      { duration: '2m', target: 0 }    // Ramp down to 0 users
    ],
    tags: { test_type: 'load' }
  },
  
  // Stress Test - High load conditions
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 10 },  // Ramp up to 10 users
      { duration: '5m', target: 20 },  // Ramp up to 20 users
      { duration: '2m', target: 30 },  // Ramp up to 30 users
      { duration: '5m', target: 30 },  // Stay at 30 users
      { duration: '2m', target: 40 },  // Ramp up to 40 users
      { duration: '5m', target: 40 },  // Stay at 40 users
      { duration: '2m', target: 20 },  // Ramp down to 20 users
      { duration: '2m', target: 0 }    // Ramp down to 0 users
    ],
    tags: { test_type: 'stress' }
  },
  
  // Spike Test - Sudden load increase
  spike: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 5 },   // Normal load
      { duration: '30s', target: 50 }, // Spike to 50 users
      { duration: '1m', target: 5 },   // Back to normal
      { duration: '30s', target: 50 }, // Another spike
      { duration: '1m', target: 0 }    // Ramp down
    ],
    tags: { test_type: 'spike' },
    env: { TEST_CASE: '1,2,3,8,9,10' } // Most critical APIs
  },
  
  // Endurance Test - Long-running stability test
  endurance: {
    executor: 'constant-vus',
    vus: 15,
    duration: '30m',
    tags: { test_type: 'endurance' }
  },
  
  // Volume Test - High data volume
  volume: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '5m', target: 20 },  // Ramp up to 20 users
      { duration: '20m', target: 30 }, // Maintain 30 users
      { duration: '5m', target: 0 }    // Ramp down
    ],
    tags: { test_type: 'volume' }
  },
  
  // Messaging-focused test
  messaging_apis: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 10 },
      { duration: '8m', target: 20 },
      { duration: '2m', target: 0 }
    ],
    tags: { test_type: 'messaging' },
    env: { TEST_CASE: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21' }
  },
  
  // Reporting-focused test
  reporting_apis: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 15 },
      { duration: '6m', target: 30 },
      { duration: '1m', target: 0 }
    ],
    tags: { test_type: 'reporting' },
    env: { TEST_CASE: '22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43' }
  },
  
  // File management test
  file_management: {
    executor: 'constant-vus',
    vus: 8,
    duration: '5m',
    tags: { test_type: 'file_management' },
    env: { TEST_CASE: '44,45,46,47,48,49,50,51' }
  }
};

// Test options generator
export function generateTestOptions(scenarioName = 'load') {
  const baseOptions = {
    scenarios: {},
    thresholds: {
      http_req_duration: ['p(95)<5000', 'p(99)<10000'],
      http_req_failed: ['rate<0.1'],
      checks: ['rate>0.9'],
      'api_success_rate': ['rate>0.95'],
      'api_response_time': ['p(95)<3000']
    },
    tags: {
      testid: 'odyssey-api-load-test',
      environment: config.environment
    }
  };
  
  // Add specific scenario
  if (scenarios[scenarioName]) {
    baseOptions.scenarios[scenarioName] = scenarios[scenarioName];
  } else {
    // Default to load test
    baseOptions.scenarios.load = scenarios.load;
  }
  
  // Add scenario-specific thresholds
  const scenarioThresholds = getScenarioThresholds(scenarioName);
  if (scenarioThresholds) {
    Object.assign(baseOptions.thresholds, scenarioThresholds);
  }
  
  return baseOptions;
}

// Get scenario-specific thresholds
function getScenarioThresholds(scenarioName) {
  const thresholdMap = {
    smoke: {
      http_req_duration: ['p(95)<3000', 'p(99)<5000'],
      http_req_failed: ['rate<0.05'],
      checks: ['rate>0.95']
    },
    stress: {
      http_req_duration: ['p(95)<8000', 'p(99)<15000'],
      http_req_failed: ['rate<0.15'],
      checks: ['rate>0.85']
    },
    spike: {
      http_req_duration: ['p(95)<10000', 'p(99)<20000'],
      http_req_failed: ['rate<0.2'],
      checks: ['rate>0.8']
    },
    endurance: {
      http_req_duration: ['p(95)<5000', 'p(99)<10000'],
      http_req_failed: ['rate<0.05'],
      checks: ['rate>0.95']
    },
    messaging_apis: {
      http_req_duration: ['p(95)<4000', 'p(99)<8000'],
      http_req_failed: ['rate<0.05'],
      checks: ['rate>0.95']
    },
    reporting_apis: {
      http_req_duration: ['p(95)<2000', 'p(99)<4000'],
      http_req_failed: ['rate<0.05'],
      checks: ['rate>0.95']
    }
  };
  
  return thresholdMap[scenarioName] || null;
}

// Custom scenario builder
export function buildCustomScenario(options) {
  const {
    name = 'custom',
    executor = 'ramping-vus',
    vus = 10,
    duration = '10m',
    stages = null,
    testCases = null,
    tags = {}
  } = options;
  
  const scenario = {
    executor,
    tags: { test_type: name, ...tags }
  };
  
  if (executor === 'constant-vus') {
    scenario.vus = vus;
    scenario.duration = duration;
  } else if (executor === 'ramping-vus' && stages) {
    scenario.startVUs = 0;
    scenario.stages = stages;
  }
  
  if (testCases) {
    scenario.env = { TEST_CASE: testCases };
  }
  
  return scenario;
}

// Performance test matrix
export const performanceMatrix = {
  // Quick tests (under 5 minutes)
  quick: {
    smoke: scenarios.smoke,
    spike: scenarios.spike,
    file_management: scenarios.file_management
  },
  
  // Medium tests (5-15 minutes)
  medium: {
    load: scenarios.load,
    stress: scenarios.stress,
    messaging_apis: scenarios.messaging_apis,
    reporting_apis: scenarios.reporting_apis
  },
  
  // Long tests (over 15 minutes)
  long: {
    endurance: scenarios.endurance,
    volume: scenarios.volume
  }
};

// Test execution recommendations
export const recommendations = {
  development: {
    frequency: 'On every major change',
    scenarios: ['smoke', 'load'],
    duration: '< 10 minutes',
    focus: 'Functionality validation'
  },
  
  staging: {
    frequency: 'Daily',
    scenarios: ['smoke', 'load', 'stress'],
    duration: '< 30 minutes',
    focus: 'Performance validation'
  },
  
  production: {
    frequency: 'Weekly',
    scenarios: ['load', 'stress', 'endurance'],
    duration: '1-2 hours',
    focus: 'Capacity planning'
  },
  
  release: {
    frequency: 'Before each release',
    scenarios: ['smoke', 'load', 'stress', 'spike'],
    duration: '< 1 hour',
    focus: 'Release validation'
  }
};

export default scenarios;