
import axios from "axios";
import { NativeWindStyleSheet } from 'nativewind';
import { Linking, Pressable, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from "react";
import {BASE_URL} from "@env";

import CopySVG from '../../assets/copy';

const AsideItem = ({data}) => {
    const [doc, setDoc] = useState();

    useEffect(() => {
        const handleUpload = async () => {
          try {
            if (doc) {
              const id = data.identity;
    
              const formData = new FormData();
              formData.append('clubId', id);
    
              if (doc.uri) {
                // Get the file name from the uri
                const fileName = doc.uri.split('/').pop();
                // Append file directly to FormData without wrapping it
                formData.append('document', {
                  uri: doc.uri,
                  type: doc.type,
                  name: fileName,
                });
              } else {
                console.error('File information is undefined.');
                return;
              }
    
              formData.append('key', 'true');
    
              const axiosResponse = await axios.post(`http://${BASE_URL}/api/event`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              });
    
              console.log('File uploaded successfully:', axiosResponse.data);
            }
          } catch (error) {
            console.error('Error uploading file:', error);
          }
        };
    
        handleUpload();
      }, [doc, data]);

    const handleUploadEvents = async () => {
        try {
          const response = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
    
          if (response.type === 'success' || (response.assets && response.assets.length > 0)) {
            const asset = response.type === 'success' ? response : response.assets[0];
            const { name, size, uri } = asset;
            let nameParts = name.split('.');
            let fileType = nameParts[nameParts.length - 1];
    
            const blob = new Blob([uri], { type: "text/plain" });
            const dataURI = URL.createObjectURL(blob);
    
            const fileToUpload = {
              name: name,
              size: size,
              uri: dataURI,
              type: "text/" + fileType
            };
    
            console.log(fileToUpload, '...............file');
            setDoc(fileToUpload);
          } else {
            console.error('Document picking failed:', response);
          }
        } catch (error) {
          console.error('Error picking or uploading file:', error);
        }
    };

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
