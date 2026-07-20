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
import styles from './EngineerDashboardStyle';

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
            {/* <Text style={styles.logoutButtonText}>Logout</Text> */}
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

      {/* Transfer Modal - Fixed Alignment */}
      <Modal visible={!!transferJobId} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.transferModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transfer Job</Text>
              <TouchableOpacity onPress={() => setTransferJobId(null)}>
                <X size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            {/* Job Info - Fixed Alignment */}
            <View style={styles.transferJobInfoContainer}>
              <Text style={styles.transferJobInfo}>
                Job: <Text style={styles.transferJobInfoBold}>
                  {jobs.find(j => (j.id || j._id) === transferJobId)?.jobSheetNo}
                </Text>
              </Text>
              <Text style={styles.transferJobInfo}>
                Customer: <Text style={styles.transferJobInfoBold}>
                  {jobs.find(j => (j.id || j._id) === transferJobId)?.customerName || 'N/A'}
                </Text>
              </Text>
            </View>

            <Text style={styles.transferLabel}>Transfer to:</Text>
            
            {/* Transfer Options - Fixed Alignment */}
            <ScrollView style={styles.transferSelect} nestedScrollEnabled>
              <TouchableOpacity
                style={[styles.transferOption, transferTo === 'Reception' && styles.transferOptionActive]}
                onPress={() => setTransferTo('Reception')}
              >
                <Text style={[styles.transferOptionText, transferTo === 'Reception' && styles.transferOptionSelected]}>
                  Reception (Free up capacity)
                </Text>
                {transferTo === 'Reception' && (
                  <View style={styles.transferCheckmark}>
                    <Check size={16} color="#dc2626" />
                  </View>
                )}
              </TouchableOpacity>
              
              <View style={styles.transferDivider} />
              
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
                    {transferTo === eng && !badge.disabled && (
                      <View style={styles.transferCheckmark}>
                        <Check size={16} color="#dc2626" />
                      </View>
                    )}
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
              textAlignVertical="top"
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

export default EngineerDashboardScreen;
