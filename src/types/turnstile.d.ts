// Canonical global type for Cloudflare Turnstile widget
export {}

declare global {
  interface Window {
    turnstile?: {
      render: (
        selector: string,
        options: {
          sitekey: string;
          theme?: 'light' | 'dark';
          size?: 'normal' | 'compact';
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
        }
      ) => string | undefined;
      reset: (widgetId?: string | null) => void;
      remove: (widgetId?: string | null) => void;
      getResponse: (widgetId?: string | null) => string | undefined;
    };
  }
}
