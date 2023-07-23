import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Image,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useFonts } from 'expo-font';

export default function Onboarding({route}) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [disable, setDisable] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { setState } = route.params;

  const handleFirstNameChange = (text) => {
    setFirstName(text);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
  };

  useEffect(() => {
    if (!isSubmitted) return;

    let newFirstNameError = '';
    let newEmailError = '';

    if (firstName.trim() === '') {
      newFirstNameError = 'First name is required';
    }

    if (email.trim() === '') {
      newEmailError = 'Email is required';
    } else if (!email.match(/^\S+@\S+\.\S+$/)) {
      newEmailError = 'Invalid email address';
    }

    setFirstNameError(newFirstNameError);
    setEmailError(newEmailError);
  }, [firstName, email, isSubmitted]);

  useEffect(() => {
    setDisable(firstNameError !== '' || emailError !== '');
  }, [firstNameError, emailError]);

  const handleNextPress = () => {
    setIsSubmitted(true);

    if (disable) return;

    const changeState = async (state) => {
      try {
        const jsonValue = JSON.stringify(state);
        await AsyncStorage.setItem('state', jsonValue);
      } catch (err) {
        console.log(err);
      }
    }

    const storeUserInfo = async () => {
      try {
        const userInfo = {
          firstName:firstName,
          email:email
        }
        const jsonValue = JSON.stringify(userInfo);
        await AsyncStorage.setItem('userInfo', jsonValue);
      } catch (err) {
        console.log(err);
      }
    }

    storeUserInfo();
    const newState = { isOnboardingCompleted: true};
    changeState(newState);
    setState(newState);
    
  };

  const [fontsLoaded] = useFonts({
    'Karla-Regular': require('../assets/Karla-Regular.ttf'),
    'MarkaziText-Regular': require('../assets/MarkaziText-Regular.ttf')
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Image style={styles.logo} source={require('../assets/Logo.png')} />
        </View>
        <View style={styles.main}>
          <Text style={styles.headerMsg}>Let us get to know you</Text>
          <Text style={styles.inputText}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={handleFirstNameChange}
          />
          {firstNameError !== '' && <Text style={styles.errorText}>{firstNameError}</Text>}
          <Text style={styles.inputText}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={handleEmailChange}
          />
          {emailError !== '' && <Text style={styles.errorText}>{emailError}</Text>}
        </View>

        <Pressable style={[styles.button, disable ? { backgroundColor: 'gray' } : { backgroundColor: '#EE9972' }]} onPress={handleNextPress} disabled={disable}>
          <Text style={styles.buttonText}>Next</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#FBDABB',
    alignItems: 'center',
  },
  logo: {
    resizeMode: 'contain',
    height: 100,
    width: 300,
  },
  main: {
    backgroundColor: '#EDEFEE',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerMsg: {
    textAlign: 'center',
    fontSize: 35,
    marginBottom: 80,
    fontWeight: '500',
    fontFamily: 'MarkaziText-Regular',
  },
  inputText: {
    fontSize: 25,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'Karla-Regular',
  },
  input: {
    height: 50,
    borderWidth: 3,
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    fontSize: 25,
    fontFamily: 'Karla-Regular',
  },
  button: {
    alignSelf: 'flex-end',
    width: 150,
    height: 50,
    marginVertical: 45,
    padding: 10,
    alignItems: 'center',
    marginRight: 30,
    borderRadius: 10,
    backgroundColor: '#EDEFEE',
  },
  buttonText: {
    fontSize: 25,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Karla-Regular',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 5,
    fontFamily: 'Karla-Regular',
  },
});
