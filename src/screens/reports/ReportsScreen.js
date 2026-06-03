// import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
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
//   Platform,
// } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import RNPrint from 'react-native-print';
// import ViewShot from 'react-native-view-shot';
// import {
//   Calendar,
//   Printer,
//   Download,
//   Filter,
//   X,
//   ClipboardList,
//   Wrench,
//   DollarSign,
//   Settings,
//   Store,
//   Inbox,
//   Send,
//   Hammer,
//   Clock,
//   Truck,
//   AlertTriangle,
//   Search,
//   TrendingUp,
//   Package,
//   Users,
//   FileText,
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
// import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';

// // ─── FIXED: Date Formatter ─────────────────────────────────────────────────
// const formatDate = (value) => {
//   if (!value || value === null || value === undefined) return '-';
  
//   // If already a Date object
//   if (value instanceof Date && !isNaN(value.getTime())) {
//     return `${value.getDate()}/${value.getMonth() + 1}/${value.getFullYear()}`;
//   }
  
//   const str = String(value).trim();
//   if (!str || str === 'null' || str === 'undefined' || str === 'NaN' || str === 'Invalid Date') return '-';

//   // Already a short date string like "1/6/2026" or "28/5/2026"
//   if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) return str;

//   // ISO format or timestamp
//   try {
//     const d = new Date(str);
//     if (!isNaN(d.getTime())) {
//       const day = d.getDate();
//       const month = d.getMonth() + 1;
//       const year = d.getFullYear();
//       return `${day}/${month}/${year}`;
//     }
//   } catch (e) {
//     console.warn('Date parsing failed for:', str);
//   }

//   return str;
// };

// // ─── FIXED: Safe number formatter ─────────────────────────────────────────
// const safeNum = (val) => {
//   if (val === null || val === undefined || val === '' || val === 'null' || val === 'undefined') return 0;
//   const n = Number(val);
//   return isNaN(n) || !isFinite(n) ? 0 : n;
// };

// // ─── FIXED: Safe string formatter ─────────────────────────────────────────
// const safeStr = (val, fallback = '-') => {
//   if (val === null || val === undefined) return fallback;
//   if (Array.isArray(val)) {
//     return val.filter(Boolean).join(', ') || fallback;
//   }
//   const s = String(val).trim();
//   if (!s || s === 'null' || s === 'undefined' || s === 'NaN' || s === 'nan') return fallback;
//   return s;
// };

// // ─── FIXED: Deep field getter ─────────────────────────────────────────────
// const getField = (obj, fieldName, defaultValue = '-') => {
//   if (!obj) return defaultValue;

//   // Handle nested objects like 'customer.name'
//   if (fieldName.includes('.')) {
//     const parts = fieldName.split('.');
//     let current = obj;
//     for (const part of parts) {
//       if (!current || typeof current !== 'object') return defaultValue;
//       current = current[part];
//     }
//     return current !== undefined && current !== null && current !== '' ? current : defaultValue;
//   }

//   // Direct access
//   if (obj[fieldName] !== undefined && obj[fieldName] !== null && obj[fieldName] !== '') {
//     return obj[fieldName];
//   }

//   // Case-insensitive search
//   const lower = fieldName.toLowerCase();
//   for (const key of Object.keys(obj)) {
//     if (key.toLowerCase() === lower) {
//       const v = obj[key];
//       if (v !== undefined && v !== null && v !== '') return v;
//     }
//   }

//   return defaultValue;
// };

// // ─── FIXED: Comprehensive job field extractor ─────────────────────────────
// const extractJobFields = (item, index) => {
//   if (!item) return {};

//   const job = typeof item === 'object' ? item : {};
//   const sl = index + 1;
  
//   // Job Number
//   const jobNo = safeStr(
//     job.jobSheetNo || job.jobNo || job.JobNo || job.job_no || 
//     job.jobNumber || job.job_number || job.id || job._id
//   );
  
//   // Customer information - handle nested objects
//   const customerObj = job.customer || {};
//   const customerName = safeStr(
//     customerObj.name || job.customerName || job.CustomerName || 
//     job.customer_name || job.name || job.clientName
//   );
  
//   const contact = safeStr(
//     customerObj.contact || job.contact || job.Contact || 
//     job.phone || job.mobile || job.contactNumber
//   );
  
//   const altContact = safeStr(
//     customerObj.altContact || job.altContact || job.AltContact || 
//     job.alt_contact || job.alternateContact || job.alternate_contact || job.altPhone
//   );
  
//   const email = safeStr(
//     customerObj.email || job.email || job.Email || job.customerEmail
//   );
  
//   const address = safeStr(
//     customerObj.address || job.address || job.Address || job.customerAddress
//   );

//   // Device information
//   const deviceObj = job.device || {};
//   const makeId = safeStr(
//     deviceObj.make || job.makeId || job.Make || job.make || 
//     job.brand || job.Brand || job.deviceMake
//   );
  
//   const modelId = safeStr(
//     deviceObj.model || job.modelId || job.Model || job.model || 
//     job.deviceModel || job.device_model
//   );
  
//   const imei = safeStr(
//     deviceObj.imei || job.imei || job.IMEI || job.serial || 
//     job.serialNo || job.serial_number
//   );
  
//   const warranty = safeStr(
//     deviceObj.warranty || job.warranty || job.Warranty || 
//     job.warrantyStatus || job.warranty_status,
//     'No Warranty'
//   );

//   // Status
//   const status = safeStr(
//     deviceObj.mobileStatus || job.status || job.Status || 
//     job.jobStatus || job.job_status
//   );

//   // Assignment
//   const serviceObj = job.service || {};
//   const engineerId = safeStr(
//     serviceObj.engineer || job.engineerId || job.Engineer || 
//     job.engineer || job.technicianId || job.technician || job.assignedEngineer
//   );
  
//   const dealerName = safeStr(
//     serviceObj.dealer || job.dealerName || job.Dealer || 
//     job.dealer || job.dealerId
//   );
  
//   const drawerId = safeStr(
//     serviceObj.drawer || job.drawerId || job.Drawer || 
//     job.drawer || job.drawerName,
//     'Booking'
//   );

//   // Charges
//   const serviceCharges = safeNum(
//     serviceObj.serviceCharge || job.serviceCharges || job.ServiceCharges || 
//     job.service_charges || job.serviceCharge || job.service || 
//     job.svcCharges || job.svc
//   );
  
//   const spareCharges = safeNum(
//     serviceObj.spareCharge || job.spareCharges || job.SpareCharges || 
//     job.spare_charges || job.spareCharge || job.spare || job.partCharges
//   );
  
//   const total = serviceCharges + spareCharges;

//   // Payment
//   const paymentMode = safeStr(
//     serviceObj.paymentMode || job.paymentMode || job.Payment || 
//     job.payment || job.paymentType || job.payment_mode || job.payMode
//   );

//   // Problems and conditions - handle arrays
//   const visualIssues = job.visualIssues;
//   const problems = safeStr(
//     Array.isArray(visualIssues) ? visualIssues.filter(Boolean).join(', ') :
//     visualIssues || job.problems || job.Problems || job.problem || 
//     job.fault || job.Fault || job.issue
//   );
  
//   const physicalCondition = job.physicalCondition;
//   const physicalCond = safeStr(
//     Array.isArray(physicalCondition) ? physicalCondition.join(', ') :
//     physicalCondition || job.physicalConditions || job.physical_condition || 
//     job.PhysicalCondition || job.physCond || job.physical_cond || job.PhysCond
//   );
  
//   const accessoriesArr = job.accessories;
//   const accessories = safeStr(
//     Array.isArray(accessoriesArr) ? accessoriesArr.join(', ') :
//     accessoriesArr || job.Accessories || job.accessory
//   );
  
//   const remarks = safeStr(
//     serviceObj.remarks || job.remarks || job.Remarks || 
//     job.remark || job.note || job.notes
//   );

//   // Estimate
//   const estimate = safeStr(
//     serviceObj.estimate || job.estimate || job.Estimate || job.estimatedCost
//   );

//   // Dates
//   const repairDate = formatDate(
//     serviceObj.repairDate || job.repairDate || job.repairedDate || 
//     job.RepairDate || job.repair_date || job.repaired_date || job.dateRepaired
//   );
  
//   const deliveryDate = formatDate(
//     serviceObj.deliveryDate || job.deliveryDate || job.deliveredDate || 
//     job.DeliveryDate || job.delivery_date || job.delivered_date || job.dateDelivered
//   );
  
//   const savedDate = formatDate(
//     job.createdAt || job.savedDate || job.SavedDate || job.saved_date || 
//     job.created_at || job.receivedDate || job.dateReceived || job.date
//   );

//   // Meta
//   const createdByObj = job.createdBy || {};
//   const createdBy = safeStr(
//     createdByObj.username || createdByObj.name || job.createdBy || 
//     job.CreatedBy || job.created_by || job.billingBy || job.billedBy || 
//     job.addedBy || job.billing_by
//   );

//   return {
//     sl, jobNo, customerName, contact, altContact, email, address,
//     makeId, modelId, imei, warranty,
//     status, engineerId, dealerName, drawerId,
//     serviceCharges, spareCharges, total,
//     paymentMode, estimate,
//     problems, physicalCond, accessories, remarks,
//     repairDate, deliveryDate, savedDate, createdBy,
//   };
// };

// // ─── Constants ────────────────────────────────────────────────────────────────
// const PAGE_SIZE = 50;
// const REPORT_TABS = [
//   { id: 'all',             name: 'All Reports',      Icon: ClipboardList },
//   { id: 'engineer',        name: 'Engineer Report',  Icon: Wrench },
//   { id: 'value',           name: 'Value Report',     Icon: DollarSign },
//   { id: 'spare',           name: 'Spare Report',     Icon: Settings },
//   { id: 'dealer',          name: 'Dealer Report',    Icon: Store },
//   { id: 'dailyReceived',   name: 'Daily Received',   Icon: Inbox },
//   { id: 'dailyDelivered',  name: 'Daily Delivered',  Icon: Send },
//   { id: 'dailyRepaired',   name: 'Daily Repaired',   Icon: Hammer },
//   { id: 'repairPending',   name: 'Repair Pending',   Icon: Clock },
//   { id: 'deliveryPending', name: 'Delivery Pending', Icon: Truck },
//   { id: 'deliveredNRNA',   name: 'Delivered NR/NA',  Icon: AlertTriangle },
// ];
// const STATUS_OPTIONS = ['All Status', 'Received', 'Pending', 'Repaired', 'Delivered'];

// // ─── Helper Functions ─────────────────────────────────────────────────────────
// const getStatusColor = status => {
//   switch (status?.toLowerCase()) {
//     case 'received':  return COLORS.info;
//     case 'pending':   return COLORS.warning;
//     case 'repaired':  return COLORS.success;
//     case 'delivered': return COLORS.success;
//     default:          return COLORS.gray500;
//   }
// };

// // ─── Memoised Row Components ──────────────────────────────────────────────────
// const StatusChip = React.memo(({ status }) => {
//   const color = getStatusColor(status);
//   return (
//     <View style={[styles.statusChip, { backgroundColor: color + '20' }]}>
//       <Text style={[styles.statusChipText, { color }]}>{status || '-'}</Text>
//     </View>
//   );
// });

// // ─── AllReportRow ─────────────────────────────────────────────────────────────
// const AllReportRow = React.memo(({ item, index }) => {
//   const f = extractJobFields(item, index);

//   return (
//     <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
//       <Text style={[styles.tableCell, { width: 35  }]}>{f.sl}</Text>
//       <Text style={[styles.tableCell, { width: 70  }]}>{f.jobNo}</Text>
//       <Text style={[styles.tableCell, { width: 130 }]} numberOfLines={1}>{f.customerName}</Text>
//       <Text style={[styles.tableCell, { width: 90  }]}>{f.contact}</Text>
//       <Text style={[styles.tableCell, { width: 70  }]}>{f.altContact}</Text>
//       <Text style={[styles.tableCell, { width: 70  }]}>{f.makeId}</Text>
//       <Text style={[styles.tableCell, { width: 70  }]}>{f.modelId}</Text>
//       <Text style={[styles.tableCell, { width: 100 }]}>{f.imei}</Text>
//       <Text style={[styles.tableCell, { width: 70  }]}>{f.warranty}</Text>
//       <View  style={[styles.tableCell, { width: 80  }]}>
//         <StatusChip status={f.status} />
//       </View>
//       <Text style={[styles.tableCell, { width: 80  }]}>{f.engineerId}</Text>
//       <Text style={[styles.tableCell, { width: 80  }]}>{f.dealerName}</Text>
//       <Text style={[styles.tableCell, { width: 70  }]}>{f.drawerId}</Text>
//       <Text style={[styles.tableCell, { width: 60  }]}>₹{f.serviceCharges}</Text>
//       <Text style={[styles.tableCell, { width: 60  }]}>₹{f.spareCharges}</Text>
//       <Text style={[styles.tableCell, styles.boldCell, { width: 70 }]}>₹{f.total}</Text>
//       <Text style={[styles.tableCell, { width: 75  }]}>{f.paymentMode}</Text>
//       <Text style={[styles.tableCell, { width: 80  }]} numberOfLines={2}>{f.problems}</Text>
//       <Text style={[styles.tableCell, { width: 85  }]} numberOfLines={2}>{f.physicalCond}</Text>
//       <Text style={[styles.tableCell, { width: 85  }]}>{f.accessories}</Text>
//       <Text style={[styles.tableCell, { width: 85  }]}>{f.repairDate}</Text>
//       <Text style={[styles.tableCell, { width: 85  }]}>{f.deliveryDate}</Text>
//       <Text style={[styles.tableCell, { width: 70  }]}>{f.remarks}</Text>
//       <Text style={[styles.tableCell, { width: 85  }]}>{f.savedDate}</Text>
//       <Text style={[styles.tableCell, { width: 80  }]}>{f.createdBy}</Text>
//     </View>
//   );
// });

