// k6 load test - Payment flow performance
// Tests invoice creation endpoint

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const paymentTime = new Trend("payment_duration");

export const options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    errors: ["rate<0.001"],
  },
};

export default function () {
  const payload = JSON.stringify({
    productId: "STARTER",
    currency: "IDR",
  });

  const params = {
    headers: { "Content-Type": "application/json" },
  };

  const res = http.post(
    "http://localhost:3000/api/xendit/create-invoice",
    payload,
    params,
  );

  check(res, {
    "status ok": (r) => r.status === 200 || r.status === 401,
    "response valid": (r) => r.body.length > 0,
  }) || errorRate.add(1);

  paymentTime.add(res.timings.duration);
  sleep(2);
}
