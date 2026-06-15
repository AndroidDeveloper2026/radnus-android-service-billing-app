// // src/screens/engineer/EngineerDashboardScreen.js
// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   RefreshControl,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   Modal,
//   ActivityIndicator,
//   FlatList,
//   Platform,
//   StatusBar,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useAuth } from '../../context/AuthContext';
// import { useToast } from 'react-native-toast-notifications';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {
//   Inbox,
//   Search,
//   Wrench,
//   CheckCircle,
//   Truck,
//   RotateCcw,
//   CheckSquare,
//   Clock,
//   Repeat,
//   Phone,
//   Smartphone,
//   AlertCircle,
//   Edit2,
//   MessageCircle,
//   Calendar,
//   Briefcase,
//   LogOut,
//   List,
//   Activity,
//   AlertTriangle,
//   Shuffle,
//   ChevronUp,
//   ChevronDown,
//   FileText,
//   User,
//   Plus,
//   Trash2,
//   RefreshCw,
//   Check,
// } from 'lucide-react-native';

// const API_BASE_URL = 'http://your-api-url.com';
// const MAX_JOBS = 5;

// const STATUS_STEPS = [
//   { key: 'Received', label: 'Received', color: '#ef4444', bg: '#fee2e2', icon: Inbox },
//   { key: 'Diagnosing', label: 'Diagnosing', color: '#ef4444', bg: '#fee2e2', icon: Search },
//   { key: 'Repairing', label: 'Repairing', color: '#ef4444', bg: '#fee2e2', icon: Wrench },
//   { key: 'Repaired', label: 'Repaired', color: '#ef4444', bg: '#fee2e2', icon: CheckCircle },
//   { key: 'Delivered NR/NA', label: 'Delivered NR/NA', color: '#ef4444', bg: '#fee2e2', icon: Truck },
//   { key: 'Return', label: 'Return', color: '#ef4444', bg: '#fee2e2', icon: RotateCcw },
//   { key: 'Delivered', label: 'Delivered', color: '#ef4444', bg: '#fee2e2', icon: CheckSquare },
// ];

// const getStaleDays = (job) => {
//   if (!job) return 0;
//   const dates = [new Date(job.createdAt)];
//   if (job.statusLogs?.length > 0) {
//     const last = job.statusLogs[job.statusLogs.length - 1];
//     if (last.timestamp) dates.push(new Date(last.timestamp));
//   }
//   if (job.repairSteps?.length > 0) {
//     job.repairSteps.forEach(s => { if (s.completedAt) dates.push(new Date(s.completedAt)); });
//   }
//   return Math.floor((Date.now() - new Date(Math.max(...dates)).getTime()) / (1000 * 60 * 60 * 24));
// };

// const StaleBadge = ({ days }) => {
//   if (days < 2) return null;
//   let style = {};
//   if (days >= 7) {
//     style = { bg: '#fecaca', color: '#991b1b', label: `${days}d stale` };
//   } else if (days >= 3) {
//     style = { bg: '#fed7aa', color: '#92400e', label: `${days}d stale` };
//   } else {
//     style = { bg: '#fee2e2', color: '#dc2626', label: `${days}d stale` };
//   }
//   return (
//     <View style={[styles.staleBadge, { backgroundColor: style.bg }]}>
//       <Clock size={10} color={style.color} />
//       <Text style={[styles.staleBadgeText, { color: style.color }]}>{style.label}</Text>
//     </View>
//   );
// };

// const StatusCard = ({ label, count, color, icon: Icon }) => (
//   <View style={[styles.statusCard, { borderTopColor: color }]}>
//     <Icon size={20} color={color} />
//     <Text style={styles.statusCardLabel}>{label}</Text>
//     <Text style={[styles.statusCardCount, { color }]}>{count}</Text>
//   </View>
// );

// const EngineerDashboardScreen = () => {
//   const { user, logout } = useAuth();
//   const toast = useToast();
//   const engineerName = user?.name || user?.username || '';

//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [updating, setUpdating] = useState(null);
//   const [search, setSearch] = useState('');
//   const [expandedJob, setExpandedJob] = useState(null);
  
//   const [newStepText, setNewStepText] = useState({});
//   const [newStepNote, setNewStepNote] = useState({});
//   const [stepLoading, setStepLoading] = useState(null);
  
//   const [transferJobId, setTransferJobId] = useState(null);
//   const [transferTo, setTransferTo] = useState('');
//   const [transferNote, setTransferNote] = useState('');
//   const [transferLoading, setTransferLoading] = useState(false);
//   const [engineerList, setEngineerList] = useState([]);
//   const [workloadMap, setWorkloadMap] = useState({});

//   const apiClient = axios.create({
//     baseURL: API_BASE_URL,
//     headers: { 'Content-Type': 'application/json' },
//   });

//   apiClient.interceptors.request.use(async (config) => {
//     const token = await AsyncStorage.getItem('@radnus_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   });

//   const fetchWorkload = useCallback(async () => {
//     try {
//       const res = await apiClient.get('/api/jobsheets/workload');
//       const map = {};
//       if (Array.isArray(res.data)) {
//         res.data.forEach(e => {
//           map[e.name] = e.activeJobs;
//         });
//       }
//       setWorkloadMap(map);
//     } catch (error) {
//       console.error('Workload fetch error:', error);
//     }
//   }, []);

//   const fetchJobs = useCallback(async () => {
//     if (!engineerName) return;
    
//     setLoading(true);
//     try {
//       const res = await apiClient.get('/api/jobsheets/filter', {
//         params: { engineer: engineerName }
//       });
//       const jobsData = Array.isArray(res.data) ? res.data : [];
//       setJobs(jobsData);
//     } catch (error) {
//       console.error('Error fetching jobs:', error);
//       toast.show('Failed to load jobs', { type: 'danger' });
//       setJobs([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [engineerName, toast]);

//   useEffect(() => {
//     if (engineerName) {
//       fetchJobs();
//       fetchWorkload();
//     }
//   }, [engineerName, fetchJobs, fetchWorkload]);

//   useEffect(() => {
//     const loadEngineers = async () => {
//       try {
//         const res = await apiClient.get('/api/engineers');
//         const engineersData = Array.isArray(res.data) ? res.data : [];
//         setEngineerList(engineersData);
//       } catch (error) {
//         console.error('Error fetching engineers:', error);
//         setEngineerList([]);
//       }
//     };
//     loadEngineers();
//   }, []);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await Promise.all([fetchJobs(), fetchWorkload()]);
//     setRefreshing(false);
//   };

//   const handleStatusUpdate = async (jobId, newStatus) => {
//     setUpdating(jobId);
//     try {
//       await apiClient.patch(`/api/jobsheets/${jobId}/status`, { 
//         status: newStatus, 
//         updatedBy: engineerName 
//       });
//       await fetchJobs();
//       toast.show(`Status updated to ${newStatus}`, { type: 'success' });
//     } catch (error) {
//       toast.show('Update failed', { type: 'danger' });
//     } finally {
//       setUpdating(null);
//     }
//   };

//   const handleAddStep = async (jobId) => {
//     const step = newStepText[jobId]?.trim();
//     if (!step) {
//       toast.show('Please enter step text', { type: 'danger' });
//       return;
//     }
//     setStepLoading(jobId);
//     try {
//       const res = await apiClient.post(`/api/jobsheets/${jobId}/steps`, { 
//         step, 
//         note: newStepNote[jobId] || '', 
//         completedBy: engineerName 
//       });
//       setJobs(prev => prev.map(j => j._id === jobId ? res.data : j));
//       setNewStepText(prev => ({ ...prev, [jobId]: '' }));
//       setNewStepNote(prev => ({ ...prev, [jobId]: '' }));
//       toast.show('Step added', { type: 'success' });
//     } catch (error) {
//       toast.show('Failed to add step', { type: 'danger' });
//     } finally {
//       setStepLoading(null);
//     }
//   };

//   const handleToggleStep = async (jobId, stepId, currentDone) => {
//     try {
//       const res = await apiClient.patch(`/api/jobsheets/${jobId}/steps/${stepId}`, { 
//         done: !currentDone, 
//         completedBy: engineerName 
//       });
//       setJobs(prev => prev.map(j => j._id === jobId ? res.data : j));
//     } catch (error) {
//       toast.show('Failed to update step', { type: 'danger' });
//     }
//   };

