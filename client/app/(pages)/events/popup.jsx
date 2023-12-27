
import { NativeWindStyleSheet } from 'nativewind';
import { Linking, Pressable, Text, View } from 'react-native';
import Wrapper from '../../../components/Wrapper';

const Popup = ({event, closePopup}) => {   
    // Native Wind SetUp
    NativeWindStyleSheet.setOutput({
        default: 'native',
    });

    return (
        <View className='flex justify-center items-center w-full'>
            <Pressable onPress={closePopup} className='absolute w-full h-full -z-10'></Pressable>
            <Wrapper>
                <View className='ph:mx-0 md:mx-5 px-10 py-5 bg-white rounded-md'>
                    <Text numberOfLines={4} className='ph:w-[70%] md:w-[80%] font-bold ph:text-xl md:text-2xl mb-4'>{event?.summary}</Text>
                    <Text className='ph:w-[70%] md:w-[80%] leading-5' numberOfLines={20}>{event?.description}</Text>
                    <View className='top-5 right-10 absolute flex-col items-end'>
                        <Pressable onPress={() => Linking.openURL(event.url)} className='bg-sky-500 mb-2 rounded-md px-4 py-2'>
                            <Text className='text-white'>Register</Text>
                        </Pressable>
                        
                        <Pressable onPress={closePopup} className='border-[1px] border-sky-500 rounded-md px-4 py-1.5'>
                            <Text className='text-sky-500'>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Wrapper>
        </View>
    )
}

export default Popup;