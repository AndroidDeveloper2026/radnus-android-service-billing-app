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
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
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
  User,
  Smartphone,
  Wrench,
  Package,
  Clock,
  Eye,
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
} from '../../store/slices/adminSlice';
import {
  Button,
  Input,
  SelectModal,
  CheckboxItem,
  LoadingOverlay,
} from '../../components/UI';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
import { useToast } from 'react-native-toast-notifications';
import { useAuth } from '../../context/AuthContext';

// ─── API base (mirrors web's import.meta.env.VITE_API_URL) ──────────────────
import { API_BASE_URL } from '@env';
import axios from 'axios';

// ─── CustomerAutocomplete (RN equivalent of web CustomerAutocomplete) ────────
const CustomerAutocomplete = ({
  label,
  type,           // 'name' | 'contact'
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

  useEffect(() => {
    if (!value || value.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/jobsheets/customers/search`, {
          params: { q: value, type },
        });
        setSuggestions(res.data || []);
        setShowSuggestions((res.data || []).length > 0);
      } catch (err) {
        console.error('Customer search error:', err.message);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [value, type]);

  const handleSelect = (customer) => {
    Keyboard.dismiss();
    setShowSuggestions(false);
    setSuggestions([]);
    onSelect(customer);
  };

  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={{ marginBottom: SPACING.lg }}>
      {label && (
        <Text style={[cac.label, { color: error ? COLORS.error : COLORS.gray600 }]}>
          {label}{required && <Text style={{ color: COLORS.error }}> *</Text>}
        </Text>
      )}
      <View style={[cac.inputContainer, {
        borderColor: error ? COLORS.error : isFocused ? COLORS.primary : COLORS.gray200,
      }]}>
        <TextInput
          style={cac.input}
          value={value}
          onChangeText={(t) => {
            // Strip non-digits for contact type, mirrors web filterNumbers
            const val = type === 'contact' ? t.replace(/\D/g, '') : t;
            onChange(val);
            setShowSuggestions(true);
          }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray400}
          keyboardType={keyboardType || 'default'}
          maxLength={maxLength}
          autoComplete="off"
          autoCorrect={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            // Delay hide so tap on suggestion registers first
            setTimeout(() => setShowSuggestions(false), 200);
          }}
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color={COLORS.gray400}
            style={{ marginLeft: SPACING.sm }}
          />
        )}
      </View>
      {error && <Text style={cac.errorText}>{error}</Text>}

      {/* Dropdown suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={cac.dropdown}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {suggestions.map((item, idx) => (
              <TouchableOpacity
                key={String(idx)}
                style={[
                  cac.suggestionItem,
                  idx < suggestions.length - 1 && { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
                ]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={cac.suggestionName}>{item.name}</Text>
                <Text style={cac.suggestionContact}>📞 {item.contact}</Text>
                {!!item.address && (
                  <Text style={cac.suggestionAddress}>📍 {item.address}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// CustomerAutocomplete styles
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
    top: 78,          // label (~20) + gap (~6) + input (48) + 4
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 10,    // Android shadow
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
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

// ─── Validation Schema ──────────────────────────────────────────────────────
const JobSheetSchema = yup.object().shape({
  customerName: yup.string().required('Customer name is required'),
  contact: yup
    .string()
    .required('Contact number is required')
    .min(10, 'Enter valid contact number'),
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
});

// ─── Constants from Web Screens ─────────────────────────────────────────────
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

const accessoryOptions = ['Battery', 'Charger', 'Back Cover', 'Memory Card', 'SIM'];

const warrantyOptions = [
  { id: 'No Warranty', name: 'No Warranty' },
  { id: 'In Warranty', name: 'In Warranty' },
];

const idProofOptions = [
  { id: 'Aadhaar Card', name: 'Aadhaar Card' },
  { id: 'Passport', name: 'Passport' },
  { id: 'Driving License', name: 'Driving License' },
  { id: 'Election ID', name: 'Election ID' },
  { id: 'ID Not Required', name: 'ID Not Required' },
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

// ─── Helper to get current time ─────────────────────────────────────────────
const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-IN', { hour12: true });
};

const getCurrentDate = () => {
  const now = new Date();
  return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
};

// ─── Preview Components ─────────────────────────────────────────────────────
const PreviewRow = ({ label, value }) => {
  if (!value && value !== 0) return null;
  const display = Array.isArray(value) ? value.join(', ') : String(value);
  if (!display || display === '0') return null;
  return (
    <View style={pm.row}>
      <Text style={pm.rowLabel}>{label}</Text>
      <Text style={pm.rowValue}>{display}</Text>
    </View>
  );
};

const PreviewSection = ({ title, icon: Icon, children }) => {
  const hasContent = React.Children.toArray(children).some(
    (c) => c !== null && c !== false && c !== undefined
  );
  if (!hasContent) return null;
  return (
    <View style={pm.section}>
      <View style={pm.sectionHeader}>
        {Icon && <Icon size={16} color={COLORS.primary} />}
        <Text style={pm.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
};

// ─── Preview / Confirmation Modal ────────────────────────────────────────────
const PreviewConfirmModal = ({
  visible,
  values,
  makes,
  models,
  engineers,
  drawers,
  salesReps,
  onConfirm,
  onCancel,
  confirmText = 'Confirm & Save',
  confirmColor = COLORS.primary,
  mode,
  isConfirming = false,
}) => {
  const makeName = makes.find((m) => m.id === values.makeId)?.name || values.makeId || '';
  const modelName = models.find((m) => m.id === values.modelId)?.name || values.modelId || '';
  const engineerName =
    engineers.find((e) => e.id === values.engineerId)?.name || values.engineerId || '';
  const drawerName = drawers.find((d) => d.id === values.drawerId)?.name || values.drawerId || '';
  const salesRepName =
    salesReps.find((r) => r.id === values.serviceRepId)?.name || values.serviceRepId || '';

  const total =
    (parseFloat(values.serviceCharges) || 0) + (parseFloat(values.spareCharges) || 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={pm.overlay}>
        <View style={pm.card}>
          <View style={pm.header}>
            <CheckCircle size={22} color={confirmColor} />
            <Text style={pm.headerTitle}>
              {mode === 'edit' ? 'Review & Update' : 'Review & Save'}
            </Text>
          </View>
          <Text style={pm.subTitle}>Please review the details before saving</Text>

          <ScrollView
            style={pm.scrollArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {values.jobSheetNo && (
              <PreviewSection title="Job Sheet Info" icon={FileText}>
                <PreviewRow label="Job Sheet No" value={values.jobSheetNo} />
                <PreviewRow label="Date" value={values.createdAt || getCurrentDate()} />
                <PreviewRow label="Time" value={values.time || getCurrentTime()} />
              </PreviewSection>
            )}

            <PreviewSection title="Customer" icon={User}>
              <PreviewRow label="Name" value={values.customerName} />
              <PreviewRow label="Contact" value={values.contact} />
              <PreviewRow label="Alt Contact" value={values.altContact} />
              <PreviewRow label="Address" value={values.address} />
              <PreviewRow label="Email" value={values.email} />
            </PreviewSection>

            <PreviewSection title="Device" icon={Smartphone}>
              <PreviewRow label="Make" value={makeName} />
              <PreviewRow label="Model" value={modelName} />
              <PreviewRow label="IMEI" value={values.imei} />
              <PreviewRow label="Warranty" value={values.warranty} />
              <PreviewRow label="Pattern / PIN" value={values.patternPin} />
              <PreviewRow label="ID Proof" value={values.idProof} />
            </PreviewSection>

            <PreviewSection title="Condition & Accessories" icon={Eye}>
              <PreviewRow
                label="Physical Condition"
                value={values.physicalConditions?.length ? values.physicalConditions : null}
              />
              <PreviewRow
                label="Accessories"
                value={values.accessoriesReceived?.length ? values.accessoriesReceived : null}
              />
              <PreviewRow label="Battery No." value={values.batteryNumber} />
            </PreviewSection>

            <PreviewSection title="Service & Repair" icon={Wrench}>
              <PreviewRow label="Engineer" value={engineerName} />
              <PreviewRow label="Dealer" value={values.dealerName} />
              <PreviewRow label="Drawer" value={drawerName} />
              <PreviewRow label="Service Rep" value={salesRepName} />
              <PreviewRow
                label="Service Charge"
                value={values.serviceCharges ? `₹ ${values.serviceCharges}` : null}
              />
              <PreviewRow
                label="Spare Charge"
                value={values.spareCharges ? `₹ ${values.spareCharges}` : null}
              />
              <PreviewRow label="Total Estimate" value={total > 0 ? `₹ ${total}` : null} />
              <PreviewRow
                label="Advance Amount"
                value={values.advanceAmount ? `₹ ${values.advanceAmount}` : null}
              />
              <PreviewRow
                label="Advance Date"
                value={
                  values.advanceDate
                    ? new Date(values.advanceDate).toLocaleDateString()
                    : null
                }
              />
              <PreviewRow
                label="Margin"
                value={values.marginAmount ? `₹ ${values.marginAmount}` : null}
              />
              <PreviewRow label="Payment Mode" value={values.paymentMode} />
              <PreviewRow
                label="Repair Date"
                value={
                  values.repairDate ? new Date(values.repairDate).toLocaleDateString() : null
                }
              />
              <PreviewRow
                label="Delivery Date"
                value={
                  values.deliveryDate ? new Date(values.deliveryDate).toLocaleDateString() : null
                }
              />
              <PreviewRow label="Insta Follow" value={values.instaFollowers} />
              <PreviewRow label="Google Review" value={values.googleReview} />
              <PreviewRow label="Remarks" value={values.remarks} />
            </PreviewSection>

            {values.spareItems?.length > 0 && (
              <View style={pm.section}>
                <View style={pm.sectionHeader}>
                  <Package size={16} color={COLORS.primary} />
                  <Text style={pm.sectionTitle}>Spare Parts</Text>
                </View>
                <View style={pm.spareHeader}>
                  <Text style={[pm.spareCol, { flex: 3 }]}>Part</Text>
                  <Text style={[pm.spareCol, { flex: 1, textAlign: 'center' }]}>Qty</Text>
                  <Text style={[pm.spareCol, { flex: 1.5, textAlign: 'right' }]}>Rate</Text>
                  <Text style={[pm.spareCol, { flex: 1.5, textAlign: 'right' }]}>Amt</Text>
                </View>
                {values.spareItems.map((item, i) => {
                  const amt = (parseInt(item.qty) || 0) * (parseFloat(item.rate) || 0);
                  return (
                    <View key={i} style={pm.spareRow}>
                      <Text style={[pm.spareCell, { flex: 3 }]}>{item.name || '-'}</Text>
                      <Text style={[pm.spareCell, { flex: 1, textAlign: 'center' }]}>
                        {item.qty || 0}
                      </Text>
                      <Text style={[pm.spareCell, { flex: 1.5, textAlign: 'right' }]}>
                        ₹{item.rate || 0}
                      </Text>
                      <Text style={[pm.spareCell, { flex: 1.5, textAlign: 'right' }]}>
                        ₹{amt}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>

          <View style={pm.buttons}>
            <TouchableOpacity
              style={[pm.btn, pm.cancelBtn, isConfirming && { opacity: 0.6 }]}
              onPress={onCancel}
              disabled={isConfirming}
              activeOpacity={0.8}
            >
              <Text style={pm.cancelText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[pm.btn, { backgroundColor: confirmColor }, isConfirming && { opacity: 0.6 }]}
              onPress={onConfirm}
              disabled={isConfirming}
              activeOpacity={0.8}
            >
              <Save size={16} color="#fff" style={{ marginRight: 4 }} />
              <Text style={pm.confirmText}>{isConfirming ? 'Saving...' : confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AlertConfirmModal = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  confirmColor = COLORS.primary,
  isConfirming = false,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={pm.overlay}>
      <View style={pm.alertCard}>
        <AlertCircle size={36} color={confirmColor} style={{ marginBottom: 12 }} />
        <Text style={pm.alertTitle}>{title}</Text>
        {!!message && <Text style={pm.alertMsg}>{message}</Text>}
        <View style={pm.buttons}>
          <TouchableOpacity
            style={[pm.btn, pm.cancelBtn, isConfirming && { opacity: 0.6 }]}
            onPress={onCancel}
            disabled={isConfirming}
            activeOpacity={0.8}
          >
            <Text style={pm.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[pm.btn, { backgroundColor: confirmColor }, isConfirming && { opacity: 0.6 }]}
            onPress={onConfirm}
            disabled={isConfirming}
            activeOpacity={0.8}
          >
            <Text style={pm.confirmText}>{isConfirming ? 'Saving...' : confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function JobSheetFormScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const toast = useToast();
  const { user } = useAuth();
  const { mode, jobId } = route.params || { mode: 'new' };

  const { currentJob, loading: jobLoading } = useSelector((s) => s.jobs);
  const { engineers, makes, models, drawers, salesReps = [] } = useSelector((s) => s.admin);

  const isLoading = jobLoading;

  const [openRepairDate, setOpenRepairDate] = useState(false);
  const [openDeliveryDate, setOpenDeliveryDate] = useState(false);
  const [openAdvanceDate, setOpenAdvanceDate] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    action: null,
    pendingValues: null,
  });
  const [visualIssues, setVisualIssues] = useState([]);

  const savedJobIdRef = useRef(jobId || null);

  useEffect(() => {
    if (!engineers.length) dispatch(fetchEngineers());
    if (!makes.length) dispatch(fetchMakes());
    if (!models.length) dispatch(fetchModels());
    if (!drawers.length) dispatch(fetchDrawers());
    if (!salesReps.length) dispatch(fetchSalesReps());
    if (mode === 'edit' && jobId) dispatch(fetchJobById(jobId));
    return () => {
      if (mode === 'edit') dispatch(clearCurrentJob());
    };
  }, []);

  useEffect(() => {
    if (jobId) savedJobIdRef.current = jobId;
  }, [jobId]);

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
      advanceDate: currentJob?.advanceDate ? new Date(currentJob.advanceDate) : null,
      marginAmount: currentJob?.marginAmount?.toString() || '',
      paymentMode: currentJob?.paymentMode || '',
      repairDate: currentJob?.repairDate ? new Date(currentJob.repairDate) : new Date(),
      deliveryDate: currentJob?.deliveredDate ? new Date(currentJob.deliveredDate) : new Date(),
      instaFollowers: currentJob?.instaFollowers || '',
      googleReview: currentJob?.googleReview || '',
      remarks: currentJob?.remarks || '',
      spareItems: currentJob?.spareItems || [],
      createdAt: currentJob?.createdAt || getCurrentDate(),
      time: currentJob?.time || getCurrentTime(),
      status: currentJob?.status || 'Received',
    }),
    [currentJob]
  );

  const calculateEstimate = (setFieldValue, getValues) => {
    const v = getValues();
    const service = parseFloat(v.serviceCharges) || 0;
    const spare = parseFloat(v.spareCharges) || 0;
    const itemsTotal = (v.spareItems || []).reduce(
      (sum, item) => sum + ((parseInt(item.qty) || 0) * (parseFloat(item.rate) || 0)),
      0
    );
    const estimate = service + spare + itemsTotal;
    setFieldValue('estimateAmount', estimate.toString());
    // Auto-calculate margin = estimate - spare (mirrors web logic)
    setFieldValue('marginAmount', (estimate - spare).toString());
    toast.show('Estimate calculated', { type: 'success' });
  };

  // Recalculate margin whenever serviceCharges or spareCharges change
  const recalculateMargin = (setFieldValue, serviceCharges, spareCharges, spareItems) => {
    const service = parseFloat(serviceCharges) || 0;
    const spare = parseFloat(spareCharges) || 0;
    const itemsTotal = (spareItems || []).reduce(
      (sum, item) => sum + ((parseInt(item.qty) || 0) * (parseFloat(item.rate) || 0)),
      0
    );
    const estimate = service + spare + itemsTotal;
    setFieldValue('estimateAmount', estimate.toString());
    setFieldValue('marginAmount', (estimate - spare).toString());
  };

  const buildSubmitData = (values) => ({
    ...values,
    serviceCharges: parseFloat(values.serviceCharges) || 0,
    spareCharges: parseFloat(values.spareCharges) || 0,
    estimateAmount: parseFloat(values.estimateAmount) || 0,
    advanceAmount: parseFloat(values.advanceAmount) || 0,
    marginAmount: parseFloat(values.marginAmount) || 0,
    advanceDate: values.advanceDate ? values.advanceDate.toISOString() : null,
    spareItems: (values.spareItems || []).map((item) => ({
      name: item.name || '',
      qty: parseInt(item.qty) || 0,
      rate: parseFloat(item.rate) || 0,
      amount: (parseInt(item.qty) || 0) * (parseFloat(item.rate) || 0),
    })),
    visualIssues: visualIssues,
    time: getCurrentTime(),
  });

  const performSave = async (values) => {
    if (!values.customerName || !values.contact) {
      toast.show('Customer Name and Contact are required', { type: 'danger' });
      return null;
    }
    const submitData = buildSubmitData(values);
    try {
      let savedJob;
      if (mode === 'edit') {
        savedJob = await dispatch(updateJob({ id: jobId, data: submitData })).unwrap();
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
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to save job';
      toast.show(msg, { type: 'danger' });
      return null;
    }
  };

  const requestSave = (values) => {
    const missing = [];
    if (!values.customerName?.trim()) missing.push('Customer Name');
    if (!values.contact?.trim()) missing.push('Contact Number');

    if (missing.length > 0) {
      missing.forEach((field) => toast.show(`${field} is required`, { type: 'danger' }));
      return;
    }

    if (values.contact?.trim() && values.contact.trim().length < 10) {
      toast.show('Contact Number must be at least 10 digits', { type: 'danger' });
      return;
    }

    setConfirmModal({ visible: true, action: 'save', pendingValues: values });
  };

  const requestInvoice = (values) => {
    const missing = [];
    if (!values.customerName?.trim()) missing.push('Customer Name');
    if (!values.contact?.trim()) missing.push('Contact Number');

    if (missing.length > 0) {
      missing.forEach((field) => toast.show(`${field} is required`, { type: 'danger' }));
      return;
    }

    if (values.contact?.trim() && values.contact.trim().length < 10) {
      toast.show('Contact Number must be at least 10 digits', { type: 'danger' });
      return;
    }

    if (mode === 'edit' && savedJobIdRef.current) {
      navigation.navigate('JobSheet', {
        screen: 'InvoiceBill',
        params: { id: savedJobIdRef.current },
      });
      return;
    }
    setConfirmModal({ visible: true, action: 'invoice', pendingValues: values });
  };

  const requestEstimate = (values) => {
    const missing = [];
    if (!values.customerName?.trim()) missing.push('Customer Name');
    if (!values.contact?.trim()) missing.push('Contact Number');

    if (missing.length > 0) {
      missing.forEach((field) => toast.show(`${field} is required`, { type: 'danger' }));
      return;
    }

    if (values.contact?.trim() && values.contact.trim().length < 10) {
      toast.show('Contact Number must be at least 10 digits', { type: 'danger' });
      return;
    }

    if (mode === 'edit' && savedJobIdRef.current) {
      navigation.navigate('JobSheet', {
        screen: 'EstimateBill',
        params: { id: savedJobIdRef.current },
      });
      return;
    }
    setConfirmModal({ visible: true, action: 'estimate', pendingValues: values });
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

  const confirmConfig = () => {
    switch (confirmModal.action) {
      case 'save':
        return {
          title: mode === 'edit' ? 'Update Job Sheet?' : 'Save Job Sheet?',
          message:
            mode === 'edit'
              ? 'This will update the existing job sheet with your changes.'
              : 'A new job sheet will be created with the entered details.',
          confirmText: mode === 'edit' ? 'Update' : 'Save',
          confirmColor: COLORS.primary,
        };
      case 'invoice':
        return {
          title: 'Save & Open Invoice?',
          message: 'The job sheet will be saved first, then the invoice will open.',
          confirmText: 'Save & Invoice',
          confirmColor: COLORS.primary,
        };
      case 'estimate':
        return {
          title: 'Save & Open Estimate?',
          message: 'The job sheet will be saved first, then the estimate will open.',
          confirmText: 'Save & Estimate',
          confirmColor: COLORS.warning || '#F59E0B',
        };
      default:
        return {
          title: 'Confirm',
          message: '',
          confirmText: 'OK',
          confirmColor: COLORS.primary,
        };
    }
  };

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
          const filteredModels = models.filter((m) => m.makeId === values.makeId);
          const buttonsDisabled = isConfirming;

          return (
            <View style={{ padding: SPACING.lg, paddingBottom: SPACING.xxl }}>
              {/* Job Sheet Header */}
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
                      <Text style={styles.dateTimeText}>{values.time || getCurrentTime()}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Physical Condition */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Physical Condition</Text>
                <View style={styles.checkboxGroup}>
                  {physicalOptions.map((opt) => (
                    <CheckboxItem
                      key={opt}
                      label={opt}
                      checked={values.physicalConditions?.includes(opt)}
                      onToggle={() => {
                        const exists = values.physicalConditions?.includes(opt);
                        setFieldValue(
                          'physicalConditions',
                          exists
                            ? values.physicalConditions.filter((i) => i !== opt)
                            : [...(values.physicalConditions || []), opt]
                        );
                      }}
                    />
                  ))}
                </View>
              </View>

              {/* Other Details Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Other Details</Text>
                <Input
                  label="Add Issue / Visual Issues"
                  value={visualIssues.join(', ')}
                  onChangeText={(text) => {
                    const issues = text.split(',').map((i) => i.trim()).filter((i) => i);
                    setVisualIssues(issues);
                  }}
                  multiline
                  placeholder="Enter issues separated by commas"
                />
              </View>

              {/* Customer Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Customer Details</Text>

                {/* Customer Name — with autocomplete */}
                <CustomerAutocomplete
                  label="Customer Name"
                  type="name"
                  value={values.customerName}
                  onChange={(t) => setFieldValue('customerName', t)}
                  onSelect={(customer) => {
                    setFieldValue('customerName', customer.name || '');
                    setFieldValue('contact', customer.contact || '');
                    setFieldValue('altContact', customer.altContact || '');
                    setFieldValue('address', customer.address || '');
                    setFieldValue('email', customer.email || '');
                    setFieldValue(
                      'instaFollowers',
                      customer.instaFollowers === 'Already Done' ? 'Already Done' : ''
                    );
                    setFieldValue(
                      'googleReview',
                      customer.googleReview === 'Already Done' ? 'Already Done' : ''
                    );
                  }}
                  placeholder="Customer Name *"
                  required
                  error={touched.customerName && errors.customerName}
                />

                {/* Contact No — with autocomplete */}
                <CustomerAutocomplete
                  label="Contact No"
                  type="contact"
                  value={values.contact}
                  onChange={(t) => setFieldValue('contact', t)}
                  onSelect={(customer) => {
                    setFieldValue('customerName', customer.name || '');
                    setFieldValue('contact', customer.contact || '');
                    setFieldValue('altContact', customer.altContact || '');
                    setFieldValue('address', customer.address || '');
                    setFieldValue('email', customer.email || '');
                    setFieldValue(
                      'instaFollowers',
                      customer.instaFollowers === 'Already Done' ? 'Already Done' : ''
                    );
                    setFieldValue(
                      'googleReview',
                      customer.googleReview === 'Already Done' ? 'Already Done' : ''
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
                  onChangeText={(t) => setFieldValue('altContact', t)}
                  keyboardType="phone-pad"
                />
                <Input
                  label="Customer Address"
                  value={values.address}
                  onChangeText={(t) => setFieldValue('address', t)}
                  multiline
                />
                <Input
                  label="Email ID"
                  value={values.email}
                  onChangeText={(t) => setFieldValue('email', t)}
                  keyboardType="email-address"
                  error={touched.email && errors.email}
                />
              </View>

              {/* Device Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Device Details</Text>

                <SelectModal
                  label="Search Make"
                  value={values.makeId}
                  options={makes}
                  onSelect={(v) => {
                    setFieldValue('makeId', v);
                    setFieldValue('modelId', '');
                  }}
                  placeholder="Search Make..."
                />

                <SelectModal
                  label="Search Model"
                  value={values.modelId}
                  options={filteredModels}
                  onSelect={(v) => setFieldValue('modelId', v)}
                  placeholder="Search Model..."
                />

                <Input
                  label="IMEI"
                  value={values.imei}
                  onChangeText={(t) => setFieldValue('imei', t)}
                />

                <SelectModal
                  label="Status"
                  value={values.status}
                  options={statusOptions}
                  onSelect={(v) => setFieldValue('status', v)}
                  placeholder="All Status"
                />

                <SelectModal
                  label="Warranty"
                  value={values.warranty}
                  options={warrantyOptions}
                  onSelect={(v) => setFieldValue('warranty', v)}
                />

                <Input
                  label="Pattern / PIN"
                  value={values.patternPin}
                  onChangeText={(t) => setFieldValue('patternPin', t)}
                />

                <SelectModal
                  label="Select ID Proof"
                  value={values.idProof}
                  options={idProofOptions}
                  onSelect={(v) => setFieldValue('idProof', v)}
                />
              </View>

              {/* Accessories Received */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Accessories Received</Text>
                <View style={styles.checkboxGroup}>
                  {accessoryOptions.map((opt) => (
                    <CheckboxItem
                      key={opt}
                      label={opt}
                      checked={values.accessoriesReceived?.includes(opt)}
                      onToggle={() => {
                        const exists = values.accessoriesReceived?.includes(opt);
                        setFieldValue(
                          'accessoriesReceived',
                          exists
                            ? values.accessoriesReceived.filter((i) => i !== opt)
                            : [...(values.accessoriesReceived || []), opt]
                        );
                      }}
                    />
                  ))}
                </View>
                <Input
                  label="Battery Number"
                  value={values.batteryNumber}
                  onChangeText={(t) => setFieldValue('batteryNumber', t)}
                />
              </View>

              {/* ─── Service / Repair Details ─────────────────────────────── */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Service / Repair Details</Text>

                <SelectModal
                  label="Select Engineer"
                  value={values.engineerId}
                  options={engineers}
                  onSelect={(v) => setFieldValue('engineerId', v)}
                  placeholder="Select Engineer"
                />

                <Input
                  label="Dealer Name"
                  value={values.dealerName}
                  onChangeText={(t) => setFieldValue('dealerName', t)}
                />

                <SelectModal
                  label="Select Drawer"
                  value={values.drawerId}
                  options={drawers}
                  onSelect={(v) => setFieldValue('drawerId', v)}
                  placeholder="Select Drawer"
                />

                {/* Row: Service Charges + Spare Charges */}
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: SPACING.sm }}>
                    <Input
                      label="Service Charges"
                      value={values.serviceCharges}
                      onChangeText={(t) => {
                        setFieldValue('serviceCharges', t);
                        recalculateMargin(setFieldValue, t, values.spareCharges, values.spareItems);
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Spare Charges"
                      value={values.spareCharges}
                      onChangeText={(t) => {
                        setFieldValue('spareCharges', t);
                        recalculateMargin(setFieldValue, values.serviceCharges, t, values.spareItems);
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Spare Parts */}
                <View style={{ marginTop: SPACING.md }}>
                  <Text style={styles.subsectionTitle}>Spare Parts</Text>
                  {(values.spareItems || []).map((item, index) => (
                    <View key={item.id || index} style={styles.spareItemCard}>
                      <View style={styles.spareItemRow}>
                        <TextInput
                          placeholder="Part name"
                          value={item.name}
                          onChangeText={(v) => {
                            const n = [...(values.spareItems || [])];
                            n[index] = { ...n[index], name: v };
                            setFieldValue('spareItems', n);
                          }}
                          style={styles.spareInputName}
                          placeholderTextColor={COLORS.gray400}
                        />
                        <TextInput
                          placeholder="Qty"
                          value={item.qty?.toString()}
                          onChangeText={(v) => {
                            const n = [...(values.spareItems || [])];
                            n[index] = { ...n[index], qty: v };
                            setFieldValue('spareItems', n);
                          }}
                          keyboardType="numeric"
                          style={styles.spareInputSmall}
                          placeholderTextColor={COLORS.gray400}
                        />
                        <TextInput
                          placeholder="Rate"
                          value={item.rate?.toString()}
                          onChangeText={(v) => {
                            const n = [...(values.spareItems || [])];
                            n[index] = { ...n[index], rate: v };
                            setFieldValue('spareItems', n);
                          }}
                          keyboardType="numeric"
                          style={styles.spareInputSmall}
                          placeholderTextColor={COLORS.gray400}
                        />
                        <TouchableOpacity
                          onPress={() =>
                            setFieldValue(
                              'spareItems',
                              (values.spareItems || []).filter((_, i) => i !== index)
                            )
                          }
                          style={styles.removeButton}
                        >
                          <Trash2 size={18} color={COLORS.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  <TouchableOpacity
                    onPress={() =>
                      setFieldValue('spareItems', [
                        ...(values.spareItems || []),
                        { id: Date.now().toString(), name: '', qty: '1', rate: '' },
                      ])
                    }
                    style={styles.addSpareButton}
                  >
                    <Plus size={18} color={COLORS.primary} />
                    <Text style={styles.addSpareText}>Add Spare Part</Text>
                  </TouchableOpacity>
                </View>

                {/* Estimate Amount — read-only, auto-calculated */}
                <View style={styles.readOnlyFieldWrapper}>
                  <Text style={styles.readOnlyLabel}>Estimate Amount</Text>
                  <View style={styles.readOnlyBox}>
                    <Text style={styles.readOnlyValue}>
                      {values.estimateAmount ? `₹ ${values.estimateAmount}` : '—'}
                    </Text>
                  </View>
                </View>

                <Button
                  title="Calculate Estimate"
                  onPress={() => calculateEstimate(setFieldValue, () => values)}
                  variant="secondary"
                  style={styles.calcButton}
                  icon={Calculator}
                />

                {/* Row: Advance Amount + Advance Date */}
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: SPACING.sm }}>
                    <Input
                      label="Adv. Amount ₹"
                      value={values.advanceAmount}
                      onChangeText={(t) => setFieldValue('advanceAmount', t)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Adv. Date</Text>
                    <TouchableOpacity
                      onPress={() => setOpenAdvanceDate(true)}
                      style={styles.dateButton}
                    >
                      <Calendar size={16} color={COLORS.gray600} />
                      <Text style={styles.dateText}>
                        {values.advanceDate
                          ? new Date(values.advanceDate).toLocaleDateString()
                          : 'Select Date'}
                      </Text>
                    </TouchableOpacity>
                    <DatePicker
                      modal
                      open={openAdvanceDate}
                      date={values.advanceDate || new Date()}
                      onConfirm={(date) => {
                        setOpenAdvanceDate(false);
                        setFieldValue('advanceDate', date);
                      }}
                      onCancel={() => setOpenAdvanceDate(false)}
                    />
                  </View>
                </View>

                {/* Row: Margin (read-only) + Service Rep */}
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: SPACING.sm }}>
                    <Text style={styles.readOnlyLabel}>Margin ₹</Text>
                    <View style={styles.readOnlyBox}>
                      <Text style={styles.readOnlyValue}>
                        {values.marginAmount ? `₹ ${values.marginAmount}` : '—'}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <SelectModal
                      label="Service Rep"
                      value={values.serviceRepId}
                      options={salesReps}
                      onSelect={(v) => setFieldValue('serviceRepId', v)}
                      placeholder="Select Rep"
                    />
                  </View>
                </View>

                <SelectModal
                  label="Payment Mode"
                  value={values.paymentMode}
                  options={paymentOptions}
                  onSelect={(v) => setFieldValue('paymentMode', v)}
                  placeholder="Select Payment Mode"
                />

                {/* Repair Date */}
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
                  onConfirm={(date) => {
                    setOpenRepairDate(false);
                    setFieldValue('repairDate', date);
                  }}
                  onCancel={() => setOpenRepairDate(false)}
                />

                {/* Delivery Date */}
                <Text style={styles.fieldLabel}>Delivery Date</Text>
                <TouchableOpacity
                  onPress={() => setOpenDeliveryDate(true)}
                  style={styles.dateButton}
                >
                  <Calendar size={20} color={COLORS.gray600} />
                  <Text style={styles.dateText}>
                    {values.deliveryDate?.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                <DatePicker
                  modal
                  open={openDeliveryDate}
                  date={values.deliveryDate || new Date()}
                  onConfirm={(date) => {
                    setOpenDeliveryDate(false);
                    setFieldValue('deliveryDate', date);
                  }}
                  onCancel={() => setOpenDeliveryDate(false)}
                />

                {/* Row: Insta Follow + Google Review */}
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: SPACING.sm }}>
                    <SelectModal
                      label="Insta Follow"
                      value={values.instaFollowers}
                      options={instaFollowOptions}
                      onSelect={(v) => setFieldValue('instaFollowers', v)}
                      placeholder="Select"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <SelectModal
                      label="Google Review"
                      value={values.googleReview}
                      options={googleReviewOptions}
                      onSelect={(v) => setFieldValue('googleReview', v)}
                      placeholder="Select"
                    />
                  </View>
                </View>

                <Input
                  label="Remarks"
                  value={values.remarks}
                  onChangeText={(t) => setFieldValue('remarks', t)}
                  multiline
                />
              </View>
              {/* ─── End Service / Repair Details ────────────────────────── */}

              {/* Action Buttons */}
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={[styles.saveButtonPrimary, buttonsDisabled && { opacity: 0.6 }]}
                  onPress={handleSubmit}
                  disabled={buttonsDisabled}
                  activeOpacity={0.8}
                >
                  <Save size={22} color={COLORS.white} />
                  <Text style={styles.saveButtonText}>
                    {buttonsDisabled
                      ? 'Saving…'
                      : mode === 'edit'
                      ? 'Update Job Sheet'
                      : 'Save Job Sheet'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.secondaryActions}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.replace('JobSheetForm', { mode, jobId })}
                    disabled={buttonsDisabled}
                  >
                    <RefreshCw size={20} color={COLORS.gray700} />
                    <Text style={styles.secondaryButtonText}>Refresh</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => calculateEstimate(setFieldValue, () => values)}
                    disabled={buttonsDisabled}
                  >
                    <Calculator size={20} color={COLORS.gray700} />
                    <Text style={styles.secondaryButtonText}>Estimate Calc</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.secondaryButton, styles.estimateBtn, buttonsDisabled && { opacity: 0.6 }]}
                    onPress={() => requestEstimate(values)}
                    disabled={buttonsDisabled}
                  >
                    <FileText size={20} color="#F59E0B" />
                    <Text style={[styles.secondaryButtonText, { color: '#F59E0B' }]}>
                      Estimate
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.secondaryButton, styles.invoiceBtn, buttonsDisabled && { opacity: 0.6 }]}
                    onPress={() => requestInvoice(values)}
                    disabled={buttonsDisabled}
                  >
                    <Receipt size={20} color={COLORS.primary} />
                    <Text style={[styles.secondaryButtonText, { color: COLORS.primary }]}>
                      Invoice
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
          );
        }}
      </Formik>

      {/* Save Preview Modal */}
      {confirmModal.visible && confirmModal.action === 'save' &&
        (() => {
          const cfg = confirmConfig();
          return (
            <PreviewConfirmModal
              visible
              values={confirmModal.pendingValues}
              makes={makes}
              models={models}
              engineers={engineers}
              drawers={drawers}
              salesReps={salesReps}
              confirmText={cfg.confirmText}
              confirmColor={cfg.confirmColor}
              mode={mode}
              isConfirming={isConfirming}
              onConfirm={handleConfirm}
              onCancel={closeConfirm}
            />
          );
        })()}

      {/* Invoice / Estimate alert confirm */}
      {confirmModal.visible &&
        (confirmModal.action === 'invoice' || confirmModal.action === 'estimate') &&
        (() => {
          const cfg = confirmConfig();
          return (
            <AlertConfirmModal
              visible
              title={cfg.title}
              message={cfg.message}
              confirmText={cfg.confirmText}
              confirmColor={cfg.confirmColor}
              isConfirming={isConfirming}
              onConfirm={handleConfirm}
              onCancel={closeConfirm}
            />
          );
        })()}

      {/* Only show overlay when loading a specific job (edit mode fetch) */}
      <LoadingOverlay visible={isLoading} />
    </KeyboardAwareScrollView>
  );
}

// ─── Preview Modal Styles ─────────────────────────────────────────────────────
const pm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 28,
    maxHeight: '90%',
    ...SHADOWS.large,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: 18,
    color: COLORS.gray900,
  },
  subTitle: {
    ...FONTS.regular,
    fontSize: 13,
    color: COLORS.gray500,
    marginBottom: 16,
  },
  scrollArea: {
    maxHeight: 440,
  },
  section: {
    backgroundColor: COLORS.gray50 || '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    ...FONTS.semibold,
    fontSize: 13,
    color: COLORS.gray700,
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100 || '#F3F4F6',
  },
  rowLabel: {
    ...FONTS.medium,
    fontSize: 12,
    color: COLORS.gray500,
    flex: 1.2,
  },
  rowValue: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray900,
    flex: 2,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  spareHeader: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray300 || '#D1D5DB',
    marginBottom: 4,
  },
  spareCol: {
    ...FONTS.semibold,
    fontSize: 11,
    color: COLORS.gray600,
  },
  spareRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100 || '#F3F4F6',
  },
  spareCell: {
    ...FONTS.regular,
    fontSize: 11,
    color: COLORS.gray800,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  cancelBtn: {
    backgroundColor: COLORS.gray100 || '#F3F4F6',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  cancelText: {
    ...FONTS.semibold,
    fontSize: 15,
    color: COLORS.gray700,
  },
  confirmText: {
    ...FONTS.semibold,
    fontSize: 15,
    color: '#fff',
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    width: '82%',
    alignSelf: 'center',
    alignItems: 'center',
    marginVertical: 'auto',
    ...SHADOWS.large,
  },
  alertTitle: {
    ...FONTS.bold,
    fontSize: 17,
    color: COLORS.gray900,
    textAlign: 'center',
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
});

// ─── Screen Styles ────────────────────────────────────────────────────────────
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
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spareItemCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  spareItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spareInputName: {
    flex: 3,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDERS.radius.sm,
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    ...FONTS.regular,
    fontSize: 14,
    backgroundColor: COLORS.white,
  },
  spareInputSmall: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDERS.radius.sm,
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    ...FONTS.regular,
    fontSize: 14,
    backgroundColor: COLORS.white,
    textAlign: 'center',
  },
  removeButton: {
    padding: SPACING.sm,
  },
  addSpareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDERS.radius.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
  },
  addSpareText: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  calcButton: {
    marginBottom: SPACING.md,
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
  },
  dateText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray700,
    marginLeft: SPACING.sm,
  },
  readOnlyLabel: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  readOnlyBox: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.gray50,
    height: 48,
    justifyContent: 'center',
  },
  readOnlyValue: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray500,
  },
  readOnlyFieldWrapper: {
    marginBottom: SPACING.sm,
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
    ...SHADOWS.medium,
  },
  saveButtonText: {
    ...FONTS.bold,
    fontSize: 16,
    color: COLORS.white,
    marginLeft: SPACING.sm,
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
  estimateBtn: {
    borderColor: '#FDE68A',
  },
  invoiceBtn: {
    borderColor: COLORS.primaryLight || '#DBEAFE',
  },
  secondaryButtonText: {
    ...FONTS.medium,
    fontSize: 11,
    color: COLORS.gray700,
    textAlign: 'center',
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
});