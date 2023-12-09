
import { NativeWindStyleSheet } from 'nativewind';

import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatGrid } from 'react-native-super-grid';

import AuthWrapper from '../../../components/AuthWrapper';
import Footer from '../../../components/footer/Footer';
import Header from '../../../components/header/Header';
import Wrapper from '../../../components/Wrapper';
import SearchBar from '../../../components/events/SearchBar';
import EmptySVG from '../../../assets/empty';
import DecoratorSVG from '../../../assets/decorator';


const events = [
    { id: 1, title: 'Y/CS DEMO Day', description: 'Description from the Google Calendar. Parsed by ICAL package. Saved by Express.js, MongoDB, and Multer.', time: '4PM', date: '9th of December', club: 'Yale Computer Society'  },
    { id: 2, title: 'Another Event', description: 'Description from the Google Calendar. Parsed by ICAL package. Saved by Express.js, MongoDB, and Multer.', time: '2PM', date: '23th of December', club: 'Another Club'   },
    { id: 3, title: 'Another Event', description: 'Description from the Google Calendar. Parsed by ICAL package. Saved by Express.js, MongoDB, and Multer.', time: '1PM', date: '3rd of January', club: 'Another Club (Extremely Long Name Example)'   },
    { id: 4, title: 'Another Event', description: 'Description from the Google Calendar. Parsed by ICAL package. Saved by Express.js, MongoDB, and Multer.', time: '11AM', date: '8th of January', club: 'Yale Computer Society'   },
    { id: 5, title: 'Another Event', description: 'Description from the Google Calendar. Parsed by ICAL package. Saved by Express.js, MongoDB, and Multer.', time: '7PM', date: '15th of January', club: 'Yale Computer Society'   },
    { id: 6, title: 'Another Event', description: 'Description from the Google Calendar. Parsed by ICAL package. Saved by Express.js, MongoDB, and Multer.', time: '9PM', date: '20th of January', club: 'Yale Computer Society'   },
    { id: 7, title: 'Another Event', description: 'Description from the Google Calendar. Parsed by ICAL package. Saved by Express.js, MongoDB, and Multer.', time: '11PM', date: '12th of March', club: 'Yale Computer Society'   },
    { id: 8, title: 'Another Event', description: 'Description from the Google Calendar. Parsed by ICAL package. Saved by Express.js, MongoDB, and Multer.', time: '7PM', date: '23rd of March', club: 'Yale Computer Society'   },
    { id: 9, title: 'Another Event', description: 'Description from the Google Calendar. Parsed by ICAL package. Saved by Express.js, MongoDB, and Multer.', time: '5PM', date: '27th of March', club: 'Yale Computer Society'   },
];


const Events = () => {   

    // Native Wind SetUp
    NativeWindStyleSheet.setOutput({
        default: 'native',
    });

    const renderItem = ({ item }) => (
        <Pressable key={item.id} className="relative" onPress={() => null}>
            <View className="rounded-md shadow-sm w-full p-5 py-6 flex-row bg-white">
                <View className='w-full flex-col flex-shrink overflow-hidden ml-4 items-start'>
                    <Text numberOfLines={2} className="font-bold text-xl">{ item.title }</Text>
                    <Text numberOfLines={4} className='w-[90%] mt-3'>{ item.description }</Text>
                    <View className='flex-row mt-3'>
                        <View className='bg-sky-500 rounded-md'>
                            <Text className='text-white py-0.5 px-2'>{ item.time }</Text>
                        </View>
                        <View className='border-sky-500 border-[1px] ml-2 rounded-md'>
                            <Text className='text-sky-500 py-0.5 px-2'>{ item.date }r</Text>
                        </View>
                    </View>
                    <View className='flex-row w-[80%] mt-3'><Text>By</Text><Text numberOfLines={1} className='text-sky-500 ml-1'>{ item.club }</Text></View>
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
                                    <SearchBar />
                                </View>
                                <View>
                                    <FlatGrid
                                        data={events}
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
            </SafeAreaView>
        </AuthWrapper>
    );

}

export default Events;
