/**
 * Build-time environment variables injected by the build process
 */

declare const BUILD_ID: string;
declare const MODE: 'local' | 'cloud';
declare const RULESET_HASH: string;
declare const RULESET_VERSION: string;

interface BuildMetadata {
  buildId: string;
  mode: 'local' | 'cloud';
  rulesetHash: string;
  rulesetVersion: string;
}

/**
 * Get build metadata for reports and debugging
 */
declare function getBuildMetadata(): BuildMetadata;