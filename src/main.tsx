import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;

import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/animations.css'
import './styles/onboarding-toasts.css'
import './styles/mobile-fixes.css'
import './i18n'
import { scrubTokensFromUrl } from './config/demo'
import './utils/legacyScriptGuards'

// Scrub tokens from URL with delay to allow OAuth processing
scrubTokensFromUrl(false);

// Ensure React is globally available
if (!window.React) {
  window.React = React;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
