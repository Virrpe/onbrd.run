export async function probeLCP(timeoutMs = 5000): Promise<boolean> {
  if (!('PerformanceObserver' in window)) return false;
  return await new Promise<boolean>((resolve) => {
    let done = false;
    const to = setTimeout(() => { if (!done) { done = true; resolve(false); } }, timeoutMs);
    try {
      const entries: PerformanceEntry[] = [];
      const obs = new PerformanceObserver((list) => { entries.push(...list.getEntries()); });
      obs.observe({ type: 'largest-contentful-paint', buffered: true });
      requestIdleCallback(() => {
        obs.disconnect(); clearTimeout(to);
        const lcp = (entries as any[]).sort((a,b)=> (a.startTime||0)-(b.startTime||0)).pop();
        resolve(!!lcp && lcp.startTime <= 2500);
      });
    } catch { clearTimeout(to); resolve(false); }
  });
}