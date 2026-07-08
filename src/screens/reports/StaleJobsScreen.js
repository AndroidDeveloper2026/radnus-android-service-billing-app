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
  StatusBar,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Info,
  Clock,
  Eye,
  Shuffle,
  X,
  Wrench,
  Smartphone,
  ClipboardList,
  Users,
  ArrowLeft,
  Filter,
  Calendar,
  User,
  Check,
} from 'lucide-react-native';
import { fetchStaleJobs } from '../../store/slices/staleJobsSlice';
import api from '../../utils/api';

const { width } = Dimensions.get('window');

const StaleJobsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { jobs = [], loading = false } = useSelector(state => state.staleJobs || {});
  
  const [days, setDays] = useState(3);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [engineerList, setEngineerList] = useState([]);
  const [transferLoading, setTransferLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadStaleJobs();
    loadEngineers();
  }, [days]);

  const loadStaleJobs = async () => {
    try {
      await dispatch(fetchStaleJobs({ days }));
    } catch (error) {
      console.error('Error loading stale jobs:', error);
    }
  };

  const loadEngineers = async () => {
    try {
      const response = await api.getEngineers();
      setEngineerList(response || []);
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

  const getFilteredJobs = () => {
    if (filterType === 'critical') {
      return jobs.filter(j => j.staleDays >= 7);
    } else if (filterType === 'warning') {
      return jobs.filter(j => j.staleDays >= 3 && j.staleDays < 7);
    }
    return jobs;
  };

  const getUrgencyStyle = (daysCount) => {
    if (daysCount >= 7) {
      return { 
        borderColor: '#ef4444', 
        bg: '#fef2f2', 
        textColor: '#dc2626', 
        label: 'Critical', 
        icon: AlertOctagon,
        progressColor: '#ef4444',
      };
    }
    if (daysCount >= 3) {
      return { 
        borderColor: '#f59e0b', 
        bg: '#fffbeb', 
        textColor: '#d97706', 
        label: 'Warning', 
        icon: AlertTriangle,
        progressColor: '#f59e0b',
      };
    }
    return { 
      borderColor: '#3b82f6', 
      bg: '#eff6ff', 
      textColor: '#2563eb', 
      label: 'Attention', 
      icon: Info,
      progressColor: '#3b82f6',
    };
  };

  const getStatusBadgeStyle = (status) => {
    const statusMap = {
      'received': { bg: '#d1fae5', text: '#065f46' },
      'pending': { bg: '#fef3c7', text: '#92400e' },
      'repairing': { bg: '#ede9fe', text: '#5b21b6' },
      'repaired': { bg: '#dbeafe', text: '#1e40af' },
      'delivered': { bg: '#d1fae5', text: '#065f46' },
      'cancelled': { bg: '#fee2e2', text: '#991b1b' },
    };
    return statusMap[status?.toLowerCase()] || { bg: '#f1f5f9', text: '#475569' };
  };

  const handleFilterToggle = () => {
    const types = ['all', 'critical', 'warning'];
    const currentIndex = types.indexOf(filterType);
    const nextIndex = (currentIndex + 1) % types.length;
    setFilterType(types[nextIndex]);
  };

  const getFilterLabel = () => {
    const labels = {
      'all': 'All',
      'critical': 'Critical',
      'warning': 'Warning'
    };
    return labels[filterType] || 'All';
  };

  const filteredJobs = getFilteredJobs();
  const criticalCount = jobs.filter(j => j.staleDays >= 7).length;
  const warningCount = jobs.filter(j => j.staleDays >= 3 && j.staleDays < 7).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleContainer}>
            <AlertCircle size={22} color="#dc2626" />
            <Text style={styles.headerTitle}>Stale Jobs</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.filterButton}
          onPress={handleFilterToggle}
          activeOpacity={0.7}
        >
          <Filter size={20} color="#64748b" />
          {filterType !== 'all' && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {filterType === 'critical' ? 'C' : 'W'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Days Selector */}
      <View style={styles.daysSelectorContainer}>
        <Calendar size={16} color="#64748b" />
        <Text style={styles.daysSelectorLabel}>Threshold:</Text>
        <View style={styles.daysOptions}>
          {[1, 3, 5, 7, 14].map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayOption,
                days === day && styles.dayOptionActive
              ]}
              onPress={() => setDays(day)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.dayOptionText,
                days === day && styles.dayOptionTextActive
              ]}>
                {day}d
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardValue}>{jobs.length}</Text>
          <Text style={styles.summaryCardLabel}>Total</Text>
        </View>
        <View style={[styles.summaryCard, styles.summaryCardCritical]}>
          <Text style={styles.summaryCardValueCritical}>{criticalCount}</Text>
          <Text style={styles.summaryCardLabelCritical}>Critical</Text>
        </View>
        <View style={[styles.summaryCard, styles.summaryCardWarning]}>
          <Text style={styles.summaryCardValueWarning}>{warningCount}</Text>
          <Text style={styles.summaryCardLabelWarning}>Warning</Text>
        </View>
        <TouchableOpacity 
          style={[styles.summaryCard, styles.summaryCardFilter]}
          onPress={handleFilterToggle}
          activeOpacity={0.7}
        >
          <Filter size={20} color="#64748b" />
          <Text style={styles.summaryCardLabel}>{getFilterLabel()}</Text>
        </TouchableOpacity>
      </View>

      {/* Jobs List */}
      <ScrollView
        style={styles.jobsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            colors={['#dc2626']}
            tintColor="#dc2626"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#dc2626" />
            <Text style={styles.loadingText}>Loading stale jobs...</Text>
          </View>
        ) : filteredJobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AlertCircle size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No stale jobs found</Text>
            <Text style={styles.emptySubText}>
              {filterType === 'all' 
                ? `All jobs are within the ${days}+ day threshold` 
                : `No ${filterType} jobs found with ${days}+ days`}
            </Text>
            {filterType !== 'all' && (
              <TouchableOpacity 
                style={styles.resetFilterButton}
                onPress={() => setFilterType('all')}
              >
                <Text style={styles.resetFilterText}>View all jobs</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredJobs.map((job, index) => {
            const urgency = getUrgencyStyle(job.staleDays);
            const UrgencyIcon = urgency.icon;
            const progress = Math.min((job.staleDays / 30) * 100, 100);
            const statusStyle = getStatusBadgeStyle(job.status);
            
            return (
              <View key={job._id || index} style={[styles.jobCard, { borderLeftColor: urgency.borderColor }]}>
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
                        {job.staleDays}d
                      </Text>
                    </View>
                  </View>

                  <View style={styles.customerContainer}>
                    <User size={14} color="#64748b" />
                    <Text style={styles.customerName} numberOfLines={1}>
                      {job.customerName || job.customer?.name || 'Unknown Customer'}
                    </Text>
                  </View>
                  
                  <View style={styles.deviceInfo}>
                    <View style={styles.deviceTextContainer}>
                      <Smartphone size={14} color="#64748b" />
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
                      <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: urgency.progressColor }]} />
                    </View>
                    <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() => navigateToJobDetail(job._id)}
                    activeOpacity={0.7}
                  >
                    <Eye size={16} color="#3b82f6" />
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.transferButton]}
                    onPress={() => {
                      setSelectedJob(job);
                      setShowTransferModal(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Shuffle size={16} color="#f59e0b" />
                    <Text style={styles.transferButtonText}>Transfer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
        
        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Transfer Modal - Fixed Alignment */}
      <Modal 
        visible={showTransferModal} 
        transparent 
        animationType="slide"
        onRequestClose={() => {
          setShowTransferModal(false);
          setSelectedJob(null);
          setTransferTo('');
          setTransferNote('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { marginTop: insets.top > 0 ? insets.top : 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transfer Job</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowTransferModal(false);
                  setSelectedJob(null);
                  setTransferTo('');
                  setTransferNote('');
                }}
                activeOpacity={0.7}
              >
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Job Info Card - Fixed Alignment */}
              <View style={styles.transferJobInfoCard}>
                <View style={styles.transferInfoRow}>
                  <Text style={styles.transferJobLabel}>JOB Sheet:</Text>
                  <Text style={styles.transferJobValue} numberOfLines={1}>
                    {selectedJob?.jobSheetNo || 'N/A'}
                  </Text>
                </View>
                <View style={styles.transferInfoRow}>
                  <Text style={styles.transferJobLabel}>Customer:</Text>
                  <Text style={styles.transferJobValue} numberOfLines={1}>
                    {selectedJob?.customerName || selectedJob?.customer?.name || 'Unknown'}
                  </Text>
                </View>
                <View style={styles.transferInfoRow}>
                  <Text style={styles.transferJobLabel}>Device:</Text>
                  <Text style={styles.transferJobValue} numberOfLines={1}>
                    {selectedJob?.make || 'N/A'} {selectedJob?.model || ''}
                  </Text>
                </View>
                <View style={styles.transferInfoRow}>
                  <Text style={styles.transferJobLabel}>Status:</Text>
                  <Text style={[styles.transferJobValue, styles.transferJobStatus]}>
                    {selectedJob?.status || 'Pending'}
                  </Text>
                </View>
              </View>

              <Text style={styles.transferLabel}>Transfer to:</Text>
              
              {/* Transfer Options - Fixed Alignment */}
              <View style={styles.transferSelect}>
                <TouchableOpacity
                  style={[styles.transferOption, transferTo === 'Reception' && styles.transferOptionActive]}
                  onPress={() => setTransferTo('Reception')}
                  activeOpacity={0.7}
                >
                  <ClipboardList size={18} color={transferTo === 'Reception' ? '#dc2626' : '#475569'} />
                  <Text style={[styles.transferOptionText, transferTo === 'Reception' && styles.transferOptionSelected]}>
                    Reception
                  </Text>
                  {transferTo === 'Reception' && (
                    <View style={styles.transferCheckmark}>
                      <Check size={16} color="#dc2626" />
                    </View>
                  )}
                </TouchableOpacity>
                
                <View style={styles.transferDivider} />
                
                <View style={styles.transferSectionHeader}>
                  <Users size={14} color="#64748b" />
                  <Text style={styles.transferSectionHeaderText}>Engineers</Text>
                </View>
                
                {engineerList.length === 0 ? (
                  <View style={styles.transferEmpty}>
                    <Text style={styles.transferEmptyText}>No engineers available</Text>
                  </View>
                ) : (
                  engineerList.map((eng, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.transferOption, transferTo === eng.name && styles.transferOptionActive]}
                      onPress={() => setTransferTo(eng.name)}
                      activeOpacity={0.7}
                    >
                      <Wrench size={18} color={transferTo === eng.name ? '#dc2626' : '#475569'} />
                      <Text style={[styles.transferOptionText, transferTo === eng.name && styles.transferOptionSelected]}>
                        {eng.name}
                      </Text>
                      {transferTo === eng.name && (
                        <View style={styles.transferCheckmark}>
                          <Check size={16} color="#dc2626" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </View>

              <Text style={styles.transferLabel}>Transfer Note (optional):</Text>
              <TextInput
                style={styles.transferNoteInput}
                placeholder="Add reason for transfer..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                value={transferNote}
                onChangeText={setTransferNote}
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowTransferModal(false);
                  setSelectedJob(null);
                  setTransferTo('');
                  setTransferNote('');
                }}
                activeOpacity={0.7}
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
                activeOpacity={0.7}
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
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 4,
    width: 40,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  filterButton: {
    padding: 4,
    width: 40,
    alignItems: 'flex-end',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  filterBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  daysSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 8,
  },
  daysSelectorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  daysOptions: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  dayOption: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    minWidth: 36,
    alignItems: 'center',
  },
  dayOptionActive: {
    backgroundColor: '#dc2626',
  },
  dayOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  dayOptionTextActive: {
    color: '#ffffff',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 70,
  },
  summaryCardCritical: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  summaryCardWarning: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  summaryCardFilter: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
  },
  summaryCardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
  },
  summaryCardValueCritical: {
    fontSize: 22,
    fontWeight: '700',
    color: '#dc2626',
  },
  summaryCardValueWarning: {
    fontSize: 22,
    fontWeight: '700',
    color: '#d97706',
  },
  summaryCardLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  summaryCardLabelCritical: {
    fontSize: 10,
    color: '#dc2626',
    marginTop: 2,
    fontWeight: '600',
  },
  summaryCardLabelWarning: {
    fontSize: 10,
    color: '#d97706',
    marginTop: 2,
    fontWeight: '600',
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
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
  },
  emptySubText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  resetFilterButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#dc2626',
    borderRadius: 8,
  },
  resetFilterText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
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
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  jobContent: {
    padding: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
    color: '#2563eb',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  daysText: {
    fontSize: 11,
    fontWeight: '600',
  },
  customerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  deviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  deviceTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  deviceText: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  assignedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    marginBottom: 8,
  },
  assignedTo: {
    fontSize: 12,
    color: '#475569',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
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
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  viewButton: {
    backgroundColor: '#f8fafc',
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3b82f6',
  },
  transferButton: {
    backgroundColor: '#f8fafc',
  },
  transferButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f59e0b',
  },
  bottomSpacer: {
    height: 20,
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
    width: width * 0.92,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalBody: {
    maxHeight: 500,
  },
  // Transfer Modal Styles - Fixed Alignment
  transferJobInfoCard: {
    backgroundColor: '#f8fafc',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  transferInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  transferJobLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    minWidth: 80,
  },
  transferJobValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  transferJobStatus: {
    color: '#dc2626',
    textTransform: 'capitalize',
  },
  transferLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  transferSelect: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginHorizontal: 16,
    maxHeight: 220,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  transferOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  transferOptionActive: {
    backgroundColor: '#fef2f2',
  },
  transferOptionText: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
    marginLeft: 10,
  },
  transferOptionSelected: {
    color: '#dc2626',
    fontWeight: '600',
  },
  transferCheckmark: {
    marginLeft: 'auto',
  },
  transferDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 0,
  },
  transferSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  transferSectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  transferEmpty: {
    padding: 16,
    alignItems: 'center',
  },
  transferEmptyText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  transferNoteInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    marginHorizontal: 16,
    marginBottom: 12,
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
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f1f5f9',
  },
  modalButtonCancelText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 15,
  },
  modalButtonTransfer: {
    backgroundColor: '#dc2626',
  },
  modalButtonConfirmText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  modalButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
});

export default StaleJobsScreen;
