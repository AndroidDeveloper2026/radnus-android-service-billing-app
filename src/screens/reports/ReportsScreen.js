// import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   TextInput,
//   Alert,
//   RefreshControl,
//   Dimensions,
//   LayoutAnimation,
//   Platform,
//   UIManager,
// } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigation } from '@react-navigation/native';
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
//   RefreshCw,
//   ChevronDown,
//   ChevronUp,
// } from 'lucide-react-native';
// import {
//   fetchEngineerWiseReport,
//   fetchValueReport,
//   fetchSpareReport,
//   fetchDealerReport,
//   fetchDailySummary,
//   fetchPendingReport,
//   fetchDeliveredNRNAReport,
// } from '../../store/slices/reportSlice';
// import { fetchJobs } from '../../store/slices/jobSlice';
// import { fetchStaleJobs } from '../../store/slices/staleJobsSlice';
// import { COLORS, SPACING, SHADOWS, BORDERS } from '../../utils/theme';

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// // Enable LayoutAnimation for iOS
// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// // Helper Functions
// const formatDate = (value) => {
//   if (!value || value === null || value === undefined) return '-';
//   if (value instanceof Date && !isNaN(value.getTime())) {
//     return `${value.getDate()}/${value.getMonth() + 1}/${value.getFullYear()}`;
//   }
//   const str = String(value).trim();
//   if (!str || str === 'null' || str === 'undefined') return '-';
//   if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) return str;
//   try {
//     const d = new Date(str);
//     if (!isNaN(d.getTime())) {
//       return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
//     }
//   } catch (e) {}
//   return str;
// };

// const safeNum = (val) => {
//   if (val === null || val === undefined || val === '') return 0;
//   const n = Number(val);
//   return isNaN(n) ? 0 : n;
// };

// // Constants
// const REPORT_TABS = [
//   { id: 'all', name: 'All Reports', Icon: ClipboardList },
//   { id: 'engineer', name: 'Engineer', Icon: Wrench },
//   { id: 'value', name: 'Value', Icon: DollarSign },
//   { id: 'spare', name: 'Spare', Icon: Box },
//   { id: 'dealer', name: 'Dealer', Icon: Store },
//   { id: 'dailyReceived', name: 'Daily Rcvd', Icon: Inbox },
//   { id: 'dailyDelivered', name: 'Daily Del', Icon: Send },
//   { id: 'dailyRepaired', name: 'Daily Rep', Icon: Hammer },
//   { id: 'repairPending', name: 'Repair Pend', Icon: Clock },
//   { id: 'deliveryPending', name: 'Delivery Pend', Icon: Truck },
//   { id: 'deliveredNRNA', name: 'NR/NA', Icon: AlertTriangle },
//   { id: 'rebill', name: 'Rebill', Icon: Receipt },
// ];

// const STATUS_OPTIONS = ['All Status', 'Received', 'Pending', 'Repairing', 'Repaired', 'Delivered'];

// // Status Chip Component
// const StatusChip = React.memo(({ status }) => {
//   const getStatusColor = (s) => {
//     switch (s?.toLowerCase()) {
//       case 'received': return { bg: '#E1F5EE', text: '#0F6E56' };
//       case 'pending': return { bg: '#FAEEDA', text: '#854F0B' };
//       case 'repairing': return { bg: '#F3E8FF', text: '#6D28D9' };
//       case 'repaired': return { bg: '#E6F1FB', text: '#185FA5' };
//       case 'delivered': return { bg: '#EAF3DE', text: '#3B6D11' };
//       default: return { bg: '#F1EFE8', text: '#5F5E5A' };
//     }
//   };
//   const colors = getStatusColor(status);
//   return (
//     <View style={[styles.statusChip, { backgroundColor: colors.bg }]}>
//       <Text style={[styles.statusChipText, { color: colors.text }]}>{status || '-'}</Text>
//     </View>
//   );
// });

// // Tab Button Component
// const TabButton = React.memo(({ tab, isActive, onPress }) => {
//   const { Icon, name, id } = tab;
//   return (
//     <TouchableOpacity 
//       style={[styles.tab, isActive && styles.activeTab]} 
//       onPress={() => onPress(id)}
//       activeOpacity={0.7}
//     >
//       <Icon size={14} color={isActive ? COLORS.white : COLORS.gray600} />
//       <Text style={[styles.tabText, isActive && styles.activeTabText]}>{name}</Text>
//     </TouchableOpacity>
//   );
// });

// // Empty State Component
// const EmptyState = React.memo(() => (
//   <View style={styles.emptyContainer}>
//     <ClipboardList size={48} color={COLORS.gray300} />
//     <Text style={styles.emptyText}>No data found</Text>
//     <Text style={styles.emptySubText}>Try adjusting your filters</Text>
//   </View>
// ));

// // Table Row Component
// const TableRow = React.memo(({ item, index, columns, onPress }) => (
//   <TouchableOpacity onPress={() => onPress && onPress(item._id)} activeOpacity={0.7} disabled={!onPress}>
//     <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
//       {columns.map((column, colIndex) => {
//         let value;
//         if (column.render) {
//           value = column.render(item, index);
//         } else if (column.key === 'index') {
//           value = index + 1;
//         } else {
//           value = item[column.key];
//         }
//         return (
//           <View 
//             key={colIndex} 
//             style={[styles.tableCellContainer, { width: column.width, minWidth: column.width }]}
//           >
//             <Text 
//               style={[styles.tableCell, column.style, column.bold && styles.boldCell]} 
//               numberOfLines={column.numberOfLines || 2}
//             >
//               {value !== undefined && value !== null ? value : '-'}
//             </Text>
//           </View>
//         );
//       })}
//     </View>
//   </TouchableOpacity>
// ));

// // Horizontal Scroll Table - Fixed version with proper scrolling
// const HorizontalScrollTable = React.memo(({ columns, data, onPress, grandTotal }) => {
//   const totalWidth = useMemo(() => {
//     return columns.reduce((sum, col) => sum + (col.width || 120), 0);
//   }, [columns]);

//   const ListHeaderComponent = useCallback(() => (
//     <View style={[styles.tableRow, styles.headerRow]}>
//       {columns.map((column, index) => (
//         <View 
//           key={index} 
//           style={[styles.tableHeaderCellContainer, { width: column.width, minWidth: column.width }]}
//         >
//           <Text 
//             style={[styles.tableHeaderCell, column.style]}
//             numberOfLines={2}
//           >
//             {column.label}
//           </Text>
//         </View>
//       ))}
//     </View>
//   ), [columns]);

//   const ListFooterComponent = useCallback(() => {
//     if (grandTotal !== undefined && grandTotal > 0 && data.length > 0) {
//       return (
//         <View style={styles.grandTotalRow}>
//           <Text style={styles.grandTotalLabel}>Grand Total</Text>
//           <Text style={styles.grandTotalValue}>₹{grandTotal.toLocaleString()}</Text>
//         </View>
//       );
//     }
//     return null;
//   }, [grandTotal, data.length]);

//   if (data.length === 0) {
//     return <EmptyState />;
//   }

//   return (
//     <View style={styles.horizontalScrollContainer}>
//       <ScrollView 
//         horizontal 
//         showsHorizontalScrollIndicator={true}
//         nestedScrollEnabled={true}
//         style={styles.horizontalScrollView}
//       >
//         <View style={{ width: totalWidth }}>
//           {ListHeaderComponent()}
//           <ScrollView 
//             vertical
//             showsVerticalScrollIndicator={true}
//             nestedScrollEnabled={true}
//             style={styles.tableVerticalScrollView}
//           >
//             {data.map((item, index) => (
//               <TableRow 
//                 key={item._id || index}
//                 item={item} 
//                 index={index} 
//                 columns={columns}
//                 onPress={onPress}
//               />
//             ))}
//             {ListFooterComponent()}
//           </ScrollView>
//         </View>
//       </ScrollView>
//     </View>
//   );
// });

// // Stale Job Item Component
// const StaleJobItem = React.memo(({ job, maxDays, onPress }) => {
//   const getUrgencyColor = useCallback((d) => {
//     if (d >= 7) return { bar: '#ef4444', badge: '#fee2e2', badgeText: '#991b1b' };
//     if (d >= 3) return { bar: '#f59e0b', badge: '#fef3c7', badgeText: '#92400e' };
//     return { bar: '#3b82f6', badge: '#dbeafe', badgeText: '#1e40af' };
//   }, []);

//   const urgency = getUrgencyColor(job.staleDays);
//   const pct = Math.min((job.staleDays / maxDays) * 100, 100);

//   return (
//     <TouchableOpacity onPress={() => onPress(job._id)} activeOpacity={0.7} style={styles.staleJobCard}>
//       <View style={styles.staleJobHeader}>
//         <Text style={styles.staleJobNo}>{job.jobSheetNo}</Text>
//         <View style={[styles.staleDaysBadge, { backgroundColor: urgency.badge }]}>
//           <Clock size={10} color={urgency.badgeText} />
//           <Text style={[styles.staleDaysText, { color: urgency.badgeText }]}>
//             {job.staleDays}d
//           </Text>
//         </View>
//       </View>
//       <Text style={styles.staleCustomerName} numberOfLines={1}>{job.customerName}</Text>
//       <Text style={styles.staleDeviceInfo} numberOfLines={1}>
//         {job.make} {job.model}
//       </Text>
//       {job.assignedTo && (
//         <Text style={styles.staleAssignedTo}>
//           <Wrench size={10} color="#475569" /> {job.assignedTo}
//         </Text>
//       )}
//       <View style={styles.staleProgressBarContainer}>
//         <View style={[styles.staleProgressBar, { width: `${pct}%`, backgroundColor: urgency.bar }]} />
//       </View>
//       <View style={styles.staleProgressTextContainer}>
//         <Text style={[styles.staleProgressText, { color: urgency.bar }]}>
//           {Math.round(pct)}% completed
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );
// });

// // Stale Jobs Widget
// const StaleJobsWidget = React.memo(() => {
//   const dispatch = useDispatch();
//   const navigation = useNavigation();
//   const { jobs, loading, error } = useSelector(state => state.staleJobs);
//   const [days, setDays] = useState(3);
//   const [collapsed, setCollapsed] = useState(false);
//   const [showDaysDropdown, setShowDaysDropdown] = useState(false);

//   useEffect(() => {
//     dispatch(fetchStaleJobs({ days }));
//   }, [days, dispatch]);

//   const handleRefresh = useCallback(() => {
//     dispatch(fetchStaleJobs({ days }));
//   }, [days, dispatch]);

//   const navigateToJobDetail = useCallback((jobId) => {
//     navigation.navigate('JobSheet', {
//       screen: 'JobDetail',
//       params: { jobId, id: jobId }
//     });
//   }, [navigation]);

//   const toggleCollapse = useCallback(() => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setCollapsed(!collapsed);
//   }, [collapsed]);