// // ─── EngineerRow ──────────────────────────────────────────────────────────────
// const EngineerRow = React.memo(({ item, index }) => {
//   const f = extractJobFields(item, index);
//   return (
//     <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
//       <Text style={[styles.tableCell, { width: 75  }]}>{f.jobNo}</Text>
//       <Text style={[styles.tableCell, { width: 140 }]}>{f.customerName}</Text>
//       <Text style={[styles.tableCell, { width: 110 }]}>{f.contact}</Text>
//       <View  style={[styles.tableCell, { width: 90  }]}>
//         <StatusChip status={f.status} />
//       </View>
//       <Text style={[styles.tableCell, { width: 100 }]}>{f.savedDate}</Text>
//       <Text style={[styles.tableCell, { width: 100 }]}>{f.deliveryDate}</Text>
//     </View>
//   );
// });

// // ─── ValueRow ─────────────────────────────────────────────────────────────────
// const ValueRow = React.memo(({ item, index }) => {
//   const f = extractJobFields(item, index);
//   const service = safeNum(item.service ?? item.serviceCharges ?? item.serviceCharge);
//   const spare   = safeNum(item.spare   ?? item.spareCharges   ?? item.spareCharge);
//   const total   = safeNum(item.total)  || service + spare;
//   return (
//     <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
//       <Text style={[styles.tableCell, { width: 75  }]}>{f.jobNo}</Text>
//       <Text style={[styles.tableCell, { width: 140 }]}>{safeStr(item.name) !== '-' ? safeStr(item.name) : f.customerName}</Text>
//       <Text style={[styles.tableCell, { width: 100 }]}>{formatDate(item.received ?? item.savedDate)}</Text>
//       <Text style={[styles.tableCell, { width: 100 }]}>{formatDate(item.repaired ?? item.repairedDate)}</Text>
//       <Text style={[styles.tableCell, { width: 100 }]}>{formatDate(item.delivered ?? item.deliveredDate)}</Text>
//       <Text style={[styles.tableCell, { width: 75  }]}>₹{service}</Text>
//       <Text style={[styles.tableCell, { width: 75  }]}>₹{spare}</Text>
//       <Text style={[styles.tableCell, styles.boldCell, { width: 75 }]}>₹{total}</Text>
//     </View>
//   );
// });

// // ─── SpareRow ─────────────────────────────────────────────────────────────────
// const SpareRow = React.memo(({ item, index }) => {
//   const qty    = safeNum(item.qty);
//   const rate   = safeNum(item.rate);
//   const amount = safeNum(item.amount) || qty * rate;
//   return (
//     <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
//       <Text style={[styles.tableCell, { width: 75  }]}>{safeStr(item.jobSheet)}</Text>
//       <Text style={[styles.tableCell, { width: 190 }]}>{safeStr(item.spare)}</Text>
//       <Text style={[styles.tableCell, { width: 55  }]}>{qty}</Text>
//       <Text style={[styles.tableCell, { width: 90  }]}>₹{rate}</Text>
//       <Text style={[styles.tableCell, styles.boldCell, { width: 90 }]}>₹{amount}</Text>
//     </View>
//   );
// });

// // ─── DealerRow ────────────────────────────────────────────────────────────────
// const DealerRow = React.memo(({ item, index }) => {
//   const f   = extractJobFields(item, index);
//   const svc = safeNum(item.serviceCharges ?? item.service);
//   const sp  = safeNum(item.spareCharges   ?? item.spare);
//   return (
//     <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
//       <Text style={[styles.tableCell, { width: 40  }]}>{index + 1}</Text>
//       <Text style={[styles.tableCell, { width: 140 }]}>{f.dealerName}</Text>
//       <Text style={[styles.tableCell, { width: 190 }]}>{f.customerName}</Text>
//       <Text style={[styles.tableCell, { width: 110 }]}>{f.contact}</Text>
//       <Text style={[styles.tableCell, { width: 100 }]}>{f.savedDate}</Text>
//       <View  style={[styles.tableCell, { width: 90  }]}>
//         <StatusChip status={f.status} />
//       </View>
//       <Text style={[styles.tableCell, { width: 75  }]}>₹{svc}</Text>
//       <Text style={[styles.tableCell, { width: 75  }]}>₹{sp}</Text>
//       <Text style={[styles.tableCell, styles.boldCell, { width: 75 }]}>₹{svc + sp}</Text>
//     </View>
//   );
// });

// // ─── PendingRow ───────────────────────────────────────────────────────────────
// const PendingRow = React.memo(({ item, index }) => {
//   const f = extractJobFields(item, index);
//   return (
//     <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
//       <Text style={[styles.tableCell, { width: 40  }]}>{index + 1}</Text>
//       <Text style={[styles.tableCell, { width: 75  }]}>{f.jobNo}</Text>
//       <Text style={[styles.tableCell, { width: 140 }]}>{f.customerName}</Text>
//       <Text style={[styles.tableCell, { width: 110 }]}>{f.contact}</Text>
//       <Text style={[styles.tableCell, { width: 100 }]}>{`${f.makeId} ${f.modelId}`.trim()}</Text>
//       <Text style={[styles.tableCell, { width: 100 }]}>{f.savedDate}</Text>
//       <View  style={[styles.tableCell, { width: 90  }]}>
//         <StatusChip status={f.status} />
//       </View>
//       <Text style={[styles.tableCell, { width: 90  }]}>{f.engineerId}</Text>
//     </View>
//   );
// });

// // ─── NRNARow ──────────────────────────────────────────────────────────────────
// const NRNARow = React.memo(({ item, index }) => {
//   const f = extractJobFields(item, index);
//   return (
//     <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
//       <Text style={[styles.tableCell, { width: 40  }]}>{index + 1}</Text>
//       <Text style={[styles.tableCell, { width: 75  }]}>{f.jobNo}</Text>
//       <Text style={[styles.tableCell, { width: 140 }]}>{f.customerName}</Text>
//       <Text style={[styles.tableCell, { width: 110 }]}>{f.contact}</Text>
//       <Text style={[styles.tableCell, { width: 100 }]}>{f.deliveryDate}</Text>
//       <Text style={[styles.tableCell, { width: 140 }]}>{f.physicalCond}</Text>
//     </View>
//   );
// });

// // ─── DailyRow ─────────────────────────────────────────────────────────────────
// const DailyRow = React.memo(({ item, index }) => (
//   <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
//     <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(item.date)}</Text>
//     <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontWeight: '600' }]}>
//       {safeNum(item.count)}
//     </Text>
//   </View>
// ));

// const EmptyState = React.memo(() => (
//   <View style={styles.emptyContainer}>
//     <FileText size={40} color={COLORS.gray300} />
//     <Text style={styles.emptyText}>No data found</Text>
//     <Text style={styles.emptySubText}>Try adjusting your filters or date range</Text>
//   </View>
// ));

// // ─── Summary Cards ──────────────────────────────────────────────────────────
// const SummaryCards = React.memo(({ stats, activeTab }) => {
//   const isDailyTab   = ['dailyReceived', 'dailyDelivered', 'dailyRepaired'].includes(activeTab);
//   const isPendingTab = ['repairPending', 'deliveryPending', 'deliveredNRNA'].includes(activeTab);
//   return (
//     <View style={styles.summaryContainer}>
//       <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
//         <View style={styles.summaryIconRow}><FileText size={18} color={COLORS.primary} /></View>
//         <Text style={styles.summaryLabel}>Total Records</Text>
//         <Text style={[styles.summaryValue, { color: COLORS.primary }]}>{stats.totalRecords}</Text>
//       </View>
//       {!isPendingTab && !isDailyTab && (
//         <>
//           <View style={styles.summaryCard}>
//             <View style={styles.summaryIconRow}><TrendingUp size={18} color={COLORS.info} /></View>
//             <Text style={styles.summaryLabel}>Service</Text>
//             <Text style={[styles.summaryValue, { color: COLORS.info }]}>₹{stats.serviceCharge.toLocaleString()}</Text>
//           </View>
//           <View style={styles.summaryCard}>
//             <View style={styles.summaryIconRow}><Package size={18} color={COLORS.warning} /></View>
//             <Text style={styles.summaryLabel}>Spare</Text>
//             <Text style={[styles.summaryValue, { color: COLORS.warning }]}>₹{stats.spareCharge.toLocaleString()}</Text>
//           </View>
//           <View style={[styles.summaryCard, styles.summaryCardTotal]}>
//             <View style={styles.summaryIconRow}><DollarSign size={18} color={COLORS.white} /></View>
//             <Text style={[styles.summaryLabel, { color: COLORS.white + 'cc' }]}>Total</Text>
//             <Text style={[styles.summaryValue, { color: COLORS.white }]}>₹{stats.totalAmount.toLocaleString()}</Text>
//           </View>
//         </>
//       )}
//       {isDailyTab && (
//         <View style={[styles.summaryCard, styles.summaryCardTotal]}>
//           <View style={styles.summaryIconRow}><Users size={18} color={COLORS.white} /></View>
//           <Text style={[styles.summaryLabel, { color: COLORS.white + 'cc' }]}>Total Count</Text>
//           <Text style={[styles.summaryValue, { color: COLORS.white }]}>{stats.totalAmount}</Text>
//         </View>
//       )}
//     </View>
//   );
// });

// // ─── Tab Button ─────────────────────────────────────────────────────────────
// const TabButton = React.memo(({ tab, isActive, onPress }) => {
//   const { Icon, name, id } = tab;
//   const handlePress = useCallback(() => onPress(id), [id, onPress]);
//   return (
//     <TouchableOpacity style={[styles.tab, isActive && styles.activeTab]} onPress={handlePress}>
//       <Icon size={13} color={isActive ? COLORS.white : COLORS.gray600} style={styles.tabIcon} />
//       <Text style={[styles.tabText, isActive && styles.activeTabText]}>{name}</Text>
//     </TouchableOpacity>
//   );
// });

// // ─── FlatList Footer Loader ─────────────────────────────────────────────────
// const ListFooterLoader = React.memo(({ loading }) => {
//   if (!loading) return null;
//   return (
//     <View style={styles.footerLoader}>
//       <ActivityIndicator size="small" color={COLORS.primary} />
//       <Text style={styles.footerLoaderText}>Loading more...</Text>
//     </View>
//   );
// });

// // ─── Engineer Section ───────────────────────────────────────────────────────
// const EngineerSection = React.memo(({ section }) => (
//   <View style={styles.sectionCard}>
//     <View style={styles.sectionHeader}>
//       <Wrench size={14} color={COLORS.primary} />
//       <Text style={styles.sectionTitle}>{section.title}</Text>
//     </View>
//     <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//       <View>
//         <View style={styles.tableHeader}>
//           {['Job No', 'Customer', 'Contact', 'Status', 'Received', 'Delivered'].map((h, i) => (
//             <Text key={i} style={[styles.tableHeaderCell, { width: [75, 140, 110, 90, 100, 100][i] }]}>{h}</Text>
//           ))}
//         </View>
//         <FlatList
//           data={section.data}
//           renderItem={({ item, index }) => <EngineerRow item={item} index={index} />}
//           keyExtractor={(item, idx) => String(item?.jobNo ?? item?.id ?? idx)}
//           scrollEnabled={false}
//           initialNumToRender={10}
//           maxToRenderPerBatch={10}
//           removeClippedSubviews
//         />
//       </View>
//     </ScrollView>
//   </View>
// ));

// // ─── Main Screen ────────────────────────────────────────────────────────────
// export default function ReportsScreen() {
//   const dispatch = useDispatch();
//   const viewShotRef = useRef(null);
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
//   const { engineers, dealers } = useSelector(state => state.admin);
//   const { list, loading: jobsLoading } = useSelector(state => state.jobs);

//   // Debug: log first item to verify field names (remove in production)
//   useEffect(() => {
//     if (list && list.length > 0) {
//       console.log('[Reports] Total jobs loaded:', list.length);
//       console.log('[Reports] First job keys:', Object.keys(list[0]));
//       console.log('[Reports] First job sample:', JSON.stringify(list[0], null, 2));
//     }
//   }, [list]);

//   const loading = reportLoading || jobsLoading;

//   const [activeTab,        setActiveTab]        = useState('all');
//   const [fromDate,         setFromDate]          = useState('');
//   const [toDate,           setToDate]            = useState('');
//   const [statusFilter,     setStatusFilter]      = useState('All Status');
//   const [selectedEngineer, setSelectedEngineer]  = useState('');
//   const [selectedDealer,   setSelectedDealer]    = useState('');
//   const [searchQuery,      setSearchQuery]       = useState('');
//   const [generating,       setGenerating]        = useState(false);
//   const [showFilters,      setShowFilters]       = useState(true);
//   const [page,             setPage]              = useState(1);
//   const [refreshing,       setRefreshing]        = useState(false);

//   // ─── Filtered + paginated lists ──────────────────────────────────────────
//   const filteredList = useMemo(() => {
//     if (!list || list.length === 0) return [];
//     if (!searchQuery.trim()) return list;
//     const q = searchQuery.toLowerCase();
//     return list.filter(j => {
//       const f = extractJobFields(j, 0);
//       return (
//         f.customerName.toLowerCase().includes(q) ||
//         f.contact.includes(q) ||
//         f.jobNo.toLowerCase().includes(q) ||
//         f.imei.includes(q)
//       );
//     });
//   }, [list, searchQuery]);

//   const paginatedList = useMemo(() => filteredList.slice(0, page * PAGE_SIZE), [filteredList, page]);
//   const hasMore       = paginatedList.length < filteredList.length;

//   const filteredPending = useMemo(() => {
//     if (!pendingReport || pendingReport.length === 0) return [];
//     if (!searchQuery.trim()) return pendingReport;
//     const q = searchQuery.toLowerCase();
//     return pendingReport.filter(j => {
//       const f = extractJobFields(j, 0);
//       return (
//         f.customerName.toLowerCase().includes(q) ||
//         f.contact.includes(q) ||
//         f.jobNo.toLowerCase().includes(q)
//       );
//     });
//   }, [pendingReport, searchQuery]);

//   const paginatedPending  = useMemo(() => filteredPending.slice(0, page * PAGE_SIZE), [filteredPending, page]);
//   const hasMorePending    = paginatedPending.length < filteredPending.length;

