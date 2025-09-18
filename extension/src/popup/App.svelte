<script>
  import { renderReport } from '@onboarding-audit/report';
  
  let score = 88; // hard-coded visual sanity
  let audit = null; // audit data
  let benchmark = null; // benchmark data
  let telemetryOptIn = false; // telemetry opt-in status
  const topFixes = [
    { id: 'A-CTA-ABOVE-FOLD', fix: 'Move your main signup CTA above the fold.', tags: ['UX', 'Conversion'] },
    { id: 'T-SOCIAL-PROOF', fix: 'Add logos/testimonials near the CTA.', tags: ['Trust'] },
    { id: 'AC-SIGNUP-FRICTION', fix: 'Ask ≤3 fields in the first step.', tags: ['UX', 'Form'] }
  ];

  // helper
  function tsStamp(d = new Date()) {
    const pad = (n) => String(n).padStart(2, "0");
    return (
      d.getFullYear() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      pad(d.getHours()) +
      pad(d.getMinutes())
    );
  }

  async function getActiveTabId() {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const id = tabs?.[0]?.id;
        if (id != null) return resolve(id);
        reject(new Error("No active tab"));
      });
    });
  }

  async function injectFromPopup(tabId) {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["assets/content.js"],
    });
  }

  async function askContentToRun(tabId) {
    return new Promise((resolve) => {
      try {
        chrome.tabs.sendMessage(tabId, { type: "ONBRD_RUN_AUDIT" }, (resp) => resolve(resp));
      } catch (e) {
        resolve({ error: e.message });
      }
    });
  }

  async function runAudit() {
    try {
      const tabId = await getActiveTabId();

      // 1) Try service worker path first
      const swResp = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "ONBRD_RUN_AUDIT_ACTIVE_TAB" }, (resp) => resolve(resp));
      });

      if (swResp && swResp.audit) {
        audit = swResp.audit;
        benchmark = swResp.benchmark ?? null;
        return;
      }

      // 2) Fallback: inject from popup, then ask content to run
      await injectFromPopup(tabId);
      const resp = await askContentToRun(tabId);

      if (resp && resp.audit) {
        audit = resp.audit;
        benchmark = resp.benchmark ?? null;
      } else {
        console.error("Run audit failed", resp || chrome.runtime.lastError);
        alert("Onbrd: failed to run audit on this page.");
      }
    } catch (err) {
      console.error("runAudit error", err, chrome.runtime.lastError);
      alert("Onbrd: no active tab or injection blocked.");
    }
  }

  function exportHtml() {
    // inside your export handler
    const host =
      (location.hostname || "local")
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .trim() || "local";

    const filename = `onboarding-audit-${host}-${tsStamp()}.html`;

    // existing code continues…
    const html = renderReport(audit); // already implemented
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }
</script>

<div class="p-4 space-y-4">
  <div class="card">
    <div class="flex justify-between items-start">
      <div>
        <div class="h1">Onbrd</div>
        <div class="sub">Onboarding Audit AI</div>
      </div>
      <div class="text-right">
        <div class="text-5xl font-bold text-[color:var(--ink-900)]">{score}</div>
        <div class="text-sm text-slate-600">
          {#if benchmark}
            vs. benchmark {benchmark}
          {:else}
            benchmark offline
          {/if}
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2 mb-3">
      <button type="button" class="btn flex-1" on:click={runAudit}>Run Audit</button>
      <button
        type="button"
        class="btn-secondary flex-1"
        disabled={!audit}
        on:click={exportHtml}
      >
        Export HTML
      </button>
    </div>

    <div class="mt-4 pt-4 border-t border-slate-200">
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" bind:checked={telemetryOptIn} />
        <span>Opt-in to telemetry to improve Onbrd</span>
      </label>
    </div>
  </div>

  <div class="card">
    <div class="text-sm font-medium mb-3">Top recommendations:</div>
    <ul class="space-y-3">
      {#each topFixes as f}
        <li class="text-sm">
          <div class="font-medium">{f.fix}</div>
          {#if f.tags}
            <div class="mt-1 flex flex-wrap gap-1">
              {#each f.tags as tag}
                <span class="tag {tag === 'UX' ? 'alt' : ''}">{tag}</span>
              {/each}
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
</div>