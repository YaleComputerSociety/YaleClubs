// import axios from "axios"
//
// export const fetchClub = async (id) => {
//   try {
//       // Make a GET request to the /data route
//       return axios.get(`http://${process.env.BASE_URL}:${process.env.PORT}/api/data/?id=${id}`)
//   } catch (error) {
//       console.error('Error fetching data:', error);
//   }

// };
import axios from "axios"
//
export const fetchClub = async (id) => {
  try {
      // Make a GET request to the /data route
      return axios.get(`http://${process.env.BASE_URL}:${process.env.PORT}/api/data/${id}`);
  } catch (error) {
      console.error('Error fetching data:', error);
  }

};
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
