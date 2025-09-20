import { z } from 'zod';
export const IngestSchema = z.object({
  audit_id: z.string().uuid(),
  url_hash: z.string().length(64).optional(),
  score: z.number().int().min(0).max(1000),
  metrics: z.record(z.object({
    score: z.number().int().min(0).max(1000),
    rules_passed: z.number().int().min(0),
    rules_failed: z.number().int().min(0)
  })),
  user_agent: z.string().optional(),
  created_at: z.string().datetime(),
  device: z.enum(['desktop','mobile']).default('desktop'),
  cohort: z.enum(['global','saas','ecommerce','content']).default('global'),
  region: z.string().optional()
});
export type IngestBody = z.infer<typeof IngestSchema>;