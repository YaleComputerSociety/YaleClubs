import React from "react";
import { useRouter } from "expo-router";
import { NativeWindStyleSheet } from "nativewind";

NativeWindStyleSheet.setOutput({
    default: "native",
});

import { View, Text, Image, Pressable } from "react-native";


const Header = () => {
    const navigation = useRouter();
    
    return (
        // In Progress
        <View className="w-full flex-row justify-between fixed bg-white py-5 px-[110px]">
            <Pressable className="flex-row items-center" onPress={() => navigation.push(`/`)}>
                <Image source={require("../assets/logo.png")}/>
                <Text className="ml-5 font-semibold text-[16px]">Yale Clubs</Text>
            </Pressable>
            <View className="flex-row items-center">
                <View className="mr-10 flex-row items-center gap-x-11">
                    <Pressable onPress={() => navigation.push(`/`)}>
                        <Text className="text-[16px]">Catalog</Text>
                    </Pressable>
                    <Pressable onPress={() => navigation.push(`/worksheet`)}>
                        <Text className="text-[16px]">Worksheet</Text>
                    </Pressable>
                    <View>
                        <svg width="24" height="24" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M15 30C23.2843 30 30 23.2843 30 15C30 6.71573 23.2843 0 15 0C6.71573 0 0 6.71573 0 15C0 23.2843 6.71573 30 15 30ZM27.6919 14.9999C27.6919 21.9547 22.098 27.6031 15.1641 27.6911V2.30859C22.098 2.39667 27.6919 8.04501 27.6919 14.9999Z" fill="black"/>
                        </svg>
                    </View>
                </View>
                <View 
                    className="
                    group-isolate 
                    h-11 w-11
                    bg-gray-100 
                    rounded-md 
                    overflow-hidden 
                    border-gray-100"
                >
                    <Image
                        className="h-full w-full"
                        source={{ uri: "https://i0.wp.com/backofficethinking.com/wp-content/uploads/2023/01/cute-kitten.jpg?w=800&ssl=1" }}
                    />
                </View>
            </View>
        </View>
    );
}

export default Header;