import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import type { AuthUser } from "@/lib/authUser";

const signedInUser: AuthUser = {
  netid: "abc123",
  email: "abc123@yale.edu",
  role: "user",
};

function AuthProbe() {
  const { isLoggedIn } = useAuth();
  return <div data-testid="auth">{isLoggedIn ? "in" : "out"}</div>;
}

describe("AuthProvider initial session", () => {
  const paints: string[] = [];

  beforeEach(() => {
    paints.length = 0;
    localStorage.clear();
    localStorage.setItem("logout_version", "1");
  });

  it("stays signed in from the first paint when the server session is present", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ isLoggedIn: true, user: signedInUser }),
    });

    function RecordingProbe() {
      const { isLoggedIn } = useAuth();
      paints.push(isLoggedIn ? "in" : "out");
      return <AuthProbe />;
    }

    render(
      <AuthProvider initialUser={signedInUser}>
        <RecordingProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(paints[0]).toBe("in");
    expect(paints).not.toContain("out");
    expect(screen.getByTestId("auth")).toHaveTextContent("in");
  });

  it("renders signed out on the first paint when there is no server session", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ isLoggedIn: false }),
    });

    render(
      <AuthProvider initialUser={null}>
        <AuthProbe />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth")).toHaveTextContent("out");
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(screen.getByTestId("auth")).toHaveTextContent("out");
  });
});
