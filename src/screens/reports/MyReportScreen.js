// src/screens/reports/MyReportScreen.js
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  RefreshControl,
  FlatList,
  StatusBar,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import DatePicker from 'react-native-date-picker';
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';
import Share from 'react-native-share';
import {
  User,
  FileText,
  Calendar,
  Search,
  X,
  Download,
  Table,
  LayoutDashboard,
  Clock,
  AlertCircle,
  DollarSign,
  ArrowLeft,
} from 'lucide-react-native';
import {
  fetchMyReport,
  setView,
  clearFilters,
} from '../../store/slices/myReportSlice';
import styles from './MyReportStyle';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Colors ──────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#dc2626',
  primaryLight: '#fef2f2',
  white: '#ffffff',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',
  success: '#10b981',
  successLight: '#f0fdf4',
  error: '#ef4444',
  errorLight: '#fef2f2',
  warning: '#f59e0b',
  warningLight: '#fffbeb',
  info: '#3b82f6',
  infoLight: '#eff6ff',
  purple: '#7c3aed',
  purpleLight: '#f3e8ff',
  pink: '#db2777',
  blue: '#6366f1',
  orange: '#f97316',
};

// ─── Helpers ──────────────────────────────────────────────────────────────
const formatDate = (value) => {
  if (!value) return '-';
  try {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    }
  } catch (e) {}
  return '-';
};

const formatCurrency = (amount) => {
  const num = Number(amount || 0);
  return `₹${num.toLocaleString('en-IN')}`;
};

const safeNum = (val) => {
  if (val === null || val === undefined) return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

// ─── Status Colors ──────────────────────────────────────────────────────
const statusColors = {
  Received: { bg: '#E1F5EE', color: '#0F6E56' },
  Pending: { bg: '#FAEEDA', color: '#854F0B' },
  Repaired: { bg: '#E6F1FB', color: '#185FA5' },
  Delivered: { bg: '#EAF3DE', color: '#3B6D11' },
  'Delivered NR/NA': { bg: '#FAECE7', color: '#993C1D' },
  Cancelled: { bg: '#FAEAEA', color: '#991B1B' },
};

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const s = statusColors[status] || { bg: '#F1EFE8', color: '#5F5E5A' };
  return (
    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
      <Text style={[styles.statusBadgeText, { color: s.color }]}>
        {status}
      </Text>
    </View>
  );
};

// ─── Summary Card ──────────────────────────────────────────────────────
const SummaryCard = ({ label, value, accent, icon: Icon, bgColor }) => (
  <View style={[styles.summaryCard, { backgroundColor: bgColor || COLORS.white }]}>
    {Icon && <Icon size={14} color={accent || COLORS.gray500} />}
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={[styles.summaryValue, { color: accent || COLORS.gray900 }]}>
      {value || '0'}
    </Text>
  </View>
);

