// src/screens/reports/ReportsScreen.js
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
  Dimensions,
  Platform,
  FlatList,
  Modal,
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
  ClipboardList,
  Wrench,
  DollarSign,
  Store,
  Inbox,
  Send,
  Hammer,
  Clock,
  Truck,
  AlertTriangle,
  Search,
  Box,
  CreditCard,
  CheckCircle,
  XCircle,
  Receipt,
  AlertCircle,
  RefreshCw,
  Eye,
  Shuffle,
  ChevronDown,
  ChevronUp,
  Home,
  Users,
  Package,
  Settings,
} from 'lucide-react-native';
import {
  fetchEngineerWiseReport,
  fetchValueReport,
  fetchSpareReport,
  fetchDealerReport,
  fetchDailySummary,
  fetchPendingReport,
  fetchDeliveredNRNAReport,
} from '../../store/slices/reportSlice';
import { fetchJobs } from '../../store/slices/jobSlice';
import { fetchStaleJobs } from '../../store/slices/staleJobsSlice';
import api from '../../utils/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Colors
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
};

// Helper Functions
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

// Constants
const REPORT_TABS = [
  { id: 'all', name: 'All Reports', Icon: ClipboardList },
  { id: 'engineer', name: 'Engineer', Icon: Wrench },
  { id: 'value', name: 'Value', Icon: DollarSign },
  { id: 'spare', name: 'Spare', Icon: Box },
  { id: 'dealer', name: 'Dealer', Icon: Store },
  { id: 'dailyReceived', name: 'Daily Rcvd', Icon: Inbox },
  { id: 'dailyDelivered', name: 'Daily Del', Icon: Send },
  { id: 'dailyRepaired', name: 'Daily Rep', Icon: Hammer },
  { id: 'repairPending', name: 'Repair Pend', Icon: Clock },
  { id: 'deliveryPending', name: 'Delivery Pend', Icon: Truck },
  { id: 'deliveredNRNA', name: 'NR/NA', Icon: AlertTriangle },
  { id: 'rebill', name: 'Rebill', Icon: Receipt },
];

const STATUS_OPTIONS = ['All Status', 'Received', 'Pending', 'Repairing', 'Repaired', 'Delivered'];

// Status Chip Component
const StatusChip = React.memo(({ status }) => {
  const getStatusColor = useCallback((s) => {
    switch (s?.toLowerCase()) {
      case 'received': return { bg: '#E1F5EE', text: '#0F6E56' };
      case 'pending': return { bg: '#FAEEDA', text: '#854F0B' };
      case 'repairing': return { bg: '#F3E8FF', text: '#6D28D9' };
      case 'repaired': return { bg: '#E6F1FB', text: '#185FA5' };
      case 'delivered': return { bg: '#EAF3DE', text: '#3B6D11' };
      default: return { bg: '#F1EFE8', text: '#5F5E5A' };
    }
  }, []);
  const colors = getStatusColor(status);
  return (
    <View style={[styles.statusChip, { backgroundColor: colors.bg }]}>
      <Text style={[styles.statusChipText, { color: colors.text }]}>{status || '-'}</Text>
    </View>
  );
});

// Tab Button Component
const TabButton = React.memo(({ tab, isActive, onPress }) => {
  const { Icon, name, id } = tab;
  return (
    <TouchableOpacity 
      style={[styles.tab, isActive && styles.activeTab]} 
      onPress={() => onPress(id)}
      activeOpacity={0.7}
    >
      <Icon size={14} color={isActive ? COLORS.white : COLORS.gray600} />
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>{name}</Text>
    </TouchableOpacity>
  );
});

// Empty State Component
const EmptyState = React.memo(() => (
  <View style={styles.emptyContainer}>
    <ClipboardList size={48} color={COLORS.gray300} />
    <Text style={styles.emptyText}>No data found</Text>
    <Text style={styles.emptySubText}>Try adjusting your filters</Text>
  </View>
));

// Table Row Component
const TableRow = React.memo(({ item, index, columns, onPress, isEven }) => {
  const rowStyle = [styles.tableRow, isEven ? styles.rowEven : styles.rowOdd];
  
  return (
    <TouchableOpacity 
      onPress={() => onPress && onPress(item._id || item.id)} 
      activeOpacity={0.6} 
      disabled={!onPress}
      style={rowStyle}
    >
      {columns.map((column, colIndex) => {
        let value;
        if (column.render) {
          value = column.render(item, index);
        } else if (column.key === 'index') {
          value = index + 1;
        } else {
          value = item[column.key];
        }
        return (
          <View 
            key={colIndex} 
            style={[styles.tableCellContainer, { width: column.width, minWidth: column.width }]}
          >
            <Text 
              style={[styles.tableCell, column.bold && styles.boldCell]} 
              numberOfLines={2}
            >
              {value !== undefined && value !== null ? value : '-'}
            </Text>
          </View>
        );
      })}
    </TouchableOpacity>
  );
});

