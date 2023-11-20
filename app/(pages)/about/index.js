
import { NativeWindStyleSheet } from 'nativewind';

import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatGrid } from 'react-native-super-grid';

import AuthWrapper from '../../../components/AuthWrapper';
import Footer from '../../../components/footer/Footer';
import Header from '../../../components/header/Header';
import Wrapper from '../../../components/Wrapper';
import membersData from './members.json';


const About = () => {   

    // Native Wind SetUp
    NativeWindStyleSheet.setOutput({
        default: 'native',
    });

    const renderItem = ({ item }) => (
        <View className='border-[1px] border-gray-100 rounded-md p-5 pr-16 flex-row'>
            <View className='bg-gray-100 rounded-md mr-5 h-20 w-20'></View>
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
                        <View className="mb-10 w-full flex items-center">
                            <View className="w-[920px]">
                                <Text className='text-2xl font-bold px-5'>About Us</Text>
                                <Text className='mb-5 px-5'>From Student To Students</Text>
                                <Text className='px-5 mb-10 pr-60'>
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
