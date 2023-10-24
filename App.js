
// React Native
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';

// Components
import { fetchClubs } from './api/fetchClubs';
import { Text, View } from 'react-native';

// NativeWind Canvas & Engine
import { NativeWindStyleSheet } from "nativewind";
NativeWindStyleSheet.setOutput({
  default: "native",
});

const App = () => {
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
    <NavigationContainer documentTitle={{ enabled: false }}>
      <View className="flex-1 flex items-center justify-center bg-blue-950">
        <Text className="font-bold text-white mb-2 text-lg">Hello NativeWind! List of Clubs:</Text>
        {groups.map((group, index) => (
          <Text className="font-normal mb-1 text-white" key={index}>{group.name}</Text>
        ))}
      </View>
    </NavigationContainer>
  );
}

export default App;
