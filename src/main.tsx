import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Simple metrics collector
interface BiasLabMetrics { marks: Array<{ label: string; t: number }>; }
declare global { interface Window { __biasLabMetrics: BiasLabMetrics; } }
window.__biasLabMetrics = { marks: [] };
const mark = (label: string) => {
  window.__biasLabMetrics.marks.push({ label, t: performance.now() });
  if (label === 'app-mounted') {
    console.log('[metrics] timing', window.__biasLabMetrics.marks);
  }
};
mark('entry');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
requestAnimationFrame(()=> mark('app-mounted'));