//   if (error) {
//     return (
//       <View style={styles.staleWidgetContainer}>
//         <View style={styles.staleHeader}>
//           <View style={styles.staleHeaderLeft}>
//             <AlertCircle size={17} color="#ef4444" />
//             <Text style={[styles.staleHeaderTitle, { color: '#ef4444' }]}>Connection Error</Text>
//           </View>
//           <TouchableOpacity onPress={handleRefresh} style={styles.staleRefreshBtn}>
//             <RefreshCw size={14} color="#64748b" />
//           </TouchableOpacity>
//         </View>
//         <View style={styles.staleErrorContainer}>
//           <Text style={styles.staleErrorText}>{error}</Text>
//           <TouchableOpacity onPress={handleRefresh} style={styles.staleErrorRetryBtn}>
//             <Text style={styles.staleErrorRetryText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   if (jobs.length === 0 && !loading) return null;

//   const maxDays = jobs.length > 0 ? Math.max(...jobs.map(j => j.staleDays)) : 1;

//   return (
//     <View style={styles.staleWidgetContainer}>
//       <TouchableOpacity onPress={toggleCollapse} activeOpacity={0.7} style={styles.staleHeader}>
//         <View style={styles.staleHeaderLeft}>
//           <View style={styles.staleIconContainer}>
//             <AlertCircle size={17} color="#fbbf24" />
//           </View>
//           <Text style={styles.staleHeaderTitle}>Stale Jobs Alert</Text>
//           <View style={styles.staleCountBadge}>
//             <Text style={styles.staleCountText}>{loading ? '…' : jobs.length}</Text>
//           </View>
//         </View>
//         <View style={styles.staleHeaderRight}>
//           <View style={styles.staleControls}>
//             <TouchableOpacity onPress={() => setShowDaysDropdown(!showDaysDropdown)} style={styles.staleDaysSelector}>
//               <Text style={styles.staleDaysSelectorText}>{days}+ days</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={handleRefresh} style={styles.staleRefreshBtn}>
//               <RefreshCw size={14} color="#64748b" />
//             </TouchableOpacity>
//           </View>
//           <Text style={styles.staleToggleIcon}>{collapsed ? '▼' : '▲'}</Text>
//         </View>
//       </TouchableOpacity>

//       {showDaysDropdown && (
//         <View style={styles.staleDropdownContainer}>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//             {[1, 3, 5, 7, 10, 15].map(day => (
//               <TouchableOpacity
//                 key={day}
//                 style={[styles.staleDropdownItem, days === day && styles.staleDropdownItemActive]}
//                 onPress={() => { setDays(day); setShowDaysDropdown(false); }}
//               >
//                 <Text style={[styles.staleDropdownText, days === day && styles.staleDropdownTextActive]}>
//                   {day}+ day{day > 1 ? 's' : ''}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>
//       )}

//       {!collapsed && (
//         <View style={styles.staleBody}>
//           {loading ? (
//             <View style={styles.staleLoadingContainer}>
//               <ActivityIndicator size="small" color="#334155" />
//               <Text style={styles.staleLoadingText}>Loading stale jobs...</Text>
//             </View>
//           ) : (
//             <ScrollView 
//               style={styles.staleJobsList}
//               showsVerticalScrollIndicator={true}
//               nestedScrollEnabled={true}
//             >
//               {jobs.map((job) => (
//                 <StaleJobItem 
//                   key={job._id}
//                   job={job} 
//                   maxDays={maxDays} 
//                   onPress={navigateToJobDetail}
//                 />
//               ))}
//             </ScrollView>
//           )}
//         </View>
//       )}
//     </View>
//   );
// });

// // Summary Card Component
// const SummaryCard = React.memo(({ card }) => (
//   <View style={[styles.summaryCard, { backgroundColor: card.bg }]}>
//     {card.icon}
//     <Text style={styles.summaryLabel}>{card.label}</Text>
//     <Text style={[styles.summaryValue, { color: card.color }]}>{card.value}</Text>
//   </View>
// ));

// // Summary Cards Component
// const SummaryCards = React.memo(({ stats }) => {
//   const cards = useMemo(() => [
//     { label: 'Received', value: stats.received, color: '#3b82f6', bg: '#eff6ff', icon: <Inbox size={20} color="#3b82f6" /> },
//     { label: 'Pending', value: stats.pending, color: '#f59e0b', bg: '#fffbeb', icon: <Clock size={20} color="#f59e0b" /> },
//     { label: 'Delivered', value: stats.delivered, color: '#10b981', bg: '#f0fdf4', icon: <CheckCircle size={20} color="#10b981" /> },
//     { label: 'Repaired', value: stats.repaired, color: '#10b981', bg: '#f0fdf4', icon: <Hammer size={20} color="#10b981" /> },
//     { label: 'NR/NA', value: stats.nrna, color: '#ef4444', bg: '#fef2f2', icon: <XCircle size={20} color="#ef4444" /> },
//     { label: 'Service', value: `₹${stats.serviceCharge.toLocaleString()}`, color: '#10b981', bg: '#f0fdf4', icon: <DollarSign size={20} color="#10b981" /> },
//     { label: 'Spare', value: `₹${stats.spareCharge.toLocaleString()}`, color: '#f59e0b', bg: '#fffbeb', icon: <Box size={20} color="#f59e0b" /> },
//     { label: 'Total', value: `₹${stats.totalAmount.toLocaleString()}`, color: '#ffffff', bg: '#6366f1', icon: <CreditCard size={20} color="#fff" /> },
//   ], [stats]);

//   return (
//     <ScrollView 
//       horizontal 
//       showsHorizontalScrollIndicator={false} 
//       style={styles.summaryScroll}
//       contentContainerStyle={styles.summaryContainer}
//     >
//       {cards.map((card, i) => <SummaryCard key={i} card={card} />)}
//     </ScrollView>
//   );
// });

// // Main Component
// export default function ReportsScreen() {
//   const dispatch = useDispatch();
//   const navigation = useNavigation();
  
//   // Selectors
//   const {
//     engineerReport,
//     noEngineerJobs,
//     valueReport,
//     spareReport,
//     dealerReport,
//     dailySummary,
//     pendingReport,
//     deliveredNRNA,
//     loading: reportLoading,
//   } = useSelector(state => state.reports);
//   const { list, loading: jobsLoading } = useSelector(state => state.jobs);

//   const loading = reportLoading || jobsLoading;

//   // State
//   const [activeTab, setActiveTab] = useState('all');
//   const [filters, setFilters] = useState({
//     fromDate: '',
//     toDate: '',
//     status: 'All Status',
//     engineer: '',
//     dealer: '',
//     search: '',
//   });
//   const [showFilters, setShowFilters] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [showFromPicker, setShowFromPicker] = useState(false);
//   const [showToPicker, setShowToPicker] = useState(false);
//   const [expandedSections, setExpandedSections] = useState({});

//   // Memoized Stats
//   const countStats = useMemo(() => {
//     const allJobs = list || [];
//     return {
//       received: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Received').length,
//       pending: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Pending').length,
//       repaired: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Repaired').length,
//       delivered: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Delivered').length,
//       nrna: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Delivered NR/NA').length,
//       serviceCharge: allJobs.reduce((s, j) => s + safeNum(j.serviceCharges ?? j.service?.serviceCharge ?? 0), 0),
//       spareCharge: allJobs.reduce((s, j) => s + safeNum(j.spareCharges ?? j.service?.spareCharge ?? 0), 0),
//       totalAmount: allJobs.reduce((s, j) => s + safeNum(j.totalAmount ?? (safeNum(j.serviceCharges) + safeNum(j.spareCharges))), 0),
//     };
//   }, [list]);

//   // Memoized Filtered Data
//   const filteredList = useMemo(() => {
//     if (!list?.length) return [];
//     if (!filters.search.trim()) return list;
//     const q = filters.search.toLowerCase();
//     return list.filter(j => 
//       (j.customer?.name || '').toLowerCase().includes(q) ||
//       (j.customer?.contact || '').includes(q) ||
//       (j.jobSheetNo || '').toLowerCase().includes(q) ||
//       (j.device?.imei || '').includes(q)
//     );
//   }, [list, filters.search]);

//   const filteredPending = useMemo(() => {
//     if (!pendingReport?.length) return [];
//     if (!filters.search.trim()) return pendingReport;
//     const q = filters.search.toLowerCase();
//     return pendingReport.filter(j =>
//       (j.customer?.name || '').toLowerCase().includes(q) ||
//       (j.customer?.contact || '').includes(q) ||
//       (j.jobSheetNo || '').toLowerCase().includes(q)
//     );
//   }, [pendingReport, filters.search]);

//   // Calculate totals
//   const valueReportTotal = useMemo(() => {
//     return (valueReport || []).reduce((sum, item) => sum + safeNum(item.total), 0);
//   }, [valueReport]);

//   const spareReportTotal = useMemo(() => {
//     return (spareReport || []).reduce((sum, item) => sum + safeNum(item.amount), 0);
//   }, [spareReport]);

//   const dailyReportTotal = useMemo(() => {
//     return (dailySummary || []).reduce((sum, item) => sum + safeNum(item.count), 0);
//   }, [dailySummary]);

//   // Column Configurations with proper widths
//   const allReportsColumns = useMemo(() => [
//     { label: '#', key: 'index', style: styles.cellSl, width: 60 },
//     { label: 'Job No', key: 'jobSheetNo', style: styles.cellJobNo, width: 120 },
//     { label: 'Customer', key: 'customerName', style: styles.cellCustomer, width: 180, render: (item) => item.customer?.name },
//     { label: 'Contact', key: 'customerContact', style: styles.cellContact, width: 130, render: (item) => item.customer?.contact },
//     { label: 'Device', key: 'device', style: styles.cellDevice, width: 200, render: (item) => `${item.device?.make || ''} ${item.device?.model || ''}`.trim() },
//     { label: 'Status', key: 'status', style: styles.cellStatus, width: 120, render: (item) => <StatusChip status={item.device?.mobileStatus || item.status} /> },
//     { label: 'Date', key: 'createdAt', style: styles.cellDate, width: 120, render: (item) => formatDate(item.createdAt) },
//   ], []);

//   const valueColumns = useMemo(() => [
//     { label: '#', key: 'index', style: styles.cellSl, width: 60 },
//     { label: 'Job No', key: 'jobNo', style: styles.cellJobNoSmall, width: 100 },
//     { label: 'Customer', key: 'name', style: styles.cellCustomerValue, width: 180 },
//     { label: 'Service', key: 'service', style: styles.cellAmount, width: 120, render: (item) => `₹${safeNum(item.service).toLocaleString()}` },
//     { label: 'Spare', key: 'spare', style: styles.cellAmount, width: 120, render: (item) => `₹${safeNum(item.spare).toLocaleString()}` },
//     { label: 'Total', key: 'total', style: [styles.cellAmount, styles.boldCell], width: 130, render: (item) => `₹${safeNum(item.total).toLocaleString()}`, bold: true },
//   ], []);

