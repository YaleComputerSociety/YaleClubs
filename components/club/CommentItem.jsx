
import { NativeWindStyleSheet } from 'nativewind';
import { Text, View } from 'react-native';

const CommentItem = () => {

    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });
    
    return (
        <View className='w-full flex-col rounded-md border-[1px] mt-4 border-gray-100 px-5 py-3.5'>
            <Text className='text-xl font-semibold'>Name Surname</Text>
            <Text className='mt-1 text-sm leading-5'>Yummy yummy bread mmm I love bread baking flour oven dough so good. Baguette croissant oui oui oui wheeeee. Please join the club! Word limit.  Yummy yummy bread mmm I love bread baking flour oven dough so good. Baguette croissant oui oui oui wheeeee. Please join the club! Word limit. Yummy yummy bread mmm I love bread baking flour oven dough so good. Baguette croissant oui oui oui wheeeee. Please join the club! Word limit.</Text>
            <View className='justify-between flex-row mt-2'>
                <Text className='text-gray-400'>Rating Here</Text>
                <Text className='text-gray-400'>Likes</Text>
            </View>
        </View>
    );

}

export default CommentItem;
