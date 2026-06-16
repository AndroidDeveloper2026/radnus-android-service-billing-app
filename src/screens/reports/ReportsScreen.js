// // src/screens/reports/ReportsScreen.js
// import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   TextInput,
//   Alert,
//   RefreshControl,
//   Dimensions,
//   Platform,
//   FlatList,
// } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import DatePicker from 'react-native-date-picker';
// import RNFS from 'react-native-fs';
// import XLSX from 'xlsx';
// import Share from 'react-native-share';
// import {
//   Calendar,
//   Download,
//   Filter,
//   X,
//   ClipboardList,
//   Wrench,
//   DollarSign,
//   Store,
//   Inbox,
//   Send,
//   Hammer,
//   Clock,
//   Truck,
//   AlertTriangle,
//   Search,
//   Box,
//   CreditCard,
//   CheckCircle,
//   XCircle,
//   Receipt,
//   AlertCircle,
//   ChevronRight,
// } from 'lucide-react-native';
// import {
//   fetchEngineerWiseReport,
//   fetchValueReport,
//   fetchSpareReport,
//   fetchDealerReport,
//   fetchDailySummary,
//   fetchPendingReport,
//   fetchDeliveredNRNAReport,
//   fetchRebillReport,
// } from '../../store/slices/reportSlice';
// import { fetchJobs } from '../../store/slices/jobSlice';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// // Colors
// const COLORS = {
//   primary: '#dc2626',
//   white: '#ffffff',
//   gray50: '#f8fafc',
//   gray100: '#f1f5f9',
//   gray200: '#e2e8f0',
//   gray300: '#cbd5e1',
//   gray400: '#94a3b8',
//   gray500: '#64748b',
//   gray600: '#475569',
//   success: '#10b981',
//   error: '#ef4444',
//   warning: '#f59e0b',
// };

// // Helper Functions
// const formatDate = (value) => {
//   if (!value) return '-';
//   try {
//     const d = new Date(value);
//     if (!isNaN(d.getTime())) {
//       return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
//     }
//   } catch (e) {}
//   return '-';
// };

// const safeNum = (val) => {
//   const n = Number(val);
//   return isNaN(n) ? 0 : n;
// };

// // Constants
// const REPORT_TABS = [
//   { id: 'all', name: 'All', Icon: ClipboardList },
//   { id: 'engineer', name: 'Engineer', Icon: Wrench },
//   { id: 'value', name: 'Value', Icon: DollarSign },
//   { id: 'spare', name: 'Spare', Icon: Box },
//   { id: 'dealer', name: 'Dealer', Icon: Store },
//   { id: 'dailyReceived', name: 'Rcvd', Icon: Inbox },
//   { id: 'dailyDelivered', name: 'Del', Icon: Send },
//   { id: 'dailyRepaired', name: 'Rep', Icon: Hammer },
//   { id: 'repairPending', name: 'R Pend', Icon: Clock },
//   { id: 'deliveryPending', name: 'D Pend', Icon: Truck },
//   { id: 'deliveredNRNA', name: 'NR/NA', Icon: AlertTriangle },
//   { id: 'rebill', name: 'Rebill', Icon: Receipt },
// ];

// const STATUS_OPTIONS = ['All', 'Received', 'Pending', 'Repairing', 'Repaired', 'Delivered'];

// // Optimized Status Chip Component
// const StatusChip = React.memo(({ status }) => {
//   const colorMap = {
//     received: { bg: '#E1F5EE', text: '#0F6E56' },
//     pending: { bg: '#FAEEDA', text: '#854F0B' },
//     repairing: { bg: '#F3E8FF', text: '#6D28D9' },
//     repaired: { bg: '#E6F1FB', text: '#185FA5' },
//     delivered: { bg: '#EAF3DE', text: '#3B6D11' },
//   };
//   const colors = colorMap[status?.toLowerCase()] || { bg: '#F1EFE8', text: '#5F5E5A' };
  
//   return (
//     <View style={[styles.statusChip, { backgroundColor: colors.bg }]}>
//       <Text style={[styles.statusChipText, { color: colors.text }]} numberOfLines={1}>
//         {status || '-'}
//       </Text>
//     </View>
//   );
// });

// // Optimized Table Row - FlatList optimized
// const TableRow = React.memo(({ item, index, columns, onPress, isEven }) => (
//   <TouchableOpacity 
//     onPress={() => onPress?.(item._id || item.id)} 
//     activeOpacity={0.6} 
//     disabled={!onPress}
//     style={[styles.tableRow, isEven ? styles.rowEven : styles.rowOdd]}
//   >
//     {columns.map((column, colIndex) => {
//       let value;
//       if (column.render) {
//         value = column.render(item, index);
//       } else if (column.key === 'index') {
//         value = index + 1;
//       } else if (column.key === 'status') {
//         value = <StatusChip status={item.device?.mobileStatus || item.status} />;
//       } else {
//         value = item[column.key];
//       }
      
//       return (
//         <View 
//           key={colIndex} 
//           style={[styles.tableCellContainer, { width: column.width }]}
//         >
//           {typeof value === 'object' ? value : (
//             <Text style={[styles.tableCell, column.bold && styles.boldCell]} numberOfLines={1}>
//               {value !== undefined && value !== null ? value : '-'}
//             </Text>
//           )}
//         </View>
//       );
//     })}
//   </TouchableOpacity>
// ));

// // Optimized Horizontal Table with Virtualized List - FIXED SCROLLING
// const OptimizedTable = React.memo(({ columns, data, onPress, grandTotal }) => {
//   const totalWidth = useMemo(() => 
//     columns.reduce((sum, col) => sum + (col.width || 100), 0), 
//     [columns]
//   );

//   const renderItem = useCallback(({ item, index }) => (
//     <TableRow 
//       item={item}
//       index={index}
//       columns={columns}
//       onPress={onPress}
//       isEven={index % 2 === 0}
//     />
//   ), [columns, onPress]);

//   const keyExtractor = useCallback((item, index) => 
//     item._id || item.id || `row_${index}`, 
//     []
//   );

//   if (!data?.length) {
//     return (
//       <View style={styles.emptyContainer}>
//         <ClipboardList size={40} color={COLORS.gray300} />
//         <Text style={styles.emptyText}>No data found</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.tableWrapper}>
//       <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled>
//         <View style={{ width: totalWidth }}>
//           {/* Header */}
//           <View style={[styles.tableRow, styles.headerRow]}>
//             {columns.map((column, idx) => (
//               <View key={idx} style={[styles.tableHeaderCellContainer, { width: column.width }]}>
//                 <Text style={styles.tableHeaderCell} numberOfLines={1}>{column.label}</Text>
//               </View>
//             ))}
//           </View>
          
//           {/* Body - Using FlatList with proper scroll configuration */}
//           <FlatList
//             data={data}
//             renderItem={renderItem}
//             keyExtractor={keyExtractor}
//             initialNumToRender={20}
//             maxToRenderPerBatch={20}
//             windowSize={5}
//             removeClippedSubviews={Platform.OS === 'android'}
//             showsVerticalScrollIndicator={true}
//             scrollEnabled={true}
//             nestedScrollEnabled={true}
//             style={{ maxHeight: 400 }}
//             onScroll={null}
//           />
          
//           {grandTotal > 0 && (
//             <View style={styles.grandTotalRow}>
//               <Text style={styles.grandTotalLabel}>Grand Total</Text>
//               <Text style={styles.grandTotalValue}>₹{grandTotal.toLocaleString()}</Text>
//             </View>
//           )}
//         </View>
//       </ScrollView>
//     </View>
//   );
// });