//   const handleDeleteStep = async (jobId, stepId) => {
//     Alert.alert('Delete Step', 'Are you sure you want to delete this step?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Delete',
//         style: 'destructive',
//         onPress: async () => {
//           try {
//             const res = await apiClient.delete(`/api/jobsheets/${jobId}/steps/${stepId}`);
//             setJobs(prev => prev.map(j => j._id === jobId ? res.data : j));
//             toast.show('Step deleted', { type: 'success' });
//           } catch (error) {
//             toast.show('Failed to delete step', { type: 'danger' });
//           }
//         },
//       },
//     ]);
//   };

//   const handleTransfer = async () => {
//     if (!transferTo) {
//       toast.show('Please select an engineer', { type: 'danger' });
//       return;
//     }
//     if (transferTo === engineerName) {
//       toast.show("You can't transfer to yourself", { type: 'danger' });
//       return;
//     }

//     if (transferTo !== 'Reception') {
//       const targetLoad = workloadMap[transferTo] || 0;
//       if (targetLoad >= MAX_JOBS) {
//         toast.show(`${transferTo} is at full capacity`, { type: 'danger' });
//         return;
//       }
//     }

//     setTransferLoading(true);
//     try {
//       await apiClient.patch(`/api/jobsheets/${transferJobId}/transfer`, {
//         from: engineerName,
//         to: transferTo,
//         note: transferNote,
//       });
//       await Promise.all([fetchJobs(), fetchWorkload()]);
//       setTransferJobId(null);
//       setTransferTo('');
//       setTransferNote('');
//       toast.show(transferTo === 'Reception' 
//         ? 'Job returned to Reception' 
//         : `Job transferred to ${transferTo}`, 
//         { type: 'success' }
//       );
//     } catch (error) {
//       toast.show(error.response?.data?.message || 'Transfer failed', { type: 'danger' });
//     } finally {
//       setTransferLoading(false);
//     }
//   };

//   const getTransferBadge = (name) => {
//     const count = workloadMap[name] || 0;
//     const free = MAX_JOBS - count;
//     if (count >= MAX_JOBS) return { label: `${name} — FULL`, disabled: true };
//     if (count >= 4) return { label: `${name} — ${free} slot left`, disabled: false };
//     return { label: `${name} — ${free} free`, disabled: false };
//   };

//   const filteredJobs = Array.isArray(jobs) ? jobs.filter(job => {
//     if (!job) return false;
//     const query = search.toLowerCase();
//     return (
//       (job.jobSheetNo && job.jobSheetNo.toLowerCase().includes(query)) ||
//       (job.customer?.name && job.customer.name.toLowerCase().includes(query)) ||
//       (job.customer?.contact && job.customer.contact.includes(query)) ||
//       (job.device?.model && job.device.model.toLowerCase().includes(query))
//     );
//   }) : [];

//   const counts = STATUS_STEPS.reduce((acc, s) => {
//     acc[s.key] = Array.isArray(jobs) ? jobs.filter(job => job?.device?.mobileStatus === s.key).length : 0;
//     return acc;
//   }, {});

//   const myLoad = Array.isArray(jobs) ? jobs.filter(job =>
//     job && !['Delivered', 'Delivered NR/NA', 'Repaired', 'Ready'].includes(job.device?.mobileStatus) && !job.isInvoiced
//   ).length : 0;

//   const otherEngineers = Array.isArray(engineerList) 
//     ? engineerList.map(e => e.name || e).filter(n => n && n.toLowerCase() !== engineerName.toLowerCase())
//     : [];

//   const renderJobCard = ({ item: job }) => {
//     if (!job) return null;
    
//     const currentStatus = job.device?.mobileStatus || 'Received';
//     const currentStep = STATUS_STEPS.find(s => s.key === currentStatus) || STATUS_STEPS[0];
//     const CurrentStepIcon = currentStep.icon;
//     const isUpdating = updating === job._id;
//     const isExpanded = expandedJob === job._id;
//     const steps = job.repairSteps || [];
//     const doneCount = steps.filter(s => s.done).length;
//     const lastTransfer = job.transferLog?.slice(-1)[0];
//     const staleDays = getStaleDays(job);

//     return (
//       <View style={[styles.jobCard, staleDays >= 7 && styles.staleCardHigh, staleDays >= 3 && staleDays < 7 && styles.staleCardMedium]}>
//         <View style={styles.cardHeader}>
//           <View style={styles.cardHeaderLeft}>
//             <Text style={styles.jobSheetNo}>{job.jobSheetNo || 'N/A'}</Text>
//             {lastTransfer && lastTransfer.to?.toLowerCase() === engineerName.toLowerCase() && (
//               <View style={styles.transferBadge}>
//                 <Repeat size={10} color="#92400e" />
//                 <Text style={styles.transferBadgeText}>from {lastTransfer.from}</Text>
//               </View>
//             )}
//             <StaleBadge days={staleDays} />
//           </View>
//           <View style={[styles.statusBadge, { backgroundColor: currentStep.bg }]}>
//             <CurrentStepIcon size={12} color={currentStep.color} />
//             <Text style={[styles.statusBadgeText, { color: currentStep.color }]}>
//               {currentStep.label}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.cardBody}>
//           <Text style={styles.customerName}>{job.customer?.name || '-'}</Text>
//           <View style={styles.infoRow}>
//             <Phone size={12} color="#64748b" />
//             <Text style={styles.contactText}>{job.customer?.contact || '-'}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Smartphone size={12} color="#475569" />
//             <Text style={styles.deviceText}>{job.device?.make || '-'} {job.device?.model || '-'}</Text>
//           </View>
//           {job.visualIssues?.length > 0 && (
//             <View style={styles.infoRow}>
//               <AlertCircle size={11} color="#dc2626" />
//               <Text style={styles.visualIssuesText}>{job.visualIssues.filter(Boolean).join(', ')}</Text>
//             </View>
//           )}
//           {job.service?.remarks && (
//             <View style={styles.infoRow}>
//               <Edit2 size={11} color="#059669" />
//               <Text style={styles.remarksText}>{job.service.remarks}</Text>
//             </View>
//           )}
//           {lastTransfer?.note && lastTransfer.to?.toLowerCase() === engineerName.toLowerCase() && (
//             <View style={styles.transferNoteBox}>
//               <MessageCircle size={11} color="#f59e0b" />
//               <Text style={styles.transferNoteText}> {lastTransfer.note}</Text>
//             </View>
//           )}
//           <View style={styles.infoRow}>
//             <Calendar size={11} color="#94a3b8" />
//             <Text style={styles.dateText}>{job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-IN') : 'N/A'}</Text>
//           </View>

//           <View style={styles.statusButtonsContainer}>
//             <Text style={styles.sectionLabel}>UPDATE STATUS:</Text>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusScroll}>
//               <View style={styles.statusButtonsRow}>
//                 {STATUS_STEPS.filter(s => s.key !== 'Delivered').map(s => {
//                   const isActive = currentStatus === s.key;
//                   const StepIcon = s.icon;
//                   return (
//                     <TouchableOpacity
//                       key={s.key}
//                       style={[
//                         styles.statusButton,
//                         isActive && styles.statusButtonActive,
//                         { borderColor: s.color, backgroundColor: isActive ? s.bg : '#fff' }
//                       ]}
//                       onPress={() => !isActive && !isUpdating && handleStatusUpdate(job._id, s.key)}
//                       disabled={isActive || isUpdating}
//                     >
//                       <StepIcon size={12} color={isActive ? s.color : '#64748b'} />
//                       <Text style={[styles.statusButtonText, { color: isActive ? s.color : '#64748b' }]}>
//                         {s.label}
//                       </Text>
//                     </TouchableOpacity>
//                   );
//                 })}
//                 <TouchableOpacity
//                   style={[styles.statusButton, styles.transferButton]}
//                   onPress={() => setTransferJobId(job._id)}
//                 >
//                   <Shuffle size={12} color="#92400e" />
//                   <Text style={styles.transferButtonText}>Transfer</Text>
//                 </TouchableOpacity>
//               </View>
//             </ScrollView>
//           </View>

//           <View style={styles.repairStepsContainer}>
//             <TouchableOpacity 
//               style={styles.repairStepsHeader}
//               onPress={() => setExpandedJob(isExpanded ? null : job._id)}
//             >
//               <Text style={styles.sectionLabel}>
//                 REPAIR STEPS
//                 {steps.length > 0 && (
//                   <Text style={styles.stepCount}>
//                     {doneCount}/{steps.length}
//                   </Text>
//                 )}
//               </Text>
//               {isExpanded ? (
//                 <ChevronUp size={16} color="#94a3b8" />
//               ) : (
//                 <ChevronDown size={16} color="#94a3b8" />
//               )}
//             </TouchableOpacity>

