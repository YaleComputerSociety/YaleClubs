
import { useEffect, useState } from 'react';
import { NativeWindStyleSheet } from 'nativewind';

import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatGrid } from 'react-native-super-grid';
import Modal from 'react-native-modal';

import { reloadEvents, fetchEventsJSON } from '../../../api/ManageEvents';
import SearchBar from '../../../components/events/SearchBar';
import EventItem from '../../../components/events/EventItem';
import AuthWrapper from '../../../components/AuthWrapper';
import Footer from '../../../components/footer/Footer';
import Header from '../../../components/header/Header';
import Wrapper from '../../../components/Wrapper';
import DecoratorSVG from '../../../assets/decorator';
import Popup from './popup';


const Events = () => {   
    const [events, setEvents] = useState([]);
    const [page, setPage] = useState(1);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isPopupVisible, setPopupVisible] = useState(false);

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
        <EventItem item={item} popup={handleEventItemClick} />
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
                <Modal 
                    isVisible={isPopupVisible} 
                    onBackdropPress={closePopup}
                >
                    <Popup event={selectedEvent} closePopup={closePopup} />
                </Modal>
            </SafeAreaView>
        </AuthWrapper>
    );

}

export default Events;
