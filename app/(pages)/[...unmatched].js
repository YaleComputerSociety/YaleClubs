import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const Unmatched = () => {
    return (
        <SafeAreaView className="w-ful">
            <View className="flex-col w-full min-h-screen">
                <Header />
                <View className="py-10 mb-10 w-full flex items-center">
                    <View className="w-[920px] bg-red-100">
                        <Text>This page is not found.</Text>
                    </View>
                </View>
                <Footer />
            </View>
        </SafeAreaView>
    );
}

export default Unmatched;
