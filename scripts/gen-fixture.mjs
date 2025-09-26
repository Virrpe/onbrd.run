#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const [,, category, slug] = process.argv;
if (!category || !slug) {
  console.error("Usage: node scripts/gen-fixture.mjs <category> <slug>");
  process.exit(1);
}

// Validate category
const validCategories = ["basic", "saas", "ecommerce", "enterprise", "mobile"];
if (!validCategories.includes(category)) {
  console.error(`Invalid category: ${category}. Valid categories: ${validCategories.join(", ")}`);
  process.exit(1);
}

const dir = path.join("benchmarks", "fixtures", category, slug);
fs.mkdirSync(dir, { recursive: true });

// Create basic HTML template
const htmlTemplate = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #fff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 { color: #2c3e50; margin-bottom: 30px; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 5px; font-weight: 600; }
    input, select, textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    button {
      background: #3498db;
      color: white;
      padding: 12px 30px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
    }
    button:hover { background: #2980b9; }
    .trust-signals {
      display: flex;
      gap: 20px;
      margin: 20px 0;
      align-items: center;
    }
    .trust-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <main>
    <div class="container">
      <h1>${slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</h1>
      
      <!-- Form content will be customized based on category -->
      <form id="mainForm">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" name="email" required>
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" required>
        </div>
        
        <button type="submit">Continue</button>
      </form>
      
      <div class="trust-signals">
        <div class="trust-badge">
          <span>🔒</span>
          <span>SSL Secured</span>
        </div>
        <div class="trust-badge">
          <span>✓</span>
          <span>Privacy Protected</span>
        </div>
      </div>
    </div>
  </main>
</body>
</html>`;

fs.writeFileSync(path.join(dir, "index.html"), htmlTemplate);

// Create meta.json with category-specific defaults
const metaDefaults = {
  basic: {
    h_cta_above_fold: true,
    h_steps_count: 2,
    h_copy_clarity: "good",
    h_trust_markers: 2,
    h_perceived_signup_speed_sec: 30,
    a11y_focus_trap: false
  },
  saas: {
    h_cta_above_fold: true,
    h_steps_count: 3,
    h_copy_clarity: "good",
    h_trust_markers: 3,
    h_perceived_signup_speed_sec: 45,
    a11y_focus_trap: false
  },
  ecommerce: {
    h_cta_above_fold: true,
    h_steps_count: 4,
    h_copy_clarity: "fair",
    h_trust_markers: 4,
    h_perceived_signup_speed_sec: 60,
    a11y_focus_trap: false
  },
  enterprise: {
    h_cta_above_fold: false,
    h_steps_count: 5,
    h_copy_clarity: "fair",
    h_trust_markers: 5,
    h_perceived_signup_speed_sec: 90,
    a11y_focus_trap: true
  },
  mobile: {
    h_cta_above_fold: true,
    h_steps_count: 2,
    h_copy_clarity: "good",
    h_trust_markers: 2,
    h_perceived_signup_speed_sec: 25,
    a11y_focus_trap: false
  }
};

const scoreBands = {
  basic: [75, 90],
  saas: [70, 85],
  ecommerce: [65, 80],
  enterprise: [60, 75],
  mobile: [70, 85]
};

const meta = {
  id: `${category}/${slug}`,
  category,
  viewport: { width: 1280, height: 800, deviceScaleFactor: 1 },
  seed: 12345,
  ground_truth: metaDefaults[category],
  expected: {
    score_band: scoreBands[category],
    top_issues_contains: ["steps_count", "trust_markers"]
  }
};

fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
console.log("Created:", dir);