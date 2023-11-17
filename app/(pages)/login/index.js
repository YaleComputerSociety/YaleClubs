import { NativeWindStyleSheet } from 'nativewind';

import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalSearchParams, useRouter } from 'expo-router';

NativeWindStyleSheet.setOutput({
    default: 'native',
});

const LoginScreen = () => {
    // catch the id and finish login
    const navigation = useRouter();
    const { id } = useGlobalSearchParams();
    
    return (
        <SafeAreaView className="w-ful">
            <View className="flex-col w-full min-h-screen justify-center items-center">
                <Text className="text-4xl font-semibold">Please <Pressable className='text-sky-500'>log in</Pressable></Text>
                <Text className='mt-2'>A valid Yale NetID is required to access club information.</Text>
            </View>
        </SafeAreaView>
    );
}

export default LoginScreen;
