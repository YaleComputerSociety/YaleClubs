import { NativeWindStyleSheet } from 'nativewind';

import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalSearchParams } from 'expo-router';

import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { fetchClubs } from '../../../api/FetchClubs';
import SideBar from '../../../components/SideBar';
import ClubDescription from '../../../components/ClubDescription';
import AuthWrapper from '../../../components/AuthWrapper';

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
        <AuthWrapper>
            <SafeAreaView className="w-ful">
                <View className="flex-col w-full min-h-screen">
                    <Header />
                    <View className="py-10 mb-10 w-full flex items-center">
                        <View className="w-[920px]">

                            <View className="w-full flex-row">
                                <View className="w-full flex-shrink mr-10 flex-row">
                                    <View className="mr-5 w-16">
                                        <Image className="h-16 w-16 rounded-full" source={{ uri: groupData?.logo }} />
                                    </View>

                                    <ClubDescription groupData={groupData} />
                                </View>

                                <SideBar
                                    data={{
                                        website: groupData?.website, 
                                        phone: groupData?.phone, 
                                        email: groupData?.email, 
                                        category: groupData?.category
                                    }} 
                                />
                            </View>
                        </View>
                    </View>
                    <Footer />
                </View>
            </SafeAreaView>
        </AuthWrapper>
    );
}

export default ClubPage;
