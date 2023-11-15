import { NativeWindStyleSheet } from 'nativewind';

import { FlatList, Text, View } from 'react-native';

NativeWindStyleSheet.setOutput({
    default: 'native',
});


const Leaders = ({leaders}) => {

    const displayLeader = (leader) => {
        return (
          <View className="mr-2 px-4 py-1.5 bg-gray-100 rounded-md">
            <Text>{leader.first_name}</Text>
          </View>
        );
      };

    return (
        <View className="mt-4">
            <Text className="font-bold text-2xl mb-3">Leaders</Text>
            <FlatList
                data={leaders}
                horizontal={true}
                scrollEnabled={true}
                renderItem={({ item }) => displayLeader(item)}
                keyExtractor={(item) => item.netid.toString()}
            />
        </View>
    );
}

export default Leaders;


