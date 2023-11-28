
import { NativeWindStyleSheet } from "nativewind";
import { useState } from "react";

import { 
    View, 
    SafeAreaView, 
    ScrollView,
} from "react-native";
    
import AuthWrapper from '../components/AuthWrapper';
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import Catalog from "../components/catalog/Catalog";
  

const App = () => {
    const [page, setPage] = useState(1);

    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });

    const handleScroll = (event) => {
        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
        const isReachingEnd = contentOffset.y + 5000 >= contentSize.height - layoutMeasurement.height;
    
        if (isReachingEnd) {
            setPage(page + 1);
        }
    };

    return (
        <AuthWrapper>
            <SafeAreaView className="w-full">
                <ScrollView onScroll={handleScroll} scrollEventThrottle={16} className="h-screen">
                    <View className="flex-col w-full min-h-screen">
                        <Header />
                        <Catalog page={page} setPage={setPage} />
                        <Footer />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </AuthWrapper>
    );

}

export default App;