// // Optimized Summary Cards - Horizontal FlatList
// const SummaryCards = React.memo(({ stats }) => {
//   const cards = useMemo(() => [
//     { label: 'Received', value: stats.received, color: '#3b82f6', bg: '#eff6ff', icon: Inbox },
//     { label: 'Pending', value: stats.pending, color: '#f59e0b', bg: '#fffbeb', icon: Clock },
//     { label: 'Delivered', value: stats.delivered, color: '#10b981', bg: '#f0fdf4', icon: CheckCircle },
//     { label: 'Repaired', value: stats.repaired, color: '#10b981', bg: '#f0fdf4', icon: Hammer },
//     { label: 'NR/NA', value: stats.nrna, color: '#ef4444', bg: '#fef2f2', icon: XCircle },
//     { label: 'Service', value: `₹${stats.serviceCharge.toLocaleString()}`, color: '#10b981', bg: '#f0fdf4', icon: DollarSign },
//     { label: 'Spare', value: `₹${stats.spareCharge.toLocaleString()}`, color: '#f59e0b', bg: '#fffbeb', icon: Box },
//     { label: 'Total', value: `₹${stats.totalAmount.toLocaleString()}`, color: '#fff', bg: '#dc2626', icon: CreditCard },
//   ], [stats]);

//   const renderCard = useCallback(({ item }) => {
//     const Icon = item.icon;
//     return (
//       <View style={[styles.summaryCard, { backgroundColor: item.bg }]}>
//         <Icon size={18} color={item.color} />
//         <Text style={styles.summaryLabel}>{item.label}</Text>
//         <Text style={[styles.summaryValue, { color: item.color }]} numberOfLines={1}>
//           {item.value}
//         </Text>
//       </View>
//     );
//   }, []);

//   return (
//     <FlatList
//       horizontal
//       data={cards}
//       renderItem={renderCard}
//       keyExtractor={(item, index) => index.toString()}
//       showsHorizontalScrollIndicator={false}
//       contentContainerStyle={styles.summaryContainer}
//       style={styles.summaryScroll}
//     />
//   );
// });

// // Main Component
// const ReportsScreen = () => {
//   const dispatch = useDispatch();
//   const navigation = useNavigation();
  
//   // Selectors with memoization
//   const {
//     engineerReport = [],
//     noEngineerJobs = [],
//     valueReport = [],
//     spareReport = [],
//     dealerReport = [],
//     dailySummary = [],
//     pendingReport = [],
//     deliveredNRNA = [],
//     rebillReport = [], 
//     loading: reportLoading = false,
//   } = useSelector(state => state.reports || {});
//   const { list = [], loading: jobsLoading = false } = useSelector(state => state.jobs || {});
  
//   const loading = reportLoading || jobsLoading;

//   // State
//   const [activeTab, setActiveTab] = useState('all');
//   const [filters, setFilters] = useState({
//     fromDate: '',
//     toDate: '',
//     status: 'All',
//     search: '',
//   });
//   const [showFilters, setShowFilters] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [showFromPicker, setShowFromPicker] = useState(false);
//   const [showToPicker, setShowToPicker] = useState(false);
  
//   const cacheRef = useRef({});
//   const tabChangeTimeout = useRef(null);
//   const mainScrollViewRef = useRef(null);

//   // Memoized Stats - Only recompute when list changes
//   const countStats = useMemo(() => {
//     const allJobs = list;
//     return {
//       received: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Received').length,
//       pending: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Pending').length,
//       repaired: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Repaired').length,
//       delivered: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Delivered').length,
//       nrna: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Delivered NR/NA').length,
//       serviceCharge: allJobs.reduce((s, j) => s + safeNum(j.service?.serviceCharge), 0),
//       spareCharge: allJobs.reduce((s, j) => s + safeNum(j.service?.spareCharge), 0),
//       totalAmount: allJobs.reduce((s, j) => s + safeNum(j.service?.serviceCharge) + safeNum(j.service?.spareCharge), 0),
//     };
//   }, [list]);

//   // Memoized Filtered Data
//   const filteredList = useMemo(() => {
//     if (!list.length || !filters.search.trim()) return list;
//     const q = filters.search.toLowerCase();
//     return list.filter(j => 
//       (j.customer?.name || '').toLowerCase().includes(q) ||
//       (j.customer?.contact || '').includes(q) ||
//       (j.jobSheetNo || '').toLowerCase().includes(q)
//     );
//   }, [list, filters.search]);

//   // Column Definitions - Simplified
//   const allReportsColumns = useMemo(() => [
//     { label: '#', key: 'index', width: 45 },
//     { label: 'Date', key: 'createdAt', width: 80, render: (item) => formatDate(item.createdAt) },
//     { label: 'Job No', key: 'jobSheetNo', width: 95, bold: true },
//     { label: 'Customer', key: 'customer', width: 120, render: (item) => item.customer?.name },
//     { label: 'Contact', key: 'contact', width: 95, render: (item) => item.customer?.contact },
//     { label: 'Model', key: 'model', width: 100, render: (item) => item.device?.model },
//     { label: 'Status', key: 'status', width: 85 },
//     { label: 'Engineer', key: 'engineer', width: 95, render: (item) => item.service?.engineer },
//     { label: 'Service', key: 'service', width: 75, render: (item) => `₹${safeNum(item.service?.serviceCharge)}` },
//     { label: 'Spare', key: 'spare', width: 75, render: (item) => `₹${safeNum(item.service?.spareCharge)}` },
//     { label: 'Total', key: 'total', width: 80, bold: true, render: (item) => `₹${safeNum(item.service?.serviceCharge) + safeNum(item.service?.spareCharge)}` },
//   ], []);

//   const engineerColumns = useMemo(() => [
//     { label: '#', key: 'index', width: 45 },
//     { label: 'Job No', key: 'jobSheetNo', width: 95, bold: true },
//     { label: 'Customer', key: 'customer', width: 120, render: (item) => item.customer?.name },
//     { label: 'Contact', key: 'contact', width: 95, render: (item) => item.customer?.contact },
//     { label: 'Date', key: 'createdAt', width: 80, render: (item) => formatDate(item.createdAt) },
//     { label: 'Engineer', key: 'engineer', width: 95, render: (item) => item.service?.engineer },
//     { label: 'Status', key: 'status', width: 85 },
//   ], []);

//   const valueColumns = useMemo(() => [
//     { label: 'Job No', key: 'jobNo', width: 95, bold: true },
//     { label: 'Name', key: 'name', width: 120 },
//     { label: 'Engineer', key: 'engineer', width: 95 },
//     { label: 'Received', key: 'received', width: 85, render: (item) => formatDate(item.received) },
//     { label: 'Repaired', key: 'repaired', width: 85, render: (item) => formatDate(item.repaired) },
//     { label: 'Delivered', key: 'delivered', width: 85, render: (item) => formatDate(item.delivered) },
//     { label: 'Service', key: 'service', width: 80, render: (item) => `₹${safeNum(item.service)}` },
//     { label: 'Spare', key: 'spare', width: 80, render: (item) => `₹${safeNum(item.spare)}` },
//     { label: 'Total', key: 'total', width: 85, bold: true, render: (item) => `₹${safeNum(item.total)}` },
//   ], []);

//   const spareColumns = useMemo(() => [
//     { label: '#', key: 'index', width: 45 },
//     { label: 'Job No', key: 'jobSheet', width: 95, bold: true },
//     { label: 'Spare Part', key: 'spare', width: 180 },
//     { label: 'Qty', key: 'qty', width: 55, render: (item) => safeNum(item.qty) },
//     { label: 'Rate', key: 'rate', width: 80, render: (item) => `₹${safeNum(item.rate)}` },
//     { label: 'Amount', key: 'amount', width: 90, bold: true, render: (item) => `₹${safeNum(item.amount)}` },
//   ], []);

