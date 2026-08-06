import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void; 'expired-callback'?: () => void }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onToken: (token: string) => void;
}

/**
 * Cloudflare Turnstile — invisible/low-friction CAPTCHA that stops scripted
 * mass-submission (the "miles de envíos" bot scenario) without a token-cost
 * challenge for real users. Site key comes from VITE_TURNSTILE_SITE_KEY.
 */
export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({ onToken }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  useEffect(() => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
    if (!siteKey) {
      // eslint-disable-next-line no-console
      console.warn('VITE_TURNSTILE_SITE_KEY not set — anti-bot widget disabled.');
      return;
    }

    let cancelled = false;

    const tryRender = () => {
      if (cancelled || !containerRef.current) return;
      if (!window.turnstile) {
        setTimeout(tryRender, 200);
        return;
      }
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onToken,
        'expired-callback': () => onToken(''),
      });
    };
    tryRender();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="cf-turnstile" />;
};
