import { NativeWindStyleSheet } from 'nativewind';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AsyncStorage } from 'react-native';
import {get_cas_link} from "../../../api/CasAuth";
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import axios from 'axios';

const LoginScreen = () => {
    // Native Wind SetUp
    NativeWindStyleSheet.setOutput({
        default: 'native',
    });
    
    const router = useRouter();
    
    const redirect_to_cas = async () => {
        const casLink = get_cas_link();
        await Linking.openURL(casLink);
    }

    return (
        <SafeAreaView className="w-ful">
            <View className="flex-col w-full min-h-screen justify-center items-center">
                <Text className="text-4xl font-semibold">
                    Please <Pressable onPress={redirect_to_cas}><Text className='text-sky-500'>log in</Text></Pressable></Text>
                <Text className='mt-2'>A valid Yale NetID is required to access club information.</Text>
            </View>
        </SafeAreaView>
    );
    
}

export default LoginScreen;