//             {steps.length > 0 && (
//               <View style={styles.progressBar}>
//                 <View style={[styles.progressFill, { width: `${(doneCount / steps.length) * 100}%` }]} />
//               </View>
//             )}

//             {isExpanded && (
//               <View>
//                 {steps.length === 0 ? (
//                   <Text style={styles.noStepsText}>No steps yet</Text>
//                 ) : (
//                   <View style={styles.stepsList}>
//                     {steps.map((step, idx) => (
//                       <View key={step._id} style={[styles.stepItem, step.done && styles.stepItemDone]}>
//                         <TouchableOpacity onPress={() => handleToggleStep(job._id, step._id, step.done)}>
//                           <View style={styles.checkbox}>
//                             {step.done && <Check size={12} color="#10b981" />}
//                           </View>
//                         </TouchableOpacity>
//                         <View style={styles.stepContent}>
//                           <Text style={[styles.stepText, step.done && styles.stepTextDone]}>
//                             {idx + 1}. {step.step}
//                           </Text>
//                           {step.note && (
//                             <View style={styles.stepNoteRow}>
//                               <FileText size={10} color="#64748b" />
//                               <Text style={styles.stepNote}>{step.note}</Text>
//                             </View>
//                           )}
//                           {step.completedBy && (
//                             <View style={styles.stepCompletedByRow}>
//                               <User size={10} color="#7c3aed" />
//                               <Text style={styles.stepCompletedBy}>{step.completedBy}</Text>
//                             </View>
//                           )}
//                           {step.done && step.completedAt && (
//                             <View style={styles.stepCompletedAtRow}>
//                               <Clock size={10} color="#86efac" />
//                               <Text style={styles.stepCompletedAt}>{new Date(step.completedAt).toLocaleString()}</Text>
//                             </View>
//                           )}
//                         </View>
//                         <TouchableOpacity onPress={() => handleDeleteStep(job._id, step._id)}>
//                           <Trash2 size={16} color="#ef4444" />
//                         </TouchableOpacity>
//                       </View>
//                     ))}
//                   </View>
//                 )}

//                 <View style={styles.addStepForm}>
//                   <Text style={styles.sectionLabel}>Add New Step</Text>
//                   <TextInput
//                     style={styles.stepInput}
//                     placeholder="Step description"
//                     placeholderTextColor="#94a3b8"
//                     value={newStepText[job._id] || ''}
//                     onChangeText={(text) => setNewStepText(prev => ({ ...prev, [job._id]: text }))}
//                   />
//                   <TextInput
//                     style={styles.stepInput}
//                     placeholder="Note (optional)"
//                     placeholderTextColor="#94a3b8"
//                     value={newStepNote[job._id] || ''}
//                     onChangeText={(text) => setNewStepNote(prev => ({ ...prev, [job._id]: text }))}
//                   />
//                   <TouchableOpacity
//                     style={styles.addStepButton}
//                     onPress={() => handleAddStep(job._id)}
//                     disabled={stepLoading === job._id}
//                   >
//                     <Plus size={14} color="#fff" />
//                     <Text style={styles.addStepButtonText}>
//                       {stepLoading === job._id ? 'Adding...' : 'Add Step'}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             )}
//           </View>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor="#dc2626" barStyle="light-content" />
      
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.headerLeft}>
//           <Text style={styles.headerTitle}>Engineer Dashboard</Text>
//           <View style={styles.engineerNameContainer}>
//             <Text style={styles.headerSubtitle}>/</Text>
//             <Text style={styles.engineerName}>{engineerName}</Text>
//           </View>
//         </View>
//         <View style={styles.headerRight}>
//           <View style={[styles.workloadPill, 
//             myLoad >= MAX_JOBS ? styles.workloadFull : myLoad >= 4 ? styles.workloadWarning : styles.workloadOk]}>
//             <Briefcase size={12} color={myLoad >= MAX_JOBS ? '#991b1b' : myLoad >= 4 ? '#92400e' : '#166534'} />
//             <Text style={[styles.workloadPillText,
//               myLoad >= MAX_JOBS ? { color: '#991b1b' } : myLoad >= 4 ? { color: '#92400e' } : { color: '#166534' }]}>
//               {myLoad}/{MAX_JOBS} active jobs
//             </Text>
//           </View>
//           <TouchableOpacity onPress={logout} style={styles.logoutButton}>
//             <LogOut size={16} color="#dc2626" />
//             <Text style={styles.logoutButtonText}>Logout</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       <ScrollView
//         style={styles.content}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#dc2626']} tintColor="#dc2626" />
//         }
//       >
//         {/* Status Cards */}
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusCardsScroll}>
//           <View style={styles.statusCardsRow}>
//             {STATUS_STEPS.map(s => (
//               <StatusCard key={s.key} label={s.label} count={counts[s.key] || 0} color={s.color} icon={s.icon} />
//             ))}
//             <View style={[styles.statusCard, { borderTopColor: '#dc2626' }]}>
//               <List size={20} color="#dc2626" />
//               <Text style={styles.statusCardLabel}>Total</Text>
//               <Text style={[styles.statusCardCount, { color: '#dc2626' }]}>{Array.isArray(jobs) ? jobs.length : 0}</Text>
//             </View>
//             <View style={[styles.statusCard, { 
//               borderTopColor: myLoad >= MAX_JOBS ? '#dc2626' : myLoad >= 4 ? '#f59e0b' : '#10b981' 
//             }]}>
//               <Activity size={20} color={myLoad >= MAX_JOBS ? '#dc2626' : myLoad >= 4 ? '#f59e0b' : '#10b981'} />
//               <Text style={styles.statusCardLabel}>Capacity</Text>
//               <View style={styles.capacityBar}>
//                 <View style={[styles.capacityFill, { 
//                   width: `${Math.min((myLoad / MAX_JOBS) * 100, 100)}%`,
//                   backgroundColor: myLoad >= MAX_JOBS ? '#dc2626' : myLoad >= 4 ? '#f59e0b' : '#10b981'
//                 }]} />
//               </View>
//               <Text style={[styles.statusCardCount, { fontSize: 12, marginTop: 4, color: '#64748b' }]}>
//                 {myLoad}/{MAX_JOBS} {myLoad >= MAX_JOBS ? 'FULL' : `${MAX_JOBS - myLoad} free`}
//               </Text>
//             </View>
//           </View>
//         </ScrollView>

//         {/* Search Bar */}
//         <View style={styles.searchSection}>
//           <View style={styles.searchBar}>
//             <Search size={18} color="#94a3b8" />
//             <TextInput
//               style={styles.searchInput}
//               placeholder="Search job no / name / contact / model"
//               placeholderTextColor="#94a3b8"
//               value={search}
//               onChangeText={setSearch}
//             />
//           </View>
//           <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} disabled={loading}>
//             <RefreshCw size={16} color="#fff" />
//             <Text style={styles.refreshButtonText}>Refresh</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Job Cards List */}
//         {loading ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#dc2626" />
//           </View>
//         ) : filteredJobs.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <Inbox size={48} color="#94a3b8" />
//             <Text style={styles.emptyText}>No jobs found</Text>
//           </View>
//         ) : (
//           <FlatList
//             data={filteredJobs}
//             keyExtractor={(item) => item._id || Math.random().toString()}
//             renderItem={renderJobCard}
//             scrollEnabled={false}
//           />
//         )}
        
//         <View style={styles.bottomPadding} />
//       </ScrollView>

//       {/* Transfer Modal */}
//       {transferJobId && (
//         <Modal visible={!!transferJobId} transparent animationType="fade">
//           <View style={styles.modalOverlay}>
//             <View style={styles.transferModalContent}>
//               <Text style={styles.modalTitle}>Transfer Job</Text>
//               <Text style={styles.transferJobInfo}>
//                 Job: <Text style={styles.transferJobInfoBold}>
//                   {Array.isArray(jobs) && jobs.find(j => j._id === transferJobId)?.jobSheetNo}
//                 </Text> — {Array.isArray(jobs) && jobs.find(j => j._id === transferJobId)?.customer?.name}
//               </Text>

