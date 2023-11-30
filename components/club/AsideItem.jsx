
import { NativeWindStyleSheet } from 'nativewind';
import { Linking, Pressable, Text, View } from 'react-native';

import CopySVG from '../../assets/copy';

const AsideItem = ({data}) => {
    NativeWindStyleSheet.setOutput({
        default: "native",
    });

    const openWebsite = (url) => {
        Linking.openURL(url).catch((err) => console.error('Error opening website:', err));
    };

    const sendEmail = (url) => {
        Linking.openURL("mailto:"+url).catch((err) => console.error('Error opening email:', err));
    };

    return (
        <View>
            {Object.keys(data).map((key) => {
                const value = data[key];
                return (
                    <View key={key}>
                        {value !== null && (
                            <View className="mb-7">
                                <View className='flex-row justify-between'>
                                    <Text className='text-gray-400'>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                                    <Pressable onPress={() => null}><CopySVG /></Pressable>
                                </View>
                                <Pressable
                                    onPress={
                                        key === "website"
                                        ? () => openWebsite(`https://${value.split("//")[1].replace("www.", "")}`)
                                        : key === "email"
                                        ? () => sendEmail(value)
                                        : undefined
                                    }
                                    className='mt-2'
                                >
                                    <Text
                                        numberOfLines={1}
                                        className={key === "website" ? 'text-sky-500' : 'text-black'}
                                    >
                                        {value}
                                    </Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );

}

export default AsideItem;
