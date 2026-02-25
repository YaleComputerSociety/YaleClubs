import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";

jest.mock("@/lib/models/Club", () => ({
  Affiliation: {
    Athletics: "Athletics",
    Cultural: "Cultural",
    Academic: "Academic",
  },
}));

import ClubAffiliation from "@/components/update/ClubAffiliation";

describe("ClubAffiliation (AffiliationsDropdown)", () => {
  const openDropdown = () => {
    const control = document.querySelector("div.border.border-gray-300.rounded-lg") as HTMLDivElement | null;

    if (!control) throw new Error("Could not find dropdown control container");
    fireEvent.click(control);
  };

  it("renders label and placeholder when no affiliations selected", () => {
    const handleChange = jest.fn();
    render(<ClubAffiliation selectedAffiliations={[]} handleChange={handleChange} />);

    expect(screen.getByText("Affiliations")).toBeInTheDocument();
    expect(screen.getByText("Select categories")).toBeInTheDocument();
  });

  it("opens the dropdown and renders all affiliations (including additionalAffiliations unique values)", () => {
    const handleChange = jest.fn();
    render(
      <ClubAffiliation
        selectedAffiliations={[]}
        additionalAffiliations={["Academic", "Community Service", "Entrepreneurship"]}
        handleChange={handleChange}
      />,
    );

    openDropdown();

    expect(screen.getByText("Athletics")).toBeInTheDocument();
    expect(screen.getByText("Cultural")).toBeInTheDocument();
    expect(screen.getByText("Academic")).toBeInTheDocument();

    expect(screen.getByText("Community Service")).toBeInTheDocument();
    expect(screen.getByText("Entrepreneurship")).toBeInTheDocument();
  });

  it("calls handleChange with updated affiliations when an option is clicked", () => {
    const handleChange = jest.fn();
    render(<ClubAffiliation selectedAffiliations={[]} handleChange={handleChange} />);

    openDropdown();
    fireEvent.click(screen.getByText("Athletics"));

    expect(handleChange).toHaveBeenCalledWith("affiliations", ["Athletics"]);
  });

  it("does not add duplicates when clicking an already-selected affiliation", () => {
    const handleChange = jest.fn();
    render(<ClubAffiliation selectedAffiliations={["Cultural"] as any} handleChange={handleChange} />);

    openDropdown();
    const dropdownMenu = document.querySelector("div.absolute.z-10") as HTMLDivElement | null;

    if (!dropdownMenu) throw new Error("Could not find dropdown menu container");

    fireEvent.click(within(dropdownMenu).getByText("Cultural"));

    expect(handleChange).not.toHaveBeenCalled();
  });

  it("removes an affiliation when the card x button is clicked", () => {
    const handleChange = jest.fn();
    render(<ClubAffiliation selectedAffiliations={["Academic", "Cultural"] as any} handleChange={handleChange} />);

    const chipsContainer = document.querySelector(
      "div.flex.gap-2.whitespace-nowrap.w-full.flex-wrap.mt-4",
    ) as HTMLDivElement | null;

    if (!chipsContainer) throw new Error("Could not find chips container");

    const culturalChip = within(chipsContainer).getByText("Cultural").closest("div")!;
    const removeBtn = within(culturalChip).getByRole("button", { name: "×" });
    fireEvent.click(removeBtn);

    expect(handleChange).toHaveBeenCalledWith("affiliations", ["Academic"]);
  });

  it("closes the dropdown when clicking outside", () => {
    const handleChange = jest.fn();
    render(<ClubAffiliation selectedAffiliations={[]} handleChange={handleChange} />);

    openDropdown();
    expect(screen.getByText("Athletics")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByText("Athletics")).not.toBeInTheDocument();
  });
});
