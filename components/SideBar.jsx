import { NativeWindStyleSheet } from 'nativewind';
import { Linking } from 'react-native';
import { useState } from 'react';

import { Pressable, Text, View} from 'react-native';

NativeWindStyleSheet.setOutput({
    default: "native",
});


const SideBar = ({data}) => {
    const [saved, setSaved] = useState(false);

    const openWebsite = (url) => {
        Linking.openURL(url).catch((err) => console.error('Error opening website:', err));
    };

    const sendEmail = (url) => {
        Linking.openURL("mailto:"+url).catch((err) => console.error('Error opening email:', err));
    };

    return (
        <View className='w-[220]'>
            <View>
                <Text className='text-5xl text-green-500'><Text className='font-bold'>9.7</Text>/10</Text>
                <Pressable className='flex-row items-end'>
                    <Text className='mt-2 text-gray-400 mr-1'> How we calculated ratings </Text>
                    <View className="mb-0.5">
                        <svg height="14" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 6H10M10 6L5 1M10 6L5 11" stroke="#ccc"/>
                        </svg>
                    </View>
                </Pressable>
            </View>
            <View className='mt-10 flex-row'>
                <Pressable className='w-full flex-shrink flex justify-center items-center bg-sky-500 rounded-md'>
                    <Text className='text-white'>Application From</Text>
                </Pressable>
                <Pressable onPress={() => setSaved(!saved)} className="w-7 ml-2 items-end">
                    
                    <svg height="30" viewBox="0 0 21 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {saved ? (
                            <path d="M1 24.8884V3.10735C1 1.94349 1.81015 1 2.80952 1H18.1905C19.1898 1 20 1.94349 20 3.10735V24.8884C20 26.7659 18.0509 27.7061 16.9109 26.3785L11.7795 20.4026C11.0729 19.5796 9.92714 19.5796 9.22047 20.4026L4.08905 26.3785C2.94911 27.7061 1 26.7659 1 24.8884Z" fill="#0ea5e9" stroke="#0ea5e9"/>
                        ) : (
                            <path d="M1 24.8884V3.10735C1 1.94349 1.81015 1 2.80952 1H18.1905C19.1898 1 20 1.94349 20 3.10735V24.8884C20 26.7659 18.0509 27.7061 16.9109 26.3785L11.7795 20.4026C11.0729 19.5796 9.92714 19.5796 9.22047 20.4026L4.08905 26.3785C2.94911 27.7061 1 26.7659 1 24.8884Z" stroke="#ccc"/>
                        )}
                    </svg>

                </Pressable>
            </View>

            <View className='mt-10'>
                <View>
                    {Object.keys(data).map((key) => {
                        const value = data[key];
                        return (
                            <View key={key}>
                                {value !== null && (
                                    <View className="mb-7">
                                        <Text className='text-gray-400'>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                                        <Pressable
                                            onPress={
                                                key === "website"
                                                ? () => openWebsite(`https://${value.split("//")[1].replace("www.", "")}`)
                                                : key === "email"
                                                ? () => sendEmail(value)
                                                : undefined
                                            }
                                            className='mt-2'
                                        >
                                            <Text
                                                numberOfLines={1}
                                                className={key === "website" ? 'text-sky-500' : 'text-black'}
                                            >
                                                {value}
                                            </Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

export default SideBar;