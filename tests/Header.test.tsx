// resolving git error
import { render, screen, fireEvent, act } from "@testing-library/react";

jest.mock("next/link", () => {
  return ({ href, children, ...props }: any) => (
    <a href={typeof href === "string" ? href : href?.pathname} {...props}>
      {children}
    </a>
  );
});

jest.mock("next/image", () => {
  return (props: any) => {
    const src = typeof props.src === "string" ? props.src : (props.src?.src ?? "");
    return <img alt={props.alt} src={src} width={props.width} height={props.height} />;
  };
});

const mockUsePathname = jest.fn(() => "/");
const mockLogout = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

const mockUseAuth = jest.fn(() => ({ isLoggedIn: false, logout: mockLogout }));
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("../src/components/Banner", () => ({
  __esModule: true,
  default: () => <div data-testid="banner" />,
}));

import Header from "../src/components/Header";

const DESKTOP_MEDIA = { matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() };
const MOBILE_MEDIA = { matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() };

describe("Header", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
    mockUseAuth.mockReturnValue({ isLoggedIn: false, logout: mockLogout });
    mockLogout.mockResolvedValue(undefined);
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn(() => DESKTOP_MEDIA),
    });
  });

  it("renders logo and YaleClubs branding with link to home", () => {
    render(<Header />);
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
    const brandText = screen.getByText("YaleClubs");
    expect(brandText).toBeInTheDocument();
    const homeLink = brandText.closest("a");
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("renders desktop nav links with correct hrefs when not mobile", () => {
    (window.matchMedia as jest.Mock).mockReturnValue(DESKTOP_MEDIA);
    render(<Header />);

    expect(screen.getByRole("link", { name: "Clubs" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute("href", "/Events");
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  });

  it("renders Sign In link when not logged in (desktop)", () => {
    (window.matchMedia as jest.Mock).mockReturnValue(DESKTOP_MEDIA);
    render(<Header />);
    const signIn = screen.getByRole("link", { name: "Sign In" });
    expect(signIn).toBeInTheDocument();
    expect(signIn).toHaveAttribute("href", "/api/auth/redirect");
  });

  it("renders Sign Out button when logged in (desktop)", () => {
    mockUseAuth.mockReturnValue({ isLoggedIn: true, logout: mockLogout });
    (window.matchMedia as jest.Mock).mockReturnValue(DESKTOP_MEDIA);
    render(<Header />);
    const signOut = screen.getByRole("button", { name: "Sign Out" });
    expect(signOut).toBeInTheDocument();
  });

  it("renders hamburger button and hides desktop nav when mobile", () => {
    (window.matchMedia as jest.Mock).mockReturnValue(MOBILE_MEDIA);
    render(<Header />);
    expect(screen.getByRole("button", { name: /☰/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Clubs" })).not.toBeInTheDocument();
  });

  it("opens mobile menu with links when hamburger is clicked", () => {
    (window.matchMedia as jest.Mock).mockReturnValue(MOBILE_MEDIA);
    render(<Header />);
    const menuButton = screen.getByRole("button", { name: /☰/ });
    fireEvent.click(menuButton);
    expect(screen.getByRole("link", { name: "Clubs" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute("href", "/Events");
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  });

  it("shows Sign In in mobile menu when not logged in", () => {
    (window.matchMedia as jest.Mock).mockReturnValue(MOBILE_MEDIA);
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /☰/ }));
    const signIn = screen.getByRole("link", { name: "Sign In" });
    expect(signIn).toHaveAttribute("href", "/api/auth/redirect");
  });

  it("shows Sign Out in mobile menu when logged in", () => {
    mockUseAuth.mockReturnValue({ isLoggedIn: true, logout: mockLogout });
    (window.matchMedia as jest.Mock).mockReturnValue(MOBILE_MEDIA);
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /☰/ }));
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
  });

  it("includes Banner in the header", () => {
    render(<Header />);
    expect(screen.getByTestId("banner")).toBeInTheDocument();
  });

  it("calls logout API when Sign Out is clicked (desktop)", async () => {
    // Mock fetch with ok: false so handleLogout skips window.location.reload (not implemented in jsdom)
    const mockFetch = jest.fn().mockResolvedValue({ ok: false });
    global.fetch = mockFetch;
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockUseAuth.mockReturnValue({ isLoggedIn: true, logout: mockLogout });
    (window.matchMedia as jest.Mock).mockReturnValue(DESKTOP_MEDIA);
    render(<Header />);
    const signOut = screen.getByRole("button", { name: "Sign Out" });
    fireEvent.click(signOut);
    await act(async () => {});
    expect(mockFetch).toHaveBeenCalledWith("/api/auth/logout", expect.any(Object));
    consoleSpy.mockRestore();
  });

  it("calls logout from context when Sign Out is clicked in mobile menu", async () => {
    mockUseAuth.mockReturnValue({ isLoggedIn: true, logout: mockLogout });
    (window.matchMedia as jest.Mock).mockReturnValue(MOBILE_MEDIA);
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /☰/ }));
    fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));
    await act(async () => {});
    expect(mockLogout).toHaveBeenCalled();
  });
});
