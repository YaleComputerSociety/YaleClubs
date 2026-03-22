import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Dropdown from "@/components/faq/Dropdown";

// Mock react-icons
jest.mock("react-icons/sl", () => ({
  SlArrowRight: () => <span data-testid="arrow-right" />,
  SlArrowDown: () => <span data-testid="arrow-down" />,
}));

describe("Dropdown", () => {
  it("renders the question text", () => {
    render(<Dropdown question="What is YClubs?" answer="A club directory." />);

    expect(screen.getByText("What is YClubs?")).toBeInTheDocument();
  });

  it("shows right arrow when collapsed", () => {
    render(<Dropdown question="Question?" answer="Answer." />);

    expect(screen.getByTestId("arrow-right")).toBeInTheDocument();
  });

  it("shows down arrow when expanded", () => {
    render(<Dropdown question="Question?" answer="Answer." />);

    const button = screen.getByText("Question?");
    fireEvent.click(button);

    expect(screen.getByTestId("arrow-down")).toBeInTheDocument();
  });

  it("reveals the answer when clicked", () => {
    render(<Dropdown question="Question?" answer="This is the answer." />);

    const button = screen.getByText("Question?");
    fireEvent.click(button);

    expect(screen.getByText("This is the answer.")).toBeInTheDocument();
  });

  it("collapses the answer when clicked twice", () => {
    render(<Dropdown question="Question?" answer="Answer." />);

    const button = screen.getByText("Question?");
    fireEvent.click(button); // open
    fireEvent.click(button); // close

    expect(screen.getByTestId("arrow-right")).toBeInTheDocument();
  });

  it("renders links within the answer text", () => {
    const links = [{ label: "YClubs", url: "https://yclubs.com" }];
    render(<Dropdown question="Where can I find clubs?" answer="Visit YClubs to find clubs." links={links} />);

    const button = screen.getByText("Where can I find clubs?");
    fireEvent.click(button);

    const link = screen.getByText("YClubs");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://yclubs.com");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders answer without links when none provided", () => {
    render(<Dropdown question="Q?" answer="Plain answer." />);

    const button = screen.getByText("Q?");
    fireEvent.click(button);

    expect(screen.getByText("Plain answer.")).toBeInTheDocument();
  });
});
