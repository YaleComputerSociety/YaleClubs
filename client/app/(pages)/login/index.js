import { NativeWindStyleSheet } from 'nativewind';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking'
import {get_cas_link} from "../../../api/CasAuth";

function redirect_to_cas() {
    Linking.openURL(get_cas_link())
}

const LoginScreen = () => {
    // Native Wind SetUp
    NativeWindStyleSheet.setOutput({
        default: 'native',
    });

    return (
        <SafeAreaView className="w-ful">
            <View className="flex-col w-full min-h-screen justify-center items-center">
                <Text className="text-4xl font-semibold">
                    Please <Pressable className='text-sky-500' onPress={redirect_to_cas}>log in</Pressable></Text>
                <Text className='mt-2'>A valid Yale NetID is required to access club information.</Text>
            </View>
        </SafeAreaView>
    );
    
}

export default LoginScreen;
