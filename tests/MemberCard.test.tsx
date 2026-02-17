import React from "react";
import { render, screen } from "@testing-library/react";
import MemberCard from "@/components/about/MemberCard";


describe("MemberCard", () => {
  it("renders member name and role", () => {
    const member = { name: "John Doe", role: "President" };
    render(<MemberCard member={member} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("President")).toBeInTheDocument();
  });

  it("returns null when member is null", () => {
    const { container } = render(<MemberCard member={null as any} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders website link when provided", () => {
    const member = { name: "Jane", role: "VP", website: "https://example.com" };
    render(<MemberCard member={member} />);

    const link = screen.getByAltText("Website").closest("a");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders LinkedIn link when provided", () => {
    const member = { name: "Jane", role: "VP", linkedin: "https://linkedin.com/in/jane" };
    render(<MemberCard member={member} />);

    const link = screen.getByAltText("linkedIn").closest("a");
    expect(link).toHaveAttribute("href", "https://linkedin.com/in/jane");
  });

  it("renders GitHub link when provided", () => {
    const member = { name: "Jane", role: "VP", github: "https://github.com/jane" };
    render(<MemberCard member={member} />);

    const link = screen.getByAltText("GitHub").closest("a");
    expect(link).toHaveAttribute("href", "https://github.com/jane");
  });

  it("renders headshot when provided", () => {
    const member = { name: "Jane", role: "VP", headshot: "/headshots/jane.jpg" };
    render(<MemberCard member={member} />);

    const img = screen.getByAltText("Member Headshot");
    expect(img).toBeInTheDocument();
  });

  it("does not render website link when not provided", () => {
    const member = { name: "Jane", role: "VP" };
    render(<MemberCard member={member} />);

    expect(screen.queryByAltText("Website")).not.toBeInTheDocument();
  });

  it("does not render LinkedIn link when not provided", () => {
    const member = { name: "Jane", role: "VP" };
    render(<MemberCard member={member} />);

    expect(screen.queryByAltText("linkedIn")).not.toBeInTheDocument();
  });

  it("does not render GitHub link when not provided", () => {
    const member = { name: "Jane", role: "VP" };
    render(<MemberCard member={member} />);

    expect(screen.queryByAltText("GitHub")).not.toBeInTheDocument();
  });
});