// ─── Main Component ────────────────────────────────────────────────────
const MyReportScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const currentUsername = user?.username || '';

  // ✅ Safe selectors with default values
  const myReportState = useSelector(state => state.myReport) || {};
  const grouped = myReportState.grouped || {};
  const jobs = myReportState.jobs || [];
  const username = myReportState.username || '';
  const totalJobs = myReportState.totalJobs || 0;
  const loading = myReportState.loading || false;
  const error = myReportState.error || null;
  const view = myReportState.view || 'table';

  const [refreshing, setRefreshing] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [localFromDate, setLocalFromDate] = useState('');
  const [localToDate, setLocalToDate] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);

  const mainScrollViewRef = useRef(null);

  // ─── Load Data ────────────────────────────────────────────────────────
  const loadData = useCallback((fd, td, search) => {
    if (!currentUsername) return; // auth not ready yet, don't fire a bad request
    dispatch(fetchMyReport({ fromDate: fd, toDate: td, search, username: currentUsername }));
  }, [dispatch, currentUsername]);

  // ─── Initial Load ────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      loadData(localFromDate, localToDate, localSearch);
      return () => {};
    }, [loadData]) // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    loadData(localFromDate, localToDate, localSearch);
  }, [loadData, localFromDate, localToDate, localSearch]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(localFromDate, localToDate, localSearch);
    setTimeout(() => setRefreshing(false), 500);
  }, [loadData, localFromDate, localToDate, localSearch]);

  const handleClear = useCallback(() => {
    setLocalSearch('');
    setLocalFromDate('');
    setLocalToDate('');
    dispatch(clearFilters());
    loadData('', '', '');
  }, [dispatch, loadData]);

  const handleToggleView = useCallback(() => {
    dispatch(setView(view === 'table' ? 'dashboard' : 'table'));
  }, [dispatch, view]);

  const handleToggleExpand = useCallback((user) => {
    setExpandedUser(prev => prev === user ? null : user);
  }, []);

  const navigateToJobDetail = useCallback((jobId) => {
    if (jobId) {
      navigation.navigate('JobSheet', {
        screen: 'JobDetail',
        params: { jobId, id: jobId },
      });
    }
  }, [navigation]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ─── Computed Values ─────────────────────────────────────────────────
  const userList = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  const today = new Date().toLocaleDateString();
  const todayJobs = jobs.filter(j => {
    if (!j.createdAt) return false;
    return new Date(j.createdAt).toLocaleDateString() === today;
  }).length;

  const activeJobs = jobs.filter(j => {
    const status = j.mobileStatus || j.status || '';
    return !['Delivered', 'Delivered NR/NA', 'Cancelled'].includes(status);
  }).length;

  const totalService = jobs.reduce((s, j) => s + safeNum(j.service?.serviceCharge), 0);
  const totalSpare = jobs.reduce((s, j) => s + safeNum(j.service?.spareCharge), 0);
  const totalIncome = jobs.reduce((s, j) => s + safeNum(j.service?.income), 0);
  const totalOthers = jobs.reduce((s, j) => s + safeNum(j.service?.othersAmount), 0);
  const grandTotal = totalService + totalSpare + totalIncome + totalOthers;

  // ─── Excel Export ────────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    if (!jobs || jobs.length === 0) {
      Alert.alert('No Data', 'There is no data to export');
      return;
    }

    try {
      const rows = jobs.map((job, i) => {
        const sc = safeNum(job.service?.serviceCharge);
        const sp = safeNum(job.service?.spareCharge);
        const inc = safeNum(job.service?.income);
        const oth = safeNum(job.service?.othersAmount);
        
        return {
          'SL No': i + 1,
          'Job Sheet': job.jobSheetNo || '-',
          'Customer': job.customer?.name || '-',
          'Contact': job.customer?.contact || '-',
          'Device': `${job.device?.make || ''} ${job.device?.model || ''}`.trim() || '-',
          'Status': job.mobileStatus || job.status || '-',
          'Service Charge': sc,
          'Spare Charge': sp,
          'Income': inc,
          'Others': oth,
          'Total': sc + sp + inc + oth,
          'Date': formatDate(job.createdAt),
        };
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'My Report');
      
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const timestamp = Date.now();
      const filePath = `${RNFS.CachesDirectoryPath}/MyReport_${timestamp}.xlsx`;
      await RNFS.writeFile(filePath, wbout, 'base64');
      
      Alert.alert('Success', 'Report exported successfully', [
        { text: 'OK' },
        {
          text: 'Share',
          onPress: async () => {
            await Share.open({
              url: `file://${filePath}`,
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
          },
        },
      ]);
      
      setTimeout(() => RNFS.unlink(filePath).catch(() => {}), 60000);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Could not export file');
    }
  }, [jobs]);

  // ─── Render Table View ──────────────────────────────────────────────
  const renderTableView = () => {
    if (!userList || userList.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <FileText size={48} color={COLORS.gray300} />
          <Text style={styles.emptyText}>No data found</Text>
          <Text style={styles.emptySubText}>You haven't created any job sheets yet</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={userList}
        keyExtractor={(item, index) => item || `user_${index}`}
        renderItem={({ item: user, index: userIdx }) => {
          const userJobs = grouped[user] || [];
          const isExpanded = expandedUser === user;
          
          const sc = userJobs.reduce((s, j) => s + safeNum(j.service?.serviceCharge), 0);
          const sp = userJobs.reduce((s, j) => s + safeNum(j.service?.spareCharge), 0);
          const inc = userJobs.reduce((s, j) => s + safeNum(j.service?.income), 0);
          const oth = userJobs.reduce((s, j) => s + safeNum(j.service?.othersAmount), 0);
          const total = sc + sp + inc + oth;
          
          return (
            <View style={styles.userSection}>
              <TouchableOpacity
                style={styles.userHeader}
                onPress={() => handleToggleExpand(user)}
                activeOpacity={0.7}
              >
                <View style={styles.userHeaderLeft}>
                  <View style={[styles.avatar, { backgroundColor: '#CECBF6' }]}>
                    <Text style={[styles.avatarText, { color: '#3C3489' }]}>
                      {user ? user[0].toUpperCase() : 'U'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{user || 'Unknown'}</Text>
                    <Text style={styles.userJobCount}>{userJobs.length} jobs</Text>
                  </View>
                </View>
                <View style={styles.userHeaderStats}>
                  <View style={styles.userStatPill}>
                    <Text style={styles.userStatPillText}>
                      {formatCurrency(total)}
                    </Text>
                  </View>
                  <Text style={styles.expandArrow}>
                    {isExpanded ? '▲' : '▼'}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.userStatsRow}>
                <View style={styles.userStatItem}>
                  <Text style={styles.userStatLabel}>Service</Text>
                  <Text style={[styles.userStatValue, { color: COLORS.purple }]}>
                    {formatCurrency(sc)}
                  </Text>
                </View>
                <View style={styles.userStatItem}>
                  <Text style={styles.userStatLabel}>Spare</Text>
                  <Text style={[styles.userStatValue, { color: COLORS.pink }]}>
                    {formatCurrency(sp)}
                  </Text>
                </View>
                <View style={styles.userStatItem}>
                  <Text style={styles.userStatLabel}>Total</Text>
                  <Text style={[styles.userStatValue, { color: COLORS.success }]}>
                    {formatCurrency(total)}
                  </Text>
                </View>
                <View style={styles.userStatItem}>
                  <Text style={styles.userStatLabel}>Advance</Text>
                  <Text style={[styles.userStatValue, { color: COLORS.info }]}>
                    {formatCurrency(userJobs.reduce((s, j) => s + safeNum(j.service?.advanceAmount), 0))}
                  </Text>
                </View>
              </View>

              {isExpanded && (
                <View style={styles.expandedJobs}>
                  {userJobs.map((job, jobIdx) => {
                    const sc2 = safeNum(job.service?.serviceCharge);
                    const sp2 = safeNum(job.service?.spareCharge);
                    const inc2 = safeNum(job.service?.income);
                    const oth2 = safeNum(job.service?.othersAmount);
                    const tot = sc2 + sp2 + inc2 + oth2;
                    
                    return (
                      <TouchableOpacity
                        key={job._id || jobIdx}
                        style={[styles.jobRow, jobIdx % 2 === 0 ? styles.jobRowEven : styles.jobRowOdd]}
                        onPress={() => navigateToJobDetail(job._id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.jobRowMain}>
                          <Text style={styles.jobRowNo}>{job.jobSheetNo || '-'}</Text>
                          <Text style={styles.jobRowCustomer}>{job.customer?.name || '-'}</Text>
                          <StatusBadge status={job.mobileStatus || job.status} />
                        </View>
                        <Text style={styles.jobRowTotal}>{formatCurrency(tot)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        }}
        scrollEnabled={false}
        nestedScrollEnabled={true}
      />
    );
  };

  // ─── Render Dashboard View ──────────────────────────────────────────
  const renderDashboardView = () => {
    if (!userList || userList.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <LayoutDashboard size={48} color={COLORS.gray300} />
          <Text style={styles.emptyText}>No data found</Text>
          <Text style={styles.emptySubText}>You haven't created any job sheets yet</Text>
        </View>
      );
    }

    return (
      <View style={styles.dashboardTable}>
        <View style={styles.dashboardTableHeader}>
          <Text style={[styles.dashboardTableHeaderText, { flex: 1.5 }]}>User</Text>
          <Text style={[styles.dashboardTableHeaderText, { flex: 0.8 }]}>Jobs</Text>
          <Text style={[styles.dashboardTableHeaderText, { flex: 1 }]}>Service</Text>
          <Text style={[styles.dashboardTableHeaderText, { flex: 1 }]}>Spare</Text>
          <Text style={[styles.dashboardTableHeaderText, { flex: 1 }]}>Total</Text>
        </View>
        {userList.map((user, idx) => {
          const userJobs = grouped[user] || [];
          const sc = userJobs.reduce((s, j) => s + safeNum(j.service?.serviceCharge), 0);
          const sp = userJobs.reduce((s, j) => s + safeNum(j.service?.spareCharge), 0);
          const inc = userJobs.reduce((s, j) => s + safeNum(j.service?.income), 0);
          const oth = userJobs.reduce((s, j) => s + safeNum(j.service?.othersAmount), 0);
          const total = sc + sp + inc + oth;
          
          return (
            <TouchableOpacity
              key={user}
              style={[styles.dashboardTableRow, idx % 2 === 0 ? styles.rowEven : styles.rowOdd]}
              onPress={() => handleToggleExpand(user)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1.5, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.avatarSmall, { backgroundColor: '#CECBF6' }]}>
                  <Text style={[styles.avatarTextSmall, { color: '#3C3489' }]}>
                    {user ? user[0].toUpperCase() : 'U'}
                  </Text>
                </View>
                <Text style={styles.dashboardTableRowText}>{user}</Text>
              </View>
              <Text style={[styles.dashboardTableRowText, { flex: 0.8, textAlign: 'center' }]}>
                {userJobs.length}
              </Text>
              <Text style={[styles.dashboardTableRowText, { flex: 1, color: COLORS.purple }]}>
                {formatCurrency(sc)}
              </Text>
              <Text style={[styles.dashboardTableRowText, { flex: 1, color: COLORS.pink }]}>
                {formatCurrency(sp)}
              </Text>
              <Text style={[styles.dashboardTableRowText, { flex: 1, color: COLORS.success, fontWeight: '700' }]}>
                {formatCurrency(total)}
              </Text>
            </TouchableOpacity>
          );
        })}
        <View style={styles.dashboardGrandTotal}>
          <Text style={styles.dashboardGrandTotalLabel}>Grand Total</Text>
          <Text style={styles.dashboardGrandTotalValue}>{formatCurrency(grandTotal)}</Text>
        </View>
      </View>
    );
  };

  // ─── Main Render ──────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={24} color={COLORS.gray900} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <User size={20} color={COLORS.primary} />
          <Text style={styles.headerTitle}>My Report</Text>
        </View>
        <TouchableOpacity style={styles.exportButton} onPress={handleExport} activeOpacity={0.7}>
          <Download size={18} color={COLORS.success} />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Your job sheet report overview</Text>

      <ScrollView
        ref={mainScrollViewRef}
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        nestedScrollEnabled={true}
      >
        <View style={styles.contentContainer}>
          {/* Summary Cards */}
          <View style={styles.summaryGrid}>
            <SummaryCard
              label="Total Jobs"
              value={totalJobs}
              accent={COLORS.blue}
              icon={FileText}
              bgColor={COLORS.infoLight}
            />
            <SummaryCard
              label="Today's Jobs"
              value={todayJobs}
              accent={COLORS.orange}
              icon={Calendar}
              bgColor={COLORS.warningLight}
            />
            <SummaryCard
              label="Active Jobs"
              value={activeJobs}
              accent={COLORS.success}
              icon={Clock}
              bgColor={COLORS.successLight}
            />
            <SummaryCard
              label="Grand Total"
              value={formatCurrency(grandTotal)}
              accent={COLORS.purple}
              icon={DollarSign}
              bgColor={COLORS.purpleLight}
            />
          </View>

          {/* Filter Section */}
          <View style={styles.filterSection}>
            <View style={styles.searchRow}>
              <View style={styles.searchInputContainer}>
                <Search size={14} color={COLORS.gray400} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search job sheet..."
                  placeholderTextColor={COLORS.gray400}
                  value={localSearch}
                  onChangeText={setLocalSearch}
                  returnKeyType="search"
                  onSubmitEditing={handleSearch}
                />
                {localSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setLocalSearch('')}>
                    <X size={12} color={COLORS.gray400} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[styles.dateButton, localFromDate && styles.dateButtonActive]}
                onPress={() => setShowFromPicker(true)}
                activeOpacity={0.7}
              >
                <Calendar size={13} color={localFromDate ? COLORS.primary : COLORS.gray500} />
                <Text style={[styles.dateText, localFromDate && styles.dateTextActive]}>
                  {localFromDate || 'From'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.dateSeparator}>→</Text>
              <TouchableOpacity
                style={[styles.dateButton, localToDate && styles.dateButtonActive]}
                onPress={() => setShowToPicker(true)}
                activeOpacity={0.7}
              >
                <Calendar size={13} color={localToDate ? COLORS.primary : COLORS.gray500} />
                <Text style={[styles.dateText, localToDate && styles.dateTextActive]}>
                  {localToDate || 'To'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.searchButton} onPress={handleSearch} activeOpacity={0.7}>
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
              {(localFromDate || localToDate || localSearch) && (
                <TouchableOpacity style={styles.clearButton} onPress={handleClear} activeOpacity={0.7}>
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.viewToggle, view === 'table' && styles.viewToggleActive]}
                onPress={handleToggleView}
                activeOpacity={0.7}
              >
                <Table size={14} color={view === 'table' ? COLORS.white : COLORS.gray600} />
                <Text style={[styles.viewToggleText, view === 'table' && styles.viewToggleTextActive]}>
                  Table
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewToggle, view === 'dashboard' && styles.viewToggleActive]}
                onPress={handleToggleView}
                activeOpacity={0.7}
              >
                <LayoutDashboard size={14} color={view === 'dashboard' ? COLORS.white : COLORS.gray600} />
                <Text style={[styles.viewToggleText, view === 'dashboard' && styles.viewToggleTextActive]}>
                  Dashboard
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.excelButton} onPress={handleExport} activeOpacity={0.7}>
                <Download size={14} color={COLORS.success} />
                <Text style={styles.excelButtonText}>Excel</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Report Content */}
          <View style={styles.reportContainer}>
            {loading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loaderText}>Loading...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <AlertCircle size={40} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : view === 'table' ? (
              renderTableView()
            ) : (
              renderDashboardView()
            )}
          </View>
        </View>
      </ScrollView>

      {/* Date Pickers — mounted only while open, so a native-module issue
          with react-native-date-picker can't crash the screen just by
          being rendered; it only loads when the user actually taps a date field. */}
      {showFromPicker && (
        <DatePicker
          modal
          open={showFromPicker}
          date={new Date()}
          mode="date"
          onConfirm={(date) => {
            setShowFromPicker(false);
            const d = date.toISOString().split('T')[0];
            setLocalFromDate(d);
          }}
          onCancel={() => setShowFromPicker(false)}
        />
      )}
      {showToPicker && (
        <DatePicker
          modal
          open={showToPicker}
          date={new Date()}
          mode="date"
          onConfirm={(date) => {
            setShowToPicker(false);
            const d = date.toISOString().split('T')[0];
            setLocalToDate(d);
          }}
          onCancel={() => setShowToPicker(false)}
        />
      )}
    </SafeAreaView>
  );
};

export default MyReportScreen;