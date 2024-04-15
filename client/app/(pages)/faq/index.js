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
        { id: 1, question: 'What is YaleClubs?', answer: 'The Yale Clubs website serves as a centralized platform for Yale University clubs, providing information about various organizations, events, and opportunities available to the Yale community.' },
        { id: 2, question: 'How can I join a Yale club?', answer: "To join a Yale club, navigate to the club's page on the website, where you'll find information on how to become a member or participate in club activities. Contact the club directly for more details." },
        { id: 3, question: 'Do I need an account to access Yale Clubs features?', answer: 'While some features are accessible without an account, creating an account allows you to engage more fully with club activities, receive updates, and manage your club memberships.' },
        { id: 4, question: 'How do I update information about my club?', answer: "Club administrators can log in, navigate to the club's dashboard, and edit/update relevant information. Make sure to save changes to reflect the updated details." },
        { id: 5, question: 'How can I edit upcoming events?', answer: 'Explore the "Events" section to discover upcoming activities hosted by Yale clubs. Each event page provides details, and you can RSVP if required.' },
        { id: 6, question: "I'm experiencing technical issues. How can I get help?", answer: "Contact our support team by emailing [support@example.com]. Provide details about the issue you're facing, and we'll assist you promptly." },
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
                            <Text className='ph:mb-4 md:mb-10'>Have more questions? Use <Pressable className='text-sky-500'>yaleclubs@gmail.com</Pressable> email.</Text>
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
