import { NativeWindStyleSheet } from 'nativewind';

import { Pressable, Text, View} from 'react-native';

NativeWindStyleSheet.setOutput({
    default: "native",
});


const SideBar = () => {
    return (
        <View className='w-[250]'>
            <View>
                <Text className='text-5xl text-green-500'><Text className='font-bold'>9.7</Text>/10</Text>
                <Pressable><Text className='mt-2 text-gray-400'> How we calculated ratings </Text></Pressable>
            </View>
            <View className='mt-10'>
                <Pressable className='flex justify-center items-center py-2 bg-sky-500 rounded-md'>
                    <Text className='text-white'>Application From</Text>
                </Pressable>
            </View>

            <View className='mt-10'>
                <View className='gap-y-5'>
                    <View>
                        <Text className='text-gray-400'>Website</Text>
                        <Pressable className='mt-2'>
                            <Text className='text-sky-500'>https://yaleclubs.vercel.ap...</Text>
                        </Pressable>
                    </View>
                    <View>
                        <Text className='text-gray-400'>Instagram</Text>
                        <Pressable className='mt-2'>
                            <Text className='text-black'>@instagramclubname</Text>
                        </Pressable>
                    </View>
                    <View>
                        <Text className='text-gray-400'>Facebook</Text>
                        <Pressable className='mt-2'>
                            <Text className='text-black'>facebookclubnameprovided</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default SideBar;