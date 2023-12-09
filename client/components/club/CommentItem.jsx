import StarRatingDisplay from 'react-native-star-rating-widget';
import { NativeWindStyleSheet } from 'nativewind';
import { Text, View } from 'react-native';
import { useState } from 'react';

const CommentItem = ({item}) => {
    const [rating, setRating] = useState(4.5);

    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });
    
    return (
        <View className='w-full flex-col rounded-md border-[1px] mt-4 border-gray-100 px-5 py-3.5'>
            <Text className='text-xl font-semibold'>{item.name}</Text>
            <Text className='mt-1 text-sm leading-5'>{item.text}</Text>
            <View className='justify-between flex-row mt-2'>
                <Text className='text-gray-400 ml-[-6]'>
                    <StarRatingDisplay
                        rating={rating}
                        color="#0ea5e9"
                        starSize={18}
                        onChange={setRating}
                    />
                </Text>
                <Text className='text-gray-400'>0 Likes</Text>
            </View>
        </View>
    );

}

export default CommentItem;
