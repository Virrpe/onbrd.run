<script>
  import { onMount } from 'svelte';
  import { popupLogger as logger } from '../shared/logger';
  
  let status = 'Ready to audit';
  let isLoading = false;
  let error = null;
  let lastAudit = null;
  let showReport = false;
  
  // 5 second timeout for audit
  const AUDIT_TIMEOUT = 5000;
  
  onMount(() => {
    // Initialize popup
    logger.ok('OnboardingAudit.ai popup initialized');
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
      const blob = new Blob([reportHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Extract hostname and format date
      const hostname = new URL(lastAudit.url).hostname.replace(/\./g, '-');
      const dateStr = new Date(lastAudit.timestamp).toISOString().split('T')[0].replace(/-/g, '');
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `onboarding-audit-${hostname}-${dateStr}.html`;
      a.click();
      
      URL.revokeObjectURL(url);
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

<main class="w-80 p-6 bg-white">
  <h1 class="text-xl font-bold text-gray-800 mb-4">OnboardingAudit.ai</h1>
  
  <div class="space-y-3">
    <button
      on:click={handleRunAudit}
      disabled={isLoading}
      class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
    >
      {#if isLoading}
        <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      {/if}
      {isLoading ? 'Running audit...' : 'Run Audit'}
    </button>
    
    {#if showReport}
      <button
        on:click={handleViewReport}
        class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
      >
        View Report
      </button>
    {/if}
    
    <button
      on:click={handleExport}
      disabled={!lastAudit}
      class="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Export JSON
    </button>
    
    <button
      on:click={handleExportHTML}
      disabled={!lastAudit}
      class="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Export HTML
    </button>
  </div>
  
  {#if error}
    <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
      <div class="text-sm text-red-800 font-medium mb-1">Error</div>
      <div class="text-sm text-red-700">{error}</div>
    </div>
  {/if}
  
  <div class="mt-4 text-sm text-gray-600">
    {status}
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
</style>