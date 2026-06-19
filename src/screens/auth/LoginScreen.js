// // src/screens/auth/LoginScreen.js
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useAuth } from '../../context/AuthContext';
// import { useToast } from 'react-native-toast-notifications';
// import { LogIn, Mail, Lock, Smartphone } from 'lucide-react-native';

// export default function LoginScreen() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuth();
//   const toast = useToast();

//   const handleLogin = async () => {
//     if (!username || !password) {
//       toast.show('Please enter username and password', { type: 'danger' });
//       return;
//     }
//     setLoading(true);
//     try {
//       await login(username, password);
//       toast.show('Login successful', { type: 'success' });
//     } catch (error) {
//       toast.show(error.message || 'Login failed', { type: 'danger' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.container}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}
//           bounces={false}
//         >
//           <View style={styles.logoContainer}>
//             <View style={styles.logoCircle}>
//               <Smartphone size={48} color="#fff" />
//             </View>
//             <Text style={styles.appName}>RADNUS</Text>
//             <Text style={styles.tagline}>Service Billing App</Text>
//           </View>

//           <View style={styles.card}>
//             <View style={styles.inputContainer}>
//               <Mail size={18} color="#94a3b8" />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Username"
//                 placeholderTextColor="#94a3b8"
//                 value={username}
//                 onChangeText={setUsername}
//               />
//             </View>

//             <View style={styles.inputContainer}>
//               <Lock size={18} color="#94a3b8" />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Password"
//                 placeholderTextColor="#94a3b8"
//                 secureTextEntry
//                 value={password}
//                 onChangeText={setPassword}
//               />
//             </View>

//             <TouchableOpacity
//               style={styles.loginButton}
//               onPress={handleLogin}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <>
//                   <LogIn size={18} color="#fff" />
//                   <Text style={styles.loginButtonText}>Sign In</Text>
//                 </>
//               )}
//             </TouchableOpacity>
//           </View>

//           <View style={styles.footer}>
//             <Text style={styles.footerText}>© 2026 RADNUS COMMUNICATION</Text>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   scrollContent: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     padding: 24,
//   },
//   logoContainer: {
//     alignItems: 'center',
//     marginBottom: 48,
//   },
//   logoCircle: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: '#3b82f6',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   appName: {
//     fontWeight: '700',
//     fontSize: 32,
//     color: '#1e293b',
//   },
//   tagline: {
//     fontSize: 14,
//     color: '#64748b',
//     marginTop: 8,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     marginBottom: 16,
//     backgroundColor: '#f8fafc',
//   },
//   input: {
//     flex: 1,
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//     fontSize: 14,
//     color: '#1e293b',
//   },
//   loginButton: {
//     backgroundColor: '#3b82f6',
//     borderRadius: 8,
//     paddingVertical: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//   },
//   loginButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   footer: {
//     marginTop: 48,
//     alignItems: 'center',
//   },
//   footerText: {
//     fontSize: 12,
//     color: '#cbd5e1',
//   },
// });

//+++++++++++++++++++++++++++++++++

// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useToast } from 'react-native-toast-notifications';
import { LogIn, Mail, Lock, Smartphone } from 'lucide-react-native';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();

  const handleLogin = async () => {
    if (!username || !password) {
      toast.show('Please enter username and password', { type: 'danger' });
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      toast.show('Login successful', { type: 'success' });
    } catch (error) {
      toast.show(error.message || 'Login failed', { type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Smartphone size={48} color="#fff" />
            </View>
            <Text style={styles.appName}>RADNUS</Text>
            <Text style={styles.tagline}>Service Billing App</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <Mail size={18} color="#b91c1c" />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#9ca3af"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={18} color="#b91c1c" />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <LogIn size={18} color="#fff" />
                  <Text style={styles.loginButtonText}>Sign In</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 RADNUS COMMUNICATION</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dc2626', // red-600
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  appName: {
    fontWeight: '700',
    fontSize: 32,
    color: '#1f2937',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
    backgroundColor: '#fafafa',
    transition: 'border-color 0.2s',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#dc2626', // red-600
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 48,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#d1d5db',
    letterSpacing: 0.3,
    fontWeight: '500',
  },
});