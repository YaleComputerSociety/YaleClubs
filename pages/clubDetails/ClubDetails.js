import React from 'react';
import { Text, View } from 'react-native';

const ClubDetails = ({ route }) => {
    const { id, email, name, description } = route.params;

    return (
        <View>
            <Text>Name: {name}</Text>
            <Text>Email: {email}</Text>
            <Text>Mission: {mission}</Text>
        </View>
    );
}

export default ClubDetails;
