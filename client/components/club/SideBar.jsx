
import { Pressable, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeWindStyleSheet } from 'nativewind';
import { useEffect, useState } from 'react';
import axios from 'axios';

import AsideItem from './AsideItem';
import SavedSVG from '../../assets/saved';
import AuthProvider from '../../context/AuthProvider';

const SideBar = ({data}) => {
    const [saved, setSaved] = useState(false);
    const [subscribersCount, setSubscribersCount] = useState(0);

    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });

    const handleSave = async () => {
        const token = await AsyncStorage.getItem('token');

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
        
            if (saved) {
                const response = await axios.delete(
                    `${process.env.SERVER_URL}/club`,
                    {
                        data: {
                            clubId: data.identity,
                        },
                        ...config
                    }
                );
                console.log('Deleted successful:', response.data);
                setSaved(false);
            } else {
                // If the club is not saved, save it
                const response = await axios.post(
                    `${process.env.SERVER_URL}/club`,
                    {
                        clubId: data.identity,
                    },
                    config
                );
                console.log('Saved successful:', response.data);
                setSaved(true);
            }
        } catch (error) {
            console.error('Error handling save/delete:', error);
        }
    };
      
    const fetchSubscribersCount = async () => {
        const token = await AsyncStorage.getItem('token');
    
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
    
            const response = await axios.get(
                `${process.env.SERVER_URL}/subscriptions/length/${data.identity}`,
                config
            );
            setSubscribersCount(response.data.length);
        } catch (error) {
            console.error('Error fetching subscribers count:', error);
        }
    };
    
    useEffect(() => {
        const checkClubSaved = async () => {
            const token = await AsyncStorage.getItem('token');

            try {
                const response = await axios.get(
                    `${process.env.SERVER_URL}/check-club/${data.identity}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
    
                setSaved(response.data.isClubSaved);
            } catch (error) {
                console.error('Error checking if club is saved:', error);
            }
        };
    
        checkClubSaved();
        fetchSubscribersCount();
    }, [data.identity]);
    
    
    return (
        <AuthProvider>
            <View className='w-[220] ph:hidden lg:flex'>
                <View className='flex-row'>
                    <Pressable className='w-full flex-shrink flex justify-center items-center border-[1px] border-sky-500 rounded-md'>
                        <Text className='text-sky-500'>Application From</Text>
                    </Pressable>
                    <Pressable onPress={handleSave} className="w-7 ml-2 items-end">
                        <SavedSVG saved={saved} />
                    </Pressable>
                </View>

                <View className='mt-10'>
                    <AsideItem data={data} />
                </View>

                <Pressable className='border-[1px] py-1 mt-2 border-gray-200 justify-center items-center rounded-md'>
                    <Text className='text-gray-400'>
                        All Subsribers ({subscribersCount})
                    </Text>
                </Pressable>
            </View>
        </AuthProvider>
    );
}

export default SideBar;