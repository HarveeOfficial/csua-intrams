const host = location.hostname;
const isLocalHost = location.port === '4200'
  || host === 'localhost'
  || host === '127.0.0.1'
  || host.endsWith('.test');

export const API_BASE_URL = isLocalHost
  ? '/api'
  : 'https://api.intrams.csuaparri.net/api';

export function isApiRequest(url: string): boolean {
  return url.startsWith('/api') || url.startsWith('https://api.intrams.csuaparri.net/api');
}

// Public reCAPTCHA v2 site key (safe to expose client-side).
// Google's shared testing key always passes and is allow-listed for every domain
// (including localhost), so local dev doesn't need the production domain allow-list.
export const RECAPTCHA_SITE_KEY = isLocalHost
  ? '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
  : '6LeYLKYtAAAAACK1Xy06dDhlpxECEnpX1vgSjx36';