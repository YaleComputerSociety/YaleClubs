
import { NativeWindStyleSheet } from 'nativewind';

import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalSearchParams } from 'expo-router';
import axios from 'axios';

import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import SideBar from '../../../components/club/SideBar';
import ClubDescription from '../../../components/club/ClubDescription';
import AuthWrapper from '../../../components/AuthWrapper';
import DecoratorSVG from '../../../assets/decorator';
import Wrapper from '../../../components/Wrapper';
import EmptySVG from '../../../assets/empty';


const ClubPage = () => {
    const { id } = useGlobalSearchParams();
    const [groupData, setGroupData] = useState([]);
    const [logoUri, setLogoUri] = useState(null);

    NativeWindStyleSheet.setOutput({
        default: "native",
    });

    // Fetch Clubs
    useEffect(() => {
        const fetchData = async () => {
            try {
                const resp = await axios.get(`/api/data/${id}`);
                setGroupData(resp.data); // Access the data property of the response
            } catch (error) {
                console.error('Error fetching club data:', error);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        const fetchLogoUri = async () => {
            try {
                const response = await axios.get(`/api/logo/${groupData.logo}`);
                const base64ImageData = response.data;
                const uri = `data:image/jpeg;base64,${base64ImageData}`;
                setLogoUri(uri);
            } catch (error) {
                console.error('Error fetching logo data:', error);
            }
        };

        if (groupData?.logo) {
            fetchLogoUri();
        }
    }, [groupData]);
    
    return (
        <AuthWrapper>
            <SafeAreaView className="w-full">
                <View className="flex-col w-full min-h-screen">
                    <Header />
                    <View className="mb-10 w-full flex items-center">
                        <Wrapper>
                            <View className="absolute z-[-10] ph:hidden lg:flex h-[400] left-[-210] top-[-20]">
                                <DecoratorSVG />
                            </View>

                            <View className="w-full ph:flex-col-reverse lg:flex-row ph:px-5 lg:p-0">
                                <View className="w-full flex-shrink mr-10 ph:flex-col lg:flex-row">
                                    <View className="w-16 mr-5 ph:hidden lg:flex shadow-none">
                                        {logoUri ? (
                                            <Image className="h-16 w-16 rounded-md" source={{ uri: logoUri }} />
                                        ) : (
                                            <View className='items-center bg-gray-200 h-16 rounded-md justify-center'>
                                                <EmptySVG h={30} w={30} />
                                            </View>
                                        )}
                                    </View>
                                    
                                    <ClubDescription id={id} groupData={groupData} />
                                </View>

                                <SideBar
                                    data={{
                                        instagram: groupData?.instagram,
                                        email: groupData?.email,
                                        website: groupData?.website, 
                                        yaleConnect: groupData?.yaleConnect,
                                    }} 
                                />
                            </View>
                        </Wrapper>
                    </View>
                    <Footer />
                </View>
            </SafeAreaView>
        </AuthWrapper>
    );
}

export default ClubPage;
