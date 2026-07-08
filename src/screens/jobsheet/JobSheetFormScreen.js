// src/screens/jobsheet/JobSheetFormScreen.js
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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
  Trash2,
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
  Clock,
  Search,
  X,
  Camera,
  ChevronDown,
  AlertTriangle,
  XCircle,
} from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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
  Input,
  SelectModal,
  CheckboxItem,
  LoadingOverlay,
} from '../../components/UI';
import SparePopup from '../../components/SparePopup';
import AdvancePopup from '../../components/AdvancePopup';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
import { useToast } from 'react-native-toast-notifications';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '@env';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

// ─── Constants ─────────────────────────────────────────────────────────────
const physicalOptions = [
  'Colour Faded',
  'Antenna Broken',
  'Deformed',
  'Battery Damaged',
  'LCD Broken / Bleeding',
  'Tampered Set',
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

const onlyNumbers = value => value.replace(/\D/g, '');

// ─── Financial Calculation Helpers ──────────────────────────────────────────
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
    <View style={{ marginBottom: SPACING.md }}>
      {label && (
        <Text
          style={[cac.label, { color: error ? COLORS.error : COLORS.gray600 }]}
        >
          {label}
          {required && <Text style={{ color: COLORS.error }}> *</Text>}
        </Text>
      )}
      <View
        style={[
          cac.inputContainer,
          {
            borderColor: error
              ? COLORS.error
              : isFocused
              ? COLORS.primary
              : COLORS.gray200,
          },
        ]}
      >
        <TextInput
          style={cac.input}
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
      {error && <Text style={cac.errorText}>{error}</Text>}

      {showSuggestions && suggestions.length > 0 && (
        <View style={cac.dropdown}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            style={{ maxHeight: 200 }}
          >
            {suggestions.map((item, idx) => (
              <TouchableOpacity
                key={String(idx)}
                style={[
                  cac.suggestionItem,
                  idx < suggestions.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.gray100,
                  },
                ]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={cac.suggestionName}>{item.name}</Text>
                <Text style={cac.suggestionContact}>{item.contact}</Text>
                {!!item.address && (
                  <Text style={cac.suggestionAddress}>{item.address}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const cac = StyleSheet.create({
  label: {
    ...FONTS.medium,
    fontSize: 14,
    marginBottom: SPACING.xs,
    color: COLORS.gray700,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BORDERS.radius.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    height: 48,
  },
  input: {
    flex: 1,
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.gray900,
    paddingVertical: SPACING.sm,
  },
  errorText: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  dropdown: {
    position: 'absolute',
    top: 78,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDERS.radius.md,
    maxHeight: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  suggestionName: {
    ...FONTS.semibold,
    fontSize: 14,
    color: COLORS.gray900,
  },
  suggestionContact: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
  },
  suggestionAddress: {
    ...FONTS.regular,
    fontSize: 11,
    color: COLORS.gray400,
    marginTop: 2,
  },
});

// ─── Engineer Select Modal ─────────────────────────────────────────────────
const EngineerSelectModal = ({ engineers, workloadMap, value, onSelect }) => {
  const [visible, setVisible] = useState(false);

  const getWorkloadInfo = engineerName => {
    const count = workloadMap[engineerName] || 0;
    const free = MAX_JOBS - count;

    if (count >= MAX_JOBS) {
      return {
        sublabel: 'Full capacity',
        icon: <XCircle size={15} color="#dc2626" />,
        sublabelColor: '#dc2626',
        badgeBg: '#fee2e2',
        disabled: true,
      };
    }
    if (count >= 4) {
      return {
        sublabel: `${count}/${MAX_JOBS} jobs — ${free} slot left`,
        icon: <AlertTriangle size={15} color="#d97706" />,
        sublabelColor: '#d97706',
        badgeBg: '#fef3c7',
        disabled: false,
      };
    }
    return {
      sublabel: `${count}/${MAX_JOBS} jobs — ${free} slots free`,
      icon: <CheckCircle size={15} color="#16a34a" />,
      sublabelColor: '#16a34a',
      badgeBg: '#dcfce7',
      disabled: false,
    };
  };

  const selectedEngineer = engineers.find(e => e.id === value);
  const selectedInfo = selectedEngineer
    ? getWorkloadInfo(selectedEngineer.name)
    : null;

  return (
    <View style={{ marginBottom: SPACING.md }}>
      <Text style={esl.label}>Select Engineer</Text>

      <TouchableOpacity
        style={esl.trigger}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        {selectedEngineer ? (
          <View style={esl.triggerSelected}>
            <View style={{ flex: 1 }}>
              <Text style={esl.triggerName}>{selectedEngineer.name}</Text>
              <View
                style={[
                  esl.triggerBadge,
                  { backgroundColor: selectedInfo.badgeBg },
                ]}
              >
                {selectedInfo.icon}
                <Text
                  style={[
                    esl.triggerBadgeText,
                    { color: selectedInfo.sublabelColor },
                  ]}
                >
                  {selectedInfo.sublabel}
                </Text>
              </View>
            </View>
            <ChevronDown size={18} color={COLORS.gray500} />
          </View>
        ) : (
          <View style={esl.triggerPlaceholderRow}>
            <Text style={esl.triggerPlaceholder}>Select Engineer</Text>
            <ChevronDown size={18} color={COLORS.gray400} />
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={esl.overlay}>
          <View style={esl.sheet}>
            <View style={esl.sheetHeader}>
              <Text style={esl.sheetTitle}>Select Engineer</Text>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color={COLORS.gray600} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={esl.sheetList}
              showsVerticalScrollIndicator={false}
            >
              {engineers.map(engineer => {
                const info = getWorkloadInfo(engineer.name);
                const isSelected = engineer.id === value;

                return (
                  <TouchableOpacity
                    key={engineer.id}
                    style={[
                      esl.option,
                      isSelected && esl.optionSelected,
                      info.disabled && esl.optionDisabled,
                    ]}
                    onPress={() => {
                      if (!info.disabled) {
                        onSelect(engineer.id);
                        setVisible(false);
                      }
                    }}
                    activeOpacity={info.disabled ? 1 : 0.7}
                    disabled={info.disabled}
                  >
                    <View style={esl.optionLeft}>
                      <Text
                        style={[
                          esl.optionName,
                          isSelected && esl.optionNameSelected,
                          info.disabled && esl.optionNameDisabled,
                        ]}
                      >
                        {engineer.name}
                      </Text>
                      <View
                        style={[esl.badge, { backgroundColor: info.badgeBg }]}
                      >
                        {info.icon}
                        <Text
                          style={[esl.badgeText, { color: info.sublabelColor }]}
                        >
                          {info.sublabel}
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <CheckCircle size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const esl = StyleSheet.create({
  label: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  trigger: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDERS.radius.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    minHeight: 48,
    justifyContent: 'center',
  },
  triggerSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  triggerName: {
    ...FONTS.semibold,
    fontSize: 15,
    color: COLORS.gray900,
    marginBottom: 4,
  },
  triggerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  triggerBadgeText: {
    ...FONTS.medium,
    fontSize: 11,
  },
  triggerPlaceholderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerPlaceholder: {
    ...FONTS.regular,
    fontSize: 15,
    color: COLORS.gray400,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '75%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  sheetTitle: {
    ...FONTS.bold,
    fontSize: 17,
    color: COLORS.gray900,
  },
  sheetList: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  optionSelected: {
    backgroundColor: '#eff6ff',
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  optionDisabled: {
    opacity: 0.45,
  },
  optionLeft: {
    flex: 1,
    gap: 5,
  },
  optionName: {
    ...FONTS.semibold,
    fontSize: 15,
    color: COLORS.gray900,
  },
  optionNameSelected: {
    color: COLORS.primary,
  },
  optionNameDisabled: {
    color: COLORS.gray400,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...FONTS.medium,
    fontSize: 11,
  },
});

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
      <Text style={styles.sectionTitle}>Visual Inspection</Text>

      {visualIssues.map((issue, index) => (
        <View key={index} style={{ marginBottom: SPACING.md }}>
          <View style={styles.visualRow}>
            <View style={{ flex: 1 }}>
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
                <X size={20} color={COLORS.danger} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      <TouchableOpacity onPress={addIssue} style={styles.addVisualButton}>
        <Plus size={18} color={COLORS.primary} />
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
    <View style={ipu.container}>
      <Text style={ipu.label}>ID Proof Image</Text>
      <TouchableOpacity
        onPress={pickImage}
        style={[
          ipu.uploadBox,
          isDisabled && ipu.uploadBoxDisabled,
          imageUri && ipu.uploadBoxHasImage,
        ]}
        disabled={isDisabled}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={ipu.previewImage} />
        ) : (
          <View style={ipu.uploadPlaceholder}>
            <Camera
              size={32}
              color={isDisabled ? COLORS.gray400 : COLORS.gray500}
            />
            <Text
              style={[ipu.uploadText, isDisabled && ipu.uploadTextDisabled]}
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
          style={ipu.removeButton}
        >
          <Text style={ipu.removeText}>Remove Image</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const ipu = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: BORDERS.radius.md,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderStyle: 'dashed',
  },
  uploadBoxDisabled: {
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.gray100,
  },
  uploadBoxHasImage: {
    borderStyle: 'solid',
    borderColor: COLORS.primary,
  },
  uploadPlaceholder: { alignItems: 'center', gap: 8 },
  uploadText: {
    ...FONTS.regular,
    fontSize: 13,
    color: COLORS.gray500,
    marginTop: 4,
  },
  uploadTextDisabled: { color: COLORS.gray400 },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: BORDERS.radius.md,
    resizeMode: 'cover',
  },
  removeButton: { marginTop: SPACING.xs, alignSelf: 'flex-end' },
  removeText: { ...FONTS.medium, fontSize: 12, color: COLORS.danger },
});

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
  const [openAdvanceDate, setOpenAdvanceDate] = useState(false);
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

  const [advancePopupVisible, setAdvancePopupVisible] = useState(false);
  const [sparePopupVisible, setSparePopupVisible] = useState(false);

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

    if (!engineers.length) dispatch(fetchEngineers());
    if (!makes.length) dispatch(fetchMakes());
    if (!models.length) dispatch(fetchModels());
    if (!drawers.length) dispatch(fetchDrawers());
    if (!salesReps.length) dispatch(fetchSalesReps());
    if (!faults.length) dispatch(fetchFaults());

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
    
    return {
      ...values,
      serviceCharges: parseFloat(values.serviceCharges) || 0,
      spareCharges: parseFloat(values.spareCharges) || 0,
      estimateAmount: estimate,
      marginAmount: margin,
      advanceAmount: advanceAmount,
      advanceDate: values.advanceDate ? values.advanceDate.toISOString() : null,
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
      style={{ flex: 1, backgroundColor: '#F8FAFC' }}
      showsVerticalScrollIndicator={false}
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
              <View style={{ padding: SPACING.lg, paddingBottom: SPACING.xxl }}>
                {/* ─── Job Sheet Header ──────────────────────────────────── */}
                <View style={styles.section}>
                  <View style={styles.jobSheetHeader}>
                    <View style={styles.jobSheetHeaderLeft}>
                      <FileText size={18} color={COLORS.primary} />
                      <Text style={styles.jobSheetNo}>
                        Job Sheet No: {values.jobSheetNo || 'New'}
                      </Text>
                    </View>
                    <View style={styles.dateTimeContainer}>
                      <View style={styles.dateTimeItem}>
                        <Calendar size={14} color={COLORS.gray500} />
                        <Text style={styles.dateTimeText}>
                          {values.createdAt || getCurrentDate()}
                        </Text>
                      </View>
                      <View style={styles.dateTimeItem}>
                        <Clock size={14} color={COLORS.gray500} />
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
                        <Search size={20} color={COLORS.white} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ─── Physical Condition ───────────────────────────────── */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Physical Condition</Text>
                  <View style={styles.checkboxGroup}>
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
                      />
                    ))}
                  </View>
                  <Input
                    label="Other Details"
                    value={values.batteryNumber}
                    onChangeText={t => setFieldValue('batteryNumber', t)}
                    placeholder="Other Details"
                  />
                </View>

                {/* ─── Accessories Received ─────────────────────────────── */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Accessories Received</Text>
                  <View style={styles.checkboxGroup}>
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
                      />
                    ))}
                  </View>
                  <Input
                    label="Battery Number"
                    value={values.batteryNumber}
                    onChangeText={t => setFieldValue('batteryNumber', t)}
                    placeholder="Battery Number"
                  />
                </View>

                {/* ─── Customer Details ─────────────────────────────────── */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Customer Details</Text>

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
                    placeholder="Customer Name *"
                    required
                    error={touched.customerName && errors.customerName}
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
                    placeholder="Contact No *"
                    keyboardType="phone-pad"
                    maxLength={10}
                    required
                    error={touched.contact && errors.contact}
                  />

                  <Input
                    label="Alt Contact"
                    value={values.altContact}
                    onChangeText={t => setFieldValue('altContact', t)}
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholder="Alt Contact"
                  />
                  <Input
                    label="Customer Address"
                    value={values.address}
                    onChangeText={t => setFieldValue('address', t)}
                    multiline
                    placeholder="Customer Address"
                  />
                  <Input
                    label="Email ID"
                    value={values.email}
                    onChangeText={t => setFieldValue('email', t)}
                    keyboardType="email-address"
                    placeholder="Email ID"
                    error={touched.email && errors.email}
                  />

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

                {/* ─── Device Details ───────────────────────────────────── */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Device Details</Text>

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

                  <Input
                    label="IMEI"
                    value={values.imei}
                    onChangeText={t => setFieldValue('imei', t)}
                    keyboardType="numeric"
                    maxLength={15}
                    placeholder="IMEI *"
                  />

                  <SelectModal
                    label="Status"
                    value={values.status}
                    options={statusOptions}
                    onSelect={v => setFieldValue('status', v)}
                    placeholder="All Status"
                  />

                  <SelectModal
                    label="Warranty"
                    value={values.warranty}
                    options={warrantyOptions}
                    onSelect={v => setFieldValue('warranty', v)}
                  />

                  <Input
                    label="Pattern / PIN"
                    value={values.patternPin}
                    onChangeText={t => setFieldValue('patternPin', t)}
                    placeholder="Pattern / PIN"
                  />
                </View>

                {/* ─── Service / Repair Details ─────────────────────────── */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Service / Repair Details
                  </Text>

                  <EngineerSelectModal
                    engineers={engineers}
                    workloadMap={workloadMap}
                    value={values.engineerId}
                    onSelect={v => setFieldValue('engineerId', v)}
                  />

                  <Input
                    label="Dealer Name"
                    value={values.dealerName}
                    onChangeText={t => setFieldValue('dealerName', t)}
                    placeholder="Dealer Name"
                  />

                  <SelectModal
                    label="Select Drawer"
                    value={values.drawerId}
                    options={drawers}
                    onSelect={v => setFieldValue('drawerId', v)}
                    placeholder="Select Drawer"
                  />

                  <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: SPACING.sm }}>
                      <Input
                        label="Service Charges"
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
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Input
                        label="Spare Charges"
                        value={values.spareCharges}
                        onChangeText={t => {
                          const val = onlyNumbers(t);
                          setFieldValue('spareCharges', val);
                          if (val > 0 && (values.spareItems || []).length > 0) {
                            setFieldValue('spareItems', []);
                          }
                          const { estimate, margin } = calculateFinancials(
                            values.serviceCharges,
                            val,
                            values.spareItems
                          );
                          setFieldValue('estimateAmount', estimate.toString());
                          setFieldValue('marginAmount', margin.toString());
                        }}
                        keyboardType="numeric"
                        placeholder="Spare Charges"
                        editable={(values.spareItems || []).length === 0}
                      />
                      {(values.spareItems || []).length > 0 && (
                        <Text style={styles.readOnlyHint}>
                          Auto-calculated from {values.spareItems.length} spare items
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* ── Spare Parts Section ── */}
                  <View style={{ marginTop: SPACING.md }}>
                    <Text style={styles.subsectionTitle}>Spare Parts</Text>

                    <TouchableOpacity
                      onPress={() => setSparePopupVisible(true)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.spareChargeTrigger}>
                        <View style={styles.spareChargeRow}>
                          <View style={styles.spareChargeLeft}>
                            <Text style={styles.spareChargeLabel}>
                              Total Spare Charges
                            </Text>
                            <Text style={styles.spareChargeValue}>
                              ₹{values.spareCharges || 0}
                            </Text>
                          </View>
                          <View style={styles.spareChargeRight}>
                            <View style={styles.spareChargeBadge}>
                              <Text style={styles.spareChargeBadgeText}>
                                {(values.spareItems || []).length} items
                              </Text>
                            </View>
                            <Text style={styles.spareChargeHint}>
                              Tap to manage spare items
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {(values.spareItems || []).length > 0 && (
                      <View style={styles.spareItemsPreview}>
                        <Text style={styles.spareItemsPreviewTitle}>
                          Added Items:
                        </Text>
                        {(values.spareItems || [])
                          .slice(0, 3)
                          .map((item, idx) => (
                            <Text
                              key={idx}
                              style={styles.spareItemsPreviewItem}
                            >
                              {item.name} × {item.qty} = ₹
                              {(item.qty * item.rate).toFixed(0)}
                            </Text>
                          ))}
                        {(values.spareItems || []).length > 3 && (
                          <Text style={styles.spareItemsPreviewMore}>
                            + {values.spareItems.length - 3} more items
                          </Text>
                        )}
                      </View>
                    )}
                  </View>

                  {/* ── Financial Summary Display ── */}
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
                    </View>
                    
                    <View style={[styles.financialRow, styles.financialTotal]}>
                      <View style={styles.financialItem}>
                        <Text style={styles.financialLabel}>Estimate Amount</Text>
                        <Text style={[styles.financialValue, styles.financialValueTotal]}>
                          ₹{values.estimateAmount || 0}
                        </Text>
                      </View>
                      <View style={styles.financialItem}>
                        <Text style={styles.financialLabel}>Margin</Text>
                        <Text style={[styles.financialValue, styles.financialValueMargin]}>
                          ₹{values.marginAmount || 0}
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

                  <SelectModal
                    label="Payment Mode"
                    value={values.paymentMode}
                    options={paymentOptions}
                    onSelect={v => setFieldValue('paymentMode', v)}
                    placeholder="Payment Mode"
                  />

                  {/* ── Advance Section ── */}
                  <View style={styles.advanceSection}>
                    <TouchableOpacity
                      onPress={() => setAdvancePopupVisible(true)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.advanceTrigger}>
                        <View style={styles.advanceRow}>
                          <View style={styles.advanceLeft}>
                            <Text style={styles.advanceLabel}>
                              Advance Amount
                            </Text>
                            <Text style={styles.advanceValue}>
                              ₹{values.advanceAmount || 0}
                            </Text>
                          </View>
                          <View style={styles.advanceRight}>
                            <View style={styles.advanceBadge}>
                              <Text style={styles.advanceBadgeText}>
                                {(values.advanceItems || []).length} payments
                              </Text>
                            </View>
                            <Text style={styles.advanceHint}>
                              Tap to manage payments
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {(values.advanceItems || []).length > 0 && (
                      <View style={styles.advanceItemsPreview}>
                        <Text style={styles.advanceItemsPreviewTitle}>
                          Payment History:
                        </Text>
                        {(values.advanceItems || [])
                          .slice(0, 3)
                          .map((item, idx) => (
                            <Text
                              key={idx}
                              style={styles.advanceItemsPreviewItem}
                            >
                              {item.label || `Payment ${idx + 1}`}: ₹
                              {item.amount}
                              {item.date
                                ? ` (${new Date(
                                    item.date,
                                  ).toLocaleDateString()})`
                                : ''}
                            </Text>
                          ))}
                        {(values.advanceItems || []).length > 3 && (
                          <Text style={styles.advanceItemsPreviewMore}>
                            + {values.advanceItems.length - 3} more payments
                          </Text>
                        )}
                      </View>
                    )}
                  </View>

                  {/* ── Pending Amount ── */}
                  <View style={styles.pendingSection}>
                    <Text style={styles.pendingLabel}>Pending Amount</Text>
                    <Text style={styles.pendingValue}>
                      ₹{Math.max(0, (parseFloat(values.estimateAmount) || 0) - (parseFloat(values.advanceAmount) || 0))}
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: SPACING.sm }}>
                      <SelectModal
                        label="Service Rep"
                        value={values.serviceRepId}
                        options={salesReps}
                        onSelect={v => setFieldValue('serviceRepId', v)}
                        placeholder="Service Rep"
                      />
                    </View>
                  </View>

                  <Text style={styles.fieldLabel}>Repair Date</Text>
                  <TouchableOpacity
                    onPress={() => setOpenRepairDate(true)}
                    style={styles.dateButton}
                  >
                    <Calendar size={20} color={COLORS.gray600} />
                    <Text style={styles.dateText}>
                      {values.repairDate?.toLocaleDateString()}
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

                  <Text style={styles.fieldLabel}>Delivery Date</Text>
                  <TouchableOpacity
                    onPress={() => setOpenDeliveryDate(true)}
                    style={styles.dateButton}
                  >
                    <Calendar size={20} color={COLORS.gray600} />
                    <Text style={styles.dateText}>
                      {values.deliveryDate
                        ? values.deliveryDate.toLocaleDateString()
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

                  <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: SPACING.sm }}>
                      <SelectModal
                        label="Insta Follow"
                        value={values.instaFollowers}
                        options={instaFollowOptions}
                        onSelect={v => setFieldValue('instaFollowers', v)}
                        placeholder="Select"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <SelectModal
                        label="Google Review"
                        value={values.googleReview}
                        options={googleReviewOptions}
                        onSelect={v => setFieldValue('googleReview', v)}
                        placeholder="Select"
                      />
                    </View>
                  </View>

                  <Input
                    label="Remarks"
                    value={values.remarks}
                    onChangeText={t => setFieldValue('remarks', t)}
                    multiline
                    placeholder="Remarks"
                  />
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
                    <Save size={22} color={COLORS.white} />
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
                      <RefreshCw size={20} color={COLORS.gray700} />
                      <Text style={styles.secondaryButtonText}>Refresh</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() =>
                        calculateEstimate(setFieldValue, () => values)
                      }
                      disabled={buttonsDisabled}
                    >
                      <Calculator size={20} color={COLORS.gray700} />
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
                      <FileText size={20} color="#F59E0B" />
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
                      <Receipt size={20} color={COLORS.primary} />
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
                      <Plus size={20} color={COLORS.primary} />
                      <Text style={[styles.secondaryButtonText, { color: COLORS.primary }]}>
                        New Job
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() => navigation.navigate('Home')}
                      disabled={buttonsDisabled}
                    >
                      <Home size={20} color={COLORS.gray700} />
                      <Text style={styles.secondaryButtonText}>Home</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* ─── Spare Popup ──────────────────── */}
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

              {/* ─── Advance Popup ──────────────────────────────────── */}
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
            </>
          );
        }}
      </Formik>

      {/* ─── Search Results Modal ──────────────────────────────────────── */}
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

      {/* ─── Preview Confirm Modal ─────────────────────────────────────── */}
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
              {/* ─── Customer Details ─────────────────────────────────── */}
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
                  <Text style={styles.previewLabel}>Alt Contact</Text>
                  <Text style={styles.previewValue}>
                    {confirmModal.pendingValues?.altContact || '—'}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Address</Text>
                  <Text style={styles.previewValue}>
                    {confirmModal.pendingValues?.address || '—'}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Email</Text>
                  <Text style={styles.previewValue}>
                    {confirmModal.pendingValues?.email || '—'}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>ID Proof</Text>
                  <Text style={styles.previewValue}>
                    {confirmModal.pendingValues?.idProof || '—'}
                  </Text>
                </View>
              </View>

              {/* ─── Device Details ───────────────────────────────────── */}
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
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Status</Text>
                  <Text style={styles.previewValue}>
                    {confirmModal.pendingValues?.status || 'Received'}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Warranty</Text>
                  <Text style={styles.previewValue}>
                    {confirmModal.pendingValues?.warranty || 'No Warranty'}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Pattern/PIN</Text>
                  <Text style={styles.previewValue}>
                    {confirmModal.pendingValues?.patternPin || '—'}
                  </Text>
                </View>
              </View>

              {/* ─── Physical Condition ───────────────────────────────── */}
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Physical Condition</Text>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Conditions</Text>
                  <Text style={[styles.previewValue, { flex: 1, textAlign: 'right' }]}>
                    {(confirmModal.pendingValues?.physicalConditions || []).length > 0
                      ? (confirmModal.pendingValues?.physicalConditions || []).join(', ')
                      : '—'}
                  </Text>
                </View>
              </View>

              {/* ─── Accessories ───────────────────────────────────────── */}
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Accessories Received</Text>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Accessories</Text>
                  <Text style={[styles.previewValue, { flex: 1, textAlign: 'right' }]}>
                    {(confirmModal.pendingValues?.accessoriesReceived || []).length > 0
                      ? (confirmModal.pendingValues?.accessoriesReceived || []).join(', ')
                      : '—'}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Battery Number</Text>
                  <Text style={styles.previewValue}>
                    {confirmModal.pendingValues?.batteryNumber || '—'}
                  </Text>
                </View>
              </View>

              {/* ─── Service Details ───────────────────────────────────── */}
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Service Details</Text>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Engineer</Text>
                  <Text style={styles.previewValue}>
                    {engineers.find(e => e.id === confirmModal.pendingValues?.engineerId)?.name || '—'}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Dealer</Text>
                  <Text style={styles.previewValue}>
                    {confirmModal.pendingValues?.dealerName || '—'}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Drawer</Text>
                  <Text style={styles.previewValue}>
                    {drawers.find(d => d.id === confirmModal.pendingValues?.drawerId)?.name || '—'}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Service Rep</Text>
                  <Text style={styles.previewValue}>
                    {salesReps.find(s => s.id === confirmModal.pendingValues?.serviceRepId)?.name || '—'}
                  </Text>
                </View>
              </View>

              {/* ─── Financial Details ─────────────────────────────────── */}
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Financial Details</Text>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Service Charge</Text>
                  <Text style={styles.previewValue}>
                    Rs. {confirmModal.pendingValues?.serviceCharges || 0}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Spare Charge</Text>
                  <Text style={styles.previewValue}>
                    Rs. {confirmModal.pendingValues?.spareCharges || 0}
                  </Text>
                </View>
                
                {(confirmModal.pendingValues?.spareItems || []).length > 0 && (
                  <View style={styles.previewSubSection}>
                    <Text style={styles.previewSubLabel}>Spare Items:</Text>
                    {(confirmModal.pendingValues?.spareItems || []).map((item, idx) => (
                      <View key={idx} style={styles.previewSubRow}>
                        <Text style={styles.previewSubValue}>
                          {item.name} × {item.qty}
                        </Text>
                        <Text style={styles.previewSubValue}>
                          Rs. {(item.qty * item.rate).toFixed(0)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Estimate Amount</Text>
                  <Text style={[styles.previewValue, styles.previewValueHighlight]}>
                    Rs. {confirmModal.pendingValues?.estimateAmount || 0}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Margin</Text>
                  <Text style={[styles.previewValue, styles.previewValueMargin]}>
                    Rs. {confirmModal.pendingValues?.marginAmount || 0}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Payment Mode</Text>
                  <Text style={styles.previewValue}>
                    {confirmModal.pendingValues?.paymentMode || '—'}
                  </Text>
                </View>
              </View>

              {/* ─── Advance Details ───────────────────────────────────── */}
              {(confirmModal.pendingValues?.advanceItems || []).length > 0 && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>Advance Payments</Text>
                  {(confirmModal.pendingValues?.advanceItems || []).map((item, idx) => (
                    <View key={idx} style={styles.previewRow}>
                      <Text style={styles.previewLabel}>
                        {item.label || `Payment ${idx + 1}`}
                        {item.date ? ` (${new Date(item.date).toLocaleDateString()})` : ''}
                      </Text>
                      <Text style={styles.previewValue}>
                        Rs. {item.amount || 0}
                      </Text>
                    </View>
                  ))}
                  <View style={[styles.previewRow, styles.previewTotalRow]}>
                    <Text style={[styles.previewLabel, styles.previewTotalLabel]}>Total Advance</Text>
                    <Text style={[styles.previewValue, styles.previewTotalValue]}>
                      Rs. {confirmModal.pendingValues?.advanceAmount || 0}
                    </Text>
                  </View>
                  <View style={[styles.previewRow, styles.previewTotalRow]}>
                    <Text style={[styles.previewLabel, styles.previewTotalLabel]}>Pending Amount</Text>
                    <Text style={[styles.previewValue, styles.previewPendingValue]}>
                      Rs. {Math.max(0, (parseFloat(confirmModal.pendingValues?.estimateAmount) || 0) - (parseFloat(confirmModal.pendingValues?.advanceAmount) || 0))}
                    </Text>
                  </View>
                </View>
              )}

              {/* ─── Dates ────────────────────────────────────────────────── */}
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Dates</Text>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Repair Date</Text>
                  <Text style={styles.previewValue}>
                    {confirmModal.pendingValues?.repairDate
                      ? new Date(confirmModal.pendingValues.repairDate).toLocaleDateString()
                      : '—'}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Delivery Date</Text>
                  <Text style={styles.previewValue}>
                    {confirmModal.pendingValues?.deliveryDate
                      ? new Date(confirmModal.pendingValues.deliveryDate).toLocaleDateString()
                      : 'Not Set'}
                  </Text>
                </View>
              </View>

              {/* ─── Additional Info ────────────────────────────────────── */}
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Additional Information</Text>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Insta Follow</Text>
                  <Text style={styles.previewValue}>
                    {confirmModal.pendingValues?.instaFollowers || '—'}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Google Review</Text>
                  <Text style={styles.previewValue}>
                    {confirmModal.pendingValues?.googleReview || '—'}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Remarks</Text>
                  <Text style={[styles.previewValue, { flex: 1, textAlign: 'right' }]}>
                    {confirmModal.pendingValues?.remarks || '—'}
                  </Text>
                </View>
              </View>

              {/* ─── Visual Inspection ──────────────────────────────────── */}
              {(visualIssues || []).filter(Boolean).length > 0 && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>Visual Inspection</Text>
                  {visualIssues.filter(Boolean).map((issue, idx) => (
                    <View key={idx} style={styles.previewRow}>
                      <Text style={styles.previewLabel}>Issue {idx + 1}</Text>
                      <Text style={styles.previewValue}>{issue}</Text>
                    </View>
                  ))}
                </View>
              )}
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

      {/* ─── Alert Confirm Modal ───────────────────────────────────────── */}
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
    </KeyboardAwareScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: 18,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: SPACING.sm,
  },
  subsectionTitle: {
    ...FONTS.semibold,
    fontSize: 14,
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  jobSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  jobSheetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jobSheetNo: {
    ...FONTS.bold,
    fontSize: 16,
    color: COLORS.gray900,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateTimeText: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray500,
  },
  searchSection: {
    marginBottom: SPACING.lg,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    ...SHADOWS.small,
  },
  searchInput: {
    flex: 1,
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray900,
    padding: SPACING.md,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderTopRightRadius: BORDERS.radius.md,
    borderBottomRightRadius: BORDERS.radius.md,
  },
  fieldLabel: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  dateText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray700,
  },
  readOnlyHint: {
    ...FONTS.regular,
    fontSize: 11,
    color: COLORS.gray400,
    marginTop: 4,
    fontStyle: 'italic',
  },
  calcButton: {
    marginBottom: SPACING.md,
  },
  visualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  customFaultInput: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDERS.radius.sm,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
    ...FONTS.regular,
    fontSize: 14,
    backgroundColor: COLORS.white,
  },
  removeVisualButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  addVisualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDERS.radius.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
    gap: 6,
  },
  addVisualText: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
  },
  financialSummary: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  financialTotal: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  financialItem: {
    flex: 1,
  },
  financialLabel: {
    ...FONTS.medium,
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: 2,
  },
  financialValue: {
    ...FONTS.bold,
    fontSize: 16,
    color: COLORS.gray900,
  },
  financialValueTotal: {
    color: COLORS.primary,
    fontSize: 18,
  },
  financialValueMargin: {
    color: '#16a34a',
  },
  advanceSection: {
    marginBottom: SPACING.md,
  },
  advanceTrigger: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginBottom: SPACING.sm,
  },
  advanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  advanceLeft: {
    flex: 1,
  },
  advanceLabel: {
    ...FONTS.medium,
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: 2,
  },
  advanceValue: {
    ...FONTS.bold,
    fontSize: 18,
    color: COLORS.gray900,
  },
  advanceRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  advanceBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 20,
  },
  advanceBadgeText: {
    ...FONTS.medium,
    fontSize: 11,
    color: COLORS.primary,
  },
  advanceHint: {
    ...FONTS.regular,
    fontSize: 11,
    color: COLORS.gray400,
  },
  advanceItemsPreview: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  advanceItemsPreviewTitle: {
    ...FONTS.medium,
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 4,
  },
  advanceItemsPreviewItem: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray700,
    paddingVertical: 2,
  },
  advanceItemsPreviewMore: {
    ...FONTS.medium,
    fontSize: 11,
    color: COLORS.gray400,
    marginTop: 2,
  },
  pendingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.md,
  },
  pendingLabel: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.gray700,
  },
  pendingValue: {
    ...FONTS.bold,
    fontSize: 18,
    color: '#D97706',
  },
  spareChargeTrigger: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginBottom: SPACING.md,
  },
  spareChargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spareChargeLeft: {
    flex: 1,
  },
  spareChargeLabel: {
    ...FONTS.medium,
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  spareChargeValue: {
    ...FONTS.bold,
    fontSize: 18,
    color: COLORS.gray900,
  },
  spareChargeRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  spareChargeBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 20,
  },
  spareChargeBadgeText: {
    ...FONTS.medium,
    fontSize: 11,
    color: COLORS.primary,
  },
  spareChargeHint: {
    ...FONTS.regular,
    fontSize: 11,
    color: COLORS.gray400,
  },
  spareItemsPreview: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  spareItemsPreviewTitle: {
    ...FONTS.medium,
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 4,
  },
  spareItemsPreviewItem: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray700,
    paddingVertical: 2,
  },
  spareItemsPreviewMore: {
    ...FONTS.medium,
    fontSize: 11,
    color: COLORS.gray400,
    marginTop: 2,
  },
  actionContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  saveButtonPrimary: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.md,
    gap: 8,
    ...SHADOWS.medium,
  },
  saveButtonText: {
    ...FONTS.bold,
    fontSize: 16,
    color: COLORS.white,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  secondaryButton: {
    flex: 1,
    minWidth: 60,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radius.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    ...SHADOWS.small,
    gap: 4,
  },
  newJobBtn: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  estimateBtn: {
    borderColor: '#FDE68A',
  },
  invoiceBtn: {
    borderColor: '#DBEAFE',
  },
  secondaryButtonText: {
    ...FONTS.medium,
    fontSize: 11,
    color: COLORS.gray700,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    width: '90%',
    maxHeight: '80%',
    padding: SPACING.lg,
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: {
    ...FONTS.bold,
    fontSize: 18,
    color: COLORS.gray900,
  },
  modalBody: {
    maxHeight: 400,
  },
  noResults: {
    textAlign: 'center',
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray500,
    padding: SPACING.xl,
  },
  searchResultItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  resultJobNo: {
    ...FONTS.bold,
    fontSize: 14,
    color: COLORS.gray900,
  },
  resultCustomer: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray600,
  },
  resultStatus: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray500,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  previewCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 28,
    maxHeight: '90%',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  previewTitle: {
    ...FONTS.bold,
    fontSize: 18,
    color: COLORS.gray900,
  },
  previewSubTitle: {
    ...FONTS.regular,
    fontSize: 13,
    color: COLORS.gray500,
    marginBottom: 16,
  },
  previewScroll: {
    maxHeight: 400,
  },
  previewSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  previewSectionTitle: {
    ...FONTS.semibold,
    fontSize: 13,
    color: COLORS.gray700,
    marginBottom: 8,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  previewLabel: {
    ...FONTS.medium,
    fontSize: 12,
    color: COLORS.gray500,
  },
  previewValue: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray900,
  },
  previewSubSection: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  previewSubLabel: {
    ...FONTS.medium,
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 4,
  },
  previewSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  previewSubValue: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray700,
  },
  previewValueHighlight: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  previewValueMargin: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
  previewTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: SPACING.xs,
    marginTop: SPACING.xs,
  },
  previewTotalLabel: {
    fontWeight: 'bold',
    color: COLORS.gray800,
  },
  previewTotalValue: {
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  previewPendingValue: {
    fontWeight: 'bold',
    color: '#D97706',
  },
  previewButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  previewBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  previewCancelBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  previewCancelText: {
    ...FONTS.semibold,
    fontSize: 15,
    color: COLORS.gray700,
  },
  previewConfirmBtn: {
    backgroundColor: COLORS.primary,
  },
  previewConfirmText: {
    ...FONTS.semibold,
    fontSize: 15,
    color: '#fff',
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    width: '82%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  alertTitle: {
    ...FONTS.bold,
    fontSize: 17,
    color: COLORS.gray900,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  alertMsg: {
    ...FONTS.regular,
    fontSize: 13,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  alertButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  alertBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  alertCancelBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  alertCancelText: {
    ...FONTS.semibold,
    fontSize: 15,
    color: COLORS.gray700,
  },
  alertConfirmBtn: {
    backgroundColor: COLORS.primary,
  },
  alertConfirmText: {
    ...FONTS.semibold,
    fontSize: 15,
    color: '#fff',
  },
});

//-----------------------------------------------------------

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
// import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
// import { useToast } from 'react-native-toast-notifications';
// import { useAuth } from '../../context/AuthContext';
// import { API_BASE_URL } from '@env';
// import axios from 'axios';

// const { width, height } = Dimensions.get('window');

// // ─── Constants ─────────────────────────────────────────────────────────────
// const physicalOptions = [
//   'Colour Faded',
//   'Antenna Broken',
//   'Deformed',
//   'Battery Damaged',
//   'LCD Broken / Bleeding',
//   'Tampered Set',
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

// /**
//  * Calculate estimate and margin based on business rules:
//  * - Estimate = Service Charge + (Spare Charge OR Spare Items Total)
//  * - Margin = Service Charge
//  */
// const calculateFinancials = (serviceCharges, spareCharges, spareItems) => {
//   const service = parseFloat(serviceCharges) || 0;
//   const spare = parseFloat(spareCharges) || 0;
  
//   // Calculate total from spare items
//   const itemsTotal = (spareItems || []).reduce(
//     (sum, item) => sum + (parseInt(item.qty) || 0) * (parseFloat(item.rate) || 0),
//     0
//   );
  
//   // Business Rule: Use spareCharges if manually entered, otherwise use itemsTotal
//   const totalSpare = spare > 0 ? spare : itemsTotal;
  
//   // Estimate = Service + Spare (single OR total of items)
//   const estimate = service + totalSpare;
  
//   // Margin = Service Charge (as per business rule)
//   const margin = service;
  
//   return {
//     estimate,
//     margin,
//     service,
//     totalSpare,
//     itemsTotal
//   };
// };

// /**
//  * Calculate advance total from items
//  */
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
//   // Add validation for advance amount consistency
//   advanceAmount: yup
//     .number()
//     .nullable()
//     .test(
//       'advance-consistency',
//       'Advance amount doesn\'t match total of advance items',
//       function(value) {
//         const items = this.parent.advanceItems || [];
//         if (items.length === 0) return true;
//         const total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
//         const amount = parseFloat(value) || 0;
//         return Math.abs(total - amount) < 0.01;
//       }
//     ),
//   // Add validation for spare charges consistency
//   spareCharges: yup
//     .number()
//     .nullable()
//     .test(
//       'spare-consistency',
//       'Spare charges don\'t match total of spare items',
//       function(value) {
//         const items = this.parent.spareItems || [];
//         if (items.length === 0) return true;
//         const total = items.reduce(
//           (sum, item) => sum + (parseInt(item.qty) || 0) * (parseFloat(item.rate) || 0),
//           0
//         );
//         const charges = parseFloat(value) || 0;
//         return Math.abs(total - charges) < 0.01;
//       }
//     ),
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
//     <View style={{ marginBottom: SPACING.md }}>
//       {label && (
//         <Text
//           style={[cac.label, { color: error ? COLORS.error : COLORS.gray600 }]}
//         >
//           {label}
//           {required && <Text style={{ color: COLORS.error }}> *</Text>}
//         </Text>
//       )}
//       <View
//         style={[
//           cac.inputContainer,
//           {
//             borderColor: error
//               ? COLORS.error
//               : isFocused
//               ? COLORS.primary
//               : COLORS.gray200,
//           },
//         ]}
//       >
//         <TextInput
//           style={cac.input}
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
//       {error && <Text style={cac.errorText}>{error}</Text>}

//       {showSuggestions && suggestions.length > 0 && (
//         <View style={cac.dropdown}>
//           <ScrollView
//             keyboardShouldPersistTaps="handled"
//             nestedScrollEnabled
//             style={{ maxHeight: 200 }}
//           >
//             {suggestions.map((item, idx) => (
//               <TouchableOpacity
//                 key={String(idx)}
//                 style={[
//                   cac.suggestionItem,
//                   idx < suggestions.length - 1 && {
//                     borderBottomWidth: 1,
//                     borderBottomColor: COLORS.gray100,
//                   },
//                 ]}
//                 onPress={() => handleSelect(item)}
//                 activeOpacity={0.7}
//               >
//                 <Text style={cac.suggestionName}>{item.name}</Text>
//                 <Text style={cac.suggestionContact}>{item.contact}</Text>
//                 {!!item.address && (
//                   <Text style={cac.suggestionAddress}>{item.address}</Text>
//                 )}
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>
//       )}
//     </View>
//   );
// };

// const cac = StyleSheet.create({
//   label: {
//     ...FONTS.medium,
//     fontSize: 14,
//     marginBottom: SPACING.xs,
//     color: COLORS.gray700,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderRadius: BORDERS.radius.md,
//     paddingHorizontal: SPACING.md,
//     backgroundColor: COLORS.white,
//     height: 48,
//   },
//   input: {
//     flex: 1,
//     ...FONTS.regular,
//     fontSize: 16,
//     color: COLORS.gray900,
//     paddingVertical: SPACING.sm,
//   },
//   errorText: {
//     ...FONTS.regular,
//     fontSize: 12,
//     color: COLORS.error,
//     marginTop: SPACING.xs,
//   },
//   dropdown: {
//     position: 'absolute',
//     top: 78,
//     left: 0,
//     right: 0,
//     zIndex: 9999,
//     elevation: 10,
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//     borderRadius: BORDERS.radius.md,
//     maxHeight: 240,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//   },
//   suggestionItem: {
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//   },
//   suggestionName: {
//     ...FONTS.semibold,
//     fontSize: 14,
//     color: COLORS.gray900,
//   },
//   suggestionContact: {
//     ...FONTS.regular,
//     fontSize: 12,
//     color: COLORS.gray500,
//     marginTop: 2,
//   },
//   suggestionAddress: {
//     ...FONTS.regular,
//     fontSize: 11,
//     color: COLORS.gray400,
//     marginTop: 2,
//   },
// });

// // ─── Engineer Select Modal ─────────────────────────────────────────────────
// const EngineerSelectModal = ({ engineers, workloadMap, value, onSelect }) => {
//   const [visible, setVisible] = useState(false);

//   const getWorkloadInfo = engineerName => {
//     const count = workloadMap[engineerName] || 0;
//     const free = MAX_JOBS - count;

//     if (count >= MAX_JOBS) {
//       return {
//         sublabel: 'Full capacity',
//         icon: <XCircle size={15} color="#dc2626" />,
//         sublabelColor: '#dc2626',
//         badgeBg: '#fee2e2',
//         disabled: true,
//       };
//     }
//     if (count >= 4) {
//       return {
//         sublabel: `${count}/${MAX_JOBS} jobs — ${free} slot left`,
//         icon: <AlertTriangle size={15} color="#d97706" />,
//         sublabelColor: '#d97706',
//         badgeBg: '#fef3c7',
//         disabled: false,
//       };
//     }
//     return {
//       sublabel: `${count}/${MAX_JOBS} jobs — ${free} slots free`,
//       icon: <CheckCircle size={15} color="#16a34a" />,
//       sublabelColor: '#16a34a',
//       badgeBg: '#dcfce7',
//       disabled: false,
//     };
//   };

//   const selectedEngineer = engineers.find(e => e.id === value);
//   const selectedInfo = selectedEngineer
//     ? getWorkloadInfo(selectedEngineer.name)
//     : null;

//   return (
//     <View style={{ marginBottom: SPACING.md }}>
//       <Text style={esl.label}>Select Engineer</Text>

//       <TouchableOpacity
//         style={esl.trigger}
//         onPress={() => setVisible(true)}
//         activeOpacity={0.7}
//       >
//         {selectedEngineer ? (
//           <View style={esl.triggerSelected}>
//             <View style={{ flex: 1 }}>
//               <Text style={esl.triggerName}>{selectedEngineer.name}</Text>
//               <View
//                 style={[
//                   esl.triggerBadge,
//                   { backgroundColor: selectedInfo.badgeBg },
//                 ]}
//               >
//                 {selectedInfo.icon}
//                 <Text
//                   style={[
//                     esl.triggerBadgeText,
//                     { color: selectedInfo.sublabelColor },
//                   ]}
//                 >
//                   {selectedInfo.sublabel}
//                 </Text>
//               </View>
//             </View>
//             <ChevronDown size={18} color={COLORS.gray500} />
//           </View>
//         ) : (
//           <View style={esl.triggerPlaceholderRow}>
//             <Text style={esl.triggerPlaceholder}>Select Engineer</Text>
//             <ChevronDown size={18} color={COLORS.gray400} />
//           </View>
//         )}
//       </TouchableOpacity>

//       <Modal
//         visible={visible}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setVisible(false)}
//       >
//         <View style={esl.overlay}>
//           <View style={esl.sheet}>
//             <View style={esl.sheetHeader}>
//               <Text style={esl.sheetTitle}>Select Engineer</Text>
//               <TouchableOpacity
//                 onPress={() => setVisible(false)}
//                 hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//               >
//                 <X size={24} color={COLORS.gray600} />
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               style={esl.sheetList}
//               showsVerticalScrollIndicator={false}
//             >
//               {engineers.map(engineer => {
//                 const info = getWorkloadInfo(engineer.name);
//                 const isSelected = engineer.id === value;

//                 return (
//                   <TouchableOpacity
//                     key={engineer.id}
//                     style={[
//                       esl.option,
//                       isSelected && esl.optionSelected,
//                       info.disabled && esl.optionDisabled,
//                     ]}
//                     onPress={() => {
//                       if (!info.disabled) {
//                         onSelect(engineer.id);
//                         setVisible(false);
//                       }
//                     }}
//                     activeOpacity={info.disabled ? 1 : 0.7}
//                     disabled={info.disabled}
//                   >
//                     <View style={esl.optionLeft}>
//                       <Text
//                         style={[
//                           esl.optionName,
//                           isSelected && esl.optionNameSelected,
//                           info.disabled && esl.optionNameDisabled,
//                         ]}
//                       >
//                         {engineer.name}
//                       </Text>
//                       <View
//                         style={[esl.badge, { backgroundColor: info.badgeBg }]}
//                       >
//                         {info.icon}
//                         <Text
//                           style={[esl.badgeText, { color: info.sublabelColor }]}
//                         >
//                           {info.sublabel}
//                         </Text>
//                       </View>
//                     </View>
//                     {isSelected && (
//                       <CheckCircle size={20} color={COLORS.primary} />
//                     )}
//                   </TouchableOpacity>
//                 );
//               })}
//               <View style={{ height: 20 }} />
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const esl = StyleSheet.create({
//   label: {
//     ...FONTS.medium,
//     fontSize: 14,
//     color: COLORS.gray700,
//     marginBottom: SPACING.xs,
//   },
//   trigger: {
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//     borderRadius: BORDERS.radius.md,
//     paddingHorizontal: SPACING.md,
//     paddingVertical: 12,
//     backgroundColor: COLORS.white,
//     minHeight: 48,
//     justifyContent: 'center',
//   },
//   triggerSelected: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     gap: 8,
//   },
//   triggerName: {
//     ...FONTS.semibold,
//     fontSize: 15,
//     color: COLORS.gray900,
//     marginBottom: 4,
//   },
//   triggerBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     paddingVertical: 2,
//     paddingHorizontal: 8,
//     borderRadius: 20,
//     alignSelf: 'flex-start',
//   },
//   triggerBadgeText: {
//     ...FONTS.medium,
//     fontSize: 11,
//   },
//   triggerPlaceholderRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   triggerPlaceholder: {
//     ...FONTS.regular,
//     fontSize: 15,
//     color: COLORS.gray400,
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   sheet: {
//     backgroundColor: COLORS.white,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingBottom: 32,
//     maxHeight: '75%',
//   },
//   sheetHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: SPACING.lg,
//     paddingVertical: SPACING.md,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.gray100,
//   },
//   sheetTitle: {
//     ...FONTS.bold,
//     fontSize: 17,
//     color: COLORS.gray900,
//   },
//   sheetList: {
//     paddingHorizontal: SPACING.lg,
//     paddingTop: SPACING.sm,
//   },
//   option: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.gray100,
//   },
//   optionSelected: {
//     backgroundColor: '#eff6ff',
//     marginHorizontal: -SPACING.lg,
//     paddingHorizontal: SPACING.lg,
//   },
//   optionDisabled: {
//     opacity: 0.45,
//   },
//   optionLeft: {
//     flex: 1,
//     gap: 5,
//   },
//   optionName: {
//     ...FONTS.semibold,
//     fontSize: 15,
//     color: COLORS.gray900,
//   },
//   optionNameSelected: {
//     color: COLORS.primary,
//   },
//   optionNameDisabled: {
//     color: COLORS.gray400,
//   },
//   badge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     paddingVertical: 3,
//     paddingHorizontal: 8,
//     borderRadius: 20,
//     alignSelf: 'flex-start',
//   },
//   badgeText: {
//     ...FONTS.medium,
//     fontSize: 11,
//   },
// });

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
//       <Text style={styles.sectionTitle}>Visual Inspection</Text>

//       {visualIssues.map((issue, index) => (
//         <View key={index} style={{ marginBottom: SPACING.md }}>
//           <View style={styles.visualRow}>
//             <View style={{ flex: 1 }}>
//               <SelectModal
//                 value={
//                   customFaults[index] !== undefined ? '__custom' : issue || ''
//                 }
//                 options={[
//                   ...faultList.map(f => ({ id: f.name, name: f.name })),
//                   { id: '__custom', name: 'Other (Add New)' },
//                 ]}
//                 onSelect={val => handleSelectChange(index, val)}
//                 placeholder="Select Issue"
//                 hideLabel
//               />
//               {customFaults[index] !== undefined && (
//                 <TextInput
//                   style={styles.customFaultInput}
//                   placeholder="Enter Fault"
//                   value={customFaults[index]}
//                   onChangeText={text => {
//                     setCustomFaults({ ...customFaults, [index]: text });
//                     updateIssue(index, text);
//                   }}
//                 />
//               )}
//             </View>
//             {visualIssues.length > 1 && (
//               <TouchableOpacity
//                 onPress={() => removeIssue(index)}
//                 style={styles.removeVisualButton}
//               >
//                 <X size={20} color={COLORS.danger} />
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       ))}

//       <TouchableOpacity onPress={addIssue} style={styles.addVisualButton}>
//         <Plus size={18} color={COLORS.primary} />
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
//     <View style={ipu.container}>
//       <Text style={ipu.label}>ID Proof Image</Text>
//       <TouchableOpacity
//         onPress={pickImage}
//         style={[
//           ipu.uploadBox,
//           isDisabled && ipu.uploadBoxDisabled,
//           imageUri && ipu.uploadBoxHasImage,
//         ]}
//         disabled={isDisabled}
//       >
//         {imageUri ? (
//           <Image source={{ uri: imageUri }} style={ipu.previewImage} />
//         ) : (
//           <View style={ipu.uploadPlaceholder}>
//             <Camera
//               size={32}
//               color={isDisabled ? COLORS.gray400 : COLORS.gray500}
//             />
//             <Text
//               style={[ipu.uploadText, isDisabled && ipu.uploadTextDisabled]}
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
//           style={ipu.removeButton}
//         >
//           <Text style={ipu.removeText}>Remove Image</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };

// const ipu = StyleSheet.create({
//   container: { marginBottom: SPACING.md },
//   label: {
//     ...FONTS.medium,
//     fontSize: 14,
//     color: COLORS.gray700,
//     marginBottom: SPACING.xs,
//   },
//   uploadBox: {
//     borderWidth: 2,
//     borderColor: COLORS.gray200,
//     borderRadius: BORDERS.radius.md,
//     height: 120,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.gray50,
//     borderStyle: 'dashed',
//   },
//   uploadBoxDisabled: {
//     borderColor: COLORS.gray300,
//     backgroundColor: COLORS.gray100,
//   },
//   uploadBoxHasImage: {
//     borderStyle: 'solid',
//     borderColor: COLORS.primary,
//   },
//   uploadPlaceholder: { alignItems: 'center', gap: 8 },
//   uploadText: {
//     ...FONTS.regular,
//     fontSize: 13,
//     color: COLORS.gray500,
//     marginTop: 4,
//   },
//   uploadTextDisabled: { color: COLORS.gray400 },
//   previewImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: BORDERS.radius.md,
//     resizeMode: 'cover',
//   },
//   removeButton: { marginTop: SPACING.xs, alignSelf: 'flex-end' },
//   removeText: { ...FONTS.medium, fontSize: 12, color: COLORS.danger },
// });

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
//   const [openAdvanceDate, setOpenAdvanceDate] = useState(false);
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

//   const [advancePopupVisible, setAdvancePopupVisible] = useState(false);
//   const [sparePopupVisible, setSparePopupVisible] = useState(false);

//   const savedJobIdRef = useRef(jobId || null);
//   const isLoading = jobLoading;

//   // ─── Reset Function for New Job ──────────────────────────────────────────
//   const resetForm = () => {
//     // Reset local states
//     setVisualIssues(['']);
//     setCustomFaults({});
//     setIdProofImage(null);
//     setIdProofPreview(null);
//     setSparePopupVisible(false);
//     setAdvancePopupVisible(false);
//     setConfirmModal({ visible: false, action: null, pendingValues: null });
//     setSearchText('');
//     setSearchResults([]);
//     setShowSearchModal(false);
    
//     // Clear Redux state
//     dispatch(clearCurrentJob());
    
//     // Reset saved job ID
//     savedJobIdRef.current = null;
//   };

//   // ─── Fetch Data ──────────────────────────────────────────────────────────
//   useEffect(() => {
//     // If mode is 'new', clear any existing data
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

//   const recalculateMargin = (setFieldValue, serviceCharges, spareCharges, spareItems) => {
//     const { estimate, margin } = calculateFinancials(serviceCharges, spareCharges, spareItems);
//     setFieldValue('estimateAmount', estimate.toString());
//     setFieldValue('marginAmount', margin.toString());
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
    
//     // Calculate advance total from items
//     const advanceTotal = calculateAdvanceTotal(values.advanceItems);
//     const advanceAmount = advanceTotal > 0 ? advanceTotal : (parseFloat(values.advanceAmount) || 0);
    
//     return {
//       ...values,
//       serviceCharges: parseFloat(values.serviceCharges) || 0,
//       spareCharges: parseFloat(values.spareCharges) || 0,
//       estimateAmount: estimate,
//       marginAmount: margin,
//       advanceAmount: advanceAmount,
//       advanceDate: values.advanceDate ? values.advanceDate.toISOString() : null,
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
//       style={{ flex: 1, backgroundColor: '#F8FAFC' }}
//       showsVerticalScrollIndicator={false}
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
//               <View style={{ padding: SPACING.lg, paddingBottom: SPACING.xxl }}>
//                 {/* ─── Job Sheet Header ──────────────────────────────────── */}
//                 <View style={styles.section}>
//                   <View style={styles.jobSheetHeader}>
//                     <View style={styles.jobSheetHeaderLeft}>
//                       <FileText size={18} color={COLORS.primary} />
//                       <Text style={styles.jobSheetNo}>
//                         Job Sheet No: {values.jobSheetNo || 'New'}
//                       </Text>
//                     </View>
//                     <View style={styles.dateTimeContainer}>
//                       <View style={styles.dateTimeItem}>
//                         <Calendar size={14} color={COLORS.gray500} />
//                         <Text style={styles.dateTimeText}>
//                           {values.createdAt || getCurrentDate()}
//                         </Text>
//                       </View>
//                       <View style={styles.dateTimeItem}>
//                         <Clock size={14} color={COLORS.gray500} />
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
//                         <Search size={20} color={COLORS.white} />
//                       )}
//                     </TouchableOpacity>
//                   </View>
//                 </View>

//                 {/* ─── Physical Condition ───────────────────────────────── */}
//                 <View style={styles.section}>
//                   <Text style={styles.sectionTitle}>Physical Condition</Text>
//                   <View style={styles.checkboxGroup}>
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
//                       />
//                     ))}
//                   </View>
//                   <Input
//                     label="Other Details"
//                     value={values.batteryNumber}
//                     onChangeText={t => setFieldValue('batteryNumber', t)}
//                     placeholder="Other Details"
//                   />
//                 </View>

//                 {/* ─── Accessories Received ─────────────────────────────── */}
//                 <View style={styles.section}>
//                   <Text style={styles.sectionTitle}>Accessories Received</Text>
//                   <View style={styles.checkboxGroup}>
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
//                       />
//                     ))}
//                   </View>
//                   <Input
//                     label="Battery Number"
//                     value={values.batteryNumber}
//                     onChangeText={t => setFieldValue('batteryNumber', t)}
//                     placeholder="Battery Number"
//                   />
//                 </View>

//                 {/* ─── Customer Details ─────────────────────────────────── */}
//                 <View style={styles.section}>
//                   <Text style={styles.sectionTitle}>Customer Details</Text>

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
//                     placeholder="Customer Name *"
//                     required
//                     error={touched.customerName && errors.customerName}
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
//                     placeholder="Contact No *"
//                     keyboardType="phone-pad"
//                     maxLength={10}
//                     required
//                     error={touched.contact && errors.contact}
//                   />

//                   <Input
//                     label="Alt Contact"
//                     value={values.altContact}
//                     onChangeText={t => setFieldValue('altContact', t)}
//                     keyboardType="phone-pad"
//                     maxLength={10}
//                     placeholder="Alt Contact"
//                   />
//                   <Input
//                     label="Customer Address"
//                     value={values.address}
//                     onChangeText={t => setFieldValue('address', t)}
//                     multiline
//                     placeholder="Customer Address"
//                   />
//                   <Input
//                     label="Email ID"
//                     value={values.email}
//                     onChangeText={t => setFieldValue('email', t)}
//                     keyboardType="email-address"
//                     placeholder="Email ID"
//                     error={touched.email && errors.email}
//                   />

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

//                 {/* ─── Device Details ───────────────────────────────────── */}
//                 <View style={styles.section}>
//                   <Text style={styles.sectionTitle}>Device Details</Text>

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

//                   <Input
//                     label="IMEI"
//                     value={values.imei}
//                     onChangeText={t => setFieldValue('imei', t)}
//                     keyboardType="numeric"
//                     maxLength={15}
//                     placeholder="IMEI *"
//                   />

//                   <SelectModal
//                     label="Status"
//                     value={values.status}
//                     options={statusOptions}
//                     onSelect={v => setFieldValue('status', v)}
//                     placeholder="All Status"
//                   />

//                   <SelectModal
//                     label="Warranty"
//                     value={values.warranty}
//                     options={warrantyOptions}
//                     onSelect={v => setFieldValue('warranty', v)}
//                   />

//                   <Input
//                     label="Pattern / PIN"
//                     value={values.patternPin}
//                     onChangeText={t => setFieldValue('patternPin', t)}
//                     placeholder="Pattern / PIN"
//                   />
//                 </View>

//                 {/* ─── Service / Repair Details ─────────────────────────── */}
//                 <View style={styles.section}>
//                   <Text style={styles.sectionTitle}>
//                     Service / Repair Details
//                   </Text>

//                   {/* ── Engineer Select with workload badges ── */}
//                   <EngineerSelectModal
//                     engineers={engineers}
//                     workloadMap={workloadMap}
//                     value={values.engineerId}
//                     onSelect={v => setFieldValue('engineerId', v)}
//                   />

//                   <Input
//                     label="Dealer Name"
//                     value={values.dealerName}
//                     onChangeText={t => setFieldValue('dealerName', t)}
//                     placeholder="Dealer Name"
//                   />

//                   <SelectModal
//                     label="Select Drawer"
//                     value={values.drawerId}
//                     options={drawers}
//                     onSelect={v => setFieldValue('drawerId', v)}
//                     placeholder="Select Drawer"
//                   />

//                   {/* ── Service Charges and Spare Charges ── */}
//                   <View style={styles.row}>
//                     <View style={{ flex: 1, marginRight: SPACING.sm }}>
//                       <Input
//                         label="Service Charges"
//                         value={values.serviceCharges}
//                         onChangeText={t => {
//                           const val = onlyNumbers(t);
//                           setFieldValue('serviceCharges', val);
//                           const { estimate, margin } = calculateFinancials(
//                             val,
//                             values.spareCharges,
//                             values.spareItems
//                           );
//                           setFieldValue('estimateAmount', estimate.toString());
//                           setFieldValue('marginAmount', margin.toString());
//                         }}
//                         keyboardType="numeric"
//                         placeholder="Service Charges"
//                       />
//                     </View>
//                     <View style={{ flex: 1 }}>
//                       <Input
//                         label="Spare Charges"
//                         value={values.spareCharges}
//                         onChangeText={t => {
//                           const val = onlyNumbers(t);
//                           setFieldValue('spareCharges', val);
//                           // If user manually enters spare charge, clear spare items
//                           if (val > 0 && (values.spareItems || []).length > 0) {
//                             setFieldValue('spareItems', []);
//                           }
//                           const { estimate, margin } = calculateFinancials(
//                             values.serviceCharges,
//                             val,
//                             values.spareItems
//                           );
//                           setFieldValue('estimateAmount', estimate.toString());
//                           setFieldValue('marginAmount', margin.toString());
//                         }}
//                         keyboardType="numeric"
//                         placeholder="Spare Charges"
//                         editable={(values.spareItems || []).length === 0}
//                       />
//                       {(values.spareItems || []).length > 0 && (
//                         <Text style={styles.readOnlyHint}>
//                           Auto-calculated from {values.spareItems.length} spare items
//                         </Text>
//                       )}
//                     </View>
//                   </View>

//                   {/* ── Spare Parts Section ── */}
//                   <View style={{ marginTop: SPACING.md }}>
//                     <Text style={styles.subsectionTitle}>Spare Parts</Text>

//                     <TouchableOpacity
//                       onPress={() => setSparePopupVisible(true)}
//                       activeOpacity={0.7}
//                     >
//                       <View style={styles.spareChargeTrigger}>
//                         <View style={styles.spareChargeRow}>
//                           <View style={styles.spareChargeLeft}>
//                             <Text style={styles.spareChargeLabel}>
//                               Total Spare Charges
//                             </Text>
//                             <Text style={styles.spareChargeValue}>
//                               ₹{values.spareCharges || 0}
//                             </Text>
//                           </View>
//                           <View style={styles.spareChargeRight}>
//                             <View style={styles.spareChargeBadge}>
//                               <Text style={styles.spareChargeBadgeText}>
//                                 {(values.spareItems || []).length} items
//                               </Text>
//                             </View>
//                             <Text style={styles.spareChargeHint}>
//                               Tap to manage spare items
//                             </Text>
//                           </View>
//                         </View>
//                       </View>
//                     </TouchableOpacity>

//                     {/* Display items summary */}
//                     {(values.spareItems || []).length > 0 && (
//                       <View style={styles.spareItemsPreview}>
//                         <Text style={styles.spareItemsPreviewTitle}>
//                           Added Items:
//                         </Text>
//                         {(values.spareItems || [])
//                           .slice(0, 3)
//                           .map((item, idx) => (
//                             <Text
//                               key={idx}
//                               style={styles.spareItemsPreviewItem}
//                             >
//                               {item.name} × {item.qty} = ₹
//                               {(item.qty * item.rate).toFixed(0)}
//                             </Text>
//                           ))}
//                         {(values.spareItems || []).length > 3 && (
//                           <Text style={styles.spareItemsPreviewMore}>
//                             + {values.spareItems.length - 3} more items
//                           </Text>
//                         )}
//                       </View>
//                     )}
//                   </View>

//                   {/* ── Financial Summary Display ── */}
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
//                     </View>
                    
//                     <View style={[styles.financialRow, styles.financialTotal]}>
//                       <View style={styles.financialItem}>
//                         <Text style={styles.financialLabel}>Estimate Amount</Text>
//                         <Text style={[styles.financialValue, styles.financialValueTotal]}>
//                           ₹{values.estimateAmount || 0}
//                         </Text>
//                       </View>
//                       <View style={styles.financialItem}>
//                         <Text style={styles.financialLabel}>Margin</Text>
//                         <Text style={[styles.financialValue, styles.financialValueMargin]}>
//                           ₹{values.marginAmount || 0}
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

//                   <SelectModal
//                     label="Payment Mode"
//                     value={values.paymentMode}
//                     options={paymentOptions}
//                     onSelect={v => setFieldValue('paymentMode', v)}
//                     placeholder="Payment Mode"
//                   />

//                   {/* ── Advance Section ── */}
//                   <View style={styles.advanceSection}>
//                     <TouchableOpacity
//                       onPress={() => setAdvancePopupVisible(true)}
//                       activeOpacity={0.7}
//                     >
//                       <View style={styles.advanceTrigger}>
//                         <View style={styles.advanceRow}>
//                           <View style={styles.advanceLeft}>
//                             <Text style={styles.advanceLabel}>
//                               Advance Amount
//                             </Text>
//                             <Text style={styles.advanceValue}>
//                               ₹{values.advanceAmount || 0}
//                             </Text>
//                           </View>
//                           <View style={styles.advanceRight}>
//                             <View style={styles.advanceBadge}>
//                               <Text style={styles.advanceBadgeText}>
//                                 {(values.advanceItems || []).length} payments
//                               </Text>
//                             </View>
//                             <Text style={styles.advanceHint}>
//                               Tap to manage payments
//                             </Text>
//                           </View>
//                         </View>
//                       </View>
//                     </TouchableOpacity>

//                     {/* Display advance items preview */}
//                     {(values.advanceItems || []).length > 0 && (
//                       <View style={styles.advanceItemsPreview}>
//                         <Text style={styles.advanceItemsPreviewTitle}>
//                           Payment History:
//                         </Text>
//                         {(values.advanceItems || [])
//                           .slice(0, 3)
//                           .map((item, idx) => (
//                             <Text
//                               key={idx}
//                               style={styles.advanceItemsPreviewItem}
//                             >
//                               {item.label || `Payment ${idx + 1}`}: ₹
//                               {item.amount}
//                               {item.date
//                                 ? ` (${new Date(
//                                     item.date,
//                                   ).toLocaleDateString()})`
//                                 : ''}
//                             </Text>
//                           ))}
//                         {(values.advanceItems || []).length > 3 && (
//                           <Text style={styles.advanceItemsPreviewMore}>
//                             + {values.advanceItems.length - 3} more payments
//                           </Text>
//                         )}
//                       </View>
//                     )}
//                   </View>

//                   {/* ── Pending Amount ── */}
//                   <View style={styles.pendingSection}>
//                     <Text style={styles.pendingLabel}>Pending Amount</Text>
//                     <Text style={styles.pendingValue}>
//                       ₹{Math.max(0, (parseFloat(values.estimateAmount) || 0) - (parseFloat(values.advanceAmount) || 0))}
//                     </Text>
//                   </View>

//                   <View style={styles.row}>
//                     <View style={{ flex: 1, marginRight: SPACING.sm }}>
//                       <SelectModal
//                         label="Service Rep"
//                         value={values.serviceRepId}
//                         options={salesReps}
//                         onSelect={v => setFieldValue('serviceRepId', v)}
//                         placeholder="Service Rep"
//                       />
//                     </View>
//                   </View>

//                   <Text style={styles.fieldLabel}>Repair Date</Text>
//                   <TouchableOpacity
//                     onPress={() => setOpenRepairDate(true)}
//                     style={styles.dateButton}
//                   >
//                     <Calendar size={20} color={COLORS.gray600} />
//                     <Text style={styles.dateText}>
//                       {values.repairDate?.toLocaleDateString()}
//                     </Text>
//                   </TouchableOpacity>
//                   <DatePicker
//                     modal
//                     open={openRepairDate}
//                     date={values.repairDate || new Date()}
//                     onConfirm={date => {
//                       setOpenRepairDate(false);
//                       setFieldValue('repairDate', date);
//                     }}
//                     onCancel={() => setOpenRepairDate(false)}
//                   />

//                   <Text style={styles.fieldLabel}>Delivery Date</Text>
//                   <TouchableOpacity
//                     onPress={() => setOpenDeliveryDate(true)}
//                     style={styles.dateButton}
//                   >
//                     <Calendar size={20} color={COLORS.gray600} />
//                     <Text style={styles.dateText}>
//                       {values.deliveryDate
//                         ? values.deliveryDate.toLocaleDateString()
//                         : 'Select Date'}
//                     </Text>
//                   </TouchableOpacity>
//                   <DatePicker
//                     modal
//                     open={openDeliveryDate}
//                     date={values.deliveryDate || new Date()}
//                     onConfirm={date => {
//                       setOpenDeliveryDate(false);
//                       setFieldValue('deliveryDate', date);
//                     }}
//                     onCancel={() => setOpenDeliveryDate(false)}
//                   />

//                   <View style={styles.row}>
//                     <View style={{ flex: 1, marginRight: SPACING.sm }}>
//                       <SelectModal
//                         label="Insta Follow"
//                         value={values.instaFollowers}
//                         options={instaFollowOptions}
//                         onSelect={v => setFieldValue('instaFollowers', v)}
//                         placeholder="Select"
//                       />
//                     </View>
//                     <View style={{ flex: 1 }}>
//                       <SelectModal
//                         label="Google Review"
//                         value={values.googleReview}
//                         options={googleReviewOptions}
//                         onSelect={v => setFieldValue('googleReview', v)}
//                         placeholder="Select"
//                       />
//                     </View>
//                   </View>

//                   <Input
//                     label="Remarks"
//                     value={values.remarks}
//                     onChangeText={t => setFieldValue('remarks', t)}
//                     multiline
//                     placeholder="Remarks"
//                   />
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
//                     <Save size={22} color={COLORS.white} />
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
//                       <RefreshCw size={20} color={COLORS.gray700} />
//                       <Text style={styles.secondaryButtonText}>Refresh</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                       style={styles.secondaryButton}
//                       onPress={() =>
//                         calculateEstimate(setFieldValue, () => values)
//                       }
//                       disabled={buttonsDisabled}
//                     >
//                       <Calculator size={20} color={COLORS.gray700} />
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
//                       <FileText size={20} color="#F59E0B" />
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
//                       <Receipt size={20} color={COLORS.primary} />
//                       <Text
//                         style={[
//                           styles.secondaryButtonText,
//                           { color: COLORS.primary },
//                         ]}
//                       >
//                         Invoice
//                       </Text>
//                     </TouchableOpacity>

//                     {/* ─── NEW JOB BUTTON ── */}
//                     <TouchableOpacity
//                       style={[styles.secondaryButton, styles.newJobBtn]}
//                       onPress={handleNewJob}
//                       disabled={buttonsDisabled}
//                     >
//                       <Plus size={20} color={COLORS.primary} />
//                       <Text style={[styles.secondaryButtonText, { color: COLORS.primary }]}>
//                         New Job
//                       </Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                       style={styles.secondaryButton}
//                       onPress={() => navigation.navigate('Home')}
//                       disabled={buttonsDisabled}
//                     >
//                       <Home size={20} color={COLORS.gray700} />
//                       <Text style={styles.secondaryButtonText}>Home</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               </View>

//               {/* ─── Spare Popup ──────────────────── */}
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

//               {/* ─── Advance Popup ──────────────────────────────────── */}
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
//             </>
//           );
//         }}
//       </Formik>

//       {/* ─── Search Results Modal ──────────────────────────────────────── */}
//       <Modal
//         visible={showSearchModal}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setShowSearchModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Search Results</Text>
//               <TouchableOpacity onPress={() => setShowSearchModal(false)}>
//                 <X size={24} color={COLORS.gray600} />
//               </TouchableOpacity>
//             </View>
//             <ScrollView style={styles.modalBody}>
//               {searchResults.length === 0 ? (
//                 <Text style={styles.noResults}>No results found</Text>
//               ) : (
//                 searchResults.map((job, index) => (
//                   <TouchableOpacity
//                     key={job._id || index}
//                     style={styles.searchResultItem}
//                     onPress={() => {
//                       setShowSearchModal(false);
//                       navigation.navigate('JobSheet', {
//                         screen: 'JobDetail',
//                         params: { jobId: job._id },
//                       });
//                     }}
//                   >
//                     <Text style={styles.resultJobNo}>{job.jobSheetNo}</Text>
//                     <Text style={styles.resultCustomer}>
//                       {job.customer?.name || 'Unknown'}
//                     </Text>
//                     <Text style={styles.resultStatus}>
//                       {job.device?.mobileStatus || 'Unknown'}
//                     </Text>
//                   </TouchableOpacity>
//                 ))
//               )}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>

//       {/* ─── Preview Confirm Modal ─────────────────────────────────────── */}
//       <Modal
//         visible={confirmModal.visible && confirmModal.action === 'save'}
//         transparent
//         animationType="slide"
//         onRequestClose={closeConfirm}
//       >
//         <View style={styles.previewOverlay}>
//           <View style={styles.previewCard}>
//             <View style={styles.previewHeader}>
//               <CheckCircle size={22} color={COLORS.primary} />
//               <Text style={styles.previewTitle}>
//                 {mode === 'edit' ? 'Review & Update' : 'Review & Save'}
//               </Text>
//             </View>
//             <Text style={styles.previewSubTitle}>
//               Please review the details before saving
//             </Text>

//             <ScrollView
//               style={styles.previewScroll}
//               showsVerticalScrollIndicator={false}
//             >
//               <View style={styles.previewSection}>
//                 <Text style={styles.previewSectionTitle}>Customer</Text>
//                 <View style={styles.previewRow}>
//                   <Text style={styles.previewLabel}>Name</Text>
//                   <Text style={styles.previewValue}>
//                     {confirmModal.pendingValues?.customerName || '—'}
//                   </Text>
//                 </View>
//                 <View style={styles.previewRow}>
//                   <Text style={styles.previewLabel}>Contact</Text>
//                   <Text style={styles.previewValue}>
//                     {confirmModal.pendingValues?.contact || '—'}
//                   </Text>
//                 </View>
//                 <View style={styles.previewRow}>
//                   <Text style={styles.previewLabel}>Address</Text>
//                   <Text style={styles.previewValue}>
//                     {confirmModal.pendingValues?.address || '—'}
//                   </Text>
//                 </View>
//               </View>

//               <View style={styles.previewSection}>
//                 <Text style={styles.previewSectionTitle}>Service</Text>
//                 <View style={styles.previewRow}>
//                   <Text style={styles.previewLabel}>Service Charge</Text>
//                   <Text style={styles.previewValue}>
//                     Rs. {confirmModal.pendingValues?.serviceCharges || 0}
//                   </Text>
//                 </View>
//                 <View style={styles.previewRow}>
//                   <Text style={styles.previewLabel}>Spare Charge</Text>
//                   <Text style={styles.previewValue}>
//                     Rs. {confirmModal.pendingValues?.spareCharges || 0}
//                   </Text>
//                 </View>
//                 <View style={styles.previewRow}>
//                   <Text style={styles.previewLabel}>Estimate</Text>
//                   <Text style={styles.previewValue}>
//                     Rs. {confirmModal.pendingValues?.estimateAmount || 0}
//                   </Text>
//                 </View>
//                 <View style={styles.previewRow}>
//                   <Text style={styles.previewLabel}>Margin</Text>
//                   <Text style={styles.previewValue}>
//                     Rs. {confirmModal.pendingValues?.marginAmount || 0}
//                   </Text>
//                 </View>
//               </View>
//             </ScrollView>

//             <View style={styles.previewButtons}>
//               <TouchableOpacity
//                 style={[
//                   styles.previewBtn,
//                   styles.previewCancelBtn,
//                   isConfirming && { opacity: 0.6 },
//                 ]}
//                 onPress={closeConfirm}
//                 disabled={isConfirming}
//               >
//                 <Text style={styles.previewCancelText}>Edit</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[
//                   styles.previewBtn,
//                   styles.previewConfirmBtn,
//                   isConfirming && { opacity: 0.6 },
//                 ]}
//                 onPress={handleConfirm}
//                 disabled={isConfirming}
//               >
//                 <Save size={16} color="#fff" />
//                 <Text style={styles.previewConfirmText}>
//                   {isConfirming
//                     ? 'Saving...'
//                     : mode === 'edit'
//                     ? 'Update'
//                     : 'Save'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* ─── Alert Confirm Modal ───────────────────────────────────────── */}
//       {confirmModal.visible &&
//         (confirmModal.action === 'invoice' ||
//           confirmModal.action === 'estimate') && (
//           <Modal
//             visible={true}
//             transparent
//             animationType="fade"
//             onRequestClose={closeConfirm}
//           >
//             <View style={styles.alertOverlay}>
//               <View style={styles.alertCard}>
//                 <AlertCircle
//                   size={36}
//                   color={
//                     confirmModal.action === 'invoice'
//                       ? COLORS.primary
//                       : '#F59E0B'
//                   }
//                 />
//                 <Text style={styles.alertTitle}>
//                   {confirmModal.action === 'invoice'
//                     ? 'Save & Open Invoice?'
//                     : 'Save & Open Estimate?'}
//                 </Text>
//                 <Text style={styles.alertMsg}>
//                   {confirmModal.action === 'invoice'
//                     ? 'The job sheet will be saved first, then the invoice will open.'
//                     : 'The job sheet will be saved first, then the estimate will open.'}
//                 </Text>
//                 <View style={styles.alertButtons}>
//                   <TouchableOpacity
//                     style={[
//                       styles.alertBtn,
//                       styles.alertCancelBtn,
//                       isConfirming && { opacity: 0.6 },
//                     ]}
//                     onPress={closeConfirm}
//                     disabled={isConfirming}
//                   >
//                     <Text style={styles.alertCancelText}>Cancel</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={[
//                       styles.alertBtn,
//                       styles.alertConfirmBtn,
//                       isConfirming && { opacity: 0.6 },
//                     ]}
//                     onPress={handleConfirm}
//                     disabled={isConfirming}
//                   >
//                     <Text style={styles.alertConfirmText}>
//                       {isConfirming
//                         ? 'Saving...'
//                         : confirmModal.action === 'invoice'
//                         ? 'Save & Invoice'
//                         : 'Save & Estimate'}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </View>
//           </Modal>
//         )}

//       <LoadingOverlay visible={isLoading} />
//     </KeyboardAwareScrollView>
//   );
// }

// // ─── Styles ──────────────────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   section: {
//     backgroundColor: COLORS.white,
//     borderRadius: BORDERS.radius.lg,
//     padding: SPACING.lg,
//     marginBottom: SPACING.lg,
//     ...SHADOWS.small,
//   },
//   sectionTitle: {
//     ...FONTS.bold,
//     fontSize: 18,
//     color: COLORS.gray900,
//     marginBottom: SPACING.md,
//     borderLeftWidth: 3,
//     borderLeftColor: COLORS.primary,
//     paddingLeft: SPACING.sm,
//   },
//   subsectionTitle: {
//     ...FONTS.semibold,
//     fontSize: 14,
//     color: COLORS.gray700,
//     marginBottom: SPACING.sm,
//   },
//   checkboxGroup: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: SPACING.sm,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   jobSheetHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//   },
//   jobSheetHeaderLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   jobSheetNo: {
//     ...FONTS.bold,
//     fontSize: 16,
//     color: COLORS.gray900,
//   },
//   dateTimeContainer: {
//     flexDirection: 'row',
//     gap: SPACING.md,
//   },
//   dateTimeItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   dateTimeText: {
//     ...FONTS.regular,
//     fontSize: 12,
//     color: COLORS.gray500,
//   },
//   searchSection: {
//     marginBottom: SPACING.lg,
//   },
//   searchRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.white,
//     borderRadius: BORDERS.radius.md,
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//     ...SHADOWS.small,
//   },
//   searchInput: {
//     flex: 1,
//     ...FONTS.regular,
//     fontSize: 14,
//     color: COLORS.gray900,
//     padding: SPACING.md,
//   },
//   searchButton: {
//     backgroundColor: COLORS.primary,
//     padding: SPACING.md,
//     borderTopRightRadius: BORDERS.radius.md,
//     borderBottomRightRadius: BORDERS.radius.md,
//   },
//   fieldLabel: {
//     ...FONTS.medium,
//     fontSize: 14,
//     color: COLORS.gray700,
//     marginBottom: SPACING.xs,
//   },
//   dateButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//     borderRadius: BORDERS.radius.md,
//     padding: SPACING.md,
//     marginBottom: SPACING.md,
//     backgroundColor: COLORS.white,
//     gap: 8,
//   },
//   dateText: {
//     ...FONTS.regular,
//     fontSize: 14,
//     color: COLORS.gray700,
//   },
//   readOnlyLabel: {
//     ...FONTS.medium,
//     fontSize: 14,
//     color: COLORS.gray700,
//     marginBottom: SPACING.xs,
//   },
//   readOnlyBox: {
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//     borderRadius: BORDERS.radius.md,
//     padding: SPACING.md,
//     marginBottom: SPACING.md,
//     backgroundColor: COLORS.gray50,
//     height: 48,
//     justifyContent: 'center',
//   },
//   readOnlyValue: {
//     ...FONTS.regular,
//     fontSize: 14,
//     color: COLORS.gray500,
//   },
//   readOnlyFieldWrapper: {
//     marginBottom: SPACING.sm,
//   },
//   readOnlyHint: {
//     ...FONTS.regular,
//     fontSize: 11,
//     color: COLORS.gray400,
//     marginTop: 4,
//     fontStyle: 'italic',
//   },
//   calcButton: {
//     marginBottom: SPACING.md,
//   },

//   // Financial Summary Styles
//   financialSummary: {
//     backgroundColor: COLORS.gray50,
//     borderRadius: BORDERS.radius.md,
//     padding: SPACING.md,
//     marginBottom: SPACING.md,
//   },
//   financialRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: SPACING.sm,
//   },
//   financialTotal: {
//     borderTopWidth: 1,
//     borderTopColor: COLORS.gray200,
//     paddingTop: SPACING.sm,
//     marginTop: SPACING.xs,
//   },
//   financialItem: {
//     flex: 1,
//   },
//   financialLabel: {
//     ...FONTS.medium,
//     fontSize: 12,
//     color: COLORS.gray500,
//     marginBottom: 2,
//   },
//   financialValue: {
//     ...FONTS.bold,
//     fontSize: 16,
//     color: COLORS.gray900,
//   },
//   financialValueTotal: {
//     color: COLORS.primary,
//     fontSize: 18,
//   },
//   financialValueMargin: {
//     color: '#16a34a',
//   },

//   // Advance Section Styles
//   advanceSection: {
//     marginBottom: SPACING.md,
//   },
//   advanceTrigger: {
//     backgroundColor: COLORS.gray50,
//     borderRadius: BORDERS.radius.md,
//     padding: SPACING.md,
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//     marginBottom: SPACING.sm,
//   },
//   advanceRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   advanceLeft: {
//     flex: 1,
//   },
//   advanceLabel: {
//     ...FONTS.medium,
//     fontSize: 12,
//     color: COLORS.gray500,
//     marginBottom: 2,
//   },
//   advanceValue: {
//     ...FONTS.bold,
//     fontSize: 18,
//     color: COLORS.gray900,
//   },
//   advanceRight: {
//     alignItems: 'flex-end',
//     gap: 4,
//   },
//   advanceBadge: {
//     backgroundColor: COLORS.primary + '20',
//     paddingHorizontal: SPACING.sm,
//     paddingVertical: 2,
//     borderRadius: 20,
//   },
//   advanceBadgeText: {
//     ...FONTS.medium,
//     fontSize: 11,
//     color: COLORS.primary,
//   },
//   advanceHint: {
//     ...FONTS.regular,
//     fontSize: 11,
//     color: COLORS.gray400,
//   },
//   advanceItemsPreview: {
//     backgroundColor: COLORS.white,
//     borderRadius: BORDERS.radius.sm,
//     padding: SPACING.sm,
//     marginBottom: SPACING.md,
//     borderWidth: 1,
//     borderColor: COLORS.gray100,
//   },
//   advanceItemsPreviewTitle: {
//     ...FONTS.medium,
//     fontSize: 12,
//     color: COLORS.gray600,
//     marginBottom: 4,
//   },
//   advanceItemsPreviewItem: {
//     ...FONTS.regular,
//     fontSize: 12,
//     color: COLORS.gray700,
//     paddingVertical: 2,
//   },
//   advanceItemsPreviewMore: {
//     ...FONTS.medium,
//     fontSize: 11,
//     color: COLORS.gray400,
//     marginTop: 2,
//   },

//   // Spare Charge Styles
//   spareChargeTrigger: {
//     backgroundColor: COLORS.gray50,
//     borderRadius: BORDERS.radius.md,
//     padding: SPACING.md,
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//     marginBottom: SPACING.md,
//   },
//   spareChargeRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   spareChargeLeft: {
//     flex: 1,
//   },
//   spareChargeLabel: {
//     ...FONTS.medium,
//     fontSize: 12,
//     color: COLORS.gray500,
//     marginBottom: SPACING.xs,
//   },
//   spareChargeValue: {
//     ...FONTS.bold,
//     fontSize: 18,
//     color: COLORS.gray900,
//   },
//   spareChargeRight: {
//     alignItems: 'flex-end',
//     gap: 4,
//   },
//   spareChargeBadge: {
//     backgroundColor: COLORS.primary + '20',
//     paddingHorizontal: SPACING.sm,
//     paddingVertical: 2,
//     borderRadius: 20,
//   },
//   spareChargeBadgeText: {
//     ...FONTS.medium,
//     fontSize: 11,
//     color: COLORS.primary,
//   },
//   spareChargeHint: {
//     ...FONTS.regular,
//     fontSize: 11,
//     color: COLORS.gray400,
//   },
//   spareItemsPreview: {
//     backgroundColor: COLORS.white,
//     borderRadius: BORDERS.radius.sm,
//     padding: SPACING.sm,
//     marginBottom: SPACING.md,
//     borderWidth: 1,
//     borderColor: COLORS.gray100,
//   },
//   spareItemsPreviewTitle: {
//     ...FONTS.medium,
//     fontSize: 12,
//     color: COLORS.gray600,
//     marginBottom: 4,
//   },
//   spareItemsPreviewItem: {
//     ...FONTS.regular,
//     fontSize: 12,
//     color: COLORS.gray700,
//     paddingVertical: 2,
//   },
//   spareItemsPreviewMore: {
//     ...FONTS.medium,
//     fontSize: 11,
//     color: COLORS.gray400,
//     marginTop: 2,
//   },

//   // Pending Amount Styles
//   pendingSection: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#FEF3C7',
//     padding: SPACING.md,
//     borderRadius: BORDERS.radius.md,
//     marginBottom: SPACING.md,
//   },
//   pendingLabel: {
//     ...FONTS.medium,
//     fontSize: 14,
//     color: COLORS.gray700,
//   },
//   pendingValue: {
//     ...FONTS.bold,
//     fontSize: 18,
//     color: '#D97706',
//   },

//   // Visual Inspection Styles
//   visualRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: SPACING.sm,
//   },
//   customFaultInput: {
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//     borderRadius: BORDERS.radius.sm,
//     padding: SPACING.sm,
//     marginTop: SPACING.xs,
//     ...FONTS.regular,
//     fontSize: 14,
//     backgroundColor: COLORS.white,
//   },
//   removeVisualButton: {
//     padding: SPACING.sm,
//     marginLeft: SPACING.xs,
//   },
//   addVisualButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//     borderColor: COLORS.primary,
//     borderRadius: BORDERS.radius.md,
//     paddingVertical: SPACING.sm,
//     marginTop: SPACING.xs,
//     backgroundColor: COLORS.primaryLight,
//     gap: 6,
//   },
//   addVisualText: {
//     ...FONTS.medium,
//     fontSize: 14,
//     color: COLORS.primary,
//   },

//   // Action Buttons Styles
//   actionContainer: {
//     marginTop: SPACING.md,
//     marginBottom: SPACING.lg,
//   },
//   saveButtonPrimary: {
//     backgroundColor: COLORS.primary,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: SPACING.md,
//     borderRadius: BORDERS.radius.md,
//     marginBottom: SPACING.md,
//     gap: 8,
//     ...SHADOWS.medium,
//   },
//   saveButtonText: {
//     ...FONTS.bold,
//     fontSize: 16,
//     color: COLORS.white,
//   },
//   secondaryActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: SPACING.sm,
//     flexWrap: 'wrap',
//   },
//   secondaryButton: {
//     flex: 1,
//     minWidth: 60,
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.white,
//     paddingVertical: SPACING.sm,
//     borderRadius: BORDERS.radius.md,
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//     ...SHADOWS.small,
//     gap: 4,
//   },
//   newJobBtn: {
//     borderColor: COLORS.primary,
//     backgroundColor: '#EFF6FF',
//   },
//   estimateBtn: {
//     borderColor: '#FDE68A',
//   },
//   invoiceBtn: {
//     borderColor: '#DBEAFE',
//   },
//   secondaryButtonText: {
//     ...FONTS.medium,
//     fontSize: 11,
//     color: COLORS.gray700,
//     textAlign: 'center',
//   },

//   // Search Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: COLORS.white,
//     borderRadius: BORDERS.radius.lg,
//     width: '90%',
//     maxHeight: '80%',
//     padding: SPACING.lg,
//     ...SHADOWS.large,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: SPACING.md,
//     paddingBottom: SPACING.sm,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.gray200,
//   },
//   modalTitle: {
//     ...FONTS.bold,
//     fontSize: 18,
//     color: COLORS.gray900,
//   },
//   modalBody: {
//     maxHeight: 400,
//   },
//   noResults: {
//     textAlign: 'center',
//     ...FONTS.regular,
//     fontSize: 14,
//     color: COLORS.gray500,
//     padding: SPACING.xl,
//   },
//   searchResultItem: {
//     paddingVertical: SPACING.md,
//     paddingHorizontal: SPACING.sm,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.gray100,
//   },
//   resultJobNo: {
//     ...FONTS.bold,
//     fontSize: 14,
//     color: COLORS.gray900,
//   },
//   resultCustomer: {
//     ...FONTS.regular,
//     fontSize: 12,
//     color: COLORS.gray600,
//   },
//   resultStatus: {
//     ...FONTS.regular,
//     fontSize: 12,
//     color: COLORS.gray500,
//   },

//   // Preview Modal Styles
//   previewOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.55)',
//     justifyContent: 'flex-end',
//   },
//   previewCard: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     paddingTop: 20,
//     paddingHorizontal: 20,
//     paddingBottom: 28,
//     maxHeight: '90%',
//   },
//   previewHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     marginBottom: 4,
//   },
//   previewTitle: {
//     ...FONTS.bold,
//     fontSize: 18,
//     color: COLORS.gray900,
//   },
//   previewSubTitle: {
//     ...FONTS.regular,
//     fontSize: 13,
//     color: COLORS.gray500,
//     marginBottom: 16,
//   },
//   previewScroll: {
//     maxHeight: 400,
//   },
//   previewSection: {
//     backgroundColor: '#F9FAFB',
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 10,
//   },
//   previewSectionTitle: {
//     ...FONTS.semibold,
//     fontSize: 13,
//     color: COLORS.gray700,
//     marginBottom: 8,
//   },
//   previewRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 3,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F3F4F6',
//   },
//   previewLabel: {
//     ...FONTS.medium,
//     fontSize: 12,
//     color: COLORS.gray500,
//   },
//   previewValue: {
//     ...FONTS.regular,
//     fontSize: 12,
//     color: COLORS.gray900,
//   },
//   previewButtons: {
//     flexDirection: 'row',
//     gap: 12,
//     marginTop: 18,
//   },
//   previewBtn: {
//     flex: 1,
//     paddingVertical: 13,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     gap: 6,
//   },
//   previewCancelBtn: {
//     backgroundColor: '#F3F4F6',
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//   },
//   previewCancelText: {
//     ...FONTS.semibold,
//     fontSize: 15,
//     color: COLORS.gray700,
//   },
//   previewConfirmBtn: {
//     backgroundColor: COLORS.primary,
//   },
//   previewConfirmText: {
//     ...FONTS.semibold,
//     fontSize: 15,
//     color: '#fff',
//   },

//   // Alert Modal Styles
//   alertOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   alertCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 28,
//     width: '82%',
//     alignSelf: 'center',
//     alignItems: 'center',
//   },
//   alertTitle: {
//     ...FONTS.bold,
//     fontSize: 17,
//     color: COLORS.gray900,
//     textAlign: 'center',
//     marginTop: 12,
//     marginBottom: 8,
//   },
//   alertMsg: {
//     ...FONTS.regular,
//     fontSize: 13,
//     color: COLORS.gray600,
//     textAlign: 'center',
//     lineHeight: 20,
//     marginBottom: 22,
//   },
//   alertButtons: {
//     flexDirection: 'row',
//     gap: 12,
//     width: '100%',
//   },
//   alertBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   alertCancelBtn: {
//     backgroundColor: '#F3F4F6',
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//   },
//   alertCancelText: {
//     ...FONTS.semibold,
//     fontSize: 15,
//     color: COLORS.gray700,
//   },
//   alertConfirmBtn: {
//     backgroundColor: COLORS.primary,
//   },
//   alertConfirmText: {
//     ...FONTS.semibold,
//     fontSize: 15,
//     color: '#fff',
//   },
// });
