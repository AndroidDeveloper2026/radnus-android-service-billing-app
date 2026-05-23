// // // src/screens/home/HomeScreen.js
// // import React, { useEffect } from 'react';
// // import { View, Text, StyleSheet, ScrollView } from 'react-native';
// // import { useDispatch, useSelector } from 'react-redux';
// // import { fetchJobs } from '../../store/slices/jobSlice';
// // import { COLORS, SPACING, FONTS } from '../../utils/theme';

// // export default function HomeScreen() {
// //   const dispatch = useDispatch();
// //   const { list } = useSelector(state => state.jobs);

// //   useEffect(() => {
// //     dispatch(fetchJobs({}));
// //   }, []);

// //   const total = list.length;
// //   const pending = list.filter(j => j.status === 'Received' || j.status === 'Pending').length;
// //   const completed = list.filter(j => j.status === 'Delivered').length;

// //   return (
// //     <ScrollView style={{ flex: 1, backgroundColor: COLORS.lightGray, padding: SPACING.lg }}>
// //       <View style={{ marginBottom: SPACING.xl }}>
// //         <Text style={[FONTS.bold, { fontSize: 24, color: COLORS.dark }]}>Radnus 24/7</Text>
// //         <Text style={[FONTS.regular, { color: COLORS.gray, marginTop: SPACING.xs }]}>Service Billing Software</Text>
// //       </View>
// //       <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xl }}>
// //         <View style={styles.card}>
// //           <Text style={styles.cardValue}>{total}</Text>
// //           <Text style={styles.cardLabel}>TOTAL SERVICE JOBS</Text>
// //         </View>
// //         <View style={styles.card}>
// //           <Text style={styles.cardValue}>{pending}</Text>
// //           <Text style={styles.cardLabel}>PENDING SERVICE</Text>
// //         </View>
// //         <View style={styles.card}>
// //           <Text style={styles.cardValue}>{completed}</Text>
// //           <Text style={styles.cardLabel}>COMPLETED SERVICE</Text>
// //         </View>
// //       </View>
// //       <Text style={[FONTS.regular, { textAlign: 'center', color: COLORS.gray, marginTop: SPACING.xxl }]}>
// //         © 2026 RADNUS COMMUNICATION • SERVICE BILLING PLATFORM
// //       </Text>
// //     </ScrollView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   card: {
// //     flex: 1,
// //     backgroundColor: COLORS.white,
// //     borderRadius: 12,
// //     padding: SPACING.lg,
// //     marginHorizontal: SPACING.xs,
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //     elevation: 3,
// //   },
// //   cardValue: {
// //     fontSize: 28,
// //     fontWeight: 'bold',
// //     color: COLORS.primary,
// //   },
// //   cardLabel: {
// //     fontSize: 12,
// //     color: COLORS.gray,
// //     marginTop: SPACING.xs,
// //     textAlign: 'center',
// //   },
// // });

// //==============================

// // src/screens/home/HomeScreen.js
// import React, { useEffect } from 'react';
// import { View, Text, ScrollView, StyleSheet } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchJobs } from '../../store/slices/jobSlice';
// import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';

// export default function HomeScreen() {
//   const dispatch = useDispatch();
//   const { list } = useSelector(state => state.jobs);

//   useEffect(() => {
//     dispatch(fetchJobs({}));
//   }, [dispatch]);

//   const total = list.length;
//   const pending = list.filter(j => j.status === 'Received' || j.status === 'Pending').length;
//   const completed = list.filter(j => j.status === 'Delivered').length;

//   return (
//     <ScrollView style={{ flex: 1, backgroundColor: COLORS.gray50, padding: SPACING.lg }}>
//       <View style={{ marginBottom: SPACING.xl }}>
//         <Text style={[FONTS.bold, { fontSize: 28, color: COLORS.gray900 }]}>Welcome Back!</Text>
//         <Text style={[FONTS.regular, { color: COLORS.gray500, marginTop: SPACING.xs }]}>Here's your service dashboard</Text>
//       </View>

//       <View style={styles.statsContainer}>
//         <View style={styles.statCard}>
//           <Text style={styles.statValue}>{total}</Text>
//           <Text style={styles.statLabel}>Total Jobs</Text>
//         </View>
//         <View style={[styles.statCard, { backgroundColor: COLORS.warning + '10' }]}>
//           <Text style={[styles.statValue, { color: COLORS.warning }]}>{pending}</Text>
//           <Text style={styles.statLabel}>Pending</Text>
//         </View>
//         <View style={[styles.statCard, { backgroundColor: COLORS.success + '10' }]}>
//           <Text style={[styles.statValue, { color: COLORS.success }]}>{completed}</Text>
//           <Text style={styles.statLabel}>Completed</Text>
//         </View>
//       </View>

