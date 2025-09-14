<script>
  import { onMount } from 'svelte';
  import { popupLogger as logger } from '../shared/logger';
  import { renderReport } from '@onboarding-audit/report';
  
  let status = 'Ready to audit';
  let isLoading = false;
  let error = null;
  let lastAudit = null;
  let showReport = false;
  let version = '';
  
  // 5 second timeout for audit
  const AUDIT_TIMEOUT = 5000;

  // Download helper function
  function downloadHTML(filename, html) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
  }
  
  onMount(() => {
    // Initialize popup
    logger.ok('Onbrd popup initialized');
    
    // Get version from manifest
    try {
      const manifest = chrome.runtime.getManifest();
      version = manifest.version;
    } catch (err) {
      logger.error('Failed to get version from manifest:', err);
      version = '1.0.0'; // fallback version
    }
  });
  
  async function handleRunAudit() {
    // Clear any previous error state
    error = null;
    isLoading = true;
    status = 'Running audit...';
    
    logger.start('Starting audit process');
    
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Audit timeout - please try refreshing the page and running again')), AUDIT_TIMEOUT);
      });
      
      // Create audit promise
      const auditPromise = chrome.runtime.sendMessage({ type: 'RUN_AUDIT' });
      
      // Race between audit and timeout
      const response = await Promise.race([auditPromise, timeoutPromise]);
      
      if (response?.success && response?.data) {
        // Audit completed successfully
        logger.ok('Audit completed successfully');
        handleAuditResult(response.data);
      } else {
        // Audit failed
        const errorMessage = response?.error || 'Audit failed';
        logger.error(`Audit failed: ${errorMessage}`);
        throw new Error(errorMessage);
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Unknown error occurred';
      logger.error(`Audit error: ${errorMessage}`);
      
      // Set friendly error message
      if (errorMessage.includes('timeout')) {
        error = 'Audit timed out. Please refresh the page and try again.';
      } else if (errorMessage.includes('Extension context invalidated')) {
        error = 'Extension needs to be reloaded. Please refresh the page and try again.';
      } else {
        error = `Audit failed: ${errorMessage}. Please refresh the page and try again.`;
      }
      
      status = 'Ready to audit';
      isLoading = false;
    }
  }
  
  function handleAuditResult(auditData) {
    logger.ok(`Audit result received: ${JSON.stringify(auditData)}`);
    lastAudit = auditData;
    status = `Audit complete! Score: ${auditData.scores.overall}/100`;
    isLoading = false;
    showReport = true;
    
    // Make audit data available on window for testing
    if (typeof window !== 'undefined') {
      window.lastAudit = auditData;
    }
  }
  
  function handleViewReport() {
    if (!lastAudit) return;
    
    // Generate HTML report and open in new tab
    const reportHtml = generateReportHTML(lastAudit);
    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    chrome.tabs.create({ url });
  }
  
  function handleExport() {
    if (!lastAudit) {
      status = 'No audit data to export';
      return;
    }
    
    // Export as JSON
    const jsonData = JSON.stringify(lastAudit, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `onboarding-audit-${lastAudit.id}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    status = 'Audit exported successfully';
  }

  function handleExportHTML() {
    if (!lastAudit) {
      status = 'No audit data to export';
      return;
    }
    
    try {
      // Use the report package to generate HTML
      const reportHtml = generateReportHTML(lastAudit);
      
      // Extract hostname and format date for filename
      const hostname = new URL(lastAudit.url).hostname.replace(/\./g, '-');
      const dateStr = new Date(lastAudit.timestamp).toISOString().slice(0,16).replace(/[:T]/g,'');
      
      // Generate filename
      const filename = `onboarding-audit-${hostname}-${dateStr}.html`;
      
      // Download the HTML
      downloadHTML(filename, reportHtml);
      
      status = 'HTML report exported successfully';
    } catch (error) {
      status = `Error exporting HTML: ${error.message}`;
    }
  }
  
  function generateReportHTML(audit) {
    // Use the proper report package function
    return renderReport(audit);
  }
</script>

<div class="card">
  <h1 class="text-base font-semibold mb-2">Onbrd</h1>
  
  {#if lastAudit}
    <div class="mb-3 text-sm text-gray-600">
      Score: {lastAudit.scores.overall}/100
    </div>
  {/if}
  
  <div class="space-y-2">
    <button
      id="run"
      on:click={handleRunAudit}
      disabled={isLoading}
      class="btn w-full"
    >
      {isLoading ? 'Running audit...' : 'Run Audit'}
    </button>
    
    <button
      id="export"
      on:click={handleExportHTML}
      disabled={!lastAudit}
      class="btn-secondary w-full"
    >
      Export HTML
    </button>
  </div>
  
  {#if error}
    <div class="mt-3 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
      {error}
    </div>
  {/if}
  
  <div class="mt-3 text-xs text-gray-500">
    {status}
  </div>
  
  {#if showReport}
    <div class="mt-3 text-sm text-green-600">
      Audit complete!
    </div>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
</style>