// resolving git error
import { render, screen, fireEvent, act } from "@testing-library/react";

import Banner from "../src/components/Banner";

const DESKTOP_MEDIA = { matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() };
const MOBILE_MEDIA = { matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() };

describe("Banner", () => {
  let onHeightChange: jest.Mock;
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    jest.useFakeTimers();
    onHeightChange = jest.fn();
    localStorageMock = {};
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn(() => DESKTOP_MEDIA),
    });
    Object.defineProperty(window, "localStorage", {
      writable: true,
      value: {
        getItem: jest.fn((key: string) => localStorageMock[key] ?? null),
        setItem: jest.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
      },
    });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("renders the feedback message", () => {
    render(<Banner onHeightChange={onHeightChange} />);
    expect(screen.getByText(/We want your feedback!/i)).toBeInTheDocument();
    expect(screen.getByText(/survey/i)).toBeInTheDocument();
    expect(screen.getByText(/to help us improve/i)).toBeInTheDocument();
  });

  it("renders a close button", () => {
    render(<Banner onHeightChange={onHeightChange} />);
    const closeButton = screen.getByRole("button", { name: /×/ });
    expect(closeButton).toBeInTheDocument();
  });

  it("uses desktop survey link when not mobile", () => {
    (window.matchMedia as jest.Mock).mockReturnValue(DESKTOP_MEDIA);
    render(<Banner onHeightChange={onHeightChange} />);
    const link = screen.getByRole("link", { name: /survey/i });
    expect(link).toHaveAttribute(
      "href",
      "https://docs.google.com/forms/d/e/1FAIpQLSdBM9ccbynx2eQKVdCkpPDW-sIJArTWqUlMGGKuXz175iq0Og/viewform",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("uses mobile survey link when mobile", () => {
    (window.matchMedia as jest.Mock).mockReturnValue(MOBILE_MEDIA);
    render(<Banner onHeightChange={onHeightChange} />);
    const link = screen.getByRole("link", { name: /We want your feedback/i });
    expect(link).toHaveAttribute("href", "https://forms.gle/APtJYSsztGU8DfSf9");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("calls onHeightChange(0) and stores closed state when close is clicked", () => {
    render(<Banner onHeightChange={onHeightChange} />);
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    const closeButton = screen.getByRole("button", { name: /×/ });
    fireEvent.click(closeButton);
    expect(onHeightChange).toHaveBeenCalledWith(0);
    expect(window.localStorage.setItem).toHaveBeenCalledWith("bannerClosed", "1");
  });

  it("becomes visible after delay when not previously closed", () => {
    const { container } = render(<Banner onHeightChange={onHeightChange} />);
    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass("-translate-y-full");
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(banner).toHaveClass("translate-y-0");
  });

  it("stays hidden when already closed in localStorage", () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue("1");
    const { container } = render(<Banner onHeightChange={onHeightChange} />);
    const banner = container.firstChild as HTMLElement;
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(banner).toHaveClass("-translate-y-full");
    expect(onHeightChange).not.toHaveBeenCalled();
  });

  it("shows and notifies height when delay elapses and banner was not closed", () => {
    render(<Banner onHeightChange={onHeightChange} />);
    expect(onHeightChange).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(onHeightChange).toHaveBeenCalled();
  });
});
