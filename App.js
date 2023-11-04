
// NativeWind Canvas & Engine
import { NativeWindStyleSheet } from "nativewind";

import { useRef, useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, useWindowDimensions } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { View } from "react-native-web";

import Catalog from "./pages/catalog/Catalog";
import Header from "./components/Header";
import Footer from "./components/Footer";


NativeWindStyleSheet.setOutput({
  default: "native",
});


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
            <Header /> {/* In Development */}
            <Catalog currPage={currPage} loade />
            <Footer /> {/* In Development */}
          </View>
        </ScrollView>
      </SafeAreaView>
    </NavigationContainer>
  );
}

export default App;
