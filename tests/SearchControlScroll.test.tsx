import { fireEvent, render, screen } from "@testing-library/react";
import SearchControl from "@/components/search/SearchControl";

jest.mock("@/lib/models/Club", () => ({
  School: { COLLEGE: "Yale College" },
  Category: {},
  Affiliation: {},
}));
jest.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ isLoggedIn: false }) }));
jest.mock("@/components/catalog/DisplayHeader", () => ({
  __esModule: true,
  default: () => <header className="nav" />,
}));
jest.mock("@/components/search/FilterModal", () => ({
  __esModule: true,
  default: ({ onClose }: { onClose: () => void }) => <button onClick={onClose}>Hide filters</button>,
}));

describe("browse filter scroll position", () => {
  it("keeps the first visible club at its viewport offset when closing and reopening filters", () => {
    const scrollTo = jest.spyOn(window, "scrollTo").mockImplementation(() => {});
    const rect = (top: number, bottom: number) => ({ top, bottom }) as DOMRect;
    const bounds = jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.classList.contains("nav")) return rect(0, 56);
      if (this.dataset.club === "earlier") return rect(-500, -180);
      if (this.dataset.club === "visible") {
        return this.closest(".filters-visible") ? rect(-100, 220) : rect(-780, -460);
      }
      return rect(0, 0);
    });
    render(
      <SearchControl
        clubs={[]}
        resultCount={0}
        setCurrentClubs={jest.fn()}
        setIsLoading={jest.fn()}
        followedClubs={[]}
        setSelectedClub={jest.fn()}
      >
        <div className="club-grid">
          <article className="club-card" data-club="earlier" />
          <article className="club-card" data-club="visible" />
        </div>
      </SearchControl>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Hide filters" }));
    expect(scrollTo).toHaveBeenLastCalledWith({ top: window.scrollY - 680, behavior: "instant" });

    // The same club is back at its original viewport offset after scrolling.
    bounds.mockImplementation(function (this: HTMLElement) {
      if (this.classList.contains("nav")) return rect(0, 56);
      if (this.dataset.club === "earlier") return rect(-500, -180);
      if (this.dataset.club === "visible") {
        return this.closest(".filters-visible") ? rect(580, 900) : rect(-100, 220);
      }
      return rect(0, 0);
    });
    fireEvent.click(screen.getByRole("button", { name: /Show filters/ }));
    expect(scrollTo).toHaveBeenLastCalledWith({ top: window.scrollY + 680, behavior: "instant" });
    bounds.mockRestore();
    scrollTo.mockRestore();
  });
  it("preserves the footer position instead of a club when the footer is visible", () => {
    const scrollTo = jest.spyOn(window, "scrollTo").mockImplementation(() => {});
    let reopening = false;
    const bounds = jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.classList.contains("nav")) return { top: 0, bottom: 56 } as DOMRect;
      if (this.classList.contains("global-footer")) {
        const expanded = Boolean(document.querySelector(".filters-visible"));
        const top = reopening ? (expanded ? 1080 : 400) : expanded ? 400 : -280;
        const height = expanded ? 320 : 250;
        return { top, bottom: top + height, height } as DOMRect;
      }
      return { top: 100, bottom: 420 } as DOMRect;
    });
    render(
      <>
        <SearchControl
          clubs={[]}
          resultCount={0}
          setCurrentClubs={jest.fn()}
          setIsLoading={jest.fn()}
          followedClubs={[]}
          setSelectedClub={jest.fn()}
        >
          <div className="club-grid">
            <article className="club-card" />
          </div>
        </SearchControl>
        <footer className="global-footer" />
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Hide filters" }));
    expect(scrollTo).toHaveBeenLastCalledWith({ top: window.scrollY - 680, behavior: "instant" });
    expect(
      document.querySelector<HTMLElement>(".global-footer")?.style.getPropertyValue("--browse-footer-min-height"),
    ).toBe("320px");
    reopening = true;
    fireEvent.click(screen.getByRole("button", { name: /Show filters/ }));
    expect(scrollTo).toHaveBeenLastCalledWith({ top: window.scrollY + 680, behavior: "instant" });
    bounds.mockRestore();
    scrollTo.mockRestore();
  });
});
