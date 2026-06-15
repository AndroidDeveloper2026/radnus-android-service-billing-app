// src/screens/reports/StaleJobsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Info,
  RefreshCw,
  Clock,
  Eye,
  Shuffle,
  X,
  ChevronDown,
  ChevronUp,
  Wrench,
  Smartphone,
  ClipboardList,
  Users,
  ArrowLeft,
} from 'lucide-react-native';
import { fetchStaleJobs } from '../../store/slices/staleJobsSlice';
import api from '../../utils/api';

const COLORS = {
  primary: '#dc2626',
  gray500: '#64748b',
  gray600: '#475569',
};

const StaleJobsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { jobs = [], loading = false } = useSelector(state => state.staleJobs || {});
  
  const [days, setDays] = useState(3);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [engineerList, setEngineerList] = useState([]);
  const [transferLoading, setTransferLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStaleJobs();
    loadEngineers();
  }, [days]);

  const loadStaleJobs = async () => {
    await dispatch(fetchStaleJobs({ days }));
  };

  const loadEngineers = async () => {
    try {
      const response = await api.getEngineers();
      setEngineerList(response);
    } catch (error) {
      console.error('Error loading engineers:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStaleJobs();
    setRefreshing(false);
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
      await loadStaleJobs();
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
    if (daysCount >= 7) return { borderColor: '#ef4444', bg: '#fee2e2', textColor: '#991b1b', label: 'Critical', icon: AlertOctagon };
    if (daysCount >= 3) return { borderColor: '#f59e0b', bg: '#fef3c7', textColor: '#92400e', label: 'Warning', icon: AlertTriangle };
    return { borderColor: '#3b82f6', bg: '#dbeafe', textColor: '#1e40af', label: 'Attention', icon: Info };
  };

  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'received': return { bg: '#E1F5EE', text: '#0F6E56' };
      case 'pending': return { bg: '#FAEEDA', text: '#854F0B' };
      case 'repairing': return { bg: '#F3E8FF', text: '#6D28D9' };
      case 'repaired': return { bg: '#E6F1FB', text: '#185FA5' };
      case 'delivered': return { bg: '#EAF3DE', text: '#3B6D11' };
      default: return { bg: '#F1EFE8', text: '#5F5E5A' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <AlertCircle size={20} color="#f59e0b" />
          <Text style={styles.headerTitle}>Stale Jobs</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.daysSelector}
            onPress={() => {
              const newDays = days === 3 ? 7 : days === 7 ? 14 : 3;
              setDays(newDays);
            }}
          >
            <Text style={styles.daysSelectorText}>{days}+ days</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.summaryScroll}
        contentContainerStyle={styles.summaryContainer}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardValue}>{jobs.length}</Text>
          <Text style={styles.summaryCardLabel}>Total Stale Jobs</Text>
        </View>
        <View style={[styles.summaryCard, styles.summaryCardCritical]}>
          <Text style={styles.summaryCardValue}>
            {jobs.filter(j => j.staleDays >= 7).length}
          </Text>
          <Text style={styles.summaryCardLabel}>Critical (7+ days)</Text>
        </View>
        <View style={[styles.summaryCard, styles.summaryCardWarning]}>
          <Text style={styles.summaryCardValue}>
            {jobs.filter(j => j.staleDays >= 3 && j.staleDays < 7).length}
          </Text>
          <Text style={styles.summaryCardLabel}>Warning (3-6 days)</Text>
        </View>
      </ScrollView>

      {/* Jobs List */}
      <ScrollView
        style={styles.jobsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f59e0b" />
            <Text style={styles.loadingText}>Loading stale jobs...</Text>
          </View>
        ) : jobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AlertCircle size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No stale jobs found</Text>
            <Text style={styles.emptySubText}>All jobs are within the {days}+ day threshold</Text>
          </View>
        ) : (
          jobs.map((job) => {
            const urgency = getUrgencyStyle(job.staleDays);
            const UrgencyIcon = urgency.icon;
            const progress = Math.min((job.staleDays / 30) * 100, 100);
            const statusStyle = getStatusBadgeStyle(job.status);
            
            return (
              <View key={job._id} style={[styles.jobCard, { borderLeftColor: urgency.borderColor }]}>
                <TouchableOpacity 
                  style={styles.jobContent}
                  onPress={() => navigateToJobDetail(job._id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.jobHeader}>
                    <View style={styles.jobTitle}>
                      <Text style={styles.jobNo}>{job.jobSheetNo}</Text>
                      <View style={[styles.urgencyBadge, { backgroundColor: urgency.bg }]}>
                        <UrgencyIcon size={12} color={urgency.textColor} />
                        <Text style={[styles.urgencyText, { color: urgency.textColor }]}>
                          {urgency.label}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.daysBadge, { backgroundColor: urgency.bg }]}>
                      <Clock size={12} color={urgency.textColor} />
                      <Text style={[styles.daysText, { color: urgency.textColor }]}>
                        {job.staleDays} days
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.customerName} numberOfLines={1}>
                    {job.customerName || job.customer?.name || 'Unknown Customer'}
                  </Text>
                  
                  <View style={styles.deviceInfo}>
                    <View style={styles.deviceTextContainer}>
                      <Smartphone size={12} color="#64748b" />
                      <Text style={styles.deviceText} numberOfLines={1}>
                        {job.make} {job.model}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {job.status || 'Pending'}
                      </Text>
                    </View>
                  </View>

                  {job.assignedTo && (
                    <View style={styles.assignedContainer}>
                      <Wrench size={12} color="#64748b" />
                      <Text style={styles.assignedTo}>Assigned: {job.assignedTo}</Text>
                    </View>
                  )}

                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: urgency.borderColor }]} />
                    </View>
                    <Text style={styles.progressText}>Stale Progress</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => navigateToJobDetail(job._id)}
                  >
                    <Eye size={16} color="#3b82f6" />
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.transferButton}
                    onPress={() => {
                      setSelectedJob(job);
                      setShowTransferModal(true);
                    }}
                  >
                    <Shuffle size={16} color="#f59e0b" />
                    <Text style={styles.transferButtonText}>Transfer Job</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Transfer Modal */}
      <Modal visible={showTransferModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transfer Job</Text>
              <TouchableOpacity onPress={() => setShowTransferModal(false)}>
                <X size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.transferJobInfoCard}>
              <Text style={styles.transferJobLabel}>Job Sheet No:</Text>
              <Text style={styles.transferJobValue}>{selectedJob?.jobSheetNo}</Text>
              <Text style={styles.transferJobLabel}>Customer:</Text>
              <Text style={styles.transferJobValue}>
                {selectedJob?.customerName || selectedJob?.customer?.name || 'Unknown'}
              </Text>
            </View>

            <Text style={styles.transferLabel}>Transfer to:</Text>
            <ScrollView style={styles.transferSelect} nestedScrollEnabled>
              <TouchableOpacity
                style={[styles.transferOption, styles.transferOptionRow, transferTo === 'Reception' && styles.transferOptionActive]}
                onPress={() => setTransferTo('Reception')}
              >
                <ClipboardList size={16} color={transferTo === 'Reception' ? '#dc2626' : '#1e293b'} />
                <Text style={[styles.transferOptionText, transferTo === 'Reception' && styles.transferOptionSelected]}>
                  Reception
                </Text>
              </TouchableOpacity>
              
              <View style={styles.divider} />
              <View style={styles.transferSectionHeader}>
                <Users size={14} color="#64748b" />
                <Text style={styles.transferSectionHeaderText}>Engineers</Text>
              </View>
              {engineerList.map((eng, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.transferOption, styles.transferOptionRow, transferTo === eng.name && styles.transferOptionActive]}
                  onPress={() => setTransferTo(eng.name)}
                >
                  <Wrench size={16} color={transferTo === eng.name ? '#dc2626' : '#1e293b'} />
                  <Text style={[styles.transferOptionText, transferTo === eng.name && styles.transferOptionSelected]}>
                    {eng.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.transferLabel}>Transfer Note (optional):</Text>
            <TextInput
              style={styles.transferNoteInput}
              placeholder="Add reason for transfer or additional notes..."
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
                  <Text style={styles.modalButtonConfirmText}>Transfer Job</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  headerRight: {},
  daysSelector: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  daysSelectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  summaryScroll: {
    flexGrow: 0,
    paddingVertical: 12,
  },
  summaryContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryCardCritical: {
    backgroundColor: '#fef2f2',
  },
  summaryCardWarning: {
    backgroundColor: '#fffbeb',
  },
  summaryCardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  summaryCardLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  jobsList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  emptySubText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  jobContent: {
    padding: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  jobNo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3b82f6',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  daysBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  daysText: {
    fontSize: 11,
    fontWeight: '600',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  deviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  deviceText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  assignedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 10,
  },
  assignedTo: {
    fontSize: 12,
    color: '#475569',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  progressBar: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    height: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#eff6ff',
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  transferButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fffbeb',
  },
  transferButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  transferJobInfoCard: {
    backgroundColor: '#f8fafc',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  transferJobLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  transferJobValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  transferLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  transferSelect: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginHorizontal: 16,
    maxHeight: 250,
    backgroundColor: '#ffffff',
  },
  transferOption: {
    padding: 14,
  },
  transferOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transferOptionActive: {
    backgroundColor: '#fef2f2',
  },
  transferOptionText: {
    fontSize: 14,
    color: '#1e293b',
  },
  transferOptionSelected: {
    color: '#dc2626',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  transferSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  transferSectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  transferNoteInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    marginHorizontal: 16,
    marginBottom: 16,
    textAlignVertical: 'top',
    backgroundColor: '#f8fafc',
    minHeight: 80,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f1f5f9',
  },
  modalButtonCancelText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  modalButtonTransfer: {
    backgroundColor: '#dc2626',
  },
  modalButtonConfirmText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  modalButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
});

export default StaleJobsScreen;