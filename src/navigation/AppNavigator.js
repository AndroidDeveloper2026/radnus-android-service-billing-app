// // src/navigation/AppNavigator.js
// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { createStackNavigator } from '@react-navigation/stack';
// import {
//   Home,
//   ClipboardList,
//   BarChart3,
//   Settings,
//   LogOut,
// } from 'lucide-react-native';
// import { TouchableOpacity, Alert, View, Platform } from 'react-native';
// import {
//   SafeAreaView,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';
// import { useAuth } from '../context/AuthContext';
// import { COLORS, SPACING, SHADOWS, FONTS } from '../utils/theme';

// import HomeScreen from '../screens/home/HomeScreen';
// import SearchJobSheetScreen from '../screens/jobsheet/SearchJobSheetScreen';
// import JobSheetFormScreen from '../screens/jobsheet/JobSheetFormScreen';
// import JobDetailScreen from '../screens/jobsheet/JobDetailScreen';
// import ReportsScreen from '../screens/reports/ReportsScreen';
// import AdminScreens from '../screens/admin/AdminScreens';
// import LoginScreen from '../screens/auth/LoginScreen';
// import EstimateBillScreen from '../screens/jobsheet/EstimateBillScreen';
// import InvoiceBillScreen from '../screens/jobsheet/InvoiceBillScreen';
// import UserListScreen from '../screens/admin/UserListScreen';
// import AddUserScreen from '../screens/admin/AddUserScreen';
// import UserReportScreen from '../screens/admin/UserReportScreen';

// const Tab = createBottomTabNavigator();
// const Stack = createStackNavigator();

// function JobSheetStack() {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen
//         name="SearchJobSheet"
//         component={SearchJobSheetScreen}
//         options={{ headerTitle: 'Job Sheets', headerShown: true }}
//       />
//       <Stack.Screen
//         name="JobSheetForm"
//         component={JobSheetFormScreen}
//         options={{ headerTitle: 'Job Sheet Form', headerShown: true }}
//       />
//       <Stack.Screen
//         name="JobDetail"
//         component={JobDetailScreen}
//         options={{ headerTitle: 'Job Details', headerShown: true }}
//       />
//       <Stack.Screen
//         name="EstimateBill"
//         component={EstimateBillScreen}
//         options={{ headerTitle: 'Estimate Bill', headerShown: true }}
//       />
//       <Stack.Screen
//         name="InvoiceBill"
//         component={InvoiceBillScreen}
//         options={{ headerTitle: 'Invoice Bill', headerShown: true }}
//       />
//     </Stack.Navigator>
//   );
// }

// function AdminStack() {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen
//         name="AdminMain"
//         component={AdminScreens}
//         options={{ headerTitle: 'Masters', headerShown: true }}
//       />
//       <Stack.Screen
//         name="UserList"
//         component={UserListScreen}
//         options={{ headerTitle: 'User List' }}
//       />
//       <Stack.Screen
//         name="AddUser"
//         component={AddUserScreen}
//         options={{ headerTitle: 'Add User' }}
//       />
//       <Stack.Screen
//         name="UserReport"
//         component={UserReportScreen}
//         options={{ headerTitle: 'User JobSheet Report' }}
//       />
//     </Stack.Navigator>
//   );
// }

// function MainTabs() {
//   const { logout } = useAuth();
//   const insets = useSafeAreaInsets();

//   const handleLogout = () => {
//     Alert.alert('Logout', 'Are you sure you want to logout?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Logout', onPress: () => logout(), style: 'destructive' },
//     ]);
//   };

//   return (
//     <SafeAreaView
//       style={{ flex: 1, backgroundColor: COLORS.white }}
//       edges={['bottom']}
//     >
//       <Tab.Navigator
//         screenOptions={({ route }) => ({
//           tabBarIcon: ({ focused, color, size }) => {
//             const icons = {
//               Home: Home,
//               JobSheet: ClipboardList,
//               Reports: BarChart3,
//               Data: Settings,
//             };
//             const IconComponent = icons[route.name];
//             return (
//               <IconComponent
//                 size={22}
//                 color={color}
//                 strokeWidth={focused ? 2 : 1.5}
//               />
//             );
//           },
//           tabBarActiveTintColor: COLORS.primary,
//           tabBarInactiveTintColor: COLORS.gray400,
//           tabBarLabelStyle: {
//             ...FONTS.medium,
//             fontSize: 11,
//           },
//           tabBarStyle: {
//             backgroundColor: COLORS.white,
//             borderTopWidth: 0.5,
//             borderTopColor: COLORS.gray200,
//             height: Platform.OS === 'ios' ? 75 : 65,
//             paddingBottom: Platform.OS === 'ios' ? 20 : 10,
//             paddingTop: 8,
//             elevation: 0,
//             shadowOpacity: 0,
//           },
//           headerStyle: {
//             backgroundColor: COLORS.white,
//             elevation: 0,
//             shadowOpacity: 0,
//             borderBottomWidth: 0.5,
//             borderBottomColor: COLORS.gray100,
//           },
//           headerTitleStyle: {
//             ...FONTS.bold,
//             fontSize: 18,
//             color: COLORS.gray900,
//           },
//           headerRight: () => (
//             <TouchableOpacity
//               onPress={handleLogout}
//               style={{ marginRight: SPACING.lg }}
//               activeOpacity={0.7}
//             >
//               <LogOut size={22} color={COLORS.error} />
//             </TouchableOpacity>
//           ),
//         })}
//       >
//         <Tab.Screen
//           name="Home"
//           component={HomeScreen}
//           options={{
//             title: 'Dashboard',
//             headerTitle: 'Dashboard',
//           }}
//         />
//         <Tab.Screen
//           name="JobSheet"
//           component={JobSheetStack}
//           options={{
//             title: 'Job Sheets',
//             headerShown: false,
//           }}
//         />
//         <Tab.Screen
//           name="Reports"
//           component={ReportsScreen}
//           options={{
//             title: 'Reports',
//             headerTitle: 'Reports',
//           }}
//         />
//         <Tab.Screen
//           name="Data"
//           component={AdminStack}
//           options={{
//             title: 'Masters',
//             headerShown: false,
//           }}
//         />
//       </Tab.Navigator>
//     </SafeAreaView>
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