//   const dealerColumns = useMemo(() => [
//     { label: '#', key: 'index', width: 45 },
//     { label: 'Dealer', key: 'dealer', width: 100, render: (item) => item.service?.dealer },
//     { label: 'Customer', key: 'customer', width: 120, render: (item) => item.customer?.name },
//     { label: 'Contact', key: 'contact', width: 100, render: (item) => item.customer?.contact },
//     { label: 'Date', key: 'createdAt', width: 85, render: (item) => formatDate(item.createdAt) },
//     { label: 'Engineer', key: 'engineer', width: 95, render: (item) => item.service?.engineer },
//     { label: 'Status', key: 'status', width: 85 },
//   ], []);

//   const pendingColumns = useMemo(() => [
//     { label: '#', key: 'index', width: 45 },
//     { label: 'Job No', key: 'jobSheetNo', width: 95, bold: true },
//     { label: 'Customer', key: 'customer', width: 130, render: (item) => item.customer?.name },
//     { label: 'Phone', key: 'contact', width: 100, render: (item) => item.customer?.contact },
//     { label: 'Date', key: 'createdAt', width: 85, render: (item) => formatDate(item.createdAt) },
//     { label: 'Status', key: 'status', width: 85 },
//   ], []);

//   const dailyColumns = useMemo(() => [
//     { label: 'Date', key: 'date', width: 120 },
//     { label: 'Count', key: 'count', width: 80, render: (item) => safeNum(item.count) },
//   ], []);


//   // rebill columns
//   // In ReportsScreen.js, add new column definitions:

// const rebillColumns = useMemo(() => [
//   { label: '#', key: 'index', width: 45 },
//   { label: 'Job No', key: 'jobSheetNo', width: 95, bold: true },
//   { label: 'Customer', key: 'customer', width: 120, render: (item) => item.customer?.name },
//   { label: 'Contact', key: 'contact', width: 95, render: (item) => item.customer?.contact },
//   { label: 'Model', key: 'model', width: 100, render: (item) => item.device?.model },
//   { label: 'Status', key: 'status', width: 85 },
//   { label: 'Rebills', key: 'rebills', width: 80, render: (item) => item.rebillHistory?.length || 0 },
//   { label: 'Total', key: 'total', width: 85, bold: true, render: (item) => {
//     const histTotal = item.rebillHistory?.reduce((s, r) => s + safeNum(r.serviceCharge) + safeNum(r.spareCharge), 0) || 0;
//     const currTotal = safeNum(item.service?.serviceCharge) + safeNum(item.service?.spareCharge);
//     return `₹${(histTotal + currTotal).toLocaleString()}`;
//   }},
// ], []);

//   // Calculated totals
//   const valueReportTotal = useMemo(() => 
//     valueReport.reduce((sum, item) => sum + safeNum(item.total), 0), 
//     [valueReport]
//   );
  
//   const spareReportTotal = useMemo(() => 
//     spareReport.reduce((sum, item) => sum + safeNum(item.amount), 0), 
//     [spareReport]
//   );

//   // Load report function - Optimized with caching
//   const loadReport = useCallback((tabId, fd, td, sf) => {
//     const cacheKey = `${tabId}_${fd}_${td}_${sf}`;
    
//     if (cacheRef.current[cacheKey] && Date.now() - cacheRef.current[cacheKey].timestamp < 3000) {
//       return;
//     }
    
//     cacheRef.current[cacheKey] = { timestamp: Date.now() };
    
//     const filterParams = { fromDate: fd, toDate: td };
//     if (sf !== 'All') filterParams.status = sf;
    
//     switch (tabId) {
//       case 'engineer':
//         dispatch(fetchEngineerWiseReport(filterParams));
//         break;
//       case 'value':
//         dispatch(fetchValueReport(filterParams));
//         break;
//       case 'spare':
//         dispatch(fetchSpareReport(filterParams));
//         break;
//       case 'dealer':
//         dispatch(fetchDealerReport(filterParams));
//         break;
//       case 'all':
//         dispatch(fetchJobs(filterParams));
//         break;
//       case 'rebill':  // ← Add this case
//       dispatch(fetchRebillReport(filterParams));
//       break;
//       case 'dailyReceived':
//         dispatch(fetchDailySummary({ type: 'received', fromDate: fd, toDate: td }));
//         break;
//       case 'dailyDelivered':
//         dispatch(fetchDailySummary({ type: 'delivered', fromDate: fd, toDate: td }));
//         break;
//       case 'dailyRepaired':
//         dispatch(fetchDailySummary({ type: 'repaired', fromDate: fd, toDate: td }));
//         break;
//       case 'repairPending':
//         dispatch(fetchPendingReport({ type: 'repairPending', fromDate: fd, toDate: td }));
//         break;
//       case 'deliveryPending':
//         dispatch(fetchPendingReport({ type: 'deliveryPending', fromDate: fd, toDate: td }));
//         break;
//       case 'deliveredNRNA':
//         dispatch(fetchDeliveredNRNAReport({ fromDate: fd, toDate: td }));
//         break;
//       default:
//         break;
//     }
//   }, [dispatch]);

//   // Handle tab press with debounce
//   const handleTabPress = useCallback((tabId) => {
//     if (tabChangeTimeout.current) {
//       clearTimeout(tabChangeTimeout.current);
//     }
    
//     tabChangeTimeout.current = setTimeout(() => {
//       setActiveTab(tabId);
//       loadReport(tabId, filters.fromDate, filters.toDate, filters.status);
//       // Scroll to top when changing tabs
//       if (mainScrollViewRef.current) {
//         mainScrollViewRef.current.scrollTo({ y: 0, animated: true });
//       }
//     }, 150);
//   }, [loadReport, filters]);

//   // Apply filter
//   const handleApplyFilter = useCallback(() => {
//     loadReport(activeTab, filters.fromDate, filters.toDate, filters.status);
//     setShowFilters(false);
//     // Scroll to top after applying filters
//     setTimeout(() => {
//       if (mainScrollViewRef.current) {
//         mainScrollViewRef.current.scrollTo({ y: 0, animated: true });
//       }
//     }, 100);
//   }, [loadReport, activeTab, filters]);

//   // Reset filters
//   const resetFilters = useCallback(() => {
//     setFilters({
//       fromDate: '',
//       toDate: '',
//       status: 'All',
//       search: '',
//     });
//     loadReport(activeTab, '', '', 'All');
//   }, [loadReport, activeTab]);

//   // Refresh handler
//   const handleRefresh = useCallback(() => {
//     setRefreshing(true);
//     loadReport(activeTab, filters.fromDate, filters.toDate, filters.status);
//     setTimeout(() => setRefreshing(false), 500);
//   }, [loadReport, activeTab, filters]);

//   // Navigate to job detail
//   const navigateToJobDetail = useCallback((jobId) => {
//     if (jobId) {
//       navigation.navigate('JobSheet', {
//         screen: 'JobDetail',
//         params: { jobId, id: jobId }
//       });
//     }
//   }, [navigation]);

//   // Navigate to stale jobs
//   const navigateToStaleJobs = useCallback(() => {
//     navigation.navigate('StaleJobs');
//   }, [navigation]);

//   // Update filter
//   const updateFilter = useCallback((key, value) => {
//     setFilters(prev => ({ ...prev, [key]: value }));
//   }, []);

