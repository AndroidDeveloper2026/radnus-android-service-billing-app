// src/screens/jobsheet/SearchJobSheetScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Search, Plus, Filter } from 'lucide-react-native';
import { fetchJobs, setFilters } from '../../store/slices/jobSlice';
import { StatusChip, EmptyState } from '../../components/UI';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';

export default function SearchJobSheetScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { list, loading, filters } = useSelector(state => state.jobs);
  const [searchText, setSearchText] = useState(filters.search);
  const [statusFilter, setStatusFilter] = useState(filters.status);
  
  // Debounce timer
  const debounceTimer = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback((text) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      dispatch(setFilters({ search: text, status: statusFilter }));
    }, 500);
  }, [dispatch, statusFilter]);

  const handleSearchChange = (text) => {
    setSearchText(text);
    debouncedSearch(text);
  };

  const handleStatusFilter = (status) => {
    const newStatus = status === 'All Status' ? 'All Status' : status;
    setStatusFilter(newStatus);
    dispatch(setFilters({ search: searchText, status: newStatus }));
  };

  useEffect(() => {
    dispatch(fetchJobs(filters));
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [filters,dispatch]);

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
            onChangeText={handleSearchChange}
          />
        </View>
        {/* Optional: manual search button removed – now real-time */}
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
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.gray500,
  },
  tabTextActive: {
    color: COLORS.primary,
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
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
});