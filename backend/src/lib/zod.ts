import { z } from 'zod';
export const IngestSchema = z.object({
  audit_id: z.string().uuid(),
  url_hash: z.string().length(64),
  score: z.number().int().min(0).max(100),
  metrics: z.record(z.any()),
  user_agent: z.string().optional(),
  created_at: z.string().datetime().optional()
});
export type IngestBody = z.infer<typeof IngestSchema>;