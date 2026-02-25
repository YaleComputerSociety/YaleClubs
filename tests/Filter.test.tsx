import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Filter from "../src/components/Filter";

function FilterWrapper({
  initialSelected = [] as string[],
  allItems = ["Arts", "Sports", "Music", "Science"],
  label = "Category",
  aliasMapping = {} as Record<string, string[]>,
}) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  return (
    <Filter
      selectedItems={selected}
      setSelectedItems={setSelected}
      allItems={allItems}
      label={label}
      aliasMapping={aliasMapping}
    />
  );
}

describe("Filter", () => {
  it("renders the label when nothing is selected", () => {
    render(<FilterWrapper />);
    expect(screen.getByText("Category")).toBeInTheDocument();
  });

  it("opens dropdown when the toggle is clicked", () => {
    render(<FilterWrapper />);
    fireEvent.click(screen.getByText("Category"));
    expect(screen.getByPlaceholderText("Search category...")).toBeInTheDocument();
  });

  it("lists all items in the dropdown when opened", () => {
    render(<FilterWrapper />);
    fireEvent.click(screen.getByText("Category"));
    expect(screen.getByText("Arts")).toBeInTheDocument();
    expect(screen.getByText("Sports")).toBeInTheDocument();
    expect(screen.getByText("Music")).toBeInTheDocument();
    expect(screen.getByText("Science")).toBeInTheDocument();
  });

  it("adds an item when clicked in the dropdown", () => {
    render(<FilterWrapper />);
    fireEvent.click(screen.getByText("Category"));
    fireEvent.click(screen.getByText("Arts"));
    // Arts appears in both the toggle label and the selected tag — two instances total
    expect(screen.getAllByText("Arts")).toHaveLength(2);
    // Arts is no longer in the available items list (Sports, Music, Science still are)
    expect(screen.getByText("Sports")).toBeInTheDocument();
    expect(screen.getByText("Music")).toBeInTheDocument();
    expect(screen.getByText("Science")).toBeInTheDocument();
  });

  it("removes a selected item via its tag remove button", () => {
    render(<FilterWrapper initialSelected={["Arts"]} />);
    // Open dropdown to reveal the per-tag remove button
    fireEvent.click(screen.getByText("Arts"));
    // Buttons order: [0] toggle clear, [1] tag remove for Arts, [2] dropdown section clear-all
    const removeButtons = screen.getAllByText("✕");
    fireEvent.click(removeButtons[1]); // per-tag remove for Arts
    // After removal, toggle reverts to showing the label
    expect(screen.getByText("Category")).toBeInTheDocument();
  });

  it("clears all selected items when the toggle clear button is clicked", () => {
    render(<FilterWrapper initialSelected={["Arts", "Sports"]} />);
    // The toggle has a clear (×) button when items are selected
    const clearButton = screen.getByText("✕");
    fireEvent.click(clearButton);
    expect(screen.getByText("Category")).toBeInTheDocument();
  });

  it("filters available items based on search input", () => {
    render(<FilterWrapper />);
    fireEvent.click(screen.getByText("Category"));
    const searchInput = screen.getByPlaceholderText("Search category...");
    fireEvent.change(searchInput, { target: { value: "art" } });
    expect(screen.getByText("Arts")).toBeInTheDocument();
    expect(screen.queryByText("Sports")).not.toBeInTheDocument();
    expect(screen.queryByText("Music")).not.toBeInTheDocument();
  });

  it("shows 'No category found' when search has no matches", () => {
    render(<FilterWrapper />);
    fireEvent.click(screen.getByText("Category"));
    const searchInput = screen.getByPlaceholderText("Search category...");
    fireEvent.change(searchInput, { target: { value: "xyz" } });
    expect(screen.getByText("No category found")).toBeInTheDocument();
  });

  it("finds items via alias mapping", () => {
    render(
      <FilterWrapper
        allItems={["Football", "Basketball"]}
        aliasMapping={{ soccer: ["Football"] }}
        label="Sport"
      />
    );
    fireEvent.click(screen.getByText("Sport"));
    const searchInput = screen.getByPlaceholderText("Search sport...");
    fireEvent.change(searchInput, { target: { value: "soccer" } });
    expect(screen.getByText("Football")).toBeInTheDocument();
    expect(screen.queryByText("Basketball")).not.toBeInTheDocument();
  });

  it("closes dropdown when clicking outside", () => {
    render(
      <div>
        <FilterWrapper />
        <div data-testid="outside">Outside</div>
      </div>
    );
    fireEvent.click(screen.getByText("Category"));
    expect(screen.getByPlaceholderText("Search category...")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByPlaceholderText("Search category...")).not.toBeInTheDocument();
  });
});
