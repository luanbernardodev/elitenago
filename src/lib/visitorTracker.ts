import { supabase, DatabaseSiteVisit } from './supabase';

const VISITOR_ID_KEY = 'en_visitor_id';
const SESSION_TRACKED_KEY = 'en_session_visited_at';
const THROTTLE_MINUTES = 30; // Record new session if last track was > 30 minutes ago

function getOrCreateVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = 'vis_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return 'vis_anonymous_' + Math.random().toString(36).substring(2, 8);
  }
}

function detectDevice(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent || '';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/Edg\//i.test(ua)) return 'Microsoft Edge';
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return 'Opera';
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return 'Google Chrome';
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return 'Apple Safari';
  if (/Firefox\//i.test(ua)) return 'Mozilla Firefox';
  return 'Outro Navegador';
}

function detectOS(): string {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Mac OS/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Outro SO';
}

interface GeoResult {
  city?: string;
  region?: string;
  region_code?: string;
  country?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
}

async function fetchGeoLocation(): Promise<GeoResult> {
  // Provider 1: ipwho.is (fast, CORS-friendly, free)
  try {
    const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      if (data.success !== false) {
        return {
          city: data.city || undefined,
          region: data.region || undefined,
          region_code: data.region_code || undefined,
          country: data.country || 'Brasil',
          country_code: data.country_code || 'BR',
          latitude: typeof data.latitude === 'number' ? data.latitude : undefined,
          longitude: typeof data.longitude === 'number' ? data.longitude : undefined,
        };
      }
    }
  } catch {
    // Fallback to next provider
  }

  // Provider 2: geojs.io
  try {
    const res = await fetch('https://get.geojs.io/v1/ip/geo.json', { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      return {
        city: data.city || undefined,
        region: data.region || undefined,
        country: data.country || 'Brasil',
        country_code: data.country_code || 'BR',
        latitude: data.latitude ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude) : undefined,
      };
    }
  } catch {
    // Fallback
  }

  // Provider 3: ipapi.co
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      return {
        city: data.city || undefined,
        region: data.region || undefined,
        region_code: data.region_code || undefined,
        country: data.country_name || 'Brasil',
        country_code: data.country_code || 'BR',
        latitude: typeof data.latitude === 'number' ? data.latitude : undefined,
        longitude: typeof data.longitude === 'number' ? data.longitude : undefined,
      };
    }
  } catch {
    // Adblockers or offline
  }

  return {
    city: 'Local Desconhecido',
    region: 'Brasil',
    country: 'Brasil',
    country_code: 'BR',
  };
}

export async function trackSiteVisit(): Promise<DatabaseSiteVisit | null> {
  try {
    // Throttle check per session
    const lastTracked = sessionStorage.getItem(SESSION_TRACKED_KEY);
    const now = Date.now();

    if (lastTracked) {
      const diffMinutes = (now - parseInt(lastTracked, 10)) / (1000 * 60);
      if (diffMinutes < THROTTLE_MINUTES) {
        return null; // Already tracked recently in this session
      }
    }

    const visitorId = getOrCreateVisitorId();
    const device = detectDevice();
    const browser = detectBrowser();
    const os = detectOS();
    const referrer = document.referrer ? new URL(document.referrer).hostname : 'Acesso Direto';
    const pagePath = window.location.pathname + window.location.search + window.location.hash;

    // Fetch Geo async
    const geo = await fetchGeoLocation();

    const visitPayload = {
      visitor_id: visitorId,
      city: geo.city || 'Desconhecido',
      region: geo.region || geo.region_code || 'MG',
      region_code: geo.region_code || 'MG',
      country: geo.country || 'Brasil',
      country_code: geo.country_code || 'BR',
      latitude: geo.latitude || null,
      longitude: geo.longitude || null,
      device_type: device,
      browser: browser,
      os: os,
      referrer: referrer,
      page_path: pagePath || '/',
      user_agent: navigator.userAgent.substring(0, 255),
    };

    const { data, error } = await supabase
      .from('site_visits')
      .insert([visitPayload])
      .select()
      .single();

    if (!error) {
      sessionStorage.setItem(SESSION_TRACKED_KEY, now.toString());
      return data;
    } else {
      console.warn('Erro ao registrar visita:', error.message);
      return null;
    }
  } catch (err) {
    console.warn('Erro no tracking de visita:', err);
    return null;
  }
}