//               <Text style={styles.transferLabel}>Transfer to:</Text>
//               <ScrollView style={styles.transferSelect}>
//                 <TouchableOpacity
//                   style={styles.transferOption}
//                   onPress={() => setTransferTo('Reception')}
//                 >
//                   <Text style={[styles.transferOptionText, transferTo === 'Reception' && styles.transferOptionSelected]}>
//                     Reception (Free up capacity)
//                   </Text>
//                 </TouchableOpacity>
//                 <Text style={styles.transferSectionHeader}>Engineers</Text>
//                 {otherEngineers.map((eng, idx) => {
//                   const badge = getTransferBadge(eng);
//                   return (
//                     <TouchableOpacity
//                       key={idx}
//                       style={[styles.transferOption, badge.disabled && styles.transferOptionDisabled]}
//                       onPress={() => !badge.disabled && setTransferTo(eng)}
//                       disabled={badge.disabled}
//                     >
//                       <Text style={[styles.transferOptionText, transferTo === eng && styles.transferOptionSelected]}>
//                         {badge.label}
//                       </Text>
//                     </TouchableOpacity>
//                   );
//                 })}
//               </ScrollView>

//               {transferTo && (
//                 <View style={styles.workloadHint}>
//                   {(() => {
//                     const count = workloadMap[transferTo] || 0;
//                     const free = MAX_JOBS - count;
//                     if (count >= MAX_JOBS) return (
//                       <Text style={[styles.workloadHintText, styles.workloadHintFull]}>
//                         {transferTo} is full — cannot transfer
//                       </Text>
//                     );
//                     if (count >= 4) return (
//                       <Text style={[styles.workloadHintText, styles.workloadHintWarning]}>
//                         {transferTo} has {count}/{MAX_JOBS} jobs — {free} slot left
//                       </Text>
//                     );
//                     return (
//                       <Text style={[styles.workloadHintText, styles.workloadHintOk]}>
//                         {transferTo} has {count}/{MAX_JOBS} jobs — {free} slots free
//                       </Text>
//                     );
//                   })()}
//                 </View>
//               )}

//               <Text style={styles.transferLabel}>Note (optional):</Text>
//               <TextInput
//                 style={styles.transferNoteInput}
//                 placeholder="e.g. Step 2 done, IC check needed"
//                 placeholderTextColor="#94a3b8"
//                 multiline
//                 numberOfLines={3}
//                 value={transferNote}
//                 onChangeText={setTransferNote}
//               />

