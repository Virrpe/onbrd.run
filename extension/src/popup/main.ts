import './styles.css';            // ← ensures Tailwind CSS is bundled
import App from './App.svelte';

const target = document.getElementById('app');
if (!target) throw new Error('Popup root #app missing');

new App({ target });