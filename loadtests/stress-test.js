// k6 stress test - 100 concurrent users for 60 seconds
// Target: p(95) < 500ms, error rate < 0.1%

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const pageLoadTime = new Trend("page_load_time");

export const options = {
  stages: [
    { duration: "30s", target: 100 }, // Ramp up to 100 users in 30s
    { duration: "60s", target: 100 }, // Hold 100 users for 60s
    { duration: "30s", target: 0 }, // Ramp down to 0 in 30s
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    errors: ["rate<0.001"],
  },
};

export default function () {
  const res = http.get("http://localhost:3000/en");

  check(res, {
    "status 200": (r) => r.status === 200,
    // Check for actual rendered content from marketplace
    "page loads": (r) => r.status === 200 && r.body.length > 1000,
  }) || errorRate.add(1);

  pageLoadTime.add(res.timings.duration);
  sleep(1);
}
