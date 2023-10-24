import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { fetchClubs } from './api/fetchClubs';


export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const data = await fetchClubs();
            console.log(data);
            setGroups(data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setIsLoading(false);
        }
    };

    fetchData();
  }, []);

  return (
      // must wrap in NavigationContainer for React-Navigation to work
      <NavigationContainer>
        <Text>Hello World!</Text>
      </NavigationContainer>
  );
}

