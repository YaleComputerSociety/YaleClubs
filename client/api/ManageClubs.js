import axios from "axios"

export const reloadClubs = async () => {
  // const clubsdaily = await fetchClubsAPI({});
  // const filteredClubs = filterClubs(clubsdaily)
  await updateData(filteredClubs);
}
//
// export const fetchClubsJSON = async () => {
//   try {
//       // Make a GET request to the /data route
//       const response = await axios.get(`http://${process.env.BASE_URL}:${process.env.PORT}/api/data`);
//
//       // Extract the data from the response
//       const data =  response.data;
//       const exclude = "https://yaleconnect.yale.edu/images/Redirect_arrow_small.png";
//       const shuffledData = _shuffle(data.filter(item => item.logo !== null && item.logo !== exclude));
//       const nullLogoData = data.filter(item => item.logo === null || item.logo === exclude);
//       const final = shuffledData.concat(nullLogoData);
//
//       if (data !== undefined) {
//         return final
//       }
//
//       // Log or use the retrieved data as needed
//       console.log('Data received:', data);
//   } catch (error) {
//       console.error('Error fetching data:', error);
//   }
// };
//
// export const filterClubs = (clubs) => {
//   return clubs.map((club) => {
//     const { id, name, category, mission, website, logo } = club;
//     return { id, name, category, mission, website, logo };
//   });
// }
//
// export const updateData = async (newData) => {
//   try {
//     // Split the newData array into chunks of 100
//     const chunkSize = 100;
//     const chunkedData = [];
//     for (let i = 0; i < newData.length; i += chunkSize) {
//       chunkedData.push(newData.slice(i, i + chunkSize));
//     }
//
//     // Process each chunk and send a POST request
//     for (const chunk of chunkedData) {
//       // Make a POST request to the /data route with the chunk of data
//       const response = await axios.post(`http://${process.env.BASE_URL}:${process.env.PORT}/api/data`, chunk);
//
//       // Extract the data from the response
//       const updatedData = response.data;
//
//       // Log or use the updated data as needed
//       console.log('Data updated:', updatedData);
//     }
//   } catch (error) {
//     console.error('Error updating data:', error);
//   }
// };

export const fetchClubsAPI = async (defaultPayload) => {
  return await axios.post(`http://${process.env.BASE_URL}:${process.env.PORT}/api/data`)
}

