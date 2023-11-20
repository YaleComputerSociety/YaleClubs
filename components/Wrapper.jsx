
import { NativeWindStyleSheet } from 'nativewind';
import { View } from 'react-native';

const Wrapper = ({ children }) => {
    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });
    
    return (
        <View className="py-10 mt-20 mb-10 w-full flex items-center">
            <View className="w-[920px]">
                {children}
            </View>
        </View>
    );
};

export default Wrapper;