//               <View style={styles.modalButtons}>
//                 <TouchableOpacity 
//                   style={[styles.modalButton, styles.modalButtonCancel]}
//                   onPress={() => {
//                     setTransferJobId(null);
//                     setTransferTo('');
//                     setTransferNote('');
//                   }}
//                 >
//                   <Text style={styles.modalButtonCancelText}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity 
//                   style={[styles.modalButton, styles.modalButtonTransfer]}
//                   onPress={handleTransfer}
//                   disabled={transferLoading || (transferTo && workloadMap[transferTo] >= MAX_JOBS && transferTo !== 'Reception')}
//                 >
//                   <Text style={styles.modalButtonConfirmText}>
//                     {transferLoading ? 'Transferring...' : 'Transfer'}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>
//       )}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8fafc',
//   },
//   header: {
//     backgroundColor: '#dc2626',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//       },
//       android: {
//         elevation: 4,
//       },
//     }),
//   },
//   headerLeft: {
//     flex: 1,
//   },
//   headerTitle: {
//     color: '#ffffff',
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 4,
//   },
//   engineerNameContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerSubtitle: {
//     color: '#fecaca',
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   engineerName: {
//     color: '#ffffff',
//     fontSize: 13,
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   headerRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   workloadPill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     backgroundColor: '#ffffff',
//   },
//   workloadFull: {
//     backgroundColor: '#fee2e2',
//   },
//   workloadWarning: {
//     backgroundColor: '#fed7aa',
//   },
//   workloadOk: {
//     backgroundColor: '#dcfce7',
//   },
//   workloadPillText: {
//     fontSize: 12,
//     fontWeight: '700',
//   },
//   logoutButton: {
//     backgroundColor: '#ffffff',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 8,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   logoutButtonText: {
//     color: '#dc2626',
//     fontWeight: '600',
//     fontSize: 13,
//   },
//   content: {
//     flex: 1,
//     padding: 16,
//   },
//   statusCardsScroll: {
//     marginBottom: 20,
//   },
//   statusCardsRow: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   statusCard: {
//     backgroundColor: '#ffffff',
//     borderRadius: 12,
//     padding: 12,
//     minWidth: 100,
//     borderTopWidth: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//     alignItems: 'center',
//     gap: 6,
//   },
//   statusCardLabel: {
//     fontSize: 11,
//     color: '#64748b',
//     fontWeight: '600',
//   },
//   statusCardCount: {
//     fontSize: 24,
//     fontWeight: '700',
//   },
//   capacityBar: {
//     backgroundColor: '#f1f5f9',
//     borderRadius: 99,
//     height: 8,
//     overflow: 'hidden',
//     width: '100%',
//     marginTop: 4,
//   },
//   capacityFill: {
//     height: '100%',
//     borderRadius: 99,
//   },
//   searchSection: {
//     flexDirection: 'row',
//     gap: 10,
//     marginBottom: 16,
//   },
//   searchBar: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#ffffff',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//   },
//   searchInput: {
//     flex: 1,
//     paddingVertical: 10,
//     paddingHorizontal: 8,
//     fontSize: 14,
//     color: '#1e293b',
//   },
//   refreshButton: {
//     backgroundColor: '#dc2626',
//     paddingHorizontal: 18,
//     paddingVertical: 10,
//     borderRadius: 8,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   refreshButtonText: {
//     color: '#ffffff',
//     fontWeight: '600',
//     fontSize: 13,
//   },
//   jobCard: {
//     backgroundColor: '#ffffff',
//     borderRadius: 12,
//     marginBottom: 16,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   staleCardHigh: {
//     borderColor: '#fca5a5',
//     borderWidth: 2,
//   },
//   staleCardMedium: {
//     borderColor: '#fcd34d',
//     borderWidth: 2,
//   },
//   cardHeader: {
//     backgroundColor: '#f8fafc',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e2e8f0',
//   },
//   cardHeaderLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     flexWrap: 'wrap',
//   },
//   jobSheetNo: {
//     color: '#dc2626',
//     fontWeight: '700',
//     fontSize: 14,
//   },
//   transferBadge: {
//     backgroundColor: '#fef3c7',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 8,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   transferBadgeText: {
//     color: '#92400e',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   staleBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     paddingHorizontal: 7,
//     paddingVertical: 2,
//     borderRadius: 8,
//   },
//   staleBadgeText: {
//     fontSize: 10,
//     fontWeight: '700',
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 20,
//   },
//   statusBadgeText: {
//     fontSize: 11,
//     fontWeight: '700',
//   },
//   cardBody: {
//     padding: 16,
//   },
//   customerName: {
//     fontWeight: '700',
//     fontSize: 15,
//     color: '#1e293b',
//     marginBottom: 8,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     marginTop: 4,
//   },
//   contactText: {
//     fontSize: 13,
//     color: '#64748b',
//   },
//   deviceText: {
//     fontSize: 13,
//     color: '#475569',
//   },
//   visualIssuesText: {
//     fontSize: 12,
//     color: '#dc2626',
//   },
//   remarksText: {
//     fontSize: 12,
//     color: '#059669',
//   },
//   transferNoteBox: {
//     backgroundColor: '#fef3c7',
//     padding: 8,
//     borderRadius: 6,
//     marginTop: 4,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   transferNoteText: {
//     fontSize: 12,
//     color: '#f59e0b',
//   },
//   dateText: {
//     fontSize: 12,
//     color: '#94a3b8',
//   },
//   statusButtonsContainer: {
//     borderTopWidth: 1,
//     borderTopColor: '#f1f5f9',
//     paddingTop: 12,
//     marginTop: 8,
//   },
//   sectionLabel: {
//     fontSize: 11,
//     color: '#64748b',
//     fontWeight: '600',
//     marginBottom: 8,
//     letterSpacing: 0.5,
//   },
//   statusScroll: {
//     flexGrow: 0,
//   },
//   statusButtonsRow: {
//     flexDirection: 'row',
//     gap: 8,
//     paddingVertical: 4,
//   },
//   statusButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//   },
//   statusButtonActive: {
//     opacity: 0.7,
//   },
//   statusButtonText: {
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   transferButton: {
//     borderColor: '#f59e0b',
//     backgroundColor: '#fffbeb',
//   },
//   transferButtonText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#92400e',
//   },
//   repairStepsContainer: {
//     borderTopWidth: 1,
//     borderTopColor: '#f1f5f9',
//     paddingTop: 12,
//     marginTop: 8,
//   },
//   repairStepsHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   stepCount: {
//     marginLeft: 6,
//     backgroundColor: '#f1f5f9',
//     paddingHorizontal: 7,
//     paddingVertical: 1,
//     borderRadius: 10,
//     color: '#475569',
//     fontSize: 10,
//   },
//   progressBar: {
//     backgroundColor: '#f1f5f9',
//     borderRadius: 4,
//     height: 4,
//     marginBottom: 12,
//   },
//   progressFill: {
//     backgroundColor: '#10b981',
//     borderRadius: 4,
//     height: 4,
//   },
//   stepsList: {
//     gap: 8,
//     marginBottom: 12,
//   },
//   stepItem: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     gap: 10,
//     backgroundColor: '#fafafa',
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     borderRadius: 8,
//     padding: 12,
//   },
//   stepItemDone: {
//     backgroundColor: '#f0fdf4',
//     borderColor: '#86efac',
//   },
//   checkbox: {
//     width: 20,
//     height: 20,
//     borderRadius: 4,
//     borderWidth: 2,
//     borderColor: '#cbd5e1',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 2,
//   },
//   stepContent: {
//     flex: 1,
//   },
//   stepText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#1e293b',
//   },
//   stepTextDone: {
//     color: '#15803d',
//     textDecorationLine: 'line-through',
//   },
//   stepNoteRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     marginTop: 4,
//   },
//   stepNote: {
//     fontSize: 11,
//     color: '#64748b',
//   },
//   stepCompletedByRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     marginTop: 4,
//   },
//   stepCompletedBy: {
//     fontSize: 10,
//     color: '#7c3aed',
//   },
//   stepCompletedAtRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     marginTop: 4,
//   },
//   stepCompletedAt: {
//     fontSize: 10,
//     color: '#86efac',
//   },
//   noStepsText: {
//     fontSize: 13,
//     color: '#94a3b8',
//     textAlign: 'center',
//     padding: 16,
//   },
//   addStepForm: {
//     backgroundColor: '#f8fafc',
//     borderRadius: 8,
//     padding: 12,
//     borderWidth: 1,
//     borderColor: '#cbd5e1',
//     borderStyle: 'dashed',
//   },
//   stepInput: {
//     borderWidth: 1,
//     borderColor: '#cbd5e1',
//     borderRadius: 6,
//     padding: 10,
//     fontSize: 13,
//     marginBottom: 8,
//     color: '#1e293b',
//     backgroundColor: '#ffffff',
//   },
//   addStepButton: {
//     backgroundColor: '#dc2626',
//     borderRadius: 6,
//     padding: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//   },
//   addStepButtonText: {
//     color: '#ffffff',
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   loadingContainer: {
//     padding: 60,
//     alignItems: 'center',
//   },
//   emptyContainer: {
//     padding: 60,
//     alignItems: 'center',
//   },
//   emptyText: {
//     marginTop: 12,
//     color: '#94a3b8',
//     fontSize: 14,
//   },
//   bottomPadding: {
//     height: 80,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   transferModalContent: {
//     backgroundColor: '#ffffff',
//     borderRadius: 16,
//     padding: 20,
//     width: '90%',
//     maxHeight: '80%',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1e293b',
//     marginBottom: 12,
//   },
//   transferJobInfo: {
//     fontSize: 13,
//     color: '#64748b',
//     marginBottom: 16,
//   },
//   transferJobInfoBold: {
//     fontWeight: '700',
//     color: '#dc2626',
//   },
//   transferLabel: {
//     fontSize: 12,
//     color: '#64748b',
//     fontWeight: '600',
//     marginBottom: 6,
//   },
//   transferSelect: {
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     borderRadius: 8,
//     marginBottom: 12,
//     maxHeight: 200,
//     backgroundColor: '#ffffff',
//   },
//   transferOption: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e2e8f0',
//   },
//   transferOptionDisabled: {
//     opacity: 0.5,
//   },
//   transferOptionText: {
//     fontSize: 13,
//     color: '#1e293b',
//   },
//   transferOptionSelected: {
//     color: '#dc2626',
//     fontWeight: '600',
//   },
//   transferSectionHeader: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: '#64748b',
//     padding: 10,
//     backgroundColor: '#f8fafc',
//   },
//   workloadHint: {
//     marginBottom: 12,
//   },
//   workloadHintText: {
//     fontSize: 12,
//     fontWeight: '600',
//     padding: 8,
//     borderRadius: 6,
//   },
//   workloadHintFull: {
//     color: '#991b1b',
//     backgroundColor: '#fee2e2',
//   },
//   workloadHintWarning: {
//     color: '#92400e',
//     backgroundColor: '#fed7aa',
//   },
//   workloadHintOk: {
//     color: '#166534',
//     backgroundColor: '#dcfce7',
//   },
//   transferNoteInput: {
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     borderRadius: 8,
//     padding: 10,
//     fontSize: 13,
//     marginBottom: 16,
//     textAlignVertical: 'top',
//     backgroundColor: '#f8fafc',
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   modalButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   modalButtonCancel: {
//     backgroundColor: '#f1f5f9',
//   },
//   modalButtonCancelText: {
//     color: '#475569',
//     fontWeight: '600',
//   },
//   modalButtonTransfer: {
//     backgroundColor: '#dc2626',
//   },
//   modalButtonConfirmText: {
//     color: '#ffffff',
//     fontWeight: '700',
//   },
// });

// export default EngineerDashboardScreen;

//-----------------------------------------

// src/screens/engineer/EngineerDashboardScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from 'react-native-toast-notifications';
import { useAuth } from '../../context/AuthContext';
import {
  Inbox,
  Search,
  Wrench,
  CheckCircle,
  Truck,
  RotateCcw,
  CheckSquare,
  Clock,
  Repeat,
  Phone,
  Smartphone,
  AlertCircle,
  Edit2,
  MessageCircle,
  Calendar,
  Briefcase,
  LogOut,
  List,
  Activity,
  Shuffle,
  ChevronUp,
  ChevronDown,
  FileText,
  User,
  Plus,
  Trash2,
  RefreshCw,
  Check,
  X,
  Microscope,
  Hammer,
  PackageCheck,
} from 'lucide-react-native';
import api from '../../utils/api';

const MAX_JOBS = 5;

const STATUS_STEPS = [
  { key: 'Received', label: 'Received', color: '#dc2626', bg: '#fef2f2', icon: Inbox },
  { key: 'Diagnosing', label: 'Diagnosing', color: '#ea580c', bg: '#fff7ed', icon: Microscope },
  { key: 'Repairing', label: 'Repairing', color: '#dc2626', bg: '#fef2f2', icon: Hammer },
  { key: 'Repaired', label: 'Repaired', color: '#16a34a', bg: '#f0fdf4', icon: PackageCheck },
  { key: 'Delivered NR/NA', label: 'Delivered NR/NA', color: '#16a34a', bg: '#f0fdf4', icon: Truck },
  { key: 'Return', label: 'Return', color: '#dc2626', bg: '#fef2f2', icon: RotateCcw },
  { key: 'Delivered', label: 'Delivered', color: '#16a34a', bg: '#f0fdf4', icon: CheckSquare },
];

const getStaleDays = (job) => {
  if (!job) return 0;
  const dates = [new Date(job.createdAt)];
  if (job.statusLogs?.length > 0) {
    const last = job.statusLogs[job.statusLogs.length - 1];
    if (last.timestamp) dates.push(new Date(last.timestamp));
  }
  if (job.repairSteps?.length > 0) {
    job.repairSteps.forEach(s => { if (s.completedAt) dates.push(new Date(s.completedAt)); });
  }
  return Math.floor((Date.now() - new Date(Math.max(...dates)).getTime()) / (1000 * 60 * 60 * 24));
};

const StaleBadge = ({ days }) => {
  if (days < 2) return null;
  let style = {};
  if (days >= 7) {
    style = { bg: '#fef2f2', color: '#dc2626', label: `${days}d stale` };
  } else if (days >= 3) {
    style = { bg: '#fffbeb', color: '#d97706', label: `${days}d stale` };
  } else {
    style = { bg: '#eff6ff', color: '#2563eb', label: `${days}d stale` };
  }
  return (
    <View style={[styles.staleBadge, { backgroundColor: style.bg }]}>
      <Clock size={10} color={style.color} />
      <Text style={[styles.staleBadgeText, { color: style.color }]}>{style.label}</Text>
    </View>
  );
};

const StatusCard = ({ label, count, color, icon: Icon }) => (
  <View style={[styles.statusCard, { borderTopColor: color }]}>
    <Icon size={20} color={color} strokeWidth={1.5} />
    <Text style={styles.statusCardLabel}>{label}</Text>
    <Text style={[styles.statusCardCount, { color }]}>{count}</Text>
  </View>
);

const EngineerDashboardScreen = () => {
  const toast = useToast();
  const { logout } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [stepLoading, setStepLoading] = useState(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [newStepText, setNewStepText] = useState({});
  const [newStepNote, setNewStepNote] = useState({});
  const [transferJobId, setTransferJobId] = useState(null);
  const [transferTo, setTransferTo] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [engineerList, setEngineerList] = useState([]);
  const [engineerName, setEngineerName] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      const name = currentUser?.name || currentUser?.username || '';
      setEngineerName(name);
      if (name) {
        fetchJobs(name);
        fetchWorkload();
      }
      loadEngineers();
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadEngineers = async () => {
    try {
      const engineers = await api.getEngineers();
      setEngineerList(engineers);
    } catch (error) {
      console.error('Error loading engineers:', error);
    }
  };

  const fetchJobs = async (engineer) => {
    setLoading(true);
    try {
      const jobsData = await api.getJobs({ engineer: engineer });
      setJobs(jobsData);
    } catch (error) {
      toast.show('Failed to load jobs', { type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkload = async () => {
    try {
      const workloadData = await api.getWorkload();
      setWorkload(workloadData);
    } catch (error) {
      console.error('Error fetching workload:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (engineerName) {
      await Promise.all([
        fetchJobs(engineerName),
        fetchWorkload(),
      ]);
    }
    setRefreshing(false);
  }, [engineerName]);

  const handleStatusUpdate = async (jobId, newStatus) => {
    setUpdating(jobId);
    try {
      const updatedJob = await api.updateJobStatus(jobId, newStatus, engineerName);
      setJobs(prev => prev.map(job => 
        (job.id === jobId || job._id === jobId) ? updatedJob : job
      ));
      toast.show(`Status updated to ${newStatus}`, { type: 'success' });
    } catch (error) {
      toast.show(error?.message || 'Update failed', { type: 'danger' });
    } finally {
      setUpdating(null);
    }
  };

  const handleAddStep = async (jobId) => {
    const step = newStepText[jobId]?.trim();
    if (!step) {
      toast.show('Please enter step description', { type: 'danger' });
      return;
    }
    setStepLoading(jobId);
    try {
      const updatedJob = await api.addRepairStep(jobId, step, newStepNote[jobId] || '', engineerName);
      setJobs(prev => prev.map(job => 
        (job.id === jobId || job._id === jobId) ? updatedJob : job
      ));
      setNewStepText(prev => ({ ...prev, [jobId]: '' }));
      setNewStepNote(prev => ({ ...prev, [jobId]: '' }));
      toast.show('Step added', { type: 'success' });
    } catch (error) {
      toast.show(error?.message || 'Failed to add step', { type: 'danger' });
    } finally {
      setStepLoading(null);
    }
  };

  const handleToggleStep = async (jobId, stepId, currentDone) => {
    try {
      const updatedJob = await api.toggleRepairStep(jobId, stepId, !currentDone, engineerName);
      setJobs(prev => prev.map(job => 
        (job.id === jobId || job._id === jobId) ? updatedJob : job
      ));
    } catch (error) {
      toast.show(error?.message || 'Failed to update step', { type: 'danger' });
    }
  };

  const handleDeleteStep = async (jobId, stepId) => {
    Alert.alert('Delete Step', 'Are you sure you want to delete this step?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const updatedJob = await api.deleteRepairStep(jobId, stepId);
            setJobs(prev => prev.map(job => 
              (job.id === jobId || job._id === jobId) ? updatedJob : job
            ));
            toast.show('Step deleted', { type: 'success' });
          } catch (error) {
            toast.show(error?.message || 'Failed to delete step', { type: 'danger' });
          }
        },
      },
    ]);
  };

  const handleTransfer = async () => {
    if (!transferTo) {
      toast.show('Please select an engineer', { type: 'danger' });
      return;
    }
    if (transferTo === engineerName) {
      toast.show("You can't transfer to yourself", { type: 'danger' });
      return;
    }

    if (transferTo !== 'Reception') {
      const targetWorkload = workload.find(w => w.name === transferTo);
      const targetLoad = targetWorkload?.activeJobs || 0;
      if (targetLoad >= MAX_JOBS) {
        toast.show(`${transferTo} is at full capacity`, { type: 'danger' });
        return;
      }
    }

    setTransferLoading(true);
    try {
      await api.transferJob(transferJobId, engineerName, transferTo, transferNote);
      setJobs(prev => prev.filter(job => (job.id !== transferJobId && job._id !== transferJobId)));
      await fetchWorkload();
      setTransferJobId(null);
      setTransferTo('');
      setTransferNote('');
      toast.show(
        transferTo === 'Reception' 
          ? 'Job returned to Reception' 
          : `Job transferred to ${transferTo}`,
        { type: 'success' }
      );
    } catch (error) {
      toast.show(error?.message || 'Transfer failed', { type: 'danger' });
    } finally {
      setTransferLoading(false);
    }
  };

  // WORKING LOGOUT FUNCTION
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const getTransferBadge = (name) => {
    const workloadData = workload.find(w => w.name === name);
    const count = workloadData?.activeJobs || 0;
    const free = MAX_JOBS - count;
    if (count >= MAX_JOBS) return { label: `${name} - FULL`, disabled: true };
    if (count >= 4) return { label: `${name} - ${free} slot left`, disabled: false };
    return { label: `${name} - ${free} slots free`, disabled: false };
  };

  const filteredJobs = jobs.filter(job => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (job.jobSheetNo || '').toLowerCase().includes(query) ||
      (job.customerName || job.customer?.name || '').toLowerCase().includes(query) ||
      (job.contact || job.customer?.contact || '').toString().includes(query) ||
      (job.modelId || job.device?.model || '').toLowerCase().includes(query)
    );
  });

  const counts = STATUS_STEPS.reduce((acc, s) => {
    acc[s.key] = jobs.filter(job => {
      const status = job.mobileStatus || job.status || 'Received';
      return status === s.key;
    }).length;
    return acc;
  }, {});

  const myLoad = jobs.filter(job => {
    const status = job.mobileStatus || job.status || 'Received';
    return !['Delivered', 'Delivered NR/NA', 'Repaired', 'Ready'].includes(status) && !job.isInvoiced;
  }).length;

  const otherEngineers = engineerList
    .map(e => e.name)
    .filter(n => n && n.toLowerCase() !== engineerName.toLowerCase());

  const handleToggleExpand = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const capacityPercentage = Math.min((myLoad / MAX_JOBS) * 100, 100);
  const capacityColor = myLoad >= MAX_JOBS ? '#dc2626' : myLoad >= 4 ? '#ea580c' : '#16a34a';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      {/* Header with Logout Button */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Engineer Dashboard</Text>
          <Text style={styles.headerSubtitle}>{engineerName || 'Loading...'}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.workloadPill, { backgroundColor: capacityColor }]}>
            <Briefcase size={14} color="#ffffff" />
            <Text style={styles.workloadPillText}>{myLoad}/{MAX_JOBS}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={18} color="#dc2626" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#dc2626']} tintColor="#dc2626" />
        }
      >
        {/* Status Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusCardsScroll}>
          <View style={styles.statusCardsRow}>
            {STATUS_STEPS.map(s => (
              <StatusCard key={s.key} label={s.label} count={counts[s.key] || 0} color={s.color} icon={s.icon} />
            ))}
            <View style={[styles.statusCard, { borderTopColor: '#64748b' }]}>
              <List size={20} color="#64748b" strokeWidth={1.5} />
              <Text style={styles.statusCardLabel}>Total</Text>
              <Text style={[styles.statusCardCount, { color: '#1e293b' }]}>{jobs.length}</Text>
            </View>
            <View style={[styles.statusCard, { borderTopColor: capacityColor }]}>
              <Activity size={20} color={capacityColor} strokeWidth={1.5} />
              <Text style={styles.statusCardLabel}>Capacity</Text>
              <View style={styles.capacityBar}>
                <View style={[styles.capacityFill, { width: `${capacityPercentage}%`, backgroundColor: capacityColor }]} />
              </View>
              <Text style={[styles.statusCardCount, { fontSize: 11, marginTop: 4, color: '#64748b' }]}>
                {myLoad}/{MAX_JOBS} {myLoad >= MAX_JOBS ? 'FULL' : `${MAX_JOBS - myLoad} free`}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search job no / customer / contact / model"
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <RefreshCw size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Job Cards */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#dc2626" />
            <Text style={styles.loadingText}>Loading jobs...</Text>
          </View>
        ) : filteredJobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Inbox size={48} color="#cbd5e1" strokeWidth={1.5} />
            <Text style={styles.emptyText}>No jobs found</Text>
          </View>
        ) : (
          <View style={styles.jobsList}>
            {filteredJobs.map(job => {
              const jobId = job.id || job._id;
              const currentStatus = job.mobileStatus || job.status || 'Received';
              const currentStep = STATUS_STEPS.find(s => s.key === currentStatus) || STATUS_STEPS[0];
              const CurrentStepIcon = currentStep.icon;
              const isUpdating = updating === jobId;
              const isExpanded = expandedJobId === jobId;
              const steps = job.repairSteps || [];
              const doneCount = steps.filter(s => s.done).length;
              const lastTransfer = job.transferLog?.slice(-1)[0];
              const staleDays = getStaleDays(job);
              const isDeliveredOrCancelled = ['Delivered', 'Delivered NR/NA', 'Repaired'].includes(currentStatus) || job.isInvoiced;

              return (
                <View key={jobId} style={[
                  styles.jobCard,
                  staleDays >= 7 && styles.staleCardHigh,
                  staleDays >= 3 && staleDays < 7 && styles.staleCardMedium
                ]}>
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <Text style={styles.jobSheetNo}>{job.jobSheetNo}</Text>
                      {lastTransfer && lastTransfer.to?.toLowerCase() === engineerName.toLowerCase() && (
                        <View style={styles.transferBadge}>
                          <Repeat size={10} color="#d97706" />
                          <Text style={styles.transferBadgeText}>from {lastTransfer.from}</Text>
                        </View>
                      )}
                      <StaleBadge days={staleDays} />
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: currentStep.bg }]}>
                      <CurrentStepIcon size={12} color={currentStep.color} />
                      <Text style={[styles.statusBadgeText, { color: currentStep.color }]}>
                        {currentStep.label}
                      </Text>
                    </View>
                  </View>

                  {/* Card Body */}
                  <View style={styles.cardBody}>
                    <Text style={styles.customerName}>{job.customerName || job.customer?.name || '-'}</Text>
                    
                    <View style={styles.infoRow}>
                      <Phone size={12} color="#64748b" />
                      <Text style={styles.contactText}>{job.contact || job.customer?.contact || '-'}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Smartphone size={12} color="#64748b" />
                      <Text style={styles.deviceText}>{job.makeId || job.device?.make || '-'} {job.modelId || job.device?.model || '-'}</Text>
                    </View>

                    {job.visualIssues?.length > 0 && (
                      <View style={styles.infoRow}>
                        <AlertCircle size={11} color="#dc2626" />
                        <Text style={styles.visualIssuesText}>{job.visualIssues.filter(Boolean).join(', ')}</Text>
                      </View>
                    )}
                    
                    {job.remarks && (
                      <View style={styles.infoRow}>
                        <Edit2 size={11} color="#16a34a" />
                        <Text style={styles.remarksText}>{job.remarks}</Text>
                      </View>
                    )}
                    
                    {lastTransfer?.note && lastTransfer.to?.toLowerCase() === engineerName.toLowerCase() && (
                      <View style={styles.transferNoteBox}>
                        <MessageCircle size={11} color="#d97706" />
                        <Text style={styles.transferNoteText}>{lastTransfer.note}</Text>
                      </View>
                    )}
                    
                    <View style={styles.infoRow}>
                      <Calendar size={11} color="#94a3b8" />
                      <Text style={styles.dateText}>
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                      </Text>
                    </View>

                    {/* Status Update Buttons */}
                    {!isDeliveredOrCancelled && (
                      <View style={styles.statusButtonsContainer}>
                        <Text style={styles.sectionLabel}>Update Status</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <View style={styles.statusButtonsRow}>
                            {STATUS_STEPS.filter(s => s.key !== 'Delivered').map(s => {
                              const isActive = currentStatus === s.key;
                              const StepIcon = s.icon;
                              return (
                                <TouchableOpacity
                                  key={s.key}
                                  style={[
                                    styles.statusButton,
                                    isActive && styles.statusButtonActive,
                                    { borderColor: s.color, backgroundColor: isActive ? s.bg : '#ffffff' }
                                  ]}
                                  onPress={() => !isActive && !isUpdating && handleStatusUpdate(jobId, s.key)}
                                  disabled={isActive || isUpdating}
                                >
                                  <StepIcon size={12} color={isActive ? s.color : '#64748b'} />
                                  <Text style={[styles.statusButtonText, { color: isActive ? s.color : '#64748b' }]}>
                                    {s.label}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                            <TouchableOpacity
                              style={[styles.statusButton, styles.transferButton]}
                              onPress={() => setTransferJobId(jobId)}
                            >
                              <Shuffle size={12} color="#d97706" />
                              <Text style={styles.transferButtonText}>Transfer</Text>
                            </TouchableOpacity>
                          </View>
                        </ScrollView>
                      </View>
                    )}

                    {isDeliveredOrCancelled && (
                      <View style={styles.deliveredMessage}>
                        <CheckCircle size={14} color="#16a34a" />
                        <Text style={styles.deliveredMessageText}>Job Completed - No further updates</Text>
                      </View>
                    )}

                    {/* Repair Steps */}
                    <View style={styles.repairStepsContainer}>
                      <TouchableOpacity
                        style={styles.repairStepsHeader}
                        onPress={() => handleToggleExpand(jobId)}
                      >
                        <View style={styles.repairStepsHeaderLeft}>
                          <Text style={styles.sectionLabel}>Repair Steps</Text>
                          {steps.length > 0 && (
                            <Text style={styles.stepCount}>{doneCount}/{steps.length}</Text>
                          )}
                        </View>
                        {isExpanded ? (
                          <ChevronUp size={16} color="#94a3b8" />
                        ) : (
                          <ChevronDown size={16} color="#94a3b8" />
                        )}
                      </TouchableOpacity>

                      {steps.length > 0 && (
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: `${(doneCount / steps.length) * 100}%` }]} />
                        </View>
                      )}

                      {isExpanded && (
                        <View>
                          {steps.length === 0 ? (
                            <Text style={styles.noStepsText}>No steps added yet</Text>
                          ) : (
                            <View style={styles.stepsList}>
                              {steps.map((step, idx) => (
                                <View key={step._id} style={[styles.stepItem, step.done && styles.stepItemDone]}>
                                  <TouchableOpacity 
                                    onPress={() => !isDeliveredOrCancelled && handleToggleStep(jobId, step._id, step.done)}
                                    disabled={isDeliveredOrCancelled}
                                  >
                                    <View style={[styles.checkbox, step.done && styles.checkboxChecked]}>
                                      {step.done && <Check size={12} color="#ffffff" />}
                                    </View>
                                  </TouchableOpacity>
                                  <View style={styles.stepContent}>
                                    <Text style={[styles.stepText, step.done && styles.stepTextDone]}>
                                      {idx + 1}. {step.step}
                                    </Text>
                                    {step.note && (
                                      <View style={styles.stepMetaRow}>
                                        <FileText size={10} color="#64748b" />
                                        <Text style={styles.stepNote}>{step.note}</Text>
                                      </View>
                                    )}
                                    {step.completedBy && (
                                      <View style={styles.stepMetaRow}>
                                        <User size={10} color="#64748b" />
                                        <Text style={styles.stepCompletedBy}>by {step.completedBy}</Text>
                                      </View>
                                    )}
                                    {step.done && step.completedAt && (
                                      <View style={styles.stepMetaRow}>
                                        <Clock size={10} color="#16a34a" />
                                        <Text style={styles.stepCompletedAt}>
                                          {new Date(step.completedAt).toLocaleString('en-IN')}
                                        </Text>
                                      </View>
                                    )}
                                  </View>
                                  {!isDeliveredOrCancelled && (
                                    <TouchableOpacity onPress={() => handleDeleteStep(jobId, step._id)}>
                                      <Trash2 size={16} color="#dc2626" />
                                    </TouchableOpacity>
                                  )}
                                </View>
                              ))}
                            </View>
                          )}

                          {!isDeliveredOrCancelled && (
                            <View style={styles.addStepForm}>
                              <Text style={styles.addStepTitle}>Add New Step</Text>
                              <TextInput
                                style={styles.stepInput}
                                placeholder="Step description"
                                placeholderTextColor="#94a3b8"
                                value={newStepText[jobId] || ''}
                                onChangeText={(text) => setNewStepText(prev => ({ ...prev, [jobId]: text }))}
                              />
                              <TextInput
                                style={styles.stepInput}
                                placeholder="Note (optional)"
                                placeholderTextColor="#94a3b8"
                                value={newStepNote[jobId] || ''}
                                onChangeText={(text) => setNewStepNote(prev => ({ ...prev, [jobId]: text }))}
                              />
                              <TouchableOpacity
                                style={styles.addStepButton}
                                onPress={() => handleAddStep(jobId)}
                                disabled={stepLoading === jobId}
                              >
                                {stepLoading === jobId ? (
                                  <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                  <>
                                    <Plus size={14} color="#ffffff" />
                                    <Text style={styles.addStepButtonText}>Add Step</Text>
                                  </>
                                )}
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Transfer Modal */}
      <Modal visible={!!transferJobId} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.transferModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transfer Job</Text>
              <TouchableOpacity onPress={() => setTransferJobId(null)}>
                <X size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.transferJobInfo}>
              Job: <Text style={styles.transferJobInfoBold}>
                {jobs.find(j => (j.id || j._id) === transferJobId)?.jobSheetNo}
              </Text> - {jobs.find(j => (j.id || j._id) === transferJobId)?.customerName || 'N/A'}
            </Text>

            <Text style={styles.transferLabel}>Transfer to:</Text>
            <ScrollView style={styles.transferSelect} nestedScrollEnabled>
              <TouchableOpacity
                style={[styles.transferOption, transferTo === 'Reception' && styles.transferOptionActive]}
                onPress={() => setTransferTo('Reception')}
              >
                <Text style={[styles.transferOptionText, transferTo === 'Reception' && styles.transferOptionSelected]}>
                  Reception (Free up capacity)
                </Text>
              </TouchableOpacity>
              
              <Text style={styles.transferSectionHeader}>Engineers</Text>
              {otherEngineers.map((eng, idx) => {
                const badge = getTransferBadge(eng);
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.transferOption,
                      badge.disabled && styles.transferOptionDisabled,
                      transferTo === eng && styles.transferOptionActive
                    ]}
                    onPress={() => !badge.disabled && setTransferTo(eng)}
                    disabled={badge.disabled}
                  >
                    <Text style={[
                      styles.transferOptionText,
                      transferTo === eng && styles.transferOptionSelected,
                      badge.disabled && styles.transferOptionDisabledText
                    ]}>
                      {badge.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {transferTo && transferTo !== 'Reception' && (
              <View style={styles.workloadHintContainer}>
                {(() => {
                  const workloadData = workload.find(w => w.name === transferTo);
                  const count = workloadData?.activeJobs || 0;
                  const free = MAX_JOBS - count;
                  if (count >= MAX_JOBS) return (
                    <View style={styles.workloadHintFull}>
                      <Text style={styles.workloadHintTextFull}>At full capacity - cannot transfer</Text>
                    </View>
                  );
                  if (count >= 4) return (
                    <View style={styles.workloadHintWarning}>
                      <Text style={styles.workloadHintTextWarning}>
                        Has {count}/{MAX_JOBS} jobs - {free} slot left
                      </Text>
                    </View>
                  );
                  return (
                    <View style={styles.workloadHintOk}>
                      <Text style={styles.workloadHintTextOk}>
                        Has {count}/{MAX_JOBS} jobs - {free} slots free
                      </Text>
                    </View>
                  );
                })()}
              </View>
            )}

            <Text style={styles.transferLabel}>Note (optional):</Text>
            <TextInput
              style={styles.transferNoteInput}
              placeholder="e.g., Step 2 completed, IC check needed"
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
              value={transferNote}
              onChangeText={setTransferNote}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setTransferJobId(null);
                  setTransferTo('');
                  setTransferNote('');
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonTransfer,
                  transferLoading && styles.modalButtonDisabled
                ]}
                onPress={handleTransfer}
                disabled={transferLoading}
              >
                {transferLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalButtonConfirmText}>Transfer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#dc2626',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workloadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  workloadPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCardsScroll: {
    marginBottom: 20,
  },
  statusCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    minWidth: 90,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    alignItems: 'center',
    gap: 6,
  },
  statusCardLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  statusCardCount: {
    fontSize: 20,
    fontWeight: '700',
  },
  capacityBar: {
    backgroundColor: '#f1f5f9',
    borderRadius: 99,
    height: 4,
    overflow: 'hidden',
    width: '100%',
    marginTop: 4,
  },
  capacityFill: {
    height: '100%',
    borderRadius: 99,
  },
  searchSection: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#1e293b',
  },
  refreshButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  staleCardHigh: {
    borderColor: '#dc2626',
    borderWidth: 1.5,
  },
  staleCardMedium: {
    borderColor: '#d97706',
    borderWidth: 1.5,
  },
  cardHeader: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 6,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    flex: 1,
  },
  jobSheetNo: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 14,
  },
  transferBadge: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transferBadgeText: {
    color: '#d97706',
    fontSize: 9,
    fontWeight: '600',
  },
  staleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  staleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
  },
  customerName: {
    fontWeight: '700',
    fontSize: 15,
    color: '#1e293b',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  contactText: {
    fontSize: 13,
    color: '#64748b',
  },
  deviceText: {
    fontSize: 13,
    color: '#475569',
  },
  visualIssuesText: {
    fontSize: 12,
    color: '#dc2626',
  },
  remarksText: {
    fontSize: 12,
    color: '#16a34a',
  },
  transferNoteBox: {
    backgroundColor: '#fffbeb',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transferNoteText: {
    fontSize: 12,
    color: '#d97706',
    flex: 1,
  },
  dateText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  statusButtonsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    marginTop: 10,
  },
  sectionLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusButtonActive: {
    opacity: 0.8,
  },
  statusButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  transferButton: {
    borderColor: '#d97706',
    backgroundColor: '#fffbeb',
  },
  transferButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#d97706',
  },
  deliveredMessage: {
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  deliveredMessageText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  repairStepsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    marginTop: 10,
  },
  repairStepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  repairStepsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepCount: {
    marginLeft: 6,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 10,
    color: '#475569',
    fontSize: 10,
  },
  progressBar: {
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    height: 4,
    marginBottom: 12,
  },
  progressFill: {
    backgroundColor: '#16a34a',
    borderRadius: 4,
    height: 4,
  },
  stepsList: {
    gap: 8,
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
  },
  stepItemDone: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  stepTextDone: {
    color: '#16a34a',
    textDecorationLine: 'line-through',
  },
  stepMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  stepNote: {
    fontSize: 11,
    color: '#64748b',
  },
  stepCompletedBy: {
    fontSize: 10,
    color: '#64748b',
  },
  stepCompletedAt: {
    fontSize: 10,
    color: '#16a34a',
  },
  noStepsText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    padding: 16,
  },
  addStepForm: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  addStepTitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 6,
  },
  stepInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 10,
    fontSize: 13,
    marginBottom: 8,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  addStepButton: {
    backgroundColor: '#dc2626',
    borderRadius: 6,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addStepButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 14,
  },
  jobsList: {
    gap: 16,
  },
  bottomPadding: {
    height: 20,
  },
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
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  transferJobInfo: {
    fontSize: 13,
    color: '#64748b',
    padding: 18,
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
    marginTop: 12,
    paddingHorizontal: 18,
  },
  transferSelect: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginHorizontal: 18,
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
  transferOptionDisabled: {
    opacity: 0.5,
  },
  transferOptionText: {
    fontSize: 13,
    color: '#1e293b',
  },
  transferOptionSelected: {
    color: '#dc2626',
    fontWeight: '600',
  },
  transferOptionDisabledText: {
    color: '#94a3b8',
  },
  transferSectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    padding: 10,
    backgroundColor: '#f8fafc',
  },
  workloadHintContainer: {
    marginHorizontal: 18,
    marginTop: 10,
  },
  workloadHintFull: {
    backgroundColor: '#fef2f2',
    padding: 8,
    borderRadius: 6,
  },
  workloadHintTextFull: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
  workloadHintWarning: {
    backgroundColor: '#fffbeb',
    padding: 8,
    borderRadius: 6,
  },
  workloadHintTextWarning: {
    color: '#d97706',
    fontSize: 12,
    fontWeight: '600',
  },
  workloadHintOk: {
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 6,
  },
  workloadHintTextOk: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '600',
  },
  transferNoteInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    marginHorizontal: 18,
    marginBottom: 18,
    textAlignVertical: 'top',
    backgroundColor: '#f8fafc',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
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

export default EngineerDashboardScreen;