// src/screens/reports/RebillReportScreen.js
import React, { useState, useCallback, useMemo, useRef } from 'react';
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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';
import Share from 'react-native-share';
import {
  Calendar,
  Download,
  Filter,
  X,
  ChevronLeft,
  Receipt,
  Search,
  ChevronRight,
} from 'lucide-react-native';
import { fetchRebillReport } from '../../store/slices/reportSlice';

const COLORS = {
  primary: '#dc2626',
  white: '#ffffff',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  blue: '#6366f1',
};

const formatDate = (value) => {
  if (!value) return '-';
  try {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
  } catch (e) {}
  return '-';
};

const safeNum = (val) => {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

const fmtCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const StatusChip = ({ status }) => {
  const colorMap = {
    received: { bg: '#DBEAFE', text: '#1D4ED8' },
    pending: { bg: '#FEF3C7', text: '#92400E' },
    repairing: { bg: '#EDE9FE', text: '#5B21B6' },
    diagnosing: { bg: '#EDE9FE', text: '#5B21B6' },
    ready: { bg: '#D1FAE5', text: '#065F46' },
    delivered: { bg: '#D1FAE5', text: '#065F46' },
    'delivered nr/na': { bg: '#D1FAE5', text: '#065F46' },
  };
  const colors = colorMap[status?.toLowerCase()] || { bg: '#F3F4F6', text: '#374151' };
  
  return (
    <View style={[styles.statusChip, { backgroundColor: colors.bg }]}>
      <Text style={[styles.statusChipText, { color: colors.text }]}>
        {status || '-'}
      </Text>
    </View>
  );
};

const RebillHistoryItem = ({ item, index, isCurrent, status }) => {
  const statusStyle = (s) => {
    const map = {
      'Received': { bg: '#DBEAFE', color: '#1D4ED8' },
      'Pending': { bg: '#FEF3C7', color: '#92400E' },
      'Repairing': { bg: '#EDE9FE', color: '#5B21B6' },
      'Diagnosing': { bg: '#EDE9FE', color: '#5B21B6' },
      'Ready': { bg: '#D1FAE5', color: '#065F46' },
      'Delivered': { bg: '#D1FAE5', color: '#065F46' },
      'Delivered NR/NA': { bg: '#D1FAE5', color: '#065F46' },
    };
    return map[s] || { bg: '#F3F4F6', color: '#374151' };
  };

  const ss = statusStyle(status);
  const fmtDate = (d) => {
    if (!d) return '-';
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <View style={[styles.historyItem, isCurrent && styles.currentHistoryItem]}>
      <View style={styles.historyHeader}>
        <View style={styles.historyTitleContainer}>
          <Text style={[styles.historyNumber, isCurrent && styles.currentLabel]}>
            {isCurrent ? `Current Repair #${index + 1}` : `Repair #${index + 1}`}
          </Text>
          {isCurrent && status && (
            <StatusChip status={status} />
          )}
        </View>
        {!isCurrent && item.rebilledAt && (
          <Text style={styles.historyDate}>{fmtDate(item.rebilledAt)}</Text>
        )}
      </View>
      <View style={styles.historyDetails}>
        <View style={styles.historyRow}>
          <Text style={styles.historyLabel}>Service:</Text>
          <Text style={styles.historyValue}>{fmtCurrency(item.serviceCharge || 0)}</Text>
        </View>
        <View style={styles.historyRow}>
          <Text style={styles.historyLabel}>Spare:</Text>
          <Text style={styles.historyValue}>{fmtCurrency(item.spareCharge || 0)}</Text>
        </View>
        <View style={[styles.historyRow, styles.historyTotalRow]}>
          <Text style={styles.historyTotalLabel}>Total:</Text>
          <Text style={styles.historyTotalValue}>
            {fmtCurrency((item.serviceCharge || 0) + (item.spareCharge || 0))}
          </Text>
        </View>
        {item.remarks && (
          <Text style={styles.historyRemarks}>"{item.remarks}"</Text>
        )}
        {!isCurrent && item.rebilledBy && (
          <Text style={styles.historyBy}>by {item.rebilledBy}</Text>
        )}
      </View>
    </View>
  );
};

const RebillReportScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  const { rebillReport = [], loading = false } = useSelector(
    state => state.reports || {}
  );
  
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState(null);
  
  const mainScrollViewRef = useRef(null);

  const filteredData = useMemo(() => {
    if (!rebillReport.length) return [];
    if (!filters.search.trim()) return rebillReport;
    
    const q = filters.search.toLowerCase().trim();
    return rebillReport.filter(job => 
      (job.jobSheetNo || '').toLowerCase().includes(q) ||
      (job.customer?.name || '').toLowerCase().includes(q) ||
      (job.customer?.contact || '').includes(q)
    );
  }, [rebillReport, filters.search]);

  const stats = useMemo(() => {
    if (!filteredData.length) {
      return { totalJobs: 0, totalRebills: 0, totalRevenue: 0 };
    }
    
    const totalRebills = filteredData.reduce(
      (sum, job) => sum + (job.rebillHistory?.length || 0), 
      0
    );
    
    const totalRevenue = filteredData.reduce((sum, job) => {
      const histTotal = job.rebillHistory?.reduce(
        (s, r) => s + safeNum(r.serviceCharge) + safeNum(r.spareCharge), 
        0
      ) || 0;
      const currTotal = safeNum(job.service?.serviceCharge) + safeNum(job.service?.spareCharge);
      return sum + histTotal + currTotal;
    }, 0);
    
    return {
      totalJobs: filteredData.length,
      totalRebills,
      totalRevenue,
    };
  }, [filteredData]);

  const loadReport = useCallback((fd, td) => {
    dispatch(fetchRebillReport({ fromDate: fd, toDate: td }));
  }, [dispatch]);

  const handleApplyFilter = useCallback(() => {
    loadReport(filters.fromDate, filters.toDate);
    setShowFilters(false);
  }, [loadReport, filters]);

  const handleReset = useCallback(() => {
    setFilters({ fromDate: '', toDate: '', search: '' });
    loadReport('', '');
  }, [loadReport]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadReport(filters.fromDate, filters.toDate);
    setTimeout(() => setRefreshing(false), 500);
  }, [loadReport, filters]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleExpand = useCallback((jobId) => {
    setExpandedJobId(prev => prev === jobId ? null : jobId);
  }, []);

  const navigateToJob = useCallback((jobId) => {
    if (jobId) {
      navigation.navigate('JobSheet', {
        screen: 'JobDetail',
        params: { jobId, id: jobId }
      });
    }
  }, [navigation]);

  const handleExport = useCallback(async () => {
    if (!filteredData.length) {
      Alert.alert('No Data', 'There is no data to export');
      return;
    }

    try {
      const rows = filteredData.map((item, idx) => {
        const histTotal = item.rebillHistory?.reduce(
          (s, r) => s + safeNum(r.serviceCharge) + safeNum(r.spareCharge), 
          0
        ) || 0;
        const currTotal = safeNum(item.service?.serviceCharge) + safeNum(item.service?.spareCharge);
        
        return {
          'SL No': idx + 1,
          'Job No': item.jobSheetNo || '-',
          'Customer': item.customer?.name || '-',
          'Contact': item.customer?.contact || '-',
          'Device': `${item.device?.make || ''} ${item.device?.model || ''}`.trim() || '-',
          'Engineer': item.service?.engineer || '-',
          'Status': item.device?.mobileStatus || '-',
          'Rebills': item.rebillHistory?.length || 0,
          'Current Total': currTotal,
          'All-time Total': histTotal + currTotal,
        };
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rebill_Report');
      
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const timestamp = Date.now();
      const filePath = `${RNFS.CachesDirectoryPath}/Rebill_Report_${timestamp}.xlsx`;
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
          }
        }
      ]);
      
      setTimeout(() => RNFS.unlink(filePath).catch(() => {}), 60000);
    } catch (error) {
      Alert.alert('Export Failed', 'Could not export file');
    }
  }, [filteredData]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.fromDate) count++;
    if (filters.toDate) count++;
    return count;
  }, [filters]);

  useFocusEffect(
    useCallback(() => {
      loadReport('', '');
    }, [loadReport])
  );

  const renderExpandedContent = useCallback((job) => {
    return (
      <View style={styles.expandedContainer}>
        <Text style={styles.expandedTitle}>📋 Rebill history for {job.jobSheetNo}</Text>
        
        {job.rebillHistory?.map((rb, idx) => (
          <RebillHistoryItem 
            key={idx}
            item={rb}
            index={idx}
            isCurrent={false}
          />
        ))}
        
        <RebillHistoryItem 
          item={{
            serviceCharge: job.service?.serviceCharge || 0,
            spareCharge: job.service?.spareCharge || 0,
          }}
          index={job.rebillHistory?.length || 0}
          isCurrent={true}
          status={job.device?.mobileStatus}
        />
        
        <TouchableOpacity 
          style={styles.openButton}
          onPress={() => navigateToJob(job._id || job.id)}
        >
          <Text style={styles.openButtonText}>Open Job →</Text>
        </TouchableOpacity>
      </View>
    );
  }, [navigateToJob]);

  const renderRow = useCallback(({ item, index }) => {
    const isExpanded = expandedJobId === (item._id || item.id);
    const histTotal = item.rebillHistory?.reduce(
      (s, r) => s + safeNum(r.serviceCharge) + safeNum(r.spareCharge), 
      0
    ) || 0;
    const currTotal = safeNum(item.service?.serviceCharge) + safeNum(item.service?.spareCharge);
    const allTimeTotal = histTotal + currTotal;

    return (
      <View key={item._id || item.id || index}>
        <TouchableOpacity
          style={[styles.row, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}
          onPress={() => toggleExpand(item._id || item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.rowContent}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIndex}>{index + 1}</Text>
              <View style={styles.rowMainInfo}>
                <Text style={styles.rowJobNo}>{item.jobSheetNo}</Text>
                <Text style={styles.rowCustomer}>{item.customer?.name || '-'}</Text>
                <Text style={styles.rowContact}>{item.customer?.contact || '-'}</Text>
              </View>
            </View>
            <View style={styles.rowRight}>
              <View style={styles.rowStats}>
                <View style={styles.rebillBadge}>
                  <Text style={styles.rebillBadgeText}>×{item.rebillHistory?.length || 0}</Text>
                </View>
                <Text style={styles.rowTotal}>{fmtCurrency(allTimeTotal)}</Text>
              </View>
              <ChevronRight 
                size={16} 
                color={COLORS.gray400} 
                style={[styles.expandIcon, isExpanded && styles.expandIconRotated]} 
              />
            </View>
          </View>
        </TouchableOpacity>
        
        {isExpanded && renderExpandedContent(item)}
      </View>
    );
  }, [expandedJobId, toggleExpand, renderExpandedContent]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Receipt size={20} color="#dc2626" />
          <Text style={styles.headerTitle}>Rebill Report</Text>
        </View>
        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Download size={18} color="#10b981" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Jobs that were reopened and rebilled after invoice</Text>

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
      >
        <View style={styles.contentContainer}>
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, { backgroundColor: '#eef2ff' }]}>
              <Text style={styles.summaryLabel}>Total Rebilled Jobs</Text>
              <Text style={[styles.summaryValue, { color: '#6366f1' }]}>
                {stats.totalJobs}
              </Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: '#fffbeb' }]}>
              <Text style={styles.summaryLabel}>Total Rebill Instances</Text>
              <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>
                {stats.totalRebills}
              </Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: '#f0fdf4' }]}>
              <Text style={styles.summaryLabel}>Total Revenue (All)</Text>
              <Text style={[styles.summaryValue, { color: '#10b981' }]}>
                {fmtCurrency(stats.totalRevenue)}
              </Text>
            </View>
          </View>

          <View style={styles.filterSection}>
            <View style={styles.searchRow}>
              <View style={styles.searchInputContainer}>
                <Search size={14} color={COLORS.gray400} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search Job No / Name / Contact"
                  placeholderTextColor={COLORS.gray400}
                  value={filters.search}
                  onChangeText={(value) => updateFilter('search', value)}
                />
                {filters.search.length > 0 && (
                  <TouchableOpacity onPress={() => updateFilter('search', '')}>
                    <X size={12} color={COLORS.gray400} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={[styles.filterToggle, activeFilterCount > 0 && styles.filterToggleActive]}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} color={activeFilterCount > 0 ? COLORS.white : COLORS.primary} />
                {activeFilterCount > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {showFilters && (
              <View style={styles.filtersGrid}>
                <View style={styles.dateRangeContainer}>
                  <TouchableOpacity
                    style={[styles.dateButton, filters.fromDate && styles.dateButtonActive]}
                    onPress={() => setShowFromPicker(true)}
                  >
                    <Calendar size={13} color={filters.fromDate ? COLORS.primary : COLORS.gray500} />
                    <Text style={[styles.dateText, filters.fromDate && styles.dateTextActive]}>
                      {filters.fromDate || 'From'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.dateSeparator}>→</Text>
                  <TouchableOpacity
                    style={[styles.dateButton, filters.toDate && styles.dateButtonActive]}
                    onPress={() => setShowToPicker(true)}
                  >
                    <Calendar size={13} color={filters.toDate ? COLORS.primary : COLORS.gray500} />
                    <Text style={[styles.dateText, filters.toDate && styles.dateTextActive]}>
                      {filters.toDate || 'To'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
                    <Text style={styles.applyButtonText}>Apply Filter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {filteredData.length} job{filteredData.length !== 1 ? 's' : ''} found
            </Text>
            <Text style={styles.resultsHint}>Tap a row to see rebill history</Text>
          </View>

          <View style={styles.tableContainer}>
            {loading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loaderText}>Loading...</Text>
              </View>
            ) : filteredData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Receipt size={40} color={COLORS.gray300} />
                <Text style={styles.emptyText}>No rebill records found</Text>
              </View>
            ) : (
              <FlatList
                data={filteredData}
                renderItem={renderRow}
                keyExtractor={(item, index) => item._id || item.id || `row_${index}`}
                scrollEnabled={false}
                nestedScrollEnabled={true}
              />
            )}
          </View>
        </View>
      </ScrollView>

      <DatePicker
        modal
        open={showFromPicker}
        date={new Date()}
        mode="date"
        onConfirm={(date) => {
          setShowFromPicker(false);
          updateFilter('fromDate', `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`);
        }}
        onCancel={() => setShowFromPicker(false)}
      />
      <DatePicker
        modal
        open={showToPicker}
        date={new Date()}
        mode="date"
        onConfirm={(date) => {
          setShowToPicker(false);
          updateFilter('toDate', `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`);
        }}
        onCancel={() => setShowToPicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  mainScrollView: { flex: 1 },
  contentContainer: { paddingBottom: 20 },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: { padding: 4 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  exportButton: { padding: 6, backgroundColor: '#f0fdf4', borderRadius: 8 },
  subtitle: { 
    fontSize: 12, 
    color: '#64748b', 
    paddingHorizontal: 16, 
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
  },
  
  summaryGrid: { 
    flexDirection: 'row', 
    gap: 8, 
    paddingHorizontal: 16, 
    paddingVertical: 12 
  },
  summaryCard: { 
    flex: 1, 
    borderRadius: 10, 
    padding: 12, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryLabel: { fontSize: 9, color: '#64748b', fontWeight: '600', textAlign: 'center' },
  summaryValue: { fontSize: 14, fontWeight: '800', marginTop: 4 },
  
  filterSection: { 
    backgroundColor: '#ffffff', 
    borderRadius: 10, 
    padding: 12, 
    marginHorizontal: 16, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInputContainer: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 0.5, 
    borderColor: '#e2e8f0', 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    backgroundColor: '#f8fafc' 
  },
  searchInput: { 
    flex: 1, 
    paddingVertical: 8, 
    fontSize: 13, 
    color: '#1e293b',
    paddingHorizontal: 6,
  },
  filterToggle: { 
    padding: 8, 
    backgroundColor: '#f1f5f9', 
    borderRadius: 8, 
    position: 'relative' 
  },
  filterToggleActive: { backgroundColor: '#dc2626' },
  filterBadge: { 
    position: 'absolute', 
    top: -3, 
    right: -3, 
    backgroundColor: '#ef4444', 
    borderRadius: 99, 
    width: 16, 
    height: 16, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  filterBadgeText: { color: '#ffffff', fontSize: 8, fontWeight: '700' },
  filtersGrid: { gap: 10, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: '#f1f5f9' },
  dateRangeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateButton: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 0.5, 
    borderColor: '#e2e8f0', 
    borderRadius: 8, 
    padding: 8, 
    gap: 4, 
    backgroundColor: '#f8fafc' 
  },
  dateButtonActive: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  dateText: { fontSize: 11, color: '#64748b' },
  dateTextActive: { color: '#dc2626', fontWeight: '500' },
  dateSeparator: { color: '#94a3b8', fontSize: 12 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  applyButton: { 
    flex: 1, 
    backgroundColor: '#dc2626', 
    borderRadius: 8, 
    padding: 10, 
    alignItems: 'center' 
  },
  applyButtonText: { fontWeight: '600', color: '#ffffff', fontSize: 12 },
  resetButton: { 
    flex: 1, 
    backgroundColor: '#f1f5f9', 
    borderRadius: 8, 
    padding: 10, 
    alignItems: 'center' 
  },
  resetButtonText: { color: '#64748b', fontSize: 12 },
  
  resultsHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
  },
  resultsCount: { fontSize: 12, fontWeight: '600', color: '#475569' },
  resultsHint: { fontSize: 11, color: '#94a3b8' },
  
  tableContainer: { 
    marginHorizontal: 16, 
    backgroundColor: '#ffffff', 
    borderRadius: 10, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  
  row: { 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  rowEven: { backgroundColor: '#ffffff' },
  rowOdd: { backgroundColor: '#fafafa' },
  rowContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  rowIndex: { fontSize: 12, color: '#94a3b8', fontWeight: '500', width: 24 },
  rowMainInfo: { flex: 1 },
  rowJobNo: { fontSize: 13, fontWeight: '700', color: '#2563eb' },
  rowCustomer: { fontSize: 12, color: '#0f172a', fontWeight: '500' },
  rowContact: { fontSize: 11, color: '#64748b' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowStats: { alignItems: 'flex-end' },
  rebillBadge: { 
    backgroundColor: '#fef3c7', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 12,
    marginBottom: 2,
  },
  rebillBadgeText: { fontSize: 11, fontWeight: '700', color: '#92400e' },
  rowTotal: { fontSize: 13, fontWeight: '700', color: '#6366f1' },
  expandIcon: { transform: [{ rotate: '0deg' }] },
  expandIconRotated: { transform: [{ rotate: '90deg' }] },
  
  expandedContainer: { 
    padding: 16, 
    backgroundColor: '#f0f9ff',
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
  },
  expandedTitle: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#1e40af', 
    marginBottom: 12 
  },
  
  historyItem: { 
    backgroundColor: '#ffffff', 
    borderRadius: 8, 
    padding: 12,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: '#bfdbfe',
  },
  currentHistoryItem: { 
    backgroundColor: '#f0fdf4', 
    borderColor: '#86efac',
  },
  historyHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 6 
  },
  historyTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  historyNumber: { fontSize: 13, fontWeight: '700', color: '#1d4ed8' },
  currentLabel: { color: '#065f46' },
  historyDate: { fontSize: 11, color: '#94a3b8' },
  historyDetails: { gap: 3 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 1 },
  historyLabel: { fontSize: 12, color: '#475569' },
  historyValue: { fontSize: 12, fontWeight: '500', color: '#0f172a' },
  historyTotalRow: { marginTop: 2, paddingTop: 4, borderTopWidth: 0.5, borderTopColor: '#e2e8f0' },
  historyTotalLabel: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  historyTotalValue: { fontSize: 13, fontWeight: '700', color: '#6366f1' },
  historyRemarks: { fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginTop: 4 },
  historyBy: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  
  statusChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12, alignSelf: 'flex-start' },
  statusChipText: { fontSize: 10, fontWeight: '600' },
  
  openButton: { 
    backgroundColor: '#2563eb', 
    borderRadius: 8, 
    padding: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  openButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 13, color: '#64748b' },
  loaderContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 8 },
  loaderText: { color: '#64748b', fontSize: 13 },
});

export default RebillReportScreen;