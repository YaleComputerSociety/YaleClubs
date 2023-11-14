import { NativeWindStyleSheet } from 'nativewind';

import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalSearchParams } from 'expo-router';

import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { fetchClubs } from '../../../api/FetchClubs';
import SideBar from '../../../components/SideBar';

NativeWindStyleSheet.setOutput({
    default: 'native',
});

const LeaderNames = (groupData) => {
    const leadersArray = groupData.leaders;
    const names = []
    if (Array.isArray(leadersArray)) {
        for (let i = 0; i < leadersArray.length; i++) {
            const leader = leadersArray[i];
            names.push(leader.netid);
            console.log("test ", leader.netid);
        }
    } else {
        console.log("leadersArray is not an array or is null/undefined");
    }
    return names;
}

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
    
    const leaderNames = LeaderNames(groupData);
    console.log(leaderNames);

    const Card = ({ children }) => {
        return (
            <div className="bg-white p-4 mb-4 shadow-md rounded-md">
                {children}
            </div>
        );
    };

    return (
        <SafeAreaView className="w-ful">
            <View className="flex-col w-full min-h-screen">
                <Header />
                <View className="py-10 mb-10 w-full flex items-center">
                    <View className="w-[920px]">

                        <View className="w-full flex-row">
                            <View className="w-full flex-shrink mr-10 flex-row">
                                <View className="mr-5 w-16">
                                    <Image className="h-16 w-16 rounded-full" source={{ uri: groupData.logo }} />
                                </View>

                                <View className="w-full flex-shrink">
                                    <View className='flex-row items-start'>
                                        <Text className="font-bold text-3xl mb-3">{ groupData.name }</Text>
                                        <View className='ml-2 mt-1'>
                                            <svg width="27" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M18.8499 2.19847C16.9718 -0.351964 13.0282 -0.351963 11.1501 2.19847C10.2107 3.47414 8.65156 4.19444 7.02619 4.10365C3.77663 3.92213 1.31788 6.87988 2.22545 9.8787C2.67939 11.3786 2.29432 12.9971 1.20693 14.1596C-0.967079 16.4837 -0.0895604 20.1719 2.92029 21.361C4.42576 21.9557 5.50472 23.2536 5.77412 24.794C6.31275 27.8736 9.86575 29.515 12.7114 27.9989C14.1347 27.2406 15.8653 27.2406 17.2886 27.9989C20.1343 29.515 23.6873 27.8736 24.2259 24.794C24.4953 23.2536 25.5742 21.9557 27.0797 21.361C30.0896 20.1719 30.9671 16.4837 28.7931 14.1596C27.7057 12.9971 27.3206 11.3786 27.7746 9.8787C28.6821 6.87988 26.2234 3.92213 22.9738 4.10365C21.3484 4.19444 19.7893 3.47414 18.8499 2.19847ZM21.9506 12.5621C22.397 12.1067 22.397 11.3684 21.9506 10.913C21.5043 10.4576 20.7807 10.4576 20.3344 10.913L13.7139 17.6679L10.5221 14.4112C10.0758 13.9558 9.35214 13.9558 8.90582 14.4112C8.45951 14.8666 8.45951 15.6049 8.90582 16.0603L12.0977 19.317C12.9903 20.2277 14.4376 20.2277 15.3302 19.317L21.9506 12.5621Z" fill="#0A9DFF"/>
                                            </svg>
                                        </View>
                                    </View>
                                    <View>
                                        <Text>{ groupData.mission }</Text>
                                        {/* <Text>Group Data Requested by ID: {JSON.stringify(groupData, null, 4)}</Text> */}
                                        {/* <Text>{ groupData.leaders.some((product) => product.email == "hi") }</Text> */}
                                        {/* <Text>{ (5 == 5)?'true':'false' }</Text> */}
                                    </View>
                                    <View>
                                        <Text className="font-bold text-2xl mb-3">Leaders</Text>
                                        <View>
                                            {leaderNames.map((leaderName, index) => (
                                                <View key={index} class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                                                    <Text key={index}>{leaderName}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <SideBar 
                                data={{
                                    website: groupData.website, 
                                    phone: groupData.phone, 
                                    email: groupData.email, 
                                    category: groupData.category
                                }} 
                            />
                        </View>
                    </View>
                </View>
                <Footer />
            </View>
        </SafeAreaView>
    );
}

export default ClubPage;
