import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import ClubAliases from "@/components/update/ClubAliases";

describe("ClubAliases (AliasesDropdown)", () => {
  const openDropdown = () => {
    const control = document.querySelector("div.border.border-gray-300.rounded-lg") as HTMLDivElement | null;

    if (!control) throw new Error("Could not find aliases dropdown control container");
    fireEvent.click(control);
  };

  it("renders label and placeholder when no aliases selected", () => {
    const handleChange = jest.fn();
    render(<ClubAliases selectedAliases={[]} handleChange={handleChange} />);

    expect(screen.getByText("Club Aliases")).toBeInTheDocument();
    expect(screen.getByText("Enter club aliases")).toBeInTheDocument();
  });

  it("opens dropdown and shows input + Add Alias button", () => {
    const handleChange = jest.fn();
    render(<ClubAliases selectedAliases={[]} handleChange={handleChange} />);

    openDropdown();

    expect(screen.getByPlaceholderText("Type alias and press Enter")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Alias" })).toBeInTheDocument();
  });

  it("adds an alias via button click and calls handleChange", () => {
    const handleChange = jest.fn();
    render(<ClubAliases selectedAliases={[]} handleChange={handleChange} />);

    openDropdown();

    fireEvent.change(screen.getByPlaceholderText("Type alias and press Enter"), {
      target: { value: "Ski Club" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Alias" }));

    expect(handleChange).toHaveBeenCalledWith("aliases", ["Ski Club"]);
  });

  it("adds an alias via Enter key and calls handleChange", () => {
    const handleChange = jest.fn();
    render(<ClubAliases selectedAliases={[]} handleChange={handleChange} />);

    openDropdown();

    const input = screen.getByPlaceholderText("Type alias and press Enter");
    fireEvent.change(input, { target: { value: "Robotics" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter", charCode: 13 });

    expect(handleChange).toHaveBeenCalledWith("aliases", ["Robotics"]);
  });

  it("shows error when alias is empty/whitespace", () => {
    const handleChange = jest.fn();
    render(<ClubAliases selectedAliases={[]} handleChange={handleChange} />);

    openDropdown();

    fireEvent.change(screen.getByPlaceholderText("Type alias and press Enter"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Alias" }));

    expect(screen.getByText("Alias cannot be empty.")).toBeInTheDocument();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("shows error when alias exceeds 50 characters", () => {
    const handleChange = jest.fn();
    render(<ClubAliases selectedAliases={[]} handleChange={handleChange} />);

    openDropdown();

    const longAlias = "a".repeat(51);
    fireEvent.change(screen.getByPlaceholderText("Type alias and press Enter"), {
      target: { value: longAlias },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Alias" }));

    expect(screen.getByText("Alias must be under 50 characters.")).toBeInTheDocument();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("shows error when trying to add more than 2 aliases", () => {
    const handleChange = jest.fn();
    render(<ClubAliases selectedAliases={["A", "B"]} handleChange={handleChange} />);

    openDropdown();

    fireEvent.change(screen.getByPlaceholderText("Type alias and press Enter"), {
      target: { value: "C" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Alias" }));

    expect(screen.getByText("You can only add up to 2 aliases.")).toBeInTheDocument();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("shows error when alias is a duplicate", () => {
    const handleChange = jest.fn();
    render(<ClubAliases selectedAliases={["Chess"]} handleChange={handleChange} />);

    openDropdown();

    fireEvent.change(screen.getByPlaceholderText("Type alias and press Enter"), {
      target: { value: "Chess" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Alias" }));

    expect(screen.getByText("Alias already added.")).toBeInTheDocument();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("clears an existing error when typing again", () => {
    const handleChange = jest.fn();
    render(<ClubAliases selectedAliases={[]} handleChange={handleChange} />);

    openDropdown();

    fireEvent.change(screen.getByPlaceholderText("Type alias and press Enter"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Alias" }));
    expect(screen.getByText("Alias cannot be empty.")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Type alias and press Enter"), {
      target: { value: "New alias" },
    });
    expect(screen.queryByText("Alias cannot be empty.")).not.toBeInTheDocument();
  });

  it("renders selected aliases in the control and shows removable chips when closed", () => {
    const handleChange = jest.fn();
    render(<ClubAliases selectedAliases={["Alpha", "Beta"]} handleChange={handleChange} />);

    expect(screen.getByText("Alpha, Beta")).toBeInTheDocument();

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();

    const removeButtons = screen.getAllByRole("button", { name: "×" });
    expect(removeButtons).toHaveLength(2);
  });

  it("removes an alias when clicking × (dropdown closed)", () => {
    const handleChange = jest.fn();
    render(<ClubAliases selectedAliases={["Alpha", "Beta"]} handleChange={handleChange} />);

    const chipsContainer = document.querySelector(
      "div.flex.gap-2.whitespace-nowrap.w-full.flex-wrap.mt-4",
    ) as HTMLDivElement | null;

    if (!chipsContainer) throw new Error("Could not find chips container (closed)");

    const betaChip = within(chipsContainer).getByText("Beta").closest("div")!;
    fireEvent.click(within(betaChip).getByRole("button", { name: "×" }));

    expect(handleChange).toHaveBeenCalledWith("aliases", ["Alpha"]);
  });

  it("removes an alias when clicking × (dropdown open)", () => {
    const handleChange = jest.fn();
    render(<ClubAliases selectedAliases={["Alpha", "Beta"]} handleChange={handleChange} />);

    openDropdown();

    const dropdownMenu = document.querySelector("div.absolute.mt-1.w-full.bg-white") as HTMLDivElement | null;

    if (!dropdownMenu) throw new Error("Could not find dropdown menu container");

    const betaChip = within(dropdownMenu).getByText("Beta").closest("div")!;
    fireEvent.click(within(betaChip).getByRole("button", { name: "×" }));

    expect(handleChange).toHaveBeenCalledWith("aliases", ["Alpha"]);
  });

  it("closes dropdown when clicking outside", () => {
    const handleChange = jest.fn();
    render(<ClubAliases selectedAliases={[]} handleChange={handleChange} />);

    openDropdown();
    expect(screen.getByPlaceholderText("Type alias and press Enter")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByPlaceholderText("Type alias and press Enter")).not.toBeInTheDocument();
  });
});
