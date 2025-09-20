export type Cohort = 'global'|'saas'|'ecommerce'|'content';
export type Device = 'desktop'|'mobile';

export interface IngestResponse {
  status: 'accepted'|'rate_limited';
  percentile?: number;
  median?: number;
  count?: number;
}