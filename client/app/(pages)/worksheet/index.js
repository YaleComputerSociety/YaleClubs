
import { NativeWindStyleSheet } from 'nativewind';

import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import axios from 'axios';

import AuthWrapper from '../../../components/AuthWrapper';
import Footer from '../../../components/footer/Footer';
import Header from '../../../components/header/Header';
import Wrapper from '../../../components/Wrapper';
import { fetchClubsJSON } from '../../../api/ManageClubs';
import ClubItemWorksheet from '../../../components/worksheet/ClubItemWorksheet';


const Worksheet = () => {   

    // Native Wind SetUp
    NativeWindStyleSheet.setOutput({
        default: 'native',
    });

    const [clubs, setClubs] = useState([]);
    const [savedClubIds, setSavedClubIds] = useState([]);
    const [savedClub, setSavedClub] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/get-saved-clubs');
                const savedClubIds = response.data.savedClubs;
                setSavedClubIds(savedClubIds);
            } catch (error) {
                console.error('Error fetching saved clubs:', error);
            }
        };

        const fetchAllClubs = async () => {
            try {
                const response = await fetchClubsJSON({});
                setClubs(response);
            } catch (error) {
                console.error('Error fetching all clubs:', error);
            }
        };

        fetchData();
        fetchAllClubs();
    }, []);

    useEffect(() => {
        setSavedClub(clubs.filter((club) => savedClubIds.includes(club.id.toString())));
    }, [clubs, savedClubIds]);
    
    return (
        <AuthWrapper>
            <SafeAreaView className="w-full">
                <View className="flex-col w-full min-h-screen">
                    <Header />
                    <Wrapper>
                        <View className="ph:mb-4 lg:mb-10 mx-5 flex">
                            <Text className='text-2xl font-bold'>Worksheet</Text>
                            <Text className=' ph:mb-5 lg:mb-10'>Clubs Management System</Text>
                            <View>
                                <Text className='text-xl font-bold mb-4'>Fix: Your Leading Clubs ({savedClub.length})</Text>
                                <FlatList
                                    data={savedClub}
                                    keyExtractor={(item) => item.id}
                                    horizontal={true}
                                    contentContainerStyle={{ flexDirection: 'row' }}
                                    renderItem={({ item }) => (
                                        <ClubItemWorksheet item={item} />
                                    )}
                                />
                            </View>
                            <View className='mt-4'>
                                <Text className='text-xl font-bold mt-4'>Your Saved Clubs ({savedClub.length})</Text>
                                <FlatList
                                    className='mt-4'
                                    data={savedClub}
                                    keyExtractor={(item) => item.id}
                                    horizontal={true}
                                    contentContainerStyle={{ flexDirection: 'row' }}
                                    renderItem={({ item }) => (
                                        <ClubItemWorksheet item={item} />
                                    )}
                                />
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
