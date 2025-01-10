import { FixedSizeList as List } from "react-window";

interface VisibleClubsProps {
  clubs: IClub[]; // Array of clubs to render
  renderClubItem: (club: IClub) => JSX.Element; // Function to render each club
}

const VisibleClubs = ({ clubs, renderClubItem }: VisibleClubsProps) => {
  return (
    <List
      height={600} // Height of the entire visible list in pixels
      itemCount={clubs.length} // Total number of items in the list
      itemSize={150} // Fixed height of each item in the list in pixels
      width="100%" // Full width of the container
    >
      {({ index, style }) => <div style={style}>{renderClubItem(clubs[index])}</div>}
    </List>
  );
};

export default VisibleClubs;
