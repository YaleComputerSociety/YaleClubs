
import axios from "axios";

export const reloadEvents = async () => {
  await axios.get('/api/save-events');
}

export const fetchEventsJSON = async () => {
  try {
      const response = await axios.get('/api/events');
      return response.data;
  } catch (error) {
      console.error('Error fetching data:', error);
  }
};