// // src/screens/jobsheet/SearchJobSheetScreen.js
// import React, { useState, useEffect } from 'react';
// import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigation } from '@react-navigation/native';
// import { Search, Plus, Filter } from 'lucide-react-native';
// import { fetchJobs, setFilters } from '../../store/slices/jobSlice';
// import { StatusChip, EmptyState, LoadingOverlay } from '../../components/UI';
// import { COLORS, SPACING, FONTS } from '../../utils/theme';

// export default function SearchJobSheetScreen() {
//   const dispatch = useDispatch();
//   const navigation = useNavigation();
//   const { list, loading, filters } = useSelector(state => state.jobs);
//   const [searchText, setSearchText] = useState(filters.search);
//   const [statusFilter, setStatusFilter] = useState(filters.status);

//   useEffect(() => {
//     dispatch(fetchJobs(filters));
//   }, [filters]);

//   const handleSearch = () => {
//     dispatch(setFilters({ search: searchText, status: statusFilter }));
//   };

//   const handleStatusFilter = (status) => {
//     setStatusFilter(status);
//     dispatch(setFilters({ status }));
//   };

//   const renderJobItem = ({ item }) => (
//     <TouchableOpacity
//       style={{ backgroundColor: COLORS.white, padding: SPACING.lg, marginBottom: SPACING.sm, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border }}
//       onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
//     >
//       <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
//         <Text style={[FONTS.semibold, { color: COLORS.primary }]}>{item.jobNo}</Text>
//         <StatusChip status={item.status} />
//       </View>
//       <Text style={[FONTS.medium]}>{item.customerName}</Text>
//       <Text style={[FONTS.regular, { color: COLORS.gray, fontSize: 12 }]}>{item.contact}</Text>
//       <Text style={[FONTS.regular, { color: COLORS.gray, fontSize: 12 }]}>Saved: {item.savedDate}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={{ flex: 1, backgroundColor: COLORS.lightGray }}>
//       <View style={{ backgroundColor: COLORS.white, padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
//         <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
//           <View style={{ flex: 1, flexDirection: 'row', backgroundColor: COLORS.lightGray, borderRadius: 8, alignItems: 'center', paddingHorizontal: SPACING.md }}>
//             <Search size={20} color={COLORS.gray} />
//             <TextInput
//               style={{ flex: 1, padding: SPACING.md, ...FONTS.regular }}
//               placeholder="Job Sheet / IMEI / Contact / Name"
//               value={searchText}
//               onChangeText={setSearchText}
//               onSubmitEditing={handleSearch}
//             />
//           </View>
//           <TouchableOpacity onPress={handleSearch} style={{ marginLeft: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.primary, borderRadius: 8 }}>
//             <Filter size={20} color={COLORS.white} />
//           </TouchableOpacity>
//         </View>
//         <View style={{ flexDirection: 'row' }}>
//           {['All Status', 'Received', 'Pending', 'Delivered'].map(status => (
//             <TouchableOpacity
//               key={status}
//               style={{ marginRight: SPACING.md, paddingVertical: SPACING.xs, borderBottomWidth: statusFilter === status ? 2 : 0, borderBottomColor: COLORS.primary }}
//               onPress={() => handleStatusFilter(status)}
//             >
//               <Text style={[FONTS.medium, { color: statusFilter === status ? COLORS.primary : COLORS.gray }]}>{status}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>
//       <FlatList
//         data={list}
//         keyExtractor={item => item.id}
//         renderItem={renderJobItem}
//         ListEmptyComponent={<EmptyState message="No job sheets found" />}
//         refreshControl={<RefreshControl refreshing={loading} onRefresh={() => dispatch(fetchJobs(filters))} />}
//         contentContainerStyle={{ padding: SPACING.lg }}
//       />
//       <TouchableOpacity
//         style={{ position: 'absolute', bottom: 20, right: 20, backgroundColor: COLORS.primary, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 5 }}
//         onPress={() => navigation.navigate('JobSheetForm', { mode: 'new' })}
//       >
//         <Plus size={28} color={COLORS.white} />
//       </TouchableOpacity>
//       <LoadingOverlay visible={loading} />
//     </View>
//   );
// }

//============================

// src/screens/jobsheet/SearchJobSheetScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Search, Plus, Filter } from 'lucide-react-native';
import { fetchJobs, setFilters } from '../../store/slices/jobSlice';
import { StatusChip, EmptyState, LoadingOverlay } from '../../components/UI';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';

export default function SearchJobSheetScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { list, loading, filters } = useSelector(state => state.jobs);
  const [searchText, setSearchText] = useState(filters.search);
  const [statusFilter, setStatusFilter] = useState(filters.status);

  useEffect(() => {
    dispatch(fetchJobs(filters));
  }, [filters]);

  const handleSearch = () => {
    dispatch(setFilters({ search: searchText, status: statusFilter }));
  };

  const handleStatusFilter = (status) => {
    const newStatus = status === 'All Status' ? 'All Status' : status;
    setStatusFilter(newStatus);
    dispatch(setFilters({ status: newStatus }));
  };

  const renderJobItem = ({ item }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.jobNumber}>{item.jobNo}</Text>
        <StatusChip status={item.status} />
      </View>
      <Text style={styles.customerName}>{item.customerName}</Text>
      <Text style={styles.contact}>{item.contact}</Text>
      <Text style={styles.date}>Saved: {item.savedDate}</Text>
    </TouchableOpacity>
  );

  const statusTabs = ['All Status', 'Received', 'Pending', 'Delivered'];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.gray50 }}>
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Job #, IMEI, Contact or Name"
            placeholderTextColor={COLORS.gray400}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity onPress={handleSearch} style={styles.filterButton}>
          <Filter size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        {statusTabs.map(status => (
          <TouchableOpacity
            key={status}
            style={[styles.tab, statusFilter === status && styles.tabActive]}
            onPress={() => handleStatusFilter(status)}
          >
            <Text style={[styles.tabText, statusFilter === status && styles.tabTextActive]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={list}
        keyExtractor={item => item.id}
        renderItem={renderJobItem}
        ListEmptyComponent={<EmptyState message="No job sheets found" />}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => dispatch(fetchJobs(filters))} />}
        contentContainerStyle={{ padding: SPACING.lg }}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('JobSheetForm', { mode: 'new' })}
        activeOpacity={0.8}
      >
        <Plus size={24} color={COLORS.white} />
      </TouchableOpacity>

      <LoadingOverlay visible={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  searchHeader: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDERS.radius.md,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.gray900,
  },
  filterButton: {
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
    width: 48,
    height: 48,
    borderRadius: BORDERS.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tab: {
    marginRight: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
  },
  tabText: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.gray500,
  },
  tabTextActive: {
    color: COLORS.accent,
  },
  jobCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  jobNumber: {
    ...FONTS.bold,
    fontSize: 16,
    color: COLORS.gray900,
  },
  customerName: {
    ...FONTS.semibold,
    fontSize: 14,
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  contact: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  date: {
    ...FONTS.regular,
    fontSize: 11,
    color: COLORS.gray400,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    backgroundColor: COLORS.accent,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
});