//       <View style={styles.footer}>
//         <Text style={styles.footerText}>© 2026 RADNUS COMMUNICATION</Text>
//         <Text style={styles.footerSubtext}>Service Billing Platform</Text>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: SPACING.xxxl,
//   },
//   statCard: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     borderRadius: BORDERS.radius.lg,
//     padding: SPACING.lg,
//     marginHorizontal: SPACING.xs,
//     alignItems: 'center',
//     ...SHADOWS.medium,
//   },
//   statValue: {
//     ...FONTS.bold,
//     fontSize: 32,
//     color: COLORS.primary,
//     marginBottom: SPACING.xs,
//   },
//   statLabel: {
//     ...FONTS.medium,
//     fontSize: 12,
//     color: COLORS.gray500,
//   },
//   footer: {
//     alignItems: 'center',
//     marginTop: SPACING.xxl,
//     marginBottom: SPACING.lg,
//   },
//   footerText: {
//     ...FONTS.regular,
//     fontSize: 12,
//     color: COLORS.gray400,
//   },
//   footerSubtext: {
//     ...FONTS.regular,
//     fontSize: 10,
//     color: COLORS.gray300,
//     marginTop: SPACING.xs,
//   },
// });

//=========================

// src/screens/home/HomeScreen.js
import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { ClipboardList, CheckCircle, Clock, PlusCircle, ArrowRight } from 'lucide-react-native';
import { fetchJobs } from '../../store/slices/jobSlice';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { list } = useSelector(state => state.jobs);

  useEffect(() => {
    dispatch(fetchJobs({}));
  }, []);

  const total = list.length;
  const pending = list.filter(j => j.status === 'Received' || j.status === 'Pending').length;
  const completed = list.filter(j => j.status === 'Delivered').length;
  const recentJobs = list.slice(0, 5);

  const StatCard = ({ icon: Icon, title, value, color, gradientColors }) => (
    <View style={[styles.statCard, { backgroundColor: '#FFFFFF' }]}>
      <View style={[styles.statIconWrapper, { backgroundColor: color + '10' }]}>
        <Icon size={28} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const RecentJobItem = ({ job }) => {
    const getStatusStyle = (status) => {
      switch (status?.toLowerCase()) {
        case 'received':
          return { bg: '#3B82F615', text: '#3B82F6' };
        case 'delivered':
          return { bg: '#10B98115', text: '#10B981' };
        case 'pending':
          return { bg: '#F59E0B15', text: '#F59E0B' };
        default:
          return { bg: '#9CA3AF15', text: '#9CA3AF' };
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
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.welcome}>Welcome Back!</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>RADNUS</Text>
        </View>
      </View>

      <Text style={styles.sectionSubtitle}>Your service performance at a glance</Text>

      {/* Stats Grid - 3 columns */}
      <View style={styles.statsGrid}>
        <View style={styles.statCardWrapper}>
          <StatCard
            icon={ClipboardList}
            title="Total Jobs"
            value={total}
            color={COLORS.primary}
          />
        </View>
        <View style={styles.statCardWrapper}>
          <StatCard
            icon={Clock}
            title="Pending"
            value={pending}
            color={COLORS.warning}
          />
        </View>
        <View style={styles.statCardWrapper}>
          <StatCard
            icon={CheckCircle}
            title="Completed"
            value={completed}
            color={COLORS.success}
          />
        </View>
      </View>

      {/* Quick Action Button */}
      <TouchableOpacity
        style={styles.quickAction}
        onPress={() => navigation.navigate('JobSheet', { screen: 'JobSheetForm', params: { mode: 'new' } })}
        activeOpacity={0.9}
      >
        <PlusCircle size={22} color={COLORS.white} />
        <Text style={styles.quickActionText}>Create New Job Sheet</Text>
      </TouchableOpacity>

      {/* Recent Jobs Section */}
      {recentJobs.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Job Sheets</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('JobSheet')}
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

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 RADNUS COMMUNICATION</Text>
        <Text style={styles.footerSubtext}>Service Billing Platform v1.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  contentContainer: {
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  greeting: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray500,
  },
  welcome: {
    ...FONTS.bold,
    fontSize: 24,
    color: COLORS.gray900,
    marginTop: 2,
  },
  headerBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radius.md,
  },
  headerBadgeText: {
    ...FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
  },
  sectionSubtitle: {
    ...FONTS.regular,
    fontSize: 13,
    color: COLORS.gray500,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    // flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statCardWrapper: {
    width: (width - SPACING.lg * 2 - SPACING.md * 2) / 3,
    marginRight: SPACING.md,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    ...FONTS.bold,
    fontSize: 24,
    color: COLORS.gray900,
  },
  statTitle: {
    ...FONTS.medium,
    fontSize: 11,
    color: COLORS.gray500,
    marginTop: 2,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDERS.radius.md,
    ...SHADOWS.medium,
  },
  quickActionText: {
    ...FONTS.semibold,
    fontSize: 16,
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
  recentSection: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: 18,
    color: COLORS.gray900,
  },
  viewAllLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    ...FONTS.medium,
    fontSize: 13,
    color: COLORS.primary,
    marginRight: 4,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  recentLeft: {
    flex: 1,
  },
  recentJobNo: {
    ...FONTS.semibold,
    fontSize: 14,
    color: COLORS.gray900,
    marginBottom: 2,
  },
  recentCustomer: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray500,
  },
  recentStatus: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDERS.radius.sm,
  },
  recentStatusText: {
    ...FONTS.medium,
    fontSize: 11,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xxxl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  footerText: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray400,
  },
  footerSubtext: {
    ...FONTS.regular,
    fontSize: 10,
    color: COLORS.gray300,
    marginTop: SPACING.xs,
  },
});