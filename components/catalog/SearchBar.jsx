
import { NativeWindStyleSheet } from "nativewind";
import { View, TextInput, Text } from "react-native";

const SearchBar = ({onChange, searchValue, found}) => {

    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });    

    return (
        <View className="
            flex-row 
            items-start
            ph:flex-col 
            md:flex-row">

            <View
                className="
                shadow-sm
                inline-flex 
                ph:w-full 
                sm:w-[480]
                rounded-md 
                py-[10] px-5
                bg-white
                mt-5
                ph:mb-0
                md:mb-10"
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

            <View className="ph:mt-4 ph:mb-4 md:mb-0 md:mt-6 ph:flex-row md:flex-col">
                <Text className="ph:ml-0 md:ml-6 text-gray-400">Showing {found} results</Text>
                <Text className="ph:ml-2 md:ml-6 text-gray-400">(faster than Coursetable)</Text>
            </View>
        </View>
    );

}

export default SearchBar;