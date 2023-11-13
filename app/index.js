import * as React from 'react';

// NativeWind Canvas & Engine
import { NativeWindStyleSheet } from "nativewind";

import { SafeAreaView, ScrollView, useWindowDimensions, Animated } from "react-native";
import { View } from "react-native";

import Catalog from "../components/Catalog";
import Header from "../components/Header";
import Footer from "../components/Footer";

NativeWindStyleSheet.setOutput({
    default: "native",
});
  

const App = () => {
    const { height: windowHeight } = useWindowDimensions();

    return (
        <SafeAreaView className="w-full">
            <ScrollView
                style={{ height: windowHeight }}
            >
                <View className="flex-col w-full min-h-screen">
                    <Header />
                    <Catalog />
                    <Footer />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

export default App;
