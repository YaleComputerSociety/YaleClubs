import type { YaleMojiAvatar } from "@/lib/yalemojiTypes";

function isAssetUrl(value: unknown): value is string {
  if (typeof value !== "string" || /["'\\\s]/.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

// Only the backend sends the app key. Browsers receive public asset URLs.
// null means Yalemoji confirmed no avatar; undefined means the lookup was unavailable.
export async function getYaleMojiAvatar(netid: string): Promise<YaleMojiAvatar | null | undefined> {
  const key = process.env.YALEMOJI_API_KEY;
  if (!key || !/^[a-z][a-z0-9]*$/i.test(netid)) return undefined;
  try {
    const origin = new URL(process.env.YALEMOJI_API_URL || "https://www.yalemoji.com");
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
    if (
      origin.username ||
      origin.password ||
      (origin.protocol !== "https:" &&
        !(origin.protocol === "http:" && local && process.env.NODE_ENV === "development"))
    ) {
      throw new Error("Invalid Yalemoji API URL");
    }
    const response = await fetch(new URL(`/api/v1/users/${encodeURIComponent(netid.toLowerCase())}`, origin), {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(3000),
      redirect: "error",
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Yalemoji status ${response.status}`);
    const { avatar } = (await response.json()) as { avatar?: Partial<YaleMojiAvatar> };
    if (
      !avatar ||
      typeof avatar.version !== "number" ||
      !Number.isSafeInteger(avatar.version) ||
      avatar.version < 1 ||
      !isAssetUrl(avatar.png_url) ||
      !isAssetUrl(avatar.svg_url) ||
      !isAssetUrl(avatar.background_url)
    ) {
      throw new Error("Invalid Yalemoji avatar response");
    }
    return {
      version: avatar.version,
      png_url: avatar.png_url,
      svg_url: avatar.svg_url,
      background_url: avatar.background_url,
    };
  } catch {
    // An optional avatar service must not prevent profile or login from working.
    console.warn("[Yalemoji] Avatar lookup unavailable; using the profile icon.");
    return undefined;
  }
}