//   const loadMore        = useCallback(() => { if (!hasMore      || loading) return; setPage(p => p + 1); }, [hasMore,      loading]);
//   const loadMorePending = useCallback(() => { if (!hasMorePending || loading) return; setPage(p => p + 1); }, [hasMorePending, loading]);

//   // ─── Summary stats ───────────────────────────────────────────────────────
//   const summaryStats = useMemo(() => {
//     switch (activeTab) {
//       case 'value': {
//         const svc = (valueReport || []).reduce((s, j) => s + safeNum(j.service ?? j.serviceCharges), 0);
//         const sp  = (valueReport || []).reduce((s, j) => s + safeNum(j.spare   ?? j.spareCharges),   0);
//         return { totalRecords: (valueReport || []).length, serviceCharge: svc, spareCharge: sp, totalAmount: svc + sp };
//       }
//       case 'spare': {
//         const total = (spareReport || []).reduce((s, i) => s + safeNum(i.amount), 0);
//         return { totalRecords: (spareReport || []).length, serviceCharge: 0, spareCharge: total, totalAmount: total };
//       }
//       case 'dealer': {
//         const svc = (dealerReport || []).reduce((s, j) => s + safeNum(j.serviceCharges ?? j.service), 0);
//         const sp  = (dealerReport || []).reduce((s, j) => s + safeNum(j.spareCharges   ?? j.spare),   0);
//         return { totalRecords: (dealerReport || []).length, serviceCharge: svc, spareCharge: sp, totalAmount: svc + sp };
//       }
//       case 'engineer': {
//         const allJobs = [
//           ...(noEngineerJobs || []),
//           ...(engineerReport || []).flatMap(e => e.jobs || []),
//         ];
//         const svc = allJobs.reduce((s, j) => s + safeNum(j.serviceCharges ?? j.service), 0);
//         const sp  = allJobs.reduce((s, j) => s + safeNum(j.spareCharges   ?? j.spare),   0);
//         return { totalRecords: allJobs.length, serviceCharge: svc, spareCharge: sp, totalAmount: svc + sp };
//       }
//       case 'repairPending':
//       case 'deliveryPending':
//         return { totalRecords: (pendingReport || []).length, serviceCharge: 0, spareCharge: 0, totalAmount: 0 };
//       case 'dailyReceived':
//       case 'dailyDelivered':
//       case 'dailyRepaired': {
//         const cnt = (dailySummary || []).reduce((s, i) => s + safeNum(i.count), 0);
//         return { totalRecords: (dailySummary || []).length, serviceCharge: 0, spareCharge: 0, totalAmount: cnt };
//       }
//       case 'deliveredNRNA':
//         return { totalRecords: (deliveredNRNA || []).length, serviceCharge: 0, spareCharge: 0, totalAmount: 0 };
//       default: {
//         const svc = (list || []).reduce((s, j) => s + safeNum(j.serviceCharges ?? j.service), 0);
//         const sp  = (list || []).reduce((s, j) => s + safeNum(j.spareCharges   ?? j.spare),   0);
//         return { totalRecords: (list || []).length, serviceCharge: svc, spareCharge: sp, totalAmount: svc + sp };
//       }
//     }
//   }, [activeTab, list, valueReport, spareReport, dealerReport, pendingReport, engineerReport, noEngineerJobs, dailySummary, deliveredNRNA]);

//   // ─── Data loading ────────────────────────────────────────────────────────
//   const loadReport = useCallback((tabId, fd, td, sf, se, sd) => {
//     const filters = { fromDate: fd, toDate: td };
//     if (sf !== 'All Status') filters.status = sf;
//     setPage(1);
//     switch (tabId) {
//       case 'engineer':        dispatch(fetchEngineerWiseReport(filters)); break;
//       case 'value':           dispatch(fetchValueReport(filters)); break;
//       case 'spare':           dispatch(fetchSpareReport({ ...filters, engineerId: se })); break;
//       case 'dealer':          dispatch(fetchDealerReport({ dealerName: sd, fromDate: fd, toDate: td })); break;
//       case 'all':             dispatch(fetchJobs(filters)); break;
//       case 'dailyReceived':   dispatch(fetchDailySummary({ type: 'received',  fromDate: fd, toDate: td })); break;
//       case 'dailyDelivered':  dispatch(fetchDailySummary({ type: 'delivered', fromDate: fd, toDate: td })); break;
//       case 'dailyRepaired':   dispatch(fetchDailySummary({ type: 'repaired',  fromDate: fd, toDate: td })); break;
//       case 'repairPending':   dispatch(fetchPendingReport({ type: 'repairPending',   fromDate: fd, toDate: td })); break;
//       case 'deliveryPending': dispatch(fetchPendingReport({ type: 'deliveryPending', fromDate: fd, toDate: td })); break;
//       case 'deliveredNRNA':   dispatch(fetchDeliveredNRNAReport({ fromDate: fd, toDate: td })); break;
//     }
//   }, [dispatch]);

//   const handleTabPress = useCallback((tabId) => {
//     setActiveTab(tabId);
//     setPage(1);
//     loadReport(tabId, fromDate, toDate, statusFilter, selectedEngineer, selectedDealer);
//   }, [loadReport, fromDate, toDate, statusFilter, selectedEngineer, selectedDealer]);

//   const handleApplyFilter = useCallback(() => {
//     setPage(1);
//     loadReport(activeTab, fromDate, toDate, statusFilter, selectedEngineer, selectedDealer);
//   }, [loadReport, activeTab, fromDate, toDate, statusFilter, selectedEngineer, selectedDealer]);

//   const resetFilters = useCallback(() => {
//     setFromDate('');
//     setToDate('');
//     setStatusFilter('All Status');
//     setSelectedEngineer('');
//     setSelectedDealer('');
//     setSearchQuery('');
//     setPage(1);
//     loadReport(activeTab, '', '', 'All Status', '', '');
//   }, [loadReport, activeTab]);

//   const handleRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await loadReport(activeTab, fromDate, toDate, statusFilter, selectedEngineer, selectedDealer);
//     setRefreshing(false);
//   }, [loadReport, activeTab, fromDate, toDate, statusFilter, selectedEngineer, selectedDealer]);

//   const handlePrint = useCallback(async () => {
//     if (!viewShotRef.current) return;
//     setGenerating(true);
//     try {
//       const uri = await viewShotRef.current.capture();
//       await RNPrint.print({ filePath: uri });
//     } catch (error) {
//       Alert.alert('Error', 'Failed to print report');
//     } finally {
//       setGenerating(false);
//     }
//   }, []);

//   const toggleFilters = useCallback(() => setShowFilters(v => !v), []);
//   const activeFilterCount = useMemo(() => {
//     let count = 0;
//     if (fromDate) count++;
//     if (toDate) count++;
//     if (statusFilter !== 'All Status') count++;
//     if (selectedEngineer) count++;
//     if (selectedDealer) count++;
//     return count;
//   }, [fromDate, toDate, statusFilter, selectedEngineer, selectedDealer]);

//   useEffect(() => {
//     loadReport('all', '', '', 'All Status', '', '');
//   }, []);

//   // ─── Render content per tab ──────────────────────────────────────────────
//   const renderContent = () => {
//     if (loading && page === 1) {
//       return (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//           <Text style={styles.loaderText}>Loading report...</Text>
//         </View>
//       );
//     }

//     switch (activeTab) {
//       // ── All Reports ──────────────────────────────────────────────────────
//       case 'all':
//         return (
//           <View style={styles.tableContainer}>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//               <View>
//                 <View style={styles.tableHeader}>
//                   {[
//                     ['SL',35],['Job No',70],['Name',130],['Contact',90],['Alt Contact',70],
//                     ['Make',70],['Model',70],['IMEI',100],['Warranty',70],['Status',80],
//                     ['Engineer',80],['Dealer',80],['Drawer',70],['Svc',60],['Spare',60],
//                     ['Total',70],['Payment',75],['Problems',80],['Phys Cond',85],
//                     ['Accessories',85],['Repair Dt',85],['Delivery Dt',85],
//                     ['Remarks',70],['Saved Dt',85],['Created By',80],
//                   ].map(([h, w], i) => (
//                     <Text key={i} style={[styles.tableHeaderCell, { width: w }]}>{h}</Text>
//                   ))}
//                 </View>
//                 <FlatList
//                   data={paginatedList}
//                   renderItem={({ item, index }) => <AllReportRow item={item} index={index} />}
//                   keyExtractor={(item, idx) => String(item?.jobNo ?? item?.id ?? idx)}
//                   scrollEnabled={false}
//                   onEndReached={loadMore}
//                   onEndReachedThreshold={0.3}
//                   ListEmptyComponent={<EmptyState />}
//                   ListFooterComponent={<ListFooterLoader loading={loading && hasMore} />}
//                   initialNumToRender={20}
//                   maxToRenderPerBatch={15}
//                   windowSize={10}
//                   removeClippedSubviews
//                 />
//               </View>
//             </ScrollView>
//           </View>
//         );

//       // ── Engineer Report ──────────────────────────────────────────────────
//       case 'engineer': {
//         const sections = [];
//         if (noEngineerJobs?.length > 0)
//           sections.push({ title: `Unassigned (${noEngineerJobs.length} jobs)`, data: noEngineerJobs });
//         (engineerReport || []).forEach(eng =>
//           sections.push({ title: `${eng.engineer} (${(eng.jobs || []).length} jobs)`, data: eng.jobs || [] })
//         );
//         if (sections.length === 0) return <EmptyState />;
//         return sections.map((section, idx) => <EngineerSection key={idx} section={section} />);
//       }

//       // ── Value Report ─────────────────────────────────────────────────────
//       case 'value':
//         return (
//           <View style={styles.tableContainer}>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//               <View>
//                 <View style={styles.tableHeader}>
//                   {[['Job No',75],['Customer',140],['Received',100],['Repaired',100],
//                     ['Delivered',100],['Service',75],['Spare',75],['Total',75]
//                   ].map(([h, w], i) => (
//                     <Text key={i} style={[styles.tableHeaderCell, { width: w }]}>{h}</Text>
//                   ))}
//                 </View>
//                 <FlatList
//                   data={valueReport || []}
//                   renderItem={({ item, index }) => <ValueRow item={item} index={index} />}
//                   keyExtractor={(item, idx) => String(item?.jobNo ?? idx)}
//                   scrollEnabled={false}
//                   ListEmptyComponent={<EmptyState />}
//                   initialNumToRender={20}
//                   maxToRenderPerBatch={15}
//                   removeClippedSubviews
//                 />
//               </View>
//             </ScrollView>
//             {(valueReport || []).length > 0 && (
//               <View style={styles.grandTotalRow}>
//                 <Text style={styles.grandTotalLabel}>Grand Total</Text>
//                 <Text style={styles.grandTotalValue}>
//                   ₹{(valueReport || []).reduce((s, i) => s + safeNum(i.total ?? (safeNum(i.service ?? i.serviceCharges) + safeNum(i.spare ?? i.spareCharges))), 0).toLocaleString()}
//                 </Text>
//               </View>
//             )}
//           </View>
//         );

//       // ── Spare Report ─────────────────────────────────────────────────────
//       case 'spare':
//         return (
//           <View style={styles.tableContainer}>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//               <View>
//                 <View style={styles.tableHeader}>
//                   {[['Job Sheet',75],['Spare Part',190],['Qty',55],['Rate',90],['Amount',90]].map(([h, w], i) => (
//                     <Text key={i} style={[styles.tableHeaderCell, { width: w }]}>{h}</Text>
//                   ))}
//                 </View>
//                 <FlatList
//                   data={spareReport || []}
//                   renderItem={({ item, index }) => <SpareRow item={item} index={index} />}
//                   keyExtractor={(_, idx) => String(idx)}
//                   scrollEnabled={false}
//                   ListEmptyComponent={<EmptyState />}
//                   initialNumToRender={20}
//                   maxToRenderPerBatch={15}
//                   removeClippedSubviews
//                 />
//               </View>
//             </ScrollView>
//             {(spareReport || []).length > 0 && (
//               <View style={styles.grandTotalRow}>
//                 <Text style={styles.grandTotalLabel}>Grand Total</Text>
//                 <Text style={styles.grandTotalValue}>
//                   ₹{(spareReport || []).reduce((s, i) => s + safeNum(i.amount), 0).toLocaleString()}
//                 </Text>
//               </View>
//             )}
//           </View>
//         );

//       // ── Dealer Report ────────────────────────────────────────────────────
//       case 'dealer':
//         return (
//           <View style={styles.tableContainer}>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//               <View>
//                 <View style={styles.tableHeader}>
//                   {[['SL',40],['Dealer',140],['Customer',190],['Contact',110],
//                     ['Date',100],['Status',90],['Service',75],['Spare',75],['Total',75]
//                   ].map(([h, w], i) => (
//                     <Text key={i} style={[styles.tableHeaderCell, { width: w }]}>{h}</Text>
//                   ))}
//                 </View>
//                 <FlatList
//                   data={dealerReport || []}
//                   renderItem={({ item, index }) => <DealerRow item={item} index={index} />}
//                   keyExtractor={(item, idx) => String(item?.jobNo ?? idx)}
//                   scrollEnabled={false}
//                   ListEmptyComponent={<EmptyState />}
//                   initialNumToRender={15}
//                   maxToRenderPerBatch={15}
//                   removeClippedSubviews
//                 />
//               </View>
//             </ScrollView>
//           </View>
//         );

//       // ── Daily Reports ────────────────────────────────────────────────────
//       case 'dailyReceived':
//       case 'dailyDelivered':
//       case 'dailyRepaired':
//         return (
//           <View style={styles.tableContainer}>
//             <View style={styles.tableHeader}>
//               <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Date</Text>
//               <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Count</Text>
//             </View>
//             <FlatList
//               data={dailySummary || []}
//               renderItem={({ item, index }) => <DailyRow item={item} index={index} />}
//               keyExtractor={(_, idx) => String(idx)}
//               scrollEnabled={false}
//               ListEmptyComponent={<EmptyState />}
//               initialNumToRender={20}
//               maxToRenderPerBatch={20}
//             />
//             {(dailySummary || []).length > 0 && (
//               <View style={styles.grandTotalRow}>
//                 <Text style={styles.grandTotalLabel}>Total Count</Text>
//                 <Text style={styles.grandTotalValue}>
//                   {(dailySummary || []).reduce((s, i) => s + safeNum(i.count), 0)}
//                 </Text>
//               </View>
//             )}
//           </View>
//         );

