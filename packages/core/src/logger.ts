/* Minimal logger with build-time gate. Prod => only error. */
const DEBUG =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_DEBUG_LOGS === "true") ||
  (typeof process !== "undefined" && process.env?.VITE_DEBUG_LOGS === "true");

export const log = (...args: any[]) => { if (DEBUG) console.log("[OA]", ...args); };
export const info = (...args: any[]) => { if (DEBUG) console.info("[OA]", ...args); };
export const warn = (...args: any[]) => { if (DEBUG) console.warn("[OA]", ...args); };
export const error = (...args: any[]) => { console.error("[OA]", ...args); };

export default { log, info, warn, error };