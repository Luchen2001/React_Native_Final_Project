import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const CustomHeader = () => {
    const [image, setImage] = useState(null);
    useEffect(() => {
        // Populating states from storage using AsyncStorage.multiGet
        (async () => {
            try {
                const userInfo = await AsyncStorage.getItem('userInfo');
                const parsedInfo = JSON.parse(userInfo);
                setImage(parsedInfo.image);
            } catch (e) {
                console.log(e);
            }
        })();
    }, []);

    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                {navigation.canGoBack() ? <Ionicons style={styles.goBack} name="md-arrow-back" size={24} color="black" /> : <View style={styles.goBack}/>}
            </TouchableOpacity>

            <Image style={styles.logo} source={require('./assets/Logo.png')} />


            <Pressable style={styles.profileWrapper} onPress={() => navigation.navigate('Profile')}>
                <Image style={styles.profile}  source={image?{ uri: image }:require('./assets/Profile.png')} />
            </Pressable>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 60,
        marginTop: 40
    },
    goBack:{
        padding:10,
    },
    logo: {
        height: 30,
        resizeMode: 'contain',
    },
    profileWrapper: {
        height: 55,
        width: 55,
    },
    profile: {
        flex: 1,
        height: 50,
        width: 50,
        borderRadius: 22.5,
        resizeMode: 'contain',
    },
});

export default CustomHeader;
