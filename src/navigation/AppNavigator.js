// // src/navigation/AppNavigator.js
// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { createStackNavigator } from '@react-navigation/stack';
// import { Home, ClipboardList, BarChart3, Settings, LogOut } from 'lucide-react-native';
// import { TouchableOpacity, Text, Alert } from 'react-native';
// import { useAuth } from '../context/AuthContext';
// import { COLORS } from '../utils/theme';

// import HomeScreen from '../screens/home/HomeScreen';
// import SearchJobSheetScreen from '../screens/jobsheet/SearchJobSheetScreen';
// import JobSheetFormScreen from '../screens/jobsheet/JobSheetFormScreen';
// import JobDetailScreen from '../screens/jobsheet/JobDetailScreen';
// import ReportsScreen from '../screens/reports/ReportsScreen';
// import AdminScreens from '../screens/admin/AdminScreens';
// import LoginScreen from '../screens/auth/LoginScreen';

// const Tab = createBottomTabNavigator();
// const Stack = createStackNavigator();

// function JobSheetStack() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="SearchJobSheet" component={SearchJobSheetScreen} />
//       <Stack.Screen name="JobSheetForm" component={JobSheetFormScreen} />
//       <Stack.Screen name="JobDetail" component={JobDetailScreen} />
//     </Stack.Navigator>
//   );
// }

// function AdminStack() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="AdminMain" component={AdminScreens} />
//     </Stack.Navigator>
//   );
// }

// function MainTabs() {
//   const { logout } = useAuth();
  
//   const handleLogout = () => {
//     Alert.alert('Logout', 'Are you sure you want to logout?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Logout', onPress: () => logout() },
//     ]);
//   };

//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         tabBarIcon: ({ focused, color, size }) => {
//           if (route.name === 'Home') return <Home size={size} color={color} />;
//           if (route.name === 'JobSheet') return <ClipboardList size={size} color={color} />;
//           if (route.name === 'Reports') return <BarChart3 size={size} color={color} />;
//           if (route.name === 'Data') return <Settings size={size} color={color} />;
//           return null;
//         },
//         tabBarActiveTintColor: COLORS.primary,
//         tabBarInactiveTintColor: COLORS.gray,
//         headerRight: () => (
//           <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
//             <LogOut size={24} color={COLORS.danger} />
//           </TouchableOpacity>
//         ),
//         headerTitleStyle: { color: COLORS.primary, fontWeight: 'bold' },
//       })}
//     >
//       <Tab.Screen name="Home" component={HomeScreen} />
//       <Tab.Screen name="JobSheet" component={JobSheetStack} />
//       <Tab.Screen name="Reports" component={ReportsScreen} />
//       <Tab.Screen name="Data" component={AdminStack} />
//     </Tab.Navigator>
//   );
// }

// export default function AppNavigator() {
//   const { user, loading } = useAuth();

//   if (loading) return null;

//   return (
//     <NavigationContainer>
//       {user ? <MainTabs /> : <LoginScreen />}
//     </NavigationContainer>
//   );
// }

//================================

// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Home, ClipboardList, BarChart3, Settings, LogOut } from 'lucide-react-native';
import { TouchableOpacity, Alert, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, SHADOWS, FONTS } from '../utils/theme';

import HomeScreen from '../screens/home/HomeScreen';
import SearchJobSheetScreen from '../screens/jobsheet/SearchJobSheetScreen';
import JobSheetFormScreen from '../screens/jobsheet/JobSheetFormScreen';
import JobDetailScreen from '../screens/jobsheet/JobDetailScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import AdminScreens from '../screens/admin/AdminScreens';
import LoginScreen from '../screens/auth/LoginScreen';
import EstimateBillScreen from '../screens/jobsheet/EstimateBillScreen';
import InvoiceBillScreen from '../screens/jobsheet/InvoiceBillScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function JobSheetStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchJobSheet" component={SearchJobSheetScreen} />
      <Stack.Screen name="JobSheetForm" component={JobSheetFormScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="EstimateBill" component={EstimateBillScreen} /> 
      <Stack.Screen name="InvoiceBill" component={InvoiceBillScreen} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminMain" component={AdminScreens} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { logout } = useAuth();
  
  const handleLogout = () => {
    Alert.alert(
      'Logout', 
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => logout(), style: 'destructive' },
      ]
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: Home,
            JobSheet: ClipboardList,
            Reports: BarChart3,
            Data: Settings,
          };
          const IconComponent = icons[route.name];
          return <IconComponent size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 0,
          height: 60,
          paddingBottom: SPACING.sm,
          ...SHADOWS.large,
        },
        tabBarLabelStyle: {
          ...FONTS.medium,
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: COLORS.white,
          ...SHADOWS.small,
        },
        headerTitleStyle: {
          ...FONTS.bold,
          fontSize: 18,
          color: COLORS.gray900,
        },
        headerRight: () => (
          <TouchableOpacity 
            onPress={handleLogout} 
            style={{ marginRight: SPACING.lg }}
            activeOpacity={0.7}
          >
            <LogOut size={22} color={COLORS.error} />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="JobSheet" component={JobSheetStack} options={{ title: 'Job Sheets' }} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Data" component={AdminStack} options={{ title: 'Masters' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <LoginScreen />}
    </NavigationContainer>
  );
}