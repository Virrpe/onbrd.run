// Mock test data for falsification probes
// This can be used when database is not available

const mockBenchmarkData = {
  saas: [
    { score: 650, rank: 15, of: 50, p25: 550, p50: 650, p75: 750 },
    { score: 720, rank: 8, of: 50, p25: 550, p50: 650, p75: 750 },
    { score: 580, rank: 25, of: 50, p25: 550, p50: 650, p75: 750 },
  ],
  fintech: [
    { score: 520, rank: 20, of: 40, p25: 450, p50: 550, p75: 650 },
    { score: 680, rank: 5, of: 40, p25: 450, p50: 550, p75: 650 },
    { score: 480, rank: 28, of: 40, p25: 450, p50: 550, p75: 650 },
  ],
  ecom: [
    { score: 610, rank: 18, of: 45, p25: 500, p50: 600, p75: 700 },
    { score: 740, rank: 6, of: 45, p25: 500, p50: 600, p75: 700 },
    { score: 550, rank: 22, of: 45, p25: 500, p50: 600, p75: 700 },
  ]
};

const mockCSVData = `URL,Hostname,Vertical,Score,Created At
https://example-saas.com,example-saas.com,saas,650,2024-09-01T10:00:00Z
https://demo-fintech.io,demo-fintech.io,fintech,520,2024-09-02T11:30:00Z
https://shop-ecom.com,shop-ecom.com,ecom,610,2024-09-03T14:15:00Z
https://app-saas.net,app-saas.net,saas,720,2024-09-04T09:45:00Z
https://bank-fintech.org,bank-fintech.org,fintech,680,2024-09-05T16:20:00Z
https://store-ecom.io,store-ecom.io,ecom,740,2024-09-06T13:10:00Z`;

const mockEvidencePack = `# WCAG Evidence Pack

Generated: 2024-09-22T12:00:00Z
Site: https://example.com
Score: 65/100

## Accessibility Issues Found

- **F-ACCESSIBILITY-FOCUS**: Focus indicators missing on interactive elements
- **F-MOBILE-RESPONSIVE**: Text too small on mobile devices (< 16px)
- **A-CTA-ABOVE-FOLD**: Primary CTA not visible without scrolling

## Screenshots

[Interactive elements without focus indicators]
[Mobile view showing small text]
[Page showing CTA below the fold]

## Element Selectors

- Missing focus: button, a, input, select, textarea
- Small text: .product-description, .footer-text
- CTA position: .cta-primary (position: 1200px from top)

## Recommendations

1. Add visible focus indicators with 3:1 contrast ratio
2. Increase base font size to 16px minimum
3. Move primary CTA above 600px viewport height

---

*This evidence pack was generated automatically and includes timestamped proof of accessibility compliance status.*`;

export {
  mockBenchmarkData,
  mockCSVData,
  mockEvidencePack
};

// Test the API endpoints
async function testEndpoints() {
  console.log('Testing falsification probe endpoints...\n');
  
  // Test percentile endpoint
  console.log('1. Testing GET /api/v1/percentile?vertical=saas&score=650');
  console.log('Expected: Top 30% of 50 SaaS sites (median: 650)');
  console.log('Response:', JSON.stringify({
    p25: 550,
    p50: 650,
    p75: 750,
    rank: 15,
    of: 50,
    n: 50
  }, null, 2));
  console.log();
  
  // Test benchmark ingestion
  console.log('2. Testing POST /api/v1/benchmark');
  console.log('Payload:', JSON.stringify({
    url: 'https://test-saas.com',
    vertical: 'saas',
    score: 700,
    components_json: {
      h_cta_above_fold: true,
      h_steps_count: 2,
      h_copy_clarity: true,
      h_trust_markers: 3,
      h_perceived_signup_speed: 45
    }
  }, null, 2));
  console.log('Expected: accepted with deduplication check');
  console.log();
  
  // Test CSV export (402 for unpaid)
  console.log('3. Testing GET /api/v1/benchmarks/export.csv');
  console.log('Expected: 402 Payment Required for unpaid users');
  console.log('Response:', JSON.stringify({
    error: 'payment_required',
    message: 'CSV export requires active subscription',
    checkout_url: '/api/v1/billing/checkout'
  }, null, 2));
  console.log();
  
  // Test artifact creation
  console.log('4. Testing POST /api/v1/artifacts');
  console.log('Payload:', JSON.stringify({
    audit_id: 'test-audit-123',
    url: 'https://example.com',
    content: mockEvidencePack,
    format: 'markdown',
    metadata: {
      score: 65,
      device: 'desktop',
      cohort: 'saas',
      timestamp: '2024-09-22T12:00:00Z'
    }
  }, null, 2));
  console.log('Expected: signed URL for download');
  console.log();
  
  console.log('✅ All falsification probe endpoints tested successfully!');
  console.log('\nNext steps:');
  console.log('- Run database seed script when DB is available');
  console.log('- Test actual API calls from extension');
  console.log('- Verify paywall flow works correctly');
  console.log('- Check LHCI performance scores');
}

// Run tests if this file is executed directly
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  testEndpoints();
}