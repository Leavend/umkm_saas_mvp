# Load Testing with k6

## Quick Start

```bash
# Install k6 globally
brew install k6  # macOS
# or download from https://k6.io/docs/getting-started/installation/

# Run tests
k6 run loadtests/homepage.js
k6 run loadtests/payment.js
```

## Test Scenarios

### Homepage Test
- **Target**: 100 concurrent users
- **Duration**: 2 minutes
- **Threshold**: 95th percentile < 500ms
- **Error rate**: < 0.1%

### Payment Flow Test  
- **Target**: 100 concurrent users
- **Endpoint**: `/api/xendit/create-invoice`
- **Threshold**: 95th percentile < 500ms
- **Error rate**: < 0.1%

## Results Interpretation

**Good performance:**
- ✅ http_req_duration p(95) < 500ms
- ✅ error rate < 0.001 (0.1%)
- ✅ All checks passing

**Needs optimization:**
- ❌ p(95) > 500ms
- ❌ error rate > 0.001
- ❌ Failed checks
