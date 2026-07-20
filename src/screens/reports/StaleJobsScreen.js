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
import styles from './StaleJobsStyle';

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

export default StaleJobsScreen;