//       // ── Pending Reports ──────────────────────────────────────────────────
//       case 'repairPending':
//       case 'deliveryPending':
//         return (
//           <View style={styles.tableContainer}>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//               <View>
//                 <View style={styles.tableHeader}>
//                   {[['SL',40],['Job No',75],['Customer',140],['Phone',110],
//                     ['Make/Model',100],['Date',100],['Status',90],['Engineer',90]
//                   ].map(([h, w], i) => (
//                     <Text key={i} style={[styles.tableHeaderCell, { width: w }]}>{h}</Text>
//                   ))}
//                 </View>
//                 <FlatList
//                   data={paginatedPending}
//                   renderItem={({ item, index }) => <PendingRow item={item} index={index} />}
//                   keyExtractor={(item, idx) => String(item?.jobNo ?? idx)}
//                   scrollEnabled={false}
//                   onEndReached={loadMorePending}
//                   onEndReachedThreshold={0.3}
//                   ListEmptyComponent={<EmptyState />}
//                   ListFooterComponent={<ListFooterLoader loading={loading && hasMorePending} />}
//                   initialNumToRender={15}
//                   maxToRenderPerBatch={15}
//                   removeClippedSubviews
//                 />
//               </View>
//             </ScrollView>
//           </View>
//         );

//       // ── Delivered NR/NA ──────────────────────────────────────────────────
//       case 'deliveredNRNA':
//         return (
//           <View style={styles.tableContainer}>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//               <View>
//                 <View style={styles.tableHeader}>
//                   {[['SL',40],['Job No',75],['Customer',140],['Contact',110],
//                     ['Delivered Date',100],['Physical Cond.',140]
//                   ].map(([h, w], i) => (
//                     <Text key={i} style={[styles.tableHeaderCell, { width: w }]}>{h}</Text>
//                   ))}
//                 </View>
//                 <FlatList
//                   data={deliveredNRNA || []}
//                   renderItem={({ item, index }) => <NRNARow item={item} index={index} />}
//                   keyExtractor={(item, idx) => String(item?.jobNo ?? idx)}
//                   scrollEnabled={false}
//                   ListEmptyComponent={<EmptyState />}
//                   initialNumToRender={15}
//                   maxToRenderPerBatch={15}
//                   removeClippedSubviews
//                 />
//               </View>
//             </ScrollView>
//           </View>
//         );

//       default:
//         return <EmptyState />;
//     }
//   };

//   // ─── Root render ─────────────────────────────────────────────────────────
//   return (
//     <FlatList
//       style={styles.container}
//       data={[]}
//       renderItem={null}
//       refreshControl={
//         <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
//       }
//       ListHeaderComponent={
//         <>
//           <SummaryCards stats={summaryStats} activeTab={activeTab} />

//           {/* ── Filter section ── */}
//           <View style={styles.filterSection}>
//             <View style={styles.searchRow}>
//               <View style={styles.searchInputContainer}>
//                 <Search size={16} color={COLORS.gray400} style={styles.searchIcon} />
//                 <TextInput
//                   style={styles.searchInput}
//                   placeholder="Name / Contact / Job No / IMEI"
//                   placeholderTextColor={COLORS.gray400}
//                   value={searchQuery}
//                   onChangeText={setSearchQuery}
//                 />
//                 {searchQuery.length > 0 && (
//                   <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClear}>
//                     <X size={14} color={COLORS.gray400} />
//                   </TouchableOpacity>
//                 )}
//               </View>
//               <TouchableOpacity
//                 style={[styles.filterToggle, activeFilterCount > 0 && styles.filterToggleActive]}
//                 onPress={toggleFilters}
//               >
//                 <Filter size={18} color={activeFilterCount > 0 ? COLORS.white : COLORS.primary} />
//                 {activeFilterCount > 0 && (
//                   <View style={styles.filterBadge}>
//                     <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
//                   </View>
//                 )}
//               </TouchableOpacity>
//             </View>

//             {showFilters && (
//               <View style={styles.filtersGrid}>
//                 {/* Status chips */}
//                 <View style={styles.filterItem}>
//                   <Text style={styles.filterLabel}>Status</Text>
//                   <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                     {STATUS_OPTIONS.map(status => (
//                       <TouchableOpacity
//                         key={status}
//                         style={[styles.chip, statusFilter === status && styles.chipActive]}
//                         onPress={() => setStatusFilter(status)}
//                       >
//                         <Text style={[styles.chipText, statusFilter === status && styles.chipTextActive]}>{status}</Text>
//                       </TouchableOpacity>
//                     ))}
//                   </ScrollView>
//                 </View>

//                 {/* Engineer chips */}
//                 <View style={styles.filterItem}>
//                   <Text style={styles.filterLabel}>Engineer</Text>
//                   <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                     <TouchableOpacity
//                       style={[styles.chip, !selectedEngineer && styles.chipActive]}
//                       onPress={() => setSelectedEngineer('')}
//                     >
//                       <Text style={[styles.chipText, !selectedEngineer && styles.chipTextActive]}>All</Text>
//                     </TouchableOpacity>
//                     {(engineers || []).map(engineer => (
//                       <TouchableOpacity
//                         key={engineer.id}
//                         style={[styles.chip, selectedEngineer === engineer.name && styles.chipActive]}
//                         onPress={() => setSelectedEngineer(engineer.name)}
//                       >
//                         <Text style={[styles.chipText, selectedEngineer === engineer.name && styles.chipTextActive]}>
//                           {engineer.name}
//                         </Text>
//                       </TouchableOpacity>
//                     ))}
//                   </ScrollView>
//                 </View>

//                 {/* Dealer chips */}
//                 <View style={styles.filterItem}>
//                   <Text style={styles.filterLabel}>Dealer</Text>
//                   <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                     <TouchableOpacity
//                       style={[styles.chip, !selectedDealer && styles.chipActive]}
//                       onPress={() => setSelectedDealer('')}
//                     >
//                       <Text style={[styles.chipText, !selectedDealer && styles.chipTextActive]}>All</Text>
//                     </TouchableOpacity>
//                     {(dealers || []).map(dealer => (
//                       <TouchableOpacity
//                         key={dealer.id}
//                         style={[styles.chip, selectedDealer === dealer.name && styles.chipActive]}
//                         onPress={() => setSelectedDealer(dealer.name)}
//                       >
//                         <Text style={[styles.chipText, selectedDealer === dealer.name && styles.chipTextActive]}>
//                           {dealer.name}
//                         </Text>
//                       </TouchableOpacity>
//                     ))}
//                   </ScrollView>
//                 </View>

//                 {/* Date range */}
//                 <View style={styles.dateRangeContainer}>
//                   <TouchableOpacity
//                     style={[styles.dateButton, fromDate ? styles.dateButtonActive : null]}
//                     onPress={() => {/* open date picker */}}
//                   >
//                     <Calendar size={15} color={fromDate ? COLORS.primary : COLORS.gray500} />
//                     <Text style={[styles.dateText, fromDate ? styles.dateTextActive : null]}>
//                       {fromDate || 'From Date'}
//                     </Text>
//                   </TouchableOpacity>
//                   <Text style={styles.dateSeparator}>→</Text>
//                   <TouchableOpacity
//                     style={[styles.dateButton, toDate ? styles.dateButtonActive : null]}
//                     onPress={() => {/* open date picker */}}
//                   >
//                     <Calendar size={15} color={toDate ? COLORS.primary : COLORS.gray500} />
//                     <Text style={[styles.dateText, toDate ? styles.dateTextActive : null]}>
//                       {toDate || 'To Date'}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>

//                 {/* Apply / Reset */}
//                 <View style={styles.actionButtons}>
//                   <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
//                     <Text style={styles.applyButtonText}>Apply Filter</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
//                     <X size={15} color={COLORS.gray600} />
//                     <Text style={styles.resetButtonText}>Reset</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             )}

//             {/* Export buttons */}
//             <View style={styles.exportButtons}>
//               <TouchableOpacity
//                 style={styles.excelButton}
//                 onPress={() => Alert.alert('Export Excel', 'Excel export coming soon')}
//               >
//                 <Download size={16} color={COLORS.success} />
//                 <Text style={styles.excelButtonText}>Excel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.printButton} onPress={handlePrint} disabled={generating}>
//                 <Printer size={16} color={COLORS.primary} />
//                 <Text style={styles.printButtonText}>{generating ? 'Processing...' : 'Print'}</Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* ── Tabs ── */}
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             style={styles.tabsScroll}
//             contentContainerStyle={styles.tabsContent}
//           >
//             {REPORT_TABS.map(tab => (
//               <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onPress={handleTabPress} />
//             ))}
//           </ScrollView>
//         </>
//       }
//       ListFooterComponent={
//         <View style={styles.reportContainer}>
//           <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
//             {renderContent()}
//           </ViewShot>
//         </View>
//       }
//       showsVerticalScrollIndicator={false}
//       keyboardShouldPersistTaps="handled"
//     />
//   );
// }

// // ─── Styles ──────────────────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   container:              { flex: 1, backgroundColor: COLORS.gray50 },
//   summaryContainer:       { flexDirection: 'row', flexWrap: 'wrap', padding: SPACING.md, gap: SPACING.sm },
//   summaryCard:            { flex: 1, minWidth: '22%', backgroundColor: COLORS.white, borderRadius: BORDERS.radius.md, padding: SPACING.md, alignItems: 'center', ...SHADOWS.small },
//   summaryCardPrimary:     { borderTopWidth: 3, borderTopColor: COLORS.primary },
//   summaryCardTotal:       { backgroundColor: COLORS.primary },
//   summaryIconRow:         { marginBottom: 6 },
//   summaryLabel:           { ...FONTS.regular, fontSize: 11, color: COLORS.gray500, marginBottom: 4, textAlign: 'center' },
//   summaryValue:           { ...FONTS.bold, fontSize: 15, color: COLORS.gray900 },
//   filterSection:          { backgroundColor: COLORS.white, borderRadius: BORDERS.radius.lg, padding: SPACING.md, margin: SPACING.md, marginTop: 0, ...SHADOWS.medium },
//   searchRow:              { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
//   searchInputContainer:   { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray200, borderRadius: BORDERS.radius.md, paddingHorizontal: SPACING.sm, backgroundColor: COLORS.gray50 },
//   searchIcon:             { marginRight: 6 },
//   searchInput:            { flex: 1, paddingVertical: SPACING.sm, ...FONTS.regular, fontSize: 14, color: COLORS.gray900 },
//   searchClear:            { padding: 4 },
//   filterToggle:           { padding: SPACING.sm, backgroundColor: COLORS.gray100, borderRadius: BORDERS.radius.md, position: 'relative' },
//   filterToggleActive:     { backgroundColor: COLORS.primary },
//   filterBadge:            { position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.error, borderRadius: 99, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
//   filterBadgeText:        { color: COLORS.white, fontSize: 9, fontWeight: '700' },
//   filtersGrid:            { gap: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
//   filterItem:             { gap: SPACING.xs },
//   filterLabel:            { ...FONTS.medium, fontSize: 12, color: COLORS.gray600 },
//   chip:                   { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: BORDERS.radius.full, marginRight: SPACING.sm, backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.gray200 },
//   chipActive:             { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
//   chipText:               { ...FONTS.medium, fontSize: 12, color: COLORS.gray700 },
//   chipTextActive:         { color: COLORS.white },
//   dateRangeContainer:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
//   dateButton:             { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray200, borderRadius: BORDERS.radius.md, padding: SPACING.sm, gap: 6, backgroundColor: COLORS.gray50 },
//   dateButtonActive:       { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
//   dateText:               { ...FONTS.regular, fontSize: 13, color: COLORS.gray500 },
//   dateTextActive:         { color: COLORS.primary, ...FONTS.medium },
//   dateSeparator:          { ...FONTS.bold, color: COLORS.gray400, fontSize: 16 },
//   actionButtons:          { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xs },
//   applyButton:            { flex: 2, backgroundColor: COLORS.primary, borderRadius: BORDERS.radius.md, padding: SPACING.md, alignItems: 'center' },
//   applyButtonText:        { ...FONTS.semibold, color: COLORS.white, fontSize: 14 },
//   resetButton:            { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.gray100, borderRadius: BORDERS.radius.md, padding: SPACING.md, gap: 4 },
//   resetButtonText:        { ...FONTS.medium, color: COLORS.gray700, fontSize: 13 },
//   exportButtons:          { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
//   excelButton:            { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.success + '15', borderRadius: BORDERS.radius.md, paddingVertical: SPACING.sm, gap: 6, borderWidth: 1, borderColor: COLORS.success + '30' },
//   excelButtonText:        { ...FONTS.semibold, color: COLORS.success, fontSize: 13 },
//   printButton:            { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary + '10', borderRadius: BORDERS.radius.md, paddingVertical: SPACING.sm, gap: 6, borderWidth: 1, borderColor: COLORS.primary + '30' },
//   printButtonText:        { ...FONTS.semibold, color: COLORS.primary, fontSize: 13 },
//   tabsScroll:             { marginHorizontal: SPACING.md, marginBottom: SPACING.sm },
//   tabsContent:            { paddingVertical: 4 },
//   tab:                    { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDERS.radius.md, marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.gray200, ...SHADOWS.small },
//   activeTab:              { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
//   tabIcon:                { marginRight: 5 },
//   tabText:                { ...FONTS.medium, fontSize: 12, color: COLORS.gray600 },
//   activeTabText:          { color: COLORS.white },
//   reportContainer:        { marginHorizontal: SPACING.md, marginBottom: SPACING.md, backgroundColor: COLORS.white, borderRadius: BORDERS.radius.lg, overflow: 'hidden', ...SHADOWS.small },
//   tableContainer:         { overflow: 'hidden' },
//   tableHeader:            { flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: SPACING.sm + 2, paddingHorizontal: 4 },
//   tableHeaderCell:        { paddingHorizontal: 6, fontSize: 11, color: COLORS.white, fontWeight: '600' },
//   tableRow:               { flexDirection: 'row', paddingVertical: SPACING.sm, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
//   rowEven:                { backgroundColor: COLORS.white },
//   rowOdd:                 { backgroundColor: COLORS.gray50 },
//   tableCell:              { paddingHorizontal: 6, fontSize: 11, color: COLORS.gray800 },
//   boldCell:               { fontWeight: '700', color: COLORS.gray900 },
//   grandTotalRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.primary + '10', borderTopWidth: 2, borderTopColor: COLORS.primary + '30' },
//   grandTotalLabel:        { ...FONTS.bold, fontSize: 14, color: COLORS.gray800 },
//   grandTotalValue:        { ...FONTS.bold, fontSize: 15, color: COLORS.primary },
//   sectionCard:            { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
//   sectionHeader:          { flexDirection: 'row', alignItems: 'center', gap: 8, padding: SPACING.md, backgroundColor: COLORS.gray50, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
//   sectionTitle:           { ...FONTS.bold, fontSize: 13, color: COLORS.primary },
//   statusChip:             { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: BORDERS.radius.sm, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
//   statusChipText:         { ...FONTS.medium, fontSize: 10 },
//   emptyContainer:         { alignItems: 'center', paddingVertical: SPACING.xxl * 2, gap: SPACING.sm },
//   emptyText:              { ...FONTS.semibold, fontSize: 15, color: COLORS.gray500 },
//   emptySubText:           { ...FONTS.regular, fontSize: 13, color: COLORS.gray400 },
//   loaderContainer:        { alignItems: 'center', paddingVertical: SPACING.xxl * 2, gap: SPACING.md },
//   loaderText:             { ...FONTS.medium, color: COLORS.gray500 },
//   footerLoader:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md, gap: SPACING.sm },
//   footerLoaderText:       { ...FONTS.regular, fontSize: 12, color: COLORS.gray500 },
// });

