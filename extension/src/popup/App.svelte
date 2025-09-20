<script lang="ts">
  import { onMount } from 'svelte';
  import { renderReport } from '@onboarding-audit/report';

  let telemetryOptIn = false;
  let device: 'desktop'|'mobile' = 'desktop';
  let cohort: 'global'|'saas'|'ecommerce'|'content' = 'global';
  let benchmark: { percentile?: number; median?: number; count?: number } | null = null;
  let score: number | null = null;
  let fixes: Array<{id:string; fix:string; weight:number}> = [];

  onMount(async () => {
    const s = await chrome.storage.sync.get({ telemetry_opt_in: false, onbrd_device: 'desktop', onbrd_cohort: 'global' });
    telemetryOptIn = s.telemetry_opt_in;
    device = s.onbrd_device;
    cohort = s.onbrd_cohort;
  });

  function savePrefs() {
    chrome.storage.sync.set({ telemetry_opt_in: telemetryOptIn, onbrd_device: device, onbrd_cohort: cohort });
  }

  function selectDevice(d: string) {
    device = d as 'desktop' | 'mobile';
    savePrefs();
  }

  function selectCohort(c: string) {
    cohort = c as 'global' | 'saas' | 'ecommerce' | 'content';
    savePrefs();
  }

  async function runAudit() {
    const resp = await chrome.runtime.sendMessage({ type: 'ONBRD_RUN_AUDIT_ACTIVE_TAB', device, cohort });
    if (resp?.error) {
      console.error(resp.error);
      return;
    }
    const { audit, benchmark: bmk } = resp ?? {};
    score = audit?.score ?? null;
    fixes = audit?.topFixes ?? [];
    benchmark = telemetryOptIn ? (bmk ?? null) : null;
  }

  function tsStamp(d=new Date()){const p=(n:number)=>n.toString().padStart(2,'0');return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}`;}
  async function exportHtml() {
    const [{ url }] = await chrome.tabs.query({ active: true, currentWindow: true });
    const host = (url || '').replace(/^https?:\/\//,'').replace(/^www\./,'').split(/[/?#]/)[0] || 'site';
    
    // Create a complete audit object for renderReport
    const auditData = {
      id: 'popup-export-' + Date.now(),
      url: url || 'https://example.com',
      timestamp: new Date().toISOString(),
      scores: score ? {
        overall: score,
        h_cta_above_fold: 0,
        h_steps_count: 0,
        h_copy_clarity: 0,
        h_trust_markers: 0,
        h_perceived_signup_speed: 0
      } : {
        overall: 0,
        h_cta_above_fold: 0,
        h_steps_count: 0,
        h_copy_clarity: 0,
        h_trust_markers: 0,
        h_perceived_signup_speed: 0
      },
      heuristics: {
        h_cta_above_fold: { detected: false, position: 0, element: 'div' },
        h_steps_count: { total: 0, forms: 0, screens: 0 },
        h_copy_clarity: { avg_sentence_length: 0, passive_voice_ratio: 0, jargon_density: 0 },
        h_trust_markers: { total: 0, testimonials: 0, security_badges: 0, customer_logos: 0 },
        h_perceived_signup_speed: { estimated_seconds: 0, form_fields: 0, required_fields: 0 }
      },
      recommendations: fixes.map(fix => ({
        heuristic: fix.id,
        priority: 'high' as const,
        description: fix.fix,
        fix: fix.fix
      })),
      benchmark: benchmark || undefined,
      pageHost: host,
      createdAt: new Date().toISOString()
    };
    
    const html = renderReport(auditData);
    const blob = new Blob([html], { type: 'text/html' });
    const fn = `onboarding-audit-${host}-${tsStamp()}.html`;
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = fn; link.click();
  }
</script>

<div class="p-4 w-[360px] text-sm">
  <h1 class="text-xl font-bold mb-2">Onbrd</h1>

  <div class="mb-3 flex items-center gap-2">
    <label class="inline-flex items-center gap-1">
      <input type="checkbox" bind:checked={telemetryOptIn} on:change={savePrefs} />
      <span>Share anonymous benchmarks</span>
    </label>
  </div>

  <div class="mb-3 flex flex-wrap gap-2">
    <div class="text-xs text-gray-500">Device</div>
    {#each ['desktop','mobile'] as d}
      <button class="px-2 py-1 rounded-full border hover:bg-gray-50"
        class:bg-teal-100={device===d}
        on:click={() => selectDevice(d)}>{d}</button>
    {/each}
  </div>

  <div class="mb-4 flex flex-wrap gap-2">
    <div class="text-xs text-gray-500">Cohort</div>
    {#each ['global','saas','ecommerce','content'] as c}
      <button class="px-2 py-1 rounded-full border hover:bg-gray-50"
        class:bg-teal-100={cohort===c}
        on:click={() => selectCohort(c)}>{c}</button>
    {/each}
  </div>

  <div class="flex gap-2 mb-3">
    <button class="flex-1 py-2 rounded-xl bg-teal-500 text-white font-medium" on:click={runAudit}>Run Audit</button>
    <button class="px-3 rounded-xl border" on:click={exportHtml}>Export HTML</button>
  </div>

  {#if score !== null}
    <div class="mb-2 text-lg font-semibold">{score}</div>
    {#if benchmark}
      {#if benchmark.count && benchmark.count >= 200 && benchmark.percentile !== undefined}
        <div class="text-xs text-gray-600">Top {benchmark.percentile}% of {benchmark.count} peers (median {benchmark.median}) • {cohort} • {device}</div>
      {:else}
        <div class="text-xs text-gray-500">Benchmark building…</div>
      {/if}
    {:else}
      <div class="text-xs text-gray-500">Benchmark offline</div>
    {/if}

    <div class="mt-3">
      <div class="text-xs uppercase text-gray-400 mb-1">Fix these to improve</div>
      <ul class="list-disc pl-5 space-y-1">
        {#each fixes.slice(0,3) as f}
          <li><span class="font-medium">{f.id}</span> — {f.fix}</li>
        {/each}
      </ul>
    </div>
  {/if}
</div>