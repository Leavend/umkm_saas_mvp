// k6 load test - Homepage performance
// Target: 95th percentile < 500ms, error rate < 0.1%

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const pageLoadTime = new Trend("page_load_time");

export const options = {
  stages: [
    { duration: "30s", target: 20 }, // Ramp-up
    { duration: "1m", target: 100 }, // Peak load
    { duration: "30s", target: 0 }, // Ramp-down
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
    "page loads": (r) => r.body.includes("AI Image Editor"),
  }) || errorRate.add(1);

  pageLoadTime.add(res.timings.duration);
  sleep(1);
}
