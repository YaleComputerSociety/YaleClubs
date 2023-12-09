
import { NativeWindStyleSheet } from "nativewind";
import { View, TextInput, Text } from "react-native";

import { formatTimeElapsed } from "../../actions/timeFormat";
import { useEffect, useState } from "react";

const SearchBar = ({onChange, searchValue, found}) => {
    const [timeElapsed, setTimeElapsed] = useState('');

    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });    

    const fetchTimeElapsed = async () => {
        try {
            const elapsedTime = await formatTimeElapsed();
            setTimeElapsed(elapsedTime);
        } catch (error) {
            console.error('Error updating time elapsed:', error);
        }
    };

    useEffect(() => {
        fetchTimeElapsed();
    }, [fetchTimeElapsed]);

    return (
        <View className="flex-row justify-between items-start">

            <View className="
                flex-row 
                items-start
                w-full
                ph:flex-col 
                md:flex-row">
                
                <View
                    className="
                    shadow-sm
                    inline-flex 
                    ph:w-full 
                    sm:w-[480]
                    rounded-md 
                    py-[10] px-5
                    bg-white
                    mt-5
                    ph:mb-0
                    md:mb-10"
                >
                    <TextInput
                        onChangeText={onChange}
                        value={searchValue}
                        className="text-black ph:w-full md:w-auto"
                        style={{outline: 'none'}}
                        placeholder="Cleverer than Levenshtein Distance..."
                        placeholderTextColor="gray"
                    />
                </View>

                <View className="ph:mt-4 ph:mb-4 md:mb-0 md:mt-6 ph:flex-row md:flex-col">
                    <Text className="ph:ml-0 md:ml-6 text-gray-400">Showing {found} results</Text>
                    <Text className="ph:ml-2 md:ml-6 text-gray-400">{timeElapsed}</Text>
                </View>

            </View>
{/* 
            <Pressable className="border-[1px] mt-5 border-gray-200 py-2 w-9 justify-center items-center rounded-md" onPress={() => Linking.openURL("https://yaleconnect.yale.edu/club_signup")}>
                <Text className="text-gray-300">YC</Text>
            </Pressable> */}
        </View>
    );

}

export default SearchBar;