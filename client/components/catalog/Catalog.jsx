
import { NativeWindStyleSheet } from "nativewind";

import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { Text, View, ActivityIndicator, Pressable } from 'react-native';
import { reloadClubs, fetchClubsJSON } from '../../api/ManageClubs';
import { FlatGrid } from 'react-native-super-grid';

import useFilteredData from "../../hooks/FilterData";
import SearchBar from './SearchBar';
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
                setIsLoading(true);

                // Check the last reload time from AsyncStorage
                const lastReloadTime = await AsyncStorage.getItem('lastReloadTime');

                if (!lastReloadTime || Date.now() - new Date(lastReloadTime).getTime() > 6 * 60 * 60 * 1000) {
                    await reloadClubs();

                    // Update the last reload time in AsyncStorage
                    await AsyncStorage.setItem('lastReloadTime', new Date().toISOString());
                }

                const clubs = await fetchClubsJSON({});
                console.log(clubs);
                setAllGroups(clubs);

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching or saving data:', error);
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

    if (fetchError) {
        return (
            <View>
                <Text>Error fetching data: {fetchError.message}</Text>
            </View>
        );
    }

    return (
        <Wrapper>
            <View className="absolute z-[-10] ph:hidden lg:flex h-[400] left-[-210] top-[-20]">
                <DecoratorSVG />
            </View>

            <View className="px-5">
                <Text className="font-bold text-2xl">Browse Clubs</Text>
                <Text className="text-1xl">Shopping has never been easier.</Text>

                <SearchBar onChange={(text) => { onChange(text); setPage(1); }} searchValue={searchValue} found={found} />
            </View>

            {isLoading ? (
                <ActivityIndicator className="mx-auto" color="#aaa" />
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
                        scrollEnabled={false}
                        itemContainerStyle={{ justifyContent: 'flex-start' }}
                        spacing={20}
                        itemDimension={350}
                        maxItemsPerRow={numColumns}
                    />
                    {page * 100 < found && <ActivityIndicator className="mx-auto mb-10" />}
                </View>
            )}
        </Wrapper>
    );
    
}

export default Catalog;
