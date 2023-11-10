import { NativeWindStyleSheet } from "nativewind";

NativeWindStyleSheet.setOutput({
    default: "native",
});

import React from "react";
import { View, Text } from "react-native";


const Header = () => {
    return (
        // In Progress
        <View className="w-full fixed bg-white p-5">
            <Text>Header Here</Text>
        </View>
    );
}

export default Header;