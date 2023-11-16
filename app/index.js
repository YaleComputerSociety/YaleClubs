
import { NativeWindStyleSheet } from "nativewind";

import { 
    View, 
    SafeAreaView, 
    ScrollView, 
    useWindowDimensions } from "react-native";
    
import AuthWrapper from '../components/AuthWrapper';
import Catalog from "../components/Catalog";
import Header from "../components/Header";
import Footer from "../components/Footer";
    
// NativeWind Canvas & Engine
NativeWindStyleSheet.setOutput({
    default: "native",
});
  

const App = () => {
    const { height: windowHeight } = useWindowDimensions();

    return (
        <AuthWrapper>
            <SafeAreaView className="w-full">
                <ScrollView style={{ height: windowHeight }}>
                    <View className="flex-col w-full min-h-screen">
                        <Header />
                        <Catalog />
                        <Footer />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </AuthWrapper>
    );
}

export default App;
