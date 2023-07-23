import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Image, TextInput, Switch, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function Profile({ route }) {
    const { setState } = route.params;
    const [localState, setLocalState] = useState({});
    // Define states for each input field and the notification settings
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [notificationSettings, setNotificationSettings] = useState({
        "Order statuses": false,
        "Password changes": false,
        "Special offers": false,
        "Newsletters": false,
    });
    const [image, setImage] = useState(null);

    const handlePhoneNumberChange = (text) => {
        const phoneNumberRegex = /^\([0-9]{3}\) [0-9]{3}-[0-9]{4}$/;
        if (phoneNumberRegex.test(text)) {
            setPhoneNumber(text);
        }
    }

    useEffect(() => {
        // Populating states from storage using AsyncStorage.multiGet
        (async () => {
            try {
                const states = await AsyncStorage.getItem('state');
                const parsedState = JSON.parse(states);
                setLocalState(parsedState);

                const userInfo = await AsyncStorage.getItem('userInfo');
                const parsedInfo = JSON.parse(userInfo);
                setFirstName(parsedInfo.firstName);
                setEmail(parsedInfo.email);
                setLastName(parsedInfo.lastName);
                setPhoneNumber(parsedInfo.phoneNumber);
                setImage(parsedInfo.image);

                const notificationInfo = await AsyncStorage.getItem('notification');
                const parsedNotification = notificationInfo == null ? notificationSettings : JSON.parse(notificationInfo);
                setNotificationSettings(parsedNotification);
            } catch (e) {
                console.log(e);
            }
        })();
    }, []);

    const saveChanges = async () => {
        const userInfo = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phoneNumber: phoneNumber,
            image: image
        };
        const jsonUserInfo = JSON.stringify(userInfo);
        await AsyncStorage.setItem('userInfo', jsonUserInfo);

        const jsonNotification = JSON.stringify(notificationSettings);
        await AsyncStorage.setItem('notification', jsonNotification);

        Alert.alert('Changes Saved')
    }

    const logOut = async () => {
        try {
            const states = {
                ...localState,
                isOnboardingCompleted: false,
            }
            await AsyncStorage.setItem('state', JSON.stringify(states));
            setState(states);
        } catch (e) {
            console.log(e)
        }
    };

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const removeImage = () => {
        setImage(null);
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.headerText}>Personal information</Text>
            <Text style={styles.labelText}>Avatar</Text>
            <View style={styles.avatarContainer}>
                {image ?
                    <Image style={styles.profileImg} source={{ uri: image }} /> :
                    <View style={styles.circle}>
                        <Text style={styles.profileText}>{firstName.charAt(0)}{lastName?lastName.charAt(0):null}</Text>
                    </View>}

                <Pressable onPress={pickImage}>
                    <Text style={styles.confirmButton}>Change</Text>
                </Pressable>
                <Pressable onPress={removeImage}>
                    <Text style={styles.cancelButton}>Remove</Text>
                </Pressable>
            </View>
            <Text style={styles.labelText}>First name</Text>
            <TextInput
                style={styles.inputFiled}
                value={firstName}
                onChangeText={text => setFirstName(text)}
            />
            <Text style={styles.labelText}>Last name</Text>
            <TextInput
                style={styles.inputFiled}
                value={lastName}
                onChangeText={text => setLastName(text)}
            />
            <Text style={styles.labelText}>Email</Text>
            <TextInput
                style={styles.inputFiled}
                value={email}
                onChangeText={text => setEmail(text)}
            />
            <Text style={styles.labelText}>Phone number </Text>
            <TextInput
                style={styles.inputFiled}
                value={phoneNumber}
                onChangeText={handlePhoneNumberChange}
            />
            <Text style={styles.headerText}>Email notification</Text>
            {Object.keys(notificationSettings).map((key) => (
                <View style={styles.notification}>
                    <Switch
                        value={notificationSettings[key]}
                        onValueChange={(newValue) => setNotificationSettings({
                            ...notificationSettings,
                            [key]: newValue,
                        })}
                    />
                    <Text style={styles.notifText}>{key}</Text>
                </View>
            ))}
            <Pressable onPress={logOut} style={styles.logoutButton}>
                <Text style={styles.logoutText}>
                    Log out
                </Text>
            </Pressable>
            <View style={styles.bottomContainer}>
                <Pressable>
                    <Text style={styles.cancelButton}>Discard changes</Text>
                </Pressable>
                <Pressable onPress={saveChanges}>
                    <Text style={styles.confirmButton}>Save changes</Text>
                </Pressable>
            </View>
        </ScrollView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 10,
        marginBottom: 40,
    },
    profileImg: {
        width: 70,
        height: 70,
        borderRadius: 500,
        resizeMode: 'cover'
    },
    circle: {
        width: 70,
        height: 70,
        borderRadius: 70/2,
        backgroundColor: "#FBDABB",
        justifyContent: 'center', 
        alignItems: 'center',
    },
    profileText: {
        color: 'white',
        fontSize: 40,
        fontWeight: 400,
    },
    headerText: {
        fontSize: 15,
        padding: 5,
        fontWeight: 700,
        marginTop: 10
    },
    labelText: {
        fontSize: 12,
        color: 'grey',
        padding: 5,
        marginTop: 8
    },
    inputFiled: {
        padding: 10,
        borderColor: 'grey',
        borderWidth: 1,
        borderRadius: 10
    },
    confirmButton: {
        color: 'white',
        borderRadius: 10,
        backgroundColor: '#495E57',
        padding: 10,
        borderColor: 'black',
        borderWidth: 1,
        overflow: 'hidden',
        fontWeight: 500

    },
    cancelButton: {
        borderRadius: 10,
        padding: 10,
        borderColor: 'black',
        borderWidth: 1,
        fontWeight: 500
    },
    avatarContainer: {
        marginRight: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    bottomContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 40,
        marginVertical: 10
    },
    logoutButton: {
        backgroundColor: '#F4CE14',
        borderRadius: 10,
        padding: 10,
        borderColor: 'black',
        borderWidth: 1,
        textAlign: 'center',
        marginVertical: 20,
    },
    logoutText: {
        textAlign: 'center',
        fontWeight: 500
    },
    notification: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    notifText: {
        marginLeft: 5,
    }
})