//   // Active filter count
//   const activeFilterCount = useMemo(() => {
//     let count = 0;
//     if (filters.fromDate) count++;
//     if (filters.toDate) count++;
//     if (filters.status !== 'All') count++;
//     return count;
//   }, [filters]);

//   // Export to Excel
//   const handleExportToExcel = useCallback(async () => {
//     let exportData = [];
//     let filename = '';

//     switch (activeTab) {
//       case 'all':
//         exportData = filteredList;
//         filename = 'All_Reports';
//         break;
//       case 'engineer':
//         exportData = [...noEngineerJobs, ...engineerReport.flatMap(e => e.jobs || [])];
//         filename = 'Engineer_Wise_Report';
//         break;
//       case 'value':
//         exportData = valueReport;
//         filename = 'Value_Report';
//         break;
//       case 'spare':
//         exportData = spareReport;
//         filename = 'Spare_Parts_Report';
//         break;
//       case 'dealer':
//         exportData = dealerReport;
//         filename = 'Dealer_Report';
//         break;
//       case 'rebill':  // ← Add this case
//         exportData = rebillReport;
//         filename = 'Rebill_Report';
//         break;
//       default:
//         exportData = filteredList;
//         filename = 'Reports';
//     }

//     if (!exportData.length) {
//       Alert.alert('No Data', 'There is no data to export');
//       return;
//     }

//     try {
//       const rows = exportData.slice(0, 2000).map((item, idx) => ({
//         'SL No': idx + 1,
//         'Job No': item.jobSheetNo || item.jobNo || '-',
//         'Customer': item.customer?.name || item.customerName || '-',
//         'Contact': item.customer?.contact || '-',
//         'Status': item.device?.mobileStatus || item.status || '-',
//         'Date': formatDate(item.createdAt),
//         'Service': safeNum(item.service?.serviceCharge),
//         'Spare': safeNum(item.service?.spareCharge),
//         'Total': safeNum(item.service?.serviceCharge) + safeNum(item.service?.spareCharge),
//       }));

//       const ws = XLSX.utils.json_to_sheet(rows);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, filename);
      
//       const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
//       const timestamp = Date.now();
//       const filePath = `${RNFS.CachesDirectoryPath}/Report_${timestamp}.xlsx`;
//       await RNFS.writeFile(filePath, wbout, 'base64');
      
//       Alert.alert('Success', 'Report exported successfully', [
//         { text: 'OK' },
//         {
//           text: 'Share',
//           onPress: async () => {
//             await Share.open({
//               url: `file://${filePath}`,
//               type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//             });
//           }
//         }
//       ]);
      
//       setTimeout(() => RNFS.unlink(filePath).catch(() => {}), 60000);
//     } catch (error) {
//       Alert.alert('Export Failed', 'Could not export file');
//     }
//   }, [activeTab, filteredList, valueReport, spareReport, dealerReport, engineerReport, noEngineerJobs, rebillReport]);

//   // Engineer report data
//   const engineerReportData = useMemo(() => {
//     const allJobs = [];
//     if (noEngineerJobs?.length) allJobs.push(...noEngineerJobs);
//     if (engineerReport?.length) {
//       engineerReport.forEach(eng => {
//         if (eng.jobs?.length) allJobs.push(...eng.jobs);
//       });
//     }
//     return allJobs;
//   }, [engineerReport, noEngineerJobs]);

//   // Initial load
//   useFocusEffect(
//     useCallback(() => {
//       loadReport('all', '', '', 'All');
//       return () => {
//         if (tabChangeTimeout.current) {
//           clearTimeout(tabChangeTimeout.current);
//         }
//       };
//     }, [loadReport])
//   );

//   // Render current table based on active tab
//   const renderTable = useCallback(() => {
//     switch (activeTab) {
//       case 'all':
//         return <OptimizedTable columns={allReportsColumns} data={filteredList} onPress={navigateToJobDetail} />;
//       case 'engineer':
//         return <OptimizedTable columns={engineerColumns} data={engineerReportData} onPress={navigateToJobDetail} />;
//       case 'value':
//         return <OptimizedTable columns={valueColumns} data={valueReport} grandTotal={valueReportTotal} />;
//       case 'spare':
//         return <OptimizedTable columns={spareColumns} data={spareReport} grandTotal={spareReportTotal} />;
//       case 'dealer':
//         return <OptimizedTable columns={dealerColumns} data={dealerReport} onPress={navigateToJobDetail} />;
//       case 'rebill':  // ← Add this case
//       return <OptimizedTable columns={rebillColumns} data={rebillReport} onPress={navigateToJobDetail} />;
//       case 'dailyReceived':
//       case 'dailyDelivered':
//       case 'dailyRepaired':
//         return <OptimizedTable columns={dailyColumns} data={dailySummary} />;
//       case 'repairPending':
//       case 'deliveryPending':
//         return <OptimizedTable columns={pendingColumns} data={pendingReport} onPress={navigateToJobDetail} />;
//       case 'deliveredNRNA':
//         return <OptimizedTable columns={pendingColumns} data={deliveredNRNA} onPress={navigateToJobDetail} />;
//       default:
//         return <OptimizedTable columns={allReportsColumns} data={filteredList} onPress={navigateToJobDetail} />;
//     }
//   }, [activeTab, allReportsColumns, filteredList, navigateToJobDetail, engineerColumns, engineerReportData, valueColumns, valueReport, valueReportTotal, spareColumns, spareReport, spareReportTotal, dealerColumns, dealerReport, dailyColumns, dailySummary, pendingColumns, pendingReport, deliveredNRNA,rebillColumns,rebillReport]);

//   return (
//     <View style={styles.container}>
//       <ScrollView
//         ref={mainScrollViewRef}
//         style={styles.mainScrollView}
//         showsVerticalScrollIndicator={true}
//         refreshControl={
//           <RefreshControl 
//             refreshing={refreshing} 
//             onRefresh={handleRefresh} 
//             colors={[COLORS.primary]} 
//             tintColor={COLORS.primary} 
//           />
//         }
//         nestedScrollEnabled={true}
//         scrollEventThrottle={16}
//       >
//         <View style={styles.contentContainer}>
//           <SummaryCards stats={countStats} />
          
//           {/* Stale Jobs Button */}
//           <TouchableOpacity 
//             style={styles.staleJobsButton}
//             onPress={navigateToStaleJobs}
//             // activeOpacity={0.8}
//           >
//             <AlertCircle size={18} color="#f59e0b" />
//             <View style={styles.staleJobsButtonTextContainer}>
//               <Text style={styles.staleJobsButtonTitle}>View Stale Jobs</Text>
//               <Text style={styles.staleJobsButtonSubtitle}>Jobs pending beyond threshold</Text>
//             </View>
//             <ChevronRight size={18} color="#f59e0b" />
//           </TouchableOpacity>
          
//           {/* Filter Section */}
//           <View style={styles.filterSection}>
//             <View style={styles.searchRow}>
//               <View style={styles.searchInputContainer}>
//                 <Search size={14} color={COLORS.gray400} />
//                 <TextInput
//                   style={styles.searchInput}
//                   placeholder="Search..."
//                   placeholderTextColor={COLORS.gray400}
//                   value={filters.search}
//                   onChangeText={(value) => updateFilter('search', value)}
//                 />
//                 {filters.search.length > 0 && (
//                   <TouchableOpacity onPress={() => updateFilter('search', '')}>
//                     <X size={12} color={COLORS.gray400} />
//                   </TouchableOpacity>
//                 )}
//               </View>
//               <TouchableOpacity
//                 style={[styles.filterToggle, activeFilterCount > 0 && styles.filterToggleActive]}
//                 onPress={() => setShowFilters(!showFilters)}
//               >
//                 <Filter size={16} color={activeFilterCount > 0 ? COLORS.white : COLORS.primary} />
//                 {activeFilterCount > 0 && (
//                   <View style={styles.filterBadge}>
//                     <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
//                   </View>
//                 )}
//               </TouchableOpacity>
//             </View>

