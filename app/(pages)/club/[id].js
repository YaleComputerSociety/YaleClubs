import { NativeWindStyleSheet } from 'nativewind';

import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalSearchParams } from 'expo-router';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

NativeWindStyleSheet.setOutput({
    default: 'native',
});


const ClubPage = () => {
    const { id } = useGlobalSearchParams();

    return (
        <SafeAreaView className="w-ful">
            <View className="flex-col w-full min-h-screen">
                <Header />
                <View className="py-10 mb-10 w-full flex items-center">
                    <View className="w-[920px] bg-red-100">
                        <Text>Club ID: { id }</Text>
                    </View>
                </View>
                <Footer />
            </View>
        </SafeAreaView>
    );
}

export default ClubPage;
