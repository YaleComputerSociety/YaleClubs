import type { YaleMojiAvatar } from "@/lib/yalemojiTypes";

const STORAGE_KEY = "yaleclubs-yalemoji";
const RETURN_KEY = "yaleclubs-yalemoji-return";
const REFRESH_DELAY_MS = 5000;

type Listener = (avatar: YaleMojiAvatar | null) => void;
type Entry = {
  avatar: YaleMojiAvatar | null;
  confirmed: boolean;
  listeners: Set<Listener>;
  inflight?: Promise<void>;
  cancelDelay?: () => void;
};

// Shared for the document so the header and profile page reuse one lookup.
const entries = new Map<string, Entry>();
let returningFromYaleMoji = false;
let listeningForReturn = false;

function isPublicHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string" || /["'\\\s]/.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isAvatar(value: unknown): value is YaleMojiAvatar {
  if (!value || typeof value !== "object") return false;
  const avatar = value as YaleMojiAvatar;
  return (
    Number.isSafeInteger(avatar.version) &&
    avatar.version >= 1 &&
    [avatar.png_url, avatar.svg_url, avatar.background_url].every(isPublicHttpsUrl)
  );
}

export function yalemojiBackgroundStyle(
  url: string,
  size: number,
):
  | { backgroundImage: string; backgroundSize: string; backgroundPosition: string; backgroundRepeat: string }
  | undefined {
  if (!isPublicHttpsUrl(url)) return undefined;
  return {
    backgroundImage: `url("${url}")`,
    backgroundSize: `${size}px ${size}px`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };
}

function readCachedAvatar(netid: string): YaleMojiAvatar | null {
  try {
    const cached = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    const avatar = cached?.avatar;
    if (cached?.netid !== netid || !avatar || !Number.isSafeInteger(avatar.version) || avatar.version < 1) return null;
    if (![avatar.png_url, avatar.svg_url, avatar.background_url].every(isPublicHttpsUrl)) return null;
    return avatar;
  } catch {
    return null;
  }
}

function refresh(netid: string, entry: Entry): Promise<void> {
  entry.cancelDelay?.();
  if (entry.inflight) return entry.inflight;
  entry.inflight = (async () => {
    try {
      const response = await fetch("/api/yalemoji", { credentials: "include", cache: "no-store" });
      if (!response.ok) return;
      const result = await response.json();
      if (result.netid !== netid || entries.get(netid) !== entry || result.yalemoji === undefined) return;
      if (result.yalemoji !== null && !isAvatar(result.yalemoji)) return;
      entry.avatar = result.yalemoji;
      entry.confirmed = true;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ netid, avatar: entry.avatar }));
      } catch {
        // Keep the in-memory cache when storage is unavailable.
      }
      entry.listeners.forEach((listener) => listener(entry.avatar));
    } catch {
      // Keep the last avatar on network failures.
    } finally {
      entry.inflight = undefined;
    }
  })();
  return entry.inflight;
}

function refreshOnReturn() {
  if (document.visibilityState === "hidden") return;
  const activeEntries = Array.from(entries).filter(([, entry]) => entry.listeners.size > 0);
  if (!activeEntries.length) return;
  try {
    returningFromYaleMoji ||= window.sessionStorage.getItem(RETURN_KEY) === "true";
  } catch {
    // The in-memory flag still works without storage.
  }
  if (!returningFromYaleMoji) return;
  returningFromYaleMoji = false;
  try {
    window.sessionStorage.removeItem(RETURN_KEY);
  } catch {
    // Storage may be disabled.
  }
  activeEntries.forEach(([netid, entry]) => void refresh(netid, entry));
}

export function markYaleMojiVisit() {
  returningFromYaleMoji = true;
  entries.forEach((entry) => {
    // A visit invalidates a previous "no avatar" result until the next successful response.
    entry.confirmed = false;
    entry.listeners.forEach((listener) => listener(entry.avatar));
  });
  try {
    window.sessionStorage.setItem(RETURN_KEY, "true");
  } catch {
    // The in-memory flag covers this tab.
  }
}

export function clearYaleMojiCache() {
  entries.forEach((entry) => entry.cancelDelay?.());
  entries.clear();
  returningFromYaleMoji = false;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(RETURN_KEY);
  } catch {
    // Storage may be disabled.
  }
}

export function subscribeYaleMoji(netid: string, listener: Listener): () => void {
  if (!listeningForReturn) {
    window.addEventListener("focus", refreshOnReturn);
    window.addEventListener("pageshow", refreshOnReturn);
    document.addEventListener("visibilitychange", refreshOnReturn);
    listeningForReturn = true;
  }
  let entry = entries.get(netid);
  const isNew = !entry;
  if (!entry) {
    entry = { avatar: readCachedAvatar(netid), confirmed: false, listeners: new Set() };
    entries.set(netid, entry);
  }
  const current = entry;
  current.listeners.add(listener);
  listener(current.avatar);
  refreshOnReturn();
  if (isNew && !current.inflight) {
    if (current.avatar) {
      let timer: ReturnType<typeof setTimeout>;
      const schedule = () => {
        const navigation =
          typeof performance.getEntriesByType === "function"
            ? (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)
            : undefined;
        const elapsed = navigation?.loadEventEnd ? performance.now() - navigation.loadEventEnd : 0;
        timer = setTimeout(() => void refresh(netid, current), Math.max(0, REFRESH_DELAY_MS - elapsed));
      };
      current.cancelDelay = () => {
        clearTimeout(timer);
        window.removeEventListener("load", schedule);
      };
      if (document.readyState === "complete") schedule();
      else window.addEventListener("load", schedule, { once: true });
    } else {
      void refresh(netid, current);
    }
  }
  return () => {
    current.listeners.delete(listener);
  };
}

export function subscribeYaleMojiBanner(netid: string, listener: (visible: boolean) => void): () => void {
  const notify = () => {
    const entry = entries.get(netid);
    listener(!!entry?.confirmed && entry.avatar === null);
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    const avatar = readCachedAvatar(netid);
    const entry = entries.get(netid);
    if (avatar && entry) {
      entry.avatar = avatar;
      entry.listeners.forEach((item) => item(avatar));
    }
  };
  window.addEventListener("storage", onStorage);
  const unsubscribe = subscribeYaleMoji(netid, notify);
  return () => {
    unsubscribe();
    window.removeEventListener("storage", onStorage);
  };
}
