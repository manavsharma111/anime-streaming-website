import http from 'k6/http'
import { check, sleep } from 'k6'
import { Counter, Rate, Trend, Gauge } from 'k6/metrics'


// CONFIG
const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000'
const ENDPOINT = __ENV.ENDPOINT || '/api/anime'

const RATE_LIMIT = Number(__ENV.RATE_LIMIT || 100000)

// CUSTOM METRICS

// HTTP status counters
const status200 = new Counter('status_200')
const status429 = new Counter('status_429')
const status400 = new Counter('status_400')
const status500 = new Counter('status_500')
const statusOther = new Counter('status_other')

// Rates
const successRate = new Rate('success_rate')
const rateLimitRate = new Rate('rate_limit_rate')
const serverErrorRate = new Rate('server_error_rate')

// Latency
const apiLatency = new Trend('api_latency')

// Response size
const responseSize = Trend
  ? new Trend('response_size')
  : null;

// Current rate-limit information
const configuredRateLimit = new Gauge('configured_rate_limit')

// LOAD TEST CONFIG

export const options = {
 stages: [
    { duration: '1m', target: 100 },
    { duration: '1m', target: 200 },
    { duration: '1m', target: 300 },
    { duration: '1m', target: 500 },
    { duration: '2m', target: 1000 },
    { duration: '30s', target: 0 },
],

  thresholds: {
    http_req_duration: [
      'p(95)<500',
      'p(99)<1000',
    ],

    // Successful requests should be >= 95%
    success_rate: [
      'rate>0.95',
    ],

    // 429 should ideally be < 5%
    rate_limit_rate: [
      'rate<0.05',
    ],

    // Server errors should be < 1%
    server_error_rate: [
      'rate<0.01',
    ],

    api_latency: [
      'p(95)<500',
    ],
  },

  summaryTrendStats: [
    'avg',
    'min',
    'med',
    'max',
    'p(90)',
    'p(95)',
    'p(99)',
    'count',
  ],
}

// TEST

export default function () {

  const url = `${BASE_URL}${ENDPOINT}`

  const res = http.get(url, {
    tags: {
      endpoint: ENDPOINT,
    },
  })

  // Store configured limiter value
  configuredRateLimit.add(RATE_LIMIT)

  // Latency
  apiLatency.add(res.timings.duration)

  // Response size
  if (res.body) {
    responseSize.add(res.body.length)
  } else {
    responseSize.add(0)
  }

  // STATUS TRACKING
  if (res.status === 200) {

    status200.add(1)

    successRate.add(true)
    rateLimitRate.add(false)
    serverErrorRate.add(false)

  } else if (res.status === 429) {

    status429.add(1)

    successRate.add(false)
    rateLimitRate.add(true)
    serverErrorRate.add(false)

  } else if (res.status >= 400 && res.status < 500) {

    status400.add(1)

    successRate.add(false)
    rateLimitRate.add(false)
    serverErrorRate.add(false)

  } else if (res.status >= 500) {

    status500.add(1)

    successRate.add(false)
    rateLimitRate.add(false)
    serverErrorRate.add(true)

  } else {

    statusOther.add(1)

    successRate.add(false)
    rateLimitRate.add(false)
    serverErrorRate.add(false)
  }

  // CHECKS
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response body exists': (r) => r.body && r.body.length > 0,
  })

  // Small pause to prevent an unnecessarily aggressive tight loop
  sleep(0.1)
}

// ===============================
// FINAL SUMMARY
// ===============================

export function handleSummary(data) {

  const metrics = data.metrics;

  console.log('\n========================================');
  console.log('           LOAD TEST SUMMARY');
  console.log('========================================');

  console.log(`Configured Rate Limit : ${RATE_LIMIT}`);

  console.log(
    `Total Requests        : ${metrics.http_reqs?.values?.count || 0}`
  );

  console.log(
    `Requests/sec          : ${metrics.http_reqs?.values?.rate?.toFixed(2) || 0}`
  );

  console.log(
    `200 Responses         : ${metrics.status_200?.values?.count || 0}`
  );

  console.log(
    `429 Responses         : ${metrics.status_429?.values?.count || 0}`
  );

  console.log(
    `4xx Responses         : ${metrics.status_400?.values?.count || 0}`
  );

  console.log(
    `5xx Responses         : ${metrics.status_500?.values?.count || 0}`
  );

  console.log(
    `Success Rate          : ${((metrics.success_rate?.values?.rate || 0) * 100).toFixed(2)}%`
  );

  console.log(
    `Rate-Limit Rate       : ${((metrics.rate_limit_rate?.values?.rate || 0) * 100).toFixed(2)}%`
  );

  console.log(
    `Server Error Rate     : ${((metrics.server_error_rate?.values?.rate || 0) * 100).toFixed(2)}%`
  );

  console.log(
    `Avg Latency           : ${metrics.api_latency?.values?.avg?.toFixed(2) || 0} ms`
  );

  console.log(
    `P95 Latency           : ${metrics.api_latency?.values?.['p(95)']?.toFixed(2) || 0} ms`
  );

  console.log(
    `P99 Latency           : ${metrics.api_latency?.values?.['p(99)']?.toFixed(2) || 0} ms`
  );

  console.log('========================================\n');

  return {};
}
