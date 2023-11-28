
import { NativeWindStyleSheet } from "nativewind";

import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View, ActivityIndicator, Pressable } from 'react-native';
import { fetchClubs } from '../../api/FetchClubs';
import { FlatGrid } from 'react-native-super-grid';

import useFilteredData from "../../hooks/FilterData";
import SearchBar from '../catalog/SearchBar';
import ClubItem from "../club/ClubItem";
import Wrapper from "../Wrapper";
import DecoratorSVG from "../../assets/decorator";


const Catalog = ({page, setPage}) => {
    const numColumns = 2;
    const navigation = useRouter();

    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [allGroups, setAllGroups] = useState([]);
    const [fetchError, setFetchError] = useState(null);

    const { searchValue, onChange, found, filteredGroups } = useFilteredData(allGroups);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedData = await AsyncStorage.getItem('allGroupData');
                setIsLoading(true);

                if (storedData) {
                    // Use stored data if available
                    setAllGroups(JSON.parse(storedData));
                    console.log(JSON.parse(storedData));
                } else {
                    // Fetch data from the API if not stored
                    const all = await fetchClubs({});
                    const excludedLogoURL = 'https://yaleconnect.yale.edu/images/Redirect_arrow_small.png';
                    data = all.filter((item) => item.logo !== null && item.logo !== excludedLogoURL);
                    setAllGroups(data);

                    // Save fetched data to AsyncStorage
                    await AsyncStorage.setItem('allGroupData', JSON.stringify(data));
                }

                setIsLoading(false);
            } catch (error) {
                // Log Values (In Development)
                console.error('Error fetching club data:', error);
                setFetchError(error);
                setIsLoading(false);
            }
        };
    
        fetchData();
    }, []);
    
    const renderItem = useMemo(
        () => ({ item }) => <ClubItem item={item} />,
        []
    );
    
    // Catch Errors
    if (fetchError) {
        return (
            <View>
                <Text>Error fetching data: {fetchError.message}</Text>
            </View>
        );
    }

    return (
        <Wrapper>
            <View className="absolute z-[-10] h-[400] w-[470] left-[-210] top-[-20]">
                <DecoratorSVG />
            </View>

            <View className="px-5">
                <Text className="font-bold text-2xl">Browse Clubs</Text>
                <Text className="text-1xl">Shopping has never been easier.</Text>

                <SearchBar onChange={(text) => { onChange(text); setPage(1); }} searchValue={searchValue} found={found} />
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#aaa" />
            ) : found === 0 ? (
                <View className="p-5">
                    <Text>Sorry. No results has been found by your request.</Text>
                    <Pressable onPress={() => navigation.push(`#`)} className="cursor-pointer mt-1"><Text className="text-blue-500">Request a new club?</Text></Pressable>
                </View>
            ) : (
                <View>
                    <FlatGrid
                        data={filteredGroups.slice(0, page * 100)}
                        renderItem={renderItem}
                        itemContainerStyle={{ justifyContent: 'flex-start' }}
                        spacing={20}
                        itemDimension={350}
                        maxItemsPerRow={numColumns}
                    />
                </View>
            )}
        </Wrapper>
    );
    
}

export default Catalog;
