// src/screens/jobsheet/SearchJobSheetScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Search, Plus, Filter } from 'lucide-react-native';
import { fetchJobs, setFilters } from '../../store/slices/jobSlice';
import { StatusChip, EmptyState } from '../../components/UI';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
import styles from './SearchJobSheetStyle';

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

