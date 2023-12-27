
import axios from "axios";

export const reloadEvents = async () => {
  await axios.get(`${process.env.SERVER_URL}/save-events`);
}

export const fetchEventsJSON = async () => {
  try {
      const response = await axios.get(`${process.env.SERVER_URL}/events`, { withCredentials: true });
      return response.data;
  } catch (error) {
      console.error('Error fetching events:', error);
  }
};