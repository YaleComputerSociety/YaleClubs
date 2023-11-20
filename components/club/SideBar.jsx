
import { NativeWindStyleSheet } from 'nativewind';
import { useState } from 'react';

import { Pressable, Text, View} from 'react-native';
import AsideItem from './AsideItem';
import SavedSVG from '../../assets/saved';


const SideBar = ({data}) => {
    const [saved, setSaved] = useState(false);

    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });

    return (
        <View className='w-[220]'>

            {/* <View>
                <Text className='text-5xl text-green-500'><Text className='font-bold'>9.7</Text>/10</Text>
                <Pressable className='flex-row items-end'>
                    <Text className='mt-2 text-gray-400 mr-1'> How we calculated ratings </Text>
                    <View className="mb-0.5">
                        <svg height="14" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 6H10M10 6L5 1M10 6L5 11" stroke="#ccc"/>
                        </svg>
                    </View>
                </Pressable>
            </View> */}

            <View className='flex-row'>
                <Pressable className='w-full flex-shrink flex justify-center items-center border-[1px] border-sky-500 rounded-md'>
                    <Text className='text-sky-500'>Application From</Text>
                </Pressable>
                <Pressable onPress={() => setSaved(!saved)} className="w-7 ml-2 items-end">
                    <SavedSVG saved={saved} />
                </Pressable>
            </View>

            <View className='mt-10'>
                <AsideItem data={data} />
            </View>
        </View>
    );
}

export default SideBar;