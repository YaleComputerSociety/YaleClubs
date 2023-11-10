import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// NativeWind Canvas & Engine
import { NativeWindStyleSheet } from "nativewind";

import { useRef, useState } from "react";
import { SafeAreaView, ScrollView, Text, useWindowDimensions } from "react-native";
import { View } from "react-native";

import Catalog from "../components/Catalog";
import Header from "../components/Header";
import Footer from "../components/Footer";


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
        <SafeAreaView className="w-full">
            <ScrollView
            style={{ height: windowHeight }}
            onScroll={handleScroll}
            ref={scrollViewRef}
            >
            <View className="flex-col w-full min-h-screen">
                <Header />
                <Catalog currPage={currPage} />
                <Footer />
            </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default App;
