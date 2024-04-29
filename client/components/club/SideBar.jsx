
import { NativeWindStyleSheet } from 'nativewind';
import { useEffect, useState } from 'react';
import axios from 'axios';

import { Pressable, Text, View} from 'react-native';
import AsideItem from './AsideItem';
import SavedSVG from '../../assets/saved';


const SideBar = ({data}) => {
    const [saved, setSaved] = useState(false);

    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });

    const handleSave = async () => {
        try {
            if (saved) {
                const response = await axios.delete(`/api/delete-club/${data.identity}`);
                console.log('Delete successful:', response.data);
                setSaved(false);
            } else {
                // If the club is not saved, save it
                const response = await axios.post('/api/save-club', {
                    clubId: data.identity,
                });
                console.log('Save successful:', response.data);
                setSaved(true);
            }
        } catch (error) {
            console.error('Error handling save/delete:', error);
        }
    };

    // const fetchSubscribersCount = async () => {
    //     try {
    //         const response = await axios.get(`../api/subscriptions/length/${data.identity}`);
    //         setSubscribersCount(response.data.length);
    //     } catch (error) {
    //         console.error('Error fetching subscribers count:', error);
    //     }
    // };

    // useEffect(() => {
    //     const checkClubSaved = async () => {
    //         try {
    //             const response = await axios.get(`/api/check-club/${data.identity}`);
    //             setSaved(response.data.isClubSaved);
    //         } catch (error) {
    //             console.error('Error checking if club is saved:', error);
    //         }
    //     };

    //     checkClubSaved();
    //     // fetchSubscribersCount();
    // }, [data.identity]);
    
    return (
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
                    All Subsribers (0)
                </Text>
            </Pressable>
        </View>
    );
}

export default SideBar;