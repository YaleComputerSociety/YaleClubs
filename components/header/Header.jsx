
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { NativeWindStyleSheet } from "nativewind";

import { View, Text, Pressable } from "react-native";
import ModesSVG from "../../assets/modes";
import Menu from "./Menu";
import LogoSVG from "../../assets/logo";
import IconSVG from "../../assets/icon";


const Header = () => {
    const navigation = useRouter();
    const [openMenu, setOpenMenu] = useState(false);

    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });
    
    return (
        <View className="w-full flex-row absolute z-10 justify-between bg-white py-5 px-[110px]">
            <Pressable className="flex-row items-center" onPress={() => navigation.push(`/`)}>
                <LogoSVG/>
                <Text selectable={false} className="ml-5 font-semibold text-[16px]">Yale Clubs</Text>
            </Pressable>

            <View className="flex-row items-center">
                <View className="mr-10 flex-row items-center gap-x-11">
                    <Pressable onPress={() => navigation.push(`/`)}>
                        <Text selectable={false} className="text-[15px]">Catalog</Text>
                    </Pressable>
                    <Pressable onPress={() => navigation.push(`/worksheet`)}>
                        <Text selectable={false} className="text-[15px]">Worksheet</Text>
                    </Pressable>
                    <View>
                        <ModesSVG/>
                    </View>
                </View>
                <View>
                    <View className={`group-isolate w-[40px] rounded-[9px]`}>
                        <Pressable onPress={() => setOpenMenu(!openMenu)}>
                            <IconSVG />
                        </Pressable>

                        {/* Simple Drop Down Menu */}
                        {openMenu && (<Menu 
                            navigation={navigation} 
                        />)}
                    </View>
                </View>
            </View>
        </View>
    );

}

export default Header;