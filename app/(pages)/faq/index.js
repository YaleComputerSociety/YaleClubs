
import { NativeWindStyleSheet } from 'nativewind';

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthWrapper from '../../../components/AuthWrapper';
import Footer from '../../../components/footer/Footer';
import Header from '../../../components/header/Header';
import Wrapper from '../../../components/Wrapper';


const QuestionBlock = () => {  
    const [openIndex, setOpenIndex] = useState(null); 

    // Native Wind SetUp
    NativeWindStyleSheet.setOutput({
        default: 'native',
    });

    const questions = [
        { id: 1, question: 'How much time do members spend every week?', answer: 'Other question to ansert here here here. Other question to ansert here here here Other question to ansert heHow much time do members spend every week?re  Other question to anseHow much time do members spend every week?rt here here here here here Other question to ansert here here here.' },
        { id: 2, question: 'Time time time time time time', answer: 'Other question to ansert here here here. Other question to ansert here here here Other question to ansert heHow much time do members spend every week?re  Other question to anseHow much time do members spend every week?rt here here here here here Other question to ansert here here here.' },
        { id: 3, question: 'Other question to ansert here here here', answer: 'Other question to ansert here here here. Other question to ansert here here here Other question to ansert heHow much time do members spend every week?re  Other question to anseHow much time do members spend every week?rt here here here here here Other question to ansert here here here.' },
        { id: 4, question: 'How much time do members spend every week?', answer: 'Other question to ansert here here here. Other question to ansert here here here Other question to ansert heHow much time do members spend every week?re  Other question to anseHow much time do members spend every week?rt here here here here here Other question to ansert here here here.' },
        { id: 5, question: 'Time time time time time time', answer: 'Other question to ansert here here here. Other question to ansert here here here Other question to ansert heHow much time do members spend every week?re  Other question to anseHow much time do members spend every week?rt here here here here here Other question to ansert here here here.' },
        { id: 6, question: 'Other question to ansert here here here', answer: 'Other question to ansert here here here. Other question to ansert here here here Other question to ansert heHow much time do members spend every week?re  Other question to anseHow much time do members spend every week?rt here here here here here Other question to ansert here here here.' },
    ];

    const handleItemClick = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };
    
    return (
        <AuthWrapper>
            <SafeAreaView className="w-full">
                <View className="flex-col w-full min-h-screen">
                    <Header />
                    <Wrapper>
                        <View className="ph:mb-4 md:mb-10 px-5 w-full">
                            <Text className='text-2xl text-black font-bold'>Frequently Asked Questions</Text>
                            <Text className='ph:mb-4 md:mb-10'>All other questions by <Pressable className='text-sky-500'>yaleclubs@gmail.com</Pressable> email.</Text>
                            {questions.map((item, index) => (
                                <Pressable
                                    key={item.id}
                                    onPress={() => handleItemClick(index)}
                                    activeOpacity={0.7}
                                    className="ph:py-2 md:py-4 w-full"
                                >
                                    <Text className="text-[16px]">{item.question}</Text>
                                    {openIndex === index && <Text className='mt-4 leading-6 ph:pr-[40] md:pr-[200]'>{item.answer}</Text>}
                                </Pressable>
                            ))}
                        </View>
                    </Wrapper>
                    <Footer />
                </View>
            </SafeAreaView>
        </AuthWrapper>
    );

}

export default QuestionBlock;
