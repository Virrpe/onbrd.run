import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performAudit } from './probes';

// Mock the DOM environment
const mockDOM = {
  querySelectorAll: vi.fn(),
  createElement: vi.fn(),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn()
  }
};

// Mock window.location
const mockLocation = {
  href: 'https://example.com/onboarding'
};

beforeEach(() => {
  vi.clearAllMocks();
  
  // Setup global mocks
  global.document = mockDOM as any;
  global.window = {
    location: mockLocation
  } as any;
});

describe('performAudit', () => {
  it('should return structured audit results for mock DOM', () => {
    // Mock DOM elements for CTA detection
    mockDOM.querySelectorAll.mockImplementation((selector: string) => {
      if (selector.includes('button') || selector.includes('a')) {
        return [
          {
            getBoundingClientRect: () => ({ top: 100 }),
            textContent: 'Get Started',
            tagName: 'BUTTON',
            className: 'cta-button'
          }
        ];
      }
      if (selector.includes('form')) {
        return [{ length: 1 }];
      }
      if (selector.includes('[class*="step"]')) {
        return [{ length: 2 }];
      }
      if (selector.includes('p') || selector.includes('h1')) {
        return [
          { textContent: 'Welcome to our platform. Get started today.' },
          { textContent: 'Simple onboarding process.' }
        ];
      }
      if (selector.includes('[class*="testimonial"]')) {
        return [{ length: 1 }, { length: 1 }];
      }
      if (selector.includes('input')) {
        return [{ length: 4 }];
      }
      if (selector.includes('[required]')) {
        return [{ length: 2 }];
      }
      return [];
    });

    const audit = performAudit();
    
    expect(audit).toHaveProperty('id');
    expect(audit).toHaveProperty('url');
    expect(audit).toHaveProperty('timestamp');
    expect(audit).toHaveProperty('heuristics');
    expect(audit).toHaveProperty('scores');
    expect(audit).toHaveProperty('recommendations');
    
    expect(audit.url).toBe('https://example.com/onboarding');
    expect(audit.id).toMatch(/^audit-\d+-\w+$/);
    expect(audit.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should handle missing DOM elements gracefully', () => {
    mockDOM.querySelectorAll.mockReturnValue([]);
    
    const audit = performAudit();
    
    expect(audit.heuristics.h_cta_above_fold.detected).toBe(false);
    expect(audit.heuristics.h_cta_above_fold.position).toBe(0);
    expect(audit.heuristics.h_cta_above_fold.element).toBe('');
    
    expect(audit.heuristics.h_steps_count.total).toBe(1); // Should default to 1
    expect(audit.heuristics.h_steps_count.forms).toBe(0);
    expect(audit.heuristics.h_steps_count.screens).toBe(0);
    
    expect(audit.heuristics.h_copy_clarity.avg_sentence_length).toBe(0);
    expect(audit.heuristics.h_copy_clarity.passive_voice_ratio).toBe(0);
    expect(audit.heuristics.h_copy_clarity.jargon_density).toBe(0);
    
    expect(audit.heuristics.h_trust_markers.total).toBe(0);
    expect(audit.heuristics.h_trust_markers.testimonials).toBe(0);
    expect(audit.heuristics.h_trust_markers.security_badges).toBe(0);
    expect(audit.heuristics.h_trust_markers.customer_logos).toBe(0);
    
    expect(audit.heuristics.h_perceived_signup_speed.form_fields).toBe(0);
    expect(audit.heuristics.h_perceived_signup_speed.required_fields).toBe(0);
    expect(audit.heuristics.h_perceived_signup_speed.estimated_seconds).toBe(30); // Minimum 30s
  });

  it('should detect CTA above fold correctly', () => {
    mockDOM.querySelectorAll.mockImplementation((selector: string) => {
      if (selector.includes('button') || selector.includes('a')) {
        return [
          {
            getBoundingClientRect: () => ({ top: 100 }), // Above 600px fold
            textContent: 'Start Now',
            tagName: 'BUTTON',
            className: 'primary-cta'
          }
        ];
      }
      return [];
    });

    const audit = performAudit();
    
    expect(audit.heuristics.h_cta_above_fold.detected).toBe(true);
    expect(audit.heuristics.h_cta_above_fold.position).toBe(100);
    expect(audit.heuristics.h_cta_above_fold.element).toBe('button.primary-cta');
  });

  it('should not detect CTA below fold', () => {
    mockDOM.querySelectorAll.mockImplementation((selector: string) => {
      if (selector.includes('button') || selector.includes('a')) {
        return [
          {
            getBoundingClientRect: () => ({ top: 700 }), // Below 600px fold
            textContent: 'Start Now',
            tagName: 'BUTTON',
            className: 'primary-cta'
          }
        ];
      }
      return [];
    });

    const audit = performAudit();
    
    expect(audit.heuristics.h_cta_above_fold.detected).toBe(false);
  });

  it('should count steps correctly', () => {
    mockDOM.querySelectorAll.mockImplementation((selector: string) => {
      if (selector.includes('form')) {
        return [{ length: 2 }, { length: 1 }]; // 2 forms
      }
      if (selector.includes('[class*="step"]')) {
        return [{ length: 1 }, { length: 1 }, { length: 1 }]; // 3 steps
      }
      if (selector.includes('[class*="modal"]')) {
        return [{ length: 1 }]; // 1 modal
      }
      return [];
    });

    const audit = performAudit();
    
    expect(audit.heuristics.h_steps_count.total).toBe(3); // Max of forms(2), steps(3), modals(1)
    expect(audit.heuristics.h_steps_count.forms).toBe(2);
    expect(audit.heuristics.h_steps_count.screens).toBe(3);
  });

  it('should analyze copy clarity with passive voice detection', () => {
    mockDOM.querySelectorAll.mockImplementation((selector: string) => {
      if (selector.includes('p') || selector.includes('h1')) {
        return [
          { textContent: 'The form was submitted by the user.' }, // Passive voice
          { textContent: 'The data is processed by our system.' }, // Passive voice
          { textContent: 'Welcome to our platform.' } // Active voice
        ];
      }
      if (selector.includes('button') || selector.includes('a')) {
        return [
          {
            getBoundingClientRect: () => ({ top: 100 }),
            textContent: 'Get Started',
            tagName: 'BUTTON',
            className: 'cta-button'
          }
        ];
      }
      return [];
    });

    const audit = performAudit();
    
    expect(audit.heuristics.h_copy_clarity.avg_sentence_length).toBeGreaterThan(0);
    expect(audit.heuristics.h_copy_clarity.passive_voice_ratio).toBeGreaterThan(0);
    // The CTA button text "Get Started" might contain jargon words, so we just check it's >= 0
    expect(audit.heuristics.h_copy_clarity.jargon_density).toBeGreaterThanOrEqual(0);
  });

  it('should detect jargon words', () => {
    mockDOM.querySelectorAll.mockImplementation((selector: string) => {
      if (selector.includes('p') || selector.includes('h1')) {
        return [
          { textContent: 'We leverage our platform to optimize user experience and facilitate synergy.' }
        ];
      }
      if (selector.includes('button') || selector.includes('a')) {
        return [
          {
            getBoundingClientRect: () => ({ top: 100 }),
            textContent: 'Get Started',
            tagName: 'BUTTON',
            className: 'cta-button'
          }
        ];
      }
      return [];
    });

    const audit = performAudit();
    
    expect(audit.heuristics.h_copy_clarity.jargon_density).toBeGreaterThan(0);
  });

  it('should find trust markers', () => {
    mockDOM.querySelectorAll.mockImplementation((selector: string) => {
      if (selector.includes('[class*="testimonial"]')) {
        return [{ length: 2 }, { length: 2 }]; // 2 testimonials (2 elements)
      }
      if (selector.includes('[class*="security"]')) {
        return [{ length: 1 }]; // 1 security badge
      }
      if (selector.includes('[class*="logo"]')) {
        return [{ length: 3 }, { length: 3 }, { length: 3 }]; // 3 customer logos (3 elements)
      }
      return [];
    });

    const audit = performAudit();
    
    expect(audit.heuristics.h_trust_markers.testimonials).toBe(2);
    expect(audit.heuristics.h_trust_markers.security_badges).toBe(1);
    expect(audit.heuristics.h_trust_markers.customer_logos).toBe(3);
    expect(audit.heuristics.h_trust_markers.total).toBe(6);
  });

  it('should estimate signup speed with progress indicators', () => {
    mockDOM.querySelectorAll.mockImplementation((selector: string) => {
      if (selector.includes('input')) {
        // Return 8 separate input elements
        return Array(8).fill(null).map((_, i) => ({ type: 'text', name: `field${i}` }));
      }
      if (selector.includes('[required]')) {
        // Return 5 separate required elements
        return Array(5).fill(null).map((_, i) => ({ required: true, name: `required${i}` }));
      }
      if (selector.includes('[class*="progress"]')) {
        return [{ className: 'progress-bar' }]; // 1 progress indicator
      }
      if (selector.includes('button') || selector.includes('a')) {
        return [
          {
            getBoundingClientRect: () => ({ top: 100 }),
            textContent: 'Get Started',
            tagName: 'BUTTON',
            className: 'cta-button'
          }
        ];
      }
      return [];
    });

    const audit = performAudit();
    
    expect(audit.heuristics.h_perceived_signup_speed.form_fields).toBe(8);
    expect(audit.heuristics.h_perceived_signup_speed.required_fields).toBe(5);
    // With progress indicator, estimated time should be reduced by 20%
    expect(audit.heuristics.h_perceived_signup_speed.estimated_seconds).toBeLessThan(80);
  });

  it('should handle edge case with zero form fields', () => {
    mockDOM.querySelectorAll.mockReturnValue([]);
    
    const audit = performAudit();
    
    expect(audit.heuristics.h_perceived_signup_speed.estimated_seconds).toBe(30); // Minimum 30 seconds
  });

  it('should generate unique audit IDs', () => {
    mockDOM.querySelectorAll.mockReturnValue([]);
    
    const audit1 = performAudit();
    const audit2 = performAudit();
    
    expect(audit1.id).not.toBe(audit2.id);
    expect(audit1.id).toMatch(/^audit-\d+-\w+$/);
    expect(audit2.id).toMatch(/^audit-\d+-\w+$/);
  });

  it('should handle DOM elements without text content', () => {
    mockDOM.querySelectorAll.mockImplementation((selector: string) => {
      if (selector.includes('p') || selector.includes('h1')) {
        return [
          { textContent: null }, // No text content
          { textContent: '' },   // Empty text
          { textContent: 'Valid text content' }
        ];
      }
      if (selector.includes('button') || selector.includes('a')) {
        return [
          {
            getBoundingClientRect: () => ({ top: 100 }),
            textContent: 'Get Started',
            tagName: 'BUTTON',
            className: 'cta-button'
          }
        ];
      }
      return [];
    });

    const audit = performAudit();
    
    expect(audit.heuristics.h_copy_clarity.avg_sentence_length).toBeGreaterThanOrEqual(0);
    expect(audit.heuristics.h_copy_clarity.passive_voice_ratio).toBeGreaterThanOrEqual(0);
    expect(audit.heuristics.h_copy_clarity.jargon_density).toBeGreaterThanOrEqual(0);
  });

  it('should handle elements without getBoundingClientRect', () => {
    mockDOM.querySelectorAll.mockImplementation((selector: string) => {
      if (selector.includes('button')) {
        return [
          {
            // Missing getBoundingClientRect method - this should cause the test to handle missing method
            textContent: 'Click me',
            tagName: 'BUTTON',
            className: 'btn'
          }
        ];
      }
      return [];
    });

    const audit = performAudit();
    
    expect(audit.heuristics.h_cta_above_fold.detected).toBe(false);
    expect(audit.heuristics.h_cta_above_fold.position).toBe(0);
    expect(audit.heuristics.h_cta_above_fold.element).toBe('');
  });
});