// Horizontal Scroll Table with proper scrolling
const HorizontalScrollTable = React.memo(({ columns, data, onPress, grandTotal }) => {
  const totalWidth = useMemo(() => {
    return columns.reduce((sum, col) => sum + (col.width || 120), 0);
  }, [columns]);

  const renderHeader = useCallback(() => (
    <View style={[styles.tableRow, styles.headerRow]}>
      {columns.map((column, index) => (
        <View 
          key={index} 
          style={[styles.tableHeaderCellContainer, { width: column.width, minWidth: column.width }]}
        >
          <Text style={styles.tableHeaderCell} numberOfLines={2}>
            {column.label}
          </Text>
        </View>
      ))}
    </View>
  ), [columns]);

  const renderItem = useCallback(({ item, index }) => (
    <TableRow 
      item={item}
      index={index}
      columns={columns}
      onPress={onPress}
      isEven={index % 2 === 0}
    />
  ), [columns, onPress]);

  const keyExtractor = useCallback((item, index) => item._id || item.id || String(index), []);

  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  // Calculate table height based on number of rows (max 400, min 200)
  const tableHeight = Math.min(Math.max(data.length * 45 + 45, 200), 400);

  return (
    <View style={styles.tableWrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        style={styles.horizontalScrollContainer}
        nestedScrollEnabled={true}
      >
        <View style={{ width: totalWidth }}>
          {renderHeader()}
          <ScrollView 
            vertical
            showsVerticalScrollIndicator={true}
            style={[styles.verticalScrollContainer, { height: tableHeight }]}
            nestedScrollEnabled={true}
          >
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              initialNumToRender={15}
              maxToRenderPerBatch={15}
              windowSize={10}
              removeClippedSubviews={Platform.OS === 'android'}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </ScrollView>
          
          {grandTotal !== undefined && grandTotal > 0 && data.length > 0 && (
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>₹{grandTotal.toLocaleString()}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
});

// Summary Card Component
const SummaryCard = React.memo(({ card }) => (
  <View style={[styles.summaryCard, { backgroundColor: card.bg }]}>
    {card.icon}
    <Text style={styles.summaryLabel}>{card.label}</Text>
    <Text style={[styles.summaryValue, { color: card.color }]}>{card.value}</Text>
  </View>
));

// Summary Cards Component
const SummaryCards = React.memo(({ stats }) => {
  const cards = useMemo(() => [
    { label: 'Received', value: stats.received, color: '#3b82f6', bg: '#eff6ff', icon: <Inbox size={20} color="#3b82f6" /> },
    { label: 'Pending', value: stats.pending, color: '#f59e0b', bg: '#fffbeb', icon: <Clock size={20} color="#f59e0b" /> },
    { label: 'Delivered', value: stats.delivered, color: '#10b981', bg: '#f0fdf4', icon: <CheckCircle size={20} color="#10b981" /> },
    { label: 'Repaired', value: stats.repaired, color: '#10b981', bg: '#f0fdf4', icon: <Hammer size={20} color="#10b981" /> },
    { label: 'NR/NA', value: stats.nrna, color: '#ef4444', bg: '#fef2f2', icon: <XCircle size={20} color="#ef4444" /> },
    { label: 'Service', value: `₹${stats.serviceCharge.toLocaleString()}`, color: '#10b981', bg: '#f0fdf4', icon: <DollarSign size={20} color="#10b981" /> },
    { label: 'Spare', value: `₹${stats.spareCharge.toLocaleString()}`, color: '#f59e0b', bg: '#fffbeb', icon: <Box size={20} color="#f59e0b" /> },
    { label: 'Total', value: `₹${stats.totalAmount.toLocaleString()}`, color: '#fff', bg: '#dc2626', icon: <CreditCard size={20} color="#fff" /> },
  ], [stats]);

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.summaryScroll}
      contentContainerStyle={styles.summaryContainer}
    >
      {cards.map((card, i) => <SummaryCard key={i} card={card} />)}
    </ScrollView>
  );
});

// Stale Jobs Widget Component
const StaleJobsWidget = React.memo(({ navigation }) => {
  const dispatch = useDispatch();
  const { jobs = [], loading = false } = useSelector(state => state.staleJobs || {});
  const [days, setDays] = useState(3);
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [engineerList, setEngineerList] = useState([]);
  const [transferLoading, setTransferLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchStaleJobs({ days }));
    loadEngineers();
  }, [days, dispatch]);

  const loadEngineers = async () => {
    try {
      const response = await api.getEngineers();
      setEngineerList(response);
    } catch (error) {
      console.error('Error loading engineers:', error);
    }
  };

  const handleTransfer = async () => {
    if (!transferTo) {
      Alert.alert('Error', 'Please select an engineer');
      return;
    }

    setTransferLoading(true);
    try {
      await api.transferJob(selectedJob?._id, 'Reception', transferTo, transferNote);
      Alert.alert('Success', `Job transferred to ${transferTo}`);
      setShowTransferModal(false);
      setSelectedJob(null);
      setTransferTo('');
      setTransferNote('');
      dispatch(fetchStaleJobs({ days }));
    } catch (error) {
      Alert.alert('Error', error.message || 'Transfer failed');
    } finally {
      setTransferLoading(false);
    }
  };

  const navigateToJobDetail = (jobId) => {
    navigation.navigate('JobSheet', {
      screen: 'JobDetail',
      params: { jobId, id: jobId }
    });
  };

  const getUrgencyStyle = (daysCount) => {
    if (daysCount >= 7) return { borderColor: '#ef4444', bg: '#fee2e2', textColor: '#991b1b', label: 'Critical' };
    if (daysCount >= 3) return { borderColor: '#f59e0b', bg: '#fef3c7', textColor: '#92400e', label: 'Warning' };
    return { borderColor: '#3b82f6', bg: '#dbeafe', textColor: '#1e40af', label: 'Attention' };
  };

  const displayedJobs = showAll ? jobs : jobs.slice(0, 5);
  const hasMoreJobs = jobs.length > 5;

  if (jobs.length === 0 && !loading) return null;

  return (
    <View style={styles.staleWidgetContainer}>
      <TouchableOpacity 
        style={styles.staleHeader} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.staleHeaderLeft}>
          <View style={styles.staleIconContainer}>
            <AlertCircle size={18} color="#f59e0b" />
          </View>
          <Text style={styles.staleHeaderTitle}>Stale Jobs Alert</Text>
          <View style={styles.staleCountBadge}>
            <Text style={styles.staleCountText}>{jobs.length}</Text>
          </View>
        </View>
        <View style={styles.staleHeaderRight}>
          <View style={styles.staleControls}>
            <TouchableOpacity 
              style={styles.staleDaysSelector}
              onPress={() => {
                const newDays = days === 3 ? 7 : days === 7 ? 14 : 3;
                setDays(newDays);
              }}
            >
              <Text style={styles.staleDaysSelectorText}>{days}+ days</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.staleRefreshBtn}
              onPress={() => dispatch(fetchStaleJobs({ days }))}
            >
              <RefreshCw size={14} color="#64748b" />
            </TouchableOpacity>
          </View>
          <Text style={styles.staleToggleIcon}>{expanded ? '▼' : '▲'}</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.staleBody}>
          {loading ? (
            <View style={styles.staleLoadingContainer}>
              <ActivityIndicator size="small" color="#f59e0b" />
              <Text style={styles.staleLoadingText}>Loading stale jobs...</Text>
            </View>
          ) : (
            <>
              <ScrollView style={styles.staleJobsScrollView} nestedScrollEnabled={true}>
                {displayedJobs.map((job) => {
                  const urgency = getUrgencyStyle(job.staleDays);
                  const progress = Math.min((job.staleDays / 30) * 100, 100);
                  
                  return (
                    <View key={job._id} style={[styles.staleJobCard, { borderLeftColor: urgency.borderColor }]}>
                      <TouchableOpacity 
                        style={styles.staleJobContent}
                        onPress={() => navigateToJobDetail(job._id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.staleJobHeader}>
                          <View style={styles.staleJobTitle}>
                            <Text style={styles.staleJobNo}>{job.jobSheetNo}</Text>
                            <View style={[styles.urgencyBadge, { backgroundColor: urgency.bg }]}>
                              <Text style={[styles.urgencyText, { color: urgency.textColor }]}>{urgency.label}</Text>
                            </View>
                          </View>
                          <View style={[styles.staleDaysBadge, { backgroundColor: urgency.bg }]}>
                            <Clock size={12} color={urgency.textColor} />
                            <Text style={[styles.staleDaysText, { color: urgency.textColor }]}>
                              {job.staleDays}d
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.staleCustomerName} numberOfLines={1}>
                          {job.customerName || job.customer?.name || 'Unknown'}
                        </Text>
                        
                        <View style={styles.staleDeviceInfo}>
                          <Text style={styles.staleDeviceText} numberOfLines={1}>
                            {job.make} {job.model}
                          </Text>
                          <Text style={styles.staleStatusText}>
                            {job.status || 'Pending'}
                          </Text>
                        </View>

                        {job.assignedTo && (
                          <View style={styles.staleAssignedContainer}>
                            <Wrench size={12} color="#64748b" />
                            <Text style={styles.staleAssignedTo}>{job.assignedTo}</Text>
                          </View>
                        )}

                        <View style={styles.staleProgressContainer}>
                          <View style={styles.staleProgressBar}>
                            <View style={[styles.staleProgressFill, { width: `${progress}%`, backgroundColor: urgency.borderColor }]} />
                          </View>
                          <Text style={styles.staleProgressText}>{Math.round(progress)}%</Text>
                        </View>
                      </TouchableOpacity>

                      <View style={styles.staleActionButtons}>
                        <TouchableOpacity 
                          style={styles.staleViewButton}
                          onPress={() => navigateToJobDetail(job._id)}
                        >
                          <Eye size={14} color="#3b82f6" />
                          <Text style={styles.staleViewButtonText}>View</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.staleTransferButton}
                          onPress={() => {
                            setSelectedJob(job);
                            setShowTransferModal(true);
                          }}
                        >
                          <Shuffle size={14} color="#f59e0b" />
                          <Text style={styles.staleTransferButtonText}>Transfer</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              {hasMoreJobs && (
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={() => setShowAll(!showAll)}
                >
                  <Text style={styles.viewAllButtonText}>
                    {showAll ? 'Show Less' : `View All (${jobs.length - 5} more)`}
                  </Text>
                  {showAll ? (
                    <ChevronUp size={16} color="#dc2626" />
                  ) : (
                    <ChevronDown size={16} color="#dc2626" />
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}

      {/* Transfer Modal */}
      <Modal visible={showTransferModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.transferModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transfer Job</Text>
              <TouchableOpacity onPress={() => setShowTransferModal(false)}>
                <X size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.transferJobInfo}>
              Job: <Text style={styles.transferJobInfoBold}>{selectedJob?.jobSheetNo}</Text>
            </Text>

            <Text style={styles.transferLabel}>Transfer to:</Text>
            <ScrollView style={styles.transferSelect} nestedScrollEnabled>
              <TouchableOpacity
                style={[styles.transferOption, transferTo === 'Reception' && styles.transferOptionActive]}
                onPress={() => setTransferTo('Reception')}
              >
                <Text style={[styles.transferOptionText, transferTo === 'Reception' && styles.transferOptionSelected]}>
                  Reception
                </Text>
              </TouchableOpacity>
              
              <Text style={styles.transferSectionHeader}>Engineers</Text>
              {engineerList.map((eng, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.transferOption, transferTo === eng.name && styles.transferOptionActive]}
                  onPress={() => setTransferTo(eng.name)}
                >
                  <Text style={[styles.transferOptionText, transferTo === eng.name && styles.transferOptionSelected]}>
                    {eng.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.transferLabel}>Note (optional):</Text>
            <TextInput
              style={styles.transferNoteInput}
              placeholder="Add transfer note..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={2}
              value={transferNote}
              onChangeText={setTransferNote}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowTransferModal(false);
                  setSelectedJob(null);
                  setTransferTo('');
                  setTransferNote('');
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonTransfer, transferLoading && styles.modalButtonDisabled]}
                onPress={handleTransfer}
                disabled={transferLoading}
              >
                {transferLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonConfirmText}>Transfer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
});

// Main Component
const ReportsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  const {
    engineerReport = [],
    noEngineerJobs = [],
    valueReport = [],
    spareReport = [],
    dealerReport = [],
    dailySummary = [],
    pendingReport = [],
    deliveredNRNA = [],
    loading: reportLoading = false,
  } = useSelector(state => state.reports || {});
  const { list = [], loading: jobsLoading = false } = useSelector(state => state.jobs || {});

  const loading = reportLoading || jobsLoading;

  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    status: 'All Status',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  
  const cacheRef = useRef({});
  const tabChangeTimeout = useRef(null);

  // Memoized Stats
  const countStats = useMemo(() => {
    const allJobs = list;
    return {
      received: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Received').length,
      pending: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Pending').length,
      repaired: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Repaired').length,
      delivered: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Delivered').length,
      nrna: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Delivered NR/NA').length,
      serviceCharge: allJobs.reduce((s, j) => s + safeNum(j.service?.serviceCharge), 0),
      spareCharge: allJobs.reduce((s, j) => s + safeNum(j.service?.spareCharge), 0),
      totalAmount: allJobs.reduce((s, j) => s + safeNum(j.service?.serviceCharge) + safeNum(j.service?.spareCharge), 0),
    };
  }, [list]);

  // Memoized Filtered Data
  const filteredList = useMemo(() => {
    if (!list.length) return [];
    if (!filters.search.trim()) return list;
    const q = filters.search.toLowerCase();
    return list.filter(j => 
      (j.customer?.name || '').toLowerCase().includes(q) ||
      (j.customer?.contact || '').includes(q) ||
      (j.jobSheetNo || '').toLowerCase().includes(q)
    );
  }, [list, filters.search]);

  // Column Definitions
  const allReportsColumns = useMemo(() => [
    { label: '#', key: 'index', width: 50 },
    { label: 'Date', key: 'createdAt', width: 90, render: (item) => formatDate(item.createdAt) },
    { label: 'Job No', key: 'jobSheetNo', width: 100, bold: true },
    { label: 'Customer', key: 'customer', width: 150, render: (item) => item.customer?.name },
    { label: 'Contact', key: 'contact', width: 100, render: (item) => item.customer?.contact },
    { label: 'Make', key: 'make', width: 90, render: (item) => item.device?.make },
    { label: 'Model', key: 'model', width: 100, render: (item) => item.device?.model },
    { label: 'Status', key: 'status', width: 100, render: (item) => <StatusChip status={item.device?.mobileStatus || item.status} /> },
    { label: 'Engineer', key: 'engineer', width: 110, render: (item) => item.service?.engineer },
    { label: 'Service', key: 'service', width: 90, render: (item) => `₹${safeNum(item.service?.serviceCharge)}` },
    { label: 'Spare', key: 'spare', width: 90, render: (item) => `₹${safeNum(item.service?.spareCharge)}` },
    { label: 'Total', key: 'total', width: 90, bold: true, render: (item) => `₹${safeNum(item.service?.serviceCharge) + safeNum(item.service?.spareCharge)}` },
  ], []);

  const engineerColumns = useMemo(() => [
    { label: '#', key: 'index', width: 50 },
    { label: 'Job No', key: 'jobSheetNo', width: 100, bold: true },
    { label: 'Customer', key: 'customer', width: 150, render: (item) => item.customer?.name },
    { label: 'Contact', key: 'contact', width: 100, render: (item) => item.customer?.contact },
    { label: 'Date', key: 'createdAt', width: 90, render: (item) => formatDate(item.createdAt) },
    { label: 'Engineer', key: 'engineer', width: 110, render: (item) => item.service?.engineer },
    { label: 'Status', key: 'status', width: 100, render: (item) => <StatusChip status={item.device?.mobileStatus || item.status} /> },
  ], []);

  const valueColumns = useMemo(() => [
    { label: 'Job No', key: 'jobNo', width: 100, bold: true },
    { label: 'Name', key: 'name', width: 150 },
    { label: 'Engineer', key: 'engineer', width: 110 },
    { label: 'Received', key: 'received', width: 90, render: (item) => formatDate(item.received) },
    { label: 'Repaired', key: 'repaired', width: 90, render: (item) => formatDate(item.repaired) },
    { label: 'Delivered', key: 'delivered', width: 90, render: (item) => formatDate(item.delivered) },
    { label: 'Service', key: 'service', width: 90, render: (item) => `₹${safeNum(item.service)}` },
    { label: 'Spare', key: 'spare', width: 90, render: (item) => `₹${safeNum(item.spare)}` },
    { label: 'Total', key: 'total', width: 90, bold: true, render: (item) => `₹${safeNum(item.total)}` },
  ], []);

  const spareColumns = useMemo(() => [
    { label: '#', key: 'index', width: 50 },
    { label: 'Job No', key: 'jobSheet', width: 100, bold: true },
    { label: 'Spare Part', key: 'spare', width: 200 },
    { label: 'Qty', key: 'qty', width: 60, render: (item) => safeNum(item.qty) },
    { label: 'Rate', key: 'rate', width: 90, render: (item) => `₹${safeNum(item.rate)}` },
    { label: 'Amount', key: 'amount', width: 100, bold: true, render: (item) => `₹${safeNum(item.amount)}` },
  ], []);

  const dealerColumns = useMemo(() => [
    { label: '#', key: 'index', width: 50 },
    { label: 'Dealer', key: 'dealer', width: 120, render: (item) => item.service?.dealer },
    { label: 'Customer', key: 'customer', width: 150, render: (item) => item.customer?.name },
    { label: 'Contact', key: 'contact', width: 100, render: (item) => item.customer?.contact },
    { label: 'Date', key: 'createdAt', width: 90, render: (item) => formatDate(item.createdAt) },
    { label: 'Engineer', key: 'engineer', width: 110, render: (item) => item.service?.engineer },
    { label: 'Status', key: 'status', width: 100, render: (item) => <StatusChip status={item.device?.mobileStatus || item.status} /> },
  ], []);

  const pendingColumns = useMemo(() => [
    { label: '#', key: 'index', width: 50 },
    { label: 'Job No', key: 'jobSheetNo', width: 100, bold: true },
    { label: 'Customer', key: 'customer', width: 150, render: (item) => item.customer?.name },
    { label: 'Phone', key: 'contact', width: 100, render: (item) => item.customer?.contact },
    { label: 'Date', key: 'createdAt', width: 90, render: (item) => formatDate(item.createdAt) },
    { label: 'Status', key: 'status', width: 100, render: (item) => <StatusChip status={item.device?.mobileStatus || item.status} /> },
  ], []);

  const dailyColumns = useMemo(() => [
    { label: 'Date', key: 'date', width: 120 },
    { label: 'Count', key: 'count', width: 80, render: (item) => safeNum(item.count) },
  ], []);

  // Calculated totals
  const valueReportTotal = useMemo(() => {
    return valueReport.reduce((sum, item) => sum + safeNum(item.total), 0);
  }, [valueReport]);

  const spareReportTotal = useMemo(() => {
    return spareReport.reduce((sum, item) => sum + safeNum(item.amount), 0);
  }, [spareReport]);

  // Load report function
  const loadReport = useCallback((tabId, fd, td, sf) => {
    const cacheKey = `${tabId}_${fd}_${td}_${sf}`;
    
    if (cacheRef.current[cacheKey] && Date.now() - cacheRef.current[cacheKey].timestamp < 5000) {
      return;
    }
    
    cacheRef.current[cacheKey] = { timestamp: Date.now() };
    
    const filterParams = { fromDate: fd, toDate: td };
    if (sf !== 'All Status') filterParams.status = sf;
    
    switch (tabId) {
      case 'engineer':
        dispatch(fetchEngineerWiseReport(filterParams));
        break;
      case 'value':
        dispatch(fetchValueReport(filterParams));
        break;
      case 'spare':
        dispatch(fetchSpareReport(filterParams));
        break;
      case 'dealer':
        dispatch(fetchDealerReport(filterParams));
        break;
      case 'all':
        dispatch(fetchJobs(filterParams));
        break;
      case 'dailyReceived':
        dispatch(fetchDailySummary({ type: 'received', fromDate: fd, toDate: td }));
        break;
      case 'dailyDelivered':
        dispatch(fetchDailySummary({ type: 'delivered', fromDate: fd, toDate: td }));
        break;
      case 'dailyRepaired':
        dispatch(fetchDailySummary({ type: 'repaired', fromDate: fd, toDate: td }));
        break;
      case 'repairPending':
        dispatch(fetchPendingReport({ type: 'repairPending', fromDate: fd, toDate: td }));
        break;
      case 'deliveryPending':
        dispatch(fetchPendingReport({ type: 'deliveryPending', fromDate: fd, toDate: td }));
        break;
      case 'deliveredNRNA':
        dispatch(fetchDeliveredNRNAReport({ fromDate: fd, toDate: td }));
        break;
      default:
        break;
    }
  }, [dispatch]);

  // Handle tab press with debounce
  const handleTabPress = useCallback((tabId) => {
    if (tabChangeTimeout.current) {
      clearTimeout(tabChangeTimeout.current);
    }
    
    tabChangeTimeout.current = setTimeout(() => {
      setActiveTab(tabId);
      loadReport(tabId, filters.fromDate, filters.toDate, filters.status);
    }, 100);
  }, [loadReport, filters]);

  // Apply filter
  const handleApplyFilter = useCallback(() => {
    loadReport(activeTab, filters.fromDate, filters.toDate, filters.status);
    setShowFilters(false);
  }, [loadReport, activeTab, filters]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      fromDate: '',
      toDate: '',
      status: 'All Status',
      search: '',
    });
    loadReport(activeTab, '', '', 'All Status');
  }, [loadReport, activeTab]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadReport(activeTab, filters.fromDate, filters.toDate, filters.status);
    setTimeout(() => setRefreshing(false), 500);
  }, [loadReport, activeTab, filters]);

  // Navigate to job detail
  const navigateToJobDetail = useCallback((jobId) => {
    if (!jobId) return;
    navigation.navigate('JobSheet', {
      screen: 'JobDetail',
      params: { jobId, id: jobId }
    });
  }, [navigation]);

  // Update filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.fromDate) count++;
    if (filters.toDate) count++;
    if (filters.status !== 'All Status') count++;
    return count;
  }, [filters]);

  // Export to Excel
  const handleExportToExcel = useCallback(async () => {
    let exportData = [];
    let filename = '';

    switch (activeTab) {
      case 'all':
        exportData = filteredList;
        filename = 'All_Reports';
        break;
      case 'engineer':
        exportData = [...noEngineerJobs, ...engineerReport.flatMap(e => e.jobs || [])];
        filename = 'Engineer_Wise_Report';
        break;
      case 'value':
        exportData = valueReport;
        filename = 'Value_Report';
        break;
      case 'spare':
        exportData = spareReport;
        filename = 'Spare_Parts_Report';
        break;
      case 'dealer':
        exportData = dealerReport;
        filename = 'Dealer_Report';
        break;
      default:
        exportData = filteredList;
        filename = 'Reports';
    }

    if (!exportData.length) {
      Alert.alert('No Data', 'There is no data to export');
      return;
    }

    try {
      const rows = exportData.slice(0, 1000).map((item, idx) => ({
        'SL No': idx + 1,
        'Job No': item.jobSheetNo || item.jobNo || '-',
        'Customer': item.customer?.name || item.customerName || '-',
        'Contact': item.customer?.contact || '-',
        'Status': item.device?.mobileStatus || item.status || '-',
        'Date': formatDate(item.createdAt),
        'Service': safeNum(item.service?.serviceCharge),
        'Spare': safeNum(item.service?.spareCharge),
        'Total': safeNum(item.service?.serviceCharge) + safeNum(item.service?.spareCharge),
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, filename);
      
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const timestamp = Date.now();
      const filePath = `${RNFS.CachesDirectoryPath}/Report_${timestamp}.xlsx`;
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
  }, [activeTab, filteredList, valueReport, spareReport, dealerReport, engineerReport, noEngineerJobs]);

  // Initial load
  useFocusEffect(
    useCallback(() => {
      loadReport('all', '', '', 'All Status');
      return () => {
        if (tabChangeTimeout.current) {
          clearTimeout(tabChangeTimeout.current);
        }
      };
    }, [])
  );

  // Render engineer report data
  const engineerReportData = useMemo(() => {
    const allJobs = [];
    if (noEngineerJobs?.length) allJobs.push(...noEngineerJobs);
    if (engineerReport?.length) {
      engineerReport.forEach(eng => {
        if (eng.jobs?.length) allJobs.push(...eng.jobs);
      });
    }
    return allJobs;
  }, [engineerReport, noEngineerJobs]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
        }
      >
        <SummaryCards stats={countStats} />
        
        <StaleJobsWidget navigation={navigation} />
        
        {/* Filter Section */}
        <View style={styles.filterSection}>
          <View style={styles.searchRow}>
            <View style={styles.searchInputContainer}>
              <Search size={16} color={COLORS.gray400} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name / job no / contact"
                placeholderTextColor={COLORS.gray400}
                value={filters.search}
                onChangeText={(value) => updateFilter('search', value)}
              />
              {filters.search.length > 0 && (
                <TouchableOpacity onPress={() => updateFilter('search', '')}>
                  <X size={14} color={COLORS.gray400} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[styles.filterToggle, activeFilterCount > 0 && styles.filterToggleActive]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} color={activeFilterCount > 0 ? COLORS.white : COLORS.primary} />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {showFilters && (
            <View style={styles.filtersGrid}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {STATUS_OPTIONS.map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.chip, filters.status === status && styles.chipActive]}
                    onPress={() => updateFilter('status', status)}
                  >
                    <Text style={[styles.chipText, filters.status === status && styles.chipTextActive]}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.dateRangeContainer}>
                <TouchableOpacity
                  style={[styles.dateButton, filters.fromDate && styles.dateButtonActive]}
                  onPress={() => setShowFromPicker(true)}
                >
                  <Calendar size={15} color={filters.fromDate ? COLORS.primary : COLORS.gray500} />
                  <Text style={[styles.dateText, filters.fromDate && styles.dateTextActive]}>
                    {filters.fromDate || 'From Date'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.dateSeparator}>→</Text>
                <TouchableOpacity
                  style={[styles.dateButton, filters.toDate && styles.dateButtonActive]}
                  onPress={() => setShowToPicker(true)}
                >
                  <Calendar size={15} color={filters.toDate ? COLORS.primary : COLORS.gray500} />
                  <Text style={[styles.dateText, filters.toDate && styles.dateTextActive]}>
                    {filters.toDate || 'To Date'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
                  <Text style={styles.applyButtonText}>Apply Filter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.excelButton} onPress={handleExportToExcel}>
            <Download size={16} color={COLORS.success} />
            <Text style={styles.excelButtonText}>Export to Excel</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsContent}
        >
          {REPORT_TABS.map(tab => (
            <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onPress={handleTabPress} />
          ))}
        </ScrollView>

        {/* Report Content */}
        <View style={styles.reportContainer}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loaderText}>Loading report...</Text>
            </View>
          ) : (
            <>
              {activeTab === 'all' && <HorizontalScrollTable columns={allReportsColumns} data={filteredList} onPress={navigateToJobDetail} />}
              {activeTab === 'engineer' && <HorizontalScrollTable columns={engineerColumns} data={engineerReportData} onPress={navigateToJobDetail} />}
              {activeTab === 'value' && <HorizontalScrollTable columns={valueColumns} data={valueReport} grandTotal={valueReportTotal} />}
              {activeTab === 'spare' && <HorizontalScrollTable columns={spareColumns} data={spareReport} grandTotal={spareReportTotal} />}
              {activeTab === 'dealer' && <HorizontalScrollTable columns={dealerColumns} data={dealerReport} onPress={navigateToJobDetail} />}
              {(activeTab === 'dailyReceived' || activeTab === 'dailyDelivered' || activeTab === 'dailyRepaired') && (
                <HorizontalScrollTable columns={dailyColumns} data={dailySummary} />
              )}
              {(activeTab === 'repairPending' || activeTab === 'deliveryPending') && (
                <HorizontalScrollTable columns={pendingColumns} data={pendingReport} onPress={navigateToJobDetail} />
              )}
              {activeTab === 'deliveredNRNA' && (
                <HorizontalScrollTable columns={pendingColumns} data={deliveredNRNA} onPress={navigateToJobDetail} />
              )}
              {activeTab === 'rebill' && <EmptyState />}
            </>
          )}
        </View>
      </ScrollView>

      {/* Date Pickers */}
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

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  mainScrollView: { flex: 1 },
  
  tableWrapper: { flex: 1 },
  horizontalScrollContainer: { flex: 1 },
  verticalScrollContainer: { flex: 1 },
  
  tableHeaderCellContainer: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    backgroundColor: '#dc2626',
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  tableCellContainer: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#e2e8f0',
    minHeight: 40,
  },
  headerRow: {
    backgroundColor: '#dc2626',
  },
  rowEven: { backgroundColor: '#ffffff' },
  rowOdd: { backgroundColor: '#f8fafc' },
  tableCell: { 
    fontSize: 11, 
    color: '#1e293b',
  },
  boldCell: { fontWeight: '700', color: '#0f172a' },
  
  summaryScroll: { flexGrow: 0 },
  summaryContainer: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  summaryCard: { 
    minWidth: 85, 
    backgroundColor: '#ffffff', 
    borderRadius: 10, 
    padding: 10, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryLabel: { fontSize: 10, color: '#64748b', marginTop: 4 },
  summaryValue: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  
  filterSection: { backgroundColor: '#ffffff', borderRadius: 10, padding: 10, marginHorizontal: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#f8fafc' },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 13, color: '#1e293b' },
  filterToggle: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 8, position: 'relative' },
  filterToggleActive: { backgroundColor: '#dc2626' },
  filterBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', borderRadius: 99, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { color: '#ffffff', fontSize: 9, fontWeight: '700' },
  filtersGrid: { gap: 10, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: '#f1f5f9' },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, marginRight: 6, backgroundColor: '#f1f5f9', borderWidth: 0.5, borderColor: '#e2e8f0' },
  chipActive: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  chipText: { fontSize: 11, color: '#64748b' },
  chipTextActive: { color: '#ffffff' },
  dateRangeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateButton: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0', borderRadius: 8, padding: 8, gap: 4, backgroundColor: '#f8fafc' },
  dateButtonActive: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  dateText: { fontSize: 11, color: '#64748b' },
  dateTextActive: { color: '#dc2626', fontWeight: '500' },
  dateSeparator: { color: '#94a3b8', fontSize: 12 },
  actionButtons: { flexDirection: 'row', gap: 8, marginTop: 4 },
  applyButton: { flex: 1, backgroundColor: '#dc2626', borderRadius: 8, padding: 8, alignItems: 'center' },
  applyButtonText: { fontWeight: '600', color: '#ffffff', fontSize: 12 },
  resetButton: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 8, padding: 8, alignItems: 'center' },
  resetButtonText: { color: '#64748b', fontSize: 12 },
  excelButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdf4', borderRadius: 8, paddingVertical: 8, marginTop: 8, gap: 6 },
  excelButtonText: { fontWeight: '500', color: '#10b981', fontSize: 12 },
  
  tabsScroll: { marginHorizontal: 12, marginBottom: 8, flexGrow: 0 },
  tabsContent: { paddingVertical: 4, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tab: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 0.5, borderColor: '#e2e8f0' },
  activeTab: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  tabText: { fontSize: 11, fontWeight: '500', color: '#64748b', marginLeft: 4 },
  activeTabText: { color: '#ffffff' },
  
  reportContainer: { marginHorizontal: 12, marginBottom: 12, backgroundColor: '#ffffff', borderRadius: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, minHeight: 200 },
  
  statusChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  statusChipText: { fontSize: 9, fontWeight: '500' },
  
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#fef2f2', borderTopWidth: 0.5, borderTopColor: '#fecaca' },
  grandTotalLabel: { fontWeight: '600', fontSize: 12, color: '#1e293b' },
  grandTotalValue: { fontWeight: '700', fontSize: 13, color: '#dc2626' },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { fontSize: 13, color: '#64748b' },
  emptySubText: { fontSize: 11, color: '#94a3b8' },
  
  loaderContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 10 },
  loaderText: { color: '#64748b', fontSize: 13 },
  
  // Stale Jobs Widget Styles
  staleWidgetContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  staleHeader: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  staleHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  staleIconContainer: { 
    width: 32, 
    height: 32, 
    borderRadius: 10, 
    backgroundColor: '#fef3c7', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  staleHeaderTitle: { fontSize: 14, fontWeight: '600', color: '#d97706' },
  staleCountBadge: { 
    backgroundColor: '#fee2e2', 
    borderRadius: 20, 
    paddingHorizontal: 8, 
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  staleCountText: { color: '#dc2626', fontSize: 11, fontWeight: '700' },
  staleHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  staleControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  staleDaysSelector: { 
    backgroundColor: '#ffffff', 
    borderWidth: 1, 
    borderColor: '#fcd34d', 
    borderRadius: 6, 
    paddingHorizontal: 10, 
    paddingVertical: 4 
  },
  staleDaysSelectorText: { color: '#78350f', fontSize: 11, fontWeight: '600' },
  staleRefreshBtn: { 
    backgroundColor: '#ffffff', 
    borderWidth: 1, 
    borderColor: '#fcd34d', 
    borderRadius: 6, 
    padding: 5 
  },
  staleToggleIcon: { color: '#92400e', fontSize: 14, fontWeight: '600' },
  
  staleBody: { 
    borderTopWidth: 1, 
    borderTopColor: '#f1f5f9',
    maxHeight: 500,
  },
  staleJobsScrollView: { maxHeight: 400 },
  staleLoadingContainer: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  staleLoadingText: { color: '#64748b', fontSize: 12 },
  
  staleJobCard: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  staleJobContent: { padding: 12 },
  staleJobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  staleJobTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  staleJobNo: { fontSize: 13, fontWeight: '700', color: '#3b82f6' },
  urgencyBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  urgencyText: { fontSize: 9, fontWeight: '600' },
  staleDaysBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, gap: 4 },
  staleDaysText: { fontSize: 10, fontWeight: '600' },
  staleCustomerName: { fontSize: 13, fontWeight: '500', color: '#1e293b', marginBottom: 4 },
  staleDeviceInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  staleDeviceText: { fontSize: 11, color: '#64748b', flex: 1 },
  staleStatusText: { fontSize: 10, color: '#10b981', fontWeight: '500' },
  staleAssignedContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, marginBottom: 8 },
  staleAssignedTo: { fontSize: 11, color: '#475569' },
  staleProgressContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  staleProgressBar: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 6, height: 6, overflow: 'hidden' },
  staleProgressFill: { height: '100%', borderRadius: 6 },
  staleProgressText: { fontSize: 10, color: '#64748b', fontWeight: '500' },
  
  staleActionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  staleViewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    backgroundColor: '#eff6ff',
  },
  staleViewButtonText: { fontSize: 11, fontWeight: '600', color: '#3b82f6' },
  staleTransferButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    backgroundColor: '#fffbeb',
  },
  staleTransferButtonText: { fontSize: 11, fontWeight: '600', color: '#f59e0b' },
  
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 12,
    marginVertical: 12,
    gap: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  viewAllButtonText: { fontSize: 12, fontWeight: '600', color: '#dc2626' },
  
  // Transfer Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transferModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  transferJobInfo: {
    fontSize: 13,
    color: '#64748b',
    padding: 16,
    paddingBottom: 8,
  },
  transferJobInfoBold: {
    fontWeight: '700',
    color: '#dc2626',
  },
  transferLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  transferSelect: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginHorizontal: 16,
    maxHeight: 200,
    backgroundColor: '#ffffff',
  },
  transferOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  transferOptionActive: {
    backgroundColor: '#fef2f2',
  },
  transferOptionText: {
    fontSize: 13,
    color: '#1e293b',
  },
  transferOptionSelected: {
    color: '#dc2626',
    fontWeight: '600',
  },
  transferSectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    padding: 10,
    backgroundColor: '#f8fafc',
  },
  transferNoteInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    textAlignVertical: 'top',
    backgroundColor: '#f8fafc',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f1f5f9',
  },
  modalButtonCancelText: {
    color: '#475569',
    fontWeight: '600',
  },
  modalButtonTransfer: {
    backgroundColor: '#dc2626',
  },
  modalButtonConfirmText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  modalButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
});

export default ReportsScreen;