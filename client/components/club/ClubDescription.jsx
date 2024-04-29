import React, { useState, useEffect } from 'react';
import { NativeWindStyleSheet } from 'nativewind';
import { Image, Pressable, Text, View } from 'react-native';
import axios from 'axios';

import Leaders from './Leaders';
import Comments from './Comments';


const ClubDescription = ({id, groupData}) => {    
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        const fetchSubscriptionStatus = async () => {
          try {
            const response = await axios.get(`../api/subscriptions/${id}`);
            setIsSubscribed(response.data.isSubscribed);
          } catch (error) {
            console.error('Error fetching subscription status:', error.response?.data);
          }
        };
    
        fetchSubscriptionStatus();
    }, [id]);

    const handleSubscribe = async () => {
        try {
            const response = await axios.post('../api/subscribe', { clubId: id });
            console.log(response);
            setIsSubscribed(response);
        } catch (error) {
            console.error('Error subscribing:', error.response?.data);
        }
    };

    const handleUnsubscribe = async () => {
        try {
            const response = await axios.delete('../api/unsubscribe', { data: { clubId: id } });
        
            console.log(response.data.message);
            setIsSubscribed(!isSubscribed);
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    };

    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });
    
    return (
        <View className="w-full flex-shrink">
            <View className='ph:w-[450] sm:w-[600] lg:w-full'>
                <View className='flex-row items-start'>
                    <View className="w-9 mr-4 mb-2 ph:flex lg:hidden">
                        <Image className="h-9 w-9 rounded-md" source={{ uri: groupData?.logo }} />
                    </View>
                    <Text className="font-bold ph:text-2xl lg:text-3xl mb-3">{ groupData.name }</Text>
                    <View className='ml-2 mt-1'>
                        {/* <svg width="27" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M18.8499 2.19847C16.9718 -0.351964 13.0282 -0.351963 11.1501 2.19847C10.2107 3.47414 8.65156 4.19444 7.02619 4.10365C3.77663 3.92213 1.31788 6.87988 2.22545 9.8787C2.67939 11.3786 2.29432 12.9971 1.20693 14.1596C-0.967079 16.4837 -0.0895604 20.1719 2.92029 21.361C4.42576 21.9557 5.50472 23.2536 5.77412 24.794C6.31275 27.8736 9.86575 29.515 12.7114 27.9989C14.1347 27.2406 15.8653 27.2406 17.2886 27.9989C20.1343 29.515 23.6873 27.8736 24.2259 24.794C24.4953 23.2536 25.5742 21.9557 27.0797 21.361C30.0896 20.1719 30.9671 16.4837 28.7931 14.1596C27.7057 12.9971 27.3206 11.3786 27.7746 9.8787C28.6821 6.87988 26.2234 3.92213 22.9738 4.10365C21.3484 4.19444 19.7893 3.47414 18.8499 2.19847ZM21.9506 12.5621C22.397 12.1067 22.397 11.3684 21.9506 10.913C21.5043 10.4576 20.7807 10.4576 20.3344 10.913L13.7139 17.6679L10.5221 14.4112C10.0758 13.9558 9.35214 13.9558 8.90582 14.4112C8.45951 14.8666 8.45951 15.6049 8.90582 16.0603L12.0977 19.317C12.9903 20.2277 14.4376 20.2277 15.3302 19.317L21.9506 12.5621Z" fill="#0A9DFF"/>
                        </svg> */}
                    </View>
                </View>
                <View className='ph:ml-[53] lg:ml-0'>
                    <Text className="leading-5">{ groupData.mission }</Text>
                </View>
            </View>
            <View className='flex-row justify-between mt-6 ph:ml-[53] lg:ml-0'>
                <View className='flex-row gap-5'>
                    <View className='flex-row items-center'>
                        <View className='mr-2 h-3 w-3 rounded-full bg-sky-500'></View>
                        <Text className='text-[14px]'>Joined</Text>
                    </View>
                    <View className='flex-row items-center'>
                        <View className='mr-2 h-3 w-3 rounded-full bg-green-500'></View>
                        <Text className='text-[14px]'>Opened</Text>
                    </View>
                </View>
                <View>
                    <Text>{groupData.leaders?.length} Members</Text>
                </View>
            </View>

            {groupData.leaders?.length > 0 && <Leaders leaders={groupData.leaders} />}

            <Comments clubId={id} />

            <View className='mt-4 border-[1px] border-gray-100 bg-white rounded-md flex-row justify-between p-4 px-6 items-center'>
                <Text>Don't want to miss events from this club?</Text>
                {!isSubscribed ? (
                    <Pressable onPress={handleSubscribe} className="bg-sky-500 rounded-md py-1.5 px-4">
                        <Text className='text-white'>Subscribe</Text>
                    </Pressable>
                ) : (
                    <Pressable onPress={handleUnsubscribe} className="bg-gray-300 rounded-md py-1.5 px-4">
                        <Text className='text-white'>Unsubscribe</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
    
}

export default ClubDescription;