//   const spareColumns = useMemo(() => [
//     { label: '#', key: 'index', style: styles.cellSl, width: 60 },
//     { label: 'Job No', key: 'jobSheet', style: styles.cellJobNoSmall, width: 100 },
//     { label: 'Spare Part', key: 'spare', style: styles.cellSpareName, width: 220 },
//     { label: 'Qty', key: 'qty', style: styles.cellSmallNumber, width: 80, render: (item) => safeNum(item.qty) },
//     { label: 'Rate', key: 'rate', style: styles.cellAmount, width: 120, render: (item) => `₹${safeNum(item.rate).toLocaleString()}` },
//     { label: 'Amount', key: 'amount', style: [styles.cellAmount, styles.boldCell], width: 130, render: (item) => `₹${safeNum(item.amount).toLocaleString()}`, bold: true },
//   ], []);

//   const dailyColumns = useMemo(() => [
//     { label: 'Date', key: 'date', style: styles.cellDateLarge, width: 150 },
//     { label: 'Count', key: 'count', style: styles.cellCountLarge, width: 120, render: (item) => safeNum(item.count) },
//   ], []);

//   const pendingColumns = useMemo(() => [
//     { label: '#', key: 'index', style: styles.cellSl, width: 60 },
//     { label: 'Job No', key: 'jobSheetNo', style: styles.cellJobNo, width: 120 },
//     { label: 'Customer', key: 'customerName', style: styles.cellCustomer, width: 180, render: (item) => item.customer?.name },
//     { label: 'Contact', key: 'customerContact', style: styles.cellContact, width: 130, render: (item) => item.customer?.contact },
//     { label: 'Device', key: 'device', style: styles.cellDevice, width: 200, render: (item) => `${item.device?.make || ''} ${item.device?.model || ''}`.trim() },
//     { label: 'Date', key: 'createdAt', style: styles.cellDate, width: 120, render: (item) => formatDate(item.createdAt) },
//   ], []);

//   const dealerColumns = useMemo(() => [
//     { label: '#', key: 'index', style: styles.cellSl, width: 60 },
//     { label: 'Job No', key: 'jobSheetNo', style: styles.cellJobNo, width: 120 },
//     { label: 'Customer', key: 'customerName', style: styles.cellCustomer, width: 180, render: (item) => item.customer?.name },
//     { label: 'Contact', key: 'customerContact', style: styles.cellContact, width: 130, render: (item) => item.customer?.contact },
//     { label: 'Dealer', key: 'dealerName', style: styles.cellDealerName, width: 150, render: (item) => item.dealerName || item.dealer },
//     { label: 'Status', key: 'status', style: styles.cellStatus, width: 120, render: (item) => <StatusChip status={item.device?.mobileStatus || item.status} /> },
//   ], []);

//   const nrnaColumns = useMemo(() => [
//     { label: '#', key: 'index', style: styles.cellSl, width: 60 },
//     { label: 'Job No', key: 'jobSheetNo', style: styles.cellJobNo, width: 120 },
//     { label: 'Customer', key: 'customerName', style: styles.cellCustomer, width: 180, render: (item) => item.customer?.name },
//     { label: 'Contact', key: 'customerContact', style: styles.cellContact, width: 130, render: (item) => item.customer?.contact },
//     { label: 'Delivered Date', key: 'deliveredDate', style: styles.cellDate, width: 130, render: (item) => formatDate(item.deliveredDate) },
//     { label: 'Physical Cond.', key: 'physicalCond', style: styles.cellPhysCond, width: 200, render: (item) => 
//       Array.isArray(item.physicalConditions) ? item.physicalConditions.join(', ') : item.physicalCondition || '-' 
//     },
//   ], []);

//   const engineerColumns = useMemo(() => [
//     { label: '#', key: 'index', style: styles.cellSl, width: 60 },
//     { label: 'Job No', key: 'jobSheetNo', style: styles.cellJobNo, width: 120 },
//     { label: 'Customer', key: 'customerName', style: styles.cellCustomer, width: 180, render: (item) => item.customer?.name },
//     { label: 'Contact', key: 'customerContact', style: styles.cellContact, width: 130, render: (item) => item.customer?.contact },
//     { label: 'Status', key: 'status', style: styles.cellStatus, width: 120, render: (item) => <StatusChip status={item.device?.mobileStatus || item.status} /> },
//     { label: 'Date', key: 'createdAt', style: styles.cellDate, width: 120, render: (item) => formatDate(item.createdAt) },
//   ], []);

//   // Callbacks
//   const loadReport = useCallback((tabId, fd, td, sf, se, sd) => {
//     const filterParams = { fromDate: fd, toDate: td };
//     if (sf !== 'All Status') filterParams.status = sf;
    
//     const actions = {
//       engineer: () => dispatch(fetchEngineerWiseReport(filterParams)),
//       value: () => dispatch(fetchValueReport(filterParams)),
//       spare: () => dispatch(fetchSpareReport({ ...filterParams, engineerId: se })),
//       dealer: () => dispatch(fetchDealerReport({ dealerName: sd, fromDate: fd, toDate: td })),
//       all: () => dispatch(fetchJobs(filterParams)),
//       dailyReceived: () => dispatch(fetchDailySummary({ type: 'received', fromDate: fd, toDate: td })),
//       dailyDelivered: () => dispatch(fetchDailySummary({ type: 'delivered', fromDate: fd, toDate: td })),
//       dailyRepaired: () => dispatch(fetchDailySummary({ type: 'repaired', fromDate: fd, toDate: td })),
//       repairPending: () => dispatch(fetchPendingReport({ type: 'repairPending', fromDate: fd, toDate: td })),
//       deliveryPending: () => dispatch(fetchPendingReport({ type: 'deliveryPending', fromDate: fd, toDate: td })),
//       deliveredNRNA: () => dispatch(fetchDeliveredNRNAReport({ fromDate: fd, toDate: td })),
//     };
    
//     actions[tabId]?.();
//   }, [dispatch]);

//   const handleTabPress = useCallback((tabId) => {
//     setActiveTab(tabId);
//     setExpandedSections({});
//     loadReport(tabId, filters.fromDate, filters.toDate, filters.status, filters.engineer, filters.dealer);
//   }, [loadReport, filters]);

//   const handleApplyFilter = useCallback(() => {
//     loadReport(activeTab, filters.fromDate, filters.toDate, filters.status, filters.engineer, filters.dealer);
//   }, [loadReport, activeTab, filters]);

//   const resetFilters = useCallback(() => {
//     setFilters({
//       fromDate: '',
//       toDate: '',
//       status: 'All Status',
//       engineer: '',
//       dealer: '',
//       search: '',
//     });
//     loadReport(activeTab, '', '', 'All Status', '', '');
//   }, [loadReport, activeTab]);

//   const handleRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await loadReport(activeTab, filters.fromDate, filters.toDate, filters.status, filters.engineer, filters.dealer);
//     setRefreshing(false);
//   }, [loadReport, activeTab, filters]);

//   const toggleSection = useCallback((sectionId) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
//   }, []);

//   const navigateToJobDetail = useCallback((jobId) => {
//     navigation.navigate('JobSheet', {
//       screen: 'JobDetail',
//       params: { jobId, id: jobId }
//     });
//   }, [navigation]);

//   const updateFilter = useCallback((key, value) => {
//     setFilters(prev => ({ ...prev, [key]: value }));
//   }, []);

//   const activeFilterCount = useMemo(() => {
//     let count = 0;
//     if (filters.fromDate) count++;
//     if (filters.toDate) count++;
//     if (filters.status !== 'All Status') count++;
//     if (filters.engineer) count++;
//     if (filters.dealer) count++;
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
//         exportData = [...(noEngineerJobs || []), ...(engineerReport || []).flatMap(e => e.jobs || [])];
//         filename = 'Engineer_Wise_Report';
//         break;
//       case 'value':
//         exportData = valueReport || [];
//         filename = 'Value_Report';
//         break;
//       case 'spare':
//         exportData = spareReport || [];
//         filename = 'Spare_Parts_Report';
//         break;
//       case 'dealer':
//         exportData = dealerReport || [];
//         filename = 'Dealer_Report';
//         break;
//       case 'repairPending':
//       case 'deliveryPending':
//         exportData = filteredPending;
//         filename = activeTab === 'repairPending' ? 'Repair_Pending_Report' : 'Delivery_Pending_Report';
//         break;
//       case 'dailyReceived':
//       case 'dailyDelivered':
//       case 'dailyRepaired':
//         exportData = dailySummary || [];
//         filename = `${activeTab}_Report`;
//         break;
//       case 'deliveredNRNA':
//         exportData = deliveredNRNA || [];
//         filename = 'Delivered_NR_NA_Report';
//         break;
//       default:
//         exportData = filteredList;
//         filename = 'Reports';
//     }

//     if (!exportData || exportData.length === 0) {
//       Alert.alert('No Data', 'There is no data to export');
//       return;
//     }

//     try {
//       const rows = exportData.map((item, idx) => ({
//         'SL No': idx + 1,
//         'Job No': item.jobSheetNo || item.jobNo || '-',
//         'Customer': item.customer?.name || item.name || '-',
//         'Contact': item.customer?.contact || '-',
//         'Device': `${item.device?.make || ''} ${item.device?.model || ''}`.trim() || '-',
//         'Status': item.device?.mobileStatus || item.status || '-',
//         'Date': formatDate(item.createdAt || item.date),
//       }));

//       const ws = XLSX.utils.json_to_sheet(rows);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, filename);
//       const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      
//       const filePath = `${RNFS.DocumentDirectoryPath}/${filename}_${Date.now()}.xlsx`;
//       await RNFS.writeFile(filePath, wbout, 'base64');
      
//       await Share.open({
//         url: `file://${filePath}`,
//         type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//       });
      
//       Alert.alert('Success', 'File exported successfully!');
//     } catch (error) {
//       console.error('Export error:', error);
//       Alert.alert('Export Failed', 'Could not export the file');
//     }
//   }, [activeTab, filteredList, valueReport, spareReport, dealerReport, pendingReport, engineerReport, noEngineerJobs, dailySummary, deliveredNRNA, filteredPending]);

//   useEffect(() => {
//     loadReport('all', '', '', 'All Status', '', '');
//   }, []);

//   // Render Functions
//   const renderEngineerReport = useCallback(() => {
//     const sections = [];
//     if (noEngineerJobs?.length > 0)
//       sections.push({ title: `Unassigned (${noEngineerJobs.length} jobs)`, data: noEngineerJobs });
//     (engineerReport || []).forEach(eng =>
//       sections.push({ title: `${eng.engineer} (${(eng.jobs || []).length} jobs)`, data: eng.jobs || [] })
//     );
    
//     if (sections.length === 0) return <EmptyState />;
    
//     return sections.map((section, idx) => (
//       <View key={idx} style={styles.sectionCard}>
//         <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(`engineer_${idx}`)}>
//           <Wrench size={14} color={COLORS.primary} />
//           <Text style={styles.sectionTitle}>{section.title}</Text>
//           {expandedSections[`engineer_${idx}`] ? <ChevronUp size={14} color={COLORS.gray600} /> : <ChevronDown size={14} color={COLORS.gray600} />}
//         </TouchableOpacity>
//         {(expandedSections[`engineer_${idx}`] === undefined || expandedSections[`engineer_${idx}`]) && (
//           <HorizontalScrollTable 
//             columns={engineerColumns} 
//             data={section.data} 
//             onPress={navigateToJobDetail}
//           />
//         )}
//       </View>
//     ));
//   }, [engineerReport, noEngineerJobs, expandedSections, toggleSection, engineerColumns, navigateToJobDetail]);

