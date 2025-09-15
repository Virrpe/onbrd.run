<script>
  let score = 88; // hard-coded visual sanity
  const topFixes = [
    { id: 'A-CTA-ABOVE-FOLD', fix: 'Move your main signup CTA above the fold.' },
    { id: 'T-SOCIAL-PROOF', fix: 'Add logos/testimonials near the CTA.' },
    { id: 'AC-SIGNUP-FRICTION', fix: 'Ask ≤3 fields in the first step.' }
  ];
</script>

<div class="p-4 space-y-3">
  <div class="card">
    <div class="h1">Onbrd</div>
    <div class="sub">UI sanity (no backend)</div>

    <div class="mt-3 flex items-end gap-3">
      <div class="text-5xl font-bold text-[color:var(--ink-900)]">{score}</div>
      <div class="text-sm text-slate-600 italic">benchmark offline</div>
    </div>

    <div class="mt-4 flex gap-2">
      <button class="btn" id="run">Run Audit</button>
      <button class="btn-secondary" id="export" disabled>Export HTML</button>
    </div>

    <div class="mt-4">
      <div class="text-sm font-medium mb-2">Fix these to improve:</div>
      <ul class="list-disc pl-5 text-sm">
        {#each topFixes as f}
          <li><span class="font-medium">{f.id}</span> — {f.fix}</li>
        {/each}
      </ul>
    </div>
  </div>
</div>