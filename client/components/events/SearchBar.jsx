
import { NativeWindStyleSheet } from "nativewind";
import { View, TextInput } from "react-native";

const SearchBar = ({onChange, searchValue}) => {

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
                        placeholder="(Disabled)"
                        placeholderTextColor="gray"
                    />
                </View>

            </View>

        </View>
    );

}

export default SearchBar;