import { render, screen, within } from "@testing-library/react";

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

import Footer from "../src/components/Footer";

describe("Footer", () => {
  it("renders the footer and core branding", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();

    expect(screen.getByText("YaleClubs")).toBeInTheDocument();

    expect(screen.getByAltText("Logo")).toBeInTheDocument();
  });

  it("renders the current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`YaleClubs © ${year}`))).toBeInTheDocument();
  });

  it("renders Explore links with correct hrefs", () => {
    render(<Footer />);

    const exploreHeading = screen.getByRole("heading", { name: "Explore" });
    const exploreSection = exploreHeading.parentElement!;
    const utils = within(exploreSection);

    const events = utils.getByRole("link", { name: "Events" });
    expect(events).toHaveAttribute("href", "/Events");

    const catalog = utils.getByRole("link", { name: "Catalog" });
    expect(catalog).toHaveAttribute("href", "/");
  });

  it("renders Support links with correct hrefs and targets", () => {
    render(<Footer />);

    const supportHeading = screen.getByRole("heading", { name: "Support" });
    const supportSection = supportHeading.parentElement!;
    const utils = within(supportSection);

    const faq = utils.getByRole("link", { name: "FAQ" });
    expect(faq).toHaveAttribute("href", "/faq");

    const privacy = utils.getByRole("link", { name: "Privacy Policy" });
    expect(privacy).toHaveAttribute("href", "/privacy-policy");

    const feedback = utils.getByRole("link", { name: "Feedback" });
    expect(feedback).toHaveAttribute("href", "https://yaleclubs.canny.io");
    expect(feedback).toHaveAttribute("target", "_blank");
  });

  it("renders About links with correct hrefs and targets", () => {
    render(<Footer />);

    const aboutHeading = screen.getByRole("heading", { name: "About" });
    const aboutSection = aboutHeading.parentElement!;
    const utils = within(aboutSection);

    const team = utils.getByRole("link", { name: "Team" });
    expect(team).toHaveAttribute("href", "/about");

    const releaseNotes = utils.getByRole("link", { name: "Release Notes" });
    expect(releaseNotes).toHaveAttribute("href", "/release-notes");

    const github = utils.getByRole("link", { name: "GitHub" });
    expect(github).toHaveAttribute("href", "https://github.com/YaleComputerSociety/yaleclubs");
    expect(github).toHaveAttribute("target", "_blank");
  });

  it("renders org attribution links (Y/CS and DAY) with correct hrefs", () => {
    render(<Footer />);

    const ycs = screen.getByRole("link", { name: /yale computer society/i });
    expect(ycs).toHaveAttribute("href", "https://yalecomputersociety.org/");
    expect(ycs).toHaveAttribute("target", "_blank");

    const day = screen.getByRole("link", { name: /design at yale/i });
    expect(day).toHaveAttribute("href", "https://designatyale.com/");
  });

  it("renders the disclaimer text", () => {
    render(<Footer />);

    expect(screen.getByText(/Yale is a registered trademark of Yale University/i)).toBeInTheDocument();

    expect(screen.getByText(/student run and is maintained, hosted, and operated independently/i)).toBeInTheDocument();
  });

  it("renders the home link around the logo/brand", () => {
    render(<Footer />);

    const brandText = screen.getByText("YaleClubs");
    const brandLink = brandText.closest("a");
    expect(brandLink).toHaveAttribute("href", "/");
  });
});
