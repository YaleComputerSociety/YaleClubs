import { NativeWindStyleSheet } from 'nativewind';
import { View } from 'react-native';

NativeWindStyleSheet.setOutput({
    default: "native",
});

const Wrapper = ({ children }) => {
  return (
    <View className="py-10 mt-20 mb-10 w-full flex items-center">
        <View className="w-[920px]">
            {children}
        </View>
    </View>);
};

export default Wrapper;
