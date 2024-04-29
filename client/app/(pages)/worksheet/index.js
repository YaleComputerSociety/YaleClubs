
import { NativeWindStyleSheet } from 'nativewind';

import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';

import ClubItemWorksheet from '../../../components/worksheet/ClubItemWorksheet';
import AuthWrapper from '../../../components/AuthWrapper';
import Footer from '../../../components/footer/Footer';
import Header from '../../../components/header/Header';
import DecoratorSVG from '../../../assets/decorator';
import Wrapper from '../../../components/Wrapper';


const Worksheet = () => {
    const navigation = useRouter();

    // Native Wind SetUp
    NativeWindStyleSheet.setOutput({
        default: 'native',
    });

    const [clubs, setClubs] = useState([]);
    const [savedClubIds, setSavedClubIds] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch clubs where the user ID exists in the leaders array
                const response = await axios.get(`/api/auth/userid`);
                const userID = response.data.netID;
                const userClubsResponse = await axios.get(`/api/data/by/${userID}`);
                setClubs(userClubsResponse.data);
            } catch (error) {
                console.error('Error fetching user clubs:', error);
            }
        };
    
        fetchData();
    }, []);

    return (
        <AuthWrapper>
            <SafeAreaView className="w-full">
                <View className="flex-col w-full min-h-screen">
                    <Header />
                    <Wrapper>
                        <View className="absolute z-[-10] ph:hidden lg:flex h-[400] left-[-210] top-[-20]">
                            <DecoratorSVG />
                        </View>

                        <View className="ph:mb-4 lg:mb-10 mx-5 flex">
                            <View className='flex-row justify-between items-end ph:mb-5 lg:mb-10'>
                                <View>
                                    <Text className='text-2xl font-bold'>Worksheet & Leader Board</Text>
                                    <Text>Saved Clubs & Club Management System</Text>
                                </View>
                                <Pressable onPress={() => navigation.push('/crm/0')} className='border-sky-500 border-[1px] rounded-md p-2 px-5 justify-center'>
                                    <Text className='text-sky-500'>Register the Club</Text>
                                </Pressable>
                            </View>
                            <View className='mt-4'>
                                {clubs.length > 0 ? (
                                    <>
                                        <Text className='text-xl font-bold mt-4'>You'are Admin at {clubs.length} Club{clubs.length === 1 ? '' : 's'}</Text>
                                        <FlatList
                                            className='mt-4'
                                            data={clubs}
                                            keyExtractor={(item) => item._id}
                                            horizontal={true}
                                            contentContainerStyle={{ flexDirection: 'row' }}
                                            renderItem={({ item }) => (
                                                <ClubItemWorksheet item={item} />
                                            )}
                                        />
                                    </>
                                ) : (
                                    <View className='mt-4 flex-col'><Text>No results has been found.</Text><Text className='text-sky-500 mt-1'>How to register?</Text></View>
                                )}
                            </View>
                        </View>
                    </Wrapper>
                    <Footer />
                </View>
            </SafeAreaView>
        </AuthWrapper>
    );

}

export default Worksheet;