//             {showFilters && (
//               <View style={styles.filtersGrid}>
//                 <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                   {STATUS_OPTIONS.map(status => (
//                     <TouchableOpacity
//                       key={status}
//                       style={[styles.chip, filters.status === status && styles.chipActive]}
//                       onPress={() => updateFilter('status', status)}
//                     >
//                       <Text style={[styles.chipText, filters.status === status && styles.chipTextActive]}>{status}</Text>
//                     </TouchableOpacity>
//                   ))}
//                 </ScrollView>

//                 <View style={styles.dateRangeContainer}>
//                   <TouchableOpacity
//                     style={[styles.dateButton, filters.fromDate && styles.dateButtonActive]}
//                     onPress={() => setShowFromPicker(true)}
//                   >
//                     <Calendar size={13} color={filters.fromDate ? COLORS.primary : COLORS.gray500} />
//                     <Text style={[styles.dateText, filters.fromDate && styles.dateTextActive]}>
//                       {filters.fromDate || 'From'}
//                     </Text>
//                   </TouchableOpacity>
//                   <Text style={styles.dateSeparator}>→</Text>
//                   <TouchableOpacity
//                     style={[styles.dateButton, filters.toDate && styles.dateButtonActive]}
//                     onPress={() => setShowToPicker(true)}
//                   >
//                     <Calendar size={13} color={filters.toDate ? COLORS.primary : COLORS.gray500} />
//                     <Text style={[styles.dateText, filters.toDate && styles.dateTextActive]}>
//                       {filters.toDate || 'To'}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>

//                 <View style={styles.actionButtons}>
//                   <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
//                     <Text style={styles.applyButtonText}>Apply</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
//                     <Text style={styles.resetButtonText}>Reset</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             )}

//             <TouchableOpacity style={styles.excelButton} onPress={handleExportToExcel}>
//               <Download size={14} color={COLORS.success} />
//               <Text style={styles.excelButtonText}>Export</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Tabs */}
//           <ScrollView 
//             horizontal 
//             showsHorizontalScrollIndicator={false} 
//             style={styles.tabsScroll}
//             contentContainerStyle={styles.tabsContent}
//           >
//             {REPORT_TABS.map(tab => (
//               <TouchableOpacity 
//                 key={tab.id}
//                 style={[styles.tab, activeTab === tab.id && styles.activeTab]} 
//                 onPress={() => handleTabPress(tab.id)}
//                 activeOpacity={0.7}
//               >
//                 <tab.Icon size={12} color={activeTab === tab.id ? COLORS.white : COLORS.gray600} />
//                 <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
//                   {tab.name}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>

//           {/* Report Content */}
//           <View style={styles.reportContainer}>
//             {loading ? (
//               <View style={styles.loaderContainer}>
//                 <ActivityIndicator size="large" color={COLORS.primary} />
//                 <Text style={styles.loaderText}>Loading...</Text>
//               </View>
//             ) : (
//               renderTable()
//             )}
//           </View>
//         </View>
//       </ScrollView>

//       {/* Date Pickers */}
//       <DatePicker
//         modal
//         open={showFromPicker}
//         date={new Date()}
//         mode="date"
//         onConfirm={(date) => {
//           setShowFromPicker(false);
//           updateFilter('fromDate', `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`);
//         }}
//         onCancel={() => setShowFromPicker(false)}
//       />
//       <DatePicker
//         modal
//         open={showToPicker}
//         date={new Date()}
//         mode="date"
//         onConfirm={(date) => {
//           setShowToPicker(false);
//           updateFilter('toDate', `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`);
//         }}
//         onCancel={() => setShowToPicker(false)}
//       />
//     </View>
//   );
// };

// // Optimized Styles
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f8fafc' },
//   mainScrollView: { flex: 1 },
//   contentContainer: { paddingBottom: 20 },
  
//   tableWrapper: { flex: 1, minHeight: 200 },
//   tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0', minHeight: 38 },
//   headerRow: { backgroundColor: '#dc2626' },
//   rowEven: { backgroundColor: '#ffffff' },
//   rowOdd: { backgroundColor: '#f8fafc' },
  
//   tableHeaderCellContainer: {
//     paddingHorizontal: 6,
//     paddingVertical: 8,
//     justifyContent: 'center',
//     backgroundColor: '#dc2626',
//   },
//   tableHeaderCell: {
//     fontSize: 10,
//     fontWeight: '700',
//     color: '#ffffff',
//     textAlign: 'center',
//   },
//   tableCellContainer: {
//     paddingHorizontal: 6,
//     paddingVertical: 8,
//     justifyContent: 'center',
//   },
//   tableCell: { fontSize: 10, color: '#1e293b' },
//   boldCell: { fontWeight: '700', color: '#0f172a' },
  
//   summaryScroll: { flexGrow: 0 },
//   summaryContainer: { paddingHorizontal: 10, paddingVertical: 6, gap: 6 },
//   summaryCard: { 
//     minWidth: 75, 
//     borderRadius: 8, 
//     padding: 6, 
//     alignItems: 'center',
//     marginRight: 6,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.03,
//     shadowRadius: 1,
//     elevation: 0.5,
//   },
//   summaryLabel: { fontSize: 8, color: '#64748b', marginTop: 3 },
//   summaryValue: { fontSize: 11, fontWeight: '700', marginTop: 3 },
  
//   staleJobsButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fffbeb',
//     marginHorizontal: 10,
//     marginBottom: 8,
//     padding: 10,
//     borderRadius: 10,
//     borderWidth: 0.5,
//     borderColor: '#fcd34d',
//     gap: 10,
//   },
//   staleJobsButtonTextContainer: { flex: 1 },
//   staleJobsButtonTitle: { fontSize: 13, fontWeight: '700', color: '#92400e' },
//   staleJobsButtonSubtitle: { fontSize: 10, color: '#b45309', marginTop: 1 },
  
//   filterSection: { backgroundColor: '#ffffff', borderRadius: 10, padding: 8, marginHorizontal: 10, marginBottom: 8 },
//   searchRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
//   searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 8, backgroundColor: '#f8fafc' },
//   searchInput: { flex: 1, paddingVertical: 6, fontSize: 12, color: '#1e293b' },
//   filterToggle: { padding: 6, backgroundColor: '#f1f5f9', borderRadius: 8, position: 'relative' },
//   filterToggleActive: { backgroundColor: '#dc2626' },
//   filterBadge: { position: 'absolute', top: -3, right: -3, backgroundColor: '#ef4444', borderRadius: 99, width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
//   filterBadgeText: { color: '#ffffff', fontSize: 8, fontWeight: '700' },
//   filtersGrid: { gap: 8, paddingTop: 6, borderTopWidth: 0.5, borderTopColor: '#f1f5f9' },
//   chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, marginRight: 5, backgroundColor: '#f1f5f9', borderWidth: 0.5, borderColor: '#e2e8f0' },
//   chipActive: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
//   chipText: { fontSize: 10, color: '#64748b' },
//   chipTextActive: { color: '#ffffff' },
//   dateRangeContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   dateButton: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0', borderRadius: 8, padding: 6, gap: 3, backgroundColor: '#f8fafc' },
//   dateButtonActive: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
//   dateText: { fontSize: 10, color: '#64748b' },
//   dateTextActive: { color: '#dc2626', fontWeight: '500' },
//   dateSeparator: { color: '#94a3b8', fontSize: 10 },
//   actionButtons: { flexDirection: 'row', gap: 6, marginTop: 4 },
//   applyButton: { flex: 1, backgroundColor: '#dc2626', borderRadius: 8, padding: 6, alignItems: 'center' },
//   applyButtonText: { fontWeight: '600', color: '#ffffff', fontSize: 11 },
//   resetButton: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 8, padding: 6, alignItems: 'center' },
//   resetButtonText: { color: '#64748b', fontSize: 11 },
//   excelButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdf4', borderRadius: 8, paddingVertical: 6, marginTop: 6, gap: 5 },
//   excelButtonText: { fontWeight: '500', color: '#10b981', fontSize: 11 },
  
