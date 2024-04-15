import axios from 'axios';
import {useState} from 'react';
import * as ImagePicker from 'expo-image-picker';
import {NativeWindStyleSheet} from 'nativewind';
import Toast from 'react-native-toast-message';

import {Image, Pressable, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import AuthWrapper from '../../../components/AuthWrapper';
import InputBox from "../../../components/crm/InputBox";
import Footer from '../../../components/footer/Footer';
import Header from '../../../components/header/Header';
import Wrapper from '../../../components/Wrapper';
import EmptySVG from '../../../assets/empty';
import DeleteSVG from '../../../assets/delete';

import OfficialSVG from '../../../assets/official';
import {useRouter} from "expo-router";

const CRMManager = () => {
    const [image, setImage] = useState(null);
    const [clubName, setClubName] = useState('');
    const [description, setDescription] = useState('');
    const [instagram, setInstagram] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [yaleConnect, setYaleConnect] = useState('');

    const [selectedMember, setSelectedMember] = useState("");
    const [selectedLeader, setSelectedLeader] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [selectedLeaders, setSelectedLeaders] = useState([]);

    // This implementation is only a quick draft and must to be fixed in the future
    // If you are planning on adding the code in here, please manage the structure first

    const addMember = () => {
        const netID = selectedMember.trim();
        if (netID && !selectedMembers.includes(netID) && netID.length <= 6 && netID.length >= 4) {
            setSelectedMembers((prevMembers) => [...prevMembers, netID]);
            setSelectedMember("");
        } else {
            alert("Invalid NetID.");
        }
    };

    const addLeader = () => {
        const netID = selectedLeader.trim();
        if (netID && !selectedLeaders.includes(netID) && netID.length <= 6 && netID.length >= 4) {
            setSelectedLeaders((prevLeaders) => [...prevLeaders, netID]);
            setSelectedLeader("");
        } else {
            alert("Invalid NetID.");
        }
    };

    const removeMember = (id) => {
        setSelectedMembers((prevMembers) => prevMembers.filter((memberId) => memberId !== id));
    };

    const removeLeader = (id) => {
        if (selectedLeaders.length != 1) {
            setSelectedLeaders((prevLeaders) => prevLeaders.filter((leaderId) => leaderId !== id));
        } else {
            alert("There should be at least one leader.");
        }
    };

    // Native Wind SetUp
    NativeWindStyleSheet.setOutput({
        default: 'native',
    });

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            const localUri = result.uri;

            // Create a FormData object to send the image to the server
            const formData = new FormData();
            formData.append('image', {
                uri: localUri,
                name: 'image.jpg',
                type: 'image/jpg',
            });

            // Send the image to the server
            try {
                const response = await axios.post('/api/uploadimage', formData);
                console.log('Image uploaded successfully:', response.data);
                setImage(response.data.imagePath); // Set the image path received from the server
            } catch (error) {
                console.error('Error uploading image:', error.message);
            }
        }
    };

    const submitClub = async () => {

        const formData = {
            clubName: clubName,
            description: description,
            instagram: instagram,
            email: email,
            website: website,
            yaleConnect: yaleConnect,
            clubMembers: selectedMembers,
            clubLeaders: selectedLeaders,
            logo: image,
        };

        console.log(formData)

        const response = await axios.post('/api/create', formData);

        if (response.data.success) {
            Toast.show({
                type: 'success',
                text1: 'Success!',
                text2: 'Club Added Successfully!'
            });

            setImage(null);
            setEmail('');
            setWebsite('');
            setClubName('');
            setInstagram('');
            setDescription('');
            setYaleConnect('');
            setSelectedMembers([]);
            setSelectedLeaders([]);

            useRouter().push('/');
        } else {
            Toast.show({
                type: 'error',
                text1: 'Oops!',
                text2: 'Error occurred while adding club'
            });

            console.log(response)
        }
    };

    return (
        <AuthWrapper>
            <SafeAreaView className="w-full">
                <View className="flex-col w-full min-h-screen">
                    <Header/>

                    <Wrapper>
                        <View className="ph:mb-0 md:mb-10 w-full flex items-center">
                            <View className="ph:w-full lg:w-[920px]">
                                <View className='px-[20px]'>
                                    <View className='flex-row items-center'>
                                        <Text className='font-bold text-2xl mr-2'>Club Management System</Text>
                                        <OfficialSVG h={25} w={25}/>
                                    </View>
                                    <Text className='text-sm'>Enter club details</Text>

                                    {/* Main Data Manager */}
                                    <View className='flex flex-row mt-20 gap-x-6 h-[268px]'>
            <View className='w-32'>
                <View className='bg-gray-200 rounded-[30px] w-32 h-32 items-center justify-center overflow-hidden'>
                    {image ? (
                        <Image source={{ uri: image }} style={{ width: 128, height: 128 }}/>
                    ) : (
                        <Text>No Image</Text> // Replace with your <EmptySVG /> component
                    )}
                </View>

                <Pressable onPress={pickImage} className='border-[1px] rounded-md border-sky-500 flex-row justify-center py-2 mt-5'>
                    <Text className='text-sky-500 text-sm'>Upload</Text>
                </Pressable>
            </View>





            <View className='flex-1 flex-col pt-2 gap-y-2 h-full'>
            <Text className='text-md text-gray-500 mb-1'>Club Name</Text>
                <TextInput
                    placeholder="Define your club name"
                    onChangeText={setClubName}
                    value={clubName}
                    style={{ borderWidth: 1, borderColor: 'gray', padding: 10, borderRadius: 5 }}
                />

                <View className='flex-1 flex-col'>
                    <Text className='text-md text-gray-500 mb-1'>Description</Text>
                    <TextInput
                        placeholder='Explain what this club is about?'
                        onChangeText={setDescription}
                        multiline
                        value={description}
                        style={{ borderWidth: 1, borderColor: 'gray', padding: 10, borderRadius: 5, flex: 1 }}
                    />
                </View>
            </View>

            <View className='flex-col gap-y-2 h-full flex-1'>
                <Text className='text-md text-gray-500'>Instagram (Optional)</Text>
                <TextInput
                    placeholder="@username"
                    onChangeText={setInstagram}
                    value={instagram}
                    style={{ borderWidth: 1, borderColor: 'gray', padding: 10, borderRadius: 5 }}
                    title="Instagram (Optional)"
                />
                <Text className='text-md text-gray-500'>Email (Optional)</Text>
                <TextInput
                    placeholder="clubemail@yale.edu"
                    onChangeText={setEmail}
                    value={email}
                    style={{ borderWidth: 1, borderColor: 'gray', padding: 10, borderRadius: 5 }}
                    title="Email (Optional)"
                />
                <Text className='text-md text-gray-500'>Website (Optional)</Text>
                <TextInput
                    placeholder="www.website.com"
                    onChangeText={setWebsite}
                    value={website}
                    style={{ borderWidth: 1, borderColor: 'gray', padding: 10, borderRadius: 5 }}
                    title="Website (Optional)"
                />
                <Text className='text-md text-gray-500'>Yale Connect (Optional)</Text>
                <TextInput
                    placeholder="Share other platforms"
                    onChangeText={setYaleConnect}
                    value={yaleConnect}
                    style={{ borderWidth: 1, borderColor: 'gray', padding: 10, borderRadius: 5 }}
                    title="Yale Connect (Optional)"
                />
            </View>


            
        </View>

                                    {/* Fix Later: Manage Membership */}
                                    <View className='flex-row gap-x-6 h-[170px] mt-7'>
                                        <View className='flex-col shrink w-96'>
                                            <Text className='text-md text-gray-500 mb-1'>Add Members</Text>
                                            <View
                                                className='w-full border-[1px] border-gray-200 shrink rounded-md justify-center'>
                                                <TextInput
                                                    placeholder='Search by NetID...'
                                                    onChangeText={setSelectedMember}
                                                    className='bg-white p-3'
                                                />
                                                <Pressable
                                                    className='absolute right-3 w-4 h-4 bg-gray-300 items-center rounded-md justify-center'
                                                    onPress={addMember}>
                                                    <Text className='text-white mb-0.5'>+</Text>
                                                </Pressable>
                                            </View>
                                        </View>

                                        <View className='flex-col shrink w-96'>
                                            <Text className='text-md text-gray-500 mb-1'>Add Leaders</Text>
                                            <View
                                                className='w-full border-[1px] border-gray-200 shrink rounded-md justify-center'>
                                                <TextInput
                                                    placeholder='Search by NetID...'
                                                    onChangeText={setSelectedLeader}
                                                    className='bg-white p-3'
                                                />
                                                <Pressable
                                                    className='absolute right-3 w-4 h-4 bg-gray-300 items-center rounded-md justify-center'
                                                    onPress={addLeader}>
                                                    <Text className='text-white mb-0.5'>+</Text>
                                                </Pressable>
                                            </View>
                                        </View>

                                        <View className='flex-col w-full shrink'>
                                            <Text className='text-md text-gray-500 mb-1'>Membership
                                                ({selectedMembers.length})</Text>
                                            <View
                                                className='w-full border-[1px] border-gray-200 shrink rounded-md overflow-scroll'>
                                                {selectedLeaders.map((id, index) => (
                                                    <View
                                                        className={`p-3 py-1.5 ${index % 2 === 1 ? 'bg-gray-50' : ''} flex-row justify-between`}
                                                        key={id}>
                                                        <Text className='w-28'>{id}</Text>
                                                        <View className='flex-row gap-x-2 w-full shrink items-center'>
                                                            <Text>Name Surname</Text>
                                                            <View
                                                                className='bg-sky-500 h-4 w-4 rounded-md items-center justify-center'>
                                                                <Text
                                                                    className='text-white font-bold text-[9px]'>R</Text>
                                                            </View>
                                                        </View>

                                                        <Pressable onPress={() => removeLeader(id)}
                                                                   className='h-4 w-4 rounded-md justify-center items-center'>
                                                            <DeleteSVG/>
                                                        </Pressable>
                                                    </View>
                                                ))}
                                                {selectedMembers.map((id, index) => (
                                                    <View
                                                        className={`p-3 py-1.5 ${index % 2 === 1 ? 'bg-gray-50' : ''} flex-row justify-between`}
                                                        key={id}>
                                                        <Text className='w-28'>{id}</Text>
                                                        <Text className='w-full'>Name Surname</Text>

                                                        <Pressable onPress={() => removeMember(id)}
                                                                   className='h-4 w-4 rounded-md justify-center items-center'>
                                                            <DeleteSVG/>
                                                        </Pressable>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    </View>

                                    {/* Submit Footer */}
                                    <View className='flex-row justify-between w-full mt-10 items-start'>
                                        <View className='flex-row gap-x-2 items-center'>
                                            <View className='w-3 h-3 rounded-full bg-yellow-500'></View>
                                            <Text>Updated</Text>
                                        </View>
                                        <View className='flex-row gap-4'>
                                            <View className='flex-row'>
                                                <Pressable onPress={submitClub}
                                                           className='bg-sky-500 py-2 px-5 rounded-md'>
                                                    <Text className='text-white'>Submit</Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>

                                </View>
                            </View>
                        </View>
                    </Wrapper>

                    <Footer/>
                </View>
            </SafeAreaView>
            <Toast/>
        </AuthWrapper>
    );
}

export default CRMManager;

