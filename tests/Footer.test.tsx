import React from "react";
import { render, screen } from "@testing-library/react";

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
  it("renders the YaleClubs logo and brand name", () => {
    render(<Footer />);
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
    expect(screen.getByText("YaleClubs")).toBeInTheDocument();
  });

  it("renders the logo link pointing to home", () => {
    render(<Footer />);
    const brandText = screen.getByText("YaleClubs");
    const homeLink = brandText.closest("a");
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("renders the Yale Computer Society link", () => {
    render(<Footer />);
    const ycsLink = screen.getByText("yale computer society (y/cs)");
    expect(ycsLink).toHaveAttribute("href", "https://yalecomputersociety.org/");
    expect(ycsLink).toHaveAttribute("target", "_blank");
  });

  it("renders the Design at Yale link", () => {
    render(<Footer />);
    const dayLink = screen.getByText("design at yale (day)");
    expect(dayLink).toHaveAttribute("href", "https://designatyale.com/");
  });

  it("renders the current year in the copyright notice", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(`YaleClubs © ${year}`)).toBeInTheDocument();
  });

  it("renders Explore section with Events and Catalog links", () => {
    render(<Footer />);
    expect(screen.getByRole("heading", { name: "Explore" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute("href", "/Events");
    expect(screen.getByRole("link", { name: "Catalog" })).toHaveAttribute("href", "/");
  });

  it("renders Support section with FAQ, Privacy Policy, and Feedback links", () => {
    render(<Footer />);
    expect(screen.getByRole("heading", { name: "Support" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "/faq");
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy-policy");
    expect(screen.getByRole("link", { name: "Feedback" })).toHaveAttribute("href", "https://yaleclubs.canny.io");
  });

  it("renders About section with Team, Release Notes, and GitHub links", () => {
    render(<Footer />);
    expect(screen.getByRole("heading", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Team" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Release Notes" })).toHaveAttribute("href", "/release-notes");
    const githubLink = screen.getByRole("link", { name: "GitHub" });
    expect(githubLink).toHaveAttribute("href", "https://github.com/YaleComputerSociety/yaleclubs");
    expect(githubLink).toHaveAttribute("target", "_blank");
  });

  it("renders the disclaimer text", () => {
    render(<Footer />);
    expect(screen.getByText(/Yale is a registered trademark/i)).toBeInTheDocument();
  });
});
