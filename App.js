
// React Native
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';

// Components
import { fetchClubs } from './api/fetchClubs';
import { Text, View, Image, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';

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

  // format:
  // 1. id
  // 2. name
  // 3. address
  // 4. category
  // 5. email
  // 6. leaders: list
  // 7. logo
  // 8. mission
  // 9. phone
  // 10. type
  // 11. website
  // 12. benefits
  // 13. constitution

  const renderItem = ({ item }) => (
    <TouchableOpacity key={item.id}>
      <View>
        <Text className="font-normal mb-1 flex">{item.id}</Text>
        <Text className="font-normal mb-1">{item.name}</Text>
        <Text className="font-normal mb-1">{item.email}</Text>
        <Text className="font-normal mb-1">{item.website}</Text>
        <Text className="font-normal mb-1">{item.address}</Text>
        <Text className="font-normal mb-1">{item.category}</Text>
        <Text className="font-normal mb-1">{item.leaders}</Text>
        <Image source={{ uri: item.logo }} />
        <Text className="font-normal mb-1">{item.mission}</Text>
        <Text className="font-normal mb-1">{item.type}</Text>
        <Text className="font-normal mb-1">{item.benefits}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <NavigationContainer documentTitle={{ enabled: false }}>
      <View className="bg-gray-200">
        <Text className="font-bold mb-5 text-lg">List of Clubs:</Text>
        <SafeAreaView>
          <FlatList
            data={groups}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        </SafeAreaView>
      </View>
    </NavigationContainer>
  );
}

export default App;
