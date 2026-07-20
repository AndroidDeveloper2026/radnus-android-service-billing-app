// src/screens/reports/ReportsScreen.js
import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
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
  SafeAreaView,
  StatusBar,
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
  ChevronRight,
} from 'lucide-react-native';
import {
  fetchEngineerWiseReport,
  fetchValueReport,
  fetchSpareReport,
  fetchDealerReport,
  fetchDailySummary,
  fetchPendingReport,
  fetchDeliveredNRNAReport,
  fetchRebillReport,
} from '../../store/slices/reportSlice';
import { fetchJobs } from '../../store/slices/jobSlice';
import styles from './ReportsStyle';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Colors
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
  info: '#4b8cfd',
  infoLight: '#eff6ff',
  purple: '#7c3aed',
  pink: '#db2777',
  blue: '#6366f1',
  infotwo: '#cbddfc',
};

// Helper Functions - FIXED Date Format
const formatDate = (value) => {
  if (!value) return '-';
  try {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
  } catch (e) {}
  return '-';
};

const formatDateDisplay = (value) => {
  if (!value || value === '-') return '-';
  try {
    const parts = value.split('/');
    if (parts.length === 3) {
      const d = new Date(parts[2], parts[1] - 1, parts[0]);
      if (!isNaN(d.getTime())) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
    }
  } catch (e) {}
  return value;
};

const formatDateInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return '';
};

const safeNum = (val) => {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

const safeStr = (val, fallback = '-') => {
  if (val === null || val === undefined) return fallback;
  const s = String(val).trim();
  return s || fallback;
};

const formatCurrency = (amount) => {
  const num = safeNum(amount);
  return `₹${num.toLocaleString('en-IN')}`;
};

// Status Color Mapping
const getStatusColors = (status) => {
  const map = {
    received: { bg: '#E1F5EE', text: '#0F6E56' },
    pending: { bg: '#FAEEDA', text: '#854F0B' },
    repairing: { bg: '#F3E8FF', text: '#6D28D9' },
    repaired: { bg: '#E6F1FB', text: '#185FA5' },
    delivered: { bg: '#EAF3DE', text: '#3B6D11' },
    'delivered nr/na': { bg: '#FAECE7', text: '#993C1D' },
    cancelled: { bg: '#FAEAEA', text: '#991B1B' },
  };
  return map[status?.toLowerCase()] || { bg: '#F1EFE8', text: '#5F5E5A' };
};

// Constants
const REPORT_TABS = [
  { id: 'all', name: 'All', Icon: ClipboardList },
  { id: 'engineer', name: 'Engineer', Icon: Wrench },
  { id: 'value', name: 'Value', Icon: DollarSign },
  { id: 'spare', name: 'Spare', Icon: Box },
  { id: 'dealer', name: 'Dealer', Icon: Store },
  { id: 'received', name: 'Rcvd', Icon: Inbox },
  { id: 'dailyDelivered', name: 'Del', Icon: Send },
  { id: 'dailyRepaired', name: 'Rep', Icon: Hammer },
  { id: 'repairPending', name: 'R Pend', Icon: Clock },
  { id: 'deliveryPending', name: 'D Pend', Icon: Truck },
  { id: 'deliveredNRNA', name: 'NR/NA', Icon: AlertTriangle },
  { id: 'rebill', name: 'Rebill', Icon: Receipt },
];

const STATUS_OPTIONS = ['All', 'Received', 'Pending', 'Repaired', 'Delivered', 'Delivered NR/NA', 'Cancelled'];

// ─── Components ──────────────────────────────────────────────────────────────

// Status Chip Component
const StatusChip = React.memo(({ status }) => {
  const colors = getStatusColors(status);
  return (
    <View style={[styles.statusChip, { backgroundColor: colors.bg }]}>
      <Text
        style={[styles.statusChipText, { color: colors.text }]}
        numberOfLines={1}
      >
        {status || '-'}
      </Text>
    </View>
  );
});

// Summary Cards
const SummaryCards = React.memo(({ stats }) => {
  const cards = useMemo(
    () => [
      {
        label: 'Received',
        value: stats.received,
        color: COLORS.info,
        bg: COLORS.infoLight,
        icon: Inbox,
      },
      {
        label: 'Pending',
        value: stats.pending,
        color: COLORS.warning,
        bg: COLORS.warningLight,
        icon: Clock,
      },
      {
        label: 'Delivered',
        value: stats.delivered,
        color: COLORS.success,
        bg: COLORS.successLight,
        icon: CheckCircle,
      },
      {
        label: 'Repaired',
        value: stats.repaired,
        color: COLORS.purple,
        bg: '#f3e8ff',
        icon: Hammer,
      },
      {
        label: 'NR/NA',
        value: stats.nrna,
        color: COLORS.error,
        bg: COLORS.errorLight,
        icon: XCircle,
      },
      {
        label: 'Service',
        value: formatCurrency(stats.serviceCharge),
        color: COLORS.purple,
        bg: '#f3e8ff',
        icon: DollarSign,
      },
      {
        label: 'Spare',
        value: formatCurrency(stats.spareCharge),
        color: COLORS.warning,
        bg: COLORS.warningLight,
        icon: Box,
      },
      {
        label: 'Total',
        value: formatCurrency(stats.totalAmount),
        color: COLORS.primary,
        bg: COLORS.infotwo,
        icon: CreditCard,
      },
    ],
    [stats],
  );

  const renderCard = useCallback(({ item }) => {
    const Icon = item.icon;
    return (
      <View style={[styles.summaryCard, { backgroundColor: item.bg }]}>
        <Icon size={16} color={item.color} />
        <Text style={styles.summaryLabel}>{item.label}</Text>
        <Text
          style={[styles.summaryValue, { color: item.color }]}
          numberOfLines={1}
        >
          {item.value}
        </Text>
      </View>
    );
  }, []);

  return (
    <FlatList
      horizontal
      data={cards}
      renderItem={renderCard}
      keyExtractor={(item, index) => index.toString()}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.summaryContainer}
      style={styles.summaryScroll}
    />
  );
});

