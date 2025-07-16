/**
 * K6 Load Test Script for Odyssey REST API
 * Generated from Postman Collection: Odyssey_REST_API_samples_V1.0
 * 
 * This script tests all 51 API endpoints from the Odyssey REST API collection
 * 
 * Usage:
 * k6 run odyssey-k6-test.js
 * k6 run --env TEST_CASE=1 odyssey-k6-test.js
 * k6 run --env TEST_SCENARIO=smoke odyssey-k6-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Custom metrics
const apiErrors = new Counter('api_errors_total');
const apiSuccessRate = new Rate('api_success_rate');
const apiResponseTime = new Trend('api_response_time');

// Test configuration
const BASE_URL = 'https://api.odyssey-services.fr';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'Bearer YOUR_TOKEN_HERE';
const TEST_CASE = parseInt(__ENV.TEST_CASE) || 0;
const TEST_SCENARIO = __ENV.TEST_SCENARIO || 'default';

// Test data
const testData = {
  phoneNumbers: ['00337123456', '00336123456', '00335123456'],
  emailAddresses: ['test1@example.com', 'test2@example.com', 'test3@example.com'],
  faxNumbers: ['00334123456', '00334123457', '00334123458'],
  futureDateTime: '2025-12-31T23:59:59.999Z',
  startDate: '2025-01-01T00:00:00.000Z',
  endDate: '2025-12-31T23:59:59.999Z',
  jobNumber: '12345',
  randomId: () => Math.random().toString(36).substr(2, 9)
};

// Headers configuration
const headers = {
  'Content-Type': 'application/json',
  'Authorization': AUTH_TOKEN
};

// Test scenarios configuration
export let options = {
  scenarios: {
    // Smoke test scenario
    smoke: {
      executor: 'constant-vus',
      vus: 5,
      duration: '2m',
      tags: { test_type: 'smoke' }
    },
    
    // Load test scenario
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },
        { duration: '5m', target: 10 },
        { duration: '2m', target: 20 },
        { duration: '5m', target: 20 },
        { duration: '2m', target: 10 },
        { duration: '2m', target: 0 }
      ],
      tags: { test_type: 'load' }
    },
    
    // Stress test scenario
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 20 },
        { duration: '5m', target: 20 },
        { duration: '2m', target: 40 },
        { duration: '5m', target: 40 },
        { duration: '2m', target: 60 },
        { duration: '5m', target: 60 },
        { duration: '2m', target: 40 },
        { duration: '2m', target: 20 },
        { duration: '2m', target: 0 }
      ],
      tags: { test_type: 'stress' }
    },
    
    // Spike test scenario
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '30s', target: 100 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 100 },
        { duration: '1m', target: 0 }
      ],
      tags: { test_type: 'spike' }
    },
    
    // Endurance test scenario
    endurance: {
      executor: 'constant-vus',
      vus: 20,
      duration: '30m',
      tags: { test_type: 'endurance' }
    }
  },
  
  // Performance thresholds
  thresholds: {
    http_req_duration: ['p(95)<5000', 'p(99)<10000'], // 95% under 5s, 99% under 10s
    http_req_failed: ['rate<0.1'], // Error rate under 10%
    api_success_rate: ['rate>0.95'], // Success rate over 95%
    api_response_time: ['p(95)<3000'], // 95% of API calls under 3s
    checks: ['rate>0.9'] // 90% of checks should pass
  },
  
  // Test tags
  tags: {
    testid: 'odyssey-api-load-test',
    environment: 'test'
  }
};

// Override options based on TEST_SCENARIO environment variable
if (TEST_SCENARIO !== 'default') {
  options.scenarios = {
    [TEST_SCENARIO]: options.scenarios[TEST_SCENARIO]
  };
}

//==============================================================================
// SMS API Functions
//==============================================================================

export function sendSmsBasic() {
  const payload = {
    JobType: 'SMS',
    Text: 'Hello World! K6 Load Test',
    TrackingId: `K6_SMS_Basic_${testData.randomId()}`,
    AdhocRecipients: [
      {
        Name: 'K6TestUser',
        Address: testData.phoneNumbers[0]
      }
    ]
  };
  
  const response = http.post(`${BASE_URL}/api/V1/SMSJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'SMS Basic - Status 200': (r) => r.status === 200,
    'SMS Basic - Response time < 5s': (r) => r.timings.duration < 5000,
    'SMS Basic - JobNumber present': (r) => r.json().hasOwnProperty('JobNumber')
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
    console.log(`SMS Basic failed: ${response.status} - ${response.body}`);
  }
  
  // Extract JobNumber for correlation
  if (response.status === 200) {
    const jobNumber = response.json().JobNumber;
    if (jobNumber) {
      testData.jobNumber = jobNumber;
    }
  }
  
  return response;
}

export function sendSmsAdvanced() {
  const payload = {
    JobType: 'SMS',
    TrackingId: `K6_SMS_Advanced_${testData.randomId()}`,
    Text: 'Hello World Advanced K6 Test!',
    Parameter: {
      Sender: 'K6Test',
      ContentType: 3,
      Media: 1
    },
    AdhocRecipients: [
      {
        Name: 'K6TestUser',
        Address: testData.phoneNumbers[0],
        OptionalFields: ['K6 Test Company']
      }
    ]
  };
  
  const response = http.post(`${BASE_URL}/api/V1/SMSJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'SMS Advanced - Status 200': (r) => r.status === 200,
    'SMS Advanced - Response time < 5s': (r) => r.timings.duration < 5000,
    'SMS Advanced - JobNumber present': (r) => r.json().hasOwnProperty('JobNumber')
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function sendSmsFileList() {
  const payload = {
    JobType: 'SMS',
    TrackingId: `K6_SMS_FileList_${testData.randomId()}`,
    Text: 'Hello World File List K6 Test!',
    Lists: [
      {
        Name: 'k6test.tab',
        Hosted: false,
        Type: 0,
        Content: '77u/MDAzMzc4Tg3OA=='
      }
    ]
  };
  
  const response = http.post(`${BASE_URL}/api/V1/SMSJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'SMS FileList - Status 200': (r) => r.status === 200,
    'SMS FileList - Response time < 5s': (r) => r.timings.duration < 5000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function sendSmsPersonalized() {
  const payload = {
    JobType: 'SMS',
    TrackingId: `K6_SMS_Personalized_${testData.randomId()}`,
    LaunchType: 0,
    Text: 'Hi `BCF2, Are you from `BCF3? K6 Test',
    AdhocRecipients: [
      {
        Name: 'K6TestUser1',
        Address: testData.phoneNumbers[0],
        OptionalFields: ['Company A']
      },
      {
        Name: 'K6TestUser2',
        Address: testData.phoneNumbers[1],
        OptionalFields: ['Company B']
      }
    ]
  };
  
  const response = http.post(`${BASE_URL}/api/V1/SMSJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'SMS Personalized - Status 200': (r) => r.status === 200,
    'SMS Personalized - Response time < 5s': (r) => r.timings.duration < 5000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function sendSmsFullyPersonalized() {
  const payload = {
    JobType: 'SMS',
    TrackingId: `K6_SMS_FullyPersonalized_${testData.randomId()}`,
    LaunchType: 0,
    Text: '`BCF3',
    AdhocRecipients: [
      {
        Name: 'K6TestUser1',
        Address: testData.phoneNumbers[0],
        OptionalFields: ['This is the text for the first recipient K6 Test']
      },
      {
        Name: 'K6TestUser2',
        Address: testData.phoneNumbers[1],
        OptionalFields: ['This is the text for the second recipient K6 Test']
      }
    ]
  };
  
  const response = http.post(`${BASE_URL}/api/V1/SMSJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'SMS FullyPersonalized - Status 200': (r) => r.status === 200,
    'SMS FullyPersonalized - Response time < 5s': (r) => r.timings.duration < 5000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function sendSmsScheduled() {
  const payload = {
    JobType: 'SMS',
    TrackingId: `K6_SMS_Scheduled_${testData.randomId()}`,
    Text: 'Scheduled SMS K6 Test!',
    ScheduledStartTime: testData.futureDateTime,
    AdhocRecipients: [
      {
        Name: 'K6TestUser',
        Address: testData.phoneNumbers[0],
        OptionalFields: ['K6 Test Company']
      }
    ]
  };
  
  const response = http.post(`${BASE_URL}/api/V1/SMSJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'SMS Scheduled - Status 200': (r) => r.status === 200,
    'SMS Scheduled - Response time < 5s': (r) => r.timings.duration < 5000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function sendSmsTrackingUrl() {
  const payload = {
    JobType: 'SMS',
    TrackingId: `K6_SMS_TrackingURL_${testData.randomId()}`,
    Text: 'Hello World K6 Test! Please click: http://www.example.com/',
    Parameter: {
      Media: 1,
      ShortUrl: true,
      ShortUrlTracking: true
    },
    AdhocRecipients: [
      {
        Name: 'K6TestUser',
        Address: testData.phoneNumbers[0],
        OptionalFields: ['K6 Test Company']
      }
    ]
  };
  
  const response = http.post(`${BASE_URL}/api/V1/SMSJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'SMS TrackingURL - Status 200': (r) => r.status === 200,
    'SMS TrackingURL - Response time < 5s': (r) => r.timings.duration < 5000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

//==============================================================================
// Email API Functions
//==============================================================================

export function sendEmailBasic() {
  const payload = {
    JobType: 'Email',
    TrackingId: `K6_Email_Basic_${testData.randomId()}`,
    EmailBody: {
      Name: 'body.html',
      Content: 'PGh0bWw+DQo8aGVhZGVyPg0KPG1ldGEgY2hhcnNldD0iVVRGLTgiPg0KPC9oZWFkZXI+DQo8Ym9keT4NClRoaXMgaXMgYW4gZW1haWwgdGVzdCBmcm9tIE9keXNzZXkgTWVzc2FnaW5nIEs2IFRlc3QuDQo8L2JvZHk+DQo8L2h0bWw+',
      Type: 2
    },
    AdhocRecipients: [
      {
        Address: testData.emailAddresses[0],
        Name: 'K6TestUser',
        OptionalFields: ['K6 Test Company', 'BirthDate']
      }
    ],
    Parameter: {
      Media: 5,
      Subject: 'K6 Test Email Subject',
      ReplyTo: 'support@k6test.com'
    }
  };
  
  const response = http.post(`${BASE_URL}/api/V1/EmailJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'Email Basic - Status 200': (r) => r.status === 200,
    'Email Basic - Response time < 5s': (r) => r.timings.duration < 5000,
    'Email Basic - JobNumber present': (r) => r.json().hasOwnProperty('JobNumber')
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function sendEmailAdvanced() {
  const payload = {
    JobType: 'Email',
    TrackingId: `K6_Email_Advanced_${testData.randomId()}`,
    EmailBody: {
      Name: 'body.html',
      Content: 'PGh0bWw+DQo8aGVhZGVyPg0KPG1ldGEgY2hhcnNldD0iVVRGLTgiPg0KPC9oZWFkZXI+DQo8Ym9keT4NClRoaXMgaXMgYW4gZW1haWwgdGVzdCBmcm9tIE9keXNzZXkgTWVzc2FnaW5nIEs2IFRlc3QuDQo8YnIvPg0KPGEgaHJlZj0iaHR0cDovL3d3dy5vZHlzc2V5LW1lc3NhZ2luZy5jb20iPVRoaXMgaXMgYSBsaW5rIHRvIHRlc3QgdGhlIHRyYWNraW5nIG9wdGlvbjwvYT4NCjwvYm9keT4NCjwvaHRtbD4=',
      Type: 2
    },
    AdhocRecipients: [
      {
        Address: testData.emailAddresses[0],
        Name: 'K6TestUser',
        OptionalFields: ['K6 Test Company', 'BirthDate']
      }
    ],
    Attachments: [
      {
        Name: 'K6Attachment.txt',
        Content: 'VGhpcyBpcyBhbiBhdHRhY2hlbWVudCBmaWxlIGZvciBLNiBUZXN0',
        Type: 4
      }
    ],
    Parameter: {
      Media: 5,
      Subject: 'K6 Test Email Advanced Subject',
      ReplyTo: 'support@k6test.com',
      From: '"K6Test" <k6test@ods2.net>',
      ActivateAutoPull: true,
      ActivateTracking: true,
      TrackingType: 0
    }
  };
  
  const response = http.post(`${BASE_URL}/api/V1/EmailJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'Email Advanced - Status 200': (r) => r.status === 200,
    'Email Advanced - Response time < 5s': (r) => r.timings.duration < 5000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function sendEmailFileList() {
  const payload = {
    JobType: 'Email',
    TrackingId: `K6_Email_FileList_${testData.randomId()}`,
    EmailBody: {
      Name: 'body.html',
      Content: 'PGh0bWw+DQo8aGVhZGVyPg0KPG1ldGEgY2hhcnNldD0iVVRGLTgiPg0KPC9oZWFkZXI+DQo8Ym9keT4NClRoaXMgaXMgYW4gZW1haWwgdGVzdCBmcm9tIE9keXNzZXkgTWVzc2FnaW5nIEs2IFRlc3QuDQo8L2JvZHk+DQo8L2h0bWw+',
      Type: 2
    },
    Lists: [
      {
        Name: 'k6test.tab',
        Type: 0,
        Content: 'dXNlcm5AZ21haWwuY29tCUpvaG4JTXkgQ29tcGFueQlCaXJ0aERhdGU='
      }
    ],
    Parameter: {
      Media: 5,
      Subject: 'K6 Test Email FileList Subject',
      ReplyTo: 'support@k6test.com'
    }
  };
  
  const response = http.post(`${BASE_URL}/api/V1/EmailJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'Email FileList - Status 200': (r) => r.status === 200,
    'Email FileList - Response time < 5s': (r) => r.timings.duration < 5000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function sendEmailPersonalized() {
  const payload = {
    JobType: 'Email',
    TrackingId: `K6_Email_Personalized_${testData.randomId()}`,
    EmailBody: {
      Name: 'body.html',
      Content: 'PGh0bWw+DQo8aGVhZGVyPg0KPG1ldGEgY2hhcnNldD0iVVRGLTgiPg0KPC9oZWFkZXI+DQo8Ym9keT4NCkhpIGBCQ0YyLCBBcmUgeW91IGZyb20gYEJDRjMgPyBLNiBUZXN0DQo8L2JvZHk+DQo8L2h0bWw+',
      Type: 2
    },
    AdhocRecipients: [
      {
        Address: testData.emailAddresses[0],
        Name: 'K6TestUser1',
        OptionalFields: ['Company A', 'BirthDate']
      },
      {
        Address: testData.emailAddresses[1],
        Name: 'K6TestUser2',
        OptionalFields: ['Company B', 'BirthDate']
      }
    ],
    Parameter: {
      Media: 5,
      Subject: 'K6 Test Email Personalized Subject',
      ReplyTo: 'support@k6test.com'
    }
  };
  
  const response = http.post(`${BASE_URL}/api/V1/EmailJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'Email Personalized - Status 200': (r) => r.status === 200,
    'Email Personalized - Response time < 5s': (r) => r.timings.duration < 5000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function sendEmailScheduled() {
  const payload = {
    JobType: 'Email',
    TrackingId: `K6_Email_Scheduled_${testData.randomId()}`,
    ScheduledStartTime: testData.futureDateTime,
    EmailBody: {
      Name: 'body.html',
      Content: 'PGh0bWw+DQo8aGVhZGVyPg0KPG1ldGEgY2hhcnNldD0iVVRGLTgiPg0KPC9oZWFkZXI+DQo8Ym9keT4NClRoaXMgaXMgYW4gZW1haWwgdGVzdCBmcm9tIE9keXNzZXkgTWVzc2FnaW5nIEs2IFRlc3QuDQo8L2JvZHk+DQo8L2h0bWw+',
      Type: 2
    },
    AdhocRecipients: [
      {
        Address: testData.emailAddresses[0],
        Name: 'K6TestUser',
        OptionalFields: ['K6 Test Company', 'BirthDate']
      }
    ],
    Parameter: {
      Media: 5,
      Subject: 'K6 Test Email Scheduled Subject',
      ReplyTo: 'support@k6test.com'
    }
  };
  
  const response = http.post(`${BASE_URL}/api/V1/EmailJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'Email Scheduled - Status 200': (r) => r.status === 200,
    'Email Scheduled - Response time < 5s': (r) => r.timings.duration < 5000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

//==============================================================================
// Fax API Functions
//==============================================================================

export function sendFaxBasic() {
  const payload = {
    JobType: 'NO_JTYPE',
    TrackingId: `K6_Fax_Basic_${testData.randomId()}`,
    LaunchType: 0,
    Documents: [
      {
        Name: 'k6test.txt',
        Hosted: false,
        Type: 1,
        Content: 'Qm9uam91ciwgaWNpIEs2IFRlc3QsIGNlY2kgZXN0IHVuIHRlc3Qu'
      }
    ],
    AdhocRecipients: [
      {
        Name: 'K6TestUser',
        Address: testData.faxNumbers[0]
      }
    ]
  };
  
  const response = http.post(`${BASE_URL}/api/V1/FaxJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'Fax Basic - Status 200': (r) => r.status === 200,
    'Fax Basic - Response time < 10s': (r) => r.timings.duration < 10000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function sendFaxAdvanced() {
  const payload = {
    JobType: 'NO_JTYPE',
    TrackingId: `K6_Fax_Advanced_${testData.randomId()}`,
    Documents: [
      {
        Name: 'k6document.pdf',
        Type: 1,
        Content: 'Qm9uam91ciwgaWNpIEs2IFRlc3QsIGNlY2kgZXN0IHVuIHRlc3Qu'
      }
    ],
    AdhocRecipients: [
      {
        Name: 'K6TestUser',
        Address: testData.faxNumbers[0]
      }
    ],
    Parameter: {
      Csid: 'K6 Test Company',
      Resolution: 1,
      Media: 0
    }
  };
  
  const response = http.post(`${BASE_URL}/api/V1/FaxJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'Fax Advanced - Status 200': (r) => r.status === 200,
    'Fax Advanced - Response time < 10s': (r) => r.timings.duration < 10000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function sendFaxFileList() {
  const payload = {
    JobType: 'NO_JTYPE',
    TrackingId: `K6_Fax_FileList_${testData.randomId()}`,
    Documents: [
      {
        Name: 'k6document.pdf',
        Type: 1,
        Content: 'Qm9uam91ciwgaWNpIEs2IFRlc3QsIGNlY2kgZXN0IHVuIHRlc3Qu'
      }
    ],
    Lists: [
      {
        Name: 'k6test.tab',
        Hosted: false,
        Type: 0,
        Content: '77u/MDAzMzc4Tg3OA=='
      }
    ]
  };
  
  const response = http.post(`${BASE_URL}/api/V1/FaxJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'Fax FileList - Status 200': (r) => r.status === 200,
    'Fax FileList - Response time < 10s': (r) => r.timings.duration < 10000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function sendFaxScheduled() {
  const payload = {
    JobType: 'NO_JTYPE',
    TrackingId: `K6_Fax_Scheduled_${testData.randomId()}`,
    ScheduledStartTime: testData.futureDateTime,
    Documents: [
      {
        Name: 'k6document.pdf',
        Type: 1,
        Content: 'Qm9uam91ciwgaWNpIEs2IFRlc3QsIGNlY2kgZXN0IHVuIHRlc3Qu'
      }
    ],
    AdhocRecipients: [
      {
        Name: 'K6TestUser',
        Address: testData.faxNumbers[0]
      }
    ]
  };
  
  const response = http.post(`${BASE_URL}/api/V1/FaxJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'Fax Scheduled - Status 200': (r) => r.status === 200,
    'Fax Scheduled - Response time < 10s': (r) => r.timings.duration < 10000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

//==============================================================================
// Voice API Functions
//==============================================================================

export function sendVoiceBasic() {
  const payload = {
    JobType: 'Vocal',
    TrackingId: `K6_Voice_Basic_${testData.randomId()}`,
    Documents: [
      {
        Name: 'K6Test.txt',
        Type: 1,
        Content: 'VGhpcyBpcyBhIHZvaWNlIG1lc3NhZ2UgZm9yIEs2IFRlc3Q='
      }
    ],
    AdhocRecipients: [
      {
        Name: 'K6TestUser',
        Address: testData.phoneNumbers[0]
      }
    ]
  };
  
  const response = http.post(`${BASE_URL}/api/V1/VoiceJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'Voice Basic - Status 200': (r) => r.status === 200,
    'Voice Basic - Response time < 5s': (r) => r.timings.duration < 5000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function sendVoiceAdvanced() {
  const payload = {
    JobType: 'Vocal',
    TrackingId: `K6_Voice_Advanced_${testData.randomId()}`,
    Documents: [
      {
        Name: 'K6Test.txt',
        Type: 1,
        Content: 'VGhpcyBpcyBhIHZvaWNlIG1lc3NhZ2UgZm9yIEs2IFRlc3Q='
      }
    ],
    AdhocRecipients: [
      {
        Name: 'K6TestUser',
        Address: testData.phoneNumbers[0]
      }
    ],
    Parameter: {
      Sender: '06xxxxxxxx',
      TextToSpeechVoiceRate: 5,
      TextToSpeechVoiceId: 7,
      ScenarioId: 1,
      AcknowledgeKey: '2',
      RepeatKey: '1',
      TransferNumber: '06xxxxxxxx',
      TransferKey: '3',
      Media: 2
    }
  };
  
  const response = http.post(`${BASE_URL}/api/V1/VoiceJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'Voice Advanced - Status 200': (r) => r.status === 200,
    'Voice Advanced - Response time < 5s': (r) => r.timings.duration < 5000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function sendVoiceFileList() {
  const payload = {
    JobType: 'Vocal',
    TrackingId: `K6_Voice_FileList_${testData.randomId()}`,
    Documents: [
      {
        Name: 'K6Test.txt',
        Type: 1,
        Content: 'VGhpcyBpcyBhIHZvaWNlIG1lc3NhZ2UgZm9yIEs2IFRlc3Q='
      }
    ],
    Lists: [
      {
        Name: 'k6test.tab',
        Type: 0,
        Content: '77u/MDAzMzc4Tg3OA=='
      }
    ]
  };
  
  const response = http.post(`${BASE_URL}/api/V1/VoiceJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'Voice FileList - Status 200': (r) => r.status === 200,
    'Voice FileList - Response time < 5s': (r) => r.timings.duration < 5000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function sendVoicePersonalized() {
  const payload = {
    JobType: 'Vocal',
    TrackingId: `K6_Voice_Personalized_${testData.randomId()}`,
    Documents: [
      {
        Name: 'K6Test.txt',
        Type: 1,
        Content: 'SGkgYEJDRjIsIEFyZSB5b3UgZnJvbSBgQkNGMyA/IEs2IFRlc3Q='
      }
    ],
    AdhocRecipients: [
      {
        Name: 'K6TestUser1',
        Address: testData.phoneNumbers[0],
        OptionalFields: ['Company A']
      },
      {
        Name: 'K6TestUser2',
        Address: testData.phoneNumbers[1],
        OptionalFields: ['Company B']
      }
    ]
  };
  
  const response = http.post(`${BASE_URL}/api/V1/VoiceJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'Voice Personalized - Status 200': (r) => r.status === 200,
    'Voice Personalized - Response time < 5s': (r) => r.timings.duration < 5000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function sendVoiceScheduled() {
  const payload = {
    JobType: 'Vocal',
    TrackingId: `K6_Voice_Scheduled_${testData.randomId()}`,
    ScheduledStartTime: testData.futureDateTime,
    Documents: [
      {
        Name: 'K6Test.txt',
        Type: 1,
        Content: 'VGhpcyBpcyBhIHZvaWNlIG1lc3NhZ2UgZm9yIEs2IFRlc3Q='
      }
    ],
    AdhocRecipients: [
      {
        Name: 'K6TestUser',
        Address: testData.phoneNumbers[0]
      }
    ]
  };
  
  const response = http.post(`${BASE_URL}/api/V1/VoiceJobs`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'Voice Scheduled - Status 200': (r) => r.status === 200,
    'Voice Scheduled - Response time < 5s': (r) => r.timings.duration < 5000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

//==============================================================================
// Reporting API Functions
//==============================================================================

export function getReportFiles() {
  const response = http.get(`${BASE_URL}/api/V1/HostedReportFiles`, { headers });
  
  const success = check(response, {
    'Get Report Files - Status 200': (r) => r.status === 200,
    'Get Report Files - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function getReportFileByJob() {
  const response = http.get(`${BASE_URL}/api/V1/HostedReportFiles/${testData.jobNumber}`, { headers });
  
  const success = check(response, {
    'Get Report File By Job - Status 200': (r) => r.status === 200,
    'Get Report File By Job - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function deleteReportFile() {
  const response = http.del(`${BASE_URL}/api/V1/HostedReportFiles/${testData.jobNumber}`, null, { headers });
  
  const success = check(response, {
    'Delete Report File - Status 200': (r) => r.status === 200,
    'Delete Report File - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function getJobSummaries() {
  const response = http.get(`${BASE_URL}/api/V1/JobSummaries?pageSize=10`, { headers });
  
  const success = check(response, {
    'Get Job Summaries - Status 200': (r) => r.status === 200,
    'Get Job Summaries - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function getJobSummaryById() {
  const response = http.get(`${BASE_URL}/api/V1/JobSummaries/${testData.jobNumber}`, { headers });
  
  const success = check(response, {
    'Get Job Summary By ID - Status 200': (r) => r.status === 200,
    'Get Job Summary By ID - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function getJobSummariesPaged() {
  const response = http.get(`${BASE_URL}/api/V1/JobSummaries?pageIndex=1&pageSize=5`, { headers });
  
  const success = check(response, {
    'Get Job Summaries Paged - Status 200': (r) => r.status === 200,
    'Get Job Summaries Paged - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function getJobSummariesFiltered() {
  const response = http.get(`${BASE_URL}/api/V1/JobSummaries?filterTid=API&filterOnlyNotSent=true`, { headers });
  
  const success = check(response, {
    'Get Job Summaries Filtered - Status 200': (r) => r.status === 200,
    'Get Job Summaries Filtered - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function getJobSummariesByMedia() {
  const response = http.get(`${BASE_URL}/api/V1/JobSummaries?filterMedia=1&sortField=2&sortDirection=2`, { headers });
  
  const success = check(response, {
    'Get Job Summaries By Media - Status 200': (r) => r.status === 200,
    'Get Job Summaries By Media - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function getJobSummariesByDate() {
  const response = http.get(`${BASE_URL}/api/V1/JobSummaries?filterStartDate=${testData.startDate}&filterEndDate=${testData.endDate}`, { headers });
  
  const success = check(response, {
    'Get Job Summaries By Date - Status 200': (r) => r.status === 200,
    'Get Job Summaries By Date - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function getJobItems() {
  const response = http.get(`${BASE_URL}/api/V1/JobItems?filterJob=${testData.jobNumber}`, { headers });
  
  const success = check(response, {
    'Get Job Items - Status 200': (r) => r.status === 200,
    'Get Job Items - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function getJobItemsPaged() {
  const response = http.get(`${BASE_URL}/api/V1/JobItems?filterJob=${testData.jobNumber}&pageIndex=1&pageSize=50`, { headers });
  
  const success = check(response, {
    'Get Job Items Paged - Status 200': (r) => r.status === 200,
    'Get Job Items Paged - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function getJobItemsFiltered() {
  const response = http.get(`${BASE_URL}/api/V1/JobItems?filterJob=${testData.jobNumber}&filterFailed=false&filterOutcome='F'&sortField=7&sortDirection=1`, { headers });
  
  const success = check(response, {
    'Get Job Items Filtered - Status 200': (r) => r.status === 200,
    'Get Job Items Filtered - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function getJobItemsByDate() {
  const response = http.get(`${BASE_URL}/api/V1/JobItems?filterJob=${testData.jobNumber}&filterStartDate=${testData.startDate}&filterEndDate=${testData.endDate}`, { headers });
  
  const success = check(response, {
    'Get Job Items By Date - Status 200': (r) => r.status === 200,
    'Get Job Items By Date - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

//==============================================================================
// Inbound SMS API Functions
//==============================================================================

export function getInboundSms() {
  const response = http.get(`${BASE_URL}/api/V1/InboundSms`, { headers });
  
  const success = check(response, {
    'Get Inbound SMS - Status 200': (r) => r.status === 200,
    'Get Inbound SMS - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function getInboundSmsPaged() {
  const response = http.get(`${BASE_URL}/api/V1/InboundSms?pageIndex=1&pageSize=5&filterJob=${testData.jobNumber}`, { headers });
  
  const success = check(response, {
    'Get Inbound SMS Paged - Status 200': (r) => r.status === 200,
    'Get Inbound SMS Paged - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function getInboundSmsBySender() {
  const response = http.get(`${BASE_URL}/api/V1/InboundSms?filterMSNDIS=INBOUNDSMS_55xxx&filterAni=336xxxxxx`, { headers });
  
  const success = check(response, {
    'Get Inbound SMS By Sender - Status 200': (r) => r.status === 200,
    'Get Inbound SMS By Sender - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function getInboundSmsByDate() {
  const response = http.get(`${BASE_URL}/api/V1/InboundSms?FilterStartDate=${testData.startDate}&FilterEndDate=${testData.endDate}&sortField=0&sortDirection=2`, { headers });
  
  const success = check(response, {
    'Get Inbound SMS By Date - Status 200': (r) => r.status === 200,
    'Get Inbound SMS By Date - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

//==============================================================================
// Inbound Fax API Functions
//==============================================================================

export function getInboundFax() {
  const response = http.get(`${BASE_URL}/api/V1/InboundFax`, { headers });
  
  const success = check(response, {
    'Get Inbound Fax - Status 200': (r) => r.status === 200,
    'Get Inbound Fax - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function getInboundFaxPaged() {
  const response = http.get(`${BASE_URL}/api/V1/InboundFax?pageIndex=1&pageSize=5&filterTo=134296015`, { headers });
  
  const success = check(response, {
    'Get Inbound Fax Paged - Status 200': (r) => r.status === 200,
    'Get Inbound Fax Paged - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function getInboundFaxByDate() {
  const response = http.get(`${BASE_URL}/api/V1/InboundFax?FilterStartDate=${testData.startDate}&FilterEndDate=${testData.endDate}&sortField=0&sortDirection=2`, { headers });
  
  const success = check(response, {
    'Get Inbound Fax By Date - Status 200': (r) => r.status === 200,
    'Get Inbound Fax By Date - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function getInboundFaxFile() {
  const response = http.get(`${BASE_URL}/api/V1/InboundFolders/134296015/HostedInboundFiles/0-20170711-0714-1126279.PDF`, { headers });
  
  const success = check(response, {
    'Get Inbound Fax File - Status 200': (r) => r.status === 200,
    'Get Inbound Fax File - Response time < 5s': (r) => r.timings.duration < 5000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function deleteInboundFaxFile() {
  const response = http.del(`${BASE_URL}/api/V1/InboundFolders/134296015/HostedInboundFiles/0-20170724-0749-1135087.PDF`, null, { headers });
  
  const success = check(response, {
    'Delete Inbound Fax File - Status 200': (r) => r.status === 200,
    'Delete Inbound Fax File - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

//==============================================================================
// Hosted List Files API Functions
//==============================================================================

export function getHostedListFiles() {
  const response = http.get(`${BASE_URL}/api/V1/HostedListFiles`, { headers });
  
  const success = check(response, {
    'Get Hosted List Files - Status 200': (r) => r.status === 200,
    'Get Hosted List Files - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function getHostedListFile() {
  const response = http.get(`${BASE_URL}/api/V1/HostedListFiles/K6TestList.tab`, { headers });
  
  const success = check(response, {
    'Get Hosted List File - Status 200': (r) => r.status === 200,
    'Get Hosted List File - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function addHostedListFile() {
  const payload = {
    Name: `K6TestList_${testData.randomId()}.tab`,
    Content: 'dXNlcm5AZ21haWwuY29tCUpvaG4JTXkgQ29tcGFueQlCaXJ0aERhdGU='
  };
  
  const response = http.post(`${BASE_URL}/api/V1/HostedListFiles`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'Add Hosted List File - Status 200': (r) => r.status === 200,
    'Add Hosted List File - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function deleteHostedListFile() {
  const response = http.del(`${BASE_URL}/api/V1/HostedListFiles/K6TestList.tab`, null, { headers });
  
  const success = check(response, {
    'Delete Hosted List File - Status 200': (r) => r.status === 200,
    'Delete Hosted List File - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

//==============================================================================
// Hosted Document Files API Functions
//==============================================================================

export function getHostedDocumentFiles() {
  const response = http.get(`${BASE_URL}/api/V1/HostedDocumentFiles`, { headers });
  
  const success = check(response, {
    'Get Hosted Document Files - Status 200': (r) => r.status === 200,
    'Get Hosted Document Files - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function getHostedDocumentFile() {
  const response = http.get(`${BASE_URL}/api/V1/HostedDocumentFiles/K6TestDocument.pdf`, { headers });
  
  const success = check(response, {
    'Get Hosted Document File - Status 200': (r) => r.status === 200,
    'Get Hosted Document File - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function addHostedDocumentFile() {
  const payload = {
    Name: `K6TestDocument_${testData.randomId()}.pdf`,
    Content: 'dXNlcm5AZ21haWwuY29tCUpvaG4JTXkgQ29tcGFueQlCaXJ0aERhdGU='
  };
  
  const response = http.post(`${BASE_URL}/api/V1/HostedDocumentFiles`, JSON.stringify(payload), { headers });
  
  const success = check(response, {
    'Add Hosted Document File - Status 200': (r) => r.status === 200,
    'Add Hosted Document File - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

export function deleteHostedDocumentFile() {
  const response = http.del(`${BASE_URL}/api/V1/HostedDocumentFiles/K6TestDocument.pdf`, null, { headers });
  
  const success = check(response, {
    'Delete Hosted Document File - Status 200': (r) => r.status === 200,
    'Delete Hosted Document File - Response time < 3s': (r) => r.timings.duration < 3000
  });
  
  apiSuccessRate.add(success);
  apiResponseTime.add(response.timings.duration);
  
  if (!success) {
    apiErrors.add(1);
  }
  
  return response;
}

//==============================================================================
// Test Case Router
//==============================================================================

const testCases = {
  // SMS Tests (1-7)
  1: sendSmsBasic,
  2: sendSmsAdvanced,
  3: sendSmsFileList,
  4: sendSmsPersonalized,
  5: sendSmsFullyPersonalized,
  6: sendSmsScheduled,
  7: sendSmsTrackingUrl,
  
  // Email Tests (8-12)
  8: sendEmailBasic,
  9: sendEmailAdvanced,
  10: sendEmailFileList,
  11: sendEmailPersonalized,
  12: sendEmailScheduled,
  
  // Fax Tests (13-16)
  13: sendFaxBasic,
  14: sendFaxAdvanced,
  15: sendFaxFileList,
  16: sendFaxScheduled,
  
  // Voice Tests (17-21)
  17: sendVoiceBasic,
  18: sendVoiceAdvanced,
  19: sendVoiceFileList,
  20: sendVoicePersonalized,
  21: sendVoiceScheduled,
  
  // Report Tests (22-24)
  22: getReportFiles,
  23: getReportFileByJob,
  24: deleteReportFile,
  
  // Job Summary Tests (25-30)
  25: getJobSummaries,
  26: getJobSummaryById,
  27: getJobSummariesPaged,
  28: getJobSummariesFiltered,
  29: getJobSummariesByMedia,
  30: getJobSummariesByDate,
  
  // Job Items Tests (31-34)
  31: getJobItems,
  32: getJobItemsPaged,
  33: getJobItemsFiltered,
  34: getJobItemsByDate,
  
  // Inbound SMS Tests (35-38)
  35: getInboundSms,
  36: getInboundSmsPaged,
  37: getInboundSmsBySender,
  38: getInboundSmsByDate,
  
  // Inbound Fax Tests (39-43)
  39: getInboundFax,
  40: getInboundFaxPaged,
  41: getInboundFaxByDate,
  42: getInboundFaxFile,
  43: deleteInboundFaxFile,
  
  // Hosted List Files Tests (44-47)
  44: getHostedListFiles,
  45: getHostedListFile,
  46: addHostedListFile,
  47: deleteHostedListFile,
  
  // Hosted Document Files Tests (48-51)
  48: getHostedDocumentFiles,
  49: getHostedDocumentFile,
  50: addHostedDocumentFile,
  51: deleteHostedDocumentFile
};

//==============================================================================
// Main Test Function
//==============================================================================

export default function() {
  // Random test selection or specific test case
  let testCaseToRun = TEST_CASE;
  
  if (testCaseToRun === 0) {
    // Random test case selection
    const testCaseKeys = Object.keys(testCases);
    testCaseToRun = parseInt(testCaseKeys[Math.floor(Math.random() * testCaseKeys.length)]);
  }
  
  console.log(`Running test case: ${testCaseToRun}`);
  
  if (testCases[testCaseToRun]) {
    testCases[testCaseToRun]();
  } else {
    console.log(`Invalid test case: ${testCaseToRun}`);
  }
  
  // Random think time between 1-3 seconds
  sleep(Math.random() * 2 + 1);
}

//==============================================================================
// Test Report Generation
//==============================================================================

export function handleSummary(data) {
  return {
    'odyssey-api-test-report.html': htmlReport(data),
    'stdout': textSummary(data, { indent: ' ', enableColors: true })
  };
}