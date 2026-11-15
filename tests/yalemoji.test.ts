import { getYaleMojiAvatar } from "@/lib/yalemoji";

const originalEnv = { ...process.env };
const avatar = {
  version: 3,
  png_url: "https://storage.googleapis.com/assets/opaque/3/avatar.png",
  svg_url: "https://storage.googleapis.com/assets/opaque/3/avatar.svg",
  background_url: "https://storage.googleapis.com/assets/opaque/3/background.svg",
};

function respond(body: unknown, status = 200) {
  process.env.YALEMOJI_API_KEY = "test-server-only-key";
  delete process.env.YALEMOJI_API_URL;
  const fetchMock = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  global.fetch = fetchMock;
  return fetchMock;
}

describe("getYaleMojiAvatar", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it("looks up the signed-in NetID with a server-only bearer key and returns only asset fields", async () => {
    const fetch = respond({ netid: "abc123", avatar: { ...avatar, private_data: "hidden" } });

    await expect(getYaleMojiAvatar("ABC123")).resolves.toEqual(avatar);

    const [url, options] = fetch.mock.calls[0];
    expect(String(url)).toBe("https://www.yalemoji.com/api/v1/users/abc123");
    expect(options?.headers).toEqual({ Authorization: "Bearer test-server-only-key" });
    expect(options?.redirect).toBe("error");
    expect(options?.signal).toBeInstanceOf(AbortSignal);
  });

  it("skips the lookup when the key is missing or the NetID is invalid", async () => {
    const fetch = respond({ avatar });

    await expect(getYaleMojiAvatar("../someone")).resolves.toBeUndefined();
    delete process.env.YALEMOJI_API_KEY;
    await expect(getYaleMojiAvatar("abc123")).resolves.toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("treats a missing avatar as empty and can discover one saved later", async () => {
    const fetch = respond({ error: "not_found" }, 404);

    await expect(getYaleMojiAvatar("abc123")).resolves.toBeNull();
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ avatar }),
    } as Response);
    await expect(getYaleMojiAvatar("abc123")).resolves.toEqual(avatar);
  });

  it("keeps the profile usable when the service fails", async () => {
    const fetch = respond({});
    for (const status of [401, 429, 503]) {
      fetch.mockResolvedValue({
        ok: false,
        status,
        json: async () => ({ error: "unavailable" }),
      } as Response);
      await expect(getYaleMojiAvatar("abc123")).resolves.toBeUndefined();
    }
    fetch.mockRejectedValue(new DOMException("Timed out", "TimeoutError"));
    await expect(getYaleMojiAvatar("abc123")).resolves.toBeUndefined();
  });

  it("rejects malformed avatars and unsafe asset URLs", async () => {
    const fetch = respond({});
    const invalid = [
      null,
      {},
      { ...avatar, version: 0 },
      { ...avatar, png_url: "javascript:alert(1)" },
      { ...avatar, background_url: "http://cdn/background.svg" },
      { ...avatar, png_url: "https://user:pass@cdn.example/avatar.png" },
    ];
    for (const avatar of invalid) {
      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ avatar }),
      } as Response);
      await expect(getYaleMojiAvatar("abc123")).resolves.toBeUndefined();
    }
  });

  it("permits a local Yalemoji server in development and refuses insecure remote endpoints", async () => {
    const fetch = respond({ avatar });
    process.env.NODE_ENV = "development";
    process.env.YALEMOJI_API_URL = "http://localhost:3002";

    await expect(getYaleMojiAvatar("abc123")).resolves.toEqual(avatar);
    expect(String(fetch.mock.calls[0][0])).toBe("http://localhost:3002/api/v1/users/abc123");

    process.env.YALEMOJI_API_URL = "http://yalemoji.com";
    await expect(getYaleMojiAvatar("abc123")).resolves.toBeUndefined();

    process.env.NODE_ENV = "production";
    process.env.YALEMOJI_API_URL = "http://localhost:3002";
    await expect(getYaleMojiAvatar("abc123")).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
