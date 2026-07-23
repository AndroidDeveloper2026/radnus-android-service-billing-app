
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Keyboard,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import * as ImagePicker from 'react-native-image-picker';
import {
  Plus,
  Calendar,
  Calculator,
  Save,
  RefreshCw,
  Home,
  FileText,
  Receipt,
  AlertCircle,
  CheckCircle,
  Search,
  X,
  Camera,
  ChevronDown,
  XCircle,
  Wallet,
  Package,
  DollarSign,
  User,
  Smartphone,
  Wrench,
  Eye,
  Shield,
  MapPin,
  Phone,
  Mail,
  Tag,
  Hash,
} from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// FIX: Import Formik correctly - this is the key fix
import { Formik } from 'formik';
import * as yup from 'yup';

import {
  createJob,
  updateJob,
  fetchJobById,
  clearCurrentJob,
} from '../../store/slices/jobSlice';
import {
  fetchEngineers,
  fetchMakes,
  fetchModels,
  fetchDrawers,
  fetchSalesReps,
  fetchFaults,
} from '../../store/slices/adminSlice';
import {
  Button,
  SelectModal,
  CheckboxItem,
  LoadingOverlay,
} from '../../components/UI';
import SparePopup from '../../components/SparePopup';
import AdvancePopup from '../../components/AdvancePopup';
import OthersPopup from '../../components/OthersPopup';
import { COLORS, SPACING } from '../../utils/theme';
import { useToast } from 'react-native-toast-notifications';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '@env';
import axios from 'axios';
import styles from './JobSheetFormStyle';

const { width } = Dimensions.get('window');

// ─── Constants ─────────────────────────────────────────────────────────────
const physicalOptions = [
  'Crack / Fault',
  'Antenna Broken',
  'Deformed',
  'Battery Damaged',
  'LCD Broken / Flickering',
  'Touch Not Working',
  'Transparent Film',
  'Front Cover Scratches',
  'Scratches On Body',
  'Water Logged',
];

const accessoryOptions = [
  'Battery',
  'Charger',
  'Back Cover',
  'Memory Card',
  'SIM',
  'Others',
];

const warrantyOptions = [
  { id: 'No Warranty', name: 'No Warranty' },
  { id: 'In Warranty', name: 'In Warranty' },
  { id: '3 months', name: '3 Months' },
  { id: '6 months', name: '6 Months' },
  { id: '1 year', name: '1 Year' },
];

const idProofOptions = [
  { id: 'Aadhaar Card', name: 'Aadhaar Card' },
  { id: 'Passport', name: 'Passport' },
  { id: 'Driving License', name: 'Driving License' },
  { id: 'Election ID', name: 'Election ID' },
  { id: 'ID Not Required', name: 'ID Not Required' },
  { id: 'Dealer Collected', name: 'Dealer Collected' },
];

const paymentOptions = [
  { id: 'Cash', name: 'Cash' },
  { id: 'UPI', name: 'UPI' },
  { id: 'Card', name: 'Card' },
  { id: 'Bank Transfer', name: 'Bank Transfer' },
];

const statusOptions = [
  { id: 'Received', name: 'Received' },
  { id: 'Pending', name: 'Pending' },
  { id: 'Repaired', name: 'Repaired' },
  { id: 'Delivered', name: 'Delivered' },
  { id: 'Delivered NR/NA', name: 'Delivered NR/NA' },
  { id: 'Cancelled', name: 'Cancelled' },
];

const instaFollowOptions = [
  { id: 'Yes', name: 'Yes' },
  { id: 'No', name: 'No' },
  { id: 'Already Done', name: 'Already Done' },
];

const googleReviewOptions = [
  { id: 'Yes', name: 'Yes' },
  { id: 'No', name: 'No' },
  { id: 'Already Done', name: 'Already Done' },
];

const MAX_JOBS = 5;

// ─── Helper Functions ──────────────────────────────────────────────────────
const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-IN', { hour12: true });
};

const getCurrentDate = () => {
  const now = new Date();
  return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
};

const onlyNumbers = value => value ? value.replace(/\D/g, '') : '';

const calculateFinancials = (serviceCharges, spareCharges, spareItems) => {
  const service = parseFloat(serviceCharges) || 0;
  const spare = parseFloat(spareCharges) || 0;
  
  const itemsTotal = (spareItems || []).reduce(
    (sum, item) => sum + (parseInt(item.qty) || 0) * (parseFloat(item.rate) || 0),
    0
  );
  
  const totalSpare = spare > 0 ? spare : itemsTotal;
  const estimate = service + totalSpare;
  const margin = service;
  
  return { estimate, margin, service, totalSpare, itemsTotal };
};

const calculateAdvanceTotal = (advanceItems) => {
  return (advanceItems || []).reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );
};

// ─── Validation Schema ──────────────────────────────────────────────────
const JobSheetSchema = yup.object().shape({
  customerName: yup.string().required('Customer name is required'),
  contact: yup
    .string()
    .required('Contact number is required')
    .min(10, 'Enter valid contact number')
    .max(10, 'Must be exactly 10 digits'),
  altContact: yup.string().nullable(),
  address: yup.string().nullable(),
  email: yup.string().email('Invalid email').nullable(),
  makeId: yup.string().nullable(),
  modelId: yup.string().nullable(),
  imei: yup.string().nullable(),
  warranty: yup.string().nullable(),
  patternPin: yup.string().nullable(),
  idProof: yup.string().nullable(),
  physicalConditions: yup.array().nullable(),
  accessoriesReceived: yup.array().nullable(),
  batteryNumber: yup.string().nullable(),
  engineerId: yup.string().nullable(),
  dealerName: yup.string().nullable(),
  drawerId: yup.string().nullable(),
  serviceRepId: yup.string().nullable(),
  serviceCharges: yup.string().nullable(),
  spareCharges: yup.string().nullable(),
  estimateAmount: yup.string().nullable(),
  paymentMode: yup.string().nullable(),
  repairDate: yup.date().nullable(),
  deliveryDate: yup.date().nullable(),
  remarks: yup.string().nullable(),
  spareItems: yup.array().nullable(),
  jobSheetNo: yup.string().nullable(),
  createdAt: yup.string().nullable(),
  time: yup.string().nullable(),
  advanceAmount: yup.string().nullable(),
  advanceDate: yup.date().nullable(),
  marginAmount: yup.string().nullable(),
  instaFollowers: yup.string().nullable(),
  googleReview: yup.string().nullable(),
  income: yup.string().nullable(),
  othersAmount: yup.string().nullable(),
  othersItems: yup.array().nullable(),
});