//+++++++++++++++++++++++++++++++++++++

// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, ClipboardList, BarChart2, Settings, LogOut, Wrench } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/home/HomeScreen';
import EngineerDashboardScreen from '../screens/engineer/EngineerDashboardScreen';
import SearchJobSheetScreen from '../screens/jobsheet/SearchJobSheetScreen';
import JobSheetFormScreen from '../screens/jobsheet/JobSheetFormScreen';
import JobDetailScreen from '../screens/jobsheet/JobDetailScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import AdminScreens from '../screens/admin/AdminScreens';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function JobSheetStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SearchJobSheet"
        component={SearchJobSheetScreen}
        options={{ headerTitle: 'Job Sheets', headerShown: true }}
      />
      <Stack.Screen
        name="JobSheetForm"
        component={JobSheetFormScreen}
        options={{ headerTitle: 'Job Sheet Form', headerShown: true }}
      />
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ headerTitle: 'Job Details', headerShown: true }}
      />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminMain"
        component={AdminScreens}
        options={{ headerTitle: 'Masters', headerShown: true }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { user, logout } = useAuth();
  const isEngineer = user?.role === 'engineer';

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => logout(), style: 'destructive' },
    ]);
  };

  const screenOptions = ({ route }) => ({
    tabBarIcon: ({ focused, color, size }) => {
      let IconComponent;
      if (route.name === 'Home') IconComponent = Home;
      else if (route.name === 'EngineerDashboard') IconComponent = Wrench;
      else if (route.name === 'JobSheet') IconComponent = ClipboardList;
      else if (route.name === 'Reports') IconComponent = BarChart2;
      else if (route.name === 'Data') IconComponent = Settings;
      else IconComponent = Home;

      return <IconComponent size={22} color={color} strokeWidth={focused ? 2 : 1.5} />;
    },
    tabBarActiveTintColor: '#3b82f6',
    tabBarInactiveTintColor: '#94a3b8',
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: '500',
    },
    tabBarStyle: {
      backgroundColor: '#fff',
      borderTopWidth: 0.5,
      borderTopColor: '#e2e8f0',
      height: Platform.OS === 'ios' ? 75 : 65,
      paddingBottom: Platform.OS === 'ios' ? 20 : 10,
      paddingTop: 8,
      elevation: 0,
      shadowOpacity: 0,
    },
    headerStyle: {
      backgroundColor: '#fff',
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 0.5,
      borderBottomColor: '#f1f5f9',
    },
    headerTitleStyle: {
      fontWeight: '700',
      fontSize: 18,
      color: '#1e293b',
    },
    headerRight: () => (
      <TouchableOpacity
        onPress={handleLogout}
        style={{ marginRight: 20 }}
        activeOpacity={0.7}
      >
        <LogOut size={22} color="#ef4444" />
      </TouchableOpacity>
    ),
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
      <Tab.Navigator screenOptions={screenOptions}>
        {isEngineer ? (
          <Tab.Screen
            name="EngineerDashboard"
            component={EngineerDashboardScreen}
            options={{
              title: 'My Jobs',
              headerTitle: 'Engineer Dashboard',
              headerShown: false,
            }}
          />
        ) : (
          <>
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Dashboard', headerTitle: 'Dashboard' }}
            />
            <Tab.Screen
              name="JobSheet"
              component={JobSheetStack}
              options={{ title: 'Job Sheets', headerShown: false }}
            />
            <Tab.Screen
              name="Reports"
              component={ReportsScreen}
              options={{ title: 'Reports', headerTitle: 'Reports' }}
            />
            <Tab.Screen
              name="Data"
              component={AdminStack}
              options={{ title: 'Masters', headerShown: false }}
            />
          </>
        )}
      </Tab.Navigator>
    </SafeAreaView>
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