import fs from 'fs';
import path from 'path';
import webpush from 'web-push';
import { createAdminClient } from '@/lib/supabase/admin';

// VAPID Configuration
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BMlzKI8nGrboLygwoidtTwbotj7bQ80CO07H8wbfsccqz6EO7KsPv3o3beDHHANNnaEenpmYkzkojGsDJMsikD8';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'VdYl-0JtUtSRiWjW3Sq7ehACThEol7isFspf61v1h7Q';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:destek@otantikosconcept.com';

// Initialize web-push
try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (e) {
  console.warn('[WebPush] setVapidDetails notice:', e);
}

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionRecord {
  id: string;
  endpoint: string;
  keys: PushSubscriptionKeys;
  user_id?: string | null;
  user_agent?: string | null;
  platform?: 'ios' | 'android' | 'desktop' | 'unknown';
  created_at: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
}

export interface NotificationHistoryRecord {
  id: string;
  title: string;
  body: string;
  url?: string;
  sent_count: number;
  failure_count: number;
  created_at: string;
}

// Local Persistent File Fallback
const DATA_DIR = path.join(process.cwd(), '.data');
const SUBS_FILE = path.join(DATA_DIR, 'push_subscriptions.json');
const HISTORY_FILE = path.join(DATA_DIR, 'notification_history.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readLocalSubscriptions(): PushSubscriptionRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(SUBS_FILE)) {
      const raw = fs.readFileSync(SUBS_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[WebPush] Failed to read local subscriptions:', err);
  }
  return [];
}

function writeLocalSubscriptions(subs: PushSubscriptionRecord[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2), 'utf8');
  } catch (err) {
    console.error('[WebPush] Failed to save local subscriptions:', err);
  }
}

function readLocalHistory(): NotificationHistoryRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(HISTORY_FILE)) {
      const raw = fs.readFileSync(HISTORY_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[WebPush] Failed to read notification history:', err);
  }
  return [];
}

function writeLocalHistory(history: NotificationHistoryRecord[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
  } catch (err) {
    console.error('[WebPush] Failed to save notification history:', err);
  }
}

export function detectPlatform(userAgent?: string | null): 'ios' | 'android' | 'desktop' | 'unknown' {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/windows|macintosh|linux/.test(ua)) return 'desktop';
  return 'unknown';
}

