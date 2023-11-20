
import { NativeWindStyleSheet } from 'nativewind';
import { Text, View} from 'react-native';

const Footer = () => {

    // Native Wind SetUp
    NativeWindStyleSheet.setOutput({
        default: "native",
    });

    return (
        <View className="
            w-full 
            absolute 
            bottom-0 
            bg-white 
            p-5 flex
            items-center
            justify-center
        ">
            <Text className='text-gray-300'>Copyrights Preserved © {new Date().getFullYear()} Yale Clubs</Text>
        </View>
    );

}

export default Footer;
