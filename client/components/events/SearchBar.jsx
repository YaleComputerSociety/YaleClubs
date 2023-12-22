
import { NativeWindStyleSheet } from "nativewind";
import { View, Text, TextInput } from "react-native";

const SearchBar = ({onChange, searchValue, found}) => {

    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });    

    return (
        <View className="flex-row justify-between items-start">

            <View className="
                flex-row 
                items-start
                ph:flex-col 
                ph:w-full
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
                        className="text-black ph:w-full md:w-auto"
                        style={{outline: 'none'}}
                        placeholder="Search Events (e.g. Movies)..."
                        placeholderTextColor="gray"
                    />
                </View>

                <View className="ph:mt-4 ph:mb-4 md:mb-0 md:mt-6 ph:flex-row md:flex-col">
                    <Text className="ph:ml-0 md:ml-6 text-gray-400">Showing {found} results</Text>
                    <Text className="ph:ml-2 md:ml-6 text-gray-400">Filtered by date</Text>
                </View>

            </View>

        </View>
    );

}

export default SearchBar;