//   tabsScroll: { marginHorizontal: 10, marginBottom: 6, flexGrow: 0 },
//   tabsContent: { paddingVertical: 3, flexDirection: 'row', gap: 5 },
//   tab: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 0.5, borderColor: '#e2e8f0' },
//   activeTab: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
//   tabText: { fontSize: 10, fontWeight: '500', color: '#64748b', marginLeft: 3 },
//   activeTabText: { color: '#ffffff' },
  
//   reportContainer: { marginHorizontal: 10, marginBottom: 10, backgroundColor: '#ffffff', borderRadius: 10, overflow: 'hidden', minHeight: 200 },
  
//   statusChip: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
//   statusChipText: { fontSize: 8, fontWeight: '500' },
  
//   grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, backgroundColor: '#fef2f2', borderTopWidth: 0.5, borderTopColor: '#fecaca' },
//   grandTotalLabel: { fontWeight: '600', fontSize: 11, color: '#1e293b' },
//   grandTotalValue: { fontWeight: '700', fontSize: 12, color: '#dc2626' },
  
//   emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 6 },
//   emptyText: { fontSize: 12, color: '#64748b' },
  
//   loaderContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 8 },
//   loaderText: { color: '#64748b', fontSize: 12 },
// });

// export default ReportsScreen;

//---------------------------------

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
} from '../../store/slices/reportSlice';
import { fetchJobs } from '../../store/slices/jobSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const STATUS_OPTIONS = ['All', 'Received', 'Pending', 'Repairing', 'Repaired', 'Delivered'];

// Optimized Status Chip Component
const StatusChip = React.memo(({ status }) => {
  const colorMap = {
    received: { bg: '#E1F5EE', text: '#0F6E56' },
    pending: { bg: '#FAEEDA', text: '#854F0B' },
    repairing: { bg: '#F3E8FF', text: '#6D28D9' },
    repaired: { bg: '#E6F1FB', text: '#185FA5' },
    delivered: { bg: '#EAF3DE', text: '#3B6D11' },
  };
  const colors = colorMap[status?.toLowerCase()] || { bg: '#F1EFE8', text: '#5F5E5A' };
  
  return (
    <View style={[styles.statusChip, { backgroundColor: colors.bg }]}>
      <Text style={[styles.statusChipText, { color: colors.text }]} numberOfLines={1}>
        {status || '-'}
      </Text>
    </View>
  );
});

// Optimized Table Row - FlatList optimized
const TableRow = React.memo(({ item, index, columns, onPress, isEven }) => (
  <TouchableOpacity 
    onPress={() => onPress?.(item._id || item.id)} 
    activeOpacity={0.6} 
    disabled={!onPress}
    style={[styles.tableRow, isEven ? styles.rowEven : styles.rowOdd]}
  >
    {columns.map((column, colIndex) => {
      let value;
      if (column.render) {
        value = column.render(item, index);
      } else if (column.key === 'index') {
        value = index + 1;
      } else if (column.key === 'status') {
        value = <StatusChip status={item.device?.mobileStatus || item.status} />;
      } else {
        value = item[column.key];
      }
      
      return (
        <View 
          key={colIndex} 
          style={[styles.tableCellContainer, { width: column.width }]}
        >
          {typeof value === 'object' ? value : (
            <Text style={[styles.tableCell, column.bold && styles.boldCell]} numberOfLines={1}>
              {value !== undefined && value !== null ? value : '-'}
            </Text>
          )}
        </View>
      );
    })}
  </TouchableOpacity>
));

