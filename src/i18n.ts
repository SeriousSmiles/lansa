import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

// Minimal resources. Expand gradually.
const resources = {
  en: {
    common: {
      navbar: {
        search: 'Search',
        resumeBuilder: 'Resume Builder',
      },
      language: {
        english: 'English',
        papiamentu: 'Papiamentu',
      },
      auth: {
        titleSignup: 'Sign Up',
        titleWelcomeBack: 'Welcome Back',
        subtitleLogin: 'Good to see you again!',
        subtitleSignup: 'Every journey of a thousand steps, started with one!',
        toggleToSignup: 'Need an account? Sign Up',
        toggleToLogin: 'Already have an account? Log In',
      },
    },
  },
  pap: {
    common: {
      navbar: {
        search: 'Buska',
        resumeBuilder: 'Crea Résumé',
      },
      language: {
        english: 'Inglés',
        papiamentu: 'Papiamentu',
      },
      auth: {
        titleSignup: 'Registra',
        titleWelcomeBack: 'Bon bini bèk',
        subtitleLogin: 'Kontentu pa mira bo bèk!',
        subtitleSignup: 'Tur biahe kuminsa ku un solo paso – tuma e paso!',
        toggleToSignup: 'No tin kuenta? Registra',
        toggleToLogin: 'Tin kuenta kaba? Log in',
      },
    },
  },
} as const;

// Local storage cache for AI translations
const LS_PREFIX = 'lansa_translations_v1';
function getCache(lang: string): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(`${LS_PREFIX}:${lang}`) || '{}'); } catch { return {}; }
}
function setCache(lang: string, map: Record<string, string>) {
  localStorage.setItem(`${LS_PREFIX}:${lang}`, JSON.stringify(map));
}

// Initialize i18n
void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('lansa_lang') || 'en',
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    returnNull: false,
  });

// Keep <html lang> in sync
function applyHtmlLang(lng: string) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
}
applyHtmlLang(i18n.language);
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('lansa_lang', lng);
  applyHtmlLang(lng);
});

// Auto-translate missing keys for Papiamentu using Edge Function
// Note: this is best-effort and runs in background; UI falls back to English until ready.
i18n.on('missingKey', async (lng, ns, key) => {
  const lang = Array.isArray(lng) ? lng[0] : lng;
  if (lang !== 'pap') return;
  const base = i18n.getResource('en', ns, key) as string | undefined;
  if (!base || typeof base !== 'string') return;

  // Check cache
  const cache = getCache('pap');
  if (cache[key]) return; // already cached, might arrive via another render

  try {
    const { data, error } = await supabase.functions.invoke('translate-copy', {
      body: { entries: { [key]: base }, targetLang: 'pap' },
    });
    if (!error && data?.translations?.[key]) {
      const translated = String(data.translations[key]);
      i18n.addResource('pap', ns, key, translated);
      setCache('pap', { ...cache, [key]: translated });
    }
  } catch (e) {
    // Silent fail – fallback to English remains
    console.warn('AI translate failed for key', key, e);
  }
});

export default i18n;
