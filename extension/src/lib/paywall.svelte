<script lang="ts">
  export let variant: 'benchmarks' | 'compliance' = 'benchmarks';
  export let onClose: () => void;
  export let onCheckout: () => void;
</script>

<svelte:options tag={null} />

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold">
        {variant === 'benchmarks' ? 'Export Benchmarks' : 'Generate Evidence Pack'}
      </h2>
      <button 
        on:click={onClose}
        class="text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <div class="mb-4">
      <p class="text-gray-600 mb-4">
        {variant === 'benchmarks' 
          ? 'Export detailed benchmark data to CSV format for analysis and reporting.' 
          : 'Generate a comprehensive evidence pack with detailed audit results and recommendations.'}
      </p>
      
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div class="flex items-center mb-2">
          <svg class="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <span class="font-medium text-blue-900">Pro Feature</span>
        </div>
        <p class="text-sm text-blue-800">
          This feature requires a paid subscription. Subscribe now to unlock advanced analytics and reporting capabilities.
        </p>
      </div>
    </div>
    
    <div class="flex gap-3">
      <button 
        on:click={onCheckout}
        class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Subscribe Now
      </button>
      <button 
        on:click={onClose}
        class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        Cancel
      </button>
    </div>
  </div>
</div>

<style>
  :global(.fixed) {
    position: fixed;
  }
  :global(.inset-0) {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
  :global(.bg-black) {
    background-color: #000;
  }
  :global(.bg-opacity-50) {
    background-color: rgba(0, 0, 0, 0.5);
  }
  :global(.flex) {
    display: flex;
  }
  :global(.items-center) {
    align-items: center;
  }
  :global(.justify-center) {
    justify-content: center;
  }
  :global(.z-50) {
    z-index: 50;
  }
  :global(.bg-white) {
    background-color: #fff;
  }
  :global(.rounded-lg) {
    border-radius: 0.5rem;
  }
  :global(.p-6) {
    padding: 1.5rem;
  }
  :global(.max-w-md) {
    max-width: 28rem;
  }
  :global(.w-full) {
    width: 100%;
  }
  :global(.mx-4) {
    margin-left: 1rem;
    margin-right: 1rem;
  }
  :global(.justify-between) {
    justify-content: space-between;
  }
  :global(.mb-4) {
    margin-bottom: 1rem;
  }
  :global(.text-lg) {
    font-size: 1.125rem;
  }
  :global(.font-semibold) {
    font-weight: 600;
  }
  :global(.text-gray-400) {
    color: #9ca3af;
  }
  :global(.hover\:text-gray-600:hover) {
    color: #4b5563;
  }
  :global(.text-gray-600) {
    color: #4b5563;
  }
  :global(.mb-2) {
    margin-bottom: 0.5rem;
  }
  :global(.bg-blue-50) {
    background-color: #eff6ff;
  }
  :global(.border) {
    border-width: 1px;
  }
  :global(.border-blue-200) {
    border-color: #bfdbfe;
  }
  :global(.p-4) {
    padding: 1rem;
  }
  :global(.w-5) {
    width: 1.25rem;
  }
  :global(.h-5) {
    height: 1.25rem;
  }
  :global(.text-blue-600) {
    color: #2563eb;
  }
  :global(.mr-2) {
    margin-right: 0.5rem;
  }
  :global(.font-medium) {
    font-weight: 500;
  }
  :global(.text-blue-900) {
    color: #1e3a8a;
  }
  :global(.text-sm) {
    font-size: 0.875rem;
  }
  :global(.text-blue-800) {
    color: #1e40af;
  }
  :global(.gap-3) {
    gap: 0.75rem;
  }
  :global(.flex-1) {
    flex: 1 1 0%;
  }
  :global(.bg-blue-600) {
    background-color: #2563eb;
  }
  :global(.text-white) {
    color: #fff;
  }
  :global(.px-4) {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  :global(.py-2) {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  :global(.rounded-lg) {
    border-radius: 0.5rem;
  }
  :global(.hover\:bg-blue-700:hover) {
    background-color: #1d4ed8;
  }
  :global(.transition-colors) {
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
  :global(.text-gray-600) {
    color: #4b5563;
  }
  :global(.hover\:text-gray-800:hover) {
    color: #1f2937;
  }
</style>