// Table Row Component
const TableRow = React.memo(
  ({ item, index, columns, onPress, isEven, statusKey }) => {
    const rowBg = isEven ? styles.rowEven : styles.rowOdd;

    return (
      <TouchableOpacity
        onPress={() => onPress?.(item._id || item.id || item.jobId)}
        activeOpacity={0.6}
        disabled={!onPress}
        style={[styles.tableRow, rowBg]}
      >
        {columns.map((column, colIndex) => {
          let value;
          let isStatus = false;

          if (column.render) {
            value = column.render(item, index);
          } else if (column.key === 'index') {
            value = index + 1;
          } else if (column.key === 'status' || column.key === 'mobileStatus') {
            isStatus = true;
            const status =
              item.device?.mobileStatus || item.status || item.jobStatus || '-';
            value = <StatusChip status={status} />;
          } else if (column.key === 'customerName') {
            value = item.customer?.name || item.customerName || '-';
          } else if (column.key === 'contact') {
            value = item.customer?.contact || item.contact || '-';
          } else if (column.key === 'engineer') {
            value =
              item.service?.engineer || item.engineer || item.engineerId || '-';
          } else if (column.key === 'createdAt') {
            value = formatDate(item.createdAt || item.savedDate);
          } else if (column.key === 'serviceCharge') {
            value = formatCurrency(
              item.service?.serviceCharge || item.serviceCharges || 0,
            );
          } else if (column.key === 'spareCharge') {
            value = formatCurrency(
              item.service?.spareCharge || item.spareCharges || 0,
            );
          } else if (column.key === 'total') {
            const service = safeNum(
              item.service?.serviceCharge || item.serviceCharges,
            );
            const spare = safeNum(
              item.service?.spareCharge || item.spareCharges,
            );
            value = formatCurrency(service + spare);
          } else if (column.key === 'date') {
            value = item.date || '-';
          } else if (column.key === 'count') {
            value = item.count || 0;
          } else {
            value =
              item[column.key] !== undefined && item[column.key] !== null
                ? item[column.key]
                : '-';
          }

          return (
            <View
              key={colIndex}
              style={[
                styles.tableCellContainer,
                { width: column.width || 100 },
              ]}
            >
              {isStatus ? (
                value
              ) : typeof value === 'object' ? (
                value
              ) : (
                <Text
                  style={[
                    styles.tableCell,
                    column.bold && styles.boldCell,
                    column.color && { color: column.color },
                  ]}
                  numberOfLines={1}
                >
                  {value !== undefined && value !== null ? String(value) : '-'}
                </Text>
              )}
            </View>
          );
        })}
      </TouchableOpacity>
    );
  },
);