// ─── CustomerAutocomplete ──────────────────────────────────────────────────
const CustomerAutocomplete = ({
  label,
  type,
  value,
  onChange,
  onSelect,
  placeholder,
  maxLength,
  keyboardType,
  required,
  error,
  icon: Icon,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const userTypedRef = useRef(false);

  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    if (!userTypedRef.current) return;

    if (!value || value.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/jobsheets/customers/search`,
          { params: { q: value, type } },
        );
        setSuggestions(res.data || []);
        setShowSuggestions((res.data || []).length > 0);
      } catch (err) {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [value, type]);

  const handleSelect = customer => {
    Keyboard.dismiss();
    userTypedRef.current = false;
    setShowSuggestions(false);
    setSuggestions([]);
    onSelect(customer);
  };

  const handleTextChange = text => {
    const val = type === 'contact' ? onlyNumbers(text) : text;
    userTypedRef.current = true;
    onChange(val);
  };

  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.fieldWrapper}>
      {label && (
        <Text
          style={[styles.inputLabel, { color: error ? COLORS.error : COLORS.gray700 }]}
        >
          {label}
          {required && <Text style={{ color: COLORS.error }}> *</Text>}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: error
              ? COLORS.error
              : isFocused
              ? COLORS.primary
              : COLORS.gray200,
          },
        ]}
      >
        {Icon && <Icon size={18} color={COLORS.gray400} style={{ marginRight: 10 }} />}
        <TextInput
          style={styles.inputField}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray400}
          keyboardType={keyboardType || 'default'}
          maxLength={maxLength}
          autoComplete="off"
          autoCorrect={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setShowSuggestions(false), 200);
          }}
        />
        {loading && <ActivityIndicator size="small" color={COLORS.gray400} />}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsDropdown}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            style={{ maxHeight: 200 }}
          >
            {suggestions.map((item, idx) => (
              <TouchableOpacity
                key={String(idx)}
                style={[
                  styles.suggestionItem,
                  idx < suggestions.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.gray100,
                  },
                ]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionName}>{item.name}</Text>
                <Text style={styles.suggestionContact}>{item.contact}</Text>
                {!!item.address && (
                  <Text style={styles.suggestionAddress}>{item.address}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// ─── Visual Inspection ────────────────────────────────────────────────────
const VisualInspectionSection = ({
  visualIssues,
  setVisualIssues,
  faultList,
  customFaults,
  setCustomFaults,
}) => {
  const addIssue = () => setVisualIssues([...visualIssues, '']);

  const removeIssue = index => {
    const newIssues = visualIssues.filter((_, i) => i !== index);
    setVisualIssues(newIssues);
    const newCustom = { ...customFaults };
    delete newCustom[index];
    setCustomFaults(newCustom);
  };

  const updateIssue = (index, value) => {
    const newIssues = [...visualIssues];
    newIssues[index] = value;
    setVisualIssues(newIssues);
  };

  const handleSelectChange = (index, value) => {
    if (value === '__custom') {
      setCustomFaults({ ...customFaults, [index]: '' });
      updateIssue(index, '');
    } else {
      const newCustom = { ...customFaults };
      delete newCustom[index];
      setCustomFaults(newCustom);
      updateIssue(index, value);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Eye size={18} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Visual Inspection</Text>
      </View>

      {visualIssues.map((issue, index) => (
        <View key={index} style={styles.visualRow}>
          <View style={styles.visualSelectWrapper}>
            <SelectModal
              value={
                customFaults[index] !== undefined ? '__custom' : issue || ''
              }
              options={[
                ...faultList.map(f => ({ id: f.name, name: f.name })),
                { id: '__custom', name: 'Other (Add New)' },
              ]}
              onSelect={val => handleSelectChange(index, val)}
              placeholder="Select Issue"
              hideLabel
              containerStyle={styles.visualSelect}
            />
            {customFaults[index] !== undefined && (
              <TextInput
                style={styles.customFaultInput}
                placeholder="Enter Fault"
                value={customFaults[index]}
                onChangeText={text => {
                  setCustomFaults({ ...customFaults, [index]: text });
                  updateIssue(index, text);
                }}
              />
            )}
          </View>
          {visualIssues.length > 1 && (
            <TouchableOpacity
              onPress={() => removeIssue(index)}
              style={styles.removeVisualButton}
            >
              <X size={18} color={COLORS.danger} />
            </TouchableOpacity>
          )}
        </View>
      ))}

      <TouchableOpacity onPress={addIssue} style={styles.addVisualButton}>
        <Plus size={16} color={COLORS.primary} />
        <Text style={styles.addVisualText}>Add Issue</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── ID Proof Upload ──────────────────────────────────────────────────────
const IDProofUpload = ({ value, onChange, idProofType }) => {
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    if (value && typeof value === 'string' && value.startsWith('http')) {
      setImageUri(value);
    } else if (value && typeof value === 'object' && value.uri) {
      setImageUri(value.uri);
    }
  }, [value]);

  const isDisabled =
    idProofType === 'ID Not Required' || idProofType === 'Dealer Collected';

  const pickImage = () => {
    if (isDisabled) {
      Alert.alert(
        'Not Allowed',
        'ID proof upload is disabled for this selection',
      );
      return;
    }
    ImagePicker.launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, includeBase64: false },
      response => {
        if (response.didCancel) return;
        if (response.error) {
          Alert.alert('Error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          setImageUri(asset.uri);
          onChange(asset);
        }
      },
    );
  };

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.inputLabel}>ID Proof Image</Text>
      <TouchableOpacity
        onPress={pickImage}
        style={[
          styles.idProofUploadBox,
          isDisabled && styles.idProofUploadBoxDisabled,
          imageUri && styles.idProofUploadBoxHasImage,
        ]}
        disabled={isDisabled}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.idProofPreview} />
        ) : (
          <View style={styles.idProofPlaceholder}>
            <Camera
              size={28}
              color={isDisabled ? COLORS.gray400 : COLORS.gray500}
            />
            <Text
              style={[styles.idProofUploadText, isDisabled && styles.idProofUploadTextDisabled]}
            >
              {isDisabled ? 'Upload Disabled' : 'Tap to upload ID proof'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      {imageUri && (
        <TouchableOpacity
          onPress={() => {
            setImageUri(null);
            onChange(null);
          }}
          style={styles.idProofRemoveButton}
        >
          <Text style={styles.idProofRemoveText}>Remove Image</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────
export default function JobSheetFormScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const toast = useToast();
  const { user } = useAuth();
  const { mode, jobId } = route.params || { mode: 'new' };

  const { currentJob, loading: jobLoading } = useSelector(s => s.jobs);
  const {
    engineers,
    makes,
    models,
    drawers,
    salesReps = [],
    faults = [],
  } = useSelector(s => s.admin);

  const [workloadMap, setWorkloadMap] = useState({});
  const [visualIssues, setVisualIssues] = useState(['']);
  const [customFaults, setCustomFaults] = useState({});
  const [idProofImage, setIdProofImage] = useState(null);
  const [idProofPreview, setIdProofPreview] = useState(null);
  const [openRepairDate, setOpenRepairDate] = useState(false);
  const [openDeliveryDate, setOpenDeliveryDate] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    action: null,
    pendingValues: null,
  });
  const [engineerModalVisible, setEngineerModalVisible] = useState(false);

  const [advancePopupVisible, setAdvancePopupVisible] = useState(false);
  const [sparePopupVisible, setSparePopupVisible] = useState(false);
  const [othersPopupVisible, setOthersPopupVisible] = useState(false);

  const savedJobIdRef = useRef(jobId || null);
  const isLoading = jobLoading;

  // ─── Reset Function for New Job ──────────────────────────────────────────
  const resetForm = () => {
    setVisualIssues(['']);
    setCustomFaults({});
    setIdProofImage(null);
    setIdProofPreview(null);
    setSparePopupVisible(false);
    setAdvancePopupVisible(false);
    setOthersPopupVisible(false);
    setConfirmModal({ visible: false, action: null, pendingValues: null });
    setSearchText('');
    setSearchResults([]);
    setShowSearchModal(false);
    dispatch(clearCurrentJob());
    savedJobIdRef.current = null;
  };

  // ─── Fetch Data ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode === 'new') {
      resetForm();
    }

    if (!engineers.length) {
      dispatch(fetchEngineers()).unwrap().catch(() =>
        toast.show('Could not load engineers list. Check your connection.', { type: 'warning' })
      );
    }
    if (!makes.length) {
      dispatch(fetchMakes()).unwrap().catch(() =>
        toast.show('Could not load makes list. Check your connection.', { type: 'warning' })
      );
    }
    if (!models.length) {
      dispatch(fetchModels()).unwrap().catch(() =>
        toast.show('Could not load models list. Check your connection.', { type: 'warning' })
      );
    }
    if (!drawers.length) {
      dispatch(fetchDrawers()).unwrap().catch(() =>
        toast.show('Could not load drawers list. Check your connection.', { type: 'warning' })
      );
    }
    if (!salesReps.length) {
      dispatch(fetchSalesReps()).unwrap().catch(() =>
        toast.show('Could not load sales reps list. Check your connection.', { type: 'warning' })
      );
    }
    if (!faults.length) {
      dispatch(fetchFaults()).unwrap().catch(() =>
        toast.show('Could not load faults list. Check your connection.', { type: 'warning' })
      );
    }

    fetchWorkload();

    if (mode === 'edit' && jobId) {
      dispatch(fetchJobById(jobId));
    }

    return () => {
      if (mode === 'edit') dispatch(clearCurrentJob());
    };
  }, [mode, jobId]);

  const fetchWorkload = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/jobsheets/workload`);
      const map = {};
      if (Array.isArray(res.data)) {
        res.data.forEach(e => {
          map[e.name] = e.activeJobs;
        });
      }
      setWorkloadMap(map);
    } catch (err) {
      console.error('Workload fetch error:', err);
    }
  };

  // ─── Populate Edit Data ──────────────────────────────────────────────────
  useEffect(() => {
    if (mode === 'edit' && currentJob) {
      const savedIssues = currentJob.visualIssues?.length
        ? currentJob.visualIssues
        : [''];
      setVisualIssues(savedIssues);

      const rebuilt = {};
      savedIssues.forEach((issue, i) => {
        if (
          issue &&
          !faults.some(f => f.name.toLowerCase() === issue.toLowerCase())
        ) {
          rebuilt[i] = issue;
        }
      });
      setCustomFaults(rebuilt);

      if (currentJob.idProofImage) {
        setIdProofPreview(currentJob.idProofImage);
      }
    }
  }, [currentJob, faults, mode]);

  // ─── Initial Values ──────────────────────────────────────────────────────
  const initialValues = useMemo(
    () => ({
      jobSheetNo: currentJob?.jobSheetNo || '',
      customerName: currentJob?.customerName || '',
      contact: currentJob?.contact || '',
      altContact: currentJob?.altContact || '',
      address: currentJob?.address || '',
      email: currentJob?.email || '',
      makeId: currentJob?.makeId || '',
      modelId: currentJob?.modelId || '',
      imei: currentJob?.imei || '',
      warranty: currentJob?.warranty || 'No Warranty',
      patternPin: currentJob?.patternPin || '',
      idProof: currentJob?.idProof || '',
      physicalConditions: currentJob?.physicalConditions || [],
      accessoriesReceived: currentJob?.accessoriesReceived || [],
      batteryNumber: currentJob?.batteryNumber || '',
      engineerId: currentJob?.engineerId || '',
      dealerName: currentJob?.dealerName || '',
      drawerId: currentJob?.drawerId || '',
      serviceRepId: currentJob?.serviceRepId || '',
      serviceCharges: currentJob?.serviceCharges?.toString() || '',
      spareCharges: currentJob?.spareCharges?.toString() || '',
      estimateAmount: currentJob?.estimateAmount?.toString() || '',
      advanceAmount: currentJob?.advanceAmount?.toString() || '',
      advanceDate: currentJob?.advanceDate
        ? new Date(currentJob.advanceDate)
        : null,
      advanceItems: currentJob?.advanceItems || [],
      marginAmount: currentJob?.marginAmount?.toString() || '',
      paymentMode: currentJob?.paymentMode || '',
      repairDate: currentJob?.repairDate
        ? new Date(currentJob.repairDate)
        : new Date(),
      deliveryDate: currentJob?.deliveredDate
        ? new Date(currentJob.deliveredDate)
        : null,
      instaFollowers: currentJob?.instaFollowers || '',
      googleReview: currentJob?.googleReview || '',
      remarks: currentJob?.remarks || '',
      spareItems: currentJob?.spareItems || [],
      createdAt: currentJob?.createdAt || getCurrentDate(),
      time: currentJob?.time || getCurrentTime(),
      status: currentJob?.status || 'Received',
      income: currentJob?.income?.toString() || '',
      othersAmount: currentJob?.othersAmount?.toString() || '',
      othersItems: currentJob?.othersItems || [],
    }),
    [currentJob],
  );

  // ─── Calculate Functions ─────────────────────────────────────────────────
  const calculateEstimate = (setFieldValue, getValues) => {
    const v = getValues();
    const { estimate, margin } = calculateFinancials(
      v.serviceCharges,
      v.spareCharges,
      v.spareItems
    );
    setFieldValue('estimateAmount', estimate.toString());
    setFieldValue('marginAmount', margin.toString());
    toast.show('Estimate calculated', { type: 'success' });
  };

  // ─── Search Function ─────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchText.trim()) {
      toast.show('Please enter search term', { type: 'warning' });
      return;
    }
    setSearchLoading(true);
    try {
      const trimmed = searchText.trim();
      const isJobSheetNo =
        /^JS-\d+$/i.test(trimmed) ||
        (/^\d{1,4}$/.test(trimmed) && trimmed.length <= 4);

      const res = await axios.get(`${API_BASE_URL}/api/jobsheets/filter`, {
        params: { q: trimmed },
      });

      let filtered = res.data;
      if (trimmed && isJobSheetNo && /^\d+$/.test(trimmed)) {
        const padded = trimmed.padStart(3, '0');
        const exact = `JS-${padded}`;
        filtered = res.data.filter(js => js.jobSheetNo === exact);
      }

      setSearchResults(filtered);
      setShowSearchModal(true);
    } catch (err) {
      console.error(err);
      toast.show('Search failed', { type: 'danger' });
    } finally {
      setSearchLoading(false);
    }
  };

  // ─── Save Functions ──────────────────────────────────────────────────────
  const buildSubmitData = values => {
    const { estimate, margin } = calculateFinancials(
      values.serviceCharges,
      values.spareCharges,
      values.spareItems
    );
    
    const advanceTotal = calculateAdvanceTotal(values.advanceItems);
    const advanceAmount = advanceTotal > 0 ? advanceTotal : (parseFloat(values.advanceAmount) || 0);
    
    const othersTotal = (values.othersItems || []).reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0
    );
    
    return {
      ...values,
      serviceCharges: parseFloat(values.serviceCharges) || 0,
      spareCharges: parseFloat(values.spareCharges) || 0,
      estimateAmount: estimate,
      marginAmount: margin,
      advanceAmount: advanceAmount,
      advanceDate: values.advanceDate ? values.advanceDate.toISOString() : null,
      income: parseFloat(values.income) || 0,
      othersAmount: othersTotal > 0 ? othersTotal : (parseFloat(values.othersAmount) || 0),
      othersItems: values.othersItems || [],
      spareItems: (values.spareItems || []).map(item => ({
        name: item.name || '',
        qty: parseInt(item.qty) || 0,
        rate: parseFloat(item.rate) || 0,
        amount: (parseInt(item.qty) || 0) * (parseFloat(item.rate) || 0),
      })),
      advanceItems: values.advanceItems || [],
      visualIssues: visualIssues.filter(Boolean),
      idProofImage: idProofImage,
      time: getCurrentTime(),
      physicalConditions: values.physicalConditions || [],
      accessoriesReceived: values.accessoriesReceived || [],
      instaFollowers: values.instaFollowers || '',
      googleReview: values.googleReview || '',
    };
  };

  const performSave = async values => {
    if (!values.customerName || !values.contact) {
      toast.show('Customer Name and Contact are required', { type: 'danger' });
      return null;
    }
    if (values.contact.trim().length !== 10) {
      toast.show('Contact must be exactly 10 digits', { type: 'danger' });
      return null;
    }
    const submitData = buildSubmitData(values);
    try {
      let savedJob;
      if (mode === 'edit') {
        savedJob = await dispatch(
          updateJob({ id: jobId, data: submitData }),
        ).unwrap();
        toast.show('Job updated successfully', { type: 'success' });
      } else {
        savedJob = await dispatch(createJob(submitData)).unwrap();
        toast.show('Job created successfully', { type: 'success' });
      }
      const id = savedJob?.id || savedJob?._id || jobId;
      savedJobIdRef.current = id;
      return id;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || 'Failed to save job';
      toast.show(msg, { type: 'danger' });
      return null;
    }
  };

  // ─── Action Handlers ─────────────────────────────────────────────────────
  const requestSave = values => {
    const missing = [];
    if (!values.customerName?.trim()) missing.push('Customer Name');
    if (!values.contact?.trim()) missing.push('Contact Number');

    if (missing.length > 0) {
      missing.forEach(field =>
        toast.show(`${field} is required`, { type: 'danger' }),
      );
      return;
    }
    if (values.contact?.trim() && values.contact.trim().length !== 10) {
      toast.show('Contact Number must be exactly 10 digits', {
        type: 'danger',
      });
      return;
    }
    setConfirmModal({ visible: true, action: 'save', pendingValues: values });
  };

  const requestInvoice = values => {
    if (!values.customerName?.trim() || !values.contact?.trim()) {
      toast.show('Customer Name and Contact are required', { type: 'danger' });
      return;
    }
    if (values.contact.trim().length !== 10) {
      toast.show('Contact must be exactly 10 digits', { type: 'danger' });
      return;
    }
    if (mode === 'edit' && savedJobIdRef.current) {
      navigation.navigate('JobSheet', {
        screen: 'InvoiceBill',
        params: { id: savedJobIdRef.current },
      });
      return;
    }
    setConfirmModal({
      visible: true,
      action: 'invoice',
      pendingValues: values,
    });
  };

  const requestEstimate = values => {
    if (!values.customerName?.trim() || !values.contact?.trim()) {
      toast.show('Customer Name and Contact are required', { type: 'danger' });
      return;
    }
    if (values.contact.trim().length !== 10) {
      toast.show('Contact must be exactly 10 digits', { type: 'danger' });
      return;
    }
    if (mode === 'edit' && savedJobIdRef.current) {
      navigation.navigate('JobSheet', {
        screen: 'EstimateBill',
        params: { id: savedJobIdRef.current },
      });
      return;
    }
    setConfirmModal({
      visible: true,
      action: 'estimate',
      pendingValues: values,
    });
  };

  const closeConfirm = () => {
    setIsConfirming(false);
    setTimeout(() => {
      setConfirmModal({ visible: false, action: null, pendingValues: null });
    }, 50);
  };

  const handleConfirm = async () => {
    const { action, pendingValues } = confirmModal;
    if (!pendingValues) {
      closeConfirm();
      return;
    }
    setIsConfirming(true);

    if (action === 'save') {
      const savedId = await performSave(pendingValues);
      setIsConfirming(false);
      closeConfirm();
      if (savedId) navigation.goBack();
    } else if (action === 'invoice') {
      const savedId = await performSave(pendingValues);
      setIsConfirming(false);
      closeConfirm();
      if (savedId) {
        navigation.navigate('JobSheet', {
          screen: 'InvoiceBill',
          params: { id: savedId },
        });
      }
    } else if (action === 'estimate') {
      const savedId = await performSave(pendingValues);
      setIsConfirming(false);
      closeConfirm();
      if (savedId) {
        navigation.navigate('JobSheet', {
          screen: 'EstimateBill',
          params: { id: savedId },
        });
      }
    } else {
      setIsConfirming(false);
      closeConfirm();
    }
  };

  // ─── Handle New Job Navigation ──────────────────────────────────────────
  const handleNewJob = () => {
    resetForm();
    navigation.replace('JobSheetForm', { mode: 'new' });
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <KeyboardAwareScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={JobSheetSchema}
        onSubmit={(values, { setSubmitting }) => {
          requestSave(values);
          setSubmitting(false);
        }}
        enableReinitialize
      >
        {({ values, setFieldValue, handleSubmit, errors, touched }) => {
          const filteredModels = models.filter(m => m.makeId === values.makeId);
          const buttonsDisabled = isConfirming;

          return (
            <>
              <View style={styles.formContainer}>
                {/* ─── Job Sheet Header ──────────────────────────────────── */}
                <View style={styles.section}>
                  <View style={styles.jobSheetHeader}>
                    <View style={styles.jobSheetHeaderLeft}>
                      <Text style={styles.jobSheetLabel}>Job Sheet No:</Text>
                      <Text style={styles.jobSheetNo}>{values.jobSheetNo || 'New'}</Text>
                    </View>
                    <View style={styles.dateTimeContainer}>
                      <View style={styles.dateTimeItem}>
                        <Text style={styles.dateTimeText}>
                          {values.createdAt || getCurrentDate()}
                        </Text>
                      </View>
                      <View style={styles.dateTimeItem}>
                        <Text style={styles.dateTimeText}>
                          {values.time || getCurrentTime()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* ─── Search Bar ───────────────────────────────────────── */}
                <View style={styles.searchSection}>
                  <View style={styles.searchRow}>
                    <Search size={18} color={COLORS.gray400} style={{ marginLeft: 12 }} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search Job Sheet / IMEI / Contact / Name"
                      placeholderTextColor={COLORS.gray400}
                      value={searchText}
                      onChangeText={setSearchText}
                      onSubmitEditing={handleSearch}
                    />
                    <TouchableOpacity
                      onPress={handleSearch}
                      style={styles.searchButton}
                      disabled={searchLoading}
                    >
                      {searchLoading ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <Text style={styles.searchButtonText}>Search</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ─── Customer Details Card ────────────────────────────── */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <User size={16} color={COLORS.primary} />
                    <Text style={styles.sectionTitle}>Customer Details</Text>
                  </View>

                  <CustomerAutocomplete
                    label="Customer Name"
                    type="name"
                    value={values.customerName}
                    onChange={t => setFieldValue('customerName', t)}
                    onSelect={customer => {
                      setFieldValue('customerName', customer.name || '');
                      setFieldValue('contact', customer.contact || '');
                      setFieldValue('altContact', customer.altContact || '');
                      setFieldValue('address', customer.address || '');
                      setFieldValue('email', customer.email || '');
                      setFieldValue(
                        'instaFollowers',
                        customer.instaFollowers === 'Already Done'
                          ? 'Already Done'
                          : '',
                      );
                      setFieldValue(
                        'googleReview',
                        customer.googleReview === 'Already Done'
                          ? 'Already Done'
                          : '',
                      );
                    }}
                    placeholder="Customer Name"
                    required
                    error={touched.customerName && errors.customerName}
                    icon={User}
                  />

                  <CustomerAutocomplete
                    label="Contact No"
                    type="contact"
                    value={values.contact}
                    onChange={t => setFieldValue('contact', t)}
                    onSelect={customer => {
                      setFieldValue('customerName', customer.name || '');
                      setFieldValue('contact', customer.contact || '');
                      setFieldValue('altContact', customer.altContact || '');
                      setFieldValue('address', customer.address || '');
                      setFieldValue('email', customer.email || '');
                      setFieldValue(
                        'instaFollowers',
                        customer.instaFollowers === 'Already Done'
                          ? 'Already Done'
                          : '',
                      );
                      setFieldValue(
                        'googleReview',
                        customer.googleReview === 'Already Done'
                          ? 'Already Done'
                          : '',
                      );
                    }}
                    placeholder="Contact No"
                    keyboardType="phone-pad"
                    maxLength={10}
                    required
                    error={touched.contact && errors.contact}
                    icon={Phone}
                  />

                  <CustomerAutocomplete
                    label="Alt Contact"
                    type="contact"
                    value={values.altContact}
                    onChange={t => setFieldValue('altContact', t)}
                    onSelect={customer => {
                      if (customer.altContact) {
                        setFieldValue('altContact', customer.altContact);
                      }
                    }}
                    placeholder="Alt Contact"
                    keyboardType="phone-pad"
                    maxLength={10}
                    icon={Phone}
                  />

                  <View style={styles.fieldWrapper}>
                    <Text style={styles.inputLabel}>Customer Address</Text>
                    <View style={[styles.inputWrapper, { minHeight: 44 }]}>
                      <MapPin size={18} color={COLORS.gray400} style={{ marginRight: 10 }} />
                      <TextInput
                        style={[styles.inputField, { textAlignVertical: 'top' }]}
                        value={values.address}
                        onChangeText={t => setFieldValue('address', t)}
                        multiline
                        numberOfLines={2}
                        placeholder="Customer Address"
                        placeholderTextColor={COLORS.gray400}
                      />
                    </View>
                  </View>

                  <View style={styles.fieldWrapper}>
                    <Text style={styles.inputLabel}>Email ID</Text>
                    <View style={[styles.inputWrapper, { minHeight: 44 }]}>
                      <Mail size={18} color={COLORS.gray400} style={{ marginRight: 10 }} />
                      <TextInput
                        style={styles.inputField}
                        value={values.email}
                        onChangeText={t => setFieldValue('email', t)}
                        keyboardType="email-address"
                        placeholder="Email ID"
                        placeholderTextColor={COLORS.gray400}
                      />
                    </View>
                    {touched.email && errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                  </View>

                  <SelectModal
                    label="Select ID Proof"
                    value={values.idProof}
                    options={idProofOptions}
                    onSelect={v => setFieldValue('idProof', v)}
                    placeholder="Select ID Proof"
                  />

                  <IDProofUpload
                    value={idProofPreview}
                    onChange={file => {
                      setIdProofImage(file);
                      setIdProofPreview(file ? file.uri : null);
                    }}
                    idProofType={values.idProof}
                  />
                </View>

                {/* ─── Device Details Card ──────────────────────────────── */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Smartphone size={16} color={COLORS.primary} />
                    <Text style={styles.sectionTitle}>Device Details</Text>
                  </View>

                  <SelectModal
                    label="Search Make"
                    value={values.makeId}
                    options={makes}
                    onSelect={selectedId => {
                      setFieldValue('makeId', selectedId);
                      const selectedMake = makes.find(m => m.id === selectedId);
                      setFieldValue('makeName', selectedMake?.name || '');
                      setFieldValue('modelId', '');
                      setFieldValue('modelName', '');
                    }}
                    placeholder="Search Make..."
                  />

                  <SelectModal
                    label="Search Model"
                    value={values.modelId}
                    options={filteredModels}
                    onSelect={selectedId => {
                      setFieldValue('modelId', selectedId);
                      const selectedModel = filteredModels.find(
                        m => m.id === selectedId,
                      );
                      setFieldValue('modelName', selectedModel?.name || '');
                    }}
                    placeholder="Search Model..."
                  />

                  <View style={styles.fieldWrapper}>
                    <Text style={styles.inputLabel}>IMEI *</Text>
                    <View style={[styles.inputWrapper, { minHeight: 44 }]}>
                      <Hash size={18} color={COLORS.gray400} style={{ marginRight: 10 }} />
                      <TextInput
                        style={styles.inputField}
                        value={values.imei}
                        onChangeText={t => setFieldValue('imei', t)}
                        keyboardType="numeric"
                        maxLength={15}
                        placeholder="IMEI"
                        placeholderTextColor={COLORS.gray400}
                      />
                    </View>
                  </View>

                  <View style={styles.row2}>
                    <View style={[styles.fieldWrapper, { flex: 1, marginRight: 4 }]}>
                      <Text style={styles.inputLabel}>Status</Text>
                      <SelectModal
                        value={values.status}
                        options={statusOptions}
                        onSelect={v => setFieldValue('status', v)}
                        placeholder="Received"
                        hideLabel
                        containerStyle={{ marginBottom: 0 }}
                      />
                    </View>
                    <View style={[styles.fieldWrapper, { flex: 1, marginLeft: 4 }]}>
                      <Text style={styles.inputLabel}>Warranty</Text>
                      <SelectModal
                        value={values.warranty}
                        options={warrantyOptions}
                        onSelect={v => setFieldValue('warranty', v)}
                        placeholder="No Warranty"
                        hideLabel
                        containerStyle={{ marginBottom: 0 }}
                      />
                    </View>
                  </View>

                  <View style={styles.fieldWrapper}>
                    <Text style={styles.inputLabel}>Pattern / PIN</Text>
                    <View style={[styles.inputWrapper, { minHeight: 44 }]}>
                      <Shield size={18} color={COLORS.gray400} style={{ marginRight: 10 }} />
                      <TextInput
                        style={styles.inputField}
                        value={values.patternPin}
                        onChangeText={t => setFieldValue('patternPin', t)}
                        placeholder="Pattern / PIN"
                        placeholderTextColor={COLORS.gray400}
                      />
                    </View>
                  </View>
                </View>

                {/* ─── Service / Repair Details ─────────────────────────── */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Wrench size={16} color={COLORS.primary} />
                    <Text style={styles.sectionTitle}>Service / Repair Details</Text>
                  </View>

                  {/* Engineer - Full Width */}
                  <View style={styles.fieldWrapper}>
                    <Text style={styles.inputLabel}>Select Engineer</Text>
                    <TouchableOpacity
                      style={styles.engineerTrigger}
                      onPress={() => setEngineerModalVisible(true)}
                      activeOpacity={0.7}
                    >
                      {values.engineerId ? (
                        <View style={styles.engineerTriggerContent}>
                          <View>
                            <Text style={styles.engineerTriggerName}>
                              {engineers.find(e => e.id === values.engineerId)?.name || 'Select Engineer'}
                            </Text>
                            <View style={styles.engineerTriggerBadge}>
                              <CheckCircle size={12} color="#16a34a" />
                              <Text style={styles.engineerTriggerBadgeText}>
                                {(() => {
                                  const eng = engineers.find(e => e.id === values.engineerId);
                                  if (eng) {
                                    const count = workloadMap[eng.name] || 0;
                                    return `${count}/5 jobs – ${5 - count} slots free`;
                                  }
                                  return 'Available';
                                })()}
                              </Text>
                            </View>
                          </View>
                          <ChevronDown size={18} color={COLORS.gray400} />
                        </View>
                      ) : (
                        <View style={styles.engineerTriggerPlaceholder}>
                          <Text style={styles.engineerTriggerPlaceholderText}>Select Engineer</Text>
                          <ChevronDown size={18} color={COLORS.gray400} />
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Dealer Name - Full Width */}
                  <View style={styles.fieldWrapper}>
                    <Text style={styles.inputLabel}>Dealer Name</Text>
                    <View style={[styles.inputWrapper, { minHeight: 44 }]}>
                      <Tag size={18} color={COLORS.gray400} style={{ marginRight: 10 }} />
                      <TextInput
                        style={styles.inputField}
                        value={values.dealerName}
                        onChangeText={t => setFieldValue('dealerName', t)}
                        placeholder="Dealer Name"
                        placeholderTextColor={COLORS.gray400}
                      />
                    </View>
                  </View>

                  {/* Select Drawer - Full Width */}
                  <SelectModal
                    label="Select Drawer"
                    value={values.drawerId}
                    options={drawers}
                    onSelect={v => setFieldValue('drawerId', v)}
                    placeholder="Select Drawer"
                  />

                  {/* Service Rep - Full Width */}
                  <SelectModal
                    label="Service Rep"
                    value={values.serviceRepId}
                    options={salesReps}
                    onSelect={v => setFieldValue('serviceRepId', v)}
                    placeholder="Service Rep"
                  />

                  {/* Two Column: Income & Service Charges */}
                  <View style={styles.row2}>
                    <View style={[styles.fieldWrapper, { flex: 1, marginRight: 4 }]}>
                      <Text style={styles.inputLabel}>Income</Text>
                      <View style={[styles.inputWrapper, { minHeight: 44 }]}>
                        <DollarSign size={18} color={COLORS.gray400} style={{ marginRight: 10 }} />
                        <TextInput
                          style={styles.inputField}
                          value={values.income}
                          onChangeText={t => {
                            const val = onlyNumbers(t);
                            setFieldValue('income', val);
                          }}
                          keyboardType="numeric"
                          placeholder="Income"
                          placeholderTextColor={COLORS.gray400}
                        />
                      </View>
                    </View>
                    <View style={[styles.fieldWrapper, { flex: 1, marginLeft: 4 }]}>
                      <Text style={styles.inputLabel}>Service Charges</Text>
                      <View style={[styles.inputWrapper, { minHeight: 44 }]}>
                        <DollarSign size={18} color={COLORS.gray400} style={{ marginRight: 10 }} />
                        <TextInput
                          style={styles.inputField}
                          value={values.serviceCharges}
                          onChangeText={t => {
                            const val = onlyNumbers(t);
                            setFieldValue('serviceCharges', val);
                            const { estimate, margin } = calculateFinancials(
                              val,
                              values.spareCharges,
                              values.spareItems
                            );
                            setFieldValue('estimateAmount', estimate.toString());
                            setFieldValue('marginAmount', margin.toString());
                          }}
                          keyboardType="numeric"
                          placeholder="Service Charges"
                          placeholderTextColor={COLORS.gray400}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Three Column: Spare Charges, Others, Adv. Amount */}
                  <View style={styles.row3}>
                    <View style={[styles.fieldWrapper, { flex: 1, marginRight: 4 }]}>
                      <Text style={styles.inputLabel}>Spare Charges</Text>
                      <TouchableOpacity
                        style={styles.clickableInput}
                        onPress={() => setSparePopupVisible(true)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.clickableInputLeft}>
                          {/* <Package size={16} color={COLORS.gray400} /> */}
                          <Text style={styles.clickableInputText}>₹ {values.spareCharges || 0}</Text>
                        </View>
                        <ChevronDown size={16} color={COLORS.gray400} />
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.fieldWrapper, { flex: 1, marginHorizontal: 4 }]}>
                      <Text style={styles.inputLabel}>Others</Text>
                      <TouchableOpacity
                        style={styles.clickableInput}
                        onPress={() => setOthersPopupVisible(true)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.clickableInputLeft}>
                          {/* <DollarSign size={16} color={COLORS.gray400} /> */}
                          <Text style={styles.clickableInputText}>₹ {values.othersAmount || 0}</Text>
                        </View>
                        <ChevronDown size={16} color={COLORS.gray400} />
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.fieldWrapper, { flex: 1, marginLeft: 4 }]}>
                      <Text style={styles.inputLabel}>Adv. Amount</Text>
                      <TouchableOpacity
                        style={styles.clickableInput}
                        onPress={() => setAdvancePopupVisible(true)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.clickableInputLeft}>
                          {/* <Wallet size={16} color={COLORS.gray400} /> */}
                          <Text style={styles.clickableInputText}>₹ {values.advanceAmount || 0}</Text>
                        </View>
                        <ChevronDown size={16} color={COLORS.gray400} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Three Column: Payment Mode, Insta Follow, Google Review */}
                  <View style={styles.row3}>
                    <View style={[styles.fieldWrapper, { flex: 1, marginRight: 4 }]}>
                      <SelectModal
                        label="Payment Mode"
                        value={values.paymentMode}
                        options={paymentOptions}
                        onSelect={v => setFieldValue('paymentMode', v)}
                        placeholder="Payment Mode"
                      />
                    </View>
                    <View style={[styles.fieldWrapper, { flex: 1, marginHorizontal: 4 }]}>
                      <SelectModal
                        label="Insta Follow"
                        value={values.instaFollowers}
                        options={instaFollowOptions}
                        onSelect={v => setFieldValue('instaFollowers', v)}
                        placeholder="Insta Follow"
                      />
                    </View>
                    <View style={[styles.fieldWrapper, { flex: 1, marginLeft: 4 }]}>
                      <SelectModal
                        label="Google Review"
                        value={values.googleReview}
                        options={googleReviewOptions}
                        onSelect={v => setFieldValue('googleReview', v)}
                        placeholder="Google Review"
                      />
                    </View>
                  </View>

                  {/* Two Column: Repair Date & Delivery Date */}
                  <View style={styles.row2}>
                    <View style={[styles.fieldWrapper, { flex: 1, marginRight: 4 }]}>
                      <Text style={styles.inputLabel}>Repair Date</Text>
                      <TouchableOpacity
                        onPress={() => setOpenRepairDate(true)}
                        style={styles.dateButton}
                      >
                        <Calendar size={16} color={COLORS.gray600} />
                        <Text style={styles.dateText}>
                          {values.repairDate?.toLocaleDateString('en-IN') || 'Select Date'}
                        </Text>
                      </TouchableOpacity>
                      <DatePicker
                        modal
                        open={openRepairDate}
                        date={values.repairDate || new Date()}
                        onConfirm={date => {
                          setOpenRepairDate(false);
                          setFieldValue('repairDate', date);
                        }}
                        onCancel={() => setOpenRepairDate(false)}
                      />
                    </View>
                    <View style={[styles.fieldWrapper, { flex: 1, marginLeft: 4 }]}>
                      <Text style={styles.inputLabel}>Delivery Date</Text>
                      <TouchableOpacity
                        onPress={() => setOpenDeliveryDate(true)}
                        style={styles.dateButton}
                      >
                        <Calendar size={16} color={COLORS.gray600} />
                        <Text style={styles.dateText}>
                          {values.deliveryDate
                            ? values.deliveryDate.toLocaleDateString('en-IN')
                            : 'Select Date'}
                        </Text>
                      </TouchableOpacity>
                      <DatePicker
                        modal
                        open={openDeliveryDate}
                        date={values.deliveryDate || new Date()}
                        onConfirm={date => {
                          setOpenDeliveryDate(false);
                          setFieldValue('deliveryDate', date);
                        }}
                        onCancel={() => setOpenDeliveryDate(false)}
                      />
                    </View>
                  </View>

                  {/* Remarks - Full Width */}
                  <View style={styles.fieldWrapper}>
                    <Text style={styles.inputLabel}>Remarks</Text>
                    <View style={[styles.inputWrapper, { minHeight: 44 }]}>
                      <TextInput
                        style={[styles.inputField, { textAlignVertical: 'top' }]}
                        value={values.remarks}
                        onChangeText={t => setFieldValue('remarks', t)}
                        multiline
                        numberOfLines={2}
                        placeholder="Remarks"
                        placeholderTextColor={COLORS.gray400}
                      />
                    </View>
                  </View>

                  {/* ─── Financial Summary ───────────────────────────────── */}
                  <View style={styles.financialSummary}>
                    <View style={styles.financialRow}>
                      <View style={styles.financialItem}>
                        <Text style={styles.financialLabel}>Service Charge</Text>
                        <Text style={styles.financialValue}>₹{values.serviceCharges || 0}</Text>
                      </View>
                      <View style={styles.financialItem}>
                        <Text style={styles.financialLabel}>Spare Charges</Text>
                        <Text style={styles.financialValue}>₹{values.spareCharges || 0}</Text>
                      </View>
                      <View style={styles.financialItem}>
                        <Text style={styles.financialLabel}>Estimate</Text>
                        <Text style={[styles.financialValue, styles.financialValueTotal]}>
                          ₹{values.estimateAmount || 0}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={[styles.financialRow, styles.financialTotal]}>
                      <View style={styles.financialItem}>
                        <Text style={styles.financialLabel}>Advance</Text>
                        <Text style={styles.financialValue}>₹{values.advanceAmount || 0}</Text>
                      </View>
                      <View style={styles.financialItem}>
                        <Text style={styles.financialLabel}>Margin</Text>
                        <Text style={[styles.financialValue, styles.financialValueMargin]}>
                          ₹{values.marginAmount || 0}
                        </Text>
                      </View>
                      <View style={styles.financialItem}>
                        <Text style={styles.financialLabel}>Pending</Text>
                        <Text style={[styles.financialValue, styles.financialValuePending]}>
                          ₹{Math.max(0, (parseFloat(values.estimateAmount) || 0) - (parseFloat(values.advanceAmount) || 0))}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Button
                    title="Calculate Estimate"
                    onPress={() =>
                      calculateEstimate(setFieldValue, () => values)
                    }
                    variant="secondary"
                    style={styles.calcButton}
                    icon={Calculator}
                  />

                  {/* ─── Spare Parts Preview ────────────────────────────── */}
                  {(values.spareItems || []).length > 0 && (
                    <View style={styles.previewItemsContainer}>
                      <Text style={styles.previewItemsTitle}>
                        Spare Items ({values.spareItems.length})
                      </Text>
                      {(values.spareItems || []).slice(0, 3).map((item, idx) => (
                        <Text key={idx} style={styles.previewItemsItem}>
                          {item.name} × {item.qty} = ₹{(item.qty * item.rate).toFixed(0)}
                        </Text>
                      ))}
                      {(values.spareItems || []).length > 3 && (
                        <Text style={styles.previewItemsMore}>
                          + {values.spareItems.length - 3} more items
                        </Text>
                      )}
                    </View>
                  )}

                  {/* ─── Advance Payments Preview ───────────────────────── */}
                  {(values.advanceItems || []).length > 0 && (
                    <View style={styles.previewItemsContainer}>
                      <Text style={styles.previewItemsTitle}>
                        Advance Payments ({values.advanceItems.length})
                      </Text>
                      {(values.advanceItems || []).slice(0, 3).map((item, idx) => (
                        <Text key={idx} style={styles.previewItemsItem}>
                          {item.label || `Payment ${idx + 1}`}: ₹{item.amount}
                          {item.date ? ` (${new Date(item.date).toLocaleDateString('en-IN')})` : ''}
                        </Text>
                      ))}
                      {(values.advanceItems || []).length > 3 && (
                        <Text style={styles.previewItemsMore}>
                          + {values.advanceItems.length - 3} more payments
                        </Text>
                      )}
                    </View>
                  )}
                </View>

                {/* ─── Physical Condition ───────────────────────────────── */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Shield size={16} color={COLORS.primary} />
                    <Text style={styles.sectionTitle}>Physical Condition</Text>
                  </View>
                  <View style={styles.checkboxGrid}>
                    {physicalOptions.map(opt => (
                      <CheckboxItem
                        key={opt}
                        label={opt}
                        checked={values.physicalConditions?.includes(opt)}
                        onToggle={() => {
                          const exists =
                            values.physicalConditions?.includes(opt);
                          setFieldValue(
                            'physicalConditions',
                            exists
                              ? values.physicalConditions.filter(i => i !== opt)
                              : [...(values.physicalConditions || []), opt],
                          );
                        }}
                        containerStyle={styles.checkboxItem}
                      />
                    ))}
                  </View>
                </View>

                {/* ─── Accessories Received ─────────────────────────────── */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Tag size={16} color={COLORS.primary} />
                    <Text style={styles.sectionTitle}>Accessories Received</Text>
                  </View>
                  <View style={styles.checkboxGrid}>
                    {accessoryOptions.map(opt => (
                      <CheckboxItem
                        key={opt}
                        label={opt}
                        checked={values.accessoriesReceived?.includes(opt)}
                        onToggle={() => {
                          const exists =
                            values.accessoriesReceived?.includes(opt);
                          setFieldValue(
                            'accessoriesReceived',
                            exists
                              ? values.accessoriesReceived.filter(
                                  i => i !== opt,
                                )
                              : [...(values.accessoriesReceived || []), opt],
                          );
                        }}
                        containerStyle={styles.checkboxItem}
                      />
                    ))}
                  </View>
                  <View style={styles.fieldWrapper}>
                    <Text style={styles.inputLabel}>Battery Number</Text>
                    <View style={[styles.inputWrapper, { minHeight: 44 }]}>
                      <TextInput
                        style={styles.inputField}
                        value={values.batteryNumber}
                        onChangeText={t => setFieldValue('batteryNumber', t)}
                        placeholder="Battery Number"
                        placeholderTextColor={COLORS.gray400}
                      />
                    </View>
                  </View>
                </View>

                {/* ─── Visual Inspection ────────────────────────────────── */}
                <VisualInspectionSection
                  visualIssues={visualIssues}
                  setVisualIssues={setVisualIssues}
                  faultList={faults}
                  customFaults={customFaults}
                  setCustomFaults={setCustomFaults}
                />

                {/* ─── Action Buttons ───────────────────────────────────── */}
                <View style={styles.actionContainer}>
                  <TouchableOpacity
                    style={[
                      styles.saveButtonPrimary,
                      buttonsDisabled && { opacity: 0.6 },
                    ]}
                    onPress={handleSubmit}
                    disabled={buttonsDisabled}
                    activeOpacity={0.8}
                  >
                    <Save size={20} color={COLORS.white} />
                    <Text style={styles.saveButtonText}>
                      {buttonsDisabled
                        ? 'Saving...'
                        : mode === 'edit'
                        ? 'Update Job Sheet'
                        : 'Save Job Sheet'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.secondaryActions}>
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() =>
                        navigation.replace('JobSheetForm', { mode, jobId })
                      }
                      disabled={buttonsDisabled}
                    >
                      <RefreshCw size={18} color={COLORS.gray700} />
                      <Text style={styles.secondaryButtonText}>Refresh</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() =>
                        calculateEstimate(setFieldValue, () => values)
                      }
                      disabled={buttonsDisabled}
                    >
                      <Calculator size={18} color={COLORS.gray700} />
                      <Text style={styles.secondaryButtonText}>Calculate</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.secondaryButton,
                        styles.estimateBtn,
                        buttonsDisabled && { opacity: 0.6 },
                      ]}
                      onPress={() => requestEstimate(values)}
                      disabled={buttonsDisabled}
                    >
                      <FileText size={18} color="#F59E0B" />
                      <Text
                        style={[
                          styles.secondaryButtonText,
                          { color: '#F59E0B' },
                        ]}
                      >
                        Estimate
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.secondaryButton,
                        styles.invoiceBtn,
                        buttonsDisabled && { opacity: 0.6 },
                      ]}
                      onPress={() => requestInvoice(values)}
                      disabled={buttonsDisabled}
                    >
                      <Receipt size={18} color={COLORS.primary} />
                      <Text
                        style={[
                          styles.secondaryButtonText,
                          { color: COLORS.primary },
                        ]}
                      >
                        Invoice
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.secondaryButton, styles.newJobBtn]}
                      onPress={handleNewJob}
                      disabled={buttonsDisabled}
                    >
                      <Plus size={18} color={COLORS.primary} />
                      <Text style={[styles.secondaryButtonText, { color: COLORS.primary }]}>
                        New Job
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() => navigation.navigate('Home')}
                      disabled={buttonsDisabled}
                    >
                      <Home size={18} color={COLORS.gray700} />
                      <Text style={styles.secondaryButtonText}>Home</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* ─── Engineer Selection Modal ──────────────────────────────── */}
              <Modal
                visible={engineerModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEngineerModalVisible(false)}
              >
                <View style={styles.engineerModalOverlay}>
                  <View style={styles.engineerModalContent}>
                    <View style={styles.engineerModalHeader}>
                      <Text style={styles.engineerModalTitle}>Select Engineer</Text>
                      <TouchableOpacity
                        onPress={() => setEngineerModalVisible(false)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <X size={24} color={COLORS.gray600} />
                      </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.engineerModalList}>
                      {engineers.map(engineer => {
                        const count = workloadMap[engineer.name] || 0;
                        const free = MAX_JOBS - count;
                        const isSelected = engineer.id === values.engineerId;
                        const isFull = count >= MAX_JOBS;

                        let statusColor = '#16a34a';
                        let statusText = `${count}/5 jobs – ${free} slots free`;
                        let bgColor = '#dcfce7';
                        if (isFull) {
                          statusColor = '#dc2626';
                          statusText = 'Full capacity';
                          bgColor = '#fee2e2';
                        } else if (count >= 4) {
                          statusColor = '#d97706';
                          bgColor = '#fef3c7';
                        }

                        return (
                          <TouchableOpacity
                            key={engineer.id}
                            style={[
                              styles.engineerModalItem,
                              isSelected && styles.engineerModalItemSelected,
                              isFull && styles.engineerModalItemDisabled,
                            ]}
                            onPress={() => {
                              if (!isFull) {
                                setFieldValue('engineerId', engineer.id);
                                setEngineerModalVisible(false);
                              }
                            }}
                            disabled={isFull}
                            activeOpacity={isFull ? 1 : 0.7}
                          >
                            <View style={styles.engineerModalItemLeft}>
                              <Text style={[
                                styles.engineerModalItemName,
                                isSelected && styles.engineerModalItemNameSelected,
                                isFull && styles.engineerModalItemNameDisabled,
                              ]}>
                                {engineer.name}
                              </Text>
                              <View style={[styles.engineerModalItemStatus, { backgroundColor: bgColor }]}>
                                {isFull ? (
                                  <XCircle size={12} color="#dc2626" />
                                ) : (
                                  <CheckCircle size={12} color="#16a34a" />
                                )}
                                <Text style={[styles.engineerModalItemStatusText, { color: statusColor }]}>
                                  {statusText}
                                </Text>
                              </View>
                            </View>
                            {isSelected && (
                              <CheckCircle size={20} color={COLORS.primary} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              </Modal>

              {/* ─── Popups ──────────────────────────────────────────────── */}
              <SparePopup
                visible={sparePopupVisible}
                onClose={() => setSparePopupVisible(false)}
                setSpareCharge={charge => {
                  setFieldValue('spareCharges', charge);
                  const { estimate, margin } = calculateFinancials(
                    values.serviceCharges,
                    charge,
                    values.spareItems
                  );
                  setFieldValue('estimateAmount', estimate.toString());
                  setFieldValue('marginAmount', margin.toString());
                }}
                setSpareItems={items => {
                  setFieldValue('spareItems', items);
                  const itemsTotal = (items || []).reduce(
                    (sum, item) => sum + (parseInt(item.qty) || 0) * (parseFloat(item.rate) || 0),
                    0
                  );
                  setFieldValue('spareCharges', itemsTotal.toString());
                  const { estimate, margin } = calculateFinancials(
                    values.serviceCharges,
                    itemsTotal,
                    items
                  );
                  setFieldValue('estimateAmount', estimate.toString());
                  setFieldValue('marginAmount', margin.toString());
                }}
                existingItems={values.spareItems || []}
              />

              <AdvancePopup
                visible={advancePopupVisible}
                onClose={() => setAdvancePopupVisible(false)}
                setAdvanceAmount={amount => {
                  setFieldValue('advanceAmount', amount);
                }}
                setAdvanceItems={items => {
                  setFieldValue('advanceItems', items);
                  const total = (items || []).reduce(
                    (sum, item) => sum + (parseFloat(item.amount) || 0),
                    0
                  );
                  setFieldValue('advanceAmount', total.toString());
                }}
                existingItems={values.advanceItems || []}
              />

              <OthersPopup
                visible={othersPopupVisible}
                onClose={() => setOthersPopupVisible(false)}
                setOthersAmount={amount => {
                  setFieldValue('othersAmount', amount);
                }}
                setOthersItems={items => {
                  setFieldValue('othersItems', items);
                  const total = (items || []).reduce(
                    (sum, item) => sum + (parseFloat(item.amount) || 0),
                    0
                  );
                  setFieldValue('othersAmount', total.toString());
                }}
                existingItems={values.othersItems || []}
              />

              {/* ─── Search Results Modal ─────────────────────────────────── */}
              <Modal
                visible={showSearchModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSearchModal(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Search Results</Text>
                      <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                        <X size={24} color={COLORS.gray600} />
                      </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalBody}>
                      {searchResults.length === 0 ? (
                        <Text style={styles.noResults}>No results found</Text>
                      ) : (
                        searchResults.map((job, index) => (
                          <TouchableOpacity
                            key={job._id || index}
                            style={styles.searchResultItem}
                            onPress={() => {
                              setShowSearchModal(false);
                              navigation.navigate('JobSheet', {
                                screen: 'JobDetail',
                                params: { jobId: job._id },
                              });
                            }}
                          >
                            <Text style={styles.resultJobNo}>{job.jobSheetNo}</Text>
                            <Text style={styles.resultCustomer}>
                              {job.customer?.name || 'Unknown'}
                            </Text>
                            <Text style={styles.resultStatus}>
                              {job.device?.mobileStatus || 'Unknown'}
                            </Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </ScrollView>
                  </View>
                </View>
              </Modal>

              {/* ─── Preview Confirm Modal ────────────────────────────────── */}
              <Modal
                visible={confirmModal.visible && confirmModal.action === 'save'}
                transparent
                animationType="slide"
                onRequestClose={closeConfirm}
              >
                <View style={styles.previewOverlay}>
                  <View style={styles.previewCard}>
                    <View style={styles.previewHeader}>
                      <CheckCircle size={22} color={COLORS.primary} />
                      <Text style={styles.previewTitle}>
                        {mode === 'edit' ? 'Review & Update' : 'Review & Save'}
                      </Text>
                    </View>
                    <Text style={styles.previewSubTitle}>
                      Please review the details before saving
                    </Text>

                    <ScrollView
                      style={styles.previewScroll}
                      showsVerticalScrollIndicator={false}
                    >
                      <View style={styles.previewSection}>
                        <Text style={styles.previewSectionTitle}>Customer Details</Text>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Name</Text>
                          <Text style={styles.previewValue}>
                            {confirmModal.pendingValues?.customerName || '—'}
                          </Text>
                        </View>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Contact</Text>
                          <Text style={styles.previewValue}>
                            {confirmModal.pendingValues?.contact || '—'}
                          </Text>
                        </View>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Address</Text>
                          <Text style={styles.previewValue}>
                            {confirmModal.pendingValues?.address || '—'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.previewSection}>
                        <Text style={styles.previewSectionTitle}>Device Details</Text>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Make</Text>
                          <Text style={styles.previewValue}>
                            {makes.find(m => m.id === confirmModal.pendingValues?.makeId)?.name || '—'}
                          </Text>
                        </View>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Model</Text>
                          <Text style={styles.previewValue}>
                            {models.find(m => m.id === confirmModal.pendingValues?.modelId)?.name || '—'}
                          </Text>
                        </View>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>IMEI</Text>
                          <Text style={styles.previewValue}>
                            {confirmModal.pendingValues?.imei || '—'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.previewSection}>
                        <Text style={styles.previewSectionTitle}>Financial Details</Text>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Service Charge</Text>
                          <Text style={styles.previewValue}>
                            ₹ {confirmModal.pendingValues?.serviceCharges || 0}
                          </Text>
                        </View>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Spare Charge</Text>
                          <Text style={styles.previewValue}>
                            ₹ {confirmModal.pendingValues?.spareCharges || 0}
                          </Text>
                        </View>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Estimate Amount</Text>
                          <Text style={[styles.previewValue, styles.previewValueHighlight]}>
                            ₹ {confirmModal.pendingValues?.estimateAmount || 0}
                          </Text>
                        </View>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Advance Amount</Text>
                          <Text style={styles.previewValue}>
                            ₹ {confirmModal.pendingValues?.advanceAmount || 0}
                          </Text>
                        </View>
                        <View style={[styles.previewRow, styles.previewTotalRow]}>
                          <Text style={[styles.previewLabel, styles.previewTotalLabel]}>Pending Amount</Text>
                          <Text style={[styles.previewValue, styles.previewPendingValue]}>
                            ₹ {Math.max(0, (parseFloat(confirmModal.pendingValues?.estimateAmount) || 0) - (parseFloat(confirmModal.pendingValues?.advanceAmount) || 0))}
                          </Text>
                        </View>
                      </View>
                    </ScrollView>

                    <View style={styles.previewButtons}>
                      <TouchableOpacity
                        style={[
                          styles.previewBtn,
                          styles.previewCancelBtn,
                          isConfirming && { opacity: 0.6 },
                        ]}
                        onPress={closeConfirm}
                        disabled={isConfirming}
                      >
                        <Text style={styles.previewCancelText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.previewBtn,
                          styles.previewConfirmBtn,
                          isConfirming && { opacity: 0.6 },
                        ]}
                        onPress={handleConfirm}
                        disabled={isConfirming}
                      >
                        <Save size={16} color="#fff" />
                        <Text style={styles.previewConfirmText}>
                          {isConfirming
                            ? 'Saving...'
                            : mode === 'edit'
                            ? 'Update'
                            : 'Save'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* ─── Alert Confirm Modal ─────────────────────────────────── */}
              {confirmModal.visible &&
                (confirmModal.action === 'invoice' ||
                  confirmModal.action === 'estimate') && (
                  <Modal
                    visible={true}
                    transparent
                    animationType="fade"
                    onRequestClose={closeConfirm}
                  >
                    <View style={styles.alertOverlay}>
                      <View style={styles.alertCard}>
                        <AlertCircle
                          size={36}
                          color={
                            confirmModal.action === 'invoice'
                              ? COLORS.primary
                              : '#F59E0B'
                          }
                        />
                        <Text style={styles.alertTitle}>
                          {confirmModal.action === 'invoice'
                            ? 'Save & Open Invoice?'
                            : 'Save & Open Estimate?'}
                        </Text>
                        <Text style={styles.alertMsg}>
                          {confirmModal.action === 'invoice'
                            ? 'The job sheet will be saved first, then the invoice will open.'
                            : 'The job sheet will be saved first, then the estimate will open.'}
                        </Text>
                        <View style={styles.alertButtons}>
                          <TouchableOpacity
                            style={[
                              styles.alertBtn,
                              styles.alertCancelBtn,
                              isConfirming && { opacity: 0.6 },
                            ]}
                            onPress={closeConfirm}
                            disabled={isConfirming}
                          >
                            <Text style={styles.alertCancelText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.alertBtn,
                              styles.alertConfirmBtn,
                              isConfirming && { opacity: 0.6 },
                            ]}
                            onPress={handleConfirm}
                            disabled={isConfirming}
                          >
                            <Text style={styles.alertConfirmText}>
                              {isConfirming
                                ? 'Saving...'
                                : confirmModal.action === 'invoice'
                                ? 'Save & Invoice'
                                : 'Save & Estimate'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Modal>
                )}

              <LoadingOverlay visible={isLoading} />
            </>
          );
        }}
      </Formik>
    </KeyboardAwareScrollView>
  );
}

// // src/screens/jobsheet/JobSheetFormScreen.js
// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Modal,
//   ActivityIndicator,
//   Keyboard,
//   Image,
//   Alert,
//   Dimensions,
//   Platform,
// } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import DatePicker from 'react-native-date-picker';
// import * as ImagePicker from 'react-native-image-picker';
// import {
//   Trash2,
//   Plus,
//   Calendar,
//   Calculator,
//   Save,
//   RefreshCw,
//   Home,
//   FileText,
//   Receipt,
//   AlertCircle,
//   CheckCircle,
//   Clock,
//   Search,
//   X,
//   Camera,
//   ChevronDown,
//   AlertTriangle,
//   XCircle,
//   Wallet,
//   Package,
//   DollarSign,
//   Instagram,
//   Star,
//   User,
//   Smartphone,
//   Wrench,
//   Eye,
//   Shield,
//   MapPin,
//   Phone,
//   Mail,
//   Tag,
//   Hash,
// } from 'lucide-react-native';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// import { Formik } from 'formik';
// import * as yup from 'yup';
// import {
//   createJob,
//   updateJob,
//   fetchJobById,
//   clearCurrentJob,
// } from '../../store/slices/jobSlice';
// import {
//   fetchEngineers,
//   fetchMakes,
//   fetchModels,
//   fetchDrawers,
//   fetchSalesReps,
//   fetchFaults,
// } from '../../store/slices/adminSlice';
// import {
//   Button,
//   Input,
//   SelectModal,
//   CheckboxItem,
//   LoadingOverlay,
// } from '../../components/UI';
// import SparePopup from '../../components/SparePopup';
// import AdvancePopup from '../../components/AdvancePopup';
// import OthersPopup from '../../components/OthersPopup';
// import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
// import { useToast } from 'react-native-toast-notifications';
// import { useAuth } from '../../context/AuthContext';
// import { API_BASE_URL } from '@env';
// import axios from 'axios';
// import styles from './JobSheetFormStyle';

// const { width, height } = Dimensions.get('window');

// // ─── Constants ─────────────────────────────────────────────────────────────
// const physicalOptions = [
//   'Crack / Fault',
//   'Antenna Broken',
//   'Deformed',
//   'Battery Damaged',
//   'LCD Broken / Flickering',
//   'Touch Not Working',
//   'Transparent Film',
//   'Front Cover Scratches',
//   'Scratches On Body',
//   'Water Logged',
// ];

// const accessoryOptions = [
//   'Battery',
//   'Charger',
//   'Back Cover',
//   'Memory Card',
//   'SIM',
//   'Others',
// ];

// const warrantyOptions = [
//   { id: 'No Warranty', name: 'No Warranty' },
//   { id: 'In Warranty', name: 'In Warranty' },
//   { id: '3 months', name: '3 Months' },
//   { id: '6 months', name: '6 Months' },
//   { id: '1 year', name: '1 Year' },
// ];

// const idProofOptions = [
//   { id: 'Aadhaar Card', name: 'Aadhaar Card' },
//   { id: 'Passport', name: 'Passport' },
//   { id: 'Driving License', name: 'Driving License' },
//   { id: 'Election ID', name: 'Election ID' },
//   { id: 'ID Not Required', name: 'ID Not Required' },
//   { id: 'Dealer Collected', name: 'Dealer Collected' },
// ];

// const paymentOptions = [
//   { id: 'Cash', name: 'Cash' },
//   { id: 'UPI', name: 'UPI' },
//   { id: 'Card', name: 'Card' },
//   { id: 'Bank Transfer', name: 'Bank Transfer' },
// ];

// const statusOptions = [
//   { id: 'Received', name: 'Received' },
//   { id: 'Pending', name: 'Pending' },
//   { id: 'Repaired', name: 'Repaired' },
//   { id: 'Delivered', name: 'Delivered' },
//   { id: 'Delivered NR/NA', name: 'Delivered NR/NA' },
//   { id: 'Cancelled', name: 'Cancelled' },
// ];

// const instaFollowOptions = [
//   { id: 'Yes', name: 'Yes' },
//   { id: 'No', name: 'No' },
//   { id: 'Already Done', name: 'Already Done' },
// ];

// const googleReviewOptions = [
//   { id: 'Yes', name: 'Yes' },
//   { id: 'No', name: 'No' },
//   { id: 'Already Done', name: 'Already Done' },
// ];

// const MAX_JOBS = 5;

// // ─── Helper Functions ──────────────────────────────────────────────────────
// const getCurrentTime = () => {
//   const now = new Date();
//   return now.toLocaleTimeString('en-IN', { hour12: true });
// };

// const getCurrentDate = () => {
//   const now = new Date();
//   return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
// };

// const onlyNumbers = value => value.replace(/\D/g, '');

// // ─── Financial Calculation Helpers ──────────────────────────────────────────
// const calculateFinancials = (serviceCharges, spareCharges, spareItems) => {
//   const service = parseFloat(serviceCharges) || 0;
//   const spare = parseFloat(spareCharges) || 0;
  
//   const itemsTotal = (spareItems || []).reduce(
//     (sum, item) => sum + (parseInt(item.qty) || 0) * (parseFloat(item.rate) || 0),
//     0
//   );
  
//   const totalSpare = spare > 0 ? spare : itemsTotal;
//   const estimate = service + totalSpare;
//   const margin = service;
  
//   return { estimate, margin, service, totalSpare, itemsTotal };
// };

// const calculateAdvanceTotal = (advanceItems) => {
//   return (advanceItems || []).reduce(
//     (sum, item) => sum + (parseFloat(item.amount) || 0),
//     0
//   );
// };

// // ─── Validation Schema ──────────────────────────────────────────────────
// const JobSheetSchema = yup.object().shape({
//   customerName: yup.string().required('Customer name is required'),
//   contact: yup
//     .string()
//     .required('Contact number is required')
//     .min(10, 'Enter valid contact number')
//     .max(10, 'Must be exactly 10 digits'),
//   altContact: yup.string().nullable(),
//   address: yup.string().nullable(),
//   email: yup.string().email('Invalid email').nullable(),
//   makeId: yup.string().nullable(),
//   modelId: yup.string().nullable(),
//   imei: yup.string().nullable(),
//   warranty: yup.string().nullable(),
//   patternPin: yup.string().nullable(),
//   idProof: yup.string().nullable(),
//   physicalConditions: yup.array().nullable(),
//   accessoriesReceived: yup.array().nullable(),
//   batteryNumber: yup.string().nullable(),
//   engineerId: yup.string().nullable(),
//   dealerName: yup.string().nullable(),
//   drawerId: yup.string().nullable(),
//   serviceRepId: yup.string().nullable(),
//   serviceCharges: yup.string().nullable(),
//   spareCharges: yup.string().nullable(),
//   estimateAmount: yup.string().nullable(),
//   paymentMode: yup.string().nullable(),
//   repairDate: yup.date().nullable(),
//   deliveryDate: yup.date().nullable(),
//   remarks: yup.string().nullable(),
//   spareItems: yup.array().nullable(),
//   jobSheetNo: yup.string().nullable(),
//   createdAt: yup.string().nullable(),
//   time: yup.string().nullable(),
//   advanceAmount: yup.string().nullable(),
//   advanceDate: yup.date().nullable(),
//   marginAmount: yup.string().nullable(),
//   instaFollowers: yup.string().nullable(),
//   googleReview: yup.string().nullable(),
//   income: yup.string().nullable(),
//   othersAmount: yup.string().nullable(),
//   othersItems: yup.array().nullable(),
// });

// // ─── CustomerAutocomplete ──────────────────────────────────────────────────
// const CustomerAutocomplete = ({
//   label,
//   type,
//   value,
//   onChange,
//   onSelect,
//   placeholder,
//   maxLength,
//   keyboardType,
//   required,
//   error,
//   icon: Icon,
// }) => {
//   const [suggestions, setSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const debounceRef = useRef(null);
//   const isInitialLoadRef = useRef(true);
//   const userTypedRef = useRef(false);

//   useEffect(() => {
//     if (isInitialLoadRef.current) {
//       isInitialLoadRef.current = false;
//       return;
//     }

//     if (!userTypedRef.current) return;

//     if (!value || value.trim().length < 1) {
//       setSuggestions([]);
//       setShowSuggestions(false);
//       return;
//     }

//     clearTimeout(debounceRef.current);
//     debounceRef.current = setTimeout(async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get(
//           `${API_BASE_URL}/api/jobsheets/customers/search`,
//           { params: { q: value, type } },
//         );
//         setSuggestions(res.data || []);
//         setShowSuggestions((res.data || []).length > 0);
//       } catch (err) {
//         setSuggestions([]);
//         setShowSuggestions(false);
//       } finally {
//         setLoading(false);
//       }
//     }, 300);

//     return () => clearTimeout(debounceRef.current);
//   }, [value, type]);

//   const handleSelect = customer => {
//     Keyboard.dismiss();
//     userTypedRef.current = false;
//     setShowSuggestions(false);
//     setSuggestions([]);
//     onSelect(customer);
//   };

//   const handleTextChange = text => {
//     const val = type === 'contact' ? onlyNumbers(text) : text;
//     userTypedRef.current = true;
//     onChange(val);
//   };

//   const [isFocused, setIsFocused] = useState(false);

//   return (
//     <View style={styles.fieldWrapper}>
//       {label && (
//         <Text
//           style={[styles.inputLabel, { color: error ? COLORS.error : COLORS.gray700 }]}
//         >
//           {label}
//           {required && <Text style={{ color: COLORS.error }}> *</Text>}
//         </Text>
//       )}
//       <View
//         style={[
//           styles.inputWrapper,
//           {
//             borderColor: error
//               ? COLORS.error
//               : isFocused
//               ? COLORS.primary
//               : COLORS.gray200,
//           },
//         ]}
//       >
//         {Icon && <Icon size={18} color={COLORS.gray400} style={{ marginRight: 10 }} />}
//         <TextInput
//           style={styles.inputField}
//           value={value}
//           onChangeText={handleTextChange}
//           placeholder={placeholder}
//           placeholderTextColor={COLORS.gray400}
//           keyboardType={keyboardType || 'default'}
//           maxLength={maxLength}
//           autoComplete="off"
//           autoCorrect={false}
//           onFocus={() => setIsFocused(true)}
//           onBlur={() => {
//             setIsFocused(false);
//             setTimeout(() => setShowSuggestions(false), 200);
//           }}
//         />
//         {loading && <ActivityIndicator size="small" color={COLORS.gray400} />}
//       </View>
//       {error && <Text style={styles.errorText}>{error}</Text>}

//       {showSuggestions && suggestions.length > 0 && (
//         <View style={styles.suggestionsDropdown}>
//           <ScrollView
//             keyboardShouldPersistTaps="handled"
//             nestedScrollEnabled
//             style={{ maxHeight: 200 }}
//           >
//             {suggestions.map((item, idx) => (
//               <TouchableOpacity
//                 key={String(idx)}
//                 style={[
//                   styles.suggestionItem,
//                   idx < suggestions.length - 1 && {
//                     borderBottomWidth: 1,
//                     borderBottomColor: COLORS.gray100,
//                   },
//                 ]}
//                 onPress={() => handleSelect(item)}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.suggestionName}>{item.name}</Text>
//                 <Text style={styles.suggestionContact}>{item.contact}</Text>
//                 {!!item.address && (
//                   <Text style={styles.suggestionAddress}>{item.address}</Text>
//                 )}
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>
//       )}
//     </View>
//   );
// };

// // ─── Visual Inspection ────────────────────────────────────────────────────
// const VisualInspectionSection = ({
//   visualIssues,
//   setVisualIssues,
//   faultList,
//   customFaults,
//   setCustomFaults,
// }) => {
//   const addIssue = () => setVisualIssues([...visualIssues, '']);

//   const removeIssue = index => {
//     const newIssues = visualIssues.filter((_, i) => i !== index);
//     setVisualIssues(newIssues);
//     const newCustom = { ...customFaults };
//     delete newCustom[index];
//     setCustomFaults(newCustom);
//   };

//   const updateIssue = (index, value) => {
//     const newIssues = [...visualIssues];
//     newIssues[index] = value;
//     setVisualIssues(newIssues);
//   };

//   const handleSelectChange = (index, value) => {
//     if (value === '__custom') {
//       setCustomFaults({ ...customFaults, [index]: '' });
//       updateIssue(index, '');
//     } else {
//       const newCustom = { ...customFaults };
//       delete newCustom[index];
//       setCustomFaults(newCustom);
//       updateIssue(index, value);
//     }
//   };

//   return (
//     <View style={styles.section}>
//       <View style={styles.sectionHeader}>
//         <Eye size={18} color={COLORS.primary} />
//         <Text style={styles.sectionTitle}>Visual Inspection</Text>
//       </View>

//       {visualIssues.map((issue, index) => (
//         <View key={index} style={styles.visualRow}>
//           <View style={styles.visualSelectWrapper}>
//             <SelectModal
//               value={
//                 customFaults[index] !== undefined ? '__custom' : issue || ''
//               }
//               options={[
//                 ...faultList.map(f => ({ id: f.name, name: f.name })),
//                 { id: '__custom', name: 'Other (Add New)' },
//               ]}
//               onSelect={val => handleSelectChange(index, val)}
//               placeholder="Select Issue"
//               hideLabel
//               containerStyle={styles.visualSelect}
//             />
//             {customFaults[index] !== undefined && (
//               <TextInput
//                 style={styles.customFaultInput}
//                 placeholder="Enter Fault"
//                 value={customFaults[index]}
//                 onChangeText={text => {
//                   setCustomFaults({ ...customFaults, [index]: text });
//                   updateIssue(index, text);
//                 }}
//               />
//             )}
//           </View>
//           {visualIssues.length > 1 && (
//             <TouchableOpacity
//               onPress={() => removeIssue(index)}
//               style={styles.removeVisualButton}
//             >
//               <X size={18} color={COLORS.danger} />
//             </TouchableOpacity>
//           )}
//         </View>
//       ))}

//       <TouchableOpacity onPress={addIssue} style={styles.addVisualButton}>
//         <Plus size={16} color={COLORS.primary} />
//         <Text style={styles.addVisualText}>Add Issue</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// // ─── ID Proof Upload ──────────────────────────────────────────────────────
// const IDProofUpload = ({ value, onChange, idProofType }) => {
//   const [imageUri, setImageUri] = useState(null);

//   useEffect(() => {
//     if (value && typeof value === 'string' && value.startsWith('http')) {
//       setImageUri(value);
//     } else if (value && typeof value === 'object' && value.uri) {
//       setImageUri(value.uri);
//     }
//   }, [value]);

//   const isDisabled =
//     idProofType === 'ID Not Required' || idProofType === 'Dealer Collected';

//   const pickImage = () => {
//     if (isDisabled) {
//       Alert.alert(
//         'Not Allowed',
//         'ID proof upload is disabled for this selection',
//       );
//       return;
//     }
//     ImagePicker.launchImageLibrary(
//       { mediaType: 'photo', quality: 0.8, includeBase64: false },
//       response => {
//         if (response.didCancel) return;
//         if (response.error) {
//           Alert.alert('Error', response.errorMessage);
//           return;
//         }
//         if (response.assets && response.assets[0]) {
//           const asset = response.assets[0];
//           setImageUri(asset.uri);
//           onChange(asset);
//         }
//       },
//     );
//   };

//   return (
//     <View style={styles.fieldWrapper}>
//       <Text style={styles.inputLabel}>ID Proof Image</Text>
//       <TouchableOpacity
//         onPress={pickImage}
//         style={[
//           styles.idProofUploadBox,
//           isDisabled && styles.idProofUploadBoxDisabled,
//           imageUri && styles.idProofUploadBoxHasImage,
//         ]}
//         disabled={isDisabled}
//       >
//         {imageUri ? (
//           <Image source={{ uri: imageUri }} style={styles.idProofPreview} />
//         ) : (
//           <View style={styles.idProofPlaceholder}>
//             <Camera
//               size={28}
//               color={isDisabled ? COLORS.gray400 : COLORS.gray500}
//             />
//             <Text
//               style={[styles.idProofUploadText, isDisabled && styles.idProofUploadTextDisabled]}
//             >
//               {isDisabled ? 'Upload Disabled' : 'Tap to upload ID proof'}
//             </Text>
//           </View>
//         )}
//       </TouchableOpacity>
//       {imageUri && (
//         <TouchableOpacity
//           onPress={() => {
//             setImageUri(null);
//             onChange(null);
//           }}
//           style={styles.idProofRemoveButton}
//         >
//           <Text style={styles.idProofRemoveText}>Remove Image</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };

// // ─── Main Screen ──────────────────────────────────────────────────────────
// export default function JobSheetFormScreen() {
//   const dispatch = useDispatch();
//   const navigation = useNavigation();
//   const route = useRoute();
//   const toast = useToast();
//   const { user } = useAuth();
//   const { mode, jobId } = route.params || { mode: 'new' };

//   const { currentJob, loading: jobLoading } = useSelector(s => s.jobs);
//   const {
//     engineers,
//     makes,
//     models,
//     drawers,
//     salesReps = [],
//     faults = [],
//   } = useSelector(s => s.admin);

//   const [workloadMap, setWorkloadMap] = useState({});
//   const [visualIssues, setVisualIssues] = useState(['']);
//   const [customFaults, setCustomFaults] = useState({});
//   const [idProofImage, setIdProofImage] = useState(null);
//   const [idProofPreview, setIdProofPreview] = useState(null);
//   const [openRepairDate, setOpenRepairDate] = useState(false);
//   const [openDeliveryDate, setOpenDeliveryDate] = useState(false);
//   const [isConfirming, setIsConfirming] = useState(false);
//   const [showSearchModal, setShowSearchModal] = useState(false);
//   const [searchText, setSearchText] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [confirmModal, setConfirmModal] = useState({
//     visible: false,
//     action: null,
//     pendingValues: null,
//   });
//   const [engineerModalVisible, setEngineerModalVisible] = useState(false);

//   const [advancePopupVisible, setAdvancePopupVisible] = useState(false);
//   const [sparePopupVisible, setSparePopupVisible] = useState(false);
//   const [othersPopupVisible, setOthersPopupVisible] = useState(false);

//   const savedJobIdRef = useRef(jobId || null);
//   const isLoading = jobLoading;

//   // ─── Reset Function for New Job ──────────────────────────────────────────
//   const resetForm = () => {
//     setVisualIssues(['']);
//     setCustomFaults({});
//     setIdProofImage(null);
//     setIdProofPreview(null);
//     setSparePopupVisible(false);
//     setAdvancePopupVisible(false);
//     setOthersPopupVisible(false);
//     setConfirmModal({ visible: false, action: null, pendingValues: null });
//     setSearchText('');
//     setSearchResults([]);
//     setShowSearchModal(false);
//     dispatch(clearCurrentJob());
//     savedJobIdRef.current = null;
//   };

//   // ─── Fetch Data ──────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (mode === 'new') {
//       resetForm();
//     }

//     if (!engineers.length) dispatch(fetchEngineers());
//     if (!makes.length) dispatch(fetchMakes());
//     if (!models.length) dispatch(fetchModels());
//     if (!drawers.length) dispatch(fetchDrawers());
//     if (!salesReps.length) dispatch(fetchSalesReps());
//     if (!faults.length) dispatch(fetchFaults());

//     fetchWorkload();

//     if (mode === 'edit' && jobId) {
//       dispatch(fetchJobById(jobId));
//     }

//     return () => {
//       if (mode === 'edit') dispatch(clearCurrentJob());
//     };
//   }, [mode, jobId]);

//   const fetchWorkload = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/api/jobsheets/workload`);
//       const map = {};
//       if (Array.isArray(res.data)) {
//         res.data.forEach(e => {
//           map[e.name] = e.activeJobs;
//         });
//       }
//       setWorkloadMap(map);
//     } catch (err) {
//       console.error('Workload fetch error:', err);
//     }
//   };

//   // ─── Populate Edit Data ──────────────────────────────────────────────────
//   useEffect(() => {
//     if (mode === 'edit' && currentJob) {
//       const savedIssues = currentJob.visualIssues?.length
//         ? currentJob.visualIssues
//         : [''];
//       setVisualIssues(savedIssues);

//       const rebuilt = {};
//       savedIssues.forEach((issue, i) => {
//         if (
//           issue &&
//           !faults.some(f => f.name.toLowerCase() === issue.toLowerCase())
//         ) {
//           rebuilt[i] = issue;
//         }
//       });
//       setCustomFaults(rebuilt);

//       if (currentJob.idProofImage) {
//         setIdProofPreview(currentJob.idProofImage);
//       }
//     }
//   }, [currentJob, faults, mode]);

//   // ─── Initial Values ──────────────────────────────────────────────────────
//   const initialValues = useMemo(
//     () => ({
//       jobSheetNo: currentJob?.jobSheetNo || '',
//       customerName: currentJob?.customerName || '',
//       contact: currentJob?.contact || '',
//       altContact: currentJob?.altContact || '',
//       address: currentJob?.address || '',
//       email: currentJob?.email || '',
//       makeId: currentJob?.makeId || '',
//       modelId: currentJob?.modelId || '',
//       imei: currentJob?.imei || '',
//       warranty: currentJob?.warranty || 'No Warranty',
//       patternPin: currentJob?.patternPin || '',
//       idProof: currentJob?.idProof || '',
//       physicalConditions: currentJob?.physicalConditions || [],
//       accessoriesReceived: currentJob?.accessoriesReceived || [],
//       batteryNumber: currentJob?.batteryNumber || '',
//       engineerId: currentJob?.engineerId || '',
//       dealerName: currentJob?.dealerName || '',
//       drawerId: currentJob?.drawerId || '',
//       serviceRepId: currentJob?.serviceRepId || '',
//       serviceCharges: currentJob?.serviceCharges?.toString() || '',
//       spareCharges: currentJob?.spareCharges?.toString() || '',
//       estimateAmount: currentJob?.estimateAmount?.toString() || '',
//       advanceAmount: currentJob?.advanceAmount?.toString() || '',
//       advanceDate: currentJob?.advanceDate
//         ? new Date(currentJob.advanceDate)
//         : null,
//       advanceItems: currentJob?.advanceItems || [],
//       marginAmount: currentJob?.marginAmount?.toString() || '',
//       paymentMode: currentJob?.paymentMode || '',
//       repairDate: currentJob?.repairDate
//         ? new Date(currentJob.repairDate)
//         : new Date(),
//       deliveryDate: currentJob?.deliveredDate
//         ? new Date(currentJob.deliveredDate)
//         : null,
//       instaFollowers: currentJob?.instaFollowers || '',
//       googleReview: currentJob?.googleReview || '',
//       remarks: currentJob?.remarks || '',
//       spareItems: currentJob?.spareItems || [],
//       createdAt: currentJob?.createdAt || getCurrentDate(),
//       time: currentJob?.time || getCurrentTime(),
//       status: currentJob?.status || 'Received',
//       income: currentJob?.income?.toString() || '',
//       othersAmount: currentJob?.othersAmount?.toString() || '',
//       othersItems: currentJob?.othersItems || [],
//     }),
//     [currentJob],
//   );

//   // ─── Calculate Functions ─────────────────────────────────────────────────
//   const calculateEstimate = (setFieldValue, getValues) => {
//     const v = getValues();
//     const { estimate, margin } = calculateFinancials(
//       v.serviceCharges,
//       v.spareCharges,
//       v.spareItems
//     );
//     setFieldValue('estimateAmount', estimate.toString());
//     setFieldValue('marginAmount', margin.toString());
//     toast.show('Estimate calculated', { type: 'success' });
//   };

//   // ─── Search Function ─────────────────────────────────────────────────────
//   const handleSearch = async () => {
//     if (!searchText.trim()) {
//       toast.show('Please enter search term', { type: 'warning' });
//       return;
//     }
//     setSearchLoading(true);
//     try {
//       const trimmed = searchText.trim();
//       const isJobSheetNo =
//         /^JS-\d+$/i.test(trimmed) ||
//         (/^\d{1,4}$/.test(trimmed) && trimmed.length <= 4);

//       const res = await axios.get(`${API_BASE_URL}/api/jobsheets/filter`, {
//         params: { q: trimmed },
//       });

//       let filtered = res.data;
//       if (trimmed && isJobSheetNo && /^\d+$/.test(trimmed)) {
//         const padded = trimmed.padStart(3, '0');
//         const exact = `JS-${padded}`;
//         filtered = res.data.filter(js => js.jobSheetNo === exact);
//       }

//       setSearchResults(filtered);
//       setShowSearchModal(true);
//     } catch (err) {
//       console.error(err);
//       toast.show('Search failed', { type: 'danger' });
//     } finally {
//       setSearchLoading(false);
//     }
//   };

//   // ─── Save Functions ──────────────────────────────────────────────────────
//   const buildSubmitData = values => {
//     const { estimate, margin } = calculateFinancials(
//       values.serviceCharges,
//       values.spareCharges,
//       values.spareItems
//     );
    
//     const advanceTotal = calculateAdvanceTotal(values.advanceItems);
//     const advanceAmount = advanceTotal > 0 ? advanceTotal : (parseFloat(values.advanceAmount) || 0);
    
//     const othersTotal = (values.othersItems || []).reduce(
//       (sum, item) => sum + (parseFloat(item.amount) || 0),
//       0
//     );
    
//     return {
//       ...values,
//       serviceCharges: parseFloat(values.serviceCharges) || 0,
//       spareCharges: parseFloat(values.spareCharges) || 0,
//       estimateAmount: estimate,
//       marginAmount: margin,
//       advanceAmount: advanceAmount,
//       advanceDate: values.advanceDate ? values.advanceDate.toISOString() : null,
//       income: parseFloat(values.income) || 0,
//       othersAmount: othersTotal > 0 ? othersTotal : (parseFloat(values.othersAmount) || 0),
//       othersItems: values.othersItems || [],
//       spareItems: (values.spareItems || []).map(item => ({
//         name: item.name || '',
//         qty: parseInt(item.qty) || 0,
//         rate: parseFloat(item.rate) || 0,
//         amount: (parseInt(item.qty) || 0) * (parseFloat(item.rate) || 0),
//       })),
//       advanceItems: values.advanceItems || [],
//       visualIssues: visualIssues.filter(Boolean),
//       idProofImage: idProofImage,
//       time: getCurrentTime(),
//       physicalConditions: values.physicalConditions || [],
//       accessoriesReceived: values.accessoriesReceived || [],
//       instaFollowers: values.instaFollowers || '',
//       googleReview: values.googleReview || '',
//     };
//   };

//   const performSave = async values => {
//     if (!values.customerName || !values.contact) {
//       toast.show('Customer Name and Contact are required', { type: 'danger' });
//       return null;
//     }
//     if (values.contact.trim().length !== 10) {
//       toast.show('Contact must be exactly 10 digits', { type: 'danger' });
//       return null;
//     }
//     const submitData = buildSubmitData(values);
//     try {
//       let savedJob;
//       if (mode === 'edit') {
//         savedJob = await dispatch(
//           updateJob({ id: jobId, data: submitData }),
//         ).unwrap();
//         toast.show('Job updated successfully', { type: 'success' });
//       } else {
//         savedJob = await dispatch(createJob(submitData)).unwrap();
//         toast.show('Job created successfully', { type: 'success' });
//       }
//       const id = savedJob?.id || savedJob?._id || jobId;
//       savedJobIdRef.current = id;
//       return id;
//     } catch (error) {
//       const msg =
//         error.response?.data?.message || error.message || 'Failed to save job';
//       toast.show(msg, { type: 'danger' });
//       return null;
//     }
//   };

//   // ─── Action Handlers ─────────────────────────────────────────────────────
//   const requestSave = values => {
//     const missing = [];
//     if (!values.customerName?.trim()) missing.push('Customer Name');
//     if (!values.contact?.trim()) missing.push('Contact Number');

//     if (missing.length > 0) {
//       missing.forEach(field =>
//         toast.show(`${field} is required`, { type: 'danger' }),
//       );
//       return;
//     }
//     if (values.contact?.trim() && values.contact.trim().length !== 10) {
//       toast.show('Contact Number must be exactly 10 digits', {
//         type: 'danger',
//       });
//       return;
//     }
//     setConfirmModal({ visible: true, action: 'save', pendingValues: values });
//   };

//   const requestInvoice = values => {
//     if (!values.customerName?.trim() || !values.contact?.trim()) {
//       toast.show('Customer Name and Contact are required', { type: 'danger' });
//       return;
//     }
//     if (values.contact.trim().length !== 10) {
//       toast.show('Contact must be exactly 10 digits', { type: 'danger' });
//       return;
//     }
//     if (mode === 'edit' && savedJobIdRef.current) {
//       navigation.navigate('JobSheet', {
//         screen: 'InvoiceBill',
//         params: { id: savedJobIdRef.current },
//       });
//       return;
//     }
//     setConfirmModal({
//       visible: true,
//       action: 'invoice',
//       pendingValues: values,
//     });
//   };

//   const requestEstimate = values => {
//     if (!values.customerName?.trim() || !values.contact?.trim()) {
//       toast.show('Customer Name and Contact are required', { type: 'danger' });
//       return;
//     }
//     if (values.contact.trim().length !== 10) {
//       toast.show('Contact must be exactly 10 digits', { type: 'danger' });
//       return;
//     }
//     if (mode === 'edit' && savedJobIdRef.current) {
//       navigation.navigate('JobSheet', {
//         screen: 'EstimateBill',
//         params: { id: savedJobIdRef.current },
//       });
//       return;
//     }
//     setConfirmModal({
//       visible: true,
//       action: 'estimate',
//       pendingValues: values,
//     });
//   };

//   const closeConfirm = () => {
//     setIsConfirming(false);
//     setTimeout(() => {
//       setConfirmModal({ visible: false, action: null, pendingValues: null });
//     }, 50);
//   };

//   const handleConfirm = async () => {
//     const { action, pendingValues } = confirmModal;
//     if (!pendingValues) {
//       closeConfirm();
//       return;
//     }
//     setIsConfirming(true);

//     if (action === 'save') {
//       const savedId = await performSave(pendingValues);
//       setIsConfirming(false);
//       closeConfirm();
//       if (savedId) navigation.goBack();
//     } else if (action === 'invoice') {
//       const savedId = await performSave(pendingValues);
//       setIsConfirming(false);
//       closeConfirm();
//       if (savedId) {
//         navigation.navigate('JobSheet', {
//           screen: 'InvoiceBill',
//           params: { id: savedId },
//         });
//       }
//     } else if (action === 'estimate') {
//       const savedId = await performSave(pendingValues);
//       setIsConfirming(false);
//       closeConfirm();
//       if (savedId) {
//         navigation.navigate('JobSheet', {
//           screen: 'EstimateBill',
//           params: { id: savedId },
//         });
//       }
//     } else {
//       setIsConfirming(false);
//       closeConfirm();
//     }
//   };

//   // ─── Handle New Job Navigation ──────────────────────────────────────────
//   const handleNewJob = () => {
//     resetForm();
//     navigation.replace('JobSheetForm', { mode: 'new' });
//   };

//   // ─── Render ──────────────────────────────────────────────────────────────
//   return (
//     <KeyboardAwareScrollView
//       style={styles.container}
//       showsVerticalScrollIndicator={false}
//       contentContainerStyle={styles.contentContainer}
//     >
//       <Formik
//         initialValues={initialValues}
//         validationSchema={JobSheetSchema}
//         onSubmit={(values, { setSubmitting }) => {
//           requestSave(values);
//           setSubmitting(false);
//         }}
//         enableReinitialize
//       >
//         {({ values, setFieldValue, handleSubmit, errors, touched }) => {
//           const filteredModels = models.filter(m => m.makeId === values.makeId);
//           const buttonsDisabled = isConfirming;

//           return (
//             <>
//               <View style={styles.formContainer}>
//                 {/* ─── Job Sheet Header ──────────────────────────────────── */}
//                 <View style={styles.section}>
//                   <View style={styles.jobSheetHeader}>
//                     <View style={styles.jobSheetHeaderLeft}>
//                       <Text style={styles.jobSheetLabel}>Job Sheet No:</Text>
//                       <Text style={styles.jobSheetNo}>{values.jobSheetNo || 'New'}</Text>
//                     </View>
//                     <View style={styles.dateTimeContainer}>
//                       <View style={styles.dateTimeItem}>
//                         <Text style={styles.dateTimeText}>
//                           {values.createdAt || getCurrentDate()}
//                         </Text>
//                       </View>
//                       <View style={styles.dateTimeItem}>
//                         <Text style={styles.dateTimeText}>
//                           {values.time || getCurrentTime()}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>
//                 </View>

//                 {/* ─── Search Bar ───────────────────────────────────────── */}
//                 <View style={styles.searchSection}>
//                   <View style={styles.searchRow}>
//                     <Search size={18} color={COLORS.gray400} style={{ marginLeft: 12 }} />
//                     <TextInput
//                       style={styles.searchInput}
//                       placeholder="Search Job Sheet / IMEI / Contact / Name"
//                       placeholderTextColor={COLORS.gray400}
//                       value={searchText}
//                       onChangeText={setSearchText}
//                       onSubmitEditing={handleSearch}
//                     />
//                     <TouchableOpacity
//                       onPress={handleSearch}
//                       style={styles.searchButton}
//                       disabled={searchLoading}
//                     >
//                       {searchLoading ? (
//                         <ActivityIndicator size="small" color={COLORS.white} />
//                       ) : (
//                         <Text style={styles.searchButtonText}>Search</Text>
//                       )}
//                     </TouchableOpacity>
//                   </View>
//                 </View>

//                 {/* ─── Customer Details Card ────────────────────────────── */}
//                 <View style={styles.section}>
//                   <View style={styles.sectionHeader}>
//                     <User size={16} color={COLORS.primary} />
//                     <Text style={styles.sectionTitle}>Customer Details</Text>
//                   </View>

//                   <CustomerAutocomplete
//                     label="Customer Name"
//                     type="name"
//                     value={values.customerName}
//                     onChange={t => setFieldValue('customerName', t)}
//                     onSelect={customer => {
//                       setFieldValue('customerName', customer.name || '');
//                       setFieldValue('contact', customer.contact || '');
//                       setFieldValue('altContact', customer.altContact || '');
//                       setFieldValue('address', customer.address || '');
//                       setFieldValue('email', customer.email || '');
//                       setFieldValue(
//                         'instaFollowers',
//                         customer.instaFollowers === 'Already Done'
//                           ? 'Already Done'
//                           : '',
//                       );
//                       setFieldValue(
//                         'googleReview',
//                         customer.googleReview === 'Already Done'
//                           ? 'Already Done'
//                           : '',
//                       );
//                     }}
//                     placeholder="Customer Name"
//                     required
//                     error={touched.customerName && errors.customerName}
//                     icon={User}
//                   />

//                   <CustomerAutocomplete
//                     label="Contact No"
//                     type="contact"
//                     value={values.contact}
//                     onChange={t => setFieldValue('contact', t)}
//                     onSelect={customer => {
//                       setFieldValue('customerName', customer.name || '');
//                       setFieldValue('contact', customer.contact || '');
//                       setFieldValue('altContact', customer.altContact || '');
//                       setFieldValue('address', customer.address || '');
//                       setFieldValue('email', customer.email || '');
//                       setFieldValue(
//                         'instaFollowers',
//                         customer.instaFollowers === 'Already Done'
//                           ? 'Already Done'
//                           : '',
//                       );
//                       setFieldValue(
//                         'googleReview',
//                         customer.googleReview === 'Already Done'
//                           ? 'Already Done'
//                           : '',
//                       );
//                     }}
//                     placeholder="Contact No"
//                     keyboardType="phone-pad"
//                     maxLength={10}
//                     required
//                     error={touched.contact && errors.contact}
//                     icon={Phone}
//                   />

//                   <CustomerAutocomplete
//                     label="Alt Contact"
//                     type="contact"
//                     value={values.altContact}
//                     onChange={t => setFieldValue('altContact', t)}
//                     onSelect={customer => {
//                       if (customer.altContact) {
//                         setFieldValue('altContact', customer.altContact);
//                       }
//                     }}
//                     placeholder="Alt Contact"
//                     keyboardType="phone-pad"
//                     maxLength={10}
//                     icon={Phone}
//                   />

//                   <View style={styles.fieldWrapper}>
//                     <Text style={styles.inputLabel}>Customer Address</Text>
//                     <View style={[styles.inputWrapper, { minHeight: 44 }]}>
//                       <MapPin size={18} color={COLORS.gray400} style={{ marginRight: 10 }} />
//                       <TextInput
//                         style={[styles.inputField, { textAlignVertical: 'top' }]}
//                         value={values.address}
//                         onChangeText={t => setFieldValue('address', t)}
//                         multiline
//                         numberOfLines={2}
//                         placeholder="Customer Address"
//                         placeholderTextColor={COLORS.gray400}
//                       />
//                     </View>
//                   </View>

//                   <View style={styles.fieldWrapper}>
//                     <Text style={styles.inputLabel}>Email ID</Text>
//                     <View style={[styles.inputWrapper, { minHeight: 44 }]}>
//                       <Mail size={18} color={COLORS.gray400} style={{ marginRight: 10 }} />
//                       <TextInput
//                         style={styles.inputField}
//                         value={values.email}
//                         onChangeText={t => setFieldValue('email', t)}
//                         keyboardType="email-address"
//                         placeholder="Email ID"
//                         placeholderTextColor={COLORS.gray400}
//                       />
//                     </View>
//                     {touched.email && errors.email && (
//                       <Text style={styles.errorText}>{errors.email}</Text>
//                     )}
//                   </View>

//                   <SelectModal
//                     label="Select ID Proof"
//                     value={values.idProof}
//                     options={idProofOptions}
//                     onSelect={v => setFieldValue('idProof', v)}
//                     placeholder="Select ID Proof"
//                   />

//                   <IDProofUpload
//                     value={idProofPreview}
//                     onChange={file => {
//                       setIdProofImage(file);
//                       setIdProofPreview(file ? file.uri : null);
//                     }}
//                     idProofType={values.idProof}
//                   />
//                 </View>

//                 {/* ─── Device Details Card ──────────────────────────────── */}
//                 <View style={styles.section}>
//                   <View style={styles.sectionHeader}>
//                     <Smartphone size={16} color={COLORS.primary} />
//                     <Text style={styles.sectionTitle}>Device Details</Text>
//                   </View>

//                   <SelectModal
//                     label="Search Make"
//                     value={values.makeId}
//                     options={makes}
//                     onSelect={selectedId => {
//                       setFieldValue('makeId', selectedId);
//                       const selectedMake = makes.find(m => m.id === selectedId);
//                       setFieldValue('makeName', selectedMake?.name || '');
//                       setFieldValue('modelId', '');
//                       setFieldValue('modelName', '');
//                     }}
//                     placeholder="Search Make..."
//                   />

//                   <SelectModal
//                     label="Search Model"
//                     value={values.modelId}
//                     options={filteredModels}
//                     onSelect={selectedId => {
//                       setFieldValue('modelId', selectedId);
//                       const selectedModel = filteredModels.find(
//                         m => m.id === selectedId,
//                       );
//                       setFieldValue('modelName', selectedModel?.name || '');
//                     }}
//                     placeholder="Search Model..."
//                   />

//                   <View style={styles.fieldWrapper}>
//                     <Text style={styles.inputLabel}>IMEI *</Text>
//                     <View style={[styles.inputWrapper, { minHeight: 44 }]}>
//                       <Hash size={18} color={COLORS.gray400} style={{ marginRight: 10 }} />
//                       <TextInput
//                         style={styles.inputField}
//                         value={values.imei}
//                         onChangeText={t => setFieldValue('imei', t)}
//                         keyboardType="numeric"
//                         maxLength={15}
//                         placeholder="IMEI"
//                         placeholderTextColor={COLORS.gray400}
//                       />
//                     </View>
//                   </View>

//                   <View style={styles.row2}>
//                     <View style={[styles.fieldWrapper, { flex: 1, marginRight: 4 }]}>
//                       <Text style={styles.inputLabel}>Status</Text>
//                       <SelectModal
//                         value={values.status}
//                         options={statusOptions}
//                         onSelect={v => setFieldValue('status', v)}
//                         placeholder="Received"
//                         hideLabel
//                         containerStyle={{ marginBottom: 0 }}
//                       />
//                     </View>
//                     <View style={[styles.fieldWrapper, { flex: 1, marginLeft: 4 }]}>
//                       <Text style={styles.inputLabel}>Warranty</Text>
//                       <SelectModal
//                         value={values.warranty}
//                         options={warrantyOptions}
//                         onSelect={v => setFieldValue('warranty', v)}
//                         placeholder="No Warranty"
//                         hideLabel
//                         containerStyle={{ marginBottom: 0 }}
//                       />
//                     </View>
//                   </View>

//                   <View style={styles.fieldWrapper}>
//                     <Text style={styles.inputLabel}>Pattern / PIN</Text>
//                     <View style={[styles.inputWrapper, { minHeight: 44 }]}>
//                       <Shield size={18} color={COLORS.gray400} style={{ marginRight: 10 }} />
//                       <TextInput
//                         style={styles.inputField}
//                         value={values.patternPin}
//                         onChangeText={t => setFieldValue('patternPin', t)}
//                         placeholder="Pattern / PIN"
//                         placeholderTextColor={COLORS.gray400}
//                       />
//                     </View>
//                   </View>
//                 </View>

//                 {/* ─── Service / Repair Details ─────────────────────────── */}
//                 <View style={styles.section}>
//                   <View style={styles.sectionHeader}>
//                     <Wrench size={16} color={COLORS.primary} />
//                     <Text style={styles.sectionTitle}>Service / Repair Details</Text>
//                   </View>

//                   {/* Engineer - Full Width */}
//                   <View style={styles.fieldWrapper}>
//                     <Text style={styles.inputLabel}>Select Engineer</Text>
//                     <TouchableOpacity
//                       style={styles.engineerTrigger}
//                       onPress={() => setEngineerModalVisible(true)}
//                       activeOpacity={0.7}
//                     >
//                       {values.engineerId ? (
//                         <View style={styles.engineerTriggerContent}>
//                           <View>
//                             <Text style={styles.engineerTriggerName}>
//                               {engineers.find(e => e.id === values.engineerId)?.name || 'Select Engineer'}
//                             </Text>
//                             <View style={styles.engineerTriggerBadge}>
//                               <CheckCircle size={12} color="#16a34a" />
//                               <Text style={styles.engineerTriggerBadgeText}>
//                                 {(() => {
//                                   const eng = engineers.find(e => e.id === values.engineerId);
//                                   if (eng) {
//                                     const count = workloadMap[eng.name] || 0;
//                                     return `${count}/5 jobs – ${5 - count} slots free`;
//                                   }
//                                   return 'Available';
//                                 })()}
//                               </Text>
//                             </View>
//                           </View>
//                           <ChevronDown size={18} color={COLORS.gray400} />
//                         </View>
//                       ) : (
//                         <View style={styles.engineerTriggerPlaceholder}>
//                           <Text style={styles.engineerTriggerPlaceholderText}>Select Engineer</Text>
//                           <ChevronDown size={18} color={COLORS.gray400} />
//                         </View>
//                       )}
//                     </TouchableOpacity>
//                   </View>

//                   {/* Dealer Name - Full Width */}
//                   <View style={styles.fieldWrapper}>
//                     <Text style={styles.inputLabel}>Dealer Name</Text>
//                     <View style={[styles.inputWrapper, { minHeight: 44 }]}>
//                       <Tag size={18} color={COLORS.gray400} style={{ marginRight: 10 }} />
//                       <TextInput
//                         style={styles.inputField}
//                         value={values.dealerName}
//                         onChangeText={t => setFieldValue('dealerName', t)}
//                         placeholder="Dealer Name"
//                         placeholderTextColor={COLORS.gray400}
//                       />
//                     </View>
//                   </View>

//                   {/* Select Drawer - Full Width */}
//                   <SelectModal
//                     label="Select Drawer"
//                     value={values.drawerId}
//                     options={drawers}
//                     onSelect={v => setFieldValue('drawerId', v)}
//                     placeholder="Select Drawer"
//                   />

//                   {/* Service Rep - Full Width */}
//                   <SelectModal
//                     label="Service Rep"
//                     value={values.serviceRepId}
//                     options={salesReps}
//                     onSelect={v => setFieldValue('serviceRepId', v)}
//                     placeholder="Service Rep"
//                   />

//                   {/* Two Column: Income & Service Charges */}
//                   <View style={styles.row2}>
//                     <View style={[styles.fieldWrapper, { flex: 1, marginRight: 4 }]}>
//                       <Text style={styles.inputLabel}>Income</Text>
//                       <View style={[styles.inputWrapper, { minHeight: 44 }]}>
//                         <DollarSign size={18} color={COLORS.gray400} style={{ marginRight: 10 }} />
//                         <TextInput
//                           style={styles.inputField}
//                           value={values.income}
//                           onChangeText={t => {
//                             const val = onlyNumbers(t);
//                             setFieldValue('income', val);
//                           }}
//                           keyboardType="numeric"
//                           placeholder="Income"
//                           placeholderTextColor={COLORS.gray400}
//                         />
//                       </View>
//                     </View>
//                     <View style={[styles.fieldWrapper, { flex: 1, marginLeft: 4 }]}>
//                       <Text style={styles.inputLabel}>Service Charges</Text>
//                       <View style={[styles.inputWrapper, { minHeight: 44 }]}>
//                         <DollarSign size={18} color={COLORS.gray400} style={{ marginRight: 10 }} />
//                         <TextInput
//                           style={styles.inputField}
//                           value={values.serviceCharges}
//                           onChangeText={t => {
//                             const val = onlyNumbers(t);
//                             setFieldValue('serviceCharges', val);
//                             const { estimate, margin } = calculateFinancials(
//                               val,
//                               values.spareCharges,
//                               values.spareItems
//                             );
//                             setFieldValue('estimateAmount', estimate.toString());
//                             setFieldValue('marginAmount', margin.toString());
//                           }}
//                           keyboardType="numeric"
//                           placeholder="Service Charges"
//                           placeholderTextColor={COLORS.gray400}
//                         />
//                       </View>
//                     </View>
//                   </View>

//                   {/* Three Column: Spare Charges, Others, Adv. Amount */}
//                   <View style={styles.row3}>
//                     <View style={[styles.fieldWrapper, { flex: 1, marginRight: 4 }]}>
//                       <Text style={styles.inputLabel}>Spare Charges</Text>
//                       <TouchableOpacity
//                         style={styles.clickableInput}
//                         onPress={() => setSparePopupVisible(true)}
//                         activeOpacity={0.7}
//                       >
//                         <View style={styles.clickableInputLeft}>
//                           <Package size={16} color={COLORS.gray400} />
//                           <Text style={styles.clickableInputText}>₹ {values.spareCharges || 0}</Text>
//                         </View>
//                         <ChevronDown size={16} color={COLORS.gray400} />
//                       </TouchableOpacity>
//                     </View>
//                     <View style={[styles.fieldWrapper, { flex: 1, marginHorizontal: 4 }]}>
//                       <Text style={styles.inputLabel}>Others</Text>
//                       <TouchableOpacity
//                         style={styles.clickableInput}
//                         onPress={() => setOthersPopupVisible(true)}
//                         activeOpacity={0.7}
//                       >
//                         <View style={styles.clickableInputLeft}>
//                           <DollarSign size={16} color={COLORS.gray400} />
//                           <Text style={styles.clickableInputText}>₹ {values.othersAmount || 0}</Text>
//                         </View>
//                         <ChevronDown size={16} color={COLORS.gray400} />
//                       </TouchableOpacity>
//                     </View>
//                     <View style={[styles.fieldWrapper, { flex: 1, marginLeft: 4 }]}>
//                       <Text style={styles.inputLabel}>Adv. Amount</Text>
//                       <TouchableOpacity
//                         style={styles.clickableInput}
//                         onPress={() => setAdvancePopupVisible(true)}
//                         activeOpacity={0.7}
//                       >
//                         <View style={styles.clickableInputLeft}>
//                           <Wallet size={16} color={COLORS.gray400} />
//                           <Text style={styles.clickableInputText}>₹ {values.advanceAmount || 0}</Text>
//                         </View>
//                         <ChevronDown size={16} color={COLORS.gray400} />
//                       </TouchableOpacity>
//                     </View>
//                   </View>

//                   {/* Three Column: Payment Mode, Insta Follow, Google Review */}
//                   <View style={styles.row3}>
//                     <View style={[styles.fieldWrapper, { flex: 1, marginRight: 4 }]}>
//                       <SelectModal
//                         label="Payment Mode"
//                         value={values.paymentMode}
//                         options={paymentOptions}
//                         onSelect={v => setFieldValue('paymentMode', v)}
//                         placeholder="Payment Mode"
//                       />
//                     </View>
//                     <View style={[styles.fieldWrapper, { flex: 1, marginHorizontal: 4 }]}>
//                       <SelectModal
//                         label="Insta Follow"
//                         value={values.instaFollowers}
//                         options={instaFollowOptions}
//                         onSelect={v => setFieldValue('instaFollowers', v)}
//                         placeholder="Insta Follow"
//                       />
//                     </View>
//                     <View style={[styles.fieldWrapper, { flex: 1, marginLeft: 4 }]}>
//                       <SelectModal
//                         label="Google Review"
//                         value={values.googleReview}
//                         options={googleReviewOptions}
//                         onSelect={v => setFieldValue('googleReview', v)}
//                         placeholder="Google Review"
//                       />
//                     </View>
//                   </View>

//                   {/* Two Column: Repair Date & Delivery Date */}
//                   <View style={styles.row2}>
//                     <View style={[styles.fieldWrapper, { flex: 1, marginRight: 4 }]}>
//                       <Text style={styles.inputLabel}>Repair Date</Text>
//                       <TouchableOpacity
//                         onPress={() => setOpenRepairDate(true)}
//                         style={styles.dateButton}
//                       >
//                         <Calendar size={16} color={COLORS.gray600} />
//                         <Text style={styles.dateText}>
//                           {values.repairDate?.toLocaleDateString('en-IN') || 'Select Date'}
//                         </Text>
//                       </TouchableOpacity>
//                       <DatePicker
//                         modal
//                         open={openRepairDate}
//                         date={values.repairDate || new Date()}
//                         onConfirm={date => {
//                           setOpenRepairDate(false);
//                           setFieldValue('repairDate', date);
//                         }}
//                         onCancel={() => setOpenRepairDate(false)}
//                       />
//                     </View>
//                     <View style={[styles.fieldWrapper, { flex: 1, marginLeft: 4 }]}>
//                       <Text style={styles.inputLabel}>Delivery Date</Text>
//                       <TouchableOpacity
//                         onPress={() => setOpenDeliveryDate(true)}
//                         style={styles.dateButton}
//                       >
//                         <Calendar size={16} color={COLORS.gray600} />
//                         <Text style={styles.dateText}>
//                           {values.deliveryDate
//                             ? values.deliveryDate.toLocaleDateString('en-IN')
//                             : 'Select Date'}
//                         </Text>
//                       </TouchableOpacity>
//                       <DatePicker
//                         modal
//                         open={openDeliveryDate}
//                         date={values.deliveryDate || new Date()}
//                         onConfirm={date => {
//                           setOpenDeliveryDate(false);
//                           setFieldValue('deliveryDate', date);
//                         }}
//                         onCancel={() => setOpenDeliveryDate(false)}
//                       />
//                     </View>
//                   </View>

//                   {/* Remarks - Full Width */}
//                   <View style={styles.fieldWrapper}>
//                     <Text style={styles.inputLabel}>Remarks</Text>
//                     <View style={[styles.inputWrapper, { minHeight: 44 }]}>
//                       <TextInput
//                         style={[styles.inputField, { textAlignVertical: 'top' }]}
//                         value={values.remarks}
//                         onChangeText={t => setFieldValue('remarks', t)}
//                         multiline
//                         numberOfLines={2}
//                         placeholder="Remarks"
//                         placeholderTextColor={COLORS.gray400}
//                       />
//                     </View>
//                   </View>

//                   {/* ─── Financial Summary ───────────────────────────────── */}
//                   <View style={styles.financialSummary}>
//                     <View style={styles.financialRow}>
//                       <View style={styles.financialItem}>
//                         <Text style={styles.financialLabel}>Service Charge</Text>
//                         <Text style={styles.financialValue}>₹{values.serviceCharges || 0}</Text>
//                       </View>
//                       <View style={styles.financialItem}>
//                         <Text style={styles.financialLabel}>Spare Charges</Text>
//                         <Text style={styles.financialValue}>₹{values.spareCharges || 0}</Text>
//                       </View>
//                       <View style={styles.financialItem}>
//                         <Text style={styles.financialLabel}>Estimate</Text>
//                         <Text style={[styles.financialValue, styles.financialValueTotal]}>
//                           ₹{values.estimateAmount || 0}
//                         </Text>
//                       </View>
//                     </View>
                    
//                     <View style={[styles.financialRow, styles.financialTotal]}>
//                       <View style={styles.financialItem}>
//                         <Text style={styles.financialLabel}>Advance</Text>
//                         <Text style={styles.financialValue}>₹{values.advanceAmount || 0}</Text>
//                       </View>
//                       <View style={styles.financialItem}>
//                         <Text style={styles.financialLabel}>Margin</Text>
//                         <Text style={[styles.financialValue, styles.financialValueMargin]}>
//                           ₹{values.marginAmount || 0}
//                         </Text>
//                       </View>
//                       <View style={styles.financialItem}>
//                         <Text style={styles.financialLabel}>Pending</Text>
//                         <Text style={[styles.financialValue, styles.financialValuePending]}>
//                           ₹{Math.max(0, (parseFloat(values.estimateAmount) || 0) - (parseFloat(values.advanceAmount) || 0))}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>

//                   <Button
//                     title="Calculate Estimate"
//                     onPress={() =>
//                       calculateEstimate(setFieldValue, () => values)
//                     }
//                     variant="secondary"
//                     style={styles.calcButton}
//                     icon={Calculator}
//                   />

//                   {/* ─── Spare Parts Preview ────────────────────────────── */}
//                   {(values.spareItems || []).length > 0 && (
//                     <View style={styles.previewItemsContainer}>
//                       <Text style={styles.previewItemsTitle}>
//                         Spare Items ({values.spareItems.length})
//                       </Text>
//                       {(values.spareItems || []).slice(0, 3).map((item, idx) => (
//                         <Text key={idx} style={styles.previewItemsItem}>
//                           {item.name} × {item.qty} = ₹{(item.qty * item.rate).toFixed(0)}
//                         </Text>
//                       ))}
//                       {(values.spareItems || []).length > 3 && (
//                         <Text style={styles.previewItemsMore}>
//                           + {values.spareItems.length - 3} more items
//                         </Text>
//                       )}
//                     </View>
//                   )}

//                   {/* ─── Advance Payments Preview ───────────────────────── */}
//                   {(values.advanceItems || []).length > 0 && (
//                     <View style={styles.previewItemsContainer}>
//                       <Text style={styles.previewItemsTitle}>
//                         Advance Payments ({values.advanceItems.length})
//                       </Text>
//                       {(values.advanceItems || []).slice(0, 3).map((item, idx) => (
//                         <Text key={idx} style={styles.previewItemsItem}>
//                           {item.label || `Payment ${idx + 1}`}: ₹{item.amount}
//                           {item.date ? ` (${new Date(item.date).toLocaleDateString('en-IN')})` : ''}
//                         </Text>
//                       ))}
//                       {(values.advanceItems || []).length > 3 && (
//                         <Text style={styles.previewItemsMore}>
//                           + {values.advanceItems.length - 3} more payments
//                         </Text>
//                       )}
//                     </View>
//                   )}
//                 </View>

//                 {/* ─── Physical Condition ───────────────────────────────── */}
//                 <View style={styles.section}>
//                   <View style={styles.sectionHeader}>
//                     <Shield size={16} color={COLORS.primary} />
//                     <Text style={styles.sectionTitle}>Physical Condition</Text>
//                   </View>
//                   <View style={styles.checkboxGrid}>
//                     {physicalOptions.map(opt => (
//                       <CheckboxItem
//                         key={opt}
//                         label={opt}
//                         checked={values.physicalConditions?.includes(opt)}
//                         onToggle={() => {
//                           const exists =
//                             values.physicalConditions?.includes(opt);
//                           setFieldValue(
//                             'physicalConditions',
//                             exists
//                               ? values.physicalConditions.filter(i => i !== opt)
//                               : [...(values.physicalConditions || []), opt],
//                           );
//                         }}
//                         containerStyle={styles.checkboxItem}
//                       />
//                     ))}
//                   </View>
//                 </View>

//                 {/* ─── Accessories Received ─────────────────────────────── */}
//                 <View style={styles.section}>
//                   <View style={styles.sectionHeader}>
//                     <Tag size={16} color={COLORS.primary} />
//                     <Text style={styles.sectionTitle}>Accessories Received</Text>
//                   </View>
//                   <View style={styles.checkboxGrid}>
//                     {accessoryOptions.map(opt => (
//                       <CheckboxItem
//                         key={opt}
//                         label={opt}
//                         checked={values.accessoriesReceived?.includes(opt)}
//                         onToggle={() => {
//                           const exists =
//                             values.accessoriesReceived?.includes(opt);
//                           setFieldValue(
//                             'accessoriesReceived',
//                             exists
//                               ? values.accessoriesReceived.filter(
//                                   i => i !== opt,
//                                 )
//                               : [...(values.accessoriesReceived || []), opt],
//                           );
//                         }}
//                         containerStyle={styles.checkboxItem}
//                       />
//                     ))}
//                   </View>
//                   <View style={styles.fieldWrapper}>
//                     <Text style={styles.inputLabel}>Battery Number</Text>
//                     <View style={[styles.inputWrapper, { minHeight: 44 }]}>
//                       <TextInput
//                         style={styles.inputField}
//                         value={values.batteryNumber}
//                         onChangeText={t => setFieldValue('batteryNumber', t)}
//                         placeholder="Battery Number"
//                         placeholderTextColor={COLORS.gray400}
//                       />
//                     </View>
//                   </View>
//                 </View>

//                 {/* ─── Visual Inspection ────────────────────────────────── */}
//                 <VisualInspectionSection
//                   visualIssues={visualIssues}
//                   setVisualIssues={setVisualIssues}
//                   faultList={faults}
//                   customFaults={customFaults}
//                   setCustomFaults={setCustomFaults}
//                 />

//                 {/* ─── Action Buttons ───────────────────────────────────── */}
//                 <View style={styles.actionContainer}>
//                   <TouchableOpacity
//                     style={[
//                       styles.saveButtonPrimary,
//                       buttonsDisabled && { opacity: 0.6 },
//                     ]}
//                     onPress={handleSubmit}
//                     disabled={buttonsDisabled}
//                     activeOpacity={0.8}
//                   >
//                     <Save size={20} color={COLORS.white} />
//                     <Text style={styles.saveButtonText}>
//                       {buttonsDisabled
//                         ? 'Saving...'
//                         : mode === 'edit'
//                         ? 'Update Job Sheet'
//                         : 'Save Job Sheet'}
//                     </Text>
//                   </TouchableOpacity>

//                   <View style={styles.secondaryActions}>
//                     <TouchableOpacity
//                       style={styles.secondaryButton}
//                       onPress={() =>
//                         navigation.replace('JobSheetForm', { mode, jobId })
//                       }
//                       disabled={buttonsDisabled}
//                     >
//                       <RefreshCw size={18} color={COLORS.gray700} />
//                       <Text style={styles.secondaryButtonText}>Refresh</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                       style={styles.secondaryButton}
//                       onPress={() =>
//                         calculateEstimate(setFieldValue, () => values)
//                       }
//                       disabled={buttonsDisabled}
//                     >
//                       <Calculator size={18} color={COLORS.gray700} />
//                       <Text style={styles.secondaryButtonText}>Calculate</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                       style={[
//                         styles.secondaryButton,
//                         styles.estimateBtn,
//                         buttonsDisabled && { opacity: 0.6 },
//                       ]}
//                       onPress={() => requestEstimate(values)}
//                       disabled={buttonsDisabled}
//                     >
//                       <FileText size={18} color="#F59E0B" />
//                       <Text
//                         style={[
//                           styles.secondaryButtonText,
//                           { color: '#F59E0B' },
//                         ]}
//                       >
//                         Estimate
//                       </Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                       style={[
//                         styles.secondaryButton,
//                         styles.invoiceBtn,
//                         buttonsDisabled && { opacity: 0.6 },
//                       ]}
//                       onPress={() => requestInvoice(values)}
//                       disabled={buttonsDisabled}
//                     >
//                       <Receipt size={18} color={COLORS.primary} />
//                       <Text
//                         style={[
//                           styles.secondaryButtonText,
//                           { color: COLORS.primary },
//                         ]}
//                       >
//                         Invoice
//                       </Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                       style={[styles.secondaryButton, styles.newJobBtn]}
//                       onPress={handleNewJob}
//                       disabled={buttonsDisabled}
//                     >
//                       <Plus size={18} color={COLORS.primary} />
//                       <Text style={[styles.secondaryButtonText, { color: COLORS.primary }]}>
//                         New Job
//                       </Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                       style={styles.secondaryButton}
//                       onPress={() => navigation.navigate('Home')}
//                       disabled={buttonsDisabled}
//                     >
//                       <Home size={18} color={COLORS.gray700} />
//                       <Text style={styles.secondaryButtonText}>Home</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               </View>

//               {/* ─── Engineer Selection Modal ──────────────────────────────── */}
//               <Modal
//                 visible={engineerModalVisible}
//                 transparent
//                 animationType="slide"
//                 onRequestClose={() => setEngineerModalVisible(false)}
//               >
//                 <View style={styles.engineerModalOverlay}>
//                   <View style={styles.engineerModalContent}>
//                     <View style={styles.engineerModalHeader}>
//                       <Text style={styles.engineerModalTitle}>Select Engineer</Text>
//                       <TouchableOpacity
//                         onPress={() => setEngineerModalVisible(false)}
//                         hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//                       >
//                         <X size={24} color={COLORS.gray600} />
//                       </TouchableOpacity>
//                     </View>

//                     <ScrollView style={styles.engineerModalList}>
//                       {engineers.map(engineer => {
//                         const count = workloadMap[engineer.name] || 0;
//                         const free = MAX_JOBS - count;
//                         const isSelected = engineer.id === values.engineerId;
//                         const isFull = count >= MAX_JOBS;

//                         let statusColor = '#16a34a';
//                         let statusText = `${count}/5 jobs – ${free} slots free`;
//                         let bgColor = '#dcfce7';
//                         if (isFull) {
//                           statusColor = '#dc2626';
//                           statusText = 'Full capacity';
//                           bgColor = '#fee2e2';
//                         } else if (count >= 4) {
//                           statusColor = '#d97706';
//                           bgColor = '#fef3c7';
//                         }

//                         return (
//                           <TouchableOpacity
//                             key={engineer.id}
//                             style={[
//                               styles.engineerModalItem,
//                               isSelected && styles.engineerModalItemSelected,
//                               isFull && styles.engineerModalItemDisabled,
//                             ]}
//                             onPress={() => {
//                               if (!isFull) {
//                                 setFieldValue('engineerId', engineer.id);
//                                 setEngineerModalVisible(false);
//                               }
//                             }}
//                             disabled={isFull}
//                             activeOpacity={isFull ? 1 : 0.7}
//                           >
//                             <View style={styles.engineerModalItemLeft}>
//                               <Text style={[
//                                 styles.engineerModalItemName,
//                                 isSelected && styles.engineerModalItemNameSelected,
//                                 isFull && styles.engineerModalItemNameDisabled,
//                               ]}>
//                                 {engineer.name}
//                               </Text>
//                               <View style={[styles.engineerModalItemStatus, { backgroundColor: bgColor }]}>
//                                 {isFull ? (
//                                   <XCircle size={12} color="#dc2626" />
//                                 ) : (
//                                   <CheckCircle size={12} color="#16a34a" />
//                                 )}
//                                 <Text style={[styles.engineerModalItemStatusText, { color: statusColor }]}>
//                                   {statusText}
//                                 </Text>
//                               </View>
//                             </View>
//                             {isSelected && (
//                               <CheckCircle size={20} color={COLORS.primary} />
//                             )}
//                           </TouchableOpacity>
//                         );
//                       })}
//                     </ScrollView>
//                   </View>
//                 </View>
//               </Modal>

//               {/* ─── Popups ──────────────────────────────────────────────── */}
//               <SparePopup
//                 visible={sparePopupVisible}
//                 onClose={() => setSparePopupVisible(false)}
//                 setSpareCharge={charge => {
//                   setFieldValue('spareCharges', charge);
//                   const { estimate, margin } = calculateFinancials(
//                     values.serviceCharges,
//                     charge,
//                     values.spareItems
//                   );
//                   setFieldValue('estimateAmount', estimate.toString());
//                   setFieldValue('marginAmount', margin.toString());
//                 }}
//                 setSpareItems={items => {
//                   setFieldValue('spareItems', items);
//                   const itemsTotal = (items || []).reduce(
//                     (sum, item) => sum + (parseInt(item.qty) || 0) * (parseFloat(item.rate) || 0),
//                     0
//                   );
//                   setFieldValue('spareCharges', itemsTotal.toString());
//                   const { estimate, margin } = calculateFinancials(
//                     values.serviceCharges,
//                     itemsTotal,
//                     items
//                   );
//                   setFieldValue('estimateAmount', estimate.toString());
//                   setFieldValue('marginAmount', margin.toString());
//                 }}
//                 existingItems={values.spareItems || []}
//               />

//               <AdvancePopup
//                 visible={advancePopupVisible}
//                 onClose={() => setAdvancePopupVisible(false)}
//                 setAdvanceAmount={amount => {
//                   setFieldValue('advanceAmount', amount);
//                 }}
//                 setAdvanceItems={items => {
//                   setFieldValue('advanceItems', items);
//                   const total = (items || []).reduce(
//                     (sum, item) => sum + (parseFloat(item.amount) || 0),
//                     0
//                   );
//                   setFieldValue('advanceAmount', total.toString());
//                 }}
//                 existingItems={values.advanceItems || []}
//               />

//               <OthersPopup
//                 visible={othersPopupVisible}
//                 onClose={() => setOthersPopupVisible(false)}
//                 setOthersAmount={amount => {
//                   setFieldValue('othersAmount', amount);
//                 }}
//                 setOthersItems={items => {
//                   setFieldValue('othersItems', items);
//                   const total = (items || []).reduce(
//                     (sum, item) => sum + (parseFloat(item.amount) || 0),
//                     0
//                   );
//                   setFieldValue('othersAmount', total.toString());
//                 }}
//                 existingItems={values.othersItems || []}
//               />

//               {/* ─── Search Results Modal ─────────────────────────────────── */}
//               <Modal
//                 visible={showSearchModal}
//                 transparent
//                 animationType="slide"
//                 onRequestClose={() => setShowSearchModal(false)}
//               >
//                 <View style={styles.modalOverlay}>
//                   <View style={styles.modalContent}>
//                     <View style={styles.modalHeader}>
//                       <Text style={styles.modalTitle}>Search Results</Text>
//                       <TouchableOpacity onPress={() => setShowSearchModal(false)}>
//                         <X size={24} color={COLORS.gray600} />
//                       </TouchableOpacity>
//                     </View>
//                     <ScrollView style={styles.modalBody}>
//                       {searchResults.length === 0 ? (
//                         <Text style={styles.noResults}>No results found</Text>
//                       ) : (
//                         searchResults.map((job, index) => (
//                           <TouchableOpacity
//                             key={job._id || index}
//                             style={styles.searchResultItem}
//                             onPress={() => {
//                               setShowSearchModal(false);
//                               navigation.navigate('JobSheet', {
//                                 screen: 'JobDetail',
//                                 params: { jobId: job._id },
//                               });
//                             }}
//                           >
//                             <Text style={styles.resultJobNo}>{job.jobSheetNo}</Text>
//                             <Text style={styles.resultCustomer}>
//                               {job.customer?.name || 'Unknown'}
//                             </Text>
//                             <Text style={styles.resultStatus}>
//                               {job.device?.mobileStatus || 'Unknown'}
//                             </Text>
//                           </TouchableOpacity>
//                         ))
//                       )}
//                     </ScrollView>
//                   </View>
//                 </View>
//               </Modal>

//               {/* ─── Preview Confirm Modal ────────────────────────────────── */}
//               <Modal
//                 visible={confirmModal.visible && confirmModal.action === 'save'}
//                 transparent
//                 animationType="slide"
//                 onRequestClose={closeConfirm}
//               >
//                 <View style={styles.previewOverlay}>
//                   <View style={styles.previewCard}>
//                     <View style={styles.previewHeader}>
//                       <CheckCircle size={22} color={COLORS.primary} />
//                       <Text style={styles.previewTitle}>
//                         {mode === 'edit' ? 'Review & Update' : 'Review & Save'}
//                       </Text>
//                     </View>
//                     <Text style={styles.previewSubTitle}>
//                       Please review the details before saving
//                     </Text>

//                     <ScrollView
//                       style={styles.previewScroll}
//                       showsVerticalScrollIndicator={false}
//                     >
//                       <View style={styles.previewSection}>
//                         <Text style={styles.previewSectionTitle}>Customer Details</Text>
//                         <View style={styles.previewRow}>
//                           <Text style={styles.previewLabel}>Name</Text>
//                           <Text style={styles.previewValue}>
//                             {confirmModal.pendingValues?.customerName || '—'}
//                           </Text>
//                         </View>
//                         <View style={styles.previewRow}>
//                           <Text style={styles.previewLabel}>Contact</Text>
//                           <Text style={styles.previewValue}>
//                             {confirmModal.pendingValues?.contact || '—'}
//                           </Text>
//                         </View>
//                         <View style={styles.previewRow}>
//                           <Text style={styles.previewLabel}>Address</Text>
//                           <Text style={styles.previewValue}>
//                             {confirmModal.pendingValues?.address || '—'}
//                           </Text>
//                         </View>
//                       </View>

//                       <View style={styles.previewSection}>
//                         <Text style={styles.previewSectionTitle}>Device Details</Text>
//                         <View style={styles.previewRow}>
//                           <Text style={styles.previewLabel}>Make</Text>
//                           <Text style={styles.previewValue}>
//                             {makes.find(m => m.id === confirmModal.pendingValues?.makeId)?.name || '—'}
//                           </Text>
//                         </View>
//                         <View style={styles.previewRow}>
//                           <Text style={styles.previewLabel}>Model</Text>
//                           <Text style={styles.previewValue}>
//                             {models.find(m => m.id === confirmModal.pendingValues?.modelId)?.name || '—'}
//                           </Text>
//                         </View>
//                         <View style={styles.previewRow}>
//                           <Text style={styles.previewLabel}>IMEI</Text>
//                           <Text style={styles.previewValue}>
//                             {confirmModal.pendingValues?.imei || '—'}
//                           </Text>
//                         </View>
//                       </View>

//                       <View style={styles.previewSection}>
//                         <Text style={styles.previewSectionTitle}>Financial Details</Text>
//                         <View style={styles.previewRow}>
//                           <Text style={styles.previewLabel}>Service Charge</Text>
//                           <Text style={styles.previewValue}>
//                             ₹ {confirmModal.pendingValues?.serviceCharges || 0}
//                           </Text>
//                         </View>
//                         <View style={styles.previewRow}>
//                           <Text style={styles.previewLabel}>Spare Charge</Text>
//                           <Text style={styles.previewValue}>
//                             ₹ {confirmModal.pendingValues?.spareCharges || 0}
//                           </Text>
//                         </View>
//                         <View style={styles.previewRow}>
//                           <Text style={styles.previewLabel}>Estimate Amount</Text>
//                           <Text style={[styles.previewValue, styles.previewValueHighlight]}>
//                             ₹ {confirmModal.pendingValues?.estimateAmount || 0}
//                           </Text>
//                         </View>
//                         <View style={styles.previewRow}>
//                           <Text style={styles.previewLabel}>Advance Amount</Text>
//                           <Text style={styles.previewValue}>
//                             ₹ {confirmModal.pendingValues?.advanceAmount || 0}
//                           </Text>
//                         </View>
//                         <View style={[styles.previewRow, styles.previewTotalRow]}>
//                           <Text style={[styles.previewLabel, styles.previewTotalLabel]}>Pending Amount</Text>
//                           <Text style={[styles.previewValue, styles.previewPendingValue]}>
//                             ₹ {Math.max(0, (parseFloat(confirmModal.pendingValues?.estimateAmount) || 0) - (parseFloat(confirmModal.pendingValues?.advanceAmount) || 0))}
//                           </Text>
//                         </View>
//                       </View>
//                     </ScrollView>

//                     <View style={styles.previewButtons}>
//                       <TouchableOpacity
//                         style={[
//                           styles.previewBtn,
//                           styles.previewCancelBtn,
//                           isConfirming && { opacity: 0.6 },
//                         ]}
//                         onPress={closeConfirm}
//                         disabled={isConfirming}
//                       >
//                         <Text style={styles.previewCancelText}>Edit</Text>
//                       </TouchableOpacity>
//                       <TouchableOpacity
//                         style={[
//                           styles.previewBtn,
//                           styles.previewConfirmBtn,
//                           isConfirming && { opacity: 0.6 },
//                         ]}
//                         onPress={handleConfirm}
//                         disabled={isConfirming}
//                       >
//                         <Save size={16} color="#fff" />
//                         <Text style={styles.previewConfirmText}>
//                           {isConfirming
//                             ? 'Saving...'
//                             : mode === 'edit'
//                             ? 'Update'
//                             : 'Save'}
//                         </Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 </View>
//               </Modal>

//               {/* ─── Alert Confirm Modal ─────────────────────────────────── */}
//               {confirmModal.visible &&
//                 (confirmModal.action === 'invoice' ||
//                   confirmModal.action === 'estimate') && (
//                   <Modal
//                     visible={true}
//                     transparent
//                     animationType="fade"
//                     onRequestClose={closeConfirm}
//                   >
//                     <View style={styles.alertOverlay}>
//                       <View style={styles.alertCard}>
//                         <AlertCircle
//                           size={36}
//                           color={
//                             confirmModal.action === 'invoice'
//                               ? COLORS.primary
//                               : '#F59E0B'
//                           }
//                         />
//                         <Text style={styles.alertTitle}>
//                           {confirmModal.action === 'invoice'
//                             ? 'Save & Open Invoice?'
//                             : 'Save & Open Estimate?'}
//                         </Text>
//                         <Text style={styles.alertMsg}>
//                           {confirmModal.action === 'invoice'
//                             ? 'The job sheet will be saved first, then the invoice will open.'
//                             : 'The job sheet will be saved first, then the estimate will open.'}
//                         </Text>
//                         <View style={styles.alertButtons}>
//                           <TouchableOpacity
//                             style={[
//                               styles.alertBtn,
//                               styles.alertCancelBtn,
//                               isConfirming && { opacity: 0.6 },
//                             ]}
//                             onPress={closeConfirm}
//                             disabled={isConfirming}
//                           >
//                             <Text style={styles.alertCancelText}>Cancel</Text>
//                           </TouchableOpacity>
//                           <TouchableOpacity
//                             style={[
//                               styles.alertBtn,
//                               styles.alertConfirmBtn,
//                               isConfirming && { opacity: 0.6 },
//                             ]}
//                             onPress={handleConfirm}
//                             disabled={isConfirming}
//                           >
//                             <Text style={styles.alertConfirmText}>
//                               {isConfirming
//                                 ? 'Saving...'
//                                 : confirmModal.action === 'invoice'
//                                 ? 'Save & Invoice'
//                                 : 'Save & Estimate'}
//                             </Text>
//                           </TouchableOpacity>
//                         </View>
//                       </View>
//                     </View>
//                   </Modal>
//                 )}

//               <LoadingOverlay visible={isLoading} />
//             </>
//           );
//         }}
//       </Formik>
//     </KeyboardAwareScrollView>
//   );
// }