//==========================================

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
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
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import RNPrint from 'react-native-print';
import ViewShot from 'react-native-view-shot';
import DatePicker from 'react-native-date-picker';
import {
  Calendar,
  Printer,
  Download,
  Filter,
  X,
  ClipboardList,
  Wrench,
  DollarSign,
  Settings,
  Store,
  Inbox,
  Send,
  Hammer,
  Clock,
  Truck,
  AlertTriangle,
  Search,
  TrendingUp,
  Package,
  Users,
  FileText,
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
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
import { downloadAsExcel, prepareExportData } from '../../utils/excelExport';

// ─── FIXED: Date Formatter ─────────────────────────────────────────────────
const formatDate = (value) => {
  if (!value || value === null || value === undefined) return '-';
  
  // If already a Date object
  if (value instanceof Date && !isNaN(value.getTime())) {
    return `${value.getDate()}/${value.getMonth() + 1}/${value.getFullYear()}`;
  }
  
  const str = String(value).trim();
  if (!str || str === 'null' || str === 'undefined' || str === 'NaN' || str === 'Invalid Date') return '-';

  // Already a short date string like "1/6/2026" or "28/5/2026"
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) return str;

  // ISO format or timestamp
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (e) {
    console.warn('Date parsing failed for:', str);
  }

  return str;
};

// ─── FIXED: Safe number formatter ─────────────────────────────────────────
const safeNum = (val) => {
  if (val === null || val === undefined || val === '' || val === 'null' || val === 'undefined') return 0;
  const n = Number(val);
  return isNaN(n) || !isFinite(n) ? 0 : n;
};

// ─── FIXED: Safe string formatter ─────────────────────────────────────────
const safeStr = (val, fallback = '-') => {
  if (val === null || val === undefined) return fallback;
  if (Array.isArray(val)) {
    return val.filter(Boolean).join(', ') || fallback;
  }
  const s = String(val).trim();
  if (!s || s === 'null' || s === 'undefined' || s === 'NaN' || s === 'nan') return fallback;
  return s;
};

// ─── FIXED: Deep field getter ─────────────────────────────────────────────
const getField = (obj, fieldName, defaultValue = '-') => {
  if (!obj) return defaultValue;

  // Handle nested objects like 'customer.name'
  if (fieldName.includes('.')) {
    const parts = fieldName.split('.');
    let current = obj;
    for (const part of parts) {
      if (!current || typeof current !== 'object') return defaultValue;
      current = current[part];
    }
    return current !== undefined && current !== null && current !== '' ? current : defaultValue;
  }

  // Direct access
  if (obj[fieldName] !== undefined && obj[fieldName] !== null && obj[fieldName] !== '') {
    return obj[fieldName];
  }

  // Case-insensitive search
  const lower = fieldName.toLowerCase();
  for (const key of Object.keys(obj)) {
    if (key.toLowerCase() === lower) {
      const v = obj[key];
      if (v !== undefined && v !== null && v !== '') return v;
    }
  }

  return defaultValue;
};

// ─── FIXED: Comprehensive job field extractor ─────────────────────────────
const extractJobFields = (item, index) => {
  if (!item) return {};

  const job = typeof item === 'object' ? item : {};
  const sl = index + 1;
  
  // Job Number
  const jobNo = safeStr(
    job.jobSheetNo || job.jobNo || job.JobNo || job.job_no || 
    job.jobNumber || job.job_number || job.id || job._id
  );
  
  // Customer information - handle nested objects
  const customerObj = job.customer || {};
  const customerName = safeStr(
    customerObj.name || job.customerName || job.CustomerName || 
    job.customer_name || job.name || job.clientName
  );
  
  const contact = safeStr(
    customerObj.contact || job.contact || job.Contact || 
    job.phone || job.mobile || job.contactNumber
  );
  
  const altContact = safeStr(
    customerObj.altContact || job.altContact || job.AltContact || 
    job.alt_contact || job.alternateContact || job.alternate_contact || job.altPhone
  );
  
  const email = safeStr(
    customerObj.email || job.email || job.Email || job.customerEmail
  );
  
  const address = safeStr(
    customerObj.address || job.address || job.Address || job.customerAddress
  );

  // Device information
  const deviceObj = job.device || {};
  const makeId = safeStr(
    deviceObj.make || job.makeId || job.Make || job.make || 
    job.brand || job.Brand || job.deviceMake
  );
  
  const modelId = safeStr(
    deviceObj.model || job.modelId || job.Model || job.model || 
    job.deviceModel || job.device_model
  );
  
  const imei = safeStr(
    deviceObj.imei || job.imei || job.IMEI || job.serial || 
    job.serialNo || job.serial_number
  );
  
  const warranty = safeStr(
    deviceObj.warranty || job.warranty || job.Warranty || 
    job.warrantyStatus || job.warranty_status,
    'No Warranty'
  );

  // Status
  const status = safeStr(
    deviceObj.mobileStatus || job.status || job.Status || 
    job.jobStatus || job.job_status
  );

  // Assignment
  const serviceObj = job.service || {};
  const engineerId = safeStr(
    serviceObj.engineer || job.engineerId || job.Engineer || 
    job.engineer || job.technicianId || job.technician || job.assignedEngineer
  );
  
  const dealerName = safeStr(
    serviceObj.dealer || job.dealerName || job.Dealer || 
    job.dealer || job.dealerId
  );
  
  const drawerId = safeStr(
    serviceObj.drawer || job.drawerId || job.Drawer || 
    job.drawer || job.drawerName,
    'Booking'
  );

  // Charges
  const serviceCharges = safeNum(
    serviceObj.serviceCharge || job.serviceCharges || job.ServiceCharges || 
    job.service_charges || job.serviceCharge || job.service || 
    job.svcCharges || job.svc
  );
  
  const spareCharges = safeNum(
    serviceObj.spareCharge || job.spareCharges || job.SpareCharges || 
    job.spare_charges || job.spareCharge || job.spare || job.partCharges
  );
  
  const total = serviceCharges + spareCharges;

  // Payment
  const paymentMode = safeStr(
    serviceObj.paymentMode || job.paymentMode || job.Payment || 
    job.payment || job.paymentType || job.payment_mode || job.payMode
  );

  // Problems and conditions - handle arrays
  const visualIssues = job.visualIssues;
  const problems = safeStr(
    Array.isArray(visualIssues) ? visualIssues.filter(Boolean).join(', ') :
    visualIssues || job.problems || job.Problems || job.problem || 
    job.fault || job.Fault || job.issue
  );
  
  const physicalCondition = job.physicalCondition;
  const physicalCond = safeStr(
    Array.isArray(physicalCondition) ? physicalCondition.join(', ') :
    physicalCondition || job.physicalConditions || job.physical_condition || 
    job.PhysicalCondition || job.physCond || job.physical_cond || job.PhysCond
  );
  
  const accessoriesArr = job.accessories;
  const accessories = safeStr(
    Array.isArray(accessoriesArr) ? accessoriesArr.join(', ') :
    accessoriesArr || job.Accessories || job.accessory
  );
  
  const remarks = safeStr(
    serviceObj.remarks || job.remarks || job.Remarks || 
    job.remark || job.note || job.notes
  );

  // Estimate
  const estimate = safeStr(
    serviceObj.estimate || job.estimate || job.Estimate || job.estimatedCost
  );

  // Dates
  const repairDate = formatDate(
    serviceObj.repairDate || job.repairDate || job.repairedDate || 
    job.RepairDate || job.repair_date || job.repaired_date || job.dateRepaired
  );
  
  const deliveryDate = formatDate(
    serviceObj.deliveryDate || job.deliveryDate || job.deliveredDate || 
    job.DeliveryDate || job.delivery_date || job.delivered_date || job.dateDelivered
  );
  
  const savedDate = formatDate(
    job.createdAt || job.savedDate || job.SavedDate || job.saved_date || 
    job.created_at || job.receivedDate || job.dateReceived || job.date
  );

  // Meta
  const createdByObj = job.createdBy || {};
  const createdBy = safeStr(
    createdByObj.username || createdByObj.name || job.createdBy || 
    job.CreatedBy || job.created_by || job.billingBy || job.billedBy || 
    job.addedBy || job.billing_by
  );

  return {
    sl, jobNo, customerName, contact, altContact, email, address,
    makeId, modelId, imei, warranty,
    status, engineerId, dealerName, drawerId,
    serviceCharges, spareCharges, total,
    paymentMode, estimate,
    problems, physicalCond, accessories, remarks,
    repairDate, deliveryDate, savedDate, createdBy,
  };
};

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 50;
const REPORT_TABS = [
  { id: 'all',             name: 'All Reports',      Icon: ClipboardList },
  { id: 'engineer',        name: 'Engineer Report',  Icon: Wrench },
  { id: 'value',           name: 'Value Report',     Icon: DollarSign },
  { id: 'spare',           name: 'Spare Report',     Icon: Settings },
  { id: 'dealer',          name: 'Dealer Report',    Icon: Store },
  { id: 'dailyReceived',   name: 'Daily Received',   Icon: Inbox },
  { id: 'dailyDelivered',  name: 'Daily Delivered',  Icon: Send },
  { id: 'dailyRepaired',   name: 'Daily Repaired',   Icon: Hammer },
  { id: 'repairPending',   name: 'Repair Pending',   Icon: Clock },
  { id: 'deliveryPending', name: 'Delivery Pending', Icon: Truck },
  { id: 'deliveredNRNA',   name: 'Delivered NR/NA',  Icon: AlertTriangle },
];
const STATUS_OPTIONS = ['All Status', 'Received', 'Pending', 'Repaired', 'Delivered'];

// ─── Helper Functions ─────────────────────────────────────────────────────────
const getStatusColor = status => {
  switch (status?.toLowerCase()) {
    case 'received':  return COLORS.info;
    case 'pending':   return COLORS.warning;
    case 'repaired':  return COLORS.success;
    case 'delivered': return COLORS.success;
    default:          return COLORS.gray500;
  }
};

// ─── Memoised Row Components ──────────────────────────────────────────────────
const StatusChip = React.memo(({ status }) => {
  const color = getStatusColor(status);
  return (
    <View style={[styles.statusChip, { backgroundColor: color + '20' }]}>
      <Text style={[styles.statusChipText, { color }]}>{status || '-'}</Text>
    </View>
  );
});

// ─── AllReportRow ─────────────────────────────────────────────────────────────
const AllReportRow = React.memo(({ item, index }) => {
  const f = extractJobFields(item, index);

  return (
    <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
      <Text style={[styles.tableCell, { width: 35  }]}>{f.sl}</Text>
      <Text style={[styles.tableCell, { width: 70  }]}>{f.jobNo}</Text>
      <Text style={[styles.tableCell, { width: 130 }]} numberOfLines={1}>{f.customerName}</Text>
      <Text style={[styles.tableCell, { width: 90  }]}>{f.contact}</Text>
      <Text style={[styles.tableCell, { width: 70  }]}>{f.altContact}</Text>
      <Text style={[styles.tableCell, { width: 70  }]}>{f.makeId}</Text>
      <Text style={[styles.tableCell, { width: 70  }]}>{f.modelId}</Text>
      <Text style={[styles.tableCell, { width: 100 }]}>{f.imei}</Text>
      <Text style={[styles.tableCell, { width: 70  }]}>{f.warranty}</Text>
      <View  style={[styles.tableCell, { width: 80  }]}>
        <StatusChip status={f.status} />
      </View>
      <Text style={[styles.tableCell, { width: 80  }]}>{f.engineerId}</Text>
      <Text style={[styles.tableCell, { width: 80  }]}>{f.dealerName}</Text>
      <Text style={[styles.tableCell, { width: 70  }]}>{f.drawerId}</Text>
      <Text style={[styles.tableCell, { width: 60  }]}>₹{f.serviceCharges}</Text>
      <Text style={[styles.tableCell, { width: 60  }]}>₹{f.spareCharges}</Text>
      <Text style={[styles.tableCell, styles.boldCell, { width: 70 }]}>₹{f.total}</Text>
      <Text style={[styles.tableCell, { width: 75  }]}>{f.paymentMode}</Text>
      <Text style={[styles.tableCell, { width: 80  }]} numberOfLines={2}>{f.problems}</Text>
      <Text style={[styles.tableCell, { width: 85  }]} numberOfLines={2}>{f.physicalCond}</Text>
      <Text style={[styles.tableCell, { width: 85  }]}>{f.accessories}</Text>
      <Text style={[styles.tableCell, { width: 85  }]}>{f.repairDate}</Text>
      <Text style={[styles.tableCell, { width: 85  }]}>{f.deliveryDate}</Text>
      <Text style={[styles.tableCell, { width: 70  }]}>{f.remarks}</Text>
      <Text style={[styles.tableCell, { width: 85  }]}>{f.savedDate}</Text>
      <Text style={[styles.tableCell, { width: 80  }]}>{f.createdBy}</Text>
    </View>
  );
});

