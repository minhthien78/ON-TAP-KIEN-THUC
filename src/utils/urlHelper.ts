/**
 * URL and Link Resolver for "HỌC HÓA CÙNG THẦY THIỆN"
 * Resolves the real working app URL for sharing and QR code generation.
 */

export interface ServerConfig {
  appUrl: string;
  sharedUrl: string;
  appletId: string;
}

const DEFAULT_APP_URL = 'https://ais-dev-z5jwqiuhoa4rlqgc6rht27-264778226641.asia-southeast1.run.app';

let cachedServerConfig: ServerConfig | null = null;

export async function fetchServerConfig(): Promise<ServerConfig> {
  if (cachedServerConfig) return cachedServerConfig;
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      cachedServerConfig = await res.json();
      return cachedServerConfig!;
    }
  } catch (err) {
    console.warn('Could not fetch /api/config', err);
  }

  return {
    appUrl: DEFAULT_APP_URL,
    sharedUrl: DEFAULT_APP_URL,
    appletId: '0a2b0a74-9984-4c40-a81d-a7c601cf67ba',
  };
}

/**
 * Returns the active, working base origin for student links.
 * Always resolves to the actual live hostname to ensure links are never broken (never 404).
 */
export function getSafePublicOrigin(config?: ServerConfig | null): string {
  // If running inside browser window, check current origin
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const currentOrigin = window.location.origin.replace(/\/+$/, '');
    
    // If running on a standalone run.app domain, use this exact working origin!
    if (currentOrigin.includes('.run.app') && !currentOrigin.includes('aistudio.google.com')) {
      return currentOrigin;
    }

    // If running on custom domain or non-aistudio origin
    if (!currentOrigin.includes('aistudio.google.com') && !currentOrigin.includes('localhost')) {
      return currentOrigin;
    }
  }

  // Fallback to server reported appUrl
  if (config?.appUrl && !config.appUrl.includes('aistudio.google.com')) {
    return config.appUrl.replace(/\/+$/, '');
  }

  return DEFAULT_APP_URL;
}

/**
 * Builds the student exam URL (locked to Student-Only Mode)
 */
export function getStudentExamLink(code: string, config?: ServerConfig | null): string {
  const base = getSafePublicOrigin(config);
  return `${base}/?code=${encodeURIComponent(code.trim())}&role=student`;
}

/**
 * Builds the general student room portal URL
 */
export function getStudentPortalLink(config?: ServerConfig | null): string {
  const base = getSafePublicOrigin(config);
  return `${base}/?role=student`;
}

/**
 * Returns the developer preview link
 */
export function getDevExamLink(code: string, config?: ServerConfig | null): string {
  const base = config?.appUrl || DEFAULT_APP_URL;
  return `${base.replace(/\/+$/, '')}/?code=${encodeURIComponent(code.trim())}`;
}

/**
 * Returns a QR code image URL for instant scanning on phone/Zalo
 */
export function getExamQrCodeUrl(examUrl: string, size: number = 240): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(examUrl)}&margin=10`;
}
