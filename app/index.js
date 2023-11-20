
import { NativeWindStyleSheet } from "nativewind";

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

    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });

    return (
        <AuthWrapper>
            <SafeAreaView className="w-full">
                <ScrollView>
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