// ─── EngineerRow ──────────────────────────────────────────────────────────────
const EngineerRow = React.memo(({ item, index }) => {
  const f = extractJobFields(item, index);
  return (
    <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
      <Text style={[styles.tableCell, { width: 75  }]}>{f.jobNo}</Text>
      <Text style={[styles.tableCell, { width: 140 }]}>{f.customerName}</Text>
      <Text style={[styles.tableCell, { width: 110 }]}>{f.contact}</Text>
      <View  style={[styles.tableCell, { width: 90  }]}>
        <StatusChip status={f.status} />
      </View>
      <Text style={[styles.tableCell, { width: 100 }]}>{f.savedDate}</Text>
      <Text style={[styles.tableCell, { width: 100 }]}>{f.deliveryDate}</Text>
    </View>
  );
});

// ─── ValueRow ─────────────────────────────────────────────────────────────────
const ValueRow = React.memo(({ item, index }) => {
  const f = extractJobFields(item, index);
  const service = safeNum(item.service ?? item.serviceCharges ?? item.serviceCharge);
  const spare   = safeNum(item.spare   ?? item.spareCharges   ?? item.spareCharge);
  const total   = safeNum(item.total)  || service + spare;
  return (
    <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
      <Text style={[styles.tableCell, { width: 75  }]}>{f.jobNo}</Text>
      <Text style={[styles.tableCell, { width: 140 }]}>{safeStr(item.name) !== '-' ? safeStr(item.name) : f.customerName}</Text>
      <Text style={[styles.tableCell, { width: 100 }]}>{formatDate(item.received ?? item.savedDate)}</Text>
      <Text style={[styles.tableCell, { width: 100 }]}>{formatDate(item.repaired ?? item.repairedDate)}</Text>
      <Text style={[styles.tableCell, { width: 100 }]}>{formatDate(item.delivered ?? item.deliveredDate)}</Text>
      <Text style={[styles.tableCell, { width: 75  }]}>₹{service}</Text>
      <Text style={[styles.tableCell, { width: 75  }]}>₹{spare}</Text>
      <Text style={[styles.tableCell, styles.boldCell, { width: 75 }]}>₹{total}</Text>
    </View>
  );
});

// ─── SpareRow ─────────────────────────────────────────────────────────────────
const SpareRow = React.memo(({ item, index }) => {
  const qty    = safeNum(item.qty);
  const rate   = safeNum(item.rate);
  const amount = safeNum(item.amount) || qty * rate;
  return (
    <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
      <Text style={[styles.tableCell, { width: 75  }]}>{safeStr(item.jobSheet)}</Text>
      <Text style={[styles.tableCell, { width: 190 }]}>{safeStr(item.spare)}</Text>
      <Text style={[styles.tableCell, { width: 55  }]}>{qty}</Text>
      <Text style={[styles.tableCell, { width: 90  }]}>₹{rate}</Text>
      <Text style={[styles.tableCell, styles.boldCell, { width: 90 }]}>₹{amount}</Text>
    </View>
  );
});

// ─── DealerRow ────────────────────────────────────────────────────────────────
const DealerRow = React.memo(({ item, index }) => {
  const f   = extractJobFields(item, index);
  const svc = safeNum(item.serviceCharges ?? item.service);
  const sp  = safeNum(item.spareCharges   ?? item.spare);
  return (
    <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
      <Text style={[styles.tableCell, { width: 40  }]}>{index + 1}</Text>
      <Text style={[styles.tableCell, { width: 140 }]}>{f.dealerName}</Text>
      <Text style={[styles.tableCell, { width: 190 }]}>{f.customerName}</Text>
      <Text style={[styles.tableCell, { width: 110 }]}>{f.contact}</Text>
      <Text style={[styles.tableCell, { width: 100 }]}>{f.savedDate}</Text>
      <View  style={[styles.tableCell, { width: 90  }]}>
        <StatusChip status={f.status} />
      </View>
      <Text style={[styles.tableCell, { width: 75  }]}>₹{svc}</Text>
      <Text style={[styles.tableCell, { width: 75  }]}>₹{sp}</Text>
      <Text style={[styles.tableCell, styles.boldCell, { width: 75 }]}>₹{svc + sp}</Text>
    </View>
  );
});

// ─── PendingRow ───────────────────────────────────────────────────────────────
const PendingRow = React.memo(({ item, index }) => {
  const f = extractJobFields(item, index);
  return (
    <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
      <Text style={[styles.tableCell, { width: 40  }]}>{index + 1}</Text>
      <Text style={[styles.tableCell, { width: 75  }]}>{f.jobNo}</Text>
      <Text style={[styles.tableCell, { width: 140 }]}>{f.customerName}</Text>
      <Text style={[styles.tableCell, { width: 110 }]}>{f.contact}</Text>
      <Text style={[styles.tableCell, { width: 100 }]}>{`${f.makeId} ${f.modelId}`.trim()}</Text>
      <Text style={[styles.tableCell, { width: 100 }]}>{f.savedDate}</Text>
      <View  style={[styles.tableCell, { width: 90  }]}>
        <StatusChip status={f.status} />
      </View>
      <Text style={[styles.tableCell, { width: 90  }]}>{f.engineerId}</Text>
    </View>
  );
});

// ─── NRNARow ──────────────────────────────────────────────────────────────────
const NRNARow = React.memo(({ item, index }) => {
  const f = extractJobFields(item, index);
  return (
    <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
      <Text style={[styles.tableCell, { width: 40  }]}>{index + 1}</Text>
      <Text style={[styles.tableCell, { width: 75  }]}>{f.jobNo}</Text>
      <Text style={[styles.tableCell, { width: 140 }]}>{f.customerName}</Text>
      <Text style={[styles.tableCell, { width: 110 }]}>{f.contact}</Text>
      <Text style={[styles.tableCell, { width: 100 }]}>{f.deliveryDate}</Text>
      <Text style={[styles.tableCell, { width: 140 }]}>{f.physicalCond}</Text>
    </View>
  );
});

// ─── DailyRow ─────────────────────────────────────────────────────────────────
const DailyRow = React.memo(({ item, index }) => (
  <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
    <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(item.date)}</Text>
    <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontWeight: '600' }]}>
      {safeNum(item.count)}
    </Text>
  </View>
));

const EmptyState = React.memo(() => (
  <View style={styles.emptyContainer}>
    <FileText size={40} color={COLORS.gray300} />
    <Text style={styles.emptyText}>No data found</Text>
    <Text style={styles.emptySubText}>Try adjusting your filters or date range</Text>
  </View>
));

// ─── Summary Cards ──────────────────────────────────────────────────────────
const SummaryCards = React.memo(({ stats, activeTab }) => {
  const isDailyTab   = ['dailyReceived', 'dailyDelivered', 'dailyRepaired'].includes(activeTab);
  const isPendingTab = ['repairPending', 'deliveryPending', 'deliveredNRNA'].includes(activeTab);
  return (
    <View style={styles.summaryContainer}>
      <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
        <View style={styles.summaryIconRow}><FileText size={18} color={COLORS.primary} /></View>
        <Text style={styles.summaryLabel}>Total Records</Text>
        <Text style={[styles.summaryValue, { color: COLORS.primary }]}>{stats.totalRecords}</Text>
      </View>
      {!isPendingTab && !isDailyTab && (
        <>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconRow}><TrendingUp size={18} color={COLORS.info} /></View>
            <Text style={styles.summaryLabel}>Service</Text>
            <Text style={[styles.summaryValue, { color: COLORS.info }]}>₹{stats.serviceCharge.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconRow}><Package size={18} color={COLORS.warning} /></View>
            <Text style={styles.summaryLabel}>Spare</Text>
            <Text style={[styles.summaryValue, { color: COLORS.warning }]}>₹{stats.spareCharge.toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardTotal]}>
            <View style={styles.summaryIconRow}><DollarSign size={18} color={COLORS.white} /></View>
            <Text style={[styles.summaryLabel, { color: COLORS.white + 'cc' }]}>Total</Text>
            <Text style={[styles.summaryValue, { color: COLORS.white }]}>₹{stats.totalAmount.toLocaleString()}</Text>
          </View>
        </>
      )}
      {isDailyTab && (
        <View style={[styles.summaryCard, styles.summaryCardTotal]}>
          <View style={styles.summaryIconRow}><Users size={18} color={COLORS.white} /></View>
          <Text style={[styles.summaryLabel, { color: COLORS.white + 'cc' }]}>Total Count</Text>
          <Text style={[styles.summaryValue, { color: COLORS.white }]}>{stats.totalAmount}</Text>
        </View>
      )}
    </View>
  );
});

// ─── Tab Button ─────────────────────────────────────────────────────────────
const TabButton = React.memo(({ tab, isActive, onPress }) => {
  const { Icon, name, id } = tab;
  const handlePress = useCallback(() => onPress(id), [id, onPress]);
  return (
    <TouchableOpacity style={[styles.tab, isActive && styles.activeTab]} onPress={handlePress}>
      <Icon size={13} color={isActive ? COLORS.white : COLORS.gray600} style={styles.tabIcon} />
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>{name}</Text>
    </TouchableOpacity>
  );
});

// ─── FlatList Footer Loader ─────────────────────────────────────────────────
const ListFooterLoader = React.memo(({ loading }) => {
  if (!loading) return null;
  return (
    <View style={styles.footerLoader}>
      <ActivityIndicator size="small" color={COLORS.primary} />
      <Text style={styles.footerLoaderText}>Loading more...</Text>
    </View>
  );
});

