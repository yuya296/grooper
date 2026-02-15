/**
 * Minimal chrome.* API polyfill for local development.
 * Only activated when the real chrome.storage API is absent (i.e. localhost preview).
 */

type StorageChangeCallback = (
    changes: Record<string, { newValue?: unknown; oldValue?: unknown }>,
    areaName: string
) => void;

const memoryStore: Record<string, unknown> = {};
const listeners: StorageChangeCallback[] = [];

function ensureChromePolyfill() {
    if (
        typeof chrome !== 'undefined' &&
        chrome.storage &&
        typeof chrome.storage.local?.get === 'function'
    ) {
        return; // real Chrome API exists
    }

    const storageArea = {
        get(keys: string | string[] | Record<string, unknown>) {
            return new Promise<Record<string, unknown>>((resolve) => {
                if (typeof keys === 'string') {
                    resolve({ [keys]: memoryStore[keys] });
                } else if (Array.isArray(keys)) {
                    const result: Record<string, unknown> = {};
                    for (const k of keys) result[k] = memoryStore[k];
                    resolve(result);
                } else {
                    const result: Record<string, unknown> = {};
                    for (const k of Object.keys(keys)) {
                        result[k] = memoryStore[k] ?? keys[k];
                    }
                    resolve(result);
                }
            });
        },
        set(items: Record<string, unknown>) {
            return new Promise<void>((resolve) => {
                const changes: Record<string, { newValue?: unknown; oldValue?: unknown }> = {};
                for (const [k, v] of Object.entries(items)) {
                    changes[k] = { oldValue: memoryStore[k], newValue: v };
                    memoryStore[k] = v;
                }
                for (const cb of listeners) {
                    try { cb(changes, 'local'); } catch { /* ignore */ }
                }
                resolve();
            });
        },
        remove(keys: string | string[]) {
            return new Promise<void>((resolve) => {
                const arr = typeof keys === 'string' ? [keys] : keys;
                for (const k of arr) delete memoryStore[k];
                resolve();
            });
        }
    };

    const g = globalThis as any;

    if (!g.chrome) g.chrome = {};
    if (!g.chrome.storage) {
        g.chrome.storage = {
            local: storageArea,
            onChanged: {
                addListener(cb: StorageChangeCallback) { listeners.push(cb); },
                removeListener(cb: StorageChangeCallback) {
                    const idx = listeners.indexOf(cb);
                    if (idx >= 0) listeners.splice(idx, 1);
                }
            }
        };
    }

    if (!g.chrome.runtime) {
        g.chrome.runtime = {
            lastError: null,
            sendMessage(_msg: unknown, cb?: (response: unknown) => void) {
                if (cb) cb({ ok: true });
            },
            openOptionsPage() {
                window.open('options.html');
            }
        };
    }

    if (!g.chrome.i18n) {
        g.chrome.i18n = {
            getUILanguage() {
                return navigator.language;
            }
        };
    }
}

ensureChromePolyfill();
