import { NativeWindStyleSheet } from "nativewind";
import { useRef, useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, useWindowDimensions } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from "react-native-web";

import Catalog from "./pages/catalog/Catalog";
import ClubDetails from "./pages/clubDetails/ClubDetails";
import Header from "./components/Header";
import Footer from "./components/Footer";

NativeWindStyleSheet.setOutput({
  default: "native",
});

const Stack = createNativeStackNavigator();

const App = () => {
  const { height: windowHeight } = useWindowDimensions();
  const scrollViewRef = useRef();
  const [currPage, setPage] = useState(1);

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 1) {
      setPage(currPage + 1);
    }
  };

  return (
    <NavigationContainer documentTitle={{ enabled: false }}>
      <SafeAreaView className="w-full">
        <ScrollView
          style={{ height: windowHeight }}
          onScroll={handleScroll}
          ref={scrollViewRef}
        >
          <View className="flex-col w-full min-h-screen">
            <Header />
            <Stack.Navigator>
              <Stack.Screen name="Catalog" component={Catalog} initialParams={{ currPage: currPage }} options={{ title: 'Catalog' }} />
              <Stack.Screen name="ClubDetails" component={ClubDetails} options={{ title: 'Club Details' }} />
            </Stack.Navigator>
            <Footer />
          </View>
        </ScrollView>
      </SafeAreaView>
    </NavigationContainer>
  );
}

export default App;