// ─── Engineer Section ───────────────────────────────────────────────────────
const EngineerSection = React.memo(({ section }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <Wrench size={14} color={COLORS.primary} />
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={styles.tableHeader}>
          {['Job No', 'Customer', 'Contact', 'Status', 'Received', 'Delivered'].map((h, i) => (
            <Text key={i} style={[styles.tableHeaderCell, { width: [75, 140, 110, 90, 100, 100][i] }]}>{h}</Text>
          ))}
        </View>
        <FlatList
          data={section.data}
          renderItem={({ item, index }) => <EngineerRow item={item} index={index} />}
          keyExtractor={(item, idx) => String(item?.jobNo ?? item?.id ?? idx)}
          scrollEnabled={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          removeClippedSubviews
        />
      </View>
    </ScrollView>
  </View>
));

// ─── Main Screen ────────────────────────────────────────────────────────────
export default function ReportsScreen() {
  const dispatch = useDispatch();
  const viewShotRef = useRef(null);
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
  const { engineers, dealers } = useSelector(state => state.admin);
  const { list, loading: jobsLoading } = useSelector(state => state.jobs);

  const loading = reportLoading || jobsLoading;

  const [activeTab, setActiveTab] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const [selectedDealer, setSelectedDealer] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  
  // Date picker states
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [tempFromDate, setTempFromDate] = useState(new Date());
  const [tempToDate, setTempToDate] = useState(new Date());

  // ─── Filtered + paginated lists ──────────────────────────────────────────
  const filteredList = useMemo(() => {
    if (!list || list.length === 0) return [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(j => {
      const f = extractJobFields(j, 0);
      return (
        f.customerName.toLowerCase().includes(q) ||
        f.contact.includes(q) ||
        f.jobNo.toLowerCase().includes(q) ||
        f.imei.includes(q)
      );
    });
  }, [list, searchQuery]);

  const paginatedList = useMemo(() => filteredList.slice(0, page * PAGE_SIZE), [filteredList, page]);
  const hasMore = paginatedList.length < filteredList.length;

  const filteredPending = useMemo(() => {
    if (!pendingReport || pendingReport.length === 0) return [];
    if (!searchQuery.trim()) return pendingReport;
    const q = searchQuery.toLowerCase();
    return pendingReport.filter(j => {
      const f = extractJobFields(j, 0);
      return (
        f.customerName.toLowerCase().includes(q) ||
        f.contact.includes(q) ||
        f.jobNo.toLowerCase().includes(q)
      );
    });
  }, [pendingReport, searchQuery]);

  const paginatedPending = useMemo(() => filteredPending.slice(0, page * PAGE_SIZE), [filteredPending, page]);
  const hasMorePending = paginatedPending.length < filteredPending.length;

  const loadMore = useCallback(() => { if (!hasMore || loading) return; setPage(p => p + 1); }, [hasMore, loading]);
  const loadMorePending = useCallback(() => { if (!hasMorePending || loading) return; setPage(p => p + 1); }, [hasMorePending, loading]);

  // ─── Summary stats ───────────────────────────────────────────────────────
  const summaryStats = useMemo(() => {
    switch (activeTab) {
      case 'value': {
        const svc = (valueReport || []).reduce((s, j) => s + safeNum(j.service ?? j.serviceCharges), 0);
        const sp  = (valueReport || []).reduce((s, j) => s + safeNum(j.spare   ?? j.spareCharges),   0);
        return { totalRecords: (valueReport || []).length, serviceCharge: svc, spareCharge: sp, totalAmount: svc + sp };
      }
      case 'spare': {
        const total = (spareReport || []).reduce((s, i) => s + safeNum(i.amount), 0);
        return { totalRecords: (spareReport || []).length, serviceCharge: 0, spareCharge: total, totalAmount: total };
      }
      case 'dealer': {
        const svc = (dealerReport || []).reduce((s, j) => s + safeNum(j.serviceCharges ?? j.service), 0);
        const sp  = (dealerReport || []).reduce((s, j) => s + safeNum(j.spareCharges   ?? j.spare),   0);
        return { totalRecords: (dealerReport || []).length, serviceCharge: svc, spareCharge: sp, totalAmount: svc + sp };
      }
      case 'engineer': {
        const allJobs = [
          ...(noEngineerJobs || []),
          ...(engineerReport || []).flatMap(e => e.jobs || []),
        ];
        const svc = allJobs.reduce((s, j) => s + safeNum(j.serviceCharges ?? j.service), 0);
        const sp  = allJobs.reduce((s, j) => s + safeNum(j.spareCharges   ?? j.spare),   0);
        return { totalRecords: allJobs.length, serviceCharge: svc, spareCharge: sp, totalAmount: svc + sp };
      }
      case 'repairPending':
      case 'deliveryPending':
        return { totalRecords: (pendingReport || []).length, serviceCharge: 0, spareCharge: 0, totalAmount: 0 };
      case 'dailyReceived':
      case 'dailyDelivered':
      case 'dailyRepaired': {
        const cnt = (dailySummary || []).reduce((s, i) => s + safeNum(i.count), 0);
        return { totalRecords: (dailySummary || []).length, serviceCharge: 0, spareCharge: 0, totalAmount: cnt };
      }
      case 'deliveredNRNA':
        return { totalRecords: (deliveredNRNA || []).length, serviceCharge: 0, spareCharge: 0, totalAmount: 0 };
      default: {
        const svc = (list || []).reduce((s, j) => s + safeNum(j.serviceCharges ?? j.service), 0);
        const sp  = (list || []).reduce((s, j) => s + safeNum(j.spareCharges   ?? j.spare),   0);
        return { totalRecords: (list || []).length, serviceCharge: svc, spareCharge: sp, totalAmount: svc + sp };
      }
    }
  }, [activeTab, list, valueReport, spareReport, dealerReport, pendingReport, engineerReport, noEngineerJobs, dailySummary, deliveredNRNA]);

  // ─── Data loading ────────────────────────────────────────────────────────
  const loadReport = useCallback((tabId, fd, td, sf, se, sd) => {
    const filters = { fromDate: fd, toDate: td };
    if (sf !== 'All Status') filters.status = sf;
    setPage(1);
    switch (tabId) {
      case 'engineer':        dispatch(fetchEngineerWiseReport(filters)); break;
      case 'value':           dispatch(fetchValueReport(filters)); break;
      case 'spare':           dispatch(fetchSpareReport({ ...filters, engineerId: se })); break;
      case 'dealer':          dispatch(fetchDealerReport({ dealerName: sd, fromDate: fd, toDate: td })); break;
      case 'all':             dispatch(fetchJobs(filters)); break;
      case 'dailyReceived':   dispatch(fetchDailySummary({ type: 'received',  fromDate: fd, toDate: td })); break;
      case 'dailyDelivered':  dispatch(fetchDailySummary({ type: 'delivered', fromDate: fd, toDate: td })); break;
      case 'dailyRepaired':   dispatch(fetchDailySummary({ type: 'repaired',  fromDate: fd, toDate: td })); break;
      case 'repairPending':   dispatch(fetchPendingReport({ type: 'repairPending',   fromDate: fd, toDate: td })); break;
      case 'deliveryPending': dispatch(fetchPendingReport({ type: 'deliveryPending', fromDate: fd, toDate: td })); break;
      case 'deliveredNRNA':   dispatch(fetchDeliveredNRNAReport({ fromDate: fd, toDate: td })); break;
    }
  }, [dispatch]);

  const handleTabPress = useCallback((tabId) => {
    setActiveTab(tabId);
    setPage(1);
    loadReport(tabId, fromDate, toDate, statusFilter, selectedEngineer, selectedDealer);
  }, [loadReport, fromDate, toDate, statusFilter, selectedEngineer, selectedDealer]);

  const handleApplyFilter = useCallback(() => {
    setPage(1);
    loadReport(activeTab, fromDate, toDate, statusFilter, selectedEngineer, selectedDealer);
  }, [loadReport, activeTab, fromDate, toDate, statusFilter, selectedEngineer, selectedDealer]);

  const resetFilters = useCallback(() => {
    setFromDate('');
    setToDate('');
    setStatusFilter('All Status');
    setSelectedEngineer('');
    setSelectedDealer('');
    setSearchQuery('');
    setPage(1);
    loadReport(activeTab, '', '', 'All Status', '', '');
  }, [loadReport, activeTab]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReport(activeTab, fromDate, toDate, statusFilter, selectedEngineer, selectedDealer);
    setRefreshing(false);
  }, [loadReport, activeTab, fromDate, toDate, statusFilter, selectedEngineer, selectedDealer]);

  const handlePrint = useCallback(async () => {
    if (!viewShotRef.current) return;
    setGenerating(true);
    try {
      const uri = await viewShotRef.current.capture();
      await RNPrint.print({ filePath: uri });
    } catch (error) {
      Alert.alert('Error', 'Failed to print report');
    } finally {
      setGenerating(false);
    }
  }, []);

  // ─── Excel Export Handler ─────────────────────────────────────────────────
  // ─── Excel Download Handler ─────────────────────────────────────────────────
const handleExportToExcel = useCallback(async () => {
  if (generating) return;
  
  setGenerating(true);
  
  try {
    let exportData = [];
    let filename = '';
    let reportType = activeTab;
    
    // Prepare data based on active tab
    switch (activeTab) {
      case 'all':
        exportData = paginatedList;
        filename = 'All_Reports';
        break;
        
      case 'engineer': {
        const sections = [];
        if (noEngineerJobs?.length > 0) {
          sections.push({ engineer: 'Unassigned', jobs: noEngineerJobs });
        }
        (engineerReport || []).forEach(eng => {
          sections.push({ engineer: eng.engineer, jobs: eng.jobs || [] });
        });
        exportData = sections;
        filename = 'Engineer_Wise_Report';
        break;
      }
      
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
        
      case 'dailyReceived':
        exportData = dailySummary || [];
        filename = 'Daily_Received_Report';
        reportType = 'daily';
        break;
        
      case 'dailyDelivered':
        exportData = dailySummary || [];
        filename = 'Daily_Delivered_Report';
        reportType = 'daily';
        break;
        
      case 'dailyRepaired':
        exportData = dailySummary || [];
        filename = 'Daily_Repaired_Report';
        reportType = 'daily';
        break;
        
      case 'repairPending':
        exportData = paginatedPending;
        filename = 'Repair_Pending_Report';
        reportType = 'pending';
        break;
        
      case 'deliveryPending':
        exportData = paginatedPending;
        filename = 'Delivery_Pending_Report';
        reportType = 'pending';
        break;
        
      case 'deliveredNRNA':
        exportData = deliveredNRNA || [];
        filename = 'Delivered_NR_NA_Report';
        reportType = 'deliveredNRNA';
        break;
        
      default:
        exportData = paginatedList;
        filename = 'Reports';
    }
    
    if (!exportData || exportData.length === 0) {
      Alert.alert('No Data', 'There is no data to download for this report');
      setGenerating(false);
      return;
    }
    
    // Prepare the data with proper formatting
    const preparedData = prepareExportData(reportType, exportData, (item, idx) => extractJobFields(item, idx));
    
    // Download as Excel
    await downloadAsExcel(preparedData, filename);
    
  } catch (error) {
    console.error('Download error:', error);
    Alert.alert('Download Failed', 'An error occurred while downloading the report');
  } finally {
    setGenerating(false);
  }
}, [activeTab, paginatedList, engineerReport, noEngineerJobs, valueReport, spareReport, dealerReport, dailySummary, paginatedPending, deliveredNRNA, generating]);
  const toggleFilters = useCallback(() => setShowFilters(v => !v), []);
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (fromDate) count++;
    if (toDate) count++;
    if (statusFilter !== 'All Status') count++;
    if (selectedEngineer) count++;
    if (selectedDealer) count++;
    return count;
  }, [fromDate, toDate, statusFilter, selectedEngineer, selectedDealer]);

  // Date picker handlers
  const onFromDateConfirm = (selectedDate) => {
    setShowFromDatePicker(false);
    const formatted = `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`;
    setFromDate(formatted);
  };

  const onToDateConfirm = (selectedDate) => {
    setShowToDatePicker(false);
    const formatted = `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`;
    setToDate(formatted);
  };

  useEffect(() => {
    loadReport('all', '', '', 'All Status', '', '');
  }, []);

  // ─── Render content per tab ──────────────────────────────────────────────
  const renderContent = () => {
    if (loading && page === 1) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading report...</Text>
        </View>
      );
    }

    switch (activeTab) {
      // ── All Reports ──────────────────────────────────────────────────────
      case 'all':
        return (
          <View style={styles.tableContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View style={styles.tableHeader}>
                  {[
                    ['SL',35],['Job No',70],['Name',130],['Contact',90],['Alt Contact',70],
                    ['Make',70],['Model',70],['IMEI',100],['Warranty',70],['Status',80],
                    ['Engineer',80],['Dealer',80],['Drawer',70],['Svc',60],['Spare',60],
                    ['Total',70],['Payment',75],['Problems',80],['Phys Cond',85],
                    ['Accessories',85],['Repair Dt',85],['Delivery Dt',85],
                    ['Remarks',70],['Saved Dt',85],['Created By',80],
                  ].map(([h, w], i) => (
                    <Text key={i} style={[styles.tableHeaderCell, { width: w }]}>{h}</Text>
                  ))}
                </View>
                <FlatList
                  data={paginatedList}
                  renderItem={({ item, index }) => <AllReportRow item={item} index={index} />}
                  keyExtractor={(item, idx) => String(item?.jobNo ?? item?.id ?? idx)}
                  scrollEnabled={false}
                  onEndReached={loadMore}
                  onEndReachedThreshold={0.3}
                  ListEmptyComponent={<EmptyState />}
                  ListFooterComponent={<ListFooterLoader loading={loading && hasMore} />}
                  initialNumToRender={20}
                  maxToRenderPerBatch={15}
                  windowSize={10}
                  removeClippedSubviews
                />
              </View>
            </ScrollView>
          </View>
        );

      // ── Engineer Report ──────────────────────────────────────────────────
      case 'engineer': {
        const sections = [];
        if (noEngineerJobs?.length > 0)
          sections.push({ title: `Unassigned (${noEngineerJobs.length} jobs)`, data: noEngineerJobs });
        (engineerReport || []).forEach(eng =>
          sections.push({ title: `${eng.engineer} (${(eng.jobs || []).length} jobs)`, data: eng.jobs || [] })
        );
        if (sections.length === 0) return <EmptyState />;
        return sections.map((section, idx) => <EngineerSection key={idx} section={section} />);
      }

      // ── Value Report ─────────────────────────────────────────────────────
      case 'value':
        return (
          <View style={styles.tableContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View style={styles.tableHeader}>
                  {[['Job No',75],['Customer',140],['Received',100],['Repaired',100],
                    ['Delivered',100],['Service',75],['Spare',75],['Total',75]
                  ].map(([h, w], i) => (
                    <Text key={i} style={[styles.tableHeaderCell, { width: w }]}>{h}</Text>
                  ))}
                </View>
                <FlatList
                  data={valueReport || []}
                  renderItem={({ item, index }) => <ValueRow item={item} index={index} />}
                  keyExtractor={(item, idx) => String(item?.jobNo ?? idx)}
                  scrollEnabled={false}
                  ListEmptyComponent={<EmptyState />}
                  initialNumToRender={20}
                  maxToRenderPerBatch={15}
                  removeClippedSubviews
                />
              </View>
            </ScrollView>
            {(valueReport || []).length > 0 && (
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalValue}>
                  ₹{(valueReport || []).reduce((s, i) => s + safeNum(i.total ?? (safeNum(i.service ?? i.serviceCharges) + safeNum(i.spare ?? i.spareCharges))), 0).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        );

      // ── Spare Report ─────────────────────────────────────────────────────
      case 'spare':
        return (
          <View style={styles.tableContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View style={styles.tableHeader}>
                  {[['Job Sheet',75],['Spare Part',190],['Qty',55],['Rate',90],['Amount',90]].map(([h, w], i) => (
                    <Text key={i} style={[styles.tableHeaderCell, { width: w }]}>{h}</Text>
                  ))}
                </View>
                <FlatList
                  data={spareReport || []}
                  renderItem={({ item, index }) => <SpareRow item={item} index={index} />}
                  keyExtractor={(_, idx) => String(idx)}
                  scrollEnabled={false}
                  ListEmptyComponent={<EmptyState />}
                  initialNumToRender={20}
                  maxToRenderPerBatch={15}
                  removeClippedSubviews
                />
              </View>
            </ScrollView>
            {(spareReport || []).length > 0 && (
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalValue}>
                  ₹{(spareReport || []).reduce((s, i) => s + safeNum(i.amount), 0).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        );

      // ── Dealer Report ────────────────────────────────────────────────────
      case 'dealer':
        return (
          <View style={styles.tableContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View style={styles.tableHeader}>
                  {[['SL',40],['Dealer',140],['Customer',190],['Contact',110],
                    ['Date',100],['Status',90],['Service',75],['Spare',75],['Total',75]
                  ].map(([h, w], i) => (
                    <Text key={i} style={[styles.tableHeaderCell, { width: w }]}>{h}</Text>
                  ))}
                </View>
                <FlatList
                  data={dealerReport || []}
                  renderItem={({ item, index }) => <DealerRow item={item} index={index} />}
                  keyExtractor={(item, idx) => String(item?.jobNo ?? idx)}
                  scrollEnabled={false}
                  ListEmptyComponent={<EmptyState />}
                  initialNumToRender={15}
                  maxToRenderPerBatch={15}
                  removeClippedSubviews
                />
              </View>
            </ScrollView>
          </View>
        );

      // ── Daily Reports ────────────────────────────────────────────────────
      case 'dailyReceived':
      case 'dailyDelivered':
      case 'dailyRepaired':
        return (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Date</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Count</Text>
            </View>
            <FlatList
              data={dailySummary || []}
              renderItem={({ item, index }) => <DailyRow item={item} index={index} />}
              keyExtractor={(_, idx) => String(idx)}
              scrollEnabled={false}
              ListEmptyComponent={<EmptyState />}
              initialNumToRender={20}
              maxToRenderPerBatch={20}
            />
            {(dailySummary || []).length > 0 && (
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Total Count</Text>
                <Text style={styles.grandTotalValue}>
                  {(dailySummary || []).reduce((s, i) => s + safeNum(i.count), 0)}
                </Text>
              </View>
            )}
          </View>
        );

      // ── Pending Reports ──────────────────────────────────────────────────
      case 'repairPending':
      case 'deliveryPending':
        return (
          <View style={styles.tableContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View style={styles.tableHeader}>
                  {[['SL',40],['Job No',75],['Customer',140],['Phone',110],
                    ['Make/Model',100],['Date',100],['Status',90],['Engineer',90]
                  ].map(([h, w], i) => (
                    <Text key={i} style={[styles.tableHeaderCell, { width: w }]}>{h}</Text>
                  ))}
                </View>
                <FlatList
                  data={paginatedPending}
                  renderItem={({ item, index }) => <PendingRow item={item} index={index} />}
                  keyExtractor={(item, idx) => String(item?.jobNo ?? idx)}
                  scrollEnabled={false}
                  onEndReached={loadMorePending}
                  onEndReachedThreshold={0.3}
                  ListEmptyComponent={<EmptyState />}
                  ListFooterComponent={<ListFooterLoader loading={loading && hasMorePending} />}
                  initialNumToRender={15}
                  maxToRenderPerBatch={15}
                  removeClippedSubviews
                />
              </View>
            </ScrollView>
          </View>
        );

      // ── Delivered NR/NA ──────────────────────────────────────────────────
      case 'deliveredNRNA':
        return (
          <View style={styles.tableContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View style={styles.tableHeader}>
                  {[['SL',40],['Job No',75],['Customer',140],['Contact',110],
                    ['Delivered Date',100],['Physical Cond.',140]
                  ].map(([h, w], i) => (
                    <Text key={i} style={[styles.tableHeaderCell, { width: w }]}>{h}</Text>
                  ))}
                </View>
                <FlatList
                  data={deliveredNRNA || []}
                  renderItem={({ item, index }) => <NRNARow item={item} index={index} />}
                  keyExtractor={(item, idx) => String(item?.jobNo ?? idx)}
                  scrollEnabled={false}
                  ListEmptyComponent={<EmptyState />}
                  initialNumToRender={15}
                  maxToRenderPerBatch={15}
                  removeClippedSubviews
                />
              </View>
            </ScrollView>
          </View>
        );

      default:
        return <EmptyState />;
    }
  };

  // ─── Root render ─────────────────────────────────────────────────────────
  return (
    <>
      <FlatList
        style={styles.container}
        data={[]}
        renderItem={null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
        }
        ListHeaderComponent={
          <>
            <SummaryCards stats={summaryStats} activeTab={activeTab} />

            {/* ── Filter section ── */}
            <View style={styles.filterSection}>
              <View style={styles.searchRow}>
                <View style={styles.searchInputContainer}>
                  <Search size={16} color={COLORS.gray400} style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Name / Contact / Job No / IMEI"
                    placeholderTextColor={COLORS.gray400}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClear}>
                      <X size={14} color={COLORS.gray400} />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.filterToggle, activeFilterCount > 0 && styles.filterToggleActive]}
                  onPress={toggleFilters}
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
                  {/* Status chips */}
                  <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>Status</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {STATUS_OPTIONS.map(status => (
                        <TouchableOpacity
                          key={status}
                          style={[styles.chip, statusFilter === status && styles.chipActive]}
                          onPress={() => setStatusFilter(status)}
                        >
                          <Text style={[styles.chipText, statusFilter === status && styles.chipTextActive]}>{status}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Engineer chips */}
                  <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>Engineer</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <TouchableOpacity
                        style={[styles.chip, !selectedEngineer && styles.chipActive]}
                        onPress={() => setSelectedEngineer('')}
                      >
                        <Text style={[styles.chipText, !selectedEngineer && styles.chipTextActive]}>All</Text>
                      </TouchableOpacity>
                      {(engineers || []).map(engineer => (
                        <TouchableOpacity
                          key={engineer.id}
                          style={[styles.chip, selectedEngineer === engineer.name && styles.chipActive]}
                          onPress={() => setSelectedEngineer(engineer.name)}
                        >
                          <Text style={[styles.chipText, selectedEngineer === engineer.name && styles.chipTextActive]}>
                            {engineer.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Dealer chips */}
                  <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>Dealer</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <TouchableOpacity
                        style={[styles.chip, !selectedDealer && styles.chipActive]}
                        onPress={() => setSelectedDealer('')}
                      >
                        <Text style={[styles.chipText, !selectedDealer && styles.chipTextActive]}>All</Text>
                      </TouchableOpacity>
                      {(dealers || []).map(dealer => (
                        <TouchableOpacity
                          key={dealer.id}
                          style={[styles.chip, selectedDealer === dealer.name && styles.chipActive]}
                          onPress={() => setSelectedDealer(dealer.name)}
                        >
                          <Text style={[styles.chipText, selectedDealer === dealer.name && styles.chipTextActive]}>
                            {dealer.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Date range */}
                  <View style={styles.dateRangeContainer}>
                    <TouchableOpacity
                      style={[styles.dateButton, fromDate ? styles.dateButtonActive : null]}
                      onPress={() => setShowFromDatePicker(true)}
                    >
                      <Calendar size={15} color={fromDate ? COLORS.primary : COLORS.gray500} />
                      <Text style={[styles.dateText, fromDate ? styles.dateTextActive : null]}>
                        {fromDate || 'From Date'}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.dateSeparator}>→</Text>
                    <TouchableOpacity
                      style={[styles.dateButton, toDate ? styles.dateButtonActive : null]}
                      onPress={() => setShowToDatePicker(true)}
                    >
                      <Calendar size={15} color={toDate ? COLORS.primary : COLORS.gray500} />
                      <Text style={[styles.dateText, toDate ? styles.dateTextActive : null]}>
                        {toDate || 'To Date'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Apply / Reset */}
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

              {/* Export buttons */}
              <View style={styles.exportButtons}>
                <TouchableOpacity
                  style={[styles.excelButton, generating && styles.excelButtonDisabled]}
                  onPress={handleExportToExcel}
                  disabled={generating}
                >
                  <Download size={16} color={COLORS.success} />
                  <Text style={styles.excelButtonText}>
                    {generating ? 'Exporting...' : 'Excel'}
                  </Text>
                </TouchableOpacity>

              </View>
            </View>

            {/* ── Tabs ── */}
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
          </>
        }
        ListFooterComponent={
          <View style={styles.reportContainer}>
            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
              {renderContent()}
            </ViewShot>
          </View>
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {/* Date Pickers */}
      <DatePicker
        modal
        open={showFromDatePicker}
        date={tempFromDate}
        mode="date"
        onConfirm={onFromDateConfirm}
        onCancel={() => setShowFromDatePicker(false)}
        title="Select From Date"
      />
      <DatePicker
        modal
        open={showToDatePicker}
        date={tempToDate}
        mode="date"
        onConfirm={onToDateConfirm}
        onCancel={() => setShowToDatePicker(false)}
        title="Select To Date"
      />
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:              { flex: 1, backgroundColor: COLORS.gray50 },
  summaryContainer:       { flexDirection: 'row', flexWrap: 'wrap', padding: SPACING.md, gap: SPACING.sm },
  summaryCard:            { flex: 1, minWidth: '22%', backgroundColor: COLORS.white, borderRadius: BORDERS.radius.md, padding: SPACING.md, alignItems: 'center', ...SHADOWS.small },
  summaryCardPrimary:     { borderTopWidth: 3, borderTopColor: COLORS.primary },
  summaryCardTotal:       { backgroundColor: COLORS.primary },
  summaryIconRow:         { marginBottom: 6 },
  summaryLabel:           { ...FONTS.regular, fontSize: 11, color: COLORS.gray500, marginBottom: 4, textAlign: 'center' },
  summaryValue:           { ...FONTS.bold, fontSize: 15, color: COLORS.gray900 },
  filterSection:          { backgroundColor: COLORS.white, borderRadius: BORDERS.radius.lg, padding: SPACING.md, margin: SPACING.md, marginTop: 0, ...SHADOWS.medium },
  searchRow:              { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  searchInputContainer:   { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray200, borderRadius: BORDERS.radius.md, paddingHorizontal: SPACING.sm, backgroundColor: COLORS.gray50 },
  searchIcon:             { marginRight: 6 },
  searchInput:            { flex: 1, paddingVertical: SPACING.sm, ...FONTS.regular, fontSize: 14, color: COLORS.gray900 },
  searchClear:            { padding: 4 },
  filterToggle:           { padding: SPACING.sm, backgroundColor: COLORS.gray100, borderRadius: BORDERS.radius.md, position: 'relative' },
  filterToggleActive:     { backgroundColor: COLORS.primary },
  filterBadge:            { position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.error, borderRadius: 99, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText:        { color: COLORS.white, fontSize: 9, fontWeight: '700' },
  filtersGrid:            { gap: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  filterItem:             { gap: SPACING.xs },
  filterLabel:            { ...FONTS.medium, fontSize: 12, color: COLORS.gray600 },
  chip:                   { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: BORDERS.radius.full, marginRight: SPACING.sm, backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.gray200 },
  chipActive:             { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:               { ...FONTS.medium, fontSize: 12, color: COLORS.gray700 },
  chipTextActive:         { color: COLORS.white },
  dateRangeContainer:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dateButton:             { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray200, borderRadius: BORDERS.radius.md, padding: SPACING.sm, gap: 6, backgroundColor: COLORS.gray50 },
  dateButtonActive:       { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  dateText:               { ...FONTS.regular, fontSize: 13, color: COLORS.gray500 },
  dateTextActive:         { color: COLORS.primary, ...FONTS.medium },
  dateSeparator:          { ...FONTS.bold, color: COLORS.gray400, fontSize: 16 },
  actionButtons:          { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xs },
  applyButton:            { flex: 2, backgroundColor: COLORS.primary, borderRadius: BORDERS.radius.md, padding: SPACING.md, alignItems: 'center' },
  applyButtonText:        { ...FONTS.semibold, color: COLORS.white, fontSize: 14 },
  resetButton:            { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.gray100, borderRadius: BORDERS.radius.md, padding: SPACING.md, gap: 4 },
  resetButtonText:        { ...FONTS.medium, color: COLORS.gray700, fontSize: 13 },
  exportButtons:          { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  excelButton:            { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.success + '15', borderRadius: BORDERS.radius.md, paddingVertical: SPACING.sm, gap: 6, borderWidth: 1, borderColor: COLORS.success + '30' },
  excelButtonDisabled:    { opacity: 0.5 },
  excelButtonText:        { ...FONTS.semibold, color: COLORS.success, fontSize: 13 },
  printButton:            { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary + '10', borderRadius: BORDERS.radius.md, paddingVertical: SPACING.sm, gap: 6, borderWidth: 1, borderColor: COLORS.primary + '30' },
  printButtonDisabled:    { opacity: 0.5 },
  printButtonText:        { ...FONTS.semibold, color: COLORS.primary, fontSize: 13 },
  tabsScroll:             { marginHorizontal: SPACING.md, marginBottom: SPACING.sm },
  tabsContent:            { paddingVertical: 4 },
  tab:                    { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDERS.radius.md, marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.gray200, ...SHADOWS.small },
  activeTab:              { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabIcon:                { marginRight: 5 },
  tabText:                { ...FONTS.medium, fontSize: 12, color: COLORS.gray600 },
  activeTabText:          { color: COLORS.white },
  reportContainer:        { marginHorizontal: SPACING.md, marginBottom: SPACING.md, backgroundColor: COLORS.white, borderRadius: BORDERS.radius.lg, overflow: 'hidden', ...SHADOWS.small },
  tableContainer:         { overflow: 'hidden' },
  tableHeader:            { flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: SPACING.sm + 2, paddingHorizontal: 4 },
  tableHeaderCell:        { paddingHorizontal: 6, fontSize: 11, color: COLORS.white, fontWeight: '600' },
  tableRow:               { flexDirection: 'row', paddingVertical: SPACING.sm, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  rowEven:                { backgroundColor: COLORS.white },
  rowOdd:                 { backgroundColor: COLORS.gray50 },
  tableCell:              { paddingHorizontal: 6, fontSize: 11, color: COLORS.gray800 },
  boldCell:               { fontWeight: '700', color: COLORS.gray900 },
  grandTotalRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.primary + '10', borderTopWidth: 2, borderTopColor: COLORS.primary + '30' },
  grandTotalLabel:        { ...FONTS.bold, fontSize: 14, color: COLORS.gray800 },
  grandTotalValue:        { ...FONTS.bold, fontSize: 15, color: COLORS.primary },
  sectionCard:            { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  sectionHeader:          { flexDirection: 'row', alignItems: 'center', gap: 8, padding: SPACING.md, backgroundColor: COLORS.gray50, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  sectionTitle:           { ...FONTS.bold, fontSize: 13, color: COLORS.primary },
  statusChip:             { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: BORDERS.radius.sm, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  statusChipText:         { ...FONTS.medium, fontSize: 10 },
  emptyContainer:         { alignItems: 'center', paddingVertical: SPACING.xxl * 2, gap: SPACING.sm },
  emptyText:              { ...FONTS.semibold, fontSize: 15, color: COLORS.gray500 },
  emptySubText:           { ...FONTS.regular, fontSize: 13, color: COLORS.gray400 },
  loaderContainer:        { alignItems: 'center', paddingVertical: SPACING.xxl * 2, gap: SPACING.md },
  loaderText:             { ...FONTS.medium, color: COLORS.gray500 },
  footerLoader:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md, gap: SPACING.sm },
  footerLoaderText:       { ...FONTS.regular, fontSize: 12, color: COLORS.gray500 },
});