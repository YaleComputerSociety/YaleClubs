// import { useEffect, useState } from 'react';
// import axios from 'axios';

// const ClubItem = ({ item }) => {

// 	const categories = ["Yale College"];
//     const [logoUri, setLogoUri] = useState(null);

// 	useEffect(() => {
// 		const fetchLogoUri = async () => {
// 			try {
// 				const response = await axios.get('/api/clubs');
// 				console.log('API message:', response.data);
// 				const base64ImageData = response.data;
//                 const uri = `data:image/jpeg;base64,${base64ImageData}`;
// 			} catch (error) {
// 				console.error('Error fetching API message:', error);
// 			}
// 		};
// 		if (item.logo) {
//             // Fetch if Logo Exists
//             fetchLogoUri();
//         }
//     }, [item.logo]);
// }

// export default ClubItem;

"use client";

import React from "react";
import { IClub } from "@/lib/models/Club";
import Image from "next/image";

type ClubCardProps = {
  club: IClub;
  onClick: () => void;
};

const ClubCard = ({ club, onClick }: ClubCardProps) => {
  const categories = club.categories || ["tag1", "tag2", "tag3"]; // Use categories from API if available
  //   const [logoUri, setLogoUri] = useState(null);

  // useEffect(() => {
  //     const fetchLogoUri = async () => {
  //         try {
  //             const response = await axios.get(`/api/clubs/logo/${item._id}`);
  //             const base64ImageData = response.data;
  //             const uri = `data:image/jpeg;base64,${base64ImageData}`;
  //             setLogoUri(uri);
  //         } catch (error) {
  //             console.error('Error fetching logo:', error);
  //             // Use a default logo URI in case of an error
  //             setLogoUri('/default-logo.png');
  //         }
  //     };
  //     if (item.logo) {
  //         fetchLogoUri();
  //     }
  // }, [item.logo, item._id]);

  return (
    <div className="border border-gray-200 rounded-xl p-6 flex flex-col gap-4" onClick={onClick}>
      <div className="flex flex-row items-center gap-4 border-red-400 border-2 justify-between">
        <div className="flex flex-col justify-center">
          <div className="text-3xl font-semibold line-clamp-2 overflow-hidden">{club.name}</div>
          <div className="mt-3 club-tags flex gap-2 flex-wrap">
            {categories.map((tag, index) => (
              <span key={index} className="bg-[#eee] rounded px-2 py-1 text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
        {club.logo && <Image src={club.logo} alt="Club Logo" width={100} height={100} className="rounded-full" />}
      </div>

      {club.description && <p style={{ fontSize: "1em", color: "#333" }}>{club.description}</p>}
      {club.instagram && (
        <a
          href={club.instagram}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#0066cc", textDecoration: "underline" }}
        >
          {club.instagram}
        </a>
      )}
    </div>
  );
};

export default ClubCard;
