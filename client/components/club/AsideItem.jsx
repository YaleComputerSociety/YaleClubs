
import axios from "axios";
import { NativeWindStyleSheet } from 'nativewind';
import { Linking, Pressable, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from "react";

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
    
              const axiosResponse = await axios.post(`http://${process.env.BASE_URL}:${process.env.PORT}/api/event`, formData, {
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
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'http://' + url; // Prefix with http:// if no protocol is provided
        }
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
                                        ? () => openWebsite(`${value}`)
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
