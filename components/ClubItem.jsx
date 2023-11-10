import { NativeWindStyleSheet } from 'nativewind';

NativeWindStyleSheet.setOutput({
    default: "native",
});

import { Image, Pressable, Text, View} from 'react-native';
import { useRouter } from 'expo-router';


const ClubItem = ({ item }) => {
    const navigation = useRouter();

    const handlePress = () => {
        // ./club/{item.id} route
        navigation.navigate('ClubDetails', );
    };
    
    return (
        // In Progress
        <Pressable key={item.id} className="relative" onPress={() => navigation.push(`/club/${item.id}`)}>
            <View className="rounded-md shadow-sm w-full h-[300] p-5 flex bg-white">
                <Text className="font-bold text-lg mt-2 w-[80%]">{item.name}...</Text>
                <Image source={{uri: item.logo}} className="h-20 right-5 w-20 rounded-full absolute"/>
            </View>
        </Pressable>
    );
}

export default ClubItem;