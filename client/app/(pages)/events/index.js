
import { useEffect, useState } from 'react';
import { NativeWindStyleSheet } from 'nativewind';

import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatGrid } from 'react-native-super-grid';
import Modal from 'react-native-modal';

import { reloadEvents, fetchEventsJSON } from '../../../api/ManageEvents';
import SearchBar from '../../../components/events/SearchBar';
import EventItem from '../../../components/events/EventItem';
import useFilteredEvents from '../../../hooks/FilterEvents';
import AuthProvider from '../../../context/AuthProvider';
import Footer from '../../../components/footer/Footer';
import Header from '../../../components/header/Header';
import Wrapper from '../../../components/Wrapper';
import DecoratorSVG from '../../../assets/decorator';
import Popup from './popup';


const Events = () => {   
    const [page, setPage] = useState(1);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isPopupVisible, setPopupVisible] = useState(false);

    const { searchValue, onChange, found, filteredEvents } = useFilteredEvents(events);

    // Native Wind SetUp
    NativeWindStyleSheet.setOutput({
        default: 'native',
    });

    const handleEventItemClick = (event) => {
        setSelectedEvent(event);
        setPopupVisible(true);
    };
    
    const closePopup = () => {
        setPopupVisible(false);
    };

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
                setIsLoading(true);
                // await reloadEvents();
                const res = await fetchEventsJSON();
                setEvents(res);
            } catch (error) {
                console.error('Error:', error.message);
            }
        };

        fetchEvents();
        setIsLoading(false);
    }, []);

    const renderItem = ({ item }) => (
        <EventItem item={item} popup={handleEventItemClick} />
    );
    
    return (
        <AuthProvider>
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
                                        <SearchBar onChange={(text) => { onChange(text); setPage(1); }} searchValue={searchValue} found={found} />
                                    </View>

                                    {isLoading ? (
                                        <ActivityIndicator className="mx-auto" color="#aaa" />
                                    ) : found === 0 ? (
                                        <View className="p-5">
                                            <Text>Sorry. No results has been found by your request.</Text>
                                            <Pressable onPress={() => navigation.push(`https://yaleconnect.yale.edu/home_login`)} className="cursor-pointer mt-1"><Text className="text-sky-500">How to add new e?</Text></Pressable>
                                        </View>
                                    ) : (
                                        <View>
                                            <FlatGrid
                                                data={filteredEvents.slice(0, page * 100)}
                                                renderItem={renderItem}
                                                itemContainerStyle={{ justifyContent: 'flex-start' }}
                                                spacing={20}
                                                itemDimension={350}
                                                maxItemsPerRow={4}
                                            />
                                        </View>
                                    )}

                                </View>
                            </View>
                        </Wrapper>
                        <Footer />
                    </View>
                </ScrollView>

                <Modal 
                    isVisible={isPopupVisible} 
                    onBackdropPress={closePopup}
                >
                    {/* Modal Package has BackHandler Error [Fix/Change Later] */}
                    <Popup event={selectedEvent} closePopup={closePopup} />
                </Modal>
            </SafeAreaView>
        </AuthProvider>
    );

}

export default Events;
