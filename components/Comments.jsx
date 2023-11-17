import { NativeWindStyleSheet } from 'nativewind';

import { Text, View } from 'react-native';

NativeWindStyleSheet.setOutput({
    default: 'native',
});

const Comments = () => {
    return (
        <View className="w-full">
            <Text className="font-bold text-2xl mt-5">Here Comments</Text>
        </View>
    );
}

export default Comments;


