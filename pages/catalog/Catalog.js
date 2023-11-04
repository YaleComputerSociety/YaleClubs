
import React, { useEffect, useState } from 'react';
import { NativeWindStyleSheet } from "nativewind";
import { useNavigation } from '@react-navigation/native';
import { Text, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { fetchClubs } from '../../api/fetchClubs';
import { FlatGrid } from 'react-native-super-grid';
import SearchBar from '../../components/SearchBar';

NativeWindStyleSheet.setOutput({
  default: "native",
});


const Catalog = ({currPage}) => {
    const navigation = useNavigation();
    const numColumns = 2;

    const [searchValue, setSearchValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [found, setFound] = useState(0);
    
    const [allGroups, setAllGroups] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);


    useEffect(() => {
        const fetchData = async () => {  
            try {
                const data = await fetchClubs();
                setFound(data.length);
                setAllGroups(data);
                setIsLoading(false);
            } catch (error) {
                // In Development
                navigation.navigate('404.js');
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const searchableKeys = [
            'name',
            'address',
            'category',
            'email',
            'mission',
            'phone',
            'type',
            'benefits',
            'constitution',
        ];

        const filteredData = allGroups.filter((group) => {
            for (const key of searchableKeys) {
                if (typeof group[key] === 'string' && group[key].toLowerCase().includes(searchValue.toLowerCase())) {
                    return true;
                }
            }

            return false;
        });

        setFound(filteredData.length);
        setFilteredGroups(filteredData.slice(0, currPage * 20));
    }, [searchValue, allGroups, currPage]);

    const renderItem = ({ item }) => (
        // In Development
        <TouchableOpacity key={item.id} className="relative">
            <View className="rounded-md shadow-sm w-full h-[300] p-5 flex bg-white">
                <Text className="font-bold text-lg mt-2 w-[80%]">{item.name}...</Text>
                <Image source={{uri: item.logo}} className="h-20 right-5 w-20 rounded-full absolute"/>
            </View>
        </TouchableOpacity>
    );

    const onChange = (text) => {
        setSearchValue(text);
    };


    return (
        <View className="py-10 mb-10 w-full flex items-center">
            <View className="w-[920px]">
                <View className="absolute z-[-10] h-[400] w-[470] left-[-150]">
                    <Image source={require("../../assets/decorator.png")} className="h-full" />
                </View>

                <View className="p-5">
                    <Text className="font-bold text-2xl">Browse Clubs</Text>
                    <Text className="text-1xl">Shopping has never been easier.</Text>

                    <SearchBar onChange={onChange} searchValue={searchValue} found={found} />
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#aaa" />
                ) : (
                    <View>
                        <FlatGrid
                            data={filteredGroups}
                            renderItem={renderItem}
                            itemContainerStyle={{ justifyContent: 'flex-start' }}
                            spacing={20}
                            itemDimension={350}
                            maxItemsPerRow={numColumns}
                        />
                        <ActivityIndicator size="large" color="#aaa" />
                    </View>
                )}
            </View>
        </View>
    );
}

export default Catalog;
