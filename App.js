import React, { useReducer, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, View, Image, StyleSheet } from 'react-native';
import OnboardingScreen from './screens/Onboarding';
import ProfileScreen from './screens/Profile';
import SplashScreen from './screens/Splash'
import HomeScreen from './screens/Home';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from './CustomHeader';

const Stack = createNativeStackNavigator();

export default function App() {
  const [state, setState] = useState({
    isLoading: true,
    isOnboardingCompleted: false
  });
  useEffect(() => {
    (async () => {
      try {
        const values = await AsyncStorage.getItem('state');
        setState(values === null ? [] : JSON.parse(values));
        console.log(state)
      } catch (e) {
        Alert.alert(`An error occurred: ${e.message}`);
      }
    })();
  }, []);


  if (state.isLoading) {
    // We haven't finished reading from AsyncStorage yet
    return <SplashScreen />;
  }


  return (
    <NavigationContainer>
      <Stack.Navigator>
        {state.isOnboardingCompleted ? (
          // Onboarding completed, user is signed in
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                header: props => <CustomHeader {...props} />,
              }}
            />
            <Stack.Screen
              //navigationKey={state.isOnboardingCompleted ? 'onBoard' : 'notOnBoard'}
              name='Profile'
              component={ProfileScreen}
              initialParams={{ setState }}
              options={{
                header: props => <CustomHeader {...props} />,
              }}
            />
          </>
        ) : (
          // User is NOT signed in
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} initialParams={{ setState }} />

          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  logo: {
    flexDirection: 'row',
    height: 30,
    resizeMode: 'contain',
  },
  profile: {
    height: 45,
    width: 45,
    alignSelf: 'flex-end',
    borderRadius: 20,
    resizeMode: 'contain',
  },
  profileWrapper: {
    position: 'absolute',
    right: 40,
    top: -10
  }
})
