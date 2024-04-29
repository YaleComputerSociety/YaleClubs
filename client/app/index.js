
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeWindStyleSheet } from "nativewind";
import { useEffect, useState } from "react";
import axios from "axios";

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

    // Handle On Login
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                // Retrieve the userid from AsyncStorage
                const userid = await AsyncStorage.getItem('userid');

                // If userid doesn't exist, fetch it from the API session
                if (!userid) {
                    const response = await axios.get('/api/auth/userid');

                    if (response.data) {
                        // Save the userid to AsyncStorage
                        console.log(response.data.netID);
                        await AsyncStorage.setItem('userid', response.data.netID);
                    }
                }
            } catch (error) {
                console.error('Error fetching/saving userid:', error);
            }
        };

        fetchUserId();
    }, []);

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
