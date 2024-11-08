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

import React from "react";
import { IClub } from "@/lib/models/Club";

type ClubItemProps = {
  club: IClub;
};

const ClubItem = ({ club }: ClubItemProps) => {
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
    <div
      className="club-item-card"
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        margin: "16px",
      }}
    >
      <div className="club-header" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* {logoUri && (
                    <img src={logoUri} alt="Club Logo" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
                )} */}
        <div>
          <h3 style={{ fontSize: "1.5em", fontWeight: "bold", margin: 0 }}>{club.clubName}</h3>
          {<p style={{ color: "#555", margin: 0 }}></p>}
        </div>
      </div>
      <div className="club-tags" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {categories.map((tag, index) => (
          <span
            key={index}
            style={{
              backgroundColor: "#f0f0f0",
              borderRadius: "4px",
              padding: "6px 12px",
              fontSize: "0.9em",
            }}
          >
            {tag}
          </span>
        ))}
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

export default ClubItem;
