import { describe, it, expect, beforeEach } from 'vitest';
import { performAudit } from './probes';

// Mock window.location
const mockLocation = {
  href: 'https://example.com/onboarding'
};


describe('performAudit', () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.body.innerHTML = '';
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    });
  });

  it('should return a complete audit object with all required fields', () => {
    // Set up minimal DOM
    document.body.innerHTML = `
      <button class="cta">Get Started</button>
      <form>
        <input type="email" required>
        <input type="password" required>
      </form>
      <p>Welcome to our service. Sign up now.</p>
      <div class="testimonial">Great product!</div>
      <div class="progress">Step 1 of 2</div>
    `;

    const audit = performAudit();

    expect(audit).toHaveProperty('id');
    expect(audit).toHaveProperty('url', 'https://example.com/onboarding');
    expect(audit).toHaveProperty('timestamp');
    expect(audit).toHaveProperty('heuristics');
    expect(audit).toHaveProperty('scores');
    expect(audit).toHaveProperty('recommendations');
    
    expect(audit.id).toMatch(/^audit-\d+-\w+$/);
    expect(audit.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should detect CTA above fold', () => {
    document.body.innerHTML = `
      <button class="cta">Start Now</button>
    `;

    // Mock getBoundingClientRect to return position above fold
    const button = document.querySelector('button');
    if (button) {
      button.getBoundingClientRect = () => ({ top: 100 } as DOMRect);
    }

    const audit = performAudit();
    
    expect(audit.heuristics.h_cta_above_fold.detected).toBe(true);
    expect(audit.heuristics.h_cta_above_fold.element).toContain('button');
  });

  it('should not detect CTA below fold', () => {
    document.body.innerHTML = `
      <button class="cta">Start Now</button>
    `;

    // Mock getBoundingClientRect to return position below fold
    const button = document.querySelector('button');
    if (button) {
      button.getBoundingClientRect = () => ({ top: 700 } as DOMRect);
    }

    const audit = performAudit();
    
    expect(audit.heuristics.h_cta_above_fold.detected).toBe(false);
  });

  it('should count steps correctly', () => {
    document.body.innerHTML = `
      <form id="step1">
        <input type="email">
      </form>
      <form id="step2">
        <input type="password">
      </form>
      <div class="step">Step 1</div>
      <div class="step">Step 2</div>
      <div class="modal">Modal content</div>
    `;

    const audit = performAudit();
    
    expect(audit.heuristics.h_steps_count.total).toBeGreaterThanOrEqual(2);
    expect(audit.heuristics.h_steps_count.forms).toBe(2);
  });

  it('should analyze copy clarity', () => {
    document.body.innerHTML = `
      <p>This is a short sentence.</p>
      <p>The product was utilized by many customers.</p>
      <p>Leverage our platform to optimize your workflow.</p>
    `;

    const audit = performAudit();
    
    expect(audit.heuristics.h_copy_clarity).toHaveProperty('avg_sentence_length');
    expect(audit.heuristics.h_copy_clarity).toHaveProperty('passive_voice_ratio');
    expect(audit.heuristics.h_copy_clarity).toHaveProperty('jargon_density');
  });

  it('should find trust markers', () => {
    document.body.innerHTML = `
      <div class="testimonial">Great service!</div>
      <div class="review">5 stars</div>
      <img src="security-badge.png" alt="security">
      <div class="logo">Company Logo</div>
    `;

    const audit = performAudit();
    
    expect(audit.heuristics.h_trust_markers.testimonials).toBeGreaterThan(0);
    expect(audit.heuristics.h_trust_markers.total).toBeGreaterThan(0);
  });

  it('should estimate signup speed', () => {
    document.body.innerHTML = `
      <form>
        <input type="email" required>
        <input type="password" required>
        <input type="text" placeholder="Name">
        <select>
          <option>Option 1</option>
        </select>
        <textarea></textarea>
      </form>
      <div class="progress">Step 1 of 3</div>
    `;

    const audit = performAudit();
    
    expect(audit.heuristics.h_perceived_signup_speed.form_fields).toBeGreaterThan(0);
    expect(audit.heuristics.h_perceived_signup_speed.required_fields).toBeGreaterThan(0);
    expect(audit.heuristics.h_perceived_signup_speed.estimated_seconds).toBeGreaterThan(0);
  });

  it('should calculate scores based on heuristics', () => {
    document.body.innerHTML = `
      <button class="cta">Get Started</button>
      <form>
        <input type="email" required>
      </form>
      <p>Welcome to our service.</p>
      <div class="testimonial">Great product!</div>
      <div class="progress">Step 1 of 1</div>
    `;

    const audit = performAudit();
    
    expect(audit.scores).toHaveProperty('h_cta_above_fold');
    expect(audit.scores).toHaveProperty('h_steps_count');
    expect(audit.scores).toHaveProperty('h_copy_clarity');
    expect(audit.scores).toHaveProperty('h_trust_markers');
    expect(audit.scores).toHaveProperty('h_perceived_signup_speed');
    expect(audit.scores).toHaveProperty('overall');
    
    expect(audit.scores.overall).toBeGreaterThanOrEqual(0);
    expect(audit.scores.overall).toBeLessThanOrEqual(100);
  });

  it('should generate recommendations based on scores', () => {
    document.body.innerHTML = `
      <form>
        <input type="email" required>
        <input type="password" required>
        <input type="text" required>
        <input type="tel" required>
        <input type="date" required>
      </form>
      <p>This is a very long sentence that contains many words and might be difficult to understand for users who are trying to read quickly.</p>
    `;

    const audit = performAudit();
    
    expect(Array.isArray(audit.recommendations)).toBe(true);
    expect(audit.recommendations.length).toBeGreaterThan(0);
    
    // Check that recommendations have required structure
    audit.recommendations.forEach(rec => {
      expect(rec).toHaveProperty('heuristic');
      expect(rec).toHaveProperty('priority');
      expect(rec).toHaveProperty('description');
      expect(rec).toHaveProperty('fix');
    });
  });
});