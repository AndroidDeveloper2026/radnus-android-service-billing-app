// // App.js
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Animated,
//   StatusBar,
//   Dimensions,
// } from 'react-native';
// import { Provider } from 'react-redux';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { ToastProvider } from 'react-native-toast-notifications';

// import { store } from './src/store';
// import AppNavigator from './src/navigation/AppNavigator';
// import { AuthProvider } from './src/context/AuthContext';
// import { Platform } from 'react-native';
// import { requestStoragePermission } from './src/utils/permissions';

// const { width, height } = Dimensions.get('window');

// const SplashScreenComponent = ({ onFinish }) => {
//   const fadeAnim = useState(new Animated.Value(1))[0];
//   const scaleAnim = useState(new Animated.Value(1))[0];

//   useEffect(() => {
//   if (Platform.OS === 'android') {
//     requestStoragePermission();
//   }
// }, []);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       Animated.parallel([
//         Animated.timing(fadeAnim, {
//           toValue: 0,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//         Animated.timing(scaleAnim, {
//           toValue: 1.2,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//       ]).start(() => {
//         onFinish();
//       });
//     }, 2000);

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <Animated.View
//       style={[
//         styles.splashContainer,
//         {
//           opacity: fadeAnim,
//           transform: [{ scale: scaleAnim }],
//         },
//       ]}
//     >
//       <View style={styles.splashContent}>
//         <View style={styles.logoCircle}>
//           <Text style={styles.logoText}>R</Text>
//         </View>
//         <Text style={styles.appName}>RADNUS</Text>
//         <Text style={styles.tagline}>Service Billing App</Text>
//       </View>
//     </Animated.View>
//   );
// };

// export default function App() {
//   const [showSplash, setShowSplash] = useState(true);

//   if (showSplash) {
//     return (
//       <GestureHandlerRootView style={{ flex: 1 }}>
//         <StatusBar barStyle="light-content" backgroundColor="#EF4444" />
//         <SplashScreenComponent onFinish={() => setShowSplash(false)} />
//       </GestureHandlerRootView>
//     );
//   }

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
//       <SafeAreaProvider>
//         <Provider store={store}>
//           <AuthProvider>
//             <ToastProvider placement="top" duration={2000}>
//               <AppNavigator />
//             </ToastProvider>
//           </AuthProvider>
//         </Provider>
//       </SafeAreaProvider>
//     </GestureHandlerRootView>
//   );
// }

// const styles = StyleSheet.create({
//   splashContainer: {
//     flex: 1,
//     backgroundColor: '#EF4444', // Red brand color
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   splashContent: {
//     alignItems: 'center',
//   },
//   logoCircle: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     backgroundColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   logoText: {
//     fontSize: 48,
//     fontWeight: 'bold',
//     color: '#EF4444',
//   },
//   appName: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     marginBottom: 8,
//   },
//   tagline: {
//     fontSize: 14,
//     color: '#FEE2E2',
//     fontWeight: '500',
//   },
// });

//================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProvider } from 'react-native-toast-notifications';

import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';

const { width, height } = Dimensions.get('window');

const SplashScreenComponent = ({ onFinish }) => {
  const fadeAnim = useState(new Animated.Value(1))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.splashContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.splashContent}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>R</Text>
        </View>
        <Text style={styles.appName}>RADNUS</Text>
        <Text style={styles.tagline}>Service Billing App</Text>
      </View>
    </Animated.View>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="#EF4444" />
        <SplashScreenComponent onFinish={() => setShowSplash(false)} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaProvider>
        <Provider store={store}>
          <AuthProvider>
            <ToastProvider placement="top" duration={2000}>
              <AppNavigator />
            </ToastProvider>
          </AuthProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#FEE2E2',
    fontWeight: '500',
  },
});