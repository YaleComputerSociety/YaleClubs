import { NativeWindStyleSheet } from 'nativewind';
import { Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import {get_cas_link} from "../../../api/CasAuth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

if (Platform.OS === 'ios') {
    WebBrowser.dismissBrowser();
} else {
    WebBrowser.maybeCompleteAuthSession();
}

const LoginScreen = () => {
    const router = useRouter();

    // Native Wind SetUp
    NativeWindStyleSheet.setOutput({
        default: 'native',
    });

    const redirect_to_cas = async () => {
        // OpenAuthSessionAsync allows WEB Share the Session with App
        const redirectUrl = Linking.createURL('/login');
        const browserOptions = {
            preferEphemeralSession: true
         }
        const { type, url } = await WebBrowser.openAuthSessionAsync(get_cas_link(), redirectUrl, browserOptions);

        if (type === 'success' && url) {
            // Extract token from the URL (assuming it's present in the query parameters)
            const queryParams = Linking.parse(url).queryParams;
            const token = queryParams && queryParams.token;
            await AsyncStorage.setItem('token', token);
        }

        router.push("/");
    };

    return (
        <SafeAreaView className="w-ful h-full justify-center flex-col">
            <View className="flex-col w-full min-h-screen justify-center items-center">
                <Text className="text-4xl font-semibold">
                    <Pressable onPress={() => router.push("/")}><Text className='text-4xl font-semibold'>Please <Text className='text-sky-500'>log in</Text></Text></Pressable>
                </Text>
                <Text className='ph:mt-0 md:mt-2 ph:w-[300px] md:w-full text-center leading-5'>A valid Yale NetID is required to access YaleClubs information.</Text>
                <Pressable onPress={redirect_to_cas} className='bg-sky-500 p-7 py-2.5 rounded-md mt-7'><Text className='text-white'>Log in with CAS</Text></Pressable>
            </View>
            <View className="bottom-5 absolute rounded-md w-full overflow-hidden justify-center flex-row">
                <Text className='ph:w-[315] md:hidden text-[8px] text-center text-gray-400 leading-3'>This directory is intended for official University use and for individual communication, club advertisement of a business or incidental personal nature between individuals who are included in the facebook/directory. No other uses are permitted, including but not limited to using the addresses or other information for any private, commercial or political mailing or other purposes.</Text>
            </View>
        </SafeAreaView>
    );
}

export default LoginScreen;
