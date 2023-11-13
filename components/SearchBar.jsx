import { NativeWindStyleSheet } from "nativewind";

NativeWindStyleSheet.setOutput({
    default: "native",
});

import { View, TextInput, Text } from "react-native";


const SearchBar = ({onChange, searchValue, found}) => {

    return (
        <View className="
            flex-row 
            items-start">

            <View
                className="
                shadow-sm
                inline-flex 
                w-[480] 
                rounded-md 
                py-[10] px-5
                bg-white
                mt-5
                mb-10"
            >
                <TextInput
                    onChangeText={onChange}
                    value={searchValue}
                    style={{ outlineStyle: 'none' }}
                    className="text-black"
                    placeholder="Cleverer than Levenshtein Distance..."
                    placeholderTextColor="gray"
                />
            </View>

            <View className="mt-6">
                <Text className="ml-6 text-gray-400">Showing {found} results</Text>
                <Text className="ml-6 text-gray-400">(faster than Coursetable)</Text>
            </View>
        </View>
    );

}

export default SearchBar;