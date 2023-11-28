
import { NativeWindStyleSheet } from 'nativewind';
import { View } from 'react-native';

const Wrapper = ({ children }) => {
    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });
    
    return (
        <View className="py-10 ph:mt-14 md:mt-20 w-full flex items-center">
            <View className="w-full lg:w-[920px]">
                {children}
            </View>
        </View>
    );
};

export default Wrapper;
