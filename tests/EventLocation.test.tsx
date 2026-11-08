import { fireEvent, render, screen } from "@testing-library/react";
import EventLocation from "@/components/events/EventLocation";

describe("EventLocation", () => {
  it("shows a plain location", () => {
    render(<EventLocation event={{ location: "Battell Chapel" }} />);
    expect(screen.getByText("Battell Chapel")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("links to YaleConnect when the location is hidden", () => {
    const onParentClick = jest.fn();
    render(
      <div onClick={onParentClick}>
        <EventLocation
          event={{
            location: "View location on YaleConnect",
            locationHidden: true,
            externalLink: "https://yaleconnect.yale.edu/URI/rsvp?id=1",
          }}
        />
      </div>,
    );
    const link = screen.getByRole("link", { name: /view location on yaleconnect/i });
    expect(link).toHaveAttribute("href", "https://yaleconnect.yale.edu/URI/rsvp?id=1");
    expect(link).toHaveAttribute("target", "_blank");
    fireEvent.click(link);
    expect(onParentClick).not.toHaveBeenCalled(); // doesn't open the card's modal
  });
});
