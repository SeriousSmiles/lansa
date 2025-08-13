import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const isPap = i18n.language === 'pap';

  const toggle = () => {
    const next = isPap ? 'en' : 'pap';
    i18n.changeLanguage(next);
  };

  return (
    <div className="flex items-center gap-2" aria-label="Language selector">
      <Button variant="ghost" size="sm" onClick={toggle} title={isPap ? t('language.english') : t('language.papiamentu')} aria-label={isPap ? t('language.english') : t('language.papiamentu')}>
        {isPap ? '🇨🇼' : '🇺🇸'}
      </Button>
    </div>
  );
}
