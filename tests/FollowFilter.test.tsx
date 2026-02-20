import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FollowFilter from "@/components/search/FollowFilter";

describe("FollowFilter", () => {
  it("renders the 'Followed' label", () => {
    const setShowFollowedOnly = jest.fn();
    render(<FollowFilter showFollowedOnly={false} setShowFollowedOnly={setShowFollowedOnly} />);

    expect(screen.getByText("Followed")).toBeInTheDocument();
  });

  it("renders an unchecked checkbox when showFollowedOnly is false", () => {
    const setShowFollowedOnly = jest.fn();
    render(<FollowFilter showFollowedOnly={false} setShowFollowedOnly={setShowFollowedOnly} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("renders a checked checkbox when showFollowedOnly is true", () => {
    const setShowFollowedOnly = jest.fn();
    render(<FollowFilter showFollowedOnly={true} setShowFollowedOnly={setShowFollowedOnly} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("calls setShowFollowedOnly with true when checkbox is clicked", () => {
    const setShowFollowedOnly = jest.fn();
    render(<FollowFilter showFollowedOnly={false} setShowFollowedOnly={setShowFollowedOnly} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(setShowFollowedOnly).toHaveBeenCalled();
  });

  it("calls setShowFollowedOnly with false when checked checkbox is clicked", () => {
    const setShowFollowedOnly = jest.fn();
    render(<FollowFilter showFollowedOnly={true} setShowFollowedOnly={setShowFollowedOnly} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(setShowFollowedOnly).toHaveBeenCalled();
  });
});
