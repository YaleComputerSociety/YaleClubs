import {
  casSignInHref,
  isLocalDevHostname,
  resolveDevLoginIdentity,
  resolveDevLoginRedirect,
} from "../src/lib/devLogin";

describe("resolveDevLoginRedirect", () => {
  it("stays on the local origin when no redirect is provided", () => {
    expect(
      resolveDevLoginRedirect({
        redirectParam: null,
        requestOrigin: "http://localhost:3000",
        baseUrl: "https://yaleclubs.io",
      }),
    ).toBe("http://localhost:3000/");
  });

  it("keeps the port of the dev server that handled the request", () => {
    expect(
      resolveDevLoginRedirect({
        redirectParam: null,
        requestOrigin: "http://127.0.0.1:3001",
        baseUrl: "http://localhost:3000",
      }),
    ).toBe("http://127.0.0.1:3001/");
  });

  it("accepts a same-app path", () => {
    expect(
      resolveDevLoginRedirect({
        redirectParam: "/Events",
        requestOrigin: "http://localhost:3000",
      }),
    ).toBe("http://localhost:3000/Events");
  });

  it("accepts another localhost URL", () => {
    expect(
      resolveDevLoginRedirect({
        redirectParam: "http://localhost:3000/Profile",
        requestOrigin: "http://127.0.0.1:3000",
        baseUrl: "https://yaleclubs.io",
      }),
    ).toBe("http://localhost:3000/Profile");
  });

  it("rejects an off-site redirect", () => {
    expect(
      resolveDevLoginRedirect({
        redirectParam: "https://evil.example/phish",
        requestOrigin: "http://localhost:3000",
        baseUrl: "http://localhost:3000",
      }),
    ).toBe("http://localhost:3000/");
  });

  it("rejects protocol-relative and backslash redirects", () => {
    expect(
      resolveDevLoginRedirect({
        redirectParam: "//evil.example",
        requestOrigin: "http://localhost:3000",
      }),
    ).toBe("http://localhost:3000/");
    expect(
      resolveDevLoginRedirect({
        redirectParam: "/\\evil.example",
        requestOrigin: "http://localhost:3000",
      }),
    ).toBe("http://localhost:3000/");
  });
});

describe("resolveDevLoginIdentity", () => {
  it("uses a local dev user when nothing is configured", () => {
    expect(resolveDevLoginIdentity({})).toEqual({
      netid: "devuser",
      email: "devuser@yale.edu",
      role: "user",
    });
  });

  it("prefers the request over the environment for netid and email", () => {
    expect(
      resolveDevLoginIdentity({
        netid: "abc12",
        email: "abc12@yale.edu",
        envNetid: "devuser",
        envEmail: "devuser@yale.edu",
        envRole: "user",
      }),
    ).toEqual({
      netid: "abc12",
      email: "abc12@yale.edu",
      role: "user",
    });
  });

  it("does not let the request choose a role", () => {
    const identity = resolveDevLoginIdentity({
      netid: "abc12",
      role: "admin",
    } as Parameters<typeof resolveDevLoginIdentity>[0] & { role: string });
    expect(identity.role).toBe("user");
  });
});

describe("casSignInHref", () => {
  it("omits a return path on the home page", () => {
    expect(casSignInHref("/")).toBe("/api/auth/redirect");
  });

  it("returns to the page that asked for sign-in", () => {
    expect(casSignInHref("/analytics")).toBe("/api/auth/redirect?from=%2Fanalytics");
  });

  it("ignores an off-site return path", () => {
    expect(casSignInHref("https://evil.example")).toBe("/api/auth/redirect");
  });
});

describe("isLocalDevHostname", () => {
  it("accepts loopback hosts only", () => {
    expect(isLocalDevHostname("localhost")).toBe(true);
    expect(isLocalDevHostname("127.0.0.1")).toBe(true);
    expect(isLocalDevHostname("[::1]")).toBe(true);
    expect(isLocalDevHostname("yaleclubs.io")).toBe(false);
  });
});
