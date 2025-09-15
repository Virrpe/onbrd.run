export type Rule = {
  id: string;
  category: string;
  weight: number;
  description: string;
  fix: string;
  confidence?: "high" | "medium" | "low";
};
export type RuleManifest = { version: string; updatedAt: string; categories: string[]; rules: Rule[]; };
export type Benchmark = { percentile?: number; median?: number; count?: number };