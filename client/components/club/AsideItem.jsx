
import axios from "axios";
import { useState } from "react";
import { NativeWindStyleSheet } from 'nativewind';
import { Linking, Pressable, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

import CopySVG from '../../assets/copy';

const AsideItem = ({data}) => {
    const [ doc, setDoc ] = useState();

    NativeWindStyleSheet.setOutput({
        default: "native",
    });

    const openWebsite = (url) => {
        Linking.openURL(url).catch((err) => console.error('Error opening website:', err));
    };

    const sendEmail = (url) => {
        Linking.openURL("mailto:"+url).catch((err) => console.error('Error opening email:', err));
    };

    const handleUploadEvents = async () => {
        // In Development
        try {
            await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true }).then(response => {
                if (response.type == 'success') {          
                    let { name, size, uri } = response;
                    let nameParts = name.split('.');
                    let fileType = nameParts[nameParts.length - 1];
                    var fileToUpload = {
                        name: name,
                        size: size,
                        uri: uri,
                        type: "text/" + fileType
                    };
                    console.log(fileToUpload, '...............file')
                    setDoc(fileToUpload);
                } 
            });
        
            const formData = new FormData();
            const id = data.identity;

            formData.append('clubId', id);
            formData.append('document', doc);
            formData.append('key', 'true')

            const response = await axios.post('http://localhost:8081/api/event', formData, {
                headers: {
                    'Accept': 'multipart/form-data',
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            console.log('File uploaded successfully:', response.data);
    
        } catch (error) {
            console.error('Error picking or uploading file:', error);
        }
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

            <View className="gap-y-2 mt-1">
                <Pressable
                    onPress={handleUploadEvents}
                    className="w-full py-1 rounded-md border-[1px] border-gray-200"
                >
                    <Text className="text-center text-gray-400">Upload Events</Text>
                </Pressable>

                <Pressable className="w-full py-1 rounded-md border-[1px] border-gray-200">
                    <Text className="text-center text-gray-400">Add Member</Text>
                </Pressable>
            </View>
        </View>
    );

}

export default AsideItem;
