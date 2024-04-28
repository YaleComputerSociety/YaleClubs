
import { NativeWindStyleSheet } from 'nativewind';

import { Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatGrid } from 'react-native-super-grid';

import AuthWrapper from '../../../components/AuthWrapper';
import Footer from '../../../components/footer/Footer';
import Header from '../../../components/header/Header';
import DecoratorSVG from '../../../assets/decorator';
import Wrapper from '../../../components/Wrapper';
import membersData from './members';


const About = () => {   

    // Native Wind SetUp
    NativeWindStyleSheet.setOutput({
        default: 'native',
    });

    const renderItem = ({ item }) => (
        <View key={item.id} className='bg-white shadow-sm rounded-md p-5 pr-16 flex-row'>
            <View className='bg-gray-100 rounded-md mr-5 h-20 w-20 overflow-hidden'>
                <Image source={{uri: item.src}} className='w-full h-full' />
            </View>
            <View className='w-full flex-shrink'>
                <Text className='font-semibold'>{item.name} - {item.role}</Text>
                <Text className='mt-2'>{item.description}</Text>
            </View>
        </View>
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
                                <Text className='text-2xl font-bold px-5'>About Us</Text>
                                <Text className='mb-5 px-5'>From Student To Students</Text>
                                <Text className='px-5 ph:mb-4 md:mb-10 ph:pr-20 md:pr-60'>
                                    Y/CS is lorem Ipsum is simply dummy text of the printing and typesetting industry. From development mentorship to hacking nights, we create a community for programmers of all skill levels.
                                </Text>
                                <View>
                                    <FlatGrid
                                        data={membersData}
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

export default About;
