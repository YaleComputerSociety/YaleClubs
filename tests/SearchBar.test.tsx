import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "@/components/search/SearchBar";

describe("SearchBar", () => {
  it("renders an input with placeholder text", () => {
    const setSearchQuery = jest.fn();
    render(<SearchBar searchQuery="" setSearchQuery={setSearchQuery} />);

    const input = screen.getByPlaceholderText("Search...");
    expect(input).toBeInTheDocument();
  });

  it("displays the current search query value", () => {
    const setSearchQuery = jest.fn();
    render(<SearchBar searchQuery="yale" setSearchQuery={setSearchQuery} />);

    const input = screen.getByDisplayValue("yale");
    expect(input).toBeInTheDocument();
  });

  it("calls setSearchQuery when user types", () => {
    const setSearchQuery = jest.fn();
    render(<SearchBar searchQuery="" setSearchQuery={setSearchQuery} />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "debate" } });

    expect(setSearchQuery).toHaveBeenCalledWith("debate");
  });

  it("renders as a text input", () => {
    const setSearchQuery = jest.fn();
    render(<SearchBar searchQuery="" setSearchQuery={setSearchQuery} />);

    const input = screen.getByPlaceholderText("Search...");
    expect(input).toHaveAttribute("type", "text");
  });
});
