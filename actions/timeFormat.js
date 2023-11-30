import AsyncStorage from '@react-native-async-storage/async-storage';

export const formatTimeElapsed = async () => {
    try {
        const lastUpdate = await AsyncStorage.getItem('lastReloadTime');

        if (!lastUpdate) {
        return 'Last updated: Never';
        }

        const now = new Date();
        const updateDate = new Date(lastUpdate);

        const elapsedMilliseconds = now - updateDate;
        const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);

        const hours = Math.floor(elapsedSeconds / 3600);
        const minutes = Math.floor((elapsedSeconds % 3600) / 60);

        let elapsedString = 'Updated';

        if (hours > 0) {
<<<<<<< Updated upstream
            elapsedString += `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
=======
            elapsedString += ` ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
>>>>>>> Stashed changes
        }

        if (minutes > 0) {
            elapsedString += ` ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
        }

        if (hours === 0 && minutes === 0) {
<<<<<<< Updated upstream
            elapsedString += 'a few seconds';
=======
            elapsedString += ' a few seconds';
>>>>>>> Stashed changes
        }

        elapsedString += ' ago';

        return elapsedString;
    } catch (error) {
        console.error('Error getting last update time:', error);
        return 'Last updated: Never';
    }
};
