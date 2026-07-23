import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { ClipboardList, CheckCircle, Clock, PlusCircle, ArrowRight } from 'lucide-react-native';
import { fetchJobs } from '../../store/slices/jobSlice';
import { api } from '../../utils/api';
import { COLORS } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import styles from './HomeStyle';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { list } = useSelector(state => state.jobs);
  const { user } = useAuth();
  
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchJobs({})).unwrap(),
      fetchStats(),
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    dispatch(fetchJobs({}));
    fetchStats();
  }, []);

  const total = stats.total || list.length;
  const pending = stats.pending || list.filter(j => j.status === 'Received' || j.status === 'Pending').length;
  const completed = stats.completed || list.filter(j => j.status === 'Delivered').length;

  const recentJobs = list.slice(0, 5);

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <View style={styles.statIconContainer}>
        <Icon size={28} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const RecentJobItem = ({ job }) => {
    const getStatusStyle = (status) => {
      switch (status?.toLowerCase()) {
        case 'received': return { bg: '#3B82F615', text: '#3B82F6' };
        case 'delivered': return { bg: '#10B98115', text: '#10B981' };
        case 'pending': return { bg: '#F59E0B15', text: '#F59E0B' };
        default: return { bg: '#9CA3AF15', text: '#9CA3AF' };
      }
    };
    const statusStyle = getStatusStyle(job.status);

    return (
      <TouchableOpacity
        style={styles.recentItem}
        onPress={() => navigation.navigate('JobSheet', { screen: 'JobDetail', params: { jobId: job.id } })}
        activeOpacity={0.7}
      >
        <View style={styles.recentLeft}>
          <Text style={styles.recentJobNo}>{job.jobNo}</Text>
          <Text style={styles.recentCustomer}>{job.customerName}</Text>
        </View>
        <View style={[styles.recentStatus, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.recentStatusText, { color: statusStyle.text }]}>{job.status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.welcome}>
            Welcome Back{user ? `, ${user.username || 'User'}` : ''}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionSubtitle}>Your service performance at a glance</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCardWrapper}>
          <StatCard
            icon={ClipboardList}
            title="Total Jobs"
            value={total}
            color={COLORS.primary}
            bgColor={COLORS.primaryLight}
          />
        </View>
        <View style={styles.statCardWrapper}>
          <StatCard
            icon={Clock}
            title="Pending"
            value={pending}
            color={COLORS.warning}
            bgColor={COLORS.warning + '10'}
          />
        </View>
        <View style={styles.statCardWrapper}>
          <StatCard
            icon={CheckCircle}
            title="Completed"
            value={completed}
            color={COLORS.success}
            bgColor={COLORS.success + '10'}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.quickAction}
        onPress={() => navigation.navigate('JobSheet', { screen: 'JobSheetForm', params: { mode: 'new' } })}
        activeOpacity={0.9}
      >
        <PlusCircle size={22} color={COLORS.white} />
        <Text style={styles.quickActionText}>Create New Job Sheet</Text>
      </TouchableOpacity>

      {recentJobs.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Job Sheets</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('JobSheet', {screen: 'SearchJobSheet'})}
              style={styles.viewAllLink}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ArrowRight size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {recentJobs.map(job => (
            <RecentJobItem key={job.id} job={job} />
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 RADNUS COMMUNICATION</Text>
        <Text style={styles.footerSubtext}>Service Billing Platform v1.0</Text>
      </View>
    </ScrollView>
  );
}


// // src/screens/home/HomeScreen.js
// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   RefreshControl,
// } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigation } from '@react-navigation/native';
// import { ClipboardList, CheckCircle, Clock, PlusCircle, ArrowRight } from 'lucide-react-native';
// import { fetchJobs } from '../../store/slices/jobSlice';
// import { api } from '../../utils/api';
// import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
// import { useAuth } from '../../context/AuthContext'; // ADD THIS IMPORT
// import styles from './HomeStyle';

// export default function HomeScreen() {
//   const dispatch = useDispatch();
//   const navigation = useNavigation();
//   const { list } = useSelector(state => state.jobs);
//   const { user } = useAuth(); // ADD THIS LINE - Get user from AuthContext
  
//   const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchStats = async () => {
//     try {
//       const data = await api.getDashboardStats();
//       setStats(data);
//     } catch (error) {
//       console.error('Failed to fetch stats:', error);
//     }
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await Promise.all([
//       dispatch(fetchJobs({})).unwrap(),
//       fetchStats(),
//     ]);
//     setRefreshing(false);
//   };

//   useEffect(() => {
//     dispatch(fetchJobs({}));
//     fetchStats();
//   }, []);

//   // Use stats from API (to match web), fallback to local calculation if API fails
//   const total = stats.total || list.length;
//   const pending = stats.pending || list.filter(j => j.status === 'Received' || j.status === 'Pending').length;
//   const completed = stats.completed || list.filter(j => j.status === 'Delivered').length;

//   const recentJobs = list.slice(0, 5);

//   const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
//     <View style={[styles.statCard, { backgroundColor: bgColor }]}>
//       <View style={styles.statIconContainer}>
//         <Icon size={28} color={color} />
//       </View>
//       <View style={styles.statContent}>
//         <Text style={[styles.statValue, { color }]}>{value}</Text>
//         <Text style={styles.statTitle}>{title}</Text>
//       </View>
//     </View>
//   );

//   const RecentJobItem = ({ job }) => {
//     const getStatusStyle = (status) => {
//       switch (status?.toLowerCase()) {
//         case 'received': return { bg: '#3B82F615', text: '#3B82F6' };
//         case 'delivered': return { bg: '#10B98115', text: '#10B981' };
//         case 'pending': return { bg: '#F59E0B15', text: '#F59E0B' };
//         default: return { bg: '#9CA3AF15', text: '#9CA3AF' };
//       }
//     };
//     const statusStyle = getStatusStyle(job.status);

//     return (
//       <TouchableOpacity
//         style={styles.recentItem}
//         onPress={() => navigation.navigate('JobSheet', { screen: 'JobDetail', params: { jobId: job.id } })}
//         activeOpacity={0.7}
//       >
//         <View style={styles.recentLeft}>
//           <Text style={styles.recentJobNo}>{job.jobNo}</Text>
//           <Text style={styles.recentCustomer}>{job.customerName}</Text>
//         </View>
//         <View style={[styles.recentStatus, { backgroundColor: statusStyle.bg }]}>
//           <Text style={[styles.recentStatusText, { color: statusStyle.text }]}>{job.status}</Text>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <ScrollView
//       style={styles.container}
//       showsVerticalScrollIndicator={false}
//       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
//     >
//       {/* Header Section - UPDATED to show username */}
//       <View style={styles.header}>
//         <View>
//           <Text style={styles.greeting}>Hello,</Text>
//           <Text style={styles.welcome}>
//             Welcome Back{user ? `, ${user.username || 'User'}` : ''}
//           </Text>
//         </View>
//       </View>

//       <Text style={styles.sectionSubtitle}>Your service performance at a glance</Text>

//       {/* Stats Grid - 3 columns */}
//       <View style={styles.statsGrid}>
//         <View style={styles.statCardWrapper}>
//           <StatCard
//             icon={ClipboardList}
//             title="Total Jobs"
//             value={total}
//             color={COLORS.primary}
//             bgColor={COLORS.primaryLight}
//           />
//         </View>
//         <View style={styles.statCardWrapper}>
//           <StatCard
//             icon={Clock}
//             title="Pending"
//             value={pending}
//             color={COLORS.warning}
//             bgColor={COLORS.warning + '10'}
//           />
//         </View>
//         <View style={styles.statCardWrapper}>
//           <StatCard
//             icon={CheckCircle}
//             title="Completed"
//             value={completed}
//             color={COLORS.success}
//             bgColor={COLORS.success + '10'}
//           />
//         </View>
//       </View>

//       {/* Quick Action Button */}
//       <TouchableOpacity
//         style={styles.quickAction}
//         onPress={() => navigation.navigate('JobSheet', { screen: 'JobSheetForm', params: { mode: 'new' } })}
//         activeOpacity={0.9}
//       >
//         <PlusCircle size={22} color={COLORS.white} />
//         <Text style={styles.quickActionText}>Create New Job Sheet</Text>
//       </TouchableOpacity>``

//       {/* Recent Jobs Section */}
//       {recentJobs.length > 0 && (
//         <View style={styles.recentSection}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Recent Job Sheets</Text>
//             <TouchableOpacity
//               onPress={() => navigation.navigate('JobSheet', {screen: 'SearchJobSheet', })}  // navigation.navigate('JobSheet') 
//               style={styles.viewAllLink}
//             >
//               <Text style={styles.viewAllText}>View All</Text>
//               <ArrowRight size={16} color={COLORS.primary} />
//             </TouchableOpacity>
//           </View>

//           {recentJobs.map(job => (
//             <RecentJobItem key={job.id} job={job} />
//           ))}
//         </View>
//       )}

//       {/* Footer */}
//       <View style={styles.footer}>
//         <Text style={styles.footerText}>© 2026 RADNUS COMMUNICATION</Text>
//         <Text style={styles.footerSubtext}>Service Billing Platform v1.0</Text>
//       </View>
//     </ScrollView>
//   );
// }
