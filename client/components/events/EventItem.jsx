
import { Linking, Pressable } from 'react-native';
import { NativeWindStyleSheet } from "nativewind";
import { View, Text } from "react-native";

import EmptySVG from '../../assets/empty';

const EventItem = ({item, popup}) => {

    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });    

    return (
        <Pressable key={ item.uid } onPress={() => popup(item)} className="relative">
            <View className="rounded-md shadow-sm w-full p-5 py-6 flex-row bg-white">
                <View className='w-full flex-col flex-shrink overflow-hidden ml-4 items-start'>
                    <Text numberOfLines={2} className="w-[95%] font-bold text-xl">{ item.summary }</Text>
                    <Text numberOfLines={4} className='w-[90%] mt-2'>{ item.description }</Text>
                    <View className='flex-row mt-3'>
                        <View className='bg-sky-500 rounded-md'>
                            <Text className='text-white py-0.5 px-3'>{ item.time }</Text>
                        </View>
                        <View className='border-[1px] ml-2 border-sky-500 rounded-md'>
                            <Text className='text-sky-500 py-0.5 px-3'>{ item.date }</Text>
                        </View>
                    </View>
                    <Pressable onPress={() => Linking.openURL(item.organizer)} className='flex-row w-[80%] mt-2'><Text numberOfLines={1} className='text-sky-500'>{ item.organizer }</Text></Pressable>
                </View>
                <View className='relative flex-col items-end'>
                    <View className='bg-gray-100 h-20 w-20 items-center justify-center rounded-full'>
                        <EmptySVG h={40} w={33} />
                    </View>
                </View>
            </View>
        </Pressable>
    );

}

export default EventItem;