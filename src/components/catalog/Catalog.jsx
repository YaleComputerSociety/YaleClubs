import React, { useRef, useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import axios from 'axios';
import Grid from "./Grid";



const Catalog  = ({page, setPage}) => {
	// const numColumns = 2;
	// const router = useRouter();

	const numColumns = 2;

	const [isLoading, setIsLoading] = useState(true);
	const [allgroups, setAllGRoups] = useState([]);
	const [fetchError, setFetchError] = useState(null);

	// useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             setIsLoading(true);

    //             const response = await axios.get('/api/data');
    //             setAllGroups(response.data);
    //             setIsLoading(false);
    //         } catch (error) {
    //             console.error('Error fetching or saving data:', error);
    //             setFetchError(error);
    //             setIsLoading(false);
    //         }
    //     };

    //     fetchData();
    // }, []);

	return (
		<div>
			<div className = "px-5 ml-10 mt-10">
				<h1 className="text-2xl font-bold">Browse Clubs</h1>
				<h2 className="text-1xl"> Finding clubs has never been easier</h2>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
			{/* {items.map((item, index) => (
				<div 
				key={index} 
				className="bg-blue-500 h-24 flex items-center justify-center text-white rounded"
				>
				{item}
				</div>
			))} */}
			</div>
			
		</div>
		

    );


}

export default Catalog;