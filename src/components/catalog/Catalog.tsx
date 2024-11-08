// import React, { useRef, useState, useEffect, useMemo } from "react";
// import { useRouter } from 'next/navigation'
// import axios from 'axios';
// import Grid from "./Grid";

// import InfiniteScroll from "react-infinite-scroll-component";

// const Catalog  = ({page, setPage }) => {
// 	const numColumns = 2;
// 	// const router = useRouter();

// 	const [isLoading, setIsLoading] = useState(true);
// 	const [allgroups, setAllGroups] = useState([]);
// 	const [fetchError, setFetchError] = useState(null);
// 	const [hasMore, setHasMore] = useState(true);

// 	useEffect(() => {
// 	const fetchApiMessage = async () => {
// 		try {
// 			console.log("Fetching data for page:");
// 			setIsLoading(true);
// 			const response = await axios.get('/api/clubs');
// 			if (response.data.length === 0) {
// 				console.log("No more data available."); // Debugging log
// 				setHasMore(false); // Stop loading if no more data
// 			} else {
// 				setAllGroups(response.data);
// 				console.log("Data fetched:", response.data); // Debugging log
// 			}
// 			// console.log('API message:', response.data);
// 			// setAllGRoups(response.data);
// 			// setIsLoading(false);
// 		} catch (error) {
// 			console.error('Error fetching API message:', error);
// 			setIsLoading(false);
// 		}
// 	};
// 	fetchApiMessage();
//     }, []);

// 	const renderItem = useMemo(
//         () => ( item ) => <ClubItem key={item._id} item={item} />,
//         []
//     );

// 	const loadMoreData = () => {
//         setPage((prevPage) => prevPage + 1); // Increment page for the next fetch
//         fetchApiMessage(page + 1);
//     };

// 	return (
//         <div>
//             <div className="px-5 ml-10 mt-10">
//                 <h1 className="text-2xl font-bold">Browse Clubs</h1>
//                 <h2 className="text-1xl">Finding clubs has never been easier</h2>
//             </div>

//             {isLoading && page === 1 ? (
//                 <div className="mx-auto">
//                     <div className="loader" style={{ color: "#aaa" }}></div> {/* Loader while fetching the first page */}
//                 </div>
//             ) : (
//                 <InfiniteScroll
//                     dataLength={allgroups.length}
//                     next={loadMoreData} // Calls loadMoreData on scroll to bottom
//                     hasMore={hasMore}
//                     loader={<div className="loader" style={{ color: "#aaa" }}>Loading...</div>}
//                     endMessage={<p style={{ textAlign: "center" }}>No more clubs to display.</p>}
//                 >
//                     <div className="grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${numColumns}, 1fr)`, gap: '20px' }}>
//                         {allgroups.map(renderItem)}
//                     </div>
//                 </InfiniteScroll>
//             )}
//         </div>
//     );
// };

// export default Catalog;

import React, { useEffect, useState, useMemo, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import ClubCard from "./ClubCard";
import ClubModal from "./ClubModal";
import { IClub } from "@/lib/models/Club";

interface CatalogProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const Catalog = ({ page, setPage }: CatalogProps) => {
  const numColumns = 2;
  const [isLoading, setIsLoading] = useState(false);
  const [allGroups, setAllGroups] = useState<IClub[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedClub, setSelectedClub] = useState<IClub | null>(null);

  const handleCloseModal = () => setSelectedClub(null);

  const fetchApiMessage = useCallback(async (pageNum: number = 1) => {
    try {
      setIsLoading(true);
      const response = await axios.get<IClub[]>(`/api/clubs?page=${pageNum}`);
      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        setAllGroups((prevGroups) => [...prevGroups, ...response.data]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && allGroups.length === 0) {
      fetchApiMessage(page);
    }
  }, [page, fetchApiMessage, isLoading, allGroups]);

  const renderClubItem = (club: IClub) => <ClubCard key={club._id} club={club} onClick={() => setSelectedClub(club)} />;
  renderClubItem.displayName = "RenderClubItem";

  const renderItem = useMemo(() => renderClubItem, []);

  const loadMoreData = () => {
    console.log("Loading more data...");
    setPage((prevPage) => prevPage + 1);
    fetchApiMessage(page + 1);
  };

  return (
    <div>
      <div className="px-5 ml-20 mt-16">
        <h1 className="text-3xl font-bold">Browse Clubs</h1>
        <h2 className="text-xl mb-8">Shopping has never been easier.</h2>
      </div>

      {isLoading && page === 1 ? (
        <div className="mx-auto">
          <div className="loader" style={{ color: "#aaa" }}></div> {/* Loader while fetching the first page */}
        </div>
      ) : (
        <InfiniteScroll
          dataLength={allGroups.length}
          next={loadMoreData}
          hasMore={hasMore}
          loader={
            <div className="loader" style={{ color: "#aaa" }}>
              Loading...
            </div>
          }
          endMessage={<p style={{ textAlign: "center" }}>No more clubs to display.</p>}
        >
          <div
            className="grid"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
              gap: "32px",
              margin: "0 5rem",
            }}
          >
            {allGroups.map(renderItem)}
            {selectedClub && (
              <ClubModal club={selectedClub} onClose={handleCloseModal} /> // Render modal if club is selected
            )}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
};

export default Catalog;
