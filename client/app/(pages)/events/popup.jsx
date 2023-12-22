
import { NativeWindStyleSheet } from 'nativewind';
import { Linking, Pressable, Text, View } from 'react-native';

const Popup = ({event, closePopup}) => {   
    // Native Wind SetUp
    NativeWindStyleSheet.setOutput({
        default: 'native',
    });

    return (
        <View className='flex justify-center items-center'>
            <Pressable onPress={closePopup} className='absolute w-full h-full -z-10'></Pressable>
            <View className='px-10 py-5 bg-white rounded-md w-[880px]'>
                <Text className='w-[80%] font-bold text-2xl mb-4'>{event?.summary}</Text>
                <Text className='w-[80%] leading-5'>{event?.description}</Text>
                <View className='top-5 right-10 absolute flex-col items-end'>
                    <Pressable onPress={() => Linking.openURL(event.url)} className='bg-sky-500 mb-2 rounded-md px-4 py-2'>
                        <Text className='text-white'>Register</Text>
                    </Pressable>
                    
                    <Pressable onPress={closePopup} className='border-[1px] border-sky-500 rounded-md px-4 py-1.5'>
                        <Text className='text-sky-500'>Close</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    )
}

export default Popup;