//   const renderDailyReport = useCallback(() => {
//     const sortedData = [...(dailySummary || [])].sort((a, b) => {
//       const parseDate = (s) => {
//         if (!s || s === '-') return new Date(0);
//         const parts = s.split('/');
//         if (parts.length === 3) {
//           return new Date(parts[2], parts[1] - 1, parts[0]);
//         }
//         return new Date(s);
//       };
//       return parseDate(a.date) - parseDate(b.date);
//     });
    
//     return (
//       <HorizontalScrollTable 
//         columns={dailyColumns} 
//         data={sortedData} 
//         grandTotal={dailyReportTotal}
//       />
//     );
//   }, [dailySummary, dailyColumns, dailyReportTotal]);

//   // Main render
//   return (
//     <View style={styles.container}>
//       <ScrollView
//         style={styles.mainScrollView}
//         showsVerticalScrollIndicator={true}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
//         }
//         nestedScrollEnabled={true}
//       >
//         <SummaryCards stats={countStats} />
//         <StaleJobsWidget />
        
//         {/* Filter Section */}
//         <View style={styles.filterSection}>
//           <View style={styles.searchRow}>
//             <View style={styles.searchInputContainer}>
//               <Search size={16} color={COLORS.gray400} />
//               <TextInput
//                 style={styles.searchInput}
//                 placeholder="Search by name / job no / contact"
//                 placeholderTextColor={COLORS.gray400}
//                 value={filters.search}
//                 onChangeText={(value) => updateFilter('search', value)}
//               />
//               {filters.search.length > 0 && (
//                 <TouchableOpacity onPress={() => updateFilter('search', '')} style={styles.searchClear}>
//                   <X size={14} color={COLORS.gray400} />
//                 </TouchableOpacity>
//               )}
//             </View>
//             <TouchableOpacity
//               style={[styles.filterToggle, activeFilterCount > 0 && styles.filterToggleActive]}
//               onPress={() => setShowFilters(!showFilters)}
//             >
//               <Filter size={18} color={activeFilterCount > 0 ? COLORS.white : COLORS.primary} />
//               {activeFilterCount > 0 && (
//                 <View style={styles.filterBadge}>
//                   <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
//                 </View>
//               )}
//             </TouchableOpacity>
//           </View>

//           {showFilters && (
//             <View style={styles.filtersGrid}>
//               <View style={styles.filterItem}>
//                 <Text style={styles.filterLabel}>Status</Text>
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
//               </View>

//               <View style={styles.dateRangeContainer}>
//                 <TouchableOpacity
//                   style={[styles.dateButton, filters.fromDate && styles.dateButtonActive]}
//                   onPress={() => setShowFromPicker(true)}
//                 >
//                   <Calendar size={15} color={filters.fromDate ? COLORS.primary : COLORS.gray500} />
//                   <Text style={[styles.dateText, filters.fromDate && styles.dateTextActive]}>
//                     {filters.fromDate || 'From Date'}
//                   </Text>
//                 </TouchableOpacity>
//                 <Text style={styles.dateSeparator}>→</Text>
//                 <TouchableOpacity
//                   style={[styles.dateButton, filters.toDate && styles.dateButtonActive]}
//                   onPress={() => setShowToPicker(true)}
//                 >
//                   <Calendar size={15} color={filters.toDate ? COLORS.primary : COLORS.gray500} />
//                   <Text style={[styles.dateText, filters.toDate && styles.dateTextActive]}>
//                     {filters.toDate || 'To Date'}
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.actionButtons}>
//                 <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
//                   <Text style={styles.applyButtonText}>Apply Filter</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
//                   <X size={15} color={COLORS.gray600} />
//                   <Text style={styles.resetButtonText}>Reset</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}

//           <View style={styles.exportButtons}>
//             <TouchableOpacity style={styles.excelButton} onPress={handleExportToExcel}>
//               <Download size={16} color={COLORS.success} />
//               <Text style={styles.excelButtonText}>Export to Excel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Tabs */}
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
//           {REPORT_TABS.map(tab => (
//             <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onPress={handleTabPress} />
//           ))}
//         </ScrollView>

//         {/* Report Content */}
//         <View style={styles.reportContainer}>
//           {loading && !refreshing && 
//            ((activeTab === 'all' && filteredList.length === 0) ||
//             (activeTab === 'repairPending' && filteredPending.length === 0)) ? (
//             <View style={styles.loaderContainer}>
//               <ActivityIndicator size="large" color={COLORS.primary} />
//               <Text style={styles.loaderText}>Loading report...</Text>
//             </View>
//           ) : (
//             <>
//               {activeTab === 'all' && <HorizontalScrollTable columns={allReportsColumns} data={filteredList} onPress={navigateToJobDetail} />}
//               {activeTab === 'engineer' && renderEngineerReport()}
//               {activeTab === 'value' && <HorizontalScrollTable columns={valueColumns} data={valueReport || []} grandTotal={valueReportTotal} />}
//               {activeTab === 'spare' && <HorizontalScrollTable columns={spareColumns} data={spareReport || []} grandTotal={spareReportTotal} />}
//               {activeTab === 'dealer' && <HorizontalScrollTable columns={dealerColumns} data={dealerReport || []} onPress={navigateToJobDetail} />}
//               {(activeTab === 'dailyReceived' || activeTab === 'dailyDelivered' || activeTab === 'dailyRepaired') && renderDailyReport()}
//               {(activeTab === 'repairPending' || activeTab === 'deliveryPending') && <HorizontalScrollTable columns={pendingColumns} data={filteredPending} onPress={navigateToJobDetail} />}
//               {activeTab === 'deliveredNRNA' && <HorizontalScrollTable columns={nrnaColumns} data={deliveredNRNA || []} onPress={navigateToJobDetail} />}
//               {activeTab === 'rebill' && <EmptyState />}
//             </>
//           )}
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
// }

// // Styles
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: COLORS.gray50 },
//   mainScrollView: { flex: 1 },
  
//   // Horizontal Scroll Table Styles
//   horizontalScrollContainer: {
//     flex: 1,
//     width: '100%',
//     backgroundColor: COLORS.white,
//     minHeight: 300,
//   },
//   horizontalScrollView: {
//     flex: 1,
//     width: '100%',
//   },
//   tableVerticalScrollView: {
//     maxHeight: SCREEN_HEIGHT - 400,
//     minHeight: 200,
//   },
//   tableHeaderCellContainer: {
//     paddingHorizontal: 8,
//     paddingVertical: 12,
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//   },
//   tableHeaderCell: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: COLORS.white,
//     textAlign: 'center',
//   },
//   tableCellContainer: {
//     paddingHorizontal: 8,
//     paddingVertical: 12,
//     justifyContent: 'center',
//   },
  
//   // Table Row Styles
//   tableRow: { 
//     flexDirection: 'row', 
//     borderBottomWidth: 1, 
//     borderBottomColor: COLORS.gray200,
//     minHeight: 44,
//   },
//   headerRow: {
//     backgroundColor: COLORS.primary,
//     borderBottomWidth: 2,
//     borderBottomColor: '#2563eb',
//   },
//   rowEven: { backgroundColor: COLORS.white },
//   rowOdd: { backgroundColor: COLORS.gray50 },
//   tableCell: { 
//     fontSize: 11, 
//     color: COLORS.gray800,
//     flexWrap: 'wrap',
//   },
//   boldCell: { fontWeight: '700', color: COLORS.gray900 },
  
//   // Cell width styles
//   cellSl: { textAlign: 'center' },
//   cellJobNo: {},
//   cellJobNoSmall: {},
//   cellCustomer: {},
//   cellCustomerValue: {},
//   cellContact: {},
//   cellDevice: {},
//   cellStatus: {},
//   cellDate: {},
//   cellDateLarge: {},
//   cellCountLarge: { textAlign: 'center' },
//   cellAmount: { textAlign: 'right' },
//   cellSmallNumber: { textAlign: 'center' },
//   cellSpareName: {},
//   cellDealerName: {},
//   cellPhysCond: {},
  
//   // Summary Cards
//   summaryScroll: { flexGrow: 0 },
//   summaryContainer: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm },
//   summaryCard: { 
//     minWidth: 90, 
//     backgroundColor: COLORS.white, 
//     borderRadius: BORDERS.radius.md, 
//     padding: SPACING.md, 
//     alignItems: 'center',
//     ...SHADOWS.small,
//   },
//   summaryLabel: { fontSize: 11, color: COLORS.gray500, marginTop: 4, textAlign: 'center' },
//   summaryValue: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  
//   // Stale Jobs Widget
//   staleWidgetContainer: {
//     backgroundColor: '#fff',
//     borderRadius: BORDERS.radius.lg,
//     marginHorizontal: SPACING.md,
//     marginBottom: SPACING.md,
//     overflow: 'hidden',
//     ...SHADOWS.small,
//   },
//   staleHeader: {
//     backgroundColor: '#fffbeb',
//     padding: SPACING.md,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   staleHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   staleIconContainer: { 
//     width: 32, 
//     height: 32, 
//     borderRadius: 10, 
//     backgroundColor: '#fef3c7', 
//     alignItems: 'center', 
//     justifyContent: 'center' 
//   },
//   staleHeaderTitle: { fontSize: 14, fontWeight: '600', color: '#d97706' },
//   staleCountBadge: { backgroundColor: '#fee2e2', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
//   staleCountText: { color: '#dc2626', fontSize: 11, fontWeight: '700' },
//   staleHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   staleControls: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   staleDaysSelector: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#fcd34d', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
//   staleDaysSelectorText: { color: '#78350f', fontSize: 11, fontWeight: '600' },
//   staleRefreshBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#fcd34d', borderRadius: 6, padding: 4 },
//   staleToggleIcon: { color: '#92400e', fontSize: 14, fontWeight: '600' },
//   staleDropdownContainer: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#fcd34d', borderRadius: 8, margin: 8, padding: 6, elevation: 3 },
//   staleDropdownItem: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
//   staleDropdownItemActive: { backgroundColor: '#fef3c7' },
//   staleDropdownText: { fontSize: 12, color: '#64748b' },
//   staleDropdownTextActive: { color: '#78350f', fontWeight: '600' },
//   staleBody: { paddingHorizontal: 12, paddingTop: 12, maxHeight: 400 },
//   staleJobsList: { maxHeight: 350 },
//   staleLoadingContainer: { alignItems: 'center', paddingVertical: 24, gap: 8 },
//   staleLoadingText: { color: '#334155', fontSize: 12 },
//   staleErrorContainer: { alignItems: 'center', paddingVertical: 24, gap: 8 },
//   staleErrorText: { color: '#ef4444', fontSize: 12, textAlign: 'center' },
//   staleErrorRetryBtn: { backgroundColor: '#ef4444', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
//   staleErrorRetryText: { color: '#fff', fontSize: 13, fontWeight: '600' },
//   staleJobCard: {
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 10,
//     ...SHADOWS.small,
//   },
//   staleJobHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   staleJobNo: { fontSize: 13, fontWeight: '700', color: '#3b82f6' },
//   staleDaysBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, gap: 4 },
//   staleDaysText: { fontSize: 10, fontWeight: '600' },
//   staleCustomerName: { fontSize: 13, fontWeight: '500', color: '#1e293b', marginBottom: 2 },
//   staleDeviceInfo: { fontSize: 11, color: '#64748b', marginBottom: 2 },
//   staleAssignedTo: { fontSize: 11, color: '#475569', marginTop: 2 },
//   staleProgressBarContainer: {
//     backgroundColor: '#f1f5f9',
//     borderRadius: 6,
//     height: 6,
//     overflow: 'hidden',
//     marginTop: 10,
//     marginBottom: 4,
//   },
//   staleProgressBar: {
//     height: '100%',
//     borderRadius: 6,
//   },
//   staleProgressTextContainer: {
//     alignItems: 'flex-end',
//     marginTop: 2,
//   },
//   staleProgressText: {
//     fontSize: 9,
//     fontWeight: '500',
//   },
  
