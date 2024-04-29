import { NativeWindStyleSheet } from 'nativewind';

import { FlatList, Image, Pressable, Text, View} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import axios from 'axios';

import EmptySVG from '../../assets/empty';


const ClubItem = ({ item }) => {
    const navigation = useRouter();
    const categories = ["Yale College"];
    const [logoUri, setLogoUri] = useState(null);

    NativeWindStyleSheet.setOutput({
        default: "native",
    });

    useEffect(() => {
        const fetchLogoUri = async () => {
            try {
                const response = await axios.get(`/api/logo/${item.logo}`);
                const base64ImageData = response.data;
                const uri = `data:image/jpeg;base64,${base64ImageData}`;
                setLogoUri(uri);
            } catch (error) {
                console.error('Error fetching logo data:', error);
            }
        };

        if (item.logo) {
            // Fetch if Logo Exists
            fetchLogoUri();
        }
    }, [item.logo]);

    return (
        <Pressable key={item._id} className="relative" onPress={() => navigation.push(`/club/${item._id}`)}>
            <View className="rounded-md shadow-sm w-full p-5 py-6 flex-row bg-white">
                <View className='w-full flex-col flex-shrink overflow-hidden'>
                    <Text numberOfLines={2} className="font-bold text-[24px] mt-2 w-[80%]">{item.clubName}</Text>
                    <FlatList
                        className="flex-row"
                        data={categories}
                        renderItem={({ item: category }) => (
                            <View className="bg-gray-100 mt-3 mr-2 py-1 px-2 rounded-md">
                                <Text>{category}</Text>
                            </View>
                        )}
                    />

                    <Text numberOfLines={7} className="pr-4 mt-3 leading-[20px]">
                        { item.description && (
                            item.description
                        )}
                    </Text>

                    <Text numberOfLines={1} className="mt-4 text-sky-500">
                        { item.website && (
                            item.website
                        )}
                    </Text>
    
                </View>
                <View className='relative flex-col items-end'>
                    {logoUri ? (
                        <Image 
                            source={{ uri: logoUri }} 
                            className="h-20 w-20 rounded-full"
                        />
                    ) : (
                        <View className='bg-gray-200 h-20 rounded-full w-20 items-center justify-center'>
                            <EmptySVG h={35} w={35} />
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );
}

export default ClubItem;