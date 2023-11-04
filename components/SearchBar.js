
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
                    placeholder="Clever Tags-Names-Description-Members SearchBar..."
                    placeholderTextColor="gray"
                />
            </View>

            <Text className="mt-9 ml-6 text-gray-400">Showing {found} results</Text>
        </View>
    );

}

export default SearchBar;