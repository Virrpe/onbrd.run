import { describe, it, expect } from 'vitest';
import { IngestSchema } from './zod';

describe('Zod Schemas', () => {
  describe('IngestSchema', () => {
    it('should validate a valid ingest payload', () => {
      const validPayload = {
        audit_id: '123e4567-e89b-12d3-a456-426614174000',
        url_hash: 'a'.repeat(64),
        score: 750,
        metrics: {
          performance: {
            score: 800,
            rules_passed: 8,
            rules_failed: 2
          },
          accessibility: {
            score: 700,
            rules_passed: 7,
            rules_failed: 3
          }
        },
        user_agent: 'Mozilla/5.0',
        created_at: '2023-12-01T10:00:00Z',
        device: 'desktop',
        cohort: 'global',
        region: 'US'
      };

      const result = IngestSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should validate with minimal required fields', () => {
      const minimalPayload = {
        audit_id: '123e4567-e89b-12d3-a456-426614174000',
        score: 500,
        metrics: {
          performance: {
            score: 500,
            rules_passed: 5,
            rules_failed: 5
          }
        },
        created_at: '2023-12-01T10:00:00Z'
      };

      const result = IngestSchema.safeParse(minimalPayload);
      expect(result.success).toBe(true);
    });

    it('should reject invalid audit_id (not UUID)', () => {
      const invalidPayload = {
        audit_id: 'not-a-uuid',
        score: 500,
        metrics: {
          performance: {
            score: 500,
            rules_passed: 5,
            rules_failed: 5
          }
        },
        created_at: '2023-12-01T10:00:00Z'
      };

      const result = IngestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject invalid url_hash (wrong length)', () => {
      const invalidPayload = {
        audit_id: '123e4567-e89b-12d3-a456-426614174000',
        url_hash: 'too-short',
        score: 500,
        metrics: {
          performance: {
            score: 500,
            rules_passed: 5,
            rules_failed: 5
          }
        },
        created_at: '2023-12-01T10:00:00Z'
      };

      const result = IngestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject score below minimum', () => {
      const invalidPayload = {
        audit_id: '123e4567-e89b-12d3-a456-426614174000',
        score: -1,
        metrics: {
          performance: {
            score: -1,
            rules_passed: 5,
            rules_failed: 5
          }
        },
        created_at: '2023-12-01T10:00:00Z'
      };

      const result = IngestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject score above maximum', () => {
      const invalidPayload = {
        audit_id: '123e4567-e89b-12d3-a456-426614174000',
        score: 1001,
        metrics: {
          performance: {
            score: 1001,
            rules_passed: 5,
            rules_failed: 5
          }
        },
        created_at: '2023-12-01T10:00:00Z'
      };

      const result = IngestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject invalid device enum', () => {
      const invalidPayload = {
        audit_id: '123e4567-e89b-12d3-a456-426614174000',
        score: 500,
        metrics: {
          performance: {
            score: 500,
            rules_passed: 5,
            rules_failed: 5
          }
        },
        created_at: '2023-12-01T10:00:00Z',
        device: 'invalid-device'
      };

      const result = IngestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject invalid cohort enum', () => {
      const invalidPayload = {
        audit_id: '123e4567-e89b-12d3-a456-426614174000',
        score: 500,
        metrics: {
          performance: {
            score: 500,
            rules_passed: 5,
            rules_failed: 5
          }
        },
        created_at: '2023-12-01T10:00:00Z',
        cohort: 'invalid-cohort'
      };

      const result = IngestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject invalid datetime format', () => {
      const invalidPayload = {
        audit_id: '123e4567-e89b-12d3-a456-426614174000',
        score: 500,
        metrics: {
          performance: {
            score: 500,
            rules_passed: 5,
            rules_failed: 5
          }
        },
        created_at: 'not-a-datetime'
      };

      const result = IngestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidPayload = {
        // Missing audit_id
        score: 500,
        metrics: {
          performance: {
            score: 500,
            rules_passed: 5,
            rules_failed: 5
          }
        }
        // Missing created_at
      };

      const result = IngestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject negative rules_passed', () => {
      const invalidPayload = {
        audit_id: '123e4567-e89b-12d3-a456-426614174000',
        score: 500,
        metrics: {
          performance: {
            score: 500,
            rules_passed: -1,
            rules_failed: 5
          }
        },
        created_at: '2023-12-01T10:00:00Z'
      };

      const result = IngestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject negative rules_failed', () => {
      const invalidPayload = {
        audit_id: '123e4567-e89b-12d3-a456-426614174000',
        score: 500,
        metrics: {
          performance: {
            score: 500,
            rules_passed: 5,
            rules_failed: -1
          }
        },
        created_at: '2023-12-01T10:00:00Z'
      };

      const result = IngestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should apply default values for optional fields', () => {
      const payload = {
        audit_id: '123e4567-e89b-12d3-a456-426614174000',
        score: 500,
        metrics: {
          performance: {
            score: 500,
            rules_passed: 5,
            rules_failed: 5
          }
        },
        created_at: '2023-12-01T10:00:00Z'
      };

      const result = IngestSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.device).toBe('desktop');
        expect(result.data.cohort).toBe('global');
      }
    });

    it('should accept valid device and cohort values', () => {
      const payload = {
        audit_id: '123e4567-e89b-12d3-a456-426614174000',
        score: 500,
        metrics: {
          performance: {
            score: 500,
            rules_passed: 5,
            rules_failed: 5
          }
        },
        created_at: '2023-12-01T10:00:00Z',
        device: 'mobile',
        cohort: 'saas'
      };

      const result = IngestSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.device).toBe('mobile');
        expect(result.data.cohort).toBe('saas');
      }
    });

    it('should accept all valid cohort values', () => {
      const validCohorts = ['global', 'saas', 'ecommerce', 'content'];
      
      validCohorts.forEach(cohort => {
        const payload = {
          audit_id: '123e4567-e89b-12d3-a456-426614174000',
          score: 500,
          metrics: {
            performance: {
              score: 500,
              rules_passed: 5,
              rules_failed: 5
            }
          },
          created_at: '2023-12-01T10:00:00Z',
          cohort
        };

        const result = IngestSchema.safeParse(payload);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.cohort).toBe(cohort);
        }
      });
    });

    it('should accept all valid device values', () => {
      const validDevices = ['desktop', 'mobile'];
      
      validDevices.forEach(device => {
        const payload = {
          audit_id: '123e4567-e89b-12d3-a456-426614174000',
          score: 500,
          metrics: {
            performance: {
              score: 500,
              rules_passed: 5,
              rules_failed: 5
            }
          },
          created_at: '2023-12-01T10:00:00Z',
          device
        };

        const result = IngestSchema.safeParse(payload);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.device).toBe(device);
        }
      });
    });
  });
});