//   // Filter Section
//   filterSection: { backgroundColor: COLORS.white, borderRadius: BORDERS.radius.lg, padding: SPACING.md, marginHorizontal: SPACING.md, marginBottom: SPACING.md, ...SHADOWS.small },
//   searchRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
//   searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray200, borderRadius: BORDERS.radius.md, paddingHorizontal: SPACING.sm, backgroundColor: COLORS.gray50 },
//   searchInput: { flex: 1, paddingVertical: SPACING.sm, fontSize: 13, color: COLORS.gray900 },
//   searchClear: { padding: 4 },
//   filterToggle: { padding: SPACING.sm, backgroundColor: COLORS.gray100, borderRadius: BORDERS.radius.md, position: 'relative' },
//   filterToggleActive: { backgroundColor: COLORS.primary },
//   filterBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.error, borderRadius: 99, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
//   filterBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
//   filtersGrid: { gap: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
//   filterItem: { gap: SPACING.xs },
//   filterLabel: { fontSize: 11, fontWeight: '500', color: COLORS.gray600 },
//   chip: { paddingHorizontal: SPACING.md, paddingVertical: 5, borderRadius: BORDERS.radius.full, marginRight: SPACING.sm, backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.gray200 },
//   chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
//   chipText: { fontSize: 11, color: COLORS.gray700 },
//   chipTextActive: { color: COLORS.white },
//   dateRangeContainer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
//   dateButton: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray200, borderRadius: BORDERS.radius.md, padding: SPACING.sm, gap: 6, backgroundColor: COLORS.gray50 },
//   dateButtonActive: { borderColor: COLORS.primary, backgroundColor: '#eff6ff' },
//   dateText: { fontSize: 12, color: COLORS.gray500 },
//   dateTextActive: { color: COLORS.primary, fontWeight: '500' },
//   dateSeparator: { fontWeight: 'bold', color: COLORS.gray400, fontSize: 14 },
//   actionButtons: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xs },
//   applyButton: { flex: 2, backgroundColor: COLORS.primary, borderRadius: BORDERS.radius.md, padding: SPACING.md, alignItems: 'center' },
//   applyButtonText: { fontWeight: '600', color: COLORS.white, fontSize: 13 },
//   resetButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.gray100, borderRadius: BORDERS.radius.md, padding: SPACING.md, gap: 4 },
//   resetButtonText: { color: COLORS.gray700, fontSize: 12 },
//   exportButtons: { marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
//   excelButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10b98115', borderRadius: BORDERS.radius.md, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, gap: 6 },
//   excelButtonText: { fontWeight: '500', color: COLORS.success, fontSize: 12 },
  
//   // Tabs
//   tabsScroll: { marginHorizontal: SPACING.md, marginBottom: SPACING.sm, flexGrow: 0 },
//   tabsContent: { paddingVertical: 4, flexDirection: 'row', flexWrap: 'wrap' },
//   tab: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDERS.radius.md, marginRight: SPACING.sm, marginBottom: SPACING.xs, borderWidth: 1, borderColor: COLORS.gray200, ...SHADOWS.small },
//   activeTab: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
//   tabText: { fontSize: 11, fontWeight: '500', color: COLORS.gray600, marginLeft: 5 },
//   activeTabText: { color: COLORS.white },
  
//   // Report Container
//   reportContainer: { marginHorizontal: SPACING.md, marginBottom: SPACING.md, backgroundColor: COLORS.white, borderRadius: BORDERS.radius.lg, overflow: 'hidden', ...SHADOWS.small, minHeight: 200 },
  
//   // Status Chip
//   statusChip: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: BORDERS.radius.sm, alignSelf: 'flex-start' },
//   statusChipText: { fontSize: 9, fontWeight: '500' },
  
//   // Section Card
//   sectionCard: { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
//   sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: SPACING.md, backgroundColor: COLORS.gray50 },
//   sectionTitle: { fontWeight: '600', fontSize: 12, color: COLORS.primary, flex: 1 },
  
//   // Grand Total
//   grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, backgroundColor: '#eff6ff', borderTopWidth: 1, borderTopColor: '#bfdbfe' },
//   grandTotalLabel: { fontWeight: '600', fontSize: 13, color: COLORS.gray800 },
//   grandTotalValue: { fontWeight: '700', fontSize: 14, color: COLORS.primary },
  
//   // Empty State
//   emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: SPACING.sm },
//   emptyText: { fontSize: 14, fontWeight: '600', color: COLORS.gray500 },
//   emptySubText: { fontSize: 12, color: COLORS.gray400 },
  
//   // Loader
//   loaderContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: SPACING.md },
//   loaderText: { color: COLORS.gray500, fontSize: 13 },
// });

//-----------------------------------------------------------

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  RefreshControl,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  Clipboard,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
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
  ChevronDown,
  ChevronUp,
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
import { COLORS, SPACING, SHADOWS, BORDERS } from '../../utils/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Enable LayoutAnimation for iOS
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Helper Functions
const formatDate = (value) => {
  if (!value || value === null || value === undefined) return '-';
  if (value instanceof Date && !isNaN(value.getTime())) {
    return `${value.getDate()}/${value.getMonth() + 1}/${value.getFullYear()}`;
  }
  const str = String(value).trim();
  if (!str || str === 'null' || str === 'undefined') return '-';
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) return str;
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
  } catch (e) {}
  return str;
};

const safeNum = (val) => {
  if (val === null || val === undefined || val === '') return 0;
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
  const getStatusColor = (s) => {
    switch (s?.toLowerCase()) {
      case 'received': return { bg: '#E1F5EE', text: '#0F6E56' };
      case 'pending': return { bg: '#FAEEDA', text: '#854F0B' };
      case 'repairing': return { bg: '#F3E8FF', text: '#6D28D9' };
      case 'repaired': return { bg: '#E6F1FB', text: '#185FA5' };
      case 'delivered': return { bg: '#EAF3DE', text: '#3B6D11' };
      default: return { bg: '#F1EFE8', text: '#5F5E5A' };
    }
  };
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
const TableRow = React.memo(({ item, index, columns, onPress }) => (
  <TouchableOpacity onPress={() => onPress && onPress(item._id)} activeOpacity={0.7} disabled={!onPress}>
    <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
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
              style={[styles.tableCell, column.style, column.bold && styles.boldCell]} 
              numberOfLines={column.numberOfLines || 2}
            >
              {value !== undefined && value !== null ? value : '-'}
            </Text>
          </View>
        );
      })}
    </View>
  </TouchableOpacity>
));

