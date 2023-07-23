import { View, Text, Pressable } from "react-native";

export default function Home({navigation}){

    return(
        <View>
            <Text>
                Home Screen
            </Text>
            <Pressable onPress={()=> navigation.navigate('Profile')}>
                <Text>
                    Profile
                </Text>
            </Pressable>
        </View>
    )
}