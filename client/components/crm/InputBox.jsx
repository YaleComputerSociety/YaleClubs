
import { NativeWindStyleSheet } from "nativewind";
import { View, TextInput, Text } from "react-native";

const InputBox = ({ title, placeholder }) => {

    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });    

    return (
        <View className='flex-col'>
            <Text className='text-md text-gray-500 mb-1'>{title}</Text>
            <TextInput placeholder={placeholder} className='bg-white rounded-md border-[1px] border-gray-200 p-2.5 w-full' />
        </View>
    );

}

export default InputBox;