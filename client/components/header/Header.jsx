
import React, { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { NativeWindStyleSheet } from "nativewind";

import { View, Text, Pressable, Animated } from "react-native";

import Menu from "./Menu";
import ModesSVG from "../../assets/modes";
import LogoSVG from "../../assets/logo";
import IconSVG from "../../assets/icon";
import UserSVG from "../../assets/user";


const Header = () => {
    const route = useRouter();
    const [openMenu, setOpenMenu] = useState(false);
    const menuHeight = useRef(new Animated.Value(0)).current;

    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });

    const toggleMenu = () => {
        const toValue = openMenu ? 0 : 1;
    
        if (!openMenu) {
            setOpenMenu(!openMenu);
        }
    
        const duration = openMenu ? 300 : 200;
    
        Animated.timing(menuHeight, {
            toValue,
            duration,
            useNativeDriver: false,
        }).start(() => {
            if (openMenu) {
                setOpenMenu(!openMenu);
            }
        });
    };

    const heightTransform = menuHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 200]
    });


    return (
        <View className="w-full flex-row absolute z-10 justify-between bg-white py-5 ph:px-5 xl:px-[110px]">
            <Pressable className="flex-row items-center" onPress={() => route.push(`/`)}>
                <LogoSVG/>
                <Text selectable={false} className="ml-5 font-semibold text-[16px]">Yale Clubs</Text>
            </Pressable>

            <View className="flex-row items-center">
                <View className="ph:hidden md:flex mr-10 flex-row items-center gap-x-11">
                    <Pressable onPress={() => route.push(`/events`)}>
                        <Text selectable={false} className="text-[15px]">Events</Text>
                    </Pressable>
                    <Pressable onPress={() => route.push(`/`)}>
                        <Text selectable={false} className="text-[15px]">Catalog</Text>
                    </Pressable>
                    <Pressable onPress={() => route.push(`/worksheet`)}>
                        <Text selectable={false} className="text-[15px]">Worksheet</Text>
                    </Pressable>
                    <Pressable onPress={() => null}>
                        <ModesSVG/>
                    </Pressable>
                </View>
                <View>
                    <View className={`group-isolate w-[40px] rounded-[9px]`}>
                        <Pressable onPress={() => toggleMenu()}>
                            <UserSVG />
                        </Pressable>

                        <Animated.View
                            className="overflow-hidden absolute top-14 w-[120] right-0"
                            style={{
                                height: heightTransform,
                            }}
                        >
                            {openMenu && <Menu navigation={route} />}
                        </Animated.View>
                    </View>
                </View>
            </View>
        </View>
    );

}

export default Header;