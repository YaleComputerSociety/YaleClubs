import { NativeWindStyleSheet } from 'nativewind';

import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalSearchParams } from 'expo-router';

import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { fetchClubs } from '../../../api/FetchClubs';
import SideBar from '../../../components/SideBar';

NativeWindStyleSheet.setOutput({
    default: 'native',
});


const ClubPage = () => {
    const { id } = useGlobalSearchParams();
    const [groupData, setGroupData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchClubs({ filters: { id: id } });
                setGroupData(data[0]);
            } catch (error) {
                // Log Values (In Development)
                console.error('Error fetching club data:', error);
            }
        };
    
        fetchData();
    }, [id]);

    return (
        <SafeAreaView className="w-ful">
            <View className="flex-col w-full min-h-screen">
                <Header />
                <View className="py-10 mb-10 w-full flex items-center">
                    <View className="w-[920px]">

                        <View className='w-full flex-row'>
                            <View className='w-full flex-shrink bg-red-50 mr-10'>
                                <Text className="font-bold text-xl mb-3">Club ID: { id }</Text>
                                <Text>Group Data Requested by ID: {JSON.stringify(groupData)}</Text>
                            </View>
                            <SideBar />
                        </View>

                    </View>
                </View>
                <Footer />
            </View>
        </SafeAreaView>
    );
}

export default ClubPage;
