
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
        { id: 4, question: 'Question 4', answer: 'Answer 2' },
        { id: 5, question: 'Question 5', answer: 'Answer 1' },
        { id: 6, question: 'Question 6', answer: 'Answer 2' },
        { id: 7, question: 'Question 7', answer: 'Answer 1' },
        { id: 8, question: 'Question 8', answer: 'Answer 2' },
        { id: 9, question: 'Question 9', answer: 'Answer 1' },
        { id: 10, question: 'Question 10', answer: 'Answer 2' },
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
                        <View className="mb-10 w-full flex items-center">
                            <View className="w-[920px]">
                                <Text className='text-2xl text-sky-500 font-bold mb-10'>Frequently Asked Questions</Text>
                                {questions.map((item, index) => (
                                    <Pressable
                                        key={item.id}
                                        onPress={() => handleItemClick(index)}
                                        activeOpacity={0.7}
                                        className="py-4 w-full"
                                    >
                                        <Text className="text-[16px]">{item.question}</Text>
                                        {openIndex === index && <Text className='mt-4 leading-6 pr-[200]'>{item.answer}</Text>}
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </Wrapper>
                    <Footer />
                </View>
            </SafeAreaView>
        </AuthWrapper>
    );

}

export default QuestionBlock;
