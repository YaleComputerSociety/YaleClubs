
import { Linking } from 'react-native';
import { useEffect, useState } from 'react';
import { NativeWindStyleSheet } from 'nativewind';

import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatGrid } from 'react-native-super-grid';

import AuthWrapper from '../../../components/AuthWrapper';
import Footer from '../../../components/footer/Footer';
import Header from '../../../components/header/Header';
import Wrapper from '../../../components/Wrapper';
import SearchBar from '../../../components/events/SearchBar';
import EmptySVG from '../../../assets/empty';
import DecoratorSVG from '../../../assets/decorator';

import { reloadEvents, fetchEventsJSON } from '../../../api/ManageEvents';

const Events = () => {   
    const [events, setEvents] = useState([]);
    const [page, setPage] = useState(1);

    // Native Wind SetUp
    NativeWindStyleSheet.setOutput({
        default: 'native',
    });

    const handleScroll = (event) => {
        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
        const isReachingEnd = contentOffset.y + 5000 >= contentSize.height - layoutMeasurement.height;
    
        if (isReachingEnd) {
            setPage(page + 1);
        }
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // await reloadEvents();
                const res = await fetchEventsJSON();
                setEvents(res);
            } catch (error) {
                console.error('Error:', error.message);
            }
        };

        fetchEvents();
    }, []);

    const renderItem = ({ item }) => (
        <Pressable key={ item.uid } className="relative">
            <View className="rounded-md shadow-sm w-full p-5 py-6 flex-row bg-white">
                <View className='w-full flex-col flex-shrink overflow-hidden ml-4 items-start'>
                    <Text numberOfLines={2} className="font-bold text-xl">{ item.summary }</Text>
                    <Text numberOfLines={4} className='w-[90%] mt-2'>{ item.description }</Text>
                    <View className='flex-row mt-3'>
                        <View className='bg-sky-500 rounded-md'>
                            <Text className='text-white py-0.5 px-3'>{ item.time }</Text>
                        </View>
                        <View className='border-[1px] ml-2 border-sky-500 rounded-md'>
                            <Text className='text-sky-500 py-0.5 px-3'>{ item.date }</Text>
                        </View>
                    </View>
                    <Pressable onPress={() => Linking.openURL(item.organizer)} className='flex-row w-[80%] mt-2'><Text numberOfLines={1} className='text-sky-500'>{ item.organizer }</Text></Pressable>
                </View>
                <View className='relative flex-col items-end'>
                    <View className='bg-gray-100 h-20 w-20 items-center justify-center rounded-full'>
                        <EmptySVG h={40} w={33} />
                    </View>
                </View>
            </View>
        </Pressable>
    );
    
    return (
        <AuthWrapper>
            <SafeAreaView className="w-full">
                <ScrollView onScroll={handleScroll} scrollEventThrottle={16} className="h-screen">
                    <View className="flex-col w-full min-h-screen">
                        <Header />
                        <Wrapper>
                            <View className="absolute z-[-10] ph:hidden lg:flex h-[400] left-[-210] top-[-20]">
                                <DecoratorSVG />
                            </View>
                            
                            <View className="ph:mb-0 md:mb-10 w-full flex items-center">
                                <View className="ph:w-full lg:w-[920px]">
                                    <Text className='text-2xl font-bold px-5'>Yale Events</Text>
                                    <Text className='px-5'>Learn, Connect, Have Fun</Text>
                                    <View className='px-5'>
                                        <SearchBar found={events.length} />
                                    </View>
                                    <View>
                                        <FlatGrid
                                            data={events.slice(0, page * 100)}
                                            renderItem={renderItem}
                                            itemContainerStyle={{ justifyContent: 'flex-start' }}
                                            spacing={20}
                                            itemDimension={350}
                                            maxItemsPerRow={4}
                                        />
                                    </View>
                                </View>
                            </View>
                        </Wrapper>
                        <Footer />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </AuthWrapper>
    );

}

export default Events;
