
import { NativeWindStyleSheet } from "nativewind";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AuthWrapper from "../../components/AuthWrapper";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";

const styles = {
    safeAreaView: {
        width: '100%',
    },
    flexCol: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text4xl: {
        fontSize: '2.25rem',
        fontWeight: '600',
    },
    mt2: {
        marginTop: '0.5rem',
    },
    textSky500: {
        color: '#00c2e0',
    },
};

const Unmatched = () => {
    
    // Native Wind SetUp   
    NativeWindStyleSheet.setOutput({
        default: 'native',
    });

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <AuthWrapper>
                <Header />
            </AuthWrapper>
            <View  style={styles.flexCol}>
                <Text style={styles.text4xl}>
                    Page not found
                </Text>
                <Text style={styles.mt2}>
                    If you think this is an error, please <Pressable style={styles.textSky500}>let us know</Pressable> and we will take a look.
                </Text>
            </View>
            <Footer />
        </SafeAreaView>
    );
    
}

export default Unmatched;