export const PushNotificationService = {
  getVapidPublicKey() {
    return VAPID_PUBLIC_KEY;
  },

  async saveSubscription(data: {
    endpoint: string;
    keys: PushSubscriptionKeys;
    user_id?: string | null;
    user_agent?: string | null;
  }): Promise<{ success: boolean; isNew: boolean }> {
    if (!data.endpoint || !data.keys?.p256dh || !data.keys?.auth) {
      throw new Error('Geçersiz Push Subscription formatı.');
    }

    const platform = detectPlatform(data.user_agent);
    const newRecord: PushSubscriptionRecord = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      endpoint: data.endpoint,
      keys: data.keys,
      user_id: data.user_id || null,
      user_agent: data.user_agent || null,
      platform,
      created_at: new Date().toISOString(),
    };

    // 1. Try Supabase cloud table first
    let savedInSupabase = false;
    try {
      const supabaseAdmin = createAdminClient();
      const { error } = await supabaseAdmin.from('push_subscriptions').upsert(
        {
          endpoint: data.endpoint,
          p256dh: data.keys.p256dh,
          auth: data.keys.auth,
          user_id: data.user_id || null,
          user_agent: data.user_agent || null,
          platform,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );
      if (!error) {
        savedInSupabase = true;
      }
    } catch {
      // Supabase table may not be migrated yet
    }

    // 2. Always maintain local file resilience
    const local = readLocalSubscriptions();
    const existingIdx = local.findIndex((s) => s.endpoint === data.endpoint);
    let isNew = false;
    if (existingIdx > -1) {
      local[existingIdx] = {
        ...local[existingIdx],
        keys: data.keys,
        user_id: data.user_id || local[existingIdx].user_id,
        platform,
      };
    } else {
      local.push(newRecord);
      isNew = true;
    }
    writeLocalSubscriptions(local);

    return { success: true, isNew };
  },

  async removeSubscription(endpoint: string): Promise<boolean> {
    if (!endpoint) return false;

    // 1. Try Supabase
    try {
      const supabaseAdmin = createAdminClient();
      await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', endpoint);
    } catch {
      // Ignore
    }

    // 2. Local
    const local = readLocalSubscriptions();
    const filtered = local.filter((s) => s.endpoint !== endpoint);
    writeLocalSubscriptions(filtered);
    return true;
  },

  async getAllSubscriptions(): Promise<PushSubscriptionRecord[]> {
    // Try Supabase first
    try {
      const supabaseAdmin = createAdminClient();
      const { data, error } = await supabaseAdmin.from('push_subscriptions').select('*');
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          endpoint: d.endpoint,
          keys: {
            p256dh: d.p256dh,
            auth: d.auth,
          },
          user_id: d.user_id,
          user_agent: d.user_agent,
          platform: d.platform || detectPlatform(d.user_agent),
          created_at: d.created_at || d.updated_at,
        }));
      }
    } catch {
      // Fallback
    }

    return readLocalSubscriptions();
  },

  async sendBroadcastNotification(payload: PushNotificationPayload): Promise<{
    total: number;
    sent: number;
    failed: number;
    expiredRemoved: number;
  }> {
    const subscriptions = await this.getAllSubscriptions();
    if (subscriptions.length === 0) {
      return { total: 0, sent: 0, failed: 0, expiredRemoved: 0 };
    }

    const notificationData = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/',
      icon: payload.icon || '/icons/icon-192.png',
      badge: payload.badge || '/icons/badge-72.png',
      image: payload.image || undefined,
      tag: payload.tag || `otantikos-${Date.now()}`,
    });

    let sent = 0;
    let failed = 0;
    let expiredRemoved = 0;

    const deadEndpoints: string[] = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
              },
            },
            notificationData,
            {
              TTL: 60 * 60 * 24, // 24 hours
              urgency: 'high',
            }
          );
          sent++;
        } catch (err: any) {
          failed++;
          // HTTP 410 (Gone) or 404 (Not Found) means user uninstalled or revoked permission
          if (err.statusCode === 410 || err.statusCode === 404) {
            deadEndpoints.push(sub.endpoint);
          } else {
            console.warn('[WebPush] Send error for endpoint:', sub.endpoint.slice(0, 35), err.message);
          }
        }
      })
    );

    // Prune dead subscriptions automatically
    if (deadEndpoints.length > 0) {
      for (const ep of deadEndpoints) {
        await this.removeSubscription(ep);
        expiredRemoved++;
      }
    }

    // Save into Notification History
    const historyRecord: NotificationHistoryRecord = {
      id: `notif_${Date.now()}`,
      title: payload.title,
      body: payload.body,
      url: payload.url,
      sent_count: sent,
      failure_count: failed,
      created_at: new Date().toISOString(),
    };
    const history = readLocalHistory();
    history.unshift(historyRecord);
    writeLocalHistory(history.slice(0, 50)); // keep last 50

    return {
      total: subscriptions.length,
      sent,
      failed,
      expiredRemoved,
    };
  },

  async getStats() {
    const subs = await this.getAllSubscriptions();
    const history = readLocalHistory();

    const iosCount = subs.filter((s) => s.platform === 'ios').length;
    const androidCount = subs.filter((s) => s.platform === 'android').length;
    const desktopCount = subs.filter((s) => s.platform === 'desktop').length;

    return {
      totalSubscribers: subs.length,
      iosCount,
      androidCount,
      desktopCount,
      otherCount: subs.length - (iosCount + androidCount + desktopCount),
      history,
    };
  },
};