// Horizontal Scroll Table - Fixed version with proper scrolling
const HorizontalScrollTable = React.memo(({ columns, data, onPress, grandTotal }) => {
  const totalWidth = useMemo(() => {
    return columns.reduce((sum, col) => sum + (col.width || 120), 0);
  }, [columns]);

  const ListHeaderComponent = useCallback(() => (
    <View style={[styles.tableRow, styles.headerRow]}>
      {columns.map((column, index) => (
        <View 
          key={index} 
          style={[styles.tableHeaderCellContainer, { width: column.width, minWidth: column.width }]}
        >
          <Text 
            style={[styles.tableHeaderCell, column.style]}
            numberOfLines={2}
          >
            {column.label}
          </Text>
        </View>
      ))}
    </View>
  ), [columns]);

  const ListFooterComponent = useCallback(() => {
    if (grandTotal !== undefined && grandTotal > 0 && data.length > 0) {
      return (
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Grand Total</Text>
          <Text style={styles.grandTotalValue}>₹{grandTotal.toLocaleString()}</Text>
        </View>
      );
    }
    return null;
  }, [grandTotal, data.length]);

  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <View style={styles.horizontalScrollContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        nestedScrollEnabled={true}
        style={styles.horizontalScrollView}
      >
        <View style={{ width: totalWidth }}>
          {ListHeaderComponent()}
          <ScrollView 
            vertical
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            style={styles.tableVerticalScrollView}
          >
            {data.map((item, index) => (
              <TableRow 
                key={item._id || index}
                item={item} 
                index={index} 
                columns={columns}
                onPress={onPress}
              />
            ))}
            {ListFooterComponent()}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
});

// Stale Job Item Component
const StaleJobItem = React.memo(({ job, maxDays, onPress }) => {
  const getUrgencyColor = useCallback((d) => {
    if (d >= 7) return { bar: '#ef4444', badge: '#fee2e2', badgeText: '#991b1b' };
    if (d >= 3) return { bar: '#f59e0b', badge: '#fef3c7', badgeText: '#92400e' };
    return { bar: '#3b82f6', badge: '#dbeafe', badgeText: '#1e40af' };
  }, []);

  const urgency = getUrgencyColor(job.staleDays);
  const pct = Math.min((job.staleDays / maxDays) * 100, 100);

  return (
    <TouchableOpacity onPress={() => onPress(job._id)} activeOpacity={0.7} style={styles.staleJobCard}>
      <View style={styles.staleJobHeader}>
        <Text style={styles.staleJobNo}>{job.jobSheetNo}</Text>
        <View style={[styles.staleDaysBadge, { backgroundColor: urgency.badge }]}>
          <Clock size={10} color={urgency.badgeText} />
          <Text style={[styles.staleDaysText, { color: urgency.badgeText }]}>
            {job.staleDays}d
          </Text>
        </View>
      </View>
      <Text style={styles.staleCustomerName} numberOfLines={1}>{job.customerName}</Text>
      <Text style={styles.staleDeviceInfo} numberOfLines={1}>
        {job.make} {job.model}
      </Text>
      {job.assignedTo && (
        <Text style={styles.staleAssignedTo}>
          <Wrench size={10} color="#475569" /> {job.assignedTo}
        </Text>
      )}
      <View style={styles.staleProgressBarContainer}>
        <View style={[styles.staleProgressBar, { width: `${pct}%`, backgroundColor: urgency.bar }]} />
      </View>
      <View style={styles.staleProgressTextContainer}>
        <Text style={[styles.staleProgressText, { color: urgency.bar }]}>
          {Math.round(pct)}% completed
        </Text>
      </View>
    </TouchableOpacity>
  );
});

// Stale Jobs Widget
const StaleJobsWidget = React.memo(() => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { jobs, loading, error } = useSelector(state => state.staleJobs);
  const [days, setDays] = useState(3);
  const [collapsed, setCollapsed] = useState(false);
  const [showDaysDropdown, setShowDaysDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchStaleJobs({ days }));
  }, [days, dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchStaleJobs({ days }));
  }, [days, dispatch]);

  const navigateToJobDetail = useCallback((jobId) => {
    navigation.navigate('JobSheet', {
      screen: 'JobDetail',
      params: { jobId, id: jobId }
    });
  }, [navigation]);

  const toggleCollapse = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed(!collapsed);
  }, [collapsed]);

  if (error) {
    return (
      <View style={styles.staleWidgetContainer}>
        <View style={styles.staleHeader}>
          <View style={styles.staleHeaderLeft}>
            <AlertCircle size={17} color="#ef4444" />
            <Text style={[styles.staleHeaderTitle, { color: '#ef4444' }]}>Connection Error</Text>
          </View>
          <TouchableOpacity onPress={handleRefresh} style={styles.staleRefreshBtn}>
            <RefreshCw size={14} color="#64748b" />
          </TouchableOpacity>
        </View>
        <View style={styles.staleErrorContainer}>
          <Text style={styles.staleErrorText}>{error}</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.staleErrorRetryBtn}>
            <Text style={styles.staleErrorRetryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (jobs.length === 0 && !loading) return null;

  const maxDays = jobs.length > 0 ? Math.max(...jobs.map(j => j.staleDays)) : 1;

  return (
    <View style={styles.staleWidgetContainer}>
      <TouchableOpacity onPress={toggleCollapse} activeOpacity={0.7} style={styles.staleHeader}>
        <View style={styles.staleHeaderLeft}>
          <View style={styles.staleIconContainer}>
            <AlertCircle size={17} color="#fbbf24" />
          </View>
          <Text style={styles.staleHeaderTitle}>Stale Jobs Alert</Text>
          <View style={styles.staleCountBadge}>
            <Text style={styles.staleCountText}>{loading ? '…' : jobs.length}</Text>
          </View>
        </View>
        <View style={styles.staleHeaderRight}>
          <View style={styles.staleControls}>
            <TouchableOpacity onPress={() => setShowDaysDropdown(!showDaysDropdown)} style={styles.staleDaysSelector}>
              <Text style={styles.staleDaysSelectorText}>{days}+ days</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRefresh} style={styles.staleRefreshBtn}>
              <RefreshCw size={14} color="#64748b" />
            </TouchableOpacity>
          </View>
          <Text style={styles.staleToggleIcon}>{collapsed ? '▼' : '▲'}</Text>
        </View>
      </TouchableOpacity>

      {showDaysDropdown && (
        <View style={styles.staleDropdownContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 3, 5, 7].map(day => (
              <TouchableOpacity
                key={day}
                style={[styles.staleDropdownItem, days === day && styles.staleDropdownItemActive]}
                onPress={() => { setDays(day); setShowDaysDropdown(false); }}
              >
                <Text style={[styles.staleDropdownText, days === day && styles.staleDropdownTextActive]}>
                  {day}+ day{day > 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {!collapsed && (
        <View style={styles.staleBody}>
          {loading ? (
            <View style={styles.staleLoadingContainer}>
              <ActivityIndicator size="small" color="#334155" />
              <Text style={styles.staleLoadingText}>Loading stale jobs...</Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.staleJobsList}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {jobs.map((job) => (
                <StaleJobItem 
                  key={job._id}
                  job={job} 
                  maxDays={maxDays} 
                  onPress={navigateToJobDetail}
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}
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
    { label: 'Total', value: `₹${stats.totalAmount.toLocaleString()}`, color: '#ffffff', bg: '#6366f1', icon: <CreditCard size={20} color="#fff" /> },
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

// Main Component
export default function ReportsScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  // Selectors
  const {
    engineerReport,
    noEngineerJobs,
    valueReport,
    spareReport,
    dealerReport,
    dailySummary,
    pendingReport,
    deliveredNRNA,
    loading: reportLoading,
  } = useSelector(state => state.reports);
  const { list, loading: jobsLoading } = useSelector(state => state.jobs);

  const loading = reportLoading || jobsLoading;

  // State
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    status: 'All Status',
    engineer: '',
    dealer: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  // Memoized Stats
  const countStats = useMemo(() => {
    const allJobs = list || [];
    return {
      received: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Received').length,
      pending: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Pending').length,
      repaired: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Repaired').length,
      delivered: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Delivered').length,
      nrna: allJobs.filter(j => (j.device?.mobileStatus || j.status) === 'Delivered NR/NA').length,
      serviceCharge: allJobs.reduce((s, j) => s + safeNum(j.serviceCharges ?? j.service?.serviceCharge ?? 0), 0),
      spareCharge: allJobs.reduce((s, j) => s + safeNum(j.spareCharges ?? j.service?.spareCharge ?? 0), 0),
      totalAmount: allJobs.reduce((s, j) => s + safeNum(j.totalAmount ?? (safeNum(j.serviceCharges) + safeNum(j.spareCharges))), 0),
    };
  }, [list]);

  // Memoized Filtered Data
  const filteredList = useMemo(() => {
    if (!list?.length) return [];
    if (!filters.search.trim()) return list;
    const q = filters.search.toLowerCase();
    return list.filter(j => 
      (j.customer?.name || '').toLowerCase().includes(q) ||
      (j.customer?.contact || '').includes(q) ||
      (j.jobSheetNo || '').toLowerCase().includes(q) ||
      (j.device?.imei || '').includes(q)
    );
  }, [list, filters.search]);

  const filteredPending = useMemo(() => {
    if (!pendingReport?.length) return [];
    if (!filters.search.trim()) return pendingReport;
    const q = filters.search.toLowerCase();
    return pendingReport.filter(j =>
      (j.customer?.name || '').toLowerCase().includes(q) ||
      (j.customer?.contact || '').includes(q) ||
      (j.jobSheetNo || '').toLowerCase().includes(q)
    );
  }, [pendingReport, filters.search]);

  // Calculate totals
  const valueReportTotal = useMemo(() => {
    return (valueReport || []).reduce((sum, item) => sum + safeNum(item.total), 0);
  }, [valueReport]);

  const spareReportTotal = useMemo(() => {
    return (spareReport || []).reduce((sum, item) => sum + safeNum(item.amount), 0);
  }, [spareReport]);

  const dailyReportTotal = useMemo(() => {
    return (dailySummary || []).reduce((sum, item) => sum + safeNum(item.count), 0);
  }, [dailySummary]);

  // Column Configurations with proper widths
  const allReportsColumns = useMemo(() => [
    { label: '#', key: 'index', style: styles.cellSl, width: 60 },
    { label: 'Job No', key: 'jobSheetNo', style: styles.cellJobNo, width: 120 },
    { label: 'Customer', key: 'customerName', style: styles.cellCustomer, width: 180, render: (item) => item.customer?.name },
    { label: 'Contact', key: 'customerContact', style: styles.cellContact, width: 130, render: (item) => item.customer?.contact },
    { label: 'Device', key: 'device', style: styles.cellDevice, width: 200, render: (item) => `${item.device?.make || ''} ${item.device?.model || ''}`.trim() },
    { label: 'Status', key: 'status', style: styles.cellStatus, width: 120, render: (item) => <StatusChip status={item.device?.mobileStatus || item.status} /> },
    { label: 'Date', key: 'createdAt', style: styles.cellDate, width: 120, render: (item) => formatDate(item.createdAt) },
  ], []);

  const valueColumns = useMemo(() => [
    { label: '#', key: 'index', style: styles.cellSl, width: 60 },
    { label: 'Job No', key: 'jobNo', style: styles.cellJobNoSmall, width: 100 },
    { label: 'Customer', key: 'name', style: styles.cellCustomerValue, width: 180 },
    { label: 'Service', key: 'service', style: styles.cellAmount, width: 120, render: (item) => `₹${safeNum(item.service).toLocaleString()}` },
    { label: 'Spare', key: 'spare', style: styles.cellAmount, width: 120, render: (item) => `₹${safeNum(item.spare).toLocaleString()}` },
    { label: 'Total', key: 'total', style: [styles.cellAmount, styles.boldCell], width: 130, render: (item) => `₹${safeNum(item.total).toLocaleString()}`, bold: true },
  ], []);

  const spareColumns = useMemo(() => [
    { label: '#', key: 'index', style: styles.cellSl, width: 60 },
    { label: 'Job No', key: 'jobSheet', style: styles.cellJobNoSmall, width: 100 },
    { label: 'Spare Part', key: 'spare', style: styles.cellSpareName, width: 220 },
    { label: 'Qty', key: 'qty', style: styles.cellSmallNumber, width: 80, render: (item) => safeNum(item.qty) },
    { label: 'Rate', key: 'rate', style: styles.cellAmount, width: 120, render: (item) => `₹${safeNum(item.rate).toLocaleString()}` },
    { label: 'Amount', key: 'amount', style: [styles.cellAmount, styles.boldCell], width: 130, render: (item) => `₹${safeNum(item.amount).toLocaleString()}`, bold: true },
  ], []);

  const dailyColumns = useMemo(() => [
    { label: 'Date', key: 'date', style: styles.cellDateLarge, width: 150 },
    { label: 'Count', key: 'count', style: styles.cellCountLarge, width: 120, render: (item) => safeNum(item.count) },
  ], []);

  const pendingColumns = useMemo(() => [
    { label: '#', key: 'index', style: styles.cellSl, width: 60 },
    { label: 'Job No', key: 'jobSheetNo', style: styles.cellJobNo, width: 120 },
    { label: 'Customer', key: 'customerName', style: styles.cellCustomer, width: 180, render: (item) => item.customer?.name },
    { label: 'Contact', key: 'customerContact', style: styles.cellContact, width: 130, render: (item) => item.customer?.contact },
    { label: 'Device', key: 'device', style: styles.cellDevice, width: 200, render: (item) => `${item.device?.make || ''} ${item.device?.model || ''}`.trim() },
    { label: 'Date', key: 'createdAt', style: styles.cellDate, width: 120, render: (item) => formatDate(item.createdAt) },
  ], []);

  const dealerColumns = useMemo(() => [
    { label: '#', key: 'index', style: styles.cellSl, width: 60 },
    { label: 'Job No', key: 'jobSheetNo', style: styles.cellJobNo, width: 120 },
    { label: 'Customer', key: 'customerName', style: styles.cellCustomer, width: 180, render: (item) => item.customer?.name },
    { label: 'Contact', key: 'customerContact', style: styles.cellContact, width: 130, render: (item) => item.customer?.contact },
    { label: 'Dealer', key: 'dealerName', style: styles.cellDealerName, width: 150, render: (item) => item.dealerName || item.dealer },
    { label: 'Status', key: 'status', style: styles.cellStatus, width: 120, render: (item) => <StatusChip status={item.device?.mobileStatus || item.status} /> },
  ], []);

  const nrnaColumns = useMemo(() => [
    { label: '#', key: 'index', style: styles.cellSl, width: 60 },
    { label: 'Job No', key: 'jobSheetNo', style: styles.cellJobNo, width: 120 },
    { label: 'Customer', key: 'customerName', style: styles.cellCustomer, width: 180, render: (item) => item.customer?.name },
    { label: 'Contact', key: 'customerContact', style: styles.cellContact, width: 130, render: (item) => item.customer?.contact },
    { label: 'Delivered Date', key: 'deliveredDate', style: styles.cellDate, width: 130, render: (item) => formatDate(item.deliveredDate) },
    { label: 'Physical Cond.', key: 'physicalCond', style: styles.cellPhysCond, width: 200, render: (item) => 
      Array.isArray(item.physicalConditions) ? item.physicalConditions.join(', ') : item.physicalCondition || '-' 
    },
  ], []);

  const engineerColumns = useMemo(() => [
    { label: '#', key: 'index', style: styles.cellSl, width: 60 },
    { label: 'Job No', key: 'jobSheetNo', style: styles.cellJobNo, width: 120 },
    { label: 'Customer', key: 'customerName', style: styles.cellCustomer, width: 180, render: (item) => item.customer?.name },
    { label: 'Contact', key: 'customerContact', style: styles.cellContact, width: 130, render: (item) => item.customer?.contact },
    { label: 'Status', key: 'status', style: styles.cellStatus, width: 120, render: (item) => <StatusChip status={item.device?.mobileStatus || item.status} /> },
    { label: 'Date', key: 'createdAt', style: styles.cellDate, width: 120, render: (item) => formatDate(item.createdAt) },
  ], []);

  // Callbacks
  const loadReport = useCallback((tabId, fd, td, sf, se, sd) => {
    const filterParams = { fromDate: fd, toDate: td };
    if (sf !== 'All Status') filterParams.status = sf;
    
    const actions = {
      engineer: () => dispatch(fetchEngineerWiseReport(filterParams)),
      value: () => dispatch(fetchValueReport(filterParams)),
      spare: () => dispatch(fetchSpareReport({ ...filterParams, engineerId: se })),
      dealer: () => dispatch(fetchDealerReport({ dealerName: sd, fromDate: fd, toDate: td })),
      all: () => dispatch(fetchJobs(filterParams)),
      dailyReceived: () => dispatch(fetchDailySummary({ type: 'received', fromDate: fd, toDate: td })),
      dailyDelivered: () => dispatch(fetchDailySummary({ type: 'delivered', fromDate: fd, toDate: td })),
      dailyRepaired: () => dispatch(fetchDailySummary({ type: 'repaired', fromDate: fd, toDate: td })),
      repairPending: () => dispatch(fetchPendingReport({ type: 'repairPending', fromDate: fd, toDate: td })),
      deliveryPending: () => dispatch(fetchPendingReport({ type: 'deliveryPending', fromDate: fd, toDate: td })),
      deliveredNRNA: () => dispatch(fetchDeliveredNRNAReport({ fromDate: fd, toDate: td })),
    };
    
    actions[tabId]?.();
  }, [dispatch]);

  const handleTabPress = useCallback((tabId) => {
    setActiveTab(tabId);
    setExpandedSections({});
    loadReport(tabId, filters.fromDate, filters.toDate, filters.status, filters.engineer, filters.dealer);
  }, [loadReport, filters]);

  const handleApplyFilter = useCallback(() => {
    loadReport(activeTab, filters.fromDate, filters.toDate, filters.status, filters.engineer, filters.dealer);
  }, [loadReport, activeTab, filters]);

  const resetFilters = useCallback(() => {
    setFilters({
      fromDate: '',
      toDate: '',
      status: 'All Status',
      engineer: '',
      dealer: '',
      search: '',
    });
    loadReport(activeTab, '', '', 'All Status', '', '');
  }, [loadReport, activeTab]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReport(activeTab, filters.fromDate, filters.toDate, filters.status, filters.engineer, filters.dealer);
    setRefreshing(false);
  }, [loadReport, activeTab, filters]);

  const toggleSection = useCallback((sectionId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }, []);

  const navigateToJobDetail = useCallback((jobId) => {
    navigation.navigate('JobSheet', {
      screen: 'JobDetail',
      params: { jobId, id: jobId }
    });
  }, [navigation]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.fromDate) count++;
    if (filters.toDate) count++;
    if (filters.status !== 'All Status') count++;
    if (filters.engineer) count++;
    if (filters.dealer) count++;
    return count;
  }, [filters]);

  // Fixed Export to Excel function
  const handleExportToExcel = useCallback(async () => {
    let exportData = [];
    let filename = '';

    switch (activeTab) {
      case 'all':
        exportData = filteredList;
        filename = 'All_Reports';
        break;
      case 'engineer':
        exportData = [...(noEngineerJobs || []), ...(engineerReport || []).flatMap(e => e.jobs || [])];
        filename = 'Engineer_Wise_Report';
        break;
      case 'value':
        exportData = valueReport || [];
        filename = 'Value_Report';
        break;
      case 'spare':
        exportData = spareReport || [];
        filename = 'Spare_Parts_Report';
        break;
      case 'dealer':
        exportData = dealerReport || [];
        filename = 'Dealer_Report';
        break;
      case 'repairPending':
      case 'deliveryPending':
        exportData = filteredPending;
        filename = activeTab === 'repairPending' ? 'Repair_Pending_Report' : 'Delivery_Pending_Report';
        break;
      case 'dailyReceived':
      case 'dailyDelivered':
      case 'dailyRepaired':
        exportData = dailySummary || [];
        filename = `${activeTab}_Report`;
        break;
      case 'deliveredNRNA':
        exportData = deliveredNRNA || [];
        filename = 'Delivered_NR_NA_Report';
        break;
      default:
        exportData = filteredList;
        filename = 'Reports';
    }

    if (!exportData || exportData.length === 0) {
      Alert.alert('No Data', 'There is no data to export');
      return;
    }

    try {
      // Prepare rows
      const rows = exportData.map((item, idx) => {
        const baseRow = {
          'SL No': idx + 1,
          'Job No': item.jobSheetNo || item.jobNo || '-',
          'Customer': item.customer?.name || item.customerName || item.name || '-',
          'Contact': item.customer?.contact || item.contact || '-',
          'Device': `${item.device?.make || item.makeId || ''} ${item.device?.model || item.modelId || ''}`.trim() || '-',
          'Status': item.device?.mobileStatus || item.status || '-',
          'Date': formatDate(item.createdAt || item.date || item.savedDate),
        };
        
        // Add additional fields based on report type
        if (activeTab === 'value') {
          baseRow['Service (₹)'] = safeNum(item.service);
          baseRow['Spare (₹)'] = safeNum(item.spare);
          baseRow['Total (₹)'] = safeNum(item.total);
        }
        
        if (activeTab === 'spare') {
          baseRow['Spare Part'] = item.spare;
          baseRow['Qty'] = safeNum(item.qty);
          baseRow['Rate (₹)'] = safeNum(item.rate);
          baseRow['Amount (₹)'] = safeNum(item.amount);
        }
        
        if (activeTab === 'dealer') {
          baseRow['Dealer'] = item.dealerName || item.dealer;
        }
        
        return baseRow;
      });

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(rows);
      
      // Auto-size columns
      const colWidths = [];
      if (rows.length > 0) {
        Object.keys(rows[0]).forEach((key, idx) => {
          let maxLen = key.length;
          rows.forEach(row => {
            const val = String(row[key] || '-');
            maxLen = Math.max(maxLen, Math.min(val.length, 40));
          });
          colWidths[idx] = { wch: Math.min(maxLen + 2, 50) };
        });
        ws['!cols'] = colWidths;
      }
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, filename);
      
      // Write to base64
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      
      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fullFilename = `${filename}_${timestamp}.xlsx`;
      
      // Save to app cache directory (no permissions needed)
      const filePath = `${RNFS.CachesDirectoryPath}/${fullFilename}`;
      await RNFS.writeFile(filePath, wbout, 'base64');
      
      // Verify file exists
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        throw new Error('File was not created successfully');
      }
      
      // Show success dialog with options
      Alert.alert(
        'Export Successful',
        `File "${fullFilename}" has been created.\n\nFile location: ${filePath}`,
        [
          { text: 'OK', style: 'default' },
          {
            text: 'Share',
            onPress: async () => {
              try {
                await Share.open({
                  url: `file://${filePath}`,
                  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  title: 'Share Excel Report',
                  failOnCancel: false,
                });
              } catch (shareError) {
                console.log('Share error:', shareError);
                Alert.alert('Info', 'Could not open share dialog. File is saved in app cache.');
              }
            }
          },
          {
            text: 'Copy Path',
            onPress: () => {
              Clipboard.setString(filePath);
              Alert.alert('Copied', 'File path copied to clipboard');
            }
          }
        ]
      );
      
      // Clean up after 5 minutes
      setTimeout(async () => {
        try {
          if (await RNFS.exists(filePath)) {
            await RNFS.unlink(filePath);
            console.log('Cleaned up file:', filePath);
          }
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }, 300000);
      
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', error.message || 'Could not export the file. Please try again.');
    }
  }, [activeTab, filteredList, valueReport, spareReport, dealerReport, pendingReport, engineerReport, noEngineerJobs, dailySummary, deliveredNRNA, filteredPending]);

  useEffect(() => {
    loadReport('all', '', '', 'All Status', '', '');
  }, []);

  // Render Functions
  const renderEngineerReport = useCallback(() => {
    const sections = [];
    if (noEngineerJobs?.length > 0)
      sections.push({ title: `Unassigned (${noEngineerJobs.length} jobs)`, data: noEngineerJobs });
    (engineerReport || []).forEach(eng =>
      sections.push({ title: `${eng.engineer} (${(eng.jobs || []).length} jobs)`, data: eng.jobs || [] })
    );
    
    if (sections.length === 0) return <EmptyState />;
    
    return sections.map((section, idx) => (
      <View key={idx} style={styles.sectionCard}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(`engineer_${idx}`)}>
          <Wrench size={14} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {expandedSections[`engineer_${idx}`] ? <ChevronUp size={14} color={COLORS.gray600} /> : <ChevronDown size={14} color={COLORS.gray600} />}
        </TouchableOpacity>
        {(expandedSections[`engineer_${idx}`] === undefined || expandedSections[`engineer_${idx}`]) && (
          <HorizontalScrollTable 
            columns={engineerColumns} 
            data={section.data} 
            onPress={navigateToJobDetail}
          />
        )}
      </View>
    ));
  }, [engineerReport, noEngineerJobs, expandedSections, toggleSection, engineerColumns, navigateToJobDetail]);

  const renderDailyReport = useCallback(() => {
    const sortedData = [...(dailySummary || [])].sort((a, b) => {
      const parseDate = (s) => {
        if (!s || s === '-') return new Date(0);
        const parts = s.split('/');
        if (parts.length === 3) {
          return new Date(parts[2], parts[1] - 1, parts[0]);
        }
        return new Date(s);
      };
      return parseDate(a.date) - parseDate(b.date);
    });
    
    return (
      <HorizontalScrollTable 
        columns={dailyColumns} 
        data={sortedData} 
        grandTotal={dailyReportTotal}
      />
    );
  }, [dailySummary, dailyColumns, dailyReportTotal]);

  // Main render
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
        }
        nestedScrollEnabled={true}
      >
        <SummaryCards stats={countStats} />
        <StaleJobsWidget />
        
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
                <TouchableOpacity onPress={() => updateFilter('search', '')} style={styles.searchClear}>
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
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Status</Text>
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
              </View>

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
                  <X size={15} color={COLORS.gray600} />
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.exportButtons}>
            <TouchableOpacity style={styles.excelButton} onPress={handleExportToExcel}>
              <Download size={16} color={COLORS.success} />
              <Text style={styles.excelButtonText}>Export to Excel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
          {REPORT_TABS.map(tab => (
            <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onPress={handleTabPress} />
          ))}
        </ScrollView>

        {/* Report Content */}
        <View style={styles.reportContainer}>
          {loading && !refreshing && 
           ((activeTab === 'all' && filteredList.length === 0) ||
            (activeTab === 'repairPending' && filteredPending.length === 0)) ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loaderText}>Loading report...</Text>
            </View>
          ) : (
            <>
              {activeTab === 'all' && <HorizontalScrollTable columns={allReportsColumns} data={filteredList} onPress={navigateToJobDetail} />}
              {activeTab === 'engineer' && renderEngineerReport()}
              {activeTab === 'value' && <HorizontalScrollTable columns={valueColumns} data={valueReport || []} grandTotal={valueReportTotal} />}
              {activeTab === 'spare' && <HorizontalScrollTable columns={spareColumns} data={spareReport || []} grandTotal={spareReportTotal} />}
              {activeTab === 'dealer' && <HorizontalScrollTable columns={dealerColumns} data={dealerReport || []} onPress={navigateToJobDetail} />}
              {(activeTab === 'dailyReceived' || activeTab === 'dailyDelivered' || activeTab === 'dailyRepaired') && renderDailyReport()}
              {(activeTab === 'repairPending' || activeTab === 'deliveryPending') && <HorizontalScrollTable columns={pendingColumns} data={filteredPending} onPress={navigateToJobDetail} />}
              {activeTab === 'deliveredNRNA' && <HorizontalScrollTable columns={nrnaColumns} data={deliveredNRNA || []} onPress={navigateToJobDetail} />}
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
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray50 },
  mainScrollView: { flex: 1 },
  
  // Horizontal Scroll Table Styles
  horizontalScrollContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.white,
    minHeight: 300,
  },
  horizontalScrollView: {
    flex: 1,
    width: '100%',
  },
  tableVerticalScrollView: {
    maxHeight: SCREEN_HEIGHT - 400,
    minHeight: 200,
  },
  tableHeaderCellContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  tableCellContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  
  // Table Row Styles
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.gray200,
    minHeight: 44,
  },
  headerRow: {
    backgroundColor: COLORS.primary,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  rowEven: { backgroundColor: COLORS.white },
  rowOdd: { backgroundColor: COLORS.gray50 },
  tableCell: { 
    fontSize: 11, 
    color: COLORS.gray800,
    flexWrap: 'wrap',
  },
  boldCell: { fontWeight: '700', color: COLORS.gray900 },
  
  // Cell width styles
  cellSl: { textAlign: 'center' },
  cellJobNo: {},
  cellJobNoSmall: {},
  cellCustomer: {},
  cellCustomerValue: {},
  cellContact: {},
  cellDevice: {},
  cellStatus: {},
  cellDate: {},
  cellDateLarge: {},
  cellCountLarge: { textAlign: 'center' },
  cellAmount: { textAlign: 'right' },
  cellSmallNumber: { textAlign: 'center' },
  cellSpareName: {},
  cellDealerName: {},
  cellPhysCond: {},
  
  // Summary Cards
  summaryScroll: { flexGrow: 0 },
  summaryContainer: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm },
  summaryCard: { 
    minWidth: 90, 
    backgroundColor: COLORS.white, 
    borderRadius: BORDERS.radius.md, 
    padding: SPACING.md, 
    alignItems: 'center',
    ...SHADOWS.small,
  },
  summaryLabel: { fontSize: 11, color: COLORS.gray500, marginTop: 4, textAlign: 'center' },
  summaryValue: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  
  // Stale Jobs Widget
  staleWidgetContainer: {
    backgroundColor: '#fff',
    borderRadius: BORDERS.radius.lg,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  staleHeader: {
    backgroundColor: '#fffbeb',
    padding: SPACING.md,
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
  staleCountBadge: { backgroundColor: '#fee2e2', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  staleCountText: { color: '#dc2626', fontSize: 11, fontWeight: '700' },
  staleHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  staleControls: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  staleDaysSelector: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#fcd34d', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  staleDaysSelectorText: { color: '#78350f', fontSize: 11, fontWeight: '600' },
  staleRefreshBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#fcd34d', borderRadius: 6, padding: 4 },
  staleToggleIcon: { color: '#92400e', fontSize: 14, fontWeight: '600' },
  staleDropdownContainer: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#fcd34d', borderRadius: 8, margin: 8, padding: 6, elevation: 3 },
  staleDropdownItem: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  staleDropdownItemActive: { backgroundColor: '#fef3c7' },
  staleDropdownText: { fontSize: 12, color: '#64748b' },
  staleDropdownTextActive: { color: '#78350f', fontWeight: '600' },
  staleBody: { paddingHorizontal: 12, paddingTop: 12, maxHeight: 400 },
  staleJobsList: { maxHeight: 350 },
  staleLoadingContainer: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  staleLoadingText: { color: '#334155', fontSize: 12 },
  staleErrorContainer: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  staleErrorText: { color: '#ef4444', fontSize: 12, textAlign: 'center' },
  staleErrorRetryBtn: { backgroundColor: '#ef4444', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  staleErrorRetryText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  staleJobCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    ...SHADOWS.small,
  },
  staleJobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  staleJobNo: { fontSize: 13, fontWeight: '700', color: '#3b82f6' },
  staleDaysBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, gap: 4 },
  staleDaysText: { fontSize: 10, fontWeight: '600' },
  staleCustomerName: { fontSize: 13, fontWeight: '500', color: '#1e293b', marginBottom: 2 },
  staleDeviceInfo: { fontSize: 11, color: '#64748b', marginBottom: 2 },
  staleAssignedTo: { fontSize: 11, color: '#475569', marginTop: 2 },
  staleProgressBarContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    height: 6,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 4,
  },
  staleProgressBar: {
    height: '100%',
    borderRadius: 6,
  },
  staleProgressTextContainer: {
    alignItems: 'flex-end',
    marginTop: 2,
  },
  staleProgressText: {
    fontSize: 9,
    fontWeight: '500',
  },
  
  // Filter Section
  filterSection: { backgroundColor: COLORS.white, borderRadius: BORDERS.radius.lg, padding: SPACING.md, marginHorizontal: SPACING.md, marginBottom: SPACING.md, ...SHADOWS.small },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray200, borderRadius: BORDERS.radius.md, paddingHorizontal: SPACING.sm, backgroundColor: COLORS.gray50 },
  searchInput: { flex: 1, paddingVertical: SPACING.sm, fontSize: 13, color: COLORS.gray900 },
  searchClear: { padding: 4 },
  filterToggle: { padding: SPACING.sm, backgroundColor: COLORS.gray100, borderRadius: BORDERS.radius.md, position: 'relative' },
  filterToggleActive: { backgroundColor: COLORS.primary },
  filterBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.error, borderRadius: 99, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
  filtersGrid: { gap: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  filterItem: { gap: SPACING.xs },
  filterLabel: { fontSize: 11, fontWeight: '500', color: COLORS.gray600 },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: 5, borderRadius: BORDERS.radius.full, marginRight: SPACING.sm, backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.gray200 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 11, color: COLORS.gray700 },
  chipTextActive: { color: COLORS.white },
  dateRangeContainer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dateButton: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray200, borderRadius: BORDERS.radius.md, padding: SPACING.sm, gap: 6, backgroundColor: COLORS.gray50 },
  dateButtonActive: { borderColor: COLORS.primary, backgroundColor: '#eff6ff' },
  dateText: { fontSize: 12, color: COLORS.gray500 },
  dateTextActive: { color: COLORS.primary, fontWeight: '500' },
  dateSeparator: { fontWeight: 'bold', color: COLORS.gray400, fontSize: 14 },
  actionButtons: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xs },
  applyButton: { flex: 2, backgroundColor: COLORS.primary, borderRadius: BORDERS.radius.md, padding: SPACING.md, alignItems: 'center' },
  applyButtonText: { fontWeight: '600', color: COLORS.white, fontSize: 13 },
  resetButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.gray100, borderRadius: BORDERS.radius.md, padding: SPACING.md, gap: 4 },
  resetButtonText: { color: COLORS.gray700, fontSize: 12 },
  exportButtons: { marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  excelButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10b98115', borderRadius: BORDERS.radius.md, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, gap: 6 },
  excelButtonText: { fontWeight: '500', color: COLORS.success, fontSize: 12 },
  
  // Tabs
  tabsScroll: { marginHorizontal: SPACING.md, marginBottom: SPACING.sm, flexGrow: 0 },
  tabsContent: { paddingVertical: 4, flexDirection: 'row', flexWrap: 'wrap' },
  tab: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDERS.radius.md, marginRight: SPACING.sm, marginBottom: SPACING.xs, borderWidth: 1, borderColor: COLORS.gray200, ...SHADOWS.small },
  activeTab: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: 11, fontWeight: '500', color: COLORS.gray600, marginLeft: 5 },
  activeTabText: { color: COLORS.white },
  
  // Report Container
  reportContainer: { marginHorizontal: SPACING.md, marginBottom: SPACING.md, backgroundColor: COLORS.white, borderRadius: BORDERS.radius.lg, overflow: 'hidden', ...SHADOWS.small, minHeight: 200 },
  
  // Status Chip
  statusChip: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: BORDERS.radius.sm, alignSelf: 'flex-start' },
  statusChipText: { fontSize: 9, fontWeight: '500' },
  
  // Section Card
  sectionCard: { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: SPACING.md, backgroundColor: COLORS.gray50 },
  sectionTitle: { fontWeight: '600', fontSize: 12, color: COLORS.primary, flex: 1 },
  
  // Grand Total
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, backgroundColor: '#eff6ff', borderTopWidth: 1, borderTopColor: '#bfdbfe' },
  grandTotalLabel: { fontWeight: '600', fontSize: 13, color: COLORS.gray800 },
  grandTotalValue: { fontWeight: '700', fontSize: 14, color: COLORS.primary },
  
  // Empty State
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: SPACING.sm },
  emptyText: { fontSize: 14, fontWeight: '600', color: COLORS.gray500 },
  emptySubText: { fontSize: 12, color: COLORS.gray400 },
  
  // Loader
  loaderContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: SPACING.md },
  loaderText: { color: COLORS.gray500, fontSize: 13 },
});