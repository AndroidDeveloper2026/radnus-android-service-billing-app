// src/screens/admin/UserReportScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SectionList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
import { useToast } from 'react-native-toast-notifications';
import { api } from '../../utils/api';

export default function UserReportScreen() {
  const navigation = useNavigation();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);

  // Load all data on mount
  useEffect(() => {
    fetchData('');
  }, []);

  const fetchData = async (search = '') => {
    setLoading(true);
    try {
      const data = await api.getUserReport(search);
      setReportData(data || {});
    } catch (error) {
      console.error('UserReport error:', error);
      toast.show(error.message || 'Failed to load report', { type: 'danger' });
      setReportData({});
    } finally {
      setLoading(false);
    }
  };

  // Debounced search: wait 500ms after user stops typing
  const debouncedSearch = useCallback((text) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchData(text);
    }, 500);
  }, []);

  const handleSearchChange = (text) => {
    setSearchTerm(text);
    debouncedSearch(text);
  };

  // Manual search when button is pressed
  const handleSearchPress = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    fetchData(searchTerm);
  };

  const handleJobPress = (jobId) => {
    navigation.navigate('JobSheet', {
      screen: 'JobDetail',
      params: { jobId: jobId },
    });
  };

  const renderSectionHeader = ({ section: { title, data } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title || 'Unknown'} ({data.length} jobs)</Text>
    </View>
  );

  const renderJobItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.jobItem}
      onPress={() => handleJobPress(item._id)}
      activeOpacity={0.7}
    >
      <Text style={styles.jobIndex}>{index + 1}</Text>
      <Text style={styles.jobSheetNo}>{item.jobSheetNo}</Text>
      <Text style={styles.customerName}>{item.customer?.name || '-'}</Text>
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  const sections = reportData
    ? Object.keys(reportData).map(username => ({
        title: username,
        data: reportData[username],
      }))
    : [];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter JobSheet No or Username"
          value={searchTerm}
          onChangeText={handleSearchChange}
          placeholderTextColor={COLORS.gray400}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
          <Search size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data found</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, idx) => item._id + idx}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderJobItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderRadius: BORDERS.radius.md,
    paddingHorizontal: SPACING.md,
    height: 48,
    ...FONTS.regular,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: BORDERS.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  sectionHeader: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: 16,
    color: COLORS.primary,
  },
  jobItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  jobIndex: {
    width: 40,
    ...FONTS.medium,
    color: COLORS.gray500,
  },
  jobSheetNo: {
    flex: 2,
    ...FONTS.semibold,
    color: COLORS.gray900,
  },
  customerName: {
    flex: 3,
    ...FONTS.regular,
    color: COLORS.gray700,
  },
  date: {
    flex: 2,
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray500,
  },
  loader: {
    marginTop: SPACING.xxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.xxxl,
  },
  emptyText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.gray400,
  },
});