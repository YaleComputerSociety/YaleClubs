
import { useEffect, useState } from 'react';
import { NativeWindStyleSheet } from 'nativewind';
import axios from 'axios';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import CommentItem from './CommentItem';

const Comments = ({clubId}) => {
    const [text, setText] = useState('');
    const [comments, setComments] = useState([]);
    const [anonymous, setAnonymous] = useState(false);

    // Native Wind
    NativeWindStyleSheet.setOutput({
        default: "native",
    });

    const handleCommentSubmit = async () => {
        try {
            // Submit comment
            console.log(anonymous);
            await axios.post(`http://${process.env.BASE_URL}:${process.env.PORT}/api/comment`, { text, clubId, anonymous });
            console.log('Comment submitted successfully!');
            setText('');
        } catch (error) {
            console.error('Error submitting comment:', error);
        }

        // Fetch all comments
        await requestAllComments();
    };

    const requestAllComments = async () => {
        try {
            const response = await axios.post(`http://${process.env.BASE_URL}:${process.env.PORT}/api/comments`, { clubId });
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching all comments:', error);
        }
    };

    useEffect(() => {
        requestAllComments();
    }, []);

    const renderCommentItem = ({ item }) => (
        <CommentItem item={item} />
    );

    return (
        <View className="w-full flex-col">
            <Text className="font-bold text-2xl mt-5">Comments & Ratings</Text>
            <View className='flex-row items-start mt-2'>
                <View className='w-full flex-shrink'>
                    <TextInput
                        multiline
                        numberOfLines={5}
                        value={text}
                        placeholder='Leave Message Here...'
                        placeholderTextColor="#D6D6D6"
                        onChangeText={(newText) => setText(newText)}
                        className='
                            h-20 
                            border-[1px] 
                            border-gray-100 
                            rounded-md 
                            px-3 py-2.5
                            w-full
                            flex-shrink'
                    />
                    <View className='mt-2 justify-between flex-row'>
                        <View>
                            <Text>Rating Here</Text>
                        </View>
                        <Pressable className='flex-row items-center' onPress={() => setAnonymous(prevState => !prevState)}>
                            <View className={`h-4 w-4 mr-2 rounded-md border-[1px] border-black ${anonymous ? 'bg-black' : ''}`}></View>
                            <Text selectable={false}>Anonymous</Text>
                        </Pressable>
                    </View>
                </View>
                <Pressable
                    onPress={handleCommentSubmit} 
                    className="rounded-md py-1.5 ml-2 w-24 bg-sky-500 justify-center items-center"
                >
                    <Text className='text-white'>Submit</Text>
                </Pressable>
            </View>
            
            <View className='mt-8'>
                <View className='flex-col gap-y-4'>
                    <FlatList
                        data={comments}
                        renderItem={renderCommentItem}
                        keyExtractor={(item) => item._id.toString()}
                    />
                </View>
            </View>
        </View>
    );

}

export default Comments;
