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
  Modal,
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
  Printer,
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

// Helper Functions
const formatDate = value => {
  if (!value) return '-';
  try {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
  } catch (e) {}
  return '-';
};

const formatDateDisplay = value => {
  if (!value || value === '-') return '-';
  try {
    const parts = value.split('/');
    if (parts.length === 3) {
      const d = new Date(parts[2], parts[1] - 1, parts[0]);
      if (!isNaN(d.getTime())) {
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
      }
    }
  } catch (e) {}
  return value;
};

const safeNum = val => {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

const safeStr = (val, fallback = '-') => {
  if (val === null || val === undefined) return fallback;
  const s = String(val).trim();
  return s || fallback;
};

const formatCurrency = amount => {
  const num = safeNum(amount);
  return `₹${num.toLocaleString('en-IN')}`;
};

// Status Color Mapping
const getStatusColors = status => {
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
  { id: 'dailyReceived', name: 'Rcvd', Icon: Inbox },
  { id: 'dailyDelivered', name: 'Del', Icon: Send },
  { id: 'dailyRepaired', name: 'Rep', Icon: Hammer },
  { id: 'repairPending', name: 'R Pend', Icon: Clock },
  { id: 'deliveryPending', name: 'D Pend', Icon: Truck },
  { id: 'deliveredNRNA', name: 'NR/NA', Icon: AlertTriangle },
  { id: 'rebill', name: 'Rebill', Icon: Receipt },
];

const STATUS_OPTIONS = [
  'All',
  'Received',
  'Pending',
  'Repairing',
  'Repaired',
  'Delivered',
  'Delivered NR/NA',
  'Cancelled',
];

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
  ({ columns, data, onPress, grandTotal, totalLabel = 'Grand Total' }) => {
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
            {grandTotal !== undefined && grandTotal !== null && (
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>{totalLabel}</Text>
                <Text style={styles.grandTotalValue}>
                  {formatCurrency(grandTotal)}
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
  const [showExportModal, setShowExportModal] = useState(false);

  const cacheRef = useRef({});
  const tabChangeTimeout = useRef(null);
  const mainScrollViewRef = useRef(null);

  // Memoized Stats
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

  // All Reports Columns - Complete with all web columns
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

  // Engineer Report Columns - Match Web Exactly
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

  // Value Report Columns
  const valueColumns = useMemo(
    () => [
      { label: 'Job No', key: 'jobNo', width: 90, bold: true },
      { label: 'Name', key: 'name', width: 110 },
      { label: 'Engineer', key: 'engineer', width: 90 },
      { label: 'Received', key: 'received', width: 75 },
      { label: 'Repaired', key: 'repaired', width: 75 },
      { label: 'Delivered', key: 'delivered', width: 75 },
      { label: 'Service', key: 'service', width: 75, color: COLORS.purple },
      { label: 'Spare', key: 'spare', width: 75, color: COLORS.pink },
      {
        label: 'Total',
        key: 'total',
        width: 80,
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

  // Daily Summary Columns
  const dailyColumns = useMemo(
    () => [
      { label: 'Date', key: 'date', width: 120, bold: true },
      {
        label: 'Count',
        key: 'count',
        width: 80,
        bold: true,
        color: COLORS.primary,
      },
    ],
    [],
  );

  // Pending Report Columns
  const pendingColumns = useMemo(
    () => [
      { label: '#', key: 'index', width: 35 },
      { label: 'Job No', key: 'jobSheetNo', width: 85, bold: true },
      { label: 'Customer', key: 'customerName', width: 110 },
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
      { label: 'Phone', key: 'contact', width: 85 },
      { label: 'Date', key: 'createdAt', width: 70 },
      {
        label: 'Fault',
        key: 'fault',
        width: 100,
        render: item => item.visualIssues?.join(', ') || '-',
      },
      { label: 'Status', key: 'status', width: 75 },
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

      const filterParams = { fromDate: fd, toDate: td };
      if (sf && sf !== 'All') filterParams.status = sf;

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
        case 'dailyReceived':
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
          'Engineer',
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
              row[h] = formatDate(item.createdAt || item.savedDate);
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
            default:
              row[h] = '-';
          }
        });
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(rows);

      // Set column widths
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

  const spareReportTotal = useMemo(
    () => spareReport.reduce((sum, item) => sum + safeNum(item.amount), 0),
    [spareReport],
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

  // ─── Engineer Grouped Report Renderer ──────────────────────────────────

  const renderEngineerGroupedReport = useCallback(() => {
    // Build grouped data structure
    const groups = [];

    // Add jobs without engineer
    if (noEngineerJobs?.length) {
      groups.push({
        engineer: 'No Engineer',
        jobs: noEngineerJobs,
        count: noEngineerJobs.length,
      });
    }

    // Add each engineer's jobs
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
              {/* Engineer Header - Web-like */}
              <View style={styles.engineerHeader}>
                <Wrench size={14} color={COLORS.gray700} />
                <Text style={styles.engineerHeaderText}>
                  {group.engineer}
                  <Text style={styles.engineerJobCount}>
                    {' '}
                    ({group.count} jobs)
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

  // ─── Render Rebill Table with Full View Button ─────────────────────────

  const renderRebillTable = useCallback(() => {
    return (
      <View>
        {/* Rebill Header with Full View Button */}
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

        {/* Rebill Summary Cards */}
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

        {/* Rebill Table */}
        <OptimizedTable
          columns={rebillColumns}
          data={rebillReport}
          onPress={navigateToJobDetail}
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
        return (
          <OptimizedTable
            columns={valueColumns}
            data={valueReport}
            grandTotal={valueReportTotal}
          />
        );
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
      case 'rebill':
        return renderRebillTable();
      case 'dailyReceived':
      case 'dailyDelivered':
      case 'dailyRepaired':
        return (
          <OptimizedTable
            columns={dailyColumns}
            data={dailySummary}
            grandTotal={dailySummary.reduce((s, i) => s + safeNum(i.count), 0)}
            totalLabel="Total Days"
          />
        );
      case 'repairPending':
      case 'deliveryPending':
        return (
          <OptimizedTable
            columns={pendingColumns}
            data={pendingReport}
            onPress={navigateToJobDetail}
          />
        );
      case 'deliveredNRNA':
        return (
          <OptimizedTable
            columns={dailyColumns}
            data={deliveredNRNA}
            grandTotal={deliveredNRNA.reduce((s, i) => s + safeNum(i.count), 0)}
            totalLabel="Total NR/NA"
          />
        );
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
    valueColumns,
    valueReport,
    valueReportTotal,
    spareColumns,
    spareReport,
    spareReportTotal,
    dealerColumns,
    dealerReport,
    renderRebillTable,
    dailyColumns,
    dailySummary,
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
            {/* Header */}
            {/* <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>📊 Report Dashboard</Text>
              <Text style={styles.headerSubtitle}>Track and analyze service reports</Text>
            </View> */}

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
                      <Text style={styles.applyButtonText}>Apply</Text>
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
                <Text style={styles.excelButtonText}>Export Excel</Text>
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
            const d = `${date.getDate().toString().padStart(2, '0')}/${(
              date.getMonth() + 1
            )
              .toString()
              .padStart(2, '0')}/${date.getFullYear()}`;
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
            const d = `${date.getDate().toString().padStart(2, '0')}/${(
              date.getMonth() + 1
            )
              .toString()
              .padStart(2, '0')}/${date.getFullYear()}`;
            updateFilter('toDate', d);
          }}
          onCancel={() => setShowToPicker(false)}
        />
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  mainScrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
    paddingTop: 8,
  },

  // Header
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.gray900,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.gray500,
    marginTop: 2,
  },

  // Summary Cards
  summaryScroll: {
    flexGrow: 0,
    marginVertical: 8,
  },
  summaryContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  summaryCard: {
    minWidth: 75,
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    marginRight: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryLabel: {
    fontSize: 8,
    color: COLORS.gray500,
    marginTop: 2,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },

  // Stale Jobs Button
  staleJobsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    marginHorizontal: 10,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fcd34d',
    gap: 10,
  },
  staleJobsButtonTextContainer: {
    flex: 1,
  },
  staleJobsButtonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
  },
  staleJobsButtonSubtitle: {
    fontSize: 10,
    color: '#b45309',
    marginTop: 1,
  },

  // Filter Section
  filterSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: COLORS.gray50,
    height: 38,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 4,
    fontSize: 12,
    color: COLORS.gray800,
    marginLeft: 6,
  },
  filterToggle: {
    padding: 8,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    position: 'relative',
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterToggleActive: {
    backgroundColor: COLORS.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 99,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  filterBadgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '700',
  },
  filtersGrid: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.gray200,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 5,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 10,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  chipTextActive: {
    color: COLORS.white,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    padding: 7,
    gap: 4,
    backgroundColor: COLORS.gray50,
  },
  dateButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  dateText: {
    fontSize: 10,
    color: COLORS.gray500,
  },
  dateTextActive: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  dateSeparator: {
    color: COLORS.gray400,
    fontSize: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  applyButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontWeight: '600',
    color: COLORS.white,
    fontSize: 11,
  },
  resetButton: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: COLORS.gray600,
    fontSize: 11,
    fontWeight: '500',
  },
  excelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: 8,
    paddingVertical: 7,
    marginTop: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  excelButtonText: {
    fontWeight: '600',
    color: COLORS.success,
    fontSize: 11,
  },

  // Tabs
  tabsScroll: {
    marginHorizontal: 10,
    marginBottom: 6,
    flexGrow: 0,
  },
  tabsContent: {
    paddingVertical: 4,
    flexDirection: 'row',
    gap: 5,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 0.5,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.gray600,
    marginLeft: 4,
  },
  activeTabText: {
    color: COLORS.white,
  },

  // Report Container
  reportContainer: {
    marginHorizontal: 10,
    marginBottom: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Table Styles
  tableWrapper: {
    flex: 1,
    minHeight: 200,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray200,
    minHeight: 36,
    alignItems: 'center',
  },
  headerRow: {
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
  },
  rowEven: {
    backgroundColor: COLORS.white,
  },
  rowOdd: {
    backgroundColor: '#fafafa',
  },

  tableHeaderCellContainer: {
    paddingHorizontal: 6,
    paddingVertical: 9,
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    minHeight: 36,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  tableCellContainer: {
    paddingHorizontal: 6,
    paddingVertical: 7,
    justifyContent: 'center',
    minHeight: 34,
  },
  tableCell: {
    fontSize: 10,
    color: COLORS.gray700,
  },
  boldCell: {
    fontWeight: '700',
    color: COLORS.gray900,
  },

  // Status Chip
  statusChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusChipText: {
    fontSize: 8,
    fontWeight: '500',
  },

  // Engineer Group Styles
  engineerGroupContainer: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  engineerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    gap: 8,
  },
  engineerHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray700,
  },
  engineerJobCount: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray500,
  },
  subtotalRow: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#bbf7d0',
  },
  subtotalText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },

  // Rebill Header Styles
  rebillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f0f9ff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  rebillHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rebillHeaderTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e40af',
  },
  rebillStatsBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  rebillStatsBadgeText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#1e40af',
  },
  fullViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  fullViewButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Rebill Summary Grid
  rebillSummaryGrid: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
  },
  rebillSummaryCard: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  rebillSummaryLabel: {
    fontSize: 8,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  rebillSummaryValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },

  // Grand Total
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.primaryLight,
    borderTopWidth: 1,
    borderTopColor: '#fecaca',
  },
  grandTotalLabel: {
    fontWeight: '700',
    fontSize: 12,
    color: COLORS.gray800,
  },
  grandTotalValue: {
    fontWeight: '700',
    fontSize: 13,
    color: COLORS.primary,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray500,
  },
  emptySubText: {
    fontSize: 12,
    color: COLORS.gray400,
  },

  // Loader
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 10,
  },
  loaderText: {
    color: COLORS.gray500,
    fontSize: 13,
  },
});

export default ReportsScreen;

