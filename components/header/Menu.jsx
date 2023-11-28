
import { useRouter } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';
import { Pressable, Text, View } from 'react-native';

const Menu = ({ navigation }) => {
    const route = useRouter();

    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });    

    return (
        <View
            className="
                border-[1px]
                border-gray-100
                bg-white
                rounded-md
                px-4
                py-4
            "
        >
            <View className='flex-col gap-y-3 items-start'>
                <Pressable onPress={() => route.push(`/`)} className='ph:flex md:hidden'>
                    <Text selectable={false} className="text-[15px]">Catalog</Text>
                </Pressable>
                <Pressable onPress={() => route.push(`/worksheet`)} className='ph:flex md:hidden'>
                    <Text selectable={false} className="text-[15px]">Worksheet</Text>
                </Pressable>
                <Pressable
                    className="flex-row justify-end"
                    onPress={() => navigation.push("/about")}
                >
                    <Text selectable={false}>About</Text>
                </Pressable>
                <Pressable
                    className="flex-row justify-end"
                    onPress={() => navigation.push("/faq")}
                >
                    <Text selectable={false}>FAQ</Text>
                </Pressable>
                <Pressable
                    className="flex-row justify-end"
                    onPress={() => navigation.push("/feedback")}
                >
                    <Text selectable={false}>Feedback</Text>
                </Pressable>
                <Pressable
                    className="flex-row justify-end"
                    onPress={() => navigation.push("/logout")}
                >
                    <Text selectable={false}>Log Out</Text>
                </Pressable>
            </View>
        </View>
    );
    
};

export default Menu;