// Optimized Horizontal Table with Virtualized List
const OptimizedTable = React.memo(({ columns, data, onPress, grandTotal }) => {
  const totalWidth = useMemo(() => 
    columns.reduce((sum, col) => sum + (col.width || 100), 0), 
    [columns]
  );

  const renderItem = useCallback(({ item, index }) => (
    <TableRow 
      item={item}
      index={index}
      columns={columns}
      onPress={onPress}
      isEven={index % 2 === 0}
    />
  ), [columns, onPress]);

  const keyExtractor = useCallback((item, index) => 
    item._id || item.id || `row_${index}`, 
    []
  );

  if (!data?.length) {
    return (
      <View style={styles.emptyContainer}>
        <ClipboardList size={40} color={COLORS.gray300} />
        <Text style={styles.emptyText}>No data found</Text>
      </View>
    );
  }

  return (
    <View style={styles.tableWrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled>
        <View style={{ width: totalWidth }}>
          {/* Header */}
          <View style={[styles.tableRow, styles.headerRow]}>
            {columns.map((column, idx) => (
              <View key={idx} style={[styles.tableHeaderCellContainer, { width: column.width }]}>
                <Text style={styles.tableHeaderCell} numberOfLines={1}>{column.label}</Text>
              </View>
            ))}
          </View>
          
          {/* Body - Using FlatList with proper scroll configuration */}
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={5}
            removeClippedSubviews={Platform.OS === 'android'}
            showsVerticalScrollIndicator={true}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            style={{ maxHeight: 400 }}
            onScroll={null}
          />
          
          {grandTotal > 0 && (
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

// Optimized Summary Cards - Horizontal FlatList
const SummaryCards = React.memo(({ stats }) => {
  const cards = useMemo(() => [
    { label: 'Received', value: stats.received, color: '#3b82f6', bg: '#eff6ff', icon: Inbox },
    { label: 'Pending', value: stats.pending, color: '#f59e0b', bg: '#fffbeb', icon: Clock },
    { label: 'Delivered', value: stats.delivered, color: '#10b981', bg: '#f0fdf4', icon: CheckCircle },
    { label: 'Repaired', value: stats.repaired, color: '#10b981', bg: '#f0fdf4', icon: Hammer },
    { label: 'NR/NA', value: stats.nrna, color: '#ef4444', bg: '#fef2f2', icon: XCircle },
    { label: 'Service', value: `₹${stats.serviceCharge.toLocaleString()}`, color: '#10b981', bg: '#f0fdf4', icon: DollarSign },
    { label: 'Spare', value: `₹${stats.spareCharge.toLocaleString()}`, color: '#f59e0b', bg: '#fffbeb', icon: Box },
    { label: 'Total', value: `₹${stats.totalAmount.toLocaleString()}`, color: '#fff', bg: '#dc2626', icon: CreditCard },
  ], [stats]);

  const renderCard = useCallback(({ item }) => {
    const Icon = item.icon;
    return (
      <View style={[styles.summaryCard, { backgroundColor: item.bg }]}>
        <Icon size={18} color={item.color} />
        <Text style={styles.summaryLabel}>{item.label}</Text>
        <Text style={[styles.summaryValue, { color: item.color }]} numberOfLines={1}>
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

// Main Component
const ReportsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  // Selectors with memoization
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

  // Memoized Stats - Only recompute when list changes
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
    if (!list.length || !filters.search.trim()) return list;
    const q = filters.search.toLowerCase();
    return list.filter(j => 
      (j.customer?.name || '').toLowerCase().includes(q) ||
      (j.customer?.contact || '').includes(q) ||
      (j.jobSheetNo || '').toLowerCase().includes(q)
    );
  }, [list, filters.search]);

  // Column Definitions - Simplified
  const allReportsColumns = useMemo(() => [
    { label: '#', key: 'index', width: 45 },
    { label: 'Date', key: 'createdAt', width: 80, render: (item) => formatDate(item.createdAt) },
    { label: 'Job No', key: 'jobSheetNo', width: 95, bold: true },
    { label: 'Customer', key: 'customer', width: 120, render: (item) => item.customer?.name },
    { label: 'Contact', key: 'contact', width: 95, render: (item) => item.customer?.contact },
    { label: 'Model', key: 'model', width: 100, render: (item) => item.device?.model },
    { label: 'Status', key: 'status', width: 85 },
    { label: 'Engineer', key: 'engineer', width: 95, render: (item) => item.service?.engineer },
    { label: 'Service', key: 'service', width: 75, render: (item) => `₹${safeNum(item.service?.serviceCharge)}` },
    { label: 'Spare', key: 'spare', width: 75, render: (item) => `₹${safeNum(item.service?.spareCharge)}` },
    { label: 'Total', key: 'total', width: 80, bold: true, render: (item) => `₹${safeNum(item.service?.serviceCharge) + safeNum(item.service?.spareCharge)}` },
  ], []);

  const engineerColumns = useMemo(() => [
    { label: '#', key: 'index', width: 45 },
    { label: 'Job No', key: 'jobSheetNo', width: 95, bold: true },
    { label: 'Customer', key: 'customer', width: 120, render: (item) => item.customer?.name },
    { label: 'Contact', key: 'contact', width: 95, render: (item) => item.customer?.contact },
    { label: 'Date', key: 'createdAt', width: 80, render: (item) => formatDate(item.createdAt) },
    { label: 'Engineer', key: 'engineer', width: 95, render: (item) => item.service?.engineer },
    { label: 'Status', key: 'status', width: 85 },
  ], []);

  const valueColumns = useMemo(() => [
    { label: 'Job No', key: 'jobNo', width: 95, bold: true },
    { label: 'Name', key: 'name', width: 120 },
    { label: 'Engineer', key: 'engineer', width: 95 },
    { label: 'Received', key: 'received', width: 85, render: (item) => formatDate(item.received) },
    { label: 'Repaired', key: 'repaired', width: 85, render: (item) => formatDate(item.repaired) },
    { label: 'Delivered', key: 'delivered', width: 85, render: (item) => formatDate(item.delivered) },
    { label: 'Service', key: 'service', width: 80, render: (item) => `₹${safeNum(item.service)}` },
    { label: 'Spare', key: 'spare', width: 80, render: (item) => `₹${safeNum(item.spare)}` },
    { label: 'Total', key: 'total', width: 85, bold: true, render: (item) => `₹${safeNum(item.total)}` },
  ], []);

  const spareColumns = useMemo(() => [
    { label: '#', key: 'index', width: 45 },
    { label: 'Job No', key: 'jobSheet', width: 95, bold: true },
    { label: 'Spare Part', key: 'spare', width: 180 },
    { label: 'Qty', key: 'qty', width: 55, render: (item) => safeNum(item.qty) },
    { label: 'Rate', key: 'rate', width: 80, render: (item) => `₹${safeNum(item.rate)}` },
    { label: 'Amount', key: 'amount', width: 90, bold: true, render: (item) => `₹${safeNum(item.amount)}` },
  ], []);

  const dealerColumns = useMemo(() => [
    { label: '#', key: 'index', width: 45 },
    { label: 'Dealer', key: 'dealer', width: 100, render: (item) => item.service?.dealer },
    { label: 'Customer', key: 'customer', width: 120, render: (item) => item.customer?.name },
    { label: 'Contact', key: 'contact', width: 100, render: (item) => item.customer?.contact },
    { label: 'Date', key: 'createdAt', width: 85, render: (item) => formatDate(item.createdAt) },
    { label: 'Engineer', key: 'engineer', width: 95, render: (item) => item.service?.engineer },
    { label: 'Status', key: 'status', width: 85 },
  ], []);

  const pendingColumns = useMemo(() => [
    { label: '#', key: 'index', width: 45 },
    { label: 'Job No', key: 'jobSheetNo', width: 95, bold: true },
    { label: 'Customer', key: 'customer', width: 130, render: (item) => item.customer?.name },
    { label: 'Phone', key: 'contact', width: 100, render: (item) => item.customer?.contact },
    { label: 'Date', key: 'createdAt', width: 85, render: (item) => formatDate(item.createdAt) },
    { label: 'Status', key: 'status', width: 85 },
  ], []);

  const dailyColumns = useMemo(() => [
    { label: 'Date', key: 'date', width: 120 },
    { label: 'Count', key: 'count', width: 80, render: (item) => safeNum(item.count) },
  ], []);

  // Calculated totals
  const valueReportTotal = useMemo(() => 
    valueReport.reduce((sum, item) => sum + safeNum(item.total), 0), 
    [valueReport]
  );
  
  const spareReportTotal = useMemo(() => 
    spareReport.reduce((sum, item) => sum + safeNum(item.amount), 0), 
    [spareReport]
  );

  // Load report function - Optimized with caching
  const loadReport = useCallback((tabId, fd, td, sf) => {
    const cacheKey = `${tabId}_${fd}_${td}_${sf}`;
    
    if (cacheRef.current[cacheKey] && Date.now() - cacheRef.current[cacheKey].timestamp < 3000) {
      return;
    }
    
    cacheRef.current[cacheKey] = { timestamp: Date.now() };
    
    const filterParams = { fromDate: fd, toDate: td };
    if (sf !== 'All') filterParams.status = sf;
    
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
    // Navigate to Rebill Report screen when rebill tab is clicked
    if (tabId === 'rebill') {
      navigation.navigate('RebillReport');
      return;
    }
    
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
  }, [navigation, loadReport, filters]);

  // Apply filter
  const handleApplyFilter = useCallback(() => {
    loadReport(activeTab, filters.fromDate, filters.toDate, filters.status);
    setShowFilters(false);
    setTimeout(() => {
      if (mainScrollViewRef.current) {
        mainScrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    }, 100);
  }, [loadReport, activeTab, filters]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      fromDate: '',
      toDate: '',
      status: 'All',
      search: '',
    });
    loadReport(activeTab, '', '', 'All');
  }, [loadReport, activeTab]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadReport(activeTab, filters.fromDate, filters.toDate, filters.status);
    setTimeout(() => setRefreshing(false), 500);
  }, [loadReport, activeTab, filters]);

  // Navigate to job detail
  const navigateToJobDetail = useCallback((jobId) => {
    if (jobId) {
      navigation.navigate('JobSheet', {
        screen: 'JobDetail',
        params: { jobId, id: jobId }
      });
    }
  }, [navigation]);

  // Navigate to stale jobs
  const navigateToStaleJobs = useCallback(() => {
    navigation.navigate('StaleJobs');
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
    if (filters.status !== 'All') count++;
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
      const rows = exportData.slice(0, 2000).map((item, idx) => ({
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

  // Engineer report data
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

  // Initial load
  useFocusEffect(
    useCallback(() => {
      loadReport('all', '', '', 'All');
      return () => {
        if (tabChangeTimeout.current) {
          clearTimeout(tabChangeTimeout.current);
        }
      };
    }, [loadReport])
  );

  // Render current table based on active tab
  const renderTable = useCallback(() => {
    switch (activeTab) {
      case 'all':
        return <OptimizedTable columns={allReportsColumns} data={filteredList} onPress={navigateToJobDetail} />;
      case 'engineer':
        return <OptimizedTable columns={engineerColumns} data={engineerReportData} onPress={navigateToJobDetail} />;
      case 'value':
        return <OptimizedTable columns={valueColumns} data={valueReport} grandTotal={valueReportTotal} />;
      case 'spare':
        return <OptimizedTable columns={spareColumns} data={spareReport} grandTotal={spareReportTotal} />;
      case 'dealer':
        return <OptimizedTable columns={dealerColumns} data={dealerReport} onPress={navigateToJobDetail} />;
      case 'dailyReceived':
      case 'dailyDelivered':
      case 'dailyRepaired':
        return <OptimizedTable columns={dailyColumns} data={dailySummary} />;
      case 'repairPending':
      case 'deliveryPending':
        return <OptimizedTable columns={pendingColumns} data={pendingReport} onPress={navigateToJobDetail} />;
      case 'deliveredNRNA':
        return <OptimizedTable columns={pendingColumns} data={deliveredNRNA} onPress={navigateToJobDetail} />;
      default:
        return <OptimizedTable columns={allReportsColumns} data={filteredList} onPress={navigateToJobDetail} />;
    }
  }, [activeTab, allReportsColumns, filteredList, navigateToJobDetail, engineerColumns, engineerReportData, valueColumns, valueReport, valueReportTotal, spareColumns, spareReport, spareReportTotal, dealerColumns, dealerReport, dailyColumns, dailySummary, pendingColumns, pendingReport, deliveredNRNA]);

  return (
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
          <SummaryCards stats={countStats} />
          
          {/* Stale Jobs Button */}
          <TouchableOpacity 
            style={styles.staleJobsButton}
            onPress={navigateToStaleJobs}
          >
            <AlertCircle size={18} color="#f59e0b" />
            <View style={styles.staleJobsButtonTextContainer}>
              <Text style={styles.staleJobsButtonTitle}>View Stale Jobs</Text>
              <Text style={styles.staleJobsButtonSubtitle}>Jobs pending beyond threshold</Text>
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
                    <Text style={styles.applyButtonText}>Apply</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.excelButton} onPress={handleExportToExcel}>
              <Download size={14} color={COLORS.success} />
              <Text style={styles.excelButtonText}>Export</Text>
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
                <tab.Icon size={12} color={activeTab === tab.id ? COLORS.white : COLORS.gray600} />
                <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
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

// Optimized Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  mainScrollView: { flex: 1 },
  contentContainer: { paddingBottom: 20 },
  
  tableWrapper: { flex: 1, minHeight: 200 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0', minHeight: 38 },
  headerRow: { backgroundColor: '#dc2626' },
  rowEven: { backgroundColor: '#ffffff' },
  rowOdd: { backgroundColor: '#f8fafc' },
  
  tableHeaderCellContainer: {
    paddingHorizontal: 6,
    paddingVertical: 8,
    justifyContent: 'center',
    backgroundColor: '#dc2626',
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  tableCellContainer: {
    paddingHorizontal: 6,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  tableCell: { fontSize: 10, color: '#1e293b' },
  boldCell: { fontWeight: '700', color: '#0f172a' },
  
  summaryScroll: { flexGrow: 0 },
  summaryContainer: { paddingHorizontal: 10, paddingVertical: 6, gap: 6 },
  summaryCard: { 
    minWidth: 75, 
    borderRadius: 8, 
    padding: 6, 
    alignItems: 'center',
    marginRight: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 0.5,
  },
  summaryLabel: { fontSize: 8, color: '#64748b', marginTop: 3 },
  summaryValue: { fontSize: 11, fontWeight: '700', marginTop: 3 },
  
  staleJobsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    marginHorizontal: 10,
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#fcd34d',
    gap: 10,
  },
  staleJobsButtonTextContainer: { flex: 1 },
  staleJobsButtonTitle: { fontSize: 13, fontWeight: '700', color: '#92400e' },
  staleJobsButtonSubtitle: { fontSize: 10, color: '#b45309', marginTop: 1 },
  
  filterSection: { backgroundColor: '#ffffff', borderRadius: 10, padding: 8, marginHorizontal: 10, marginBottom: 8 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 8, backgroundColor: '#f8fafc' },
  searchInput: { flex: 1, paddingVertical: 6, fontSize: 12, color: '#1e293b' },
  filterToggle: { padding: 6, backgroundColor: '#f1f5f9', borderRadius: 8, position: 'relative' },
  filterToggleActive: { backgroundColor: '#dc2626' },
  filterBadge: { position: 'absolute', top: -3, right: -3, backgroundColor: '#ef4444', borderRadius: 99, width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { color: '#ffffff', fontSize: 8, fontWeight: '700' },
  filtersGrid: { gap: 8, paddingTop: 6, borderTopWidth: 0.5, borderTopColor: '#f1f5f9' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, marginRight: 5, backgroundColor: '#f1f5f9', borderWidth: 0.5, borderColor: '#e2e8f0' },
  chipActive: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  chipText: { fontSize: 10, color: '#64748b' },
  chipTextActive: { color: '#ffffff' },
  dateRangeContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateButton: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 0.5, borderColor: '#e2e8f0', borderRadius: 8, padding: 6, gap: 3, backgroundColor: '#f8fafc' },
  dateButtonActive: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  dateText: { fontSize: 10, color: '#64748b' },
  dateTextActive: { color: '#dc2626', fontWeight: '500' },
  dateSeparator: { color: '#94a3b8', fontSize: 10 },
  actionButtons: { flexDirection: 'row', gap: 6, marginTop: 4 },
  applyButton: { flex: 1, backgroundColor: '#dc2626', borderRadius: 8, padding: 6, alignItems: 'center' },
  applyButtonText: { fontWeight: '600', color: '#ffffff', fontSize: 11 },
  resetButton: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 8, padding: 6, alignItems: 'center' },
  resetButtonText: { color: '#64748b', fontSize: 11 },
  excelButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdf4', borderRadius: 8, paddingVertical: 6, marginTop: 6, gap: 5 },
  excelButtonText: { fontWeight: '500', color: '#10b981', fontSize: 11 },
  
  tabsScroll: { marginHorizontal: 10, marginBottom: 6, flexGrow: 0 },
  tabsContent: { paddingVertical: 3, flexDirection: 'row', gap: 5 },
  tab: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 0.5, borderColor: '#e2e8f0' },
  activeTab: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  tabText: { fontSize: 10, fontWeight: '500', color: '#64748b', marginLeft: 3 },
  activeTabText: { color: '#ffffff' },
  
  reportContainer: { marginHorizontal: 10, marginBottom: 10, backgroundColor: '#ffffff', borderRadius: 10, overflow: 'hidden', minHeight: 200 },
  
  statusChip: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  statusChipText: { fontSize: 8, fontWeight: '500' },
  
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, backgroundColor: '#fef2f2', borderTopWidth: 0.5, borderTopColor: '#fecaca' },
  grandTotalLabel: { fontWeight: '600', fontSize: 11, color: '#1e293b' },
  grandTotalValue: { fontWeight: '700', fontSize: 12, color: '#dc2626' },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 6 },
  emptyText: { fontSize: 12, color: '#64748b' },
  
  loaderContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 8 },
  loaderText: { color: '#64748b', fontSize: 12 },
});

export default ReportsScreen;