// Optimized Table Component
const OptimizedTable = React.memo(
  ({ columns, data, onPress, grandTotal, totalLabel = 'Grand Total', showTotal = true }) => {
    const totalWidth = useMemo(
      () => columns.reduce((sum, col) => sum + (col.width || 100), 0),
      [columns],
    );

    const renderItem = useCallback(
      ({ item, index }) => (
        <TableRow
          item={item}
          index={index}
          columns={columns}
          onPress={onPress}
          isEven={index % 2 === 0}
        />
      ),
      [columns, onPress],
    );

    const keyExtractor = useCallback(
      (item, index) => item._id || item.id || `row_${index}`,
      [],
    );

    if (!data?.length) {
      return (
        <View style={styles.emptyContainer}>
          <ClipboardList size={40} color={COLORS.gray300} />
          <Text style={styles.emptyText}>No data found</Text>
          <Text style={styles.emptySubText}>Try adjusting your filters</Text>
        </View>
      );
    }

    return (
      <View style={styles.tableWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
        >
          <View style={{ width: totalWidth, minWidth: SCREEN_WIDTH - 20 }}>
            {/* Header */}
            <View style={[styles.tableRow, styles.headerRow]}>
              {columns.map((column, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.tableHeaderCellContainer,
                    { width: column.width || 100 },
                  ]}
                >
                  <Text style={styles.tableHeaderCell} numberOfLines={1}>
                    {column.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Body */}
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              initialNumToRender={15}
              maxToRenderPerBatch={15}
              windowSize={5}
              removeClippedSubviews={Platform.OS === 'android'}
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              style={{ maxHeight: 400 }}
            />

            {/* Grand Total */}
            {showTotal && grandTotal !== undefined && grandTotal !== null && (
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>{totalLabel}</Text>
                <Text style={styles.grandTotalValue}>
                  {typeof grandTotal === 'number' ? grandTotal : formatCurrency(grandTotal)}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  },
);

// ─── Main Component ──────────────────────────────────────────────────────────

const ReportsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Selectors
  const {
    engineerReport = [],
    noEngineerJobs = [],
    valueReport = [],
    spareReport = [],
    dealerReport = [],
    dailySummary = [],
    pendingReport = [],
    deliveredNRNA = [],
    rebillReport = [],
    loading: reportLoading = false,
  } = useSelector(state => state.reports || {});
  const { list = [], loading: jobsLoading = false } = useSelector(
    state => state.jobs || {},
  );

  const loading = reportLoading || jobsLoading;

  // State
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    status: 'All',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const cacheRef = useRef({});
  const tabChangeTimeout = useRef(null);
  const mainScrollViewRef = useRef(null);

  // Memoized Stats - FIXED to use device.mobileStatus
  const countStats = useMemo(() => {
    const allJobs = list;
    return {
      received: allJobs.filter(
        j => (j.device?.mobileStatus || j.status) === 'Received',
      ).length,
      pending: allJobs.filter(
        j => (j.device?.mobileStatus || j.status) === 'Pending',
      ).length,
      repaired: allJobs.filter(
        j => (j.device?.mobileStatus || j.status) === 'Repaired',
      ).length,
      delivered: allJobs.filter(
        j => (j.device?.mobileStatus || j.status) === 'Delivered',
      ).length,
      nrna: allJobs.filter(
        j => (j.device?.mobileStatus || j.status) === 'Delivered NR/NA',
      ).length,
      serviceCharge: allJobs.reduce(
        (s, j) => s + safeNum(j.service?.serviceCharge),
        0,
      ),
      spareCharge: allJobs.reduce(
        (s, j) => s + safeNum(j.service?.spareCharge),
        0,
      ),
      totalAmount: allJobs.reduce(
        (s, j) =>
          s +
          safeNum(j.service?.serviceCharge) +
          safeNum(j.service?.spareCharge),
        0,
      ),
    };
  }, [list]);

  // Memoized Filtered Data
  const filteredList = useMemo(() => {
    if (!list.length || !filters.search.trim()) return list;
    const q = filters.search.toLowerCase();
    return list.filter(
      j =>
        (j.customer?.name || '').toLowerCase().includes(q) ||
        (j.customer?.contact || '').includes(q) ||
        (j.jobSheetNo || '').toLowerCase().includes(q),
    );
  }, [list, filters.search]);

  // ─── Column Definitions ───────────────────────────────────────────────────

  // All Reports Columns
  const allReportsColumns = useMemo(
    () => [
      { label: '#', key: 'index', width: 35 },
      { label: 'Date', key: 'createdAt', width: 70 },
      { label: 'Job No', key: 'jobSheetNo', width: 85, bold: true },
      { label: 'Customer', key: 'customerName', width: 100 },
      { label: 'Contact', key: 'contact', width: 80 },
      {
        label: 'Alt Contact',
        key: 'altContact',
        width: 80,
        render: item => item.customer?.altContact || '-',
      },
      {
        label: 'Make',
        key: 'make',
        width: 70,
        render: item => item.device?.make || '-',
      },
      {
        label: 'Model',
        key: 'model',
        width: 80,
        render: item => item.device?.model || '-',
      },
      {
        label: 'IMEI',
        key: 'imei',
        width: 100,
        render: item => item.device?.imei || '-',
      },
      {
        label: 'Warranty',
        key: 'warranty',
        width: 70,
        render: item => item.device?.warranty || '-',
      },
      { label: 'Status', key: 'status', width: 75 },
      { label: 'Engineer', key: 'engineer', width: 85 },
      {
        label: 'Dealer',
        key: 'dealer',
        width: 85,
        render: item => item.service?.dealer || '-',
      },
      {
        label: 'Drawer',
        key: 'drawer',
        width: 60,
        render: item => item.service?.drawer || '-',
      },
      {
        label: 'Service',
        key: 'serviceCharge',
        width: 70,
        color: COLORS.purple,
      },
      { label: 'Spare', key: 'spareCharge', width: 70, color: COLORS.pink },
      {
        label: 'Total',
        key: 'total',
        width: 75,
        bold: true,
        color: COLORS.success,
      },
      {
        label: 'Payment',
        key: 'payment',
        width: 70,
        render: item => item.service?.paymentMode || '-',
      },
      {
        label: 'Problems',
        key: 'problems',
        width: 85,
        render: item => item.visualIssues?.join(', ') || '-',
      },
      {
        label: 'Physical Cond.',
        key: 'physicalCond',
        width: 85,
        render: item => item.physicalCondition?.join(', ') || '-',
      },
      {
        label: 'Accessories',
        key: 'accessories',
        width: 80,
        render: item => item.accessories?.join(', ') || '-',
      },
      {
        label: 'Repair Date',
        key: 'repairDate',
        width: 75,
        render: item => formatDate(item.service?.repairDate),
      },
      {
        label: 'Delivery Date',
        key: 'deliveryDate',
        width: 75,
        render: item => formatDate(item.service?.deliveryDate),
      },
      {
        label: 'Advance',
        key: 'advance',
        width: 70,
        color: COLORS.info,
        render: item => formatCurrency(item.service?.advanceAmount),
      },
      {
        label: 'Adv. Date',
        key: 'advanceDate',
        width: 75,
        render: item => formatDate(item.service?.advanceDate),
      },
      {
        label: 'Margin',
        key: 'margin',
        width: 70,
        color: COLORS.warning,
        render: item => formatCurrency(item.service?.margin),
      },
      {
        label: 'Remarks',
        key: 'remarks',
        width: 90,
        render: item => item.service?.remarks || '-',
      },
      {
        label: 'Insta',
        key: 'insta',
        width: 50,
        render: item => item.service?.instaFollowers || '-',
      },
      {
        label: 'Google',
        key: 'google',
        width: 55,
        render: item => item.service?.googleReview || '-',
      },
      {
        label: 'Service Rep',
        key: 'serviceRep',
        width: 80,
        render: item => item.service?.serviceRep || '-',
      },
      {
        label: 'Created By',
        key: 'createdBy',
        width: 80,
        render: item => item.createdBy?.name || item.createdBy?.username || '-',
      },
    ],
    [],
  );

  // Engineer Report Columns
  const engineerColumns = useMemo(
    () => [
      { label: 'SL No', key: 'index', width: 45 },
      { label: 'Job No', key: 'jobSheetNo', width: 90, bold: true },
      { label: 'Customer', key: 'customerName', width: 110 },
      { label: 'Contact', key: 'contact', width: 90 },
      {
        label: 'Saved Date',
        key: 'createdAt',
        width: 85,
        render: item => formatDate(item.createdAt || item.savedDate),
      },
      {
        label: 'Delivered Date',
        key: 'deliveredDate',
        width: 85,
        render: item => formatDate(item.service?.deliveryDate),
      },
      {
        label: 'Engineer',
        key: 'engineer',
        width: 90,
        render: item => item.service?.engineer || '-',
      },
      { label: 'Status', key: 'status', width: 85 },
    ],
    [],
  );

  // Value Report Columns - Exactly matching the image
  const valueColumns = useMemo(
    () => [
      { label: 'Job No', key: 'jobNo', width: 90, bold: true },
      { label: 'Name', key: 'name', width: 110 },
      { label: 'Recd', key: 'received', width: 85 },
      { label: 'Repd', key: 'repaired', width: 85 },
      { label: 'Deld', key: 'delivered', width: 85 },
      { label: 'Service', key: 'service', width: 85, color: COLORS.purple },
      { label: 'Spare', key: 'spare', width: 85, color: COLORS.pink },
      {
        label: 'Total',
        key: 'total',
        width: 85,
        bold: true,
        color: COLORS.success,
      },
    ],
    [],
  );

  // Spare Report Columns
  const spareColumns = useMemo(
    () => [
      { label: '#', key: 'index', width: 40 },
      { label: 'Job No', key: 'jobSheet', width: 90, bold: true },
      { label: 'Spare Part', key: 'spare', width: 160 },
      { label: 'Qty', key: 'qty', width: 50 },
      { label: 'Rate', key: 'rate', width: 75 },
      {
        label: 'Amount',
        key: 'amount',
        width: 85,
        bold: true,
        color: COLORS.success,
      },
    ],
    [],
  );

  // Dealer Report Columns
  const dealerColumns = useMemo(
    () => [
      { label: '#', key: 'index', width: 40 },
      {
        label: 'Dealer',
        key: 'dealer',
        width: 100,
        render: item => item.service?.dealer || item.dealerName || '-',
      },
      { label: 'Customer', key: 'customerName', width: 110 },
      { label: 'Contact', key: 'contact', width: 85 },
      { label: 'Date', key: 'createdAt', width: 75 },
      { label: 'Engineer', key: 'engineer', width: 90 },
      { label: 'Status', key: 'status', width: 80 },
    ],
    [],
  );

  // Received Report Columns - Matching the image exactly
  const receivedColumns = useMemo(
    () => [
      { label: 'Date', key: 'date', width: 120, bold: true },
      {
        label: 'Received Count',
        key: 'count',
        width: 120,
        bold: true,
        color: COLORS.primary,
      },
    ],
    [],
  );

  // Daily Delivered Columns
  const deliveredColumns = useMemo(
    () => [
      { label: 'Date', key: 'date', width: 120, bold: true },
      {
        label: 'Delivered Count',
        key: 'count',
        width: 120,
        bold: true,
        color: COLORS.success,
      },
    ],
    [],
  );

  // Daily Repaired Columns
  const repairedColumns = useMemo(
    () => [
      { label: 'Date', key: 'date', width: 120, bold: true },
      {
        label: 'Repaired Count',
        key: 'count',
        width: 120,
        bold: true,
        color: COLORS.purple,
      },
    ],
    [],
  );

  // Pending Report Columns - Matching the image exactly
  const pendingColumns = useMemo(
    () => [
      { label: 'Job No', key: 'jobSheetNo', width: 90, bold: true },
      { label: 'Customer', key: 'customerName', width: 110 },
      {
        label: 'Make',
        key: 'make',
        width: 90,
        render: item => item.device?.make || '-',
      },
      {
        label: 'Model',
        key: 'model',
        width: 100,
        render: item => item.device?.model || '-',
      },
      { label: 'Phone', key: 'contact', width: 100 },
      { label: 'Date', key: 'createdAt', width: 90 },
      {
        label: 'Fault',
        key: 'fault',
        width: 80,
        render: item => item.visualIssues?.join(', ') || '-',
      },
      { label: 'Status', key: 'status', width: 90 },
    ],
    [],
  );

  // NR/NA Columns
  const nrnaColumns = useMemo(
    () => [
      { label: 'Date', key: 'date', width: 120, bold: true },
      {
        label: 'NR/NA Count',
        key: 'count',
        width: 120,
        bold: true,
        color: COLORS.error,
      },
    ],
    [],
  );

  // Rebill Report Columns
  const rebillColumns = useMemo(
    () => [
      { label: '#', key: 'index', width: 30 },
      { label: 'Job No', key: 'jobSheetNo', width: 80, bold: true },
      { label: 'Customer', key: 'customerName', width: 95 },
      { label: 'Contact', key: 'contact', width: 75 },
      {
        label: 'Device',
        key: 'device',
        width: 85,
        render: item =>
          `${item.device?.make || ''} ${item.device?.model || ''}`.trim() ||
          '-',
      },
      {
        label: 'Engineer',
        key: 'engineer',
        width: 85,
        render: item => item.service?.engineer || '-',
      },
      { label: 'Status', key: 'status', width: 70 },
      {
        label: 'Rebills',
        key: 'rebills',
        width: 55,
        color: COLORS.warning,
        render: item => item.rebillHistory?.length || 0,
      },
      {
        label: 'Current',
        key: 'currentTotal',
        width: 70,
        color: COLORS.info,
        render: item =>
          formatCurrency(
            safeNum(item.service?.serviceCharge) +
              safeNum(item.service?.spareCharge),
          ),
      },
      {
        label: 'Total',
        key: 'total',
        width: 75,
        bold: true,
        color: COLORS.success,
        render: item => {
          const histTotal = (item.rebillHistory || []).reduce(
            (s, r) => s + safeNum(r.serviceCharge) + safeNum(r.spareCharge),
            0,
          );
          const currTotal =
            safeNum(item.service?.serviceCharge) +
            safeNum(item.service?.spareCharge);
          return formatCurrency(histTotal + currTotal);
        },
      },
    ],
    [],
  );

  // ─── Report Loading ──────────────────────────────────────────────────────

  const loadReport = useCallback(
    (tabId, fd, td, sf) => {
      const cacheKey = `${tabId}_${fd}_${td}_${sf}`;

      if (
        cacheRef.current[cacheKey] &&
        Date.now() - cacheRef.current[cacheKey].timestamp < 2000
      ) {
        return;
      }

      cacheRef.current[cacheKey] = { timestamp: Date.now() };

      const filterParams = {};
      if (fd) filterParams.fromDate = fd;
      if (td) filterParams.toDate = td;
      if (sf && sf !== 'All' && sf !== 'All Status') filterParams.status = sf;

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
        case 'rebill':
          dispatch(fetchRebillReport(filterParams));
          break;
        case 'all':
          dispatch(fetchJobs(filterParams));
          break;
        case 'received':
          dispatch(fetchDailySummary({ ...filterParams, type: 'received' }));
          break;
        case 'dailyDelivered':
          dispatch(fetchDailySummary({ ...filterParams, type: 'delivered' }));
          break;
        case 'dailyRepaired':
          dispatch(fetchDailySummary({ ...filterParams, type: 'repaired' }));
          break;
        case 'repairPending':
          dispatch(
            fetchPendingReport({ ...filterParams, type: 'repairPending' }),
          );
          break;
        case 'deliveryPending':
          dispatch(
            fetchPendingReport({ ...filterParams, type: 'deliveryPending' }),
          );
          break;
        case 'deliveredNRNA':
          dispatch(fetchDeliveredNRNAReport(filterParams));
          break;
        default:
          break;
      }
    },
    [dispatch],
  );

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleTabPress = useCallback(
    tabId => {
      if (tabChangeTimeout.current) {
        clearTimeout(tabChangeTimeout.current);
      }

      tabChangeTimeout.current = setTimeout(() => {
        setActiveTab(tabId);
        loadReport(tabId, filters.fromDate, filters.toDate, filters.status);
        if (mainScrollViewRef.current) {
          mainScrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
      }, 150);
    },
    [loadReport, filters],
  );

  const handleApplyFilter = useCallback(() => {
    loadReport(activeTab, filters.fromDate, filters.toDate, filters.status);
    setShowFilters(false);
    setTimeout(() => {
      if (mainScrollViewRef.current) {
        mainScrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    }, 100);
  }, [loadReport, activeTab, filters]);

  const resetFilters = useCallback(() => {
    setFilters({
      fromDate: '',
      toDate: '',
      status: 'All',
      search: '',
    });
    loadReport(activeTab, '', '', 'All');
    setShowFilters(false);
  }, [loadReport, activeTab]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadReport(activeTab, filters.fromDate, filters.toDate, filters.status);
    setTimeout(() => setRefreshing(false), 500);
  }, [loadReport, activeTab, filters]);

  const navigateToJobDetail = useCallback(
    jobId => {
      if (jobId) {
        navigation.navigate('JobSheet', {
          screen: 'JobDetail',
          params: { jobId, id: jobId },
        });
      }
    },
    [navigation],
  );

  const navigateToStaleJobs = useCallback(() => {
    navigation.navigate('StaleJobs');
  }, [navigation]);

  const navigateToRebillFullView = useCallback(() => {
    navigation.navigate('RebillReport');
  }, [navigation]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.fromDate) count++;
    if (filters.toDate) count++;
    if (filters.status !== 'All') count++;
    return count;
  }, [filters]);

  // ─── Excel Export ────────────────────────────────────────────────────────

  const handleExportToExcel = useCallback(async () => {
    let exportData = [];
    let filename = '';
    let headers = [];

    switch (activeTab) {
      case 'all':
        exportData = filteredList;
        filename = 'All_Reports';
        headers = [
          'SL No',
          'Date',
          'Job No',
          'Customer',
          'Contact',
          'Model',
          'Status',
          'Engineer',
          'Service',
          'Spare',
          'Total',
        ];
        break;
      case 'engineer':
        const engJobs = [
          ...noEngineerJobs,
          ...engineerReport.flatMap(e => e.jobs || []),
        ];
        exportData = engJobs;
        filename = 'Engineer_Wise_Report';
        headers = [
          'SL No',
          'Job No',
          'Customer',
          'Contact',
          'Date',
          'Engineer',
          'Status',
        ];
        break;
      case 'value':
        exportData = valueReport;
        filename = 'Value_Report';
        headers = [
          'Job No',
          'Name',
          'Received',
          'Repaired',
          'Delivered',
          'Service',
          'Spare',
          'Total',
        ];
        break;
      case 'spare':
        exportData = spareReport;
        filename = 'Spare_Parts_Report';
        headers = ['SL No', 'Job No', 'Spare Part', 'Qty', 'Rate', 'Amount'];
        break;
      case 'dealer':
        exportData = dealerReport;
        filename = 'Dealer_Report';
        headers = [
          'SL No',
          'Dealer',
          'Customer',
          'Contact',
          'Date',
          'Engineer',
          'Status',
        ];
        break;
      case 'received':
        exportData = dailySummary;
        filename = 'Received_Report';
        headers = ['Date', 'Received Count'];
        break;
      case 'dailyDelivered':
        exportData = dailySummary;
        filename = 'Delivered_Report';
        headers = ['Date', 'Delivered Count'];
        break;
      case 'dailyRepaired':
        exportData = dailySummary;
        filename = 'Repaired_Report';
        headers = ['Date', 'Repaired Count'];
        break;
      case 'repairPending':
      case 'deliveryPending':
        exportData = pendingReport;
        filename = activeTab === 'repairPending' ? 'Repair_Pending_Report' : 'Delivery_Pending_Report';
        headers = [
          'Job No',
          'Customer',
          'Make',
          'Model',
          'Phone',
          'Date',
          'Fault',
          'Status',
        ];
        break;
      case 'deliveredNRNA':
        exportData = deliveredNRNA;
        filename = 'NR_NA_Report';
        headers = ['Date', 'NR/NA Count'];
        break;
      case 'rebill':
        exportData = rebillReport;
        filename = 'Rebill_Report';
        headers = [
          'SL No',
          'Job No',
          'Customer',
          'Contact',
          'Device',
          'Engineer',
          'Status',
          'Rebills',
          'Current Total',
          'All-time Total',
        ];
        break;
      default:
        exportData = filteredList;
        filename = 'Reports';
        headers = ['SL No', 'Date', 'Job No', 'Customer', 'Contact', 'Status'];
    }

    if (!exportData.length) {
      Alert.alert('No Data', 'There is no data to export');
      return;
    }

    try {
      const rows = exportData.slice(0, 2000).map((item, idx) => {
        const row = {};
        headers.forEach((h, i) => {
          switch (h) {
            case 'SL No':
              row[h] = idx + 1;
              break;
            case 'Date':
              row[h] = formatDate(item.createdAt || item.savedDate || item.date);
              break;
            case 'Job No':
              row[h] = item.jobSheetNo || item.jobNo || '-';
              break;
            case 'Customer':
              row[h] = item.customer?.name || item.customerName || '-';
              break;
            case 'Contact':
              row[h] = item.customer?.contact || item.contact || '-';
              break;
            case 'Model':
              row[h] = item.device?.model || '-';
              break;
            case 'Status':
              row[h] = item.device?.mobileStatus || item.status || '-';
              break;
            case 'Engineer':
              row[h] = item.service?.engineer || item.engineer || '-';
              break;
            case 'Service':
              row[h] = safeNum(
                item.service?.serviceCharge || item.serviceCharges,
              );
              break;
            case 'Spare':
              row[h] = safeNum(item.service?.spareCharge || item.spareCharges);
              break;
            case 'Total':
              row[h] =
                safeNum(item.service?.serviceCharge || item.serviceCharges) +
                safeNum(item.service?.spareCharge || item.spareCharges);
              break;
            case 'Name':
              row[h] = item.name || item.customerName || '-';
              break;
            case 'Received':
              row[h] = item.received || formatDate(item.createdAt);
              break;
            case 'Repaired':
              row[h] = item.repaired || '-';
              break;
            case 'Delivered':
              row[h] = item.delivered || '-';
              break;
            case 'Spare Part':
              row[h] = item.spare || '-';
              break;
            case 'Qty':
              row[h] = safeNum(item.qty);
              break;
            case 'Rate':
              row[h] = safeNum(item.rate);
              break;
            case 'Amount':
              row[h] = safeNum(item.amount);
              break;
            case 'Dealer':
              row[h] = item.service?.dealer || item.dealerName || '-';
              break;
            case 'Device':
              row[h] =
                `${item.device?.make || ''} ${
                  item.device?.model || ''
                }`.trim() || '-';
              break;
            case 'Rebills':
              row[h] = item.rebillHistory?.length || 0;
              break;
            case 'Current Total':
              row[h] = safeNum(item.service?.serviceCharge) + safeNum(item.service?.spareCharge);
              break;
            case 'All-time Total':
              const histTotal = (item.rebillHistory || []).reduce(
                (s, r) => s + safeNum(r.serviceCharge) + safeNum(r.spareCharge),
                0,
              );
              const currTotal = safeNum(item.service?.serviceCharge) + safeNum(item.service?.spareCharge);
              row[h] = histTotal + currTotal;
              break;
            case 'Received Count':
              row[h] = safeNum(item.count);
              break;
            case 'Delivered Count':
              row[h] = safeNum(item.count);
              break;
            case 'Repaired Count':
              row[h] = safeNum(item.count);
              break;
            case 'NR/NA Count':
              row[h] = safeNum(item.count);
              break;
            case 'Phone':
              row[h] = item.customer?.contact || item.contact || '-';
              break;
            case 'Fault':
              row[h] = item.visualIssues?.join(', ') || '-';
              break;
            default:
              row[h] = '-';
          }
        });
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const colWidths = headers.map(() => ({ wch: 15 }));
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, filename);

      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const timestamp = Date.now();
      const filePath = `${RNFS.CachesDirectoryPath}/Report_${timestamp}.xlsx`;
      await RNFS.writeFile(filePath, wbout, 'base64');

      Alert.alert('Export Complete', 'Report exported successfully', [
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
  }, [
    activeTab,
    filteredList,
    valueReport,
    spareReport,
    dealerReport,
    engineerReport,
    noEngineerJobs,
    rebillReport,
    dailySummary,
    pendingReport,
    deliveredNRNA,
  ]);

  // ─── Computed Data ──────────────────────────────────────────────────────

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

  const valueReportTotal = useMemo(
    () => valueReport.reduce((sum, item) => sum + safeNum(item.total), 0),
    [valueReport],
  );

  const valueReportSubtotals = useMemo(() => {
    const service = valueReport.reduce((sum, item) => sum + safeNum(item.service), 0);
    const spare = valueReport.reduce((sum, item) => sum + safeNum(item.spare), 0);
    const total = valueReport.reduce((sum, item) => sum + safeNum(item.total), 0);
    return { service, spare, total };
  }, [valueReport]);

  const spareReportTotal = useMemo(
    () => spareReport.reduce((sum, item) => sum + safeNum(item.amount), 0),
    [spareReport],
  );

  const dailyTotal = useMemo(
    () => dailySummary.reduce((sum, item) => sum + safeNum(item.count), 0),
    [dailySummary],
  );

  const nrnaTotal = useMemo(
    () => deliveredNRNA.reduce((sum, item) => sum + safeNum(item.count), 0),
    [deliveredNRNA],
  );

  // ─── Rebill Summary Stats ───────────────────────────────────────────────

  const rebillStats = useMemo(() => {
    if (!rebillReport.length) {
      return { totalJobs: 0, totalRebills: 0, totalRevenue: 0 };
    }
    
    const totalRebills = rebillReport.reduce(
      (sum, job) => sum + (job.rebillHistory?.length || 0), 
      0
    );
    
    const totalRevenue = rebillReport.reduce((sum, job) => {
      const histTotal = job.rebillHistory?.reduce(
        (s, r) => s + safeNum(r.serviceCharge) + safeNum(r.spareCharge), 
        0
      ) || 0;
      const currTotal = safeNum(job.service?.serviceCharge) + safeNum(job.service?.spareCharge);
      return sum + histTotal + currTotal;
    }, 0);
    
    return {
      totalJobs: rebillReport.length,
      totalRebills,
      totalRevenue,
    };
  }, [rebillReport]);

  // ─── Render Value Report with Sub Total ────────────────────────────────

  const renderValueReport = useCallback(() => {
    if (!valueReport.length) {
      return (
        <View style={styles.emptyContainer}>
          <DollarSign size={40} color={COLORS.gray300} />
          <Text style={styles.emptyText}>No data found</Text>
          <Text style={styles.emptySubText}>Try adjusting your filters</Text>
        </View>
      );
    }

    const totalWidth = valueColumns.reduce((sum, col) => sum + (col.width || 100), 0);

    return (
      <View style={styles.tableWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
        >
          <View style={{ width: totalWidth, minWidth: SCREEN_WIDTH - 20 }}>
            {/* Header */}
            <View style={[styles.tableRow, styles.headerRow]}>
              {valueColumns.map((column, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.tableHeaderCellContainer,
                    { width: column.width || 100 },
                  ]}
                >
                  <Text style={styles.tableHeaderCell} numberOfLines={1}>
                    {column.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Body */}
            <FlatList
              data={valueReport}
              renderItem={({ item, index }) => (
                <TableRow
                  item={item}
                  index={index}
                  columns={valueColumns}
                  onPress={navigateToJobDetail}
                  isEven={index % 2 === 0}
                />
              )}
              keyExtractor={(item, index) => item._id || item.id || `row_${index}`}
              initialNumToRender={15}
              maxToRenderPerBatch={15}
              windowSize={5}
              removeClippedSubviews={Platform.OS === 'android'}
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              style={{ maxHeight: 400 }}
            />

            {/* Sub Total Row - Matching web exactly */}
            <View style={styles.subTotalContainer}>
              <View style={styles.subTotalRow}>
                <Text style={styles.subTotalLabel}>Sub Total</Text>
                <View style={styles.subTotalValues}>
                  <Text style={styles.subTotalValue}>
                    {formatCurrency(valueReportSubtotals.service)}
                  </Text>
                  <Text style={styles.subTotalValue}>
                    {formatCurrency(valueReportSubtotals.spare)}
                  </Text>
                  <Text style={[styles.subTotalValue, styles.subTotalBold]}>
                    {formatCurrency(valueReportSubtotals.total)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Grand Total */}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(valueReportTotal)}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }, [valueReport, valueColumns, valueReportSubtotals, valueReportTotal, navigateToJobDetail]);

  // ─── Render Received Report ─────────────────────────────────────────────

  const renderReceivedReport = useCallback(() => {
    if (!dailySummary.length) {
      return (
        <View style={styles.emptyContainer}>
          <Inbox size={40} color={COLORS.gray300} />
          <Text style={styles.emptyText}>No data found</Text>
          <Text style={styles.emptySubText}>Try adjusting your filters</Text>
        </View>
      );
    }

    return (
      <View>
        <View style={styles.reportHeaderContainer}>
          <Text style={styles.reportHeaderTitle}>service.radnus.in/received-report</Text>
          <View style={styles.totalDaysContainer}>
            <Text style={styles.totalDaysLabel}>Total Days: {dailySummary.length}</Text>
          </View>
        </View>
        <OptimizedTable
          columns={receivedColumns}
          data={dailySummary}
          grandTotal={dailyTotal}
          totalLabel="Total"
        />
      </View>
    );
  }, [dailySummary, receivedColumns, dailyTotal]);

  // ─── Render NR/NA Report ────────────────────────────────────────────────

  const renderNRNAReport = useCallback(() => {
    if (!deliveredNRNA.length) {
      return (
        <View style={styles.emptyContainer}>
          <AlertTriangle size={40} color={COLORS.gray300} />
          <Text style={styles.emptyText}>No data found</Text>
          <Text style={styles.emptySubText}>Try adjusting your filters</Text>
        </View>
      );
    }

    return (
      <View>
        <View style={styles.reportHeaderContainer}>
          <Text style={styles.reportHeaderTitle}>Daily Delivered NR/NA Report</Text>
          <Text style={styles.reportHeaderSubtitle}>Daily NR/NA delivered device summary</Text>
          <View style={styles.totalDaysContainer}>
            <Text style={styles.totalDaysLabel}>Total Days: {deliveredNRNA.length}</Text>
          </View>
        </View>
        <OptimizedTable
          columns={nrnaColumns}
          data={deliveredNRNA}
          grandTotal={nrnaTotal}
          totalLabel="Total NR/NA"
        />
        <View style={styles.totalTextContainer}>
          <Text style={styles.totalText}>
            Total NR/NA: <Text style={styles.totalTextBold}>{nrnaTotal}</Text>
          </Text>
        </View>
      </View>
    );
  }, [deliveredNRNA, nrnaColumns, nrnaTotal]);

  // ─── Render Daily Reports ───────────────────────────────────────────────

  const renderDailyReport = useCallback((type) => {
    if (!dailySummary.length) {
      return (
        <View style={styles.emptyContainer}>
          <ClipboardList size={40} color={COLORS.gray300} />
          <Text style={styles.emptyText}>No data found</Text>
          <Text style={styles.emptySubText}>Try adjusting your filters</Text>
        </View>
      );
    }

    const columns = type === 'delivered' ? deliveredColumns : repairedColumns;
    const label = type === 'delivered' ? 'Delivered' : 'Repaired';

    return (
      <View>
        <View style={styles.reportHeaderContainer}>
          <Text style={styles.reportHeaderTitle}>Daily {label} Report</Text>
          <Text style={styles.reportHeaderSubtitle}>Daily {label.toLowerCase()} device summary</Text>
          <View style={styles.totalDaysContainer}>
            <Text style={styles.totalDaysLabel}>Total Days: {dailySummary.length}</Text>
          </View>
        </View>
        <OptimizedTable
          columns={columns}
          data={dailySummary}
          grandTotal={dailyTotal}
          totalLabel="Total"
        />
      </View>
    );
  }, [dailySummary, deliveredColumns, repairedColumns, dailyTotal]);

  // ─── Render Pending Report ──────────────────────────────────────────────

  const renderPendingReport = useCallback((type) => {
    if (!pendingReport.length) {
      return (
        <View style={styles.emptyContainer}>
          <Clock size={40} color={COLORS.gray300} />
          <Text style={styles.emptyText}>No data found</Text>
          <Text style={styles.emptySubText}>Try adjusting your filters</Text>
        </View>
      );
    }

    const title = type === 'repairPending' ? 'Repair Pending Report' : 'Delivery Pending Report';
    const subtitle = type === 'repairPending' 
      ? 'Track all pending & received repair devices' 
      : 'Track all repaired devices pending delivery';

    return (
      <View>
        <View style={styles.reportHeaderContainer}>
          <Text style={styles.reportHeaderTitle}>{title}</Text>
          <Text style={styles.reportHeaderSubtitle}>{subtitle}</Text>
          <View style={styles.totalRecordsContainer}>
            <Text style={styles.totalRecordsLabel}>Total Records: {pendingReport.length}</Text>
          </View>
        </View>
        <OptimizedTable
          columns={pendingColumns}
          data={pendingReport}
          onPress={navigateToJobDetail}
          showTotal={false}
        />
      </View>
    );
  }, [pendingReport, pendingColumns, navigateToJobDetail]);

  // ─── Render Engineer Grouped Report ────────────────────────────────────

  const renderEngineerGroupedReport = useCallback(() => {
    const groups = [];

    if (noEngineerJobs?.length) {
      groups.push({
        engineer: 'No Engineer',
        jobs: noEngineerJobs,
        count: noEngineerJobs.length,
      });
    }

    if (engineerReport?.length) {
      engineerReport.forEach(eng => {
        if (eng.jobs?.length) {
          groups.push({
            engineer: eng.engineer || eng.name || 'Unknown',
            jobs: eng.jobs,
            count: eng.jobs.length,
          });
        }
      });
    }

    if (!groups.length) {
      return (
        <View style={styles.emptyContainer}>
          <ClipboardList size={40} color={COLORS.gray300} />
          <Text style={styles.emptyText}>No data found</Text>
          <Text style={styles.emptySubText}>Try adjusting your filters</Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
      >
        <View style={{ minWidth: SCREEN_WIDTH - 20, paddingBottom: 8 }}>
          {groups.map((group, groupIdx) => (
            <View key={groupIdx} style={styles.engineerGroupContainer}>
              {/* Engineer Header */}
              <View style={styles.engineerHeader}>
                <Wrench size={14} color={COLORS.gray700} />
                <Text style={styles.engineerHeaderText}>
                  {group.engineer}
                  <Text style={styles.engineerJobCount}>
                    {' '}({group.count} jobs)
                  </Text>
                </Text>
              </View>

              {/* Table Header */}
              <View style={[styles.tableRow, styles.headerRow]}>
                {engineerColumns.map((column, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.tableHeaderCellContainer,
                      { width: column.width || 100 },
                    ]}
                  >
                    <Text style={styles.tableHeaderCell} numberOfLines={1}>
                      {column.label}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Table Rows */}
              {group.jobs.map((item, index) => (
                <TouchableOpacity
                  key={item._id || index}
                  onPress={() => navigateToJobDetail(item._id)}
                  activeOpacity={0.6}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                  ]}
                >
                  {engineerColumns.map((column, colIndex) => {
                    let value;
                    let isStatus = false;

                    if (column.render) {
                      value = column.render(item, index);
                    } else if (column.key === 'index') {
                      value = index + 1;
                    } else if (
                      column.key === 'status' ||
                      column.key === 'mobileStatus'
                    ) {
                      isStatus = true;
                      const status =
                        item.device?.mobileStatus ||
                        item.status ||
                        item.jobStatus ||
                        '-';
                      value = <StatusChip status={status} />;
                    } else if (column.key === 'customerName') {
                      value = item.customer?.name || item.customerName || '-';
                    } else if (column.key === 'contact') {
                      value = item.customer?.contact || item.contact || '-';
                    } else if (column.key === 'engineer') {
                      value =
                        item.service?.engineer ||
                        item.engineer ||
                        item.engineerId ||
                        '-';
                    } else if (column.key === 'createdAt') {
                      value = formatDate(item.createdAt || item.savedDate);
                    } else if (column.key === 'deliveredDate') {
                      value = formatDate(item.service?.deliveryDate);
                    } else {
                      value =
                        item[column.key] !== undefined &&
                        item[column.key] !== null
                          ? item[column.key]
                          : '-';
                    }

                    return (
                      <View
                        key={colIndex}
                        style={[
                          styles.tableCellContainer,
                          { width: column.width || 100 },
                        ]}
                      >
                        {isStatus ? (
                          value
                        ) : typeof value === 'object' ? (
                          value
                        ) : (
                          <Text
                            style={[
                              styles.tableCell,
                              column.bold && styles.boldCell,
                              column.color && { color: column.color },
                            ]}
                            numberOfLines={1}
                          >
                            {value !== undefined && value !== null
                              ? String(value)
                              : '-'}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </TouchableOpacity>
              ))}

              {/* Subtotal Row */}
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalText}>
                  Subtotal — {group.engineer} ({group.count} jobs)
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }, [engineerReport, noEngineerJobs, navigateToJobDetail, engineerColumns]);

  // ─── Render Rebill Table ───────────────────────────────────────────────

  const renderRebillTable = useCallback(() => {
    return (
      <View>
        <View style={styles.rebillHeader}>
          <View style={styles.rebillHeaderLeft}>
            <Receipt size={16} color={COLORS.blue} />
            <Text style={styles.rebillHeaderTitle}>Rebill Report</Text>
            <View style={styles.rebillStatsBadge}>
              <Text style={styles.rebillStatsBadgeText}>
                {rebillStats.totalJobs} jobs · {rebillStats.totalRebills} rebills
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.fullViewButton}
            onPress={navigateToRebillFullView}
          >
            <Text style={styles.fullViewButtonText}>Full View</Text>
            <ChevronRight size={14} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.rebillSummaryGrid}>
          <View style={[styles.rebillSummaryCard, { backgroundColor: '#eef2ff' }]}>
            <Text style={styles.rebillSummaryLabel}>Total Rebilled Jobs</Text>
            <Text style={[styles.rebillSummaryValue, { color: '#6366f1' }]}>
              {rebillStats.totalJobs}
            </Text>
          </View>
          <View style={[styles.rebillSummaryCard, { backgroundColor: '#fffbeb' }]}>
            <Text style={styles.rebillSummaryLabel}>Total Rebill Instances</Text>
            <Text style={[styles.rebillSummaryValue, { color: '#f59e0b' }]}>
              {rebillStats.totalRebills}
            </Text>
          </View>
          <View style={[styles.rebillSummaryCard, { backgroundColor: '#f0fdf4' }]}>
            <Text style={styles.rebillSummaryLabel}>Total Revenue</Text>
            <Text style={[styles.rebillSummaryValue, { color: '#10b981' }]}>
              {formatCurrency(rebillStats.totalRevenue)}
            </Text>
          </View>
        </View>

        <OptimizedTable
          columns={rebillColumns}
          data={rebillReport}
          onPress={navigateToJobDetail}
          showTotal={false}
        />
      </View>
    );
  }, [rebillReport, rebillColumns, navigateToJobDetail, rebillStats, navigateToRebillFullView]);

  // ─── Render Table ────────────────────────────────────────────────────────

  const renderTable = useCallback(() => {
    switch (activeTab) {
      case 'all':
        return (
          <OptimizedTable
            columns={allReportsColumns}
            data={filteredList}
            onPress={navigateToJobDetail}
          />
        );
      case 'engineer':
        return renderEngineerGroupedReport();
      case 'value':
        return renderValueReport();
      case 'spare':
        return (
          <OptimizedTable
            columns={spareColumns}
            data={spareReport}
            grandTotal={spareReportTotal}
          />
        );
      case 'dealer':
        return (
          <OptimizedTable
            columns={dealerColumns}
            data={dealerReport}
            onPress={navigateToJobDetail}
          />
        );
      case 'received':
        return renderReceivedReport();
      case 'dailyDelivered':
        return renderDailyReport('delivered');
      case 'dailyRepaired':
        return renderDailyReport('repaired');
      case 'repairPending':
        return renderPendingReport('repairPending');
      case 'deliveryPending':
        return renderPendingReport('deliveryPending');
      case 'deliveredNRNA':
        return renderNRNAReport();
      case 'rebill':
        return renderRebillTable();
      default:
        return (
          <OptimizedTable
            columns={allReportsColumns}
            data={filteredList}
            onPress={navigateToJobDetail}
          />
        );
    }
  }, [
    activeTab,
    allReportsColumns,
    filteredList,
    navigateToJobDetail,
    renderEngineerGroupedReport,
    renderValueReport,
    renderReceivedReport,
    renderDailyReport,
    renderPendingReport,
    renderNRNAReport,
    renderRebillTable,
    valueColumns,
    valueReport,
    valueReportTotal,
    spareColumns,
    spareReport,
    spareReportTotal,
    dealerColumns,
    dealerReport,
    receivedColumns,
    deliveredColumns,
    repairedColumns,
    dailySummary,
    dailyTotal,
    pendingColumns,
    pendingReport,
    deliveredNRNA,
  ]);

  // ─── Initial Load ────────────────────────────────────────────────────────

  useFocusEffect(
    useCallback(() => {
      loadReport('all', '', '', 'All');
      return () => {
        if (tabChangeTimeout.current) {
          clearTimeout(tabChangeTimeout.current);
        }
      };
    }, [loadReport]),
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.container}>
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
          scrollEventThrottle={16}
        >
          <View style={styles.contentContainer}>
            {/* Summary Cards */}
            <SummaryCards stats={countStats} />

            {/* Stale Jobs Button */}
            <TouchableOpacity
              style={styles.staleJobsButton}
              onPress={navigateToStaleJobs}
              activeOpacity={0.7}
            >
              <AlertCircle size={18} color="#f59e0b" />
              <View style={styles.staleJobsButtonTextContainer}>
                <Text style={styles.staleJobsButtonTitle}>View Stale Jobs</Text>
                <Text style={styles.staleJobsButtonSubtitle}>
                  Jobs pending beyond threshold
                </Text>
              </View>
              <ChevronRight size={18} color="#f59e0b" />
            </TouchableOpacity>

            {/* Filter Section */}
            <View style={styles.filterSection}>
              <View style={styles.searchRow}>
                <View style={styles.searchInputContainer}>
                  <Search size={14} color={COLORS.gray400} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    placeholderTextColor={COLORS.gray400}
                    value={filters.search}
                    onChangeText={value => updateFilter('search', value)}
                    returnKeyType="search"
                    onSubmitEditing={handleApplyFilter}
                  />
                  {filters.search.length > 0 && (
                    <TouchableOpacity
                      onPress={() => updateFilter('search', '')}
                    >
                      <X size={12} color={COLORS.gray400} />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.filterToggle,
                    activeFilterCount > 0 && styles.filterToggleActive,
                  ]}
                  onPress={() => setShowFilters(!showFilters)}
                >
                  <Filter
                    size={16}
                    color={
                      activeFilterCount > 0 ? COLORS.white : COLORS.primary
                    }
                  />
                  {activeFilterCount > 0 && (
                    <View style={styles.filterBadge}>
                      <Text style={styles.filterBadgeText}>
                        {activeFilterCount}
                      </Text>
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
                        style={[
                          styles.chip,
                          filters.status === status && styles.chipActive,
                        ]}
                        onPress={() => updateFilter('status', status)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            filters.status === status && styles.chipTextActive,
                          ]}
                        >
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <View style={styles.dateRangeContainer}>
                    <TouchableOpacity
                      style={[
                        styles.dateButton,
                        filters.fromDate && styles.dateButtonActive,
                      ]}
                      onPress={() => setShowFromPicker(true)}
                    >
                      <Calendar
                        size={13}
                        color={
                          filters.fromDate ? COLORS.primary : COLORS.gray500
                        }
                      />
                      <Text
                        style={[
                          styles.dateText,
                          filters.fromDate && styles.dateTextActive,
                        ]}
                      >
                        {filters.fromDate || 'From'}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.dateSeparator}>→</Text>
                    <TouchableOpacity
                      style={[
                        styles.dateButton,
                        filters.toDate && styles.dateButtonActive,
                      ]}
                      onPress={() => setShowToPicker(true)}
                    >
                      <Calendar
                        size={13}
                        color={filters.toDate ? COLORS.primary : COLORS.gray500}
                      />
                      <Text
                        style={[
                          styles.dateText,
                          filters.toDate && styles.dateTextActive,
                        ]}
                      >
                        {filters.toDate || 'To'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.applyButton}
                      onPress={handleApplyFilter}
                    >
                      <Text style={styles.applyButtonText}>Load Report</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.resetButton}
                      onPress={resetFilters}
                    >
                      <Text style={styles.resetButtonText}>Reset</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.excelButton}
                onPress={handleExportToExcel}
              >
                <Download size={14} color={COLORS.success} />
                <Text style={styles.excelButtonText}>Print / Download</Text>
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
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                  onPress={() => handleTabPress(tab.id)}
                  activeOpacity={0.7}
                >
                  <tab.Icon
                    size={12}
                    color={activeTab === tab.id ? COLORS.white : COLORS.gray600}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab.id && styles.activeTabText,
                    ]}
                  >
                    {tab.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Report Content */}
            <View style={styles.reportContainer}>
              {loading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loaderText}>Loading...</Text>
                </View>
              ) : (
                renderTable()
              )}
            </View>
          </View>
        </ScrollView>

        {/* Date Pickers */}
        <DatePicker
          modal
          open={showFromPicker}
          date={new Date()}
          mode="date"
          onConfirm={date => {
            setShowFromPicker(false);
            const d = formatDateInput(date);
            updateFilter('fromDate', d);
          }}
          onCancel={() => setShowFromPicker(false)}
        />
        <DatePicker
          modal
          open={showToPicker}
          date={new Date()}
          mode="date"
          onConfirm={date => {
            setShowToPicker(false);
            const d = formatDateInput(date);
            updateFilter('toDate', d);
          }}
          onCancel={() => setShowToPicker(false)}
        />
      </View>
    </SafeAreaView>
  );
};

export default ReportsScreen;