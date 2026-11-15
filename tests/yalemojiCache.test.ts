import {
  clearYaleMojiCache,
  markYaleMojiVisit,
  subscribeYaleMoji,
  subscribeYaleMojiBanner,
} from "@/lib/yalemojiCache";

const avatar = {
  version: 3,
  png_url: "https://storage.googleapis.com/assets/opaque/3/avatar.png",
  svg_url: "https://storage.googleapis.com/assets/opaque/3/avatar.svg",
  background_url: "https://storage.googleapis.com/assets/opaque/3/background.svg",
};

function jsonResponse(body: unknown, ok = true) {
  return { ok, status: ok ? 200 : 503, json: async () => body } as Response;
}

async function settle() {
  for (let i = 0; i < 6; i += 1) await Promise.resolve();
}

describe("yalemoji cache", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    clearYaleMojiCache();
    fetchMock = jest.fn().mockResolvedValue(jsonResponse({ netid: "abc123", yalemoji: avatar }));
    global.fetch = fetchMock;
  });

  afterEach(() => {
    clearYaleMojiCache();
    jest.useRealTimers();
  });

  it("fetches the signed-in avatar and remembers it", async () => {
    const listener = jest.fn();
    subscribeYaleMoji("abc123", listener);

    expect(listener).toHaveBeenCalledWith(null);
    await settle();

    expect(fetchMock).toHaveBeenCalledWith("/api/yalemoji", { credentials: "include", cache: "no-store" });
    expect(listener).toHaveBeenLastCalledWith(avatar);
    expect(JSON.parse(localStorage.getItem("yaleclubs-yalemoji") || "null")).toEqual({
      netid: "abc123",
      avatar,
    });
  });

  it("shows the create prompt only after Yalemoji confirms there is no avatar", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ netid: "abc123", yalemoji: null }));
    const prompt = jest.fn();
    subscribeYaleMojiBanner("abc123", prompt);

    expect(prompt).toHaveBeenCalledWith(false);
    await settle();
    expect(prompt).toHaveBeenLastCalledWith(true);
  });

  it("keeps the last avatar when the lookup is unavailable", async () => {
    localStorage.setItem("yaleclubs-yalemoji", JSON.stringify({ netid: "abc123", avatar }));
    jest.useFakeTimers();
    fetchMock.mockResolvedValue(jsonResponse({ error: "unavailable" }, false));
    const listener = jest.fn();
    subscribeYaleMoji("abc123", listener);

    expect(listener).toHaveBeenCalledWith(avatar);
    await jest.advanceTimersByTimeAsync(5000);
    expect(listener).toHaveBeenLastCalledWith(avatar);
  });

  it("ignores a poisoned cache entry and an unsafe API payload", async () => {
    localStorage.setItem(
      "yaleclubs-yalemoji",
      JSON.stringify({ netid: "abc123", avatar: { ...avatar, png_url: "javascript:alert(1)" } }),
    );
    fetchMock.mockResolvedValue(
      jsonResponse({ netid: "abc123", yalemoji: { ...avatar, background_url: "http://cdn/background.svg" } }),
    );
    const listener = jest.fn();
    subscribeYaleMoji("abc123", listener);
    await settle();

    expect(listener).toHaveBeenLastCalledWith(null);
    expect(localStorage.getItem("yaleclubs-yalemoji")).toContain("javascript:");
  });

  it("refreshes after a return from yalemoji.com", async () => {
    const listener = jest.fn();
    subscribeYaleMoji("abc123", listener);
    await settle();
    fetchMock.mockClear();
    fetchMock.mockResolvedValue(
      jsonResponse({
        netid: "abc123",
        yalemoji: { ...avatar, version: 4, png_url: "https://storage.googleapis.com/assets/opaque/4/avatar.png" },
      }),
    );

    markYaleMojiVisit();
    window.dispatchEvent(new Event("focus"));
    await settle();

    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ png_url: "https://storage.googleapis.com/assets/opaque/4/avatar.png" }),
    );
  });

  it("clears the saved avatar on logout", () => {
    localStorage.setItem("yaleclubs-yalemoji", JSON.stringify({ netid: "abc123", avatar }));
    clearYaleMojiCache();
    expect(localStorage.getItem("yaleclubs-yalemoji")).toBeNull();
  });
});
