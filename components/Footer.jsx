import { NativeWindStyleSheet } from 'nativewind';

NativeWindStyleSheet.setOutput({
    default: "native",
});

import { Text, View} from 'react-native';


const Footer = () => {
    return (
        // In Progress
        <View className="w-full absolute bottom-0 bg-white p-5 flex">
            <Text className='text-gray-300'>Footer Here</Text>
        </View>
    );
}

export default Footer;