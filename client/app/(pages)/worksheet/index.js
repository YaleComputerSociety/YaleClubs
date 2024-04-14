//
// import { NativeWindStyleSheet } from 'nativewind';
//
// import { FlatList, Pressable, Text, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useEffect, useState } from 'react';
// import { useRouter } from 'expo-router';
// import axios from 'axios';
//
// import AuthWrapper from '../../../components/AuthWrapper';
// import Footer from '../../../components/footer/Footer';
// import Header from '../../../components/header/Header';
// import Wrapper from '../../../components/Wrapper';
// import { fetchClubsJSON } from '../../../api/ManageClubs';
// import ClubItemWorksheet from '../../../components/worksheet/ClubItemWorksheet';
// import DecoratorSVG from '../../../assets/decorator';
//
//
// const Worksheet = () => {
//     const navigation = useRouter();
//
//     // Native Wind SetUp
//     NativeWindStyleSheet.setOutput({
//         default: 'native',
//     });
//
//     const [clubs, setClubs] = useState([]);
//     const [savedClubIds, setSavedClubIds] = useState([]);
//     const [savedClub, setSavedClub] = useState([]);
//
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const response = await axios.get('/api/get-saved-clubs');
//                 const savedClubIds = response.data.savedClubs;
//                 setSavedClubIds(savedClubIds);
//             } catch (error) {
//                 console.error('Error fetching saved clubs:', error);
//             }
//         };
//
//         const fetchAllClubs = async () => {
//             try {
//                 const response = await fetchClubsJSON({});
//                 setClubs(response);
//             } catch (error) {
//                 console.error('Error fetching all clubs:', error);
//             }
//         };
//
//         fetchData();
//         fetchAllClubs();
//     }, []);
//
//     useEffect(() => {
//         if (!clubs) return;
//         setSavedClub(clubs.filter((club) => savedClubIds.includes(club.id.toString())));
//     }, [clubs, savedClubIds]);
//
//     return (
//         <AuthWrapper>
//             <SafeAreaView className="w-full">
//                 <View className="flex-col w-full min-h-screen">
//                     <Header />
//                     <Wrapper>
//                         <View className="absolute z-[-10] ph:hidden lg:flex h-[400] left-[-210] top-[-20]">
//                             <DecoratorSVG />
//                         </View>
//
//                         <View className="ph:mb-4 lg:mb-10 mx-5 flex">
//                             <View className='flex-row justify-between items-end ph:mb-5 lg:mb-10'>
//                                 <View>
//                                     <Text className='text-2xl font-bold'>Worksheet & Leader Board</Text>
//                                     <Text>Saved Clubs & Club Management System</Text>
//                                 </View>
//                                 <Pressable onPress={() => navigation.push('/crm')} className='border-sky-500 border-[1px] rounded-md p-2 px-5 justify-center'>
//                                     <Text className='text-sky-500'>Register the Club</Text>
//                                 </Pressable>
//                             </View>
//                             <View className='mt-4'>
//                                 {savedClubIds.length > 0 ? (
//                                     <>
//                                         <Text className='text-xl font-bold mt-4'>Your Saved Clubs ({savedClub.length})</Text>
//                                         <FlatList
//                                             className='mt-4'
//                                             data={savedClub}
//                                             keyExtractor={(item) => item.id}
//                                             horizontal={true}
//                                             contentContainerStyle={{ flexDirection: 'row' }}
//                                             renderItem={({ item }) => (
//                                                 <ClubItemWorksheet item={item} />
//                                             )}
//                                         />
//                                     </>
//                                 ) : (
//                                     <View className='mt-4 flex-col'><Text>No results has been found.</Text><Text className='text-sky-500 mt-1'>How to register?</Text></View>
//                                 )}
//                             </View>
//                         </View>
//                     </Wrapper>
//                     <Footer />
//                 </View>
//             </SafeAreaView>
//         </AuthWrapper>
//     );
//
// }
//
// export default Worksheet;
