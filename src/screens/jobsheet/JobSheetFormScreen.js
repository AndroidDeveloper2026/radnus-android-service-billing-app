// src/screens/jobsheet/JobSheetFormScreen.js
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import {
  Trash2, Plus, Calendar, Calculator,
  Save, RefreshCw, Home, FileText, Receipt,
  AlertCircle, CheckCircle,
} from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Formik } from 'formik';
import * as yup from 'yup';
import {
  createJob, updateJob, fetchJobById, clearCurrentJob,
} from '../../store/slices/jobSlice';
import {
  fetchEngineers, fetchMakes, fetchModels,
  fetchFaults, fetchDrawers,
} from '../../store/slices/adminSlice';
import {
  Button, Input, SelectModal, CheckboxItem, LoadingOverlay,
} from '../../components/UI';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
import { useToast } from 'react-native-toast-notifications';
import { useAuth } from '../../context/AuthContext';

// ─── Validation ──────────────────────────────────────────────────────────────
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
});

const physicalOptions = [
  'Colour Faded', 'Antenna Broken', 'Deformed', 'Battery Damaged',
  'LCD Broken / Bleeding', 'Tampered Set', 'Front Cover Scratches',
  'Scratches On Body', 'Water Logged',
];
const accessoryOptions = ['Battery', 'Charger', 'Back Cover', 'Memory Card', 'SIM'];

// ─── helpers ─────────────────────────────────────────────────────────────────
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

const PreviewSection = ({ title, children }) => {
  const hasContent = React.Children.toArray(children).some(c => c !== null && c !== false && c !== undefined);
  if (!hasContent) return null;
  return (
    <View style={pm.section}>
      <Text style={pm.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
};

// ─── Preview / Confirmation Modal ────────────────────────────────────────────
const PreviewConfirmModal = ({
  visible, values, makes, models, engineers, drawers,
  onConfirm, onCancel, confirmText = 'Confirm & Save', confirmColor = COLORS.primary, mode,
  isConfirming = false,
}) => {
  const makeName     = makes.find(m => m.id === values.makeId)?.name     || values.makeId     || '';
  const modelName    = models.find(m => m.id === values.modelId)?.name   || values.modelId    || '';
  const engineerName = engineers.find(e => e.id === values.engineerId)?.name || values.engineerId || '';
  const drawerName   = drawers.find(d => d.id === values.drawerId)?.name || values.drawerId   || '';

  const total = (parseFloat(values.serviceCharges) || 0) + (parseFloat(values.spareCharges) || 0);

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

          <ScrollView style={pm.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
            <PreviewSection title="👤  Customer">
              <PreviewRow label="Name"        value={values.customerName} />
              <PreviewRow label="Contact"     value={values.contact} />
              <PreviewRow label="Alt Contact" value={values.altContact} />
              <PreviewRow label="Address"     value={values.address} />
              <PreviewRow label="Email"       value={values.email} />
            </PreviewSection>

            <PreviewSection title="📱  Device">
              <PreviewRow label="Make"    value={makeName} />
              <PreviewRow label="Model"   value={modelName} />
              <PreviewRow label="IMEI"    value={values.imei} />
              <PreviewRow label="Warranty" value={values.warranty} />
              <PreviewRow label="Pattern / PIN" value={values.patternPin} />
              <PreviewRow label="ID Proof" value={values.idProof} />
            </PreviewSection>

            <PreviewSection title="🔍  Condition & Accessories">
              <PreviewRow label="Physical Condition" value={values.physicalConditions?.length ? values.physicalConditions : null} />
              <PreviewRow label="Accessories"        value={values.accessoriesReceived?.length ? values.accessoriesReceived : null} />
              <PreviewRow label="Battery No."        value={values.batteryNumber} />
            </PreviewSection>

            <PreviewSection title="🔧  Service & Repair">
              <PreviewRow label="Engineer"       value={engineerName} />
              <PreviewRow label="Dealer"         value={values.dealerName} />
              <PreviewRow label="Drawer"         value={drawerName} />
              <PreviewRow label="Service Charge" value={values.serviceCharges ? `₹ ${values.serviceCharges}` : null} />
              <PreviewRow label="Spare Charge"   value={values.spareCharges   ? `₹ ${values.spareCharges}`   : null} />
              <PreviewRow label="Total Estimate" value={total > 0             ? `₹ ${total}`                 : null} />
              <PreviewRow label="Payment Mode"   value={values.paymentMode} />
              <PreviewRow label="Repair Date"    value={values.repairDate   ? new Date(values.repairDate).toLocaleDateString()   : null} />
              <PreviewRow label="Delivery Date"  value={values.deliveryDate ? new Date(values.deliveryDate).toLocaleDateString() : null} />
              <PreviewRow label="Remarks"        value={values.remarks} />
            </PreviewSection>

            {values.spareItems?.length > 0 && (
              <View style={pm.section}>
                <Text style={pm.sectionTitle}>🛒  Spare Parts</Text>
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
                      <Text style={[pm.spareCell, { flex: 1, textAlign: 'center' }]}>{item.qty || 0}</Text>
                      <Text style={[pm.spareCell, { flex: 1.5, textAlign: 'right' }]}>₹{item.rate || 0}</Text>
                      <Text style={[pm.spareCell, { flex: 1.5, textAlign: 'right' }]}>₹{amt}</Text>
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
  visible, title, message, onConfirm, onCancel,
  confirmText = 'Confirm', confirmColor = COLORS.primary,
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
  const dispatch    = useDispatch();
  const navigation  = useNavigation();
  const route       = useRoute();
  const toast       = useToast();
  const { user }    = useAuth();
  const { mode, jobId } = route.params || { mode: 'new' };

  const { currentJob, loading: jobLoading } = useSelector(s => s.jobs);
  const { engineers, makes, models, drawers, loading: adminLoading } = useSelector(s => s.admin);

  // ── FIX #2: adminLoading (background fetches) should NOT freeze the whole UI.
  // Only jobLoading (fetching a specific job for edit) should show the overlay.
  const isLoading = jobLoading;

  const [openRepairDate,   setOpenRepairDate]   = useState(false);
  const [openDeliveryDate, setOpenDeliveryDate] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    action: null,
    pendingValues: null,
  });

  const afterSaveRef = useRef(null);
  const savedJobIdRef = useRef(jobId || null);

  useEffect(() => {
    if (!engineers.length) dispatch(fetchEngineers());
    if (!makes.length)     dispatch(fetchMakes());
    if (!models.length)    dispatch(fetchModels());
    if (!drawers.length)   dispatch(fetchDrawers());
    if (mode === 'edit' && jobId) dispatch(fetchJobById(jobId));
    return () => { if (mode === 'edit') dispatch(clearCurrentJob()); };
  }, []);

  useEffect(() => {
    if (jobId) savedJobIdRef.current = jobId;
  }, [jobId]);

  const initialValues = useMemo(() => ({
    customerName:        currentJob?.customerName        || '',
    contact:             currentJob?.contact             || '',
    altContact:          currentJob?.altContact          || '',
    address:             currentJob?.address             || '',
    email:               currentJob?.email               || '',
    makeId:              currentJob?.makeId              || '',
    modelId:             currentJob?.modelId             || '',
    imei:                currentJob?.imei                || '',
    warranty:            currentJob?.warranty            || 'No Warranty',
    patternPin:          currentJob?.patternPin          || '',
    idProof:             currentJob?.idProof             || '',
    physicalConditions:  currentJob?.physicalConditions  || [],
    accessoriesReceived: currentJob?.accessoriesReceived || [],
    batteryNumber:       currentJob?.batteryNumber       || '',
    engineerId:          currentJob?.engineerId          || '',
    dealerName:          currentJob?.dealerName          || '',
    drawerId:            currentJob?.drawerId            || '',
    serviceCharges:      currentJob?.serviceCharges?.toString()  || '',
    spareCharges:        currentJob?.spareCharges?.toString()    || '',
    estimateAmount:      currentJob?.estimateAmount?.toString()  || '',
    paymentMode:         currentJob?.paymentMode         || '',
    repairDate:   currentJob?.repairDate    ? new Date(currentJob.repairDate)    : new Date(),
    deliveryDate: currentJob?.deliveredDate ? new Date(currentJob.deliveredDate) : new Date(),
    remarks:    currentJob?.remarks    || '',
    spareItems: currentJob?.spareItems || [],
  }), [currentJob]);

  const calculateEstimate = (setFieldValue, getValues) => {
    const v = getValues();
    const service = parseFloat(v.serviceCharges) || 0;
    const spare   = parseFloat(v.spareCharges)   || 0;
    const itemsTotal = (v.spareItems || []).reduce(
      (sum, item) => sum + ((parseInt(item.qty) || 0) * (parseFloat(item.rate) || 0)), 0,
    );
    setFieldValue('estimateAmount', (service + spare + itemsTotal).toString());
    toast.show('Estimate calculated', { type: 'info' });
  };

  const buildSubmitData = (values) => ({
    ...values,
    serviceCharges: parseFloat(values.serviceCharges) || 0,
    spareCharges:   parseFloat(values.spareCharges)   || 0,
    estimateAmount: parseFloat(values.estimateAmount) || 0,
    spareItems: (values.spareItems || []).map(item => ({
      name:   item.name  || '',
      qty:    parseInt(item.qty)    || 0,
      rate:   parseFloat(item.rate) || 0,
      amount: (parseInt(item.qty) || 0) * (parseFloat(item.rate) || 0),
    })),
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
      const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to save job';
      toast.show(msg, { type: 'danger' });
      return null;
    }
  };

  const requestSave = (values) => {
    const missing = [];
    if (!values.customerName?.trim()) missing.push('Customer Name');
    if (!values.contact?.trim())      missing.push('Contact Number');

    if (missing.length > 0) {
      missing.forEach(field => toast.show(`${field} is required`, { type: 'danger' }));
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
    if (!values.contact?.trim())      missing.push('Contact Number');

    if (missing.length > 0) {
      missing.forEach(field => toast.show(`${field} is required`, { type: 'danger' }));
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
    if (!values.contact?.trim())      missing.push('Contact Number');

    if (missing.length > 0) {
      missing.forEach(field => toast.show(`${field} is required`, { type: 'danger' }));
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

  // ── FIX #3: closeConfirm resets isConfirming FIRST, then hides modal with
  // a tiny delay so the disabled state clears before the modal unmounts.
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
          message: mode === 'edit'
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
        return { title: 'Confirm', message: '', confirmText: 'OK', confirmColor: COLORS.primary };
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
        // ── FIX #1: Call setSubmitting(false) immediately so Formik never gets
        // stuck in isSubmitting=true. The real async save happens inside the
        // confirmation modal via handleConfirm → performSave.
        onSubmit={(values, { setSubmitting }) => {
          requestSave(values);
          setSubmitting(false);
        }}
        enableReinitialize
      >
        {({ values, setFieldValue, handleSubmit, isSubmitting, errors, touched }) => {
          const filteredModels = models.filter(m => m.makeId === values.makeId);

          // Buttons are only disabled while the modal confirm is in progress.
          // isSubmitting is no longer used to gate buttons since we reset it immediately.
          const buttonsDisabled = isConfirming;

          return (
            <View style={{ padding: SPACING.lg, paddingBottom: SPACING.xxl }}>
              {/* Physical Condition */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Physical Condition</Text>
                <View style={styles.checkboxGroup}>
                  {physicalOptions.map(opt => (
                    <CheckboxItem
                      key={opt}
                      label={opt}
                      checked={values.physicalConditions?.includes(opt)}
                      onToggle={() => {
                        const exists = values.physicalConditions?.includes(opt);
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
              </View>

              {/* Customer Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Customer Information</Text>
                <Input label="Customer Name" value={values.customerName} onChangeText={t => setFieldValue('customerName', t)} required error={touched.customerName && errors.customerName} />
                <Input label="Contact No" value={values.contact} onChangeText={t => setFieldValue('contact', t)} keyboardType="phone-pad" required error={touched.contact && errors.contact} />
                <Input label="Alt Contact" value={values.altContact} onChangeText={t => setFieldValue('altContact', t)} keyboardType="phone-pad" />
                <Input label="Customer Address" value={values.address} onChangeText={t => setFieldValue('address', t)} multiline />
                <Input label="Email ID" value={values.email} onChangeText={t => setFieldValue('email', t)} keyboardType="email-address" error={touched.email && errors.email} />
              </View>

              {/* Device Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Device Details</Text>
                <SelectModal label="Make" value={values.makeId} options={makes} onSelect={v => { setFieldValue('makeId', v); setFieldValue('modelId', ''); }} placeholder="Select Make" />
                <SelectModal label="Model" value={values.modelId} options={filteredModels} onSelect={v => setFieldValue('modelId', v)} placeholder="Select Model" />
                <Input label="IMEI" value={values.imei} onChangeText={t => setFieldValue('imei', t)} />
                <SelectModal label="Warranty" value={values.warranty} options={[{ id: 'No Warranty', name: 'No Warranty' }, { id: 'In Warranty', name: 'In Warranty' }]} onSelect={v => setFieldValue('warranty', v)} />
                <Input label="Pattern / PIN" value={values.patternPin} onChangeText={t => setFieldValue('patternPin', t)} />
                <SelectModal
                  label="ID Proof"
                  value={values.idProof}
                  options={[
                    { id: 'Aadhaar Card',   name: 'Aadhaar Card' },
                    { id: 'Passport',        name: 'Passport' },
                    { id: 'Driving License', name: 'Driving License' },
                    { id: 'Election ID',     name: 'Election ID' },
                    { id: 'ID Not Required', name: 'ID Not Required' },
                  ]}
                  onSelect={v => setFieldValue('idProof', v)}
                />
              </View>

              {/* Accessories Received */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Accessories Received</Text>
                <View style={styles.checkboxGroup}>
                  {accessoryOptions.map(opt => (
                    <CheckboxItem
                      key={opt}
                      label={opt}
                      checked={values.accessoriesReceived?.includes(opt)}
                      onToggle={() => {
                        const exists = values.accessoriesReceived?.includes(opt);
                        setFieldValue(
                          'accessoriesReceived',
                          exists
                            ? values.accessoriesReceived.filter(i => i !== opt)
                            : [...(values.accessoriesReceived || []), opt],
                        );
                      }}
                    />
                  ))}
                </View>
                <Input label="Battery Number" value={values.batteryNumber} onChangeText={t => setFieldValue('batteryNumber', t)} />
              </View>

              {/* Service / Repair Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Service &amp; Repair</Text>
                <SelectModal label="Engineer" value={values.engineerId} options={engineers} onSelect={v => setFieldValue('engineerId', v)} />
                <Input label="Dealer Name" value={values.dealerName} onChangeText={t => setFieldValue('dealerName', t)} />
                <SelectModal label="Drawer" value={values.drawerId} options={drawers} onSelect={v => setFieldValue('drawerId', v)} />

                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: SPACING.sm }}>
                    <Input label="Service Charges" value={values.serviceCharges} onChangeText={t => setFieldValue('serviceCharges', t)} keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input label="Spare Charges" value={values.spareCharges} onChangeText={t => setFieldValue('spareCharges', t)} keyboardType="numeric" />
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
                          onChangeText={v => {
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
                          onChangeText={v => {
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
                          onChangeText={v => {
                            const n = [...(values.spareItems || [])];
                            n[index] = { ...n[index], rate: v };
                            setFieldValue('spareItems', n);
                          }}
                          keyboardType="numeric"
                          style={styles.spareInputSmall}
                          placeholderTextColor={COLORS.gray400}
                        />
                        <TouchableOpacity
                          onPress={() => setFieldValue('spareItems', (values.spareItems || []).filter((_, i) => i !== index))}
                          style={styles.removeButton}
                        >
                          <Trash2 size={18} color={COLORS.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  <TouchableOpacity
                    onPress={() => setFieldValue('spareItems', [...(values.spareItems || []), { id: Date.now().toString(), name: '', qty: '1', rate: '' }])}
                    style={styles.addSpareButton}
                  >
                    <Plus size={18} color={COLORS.primary} />
                    <Text style={styles.addSpareText}>Add Spare Part</Text>
                  </TouchableOpacity>
                </View>

                <Input label="Estimate Amount" value={values.estimateAmount} onChangeText={t => setFieldValue('estimateAmount', t)} keyboardType="numeric" />
                <Button title="Calculate Estimate" onPress={() => calculateEstimate(setFieldValue, () => values)} variant="secondary" style={styles.calcButton} icon={Calculator} />

                <SelectModal
                  label="Payment Mode"
                  value={values.paymentMode}
                  options={[
                    { id: 'Cash', name: 'Cash' },
                    { id: 'UPI',  name: 'UPI' },
                    { id: 'Card', name: 'Card' },
                  ]}
                  onSelect={v => setFieldValue('paymentMode', v)}
                  placeholder="Select Payment Mode"
                />

                {/* Date Pickers */}
                <TouchableOpacity onPress={() => setOpenRepairDate(true)} style={styles.dateButton}>
                  <Calendar size={20} color={COLORS.gray600} />
                  <Text style={styles.dateText}>Repair Date: {values.repairDate?.toLocaleDateString()}</Text>
                </TouchableOpacity>
                <DatePicker modal open={openRepairDate} date={values.repairDate || new Date()} onConfirm={date => { setOpenRepairDate(false); setFieldValue('repairDate', date); }} onCancel={() => setOpenRepairDate(false)} />

                <TouchableOpacity onPress={() => setOpenDeliveryDate(true)} style={styles.dateButton}>
                  <Calendar size={20} color={COLORS.gray600} />
                  <Text style={styles.dateText}>Delivery Date: {values.deliveryDate?.toLocaleDateString()}</Text>
                </TouchableOpacity>
                <DatePicker modal open={openDeliveryDate} date={values.deliveryDate || new Date()} onConfirm={date => { setOpenDeliveryDate(false); setFieldValue('deliveryDate', date); }} onCancel={() => setOpenDeliveryDate(false)} />

                <Input label="Remarks" value={values.remarks} onChangeText={t => setFieldValue('remarks', t)} multiline />
              </View>

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
                    {buttonsDisabled ? 'Saving…' : mode === 'edit' ? 'Update Job Sheet' : 'Save Job Sheet'}
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
                    <Text style={[styles.secondaryButtonText, { color: '#F59E0B' }]}>Estimate</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.secondaryButton, styles.invoiceBtn, buttonsDisabled && { opacity: 0.6 }]}
                    onPress={() => requestInvoice(values)}
                    disabled={buttonsDisabled}
                  >
                    <Receipt size={20} color={COLORS.primary} />
                    <Text style={[styles.secondaryButtonText, { color: COLORS.primary }]}>Invoice</Text>
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
      {confirmModal.visible && confirmModal.action === 'save' && (() => {
        const cfg = confirmConfig();
        return (
          <PreviewConfirmModal
            visible
            values={confirmModal.pendingValues}
            makes={makes}
            models={models}
            engineers={engineers}
            drawers={drawers}
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
      {confirmModal.visible && (confirmModal.action === 'invoice' || confirmModal.action === 'estimate') && (() => {
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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  card: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingHorizontal: 20, paddingBottom: 28, maxHeight: '90%', ...SHADOWS.large },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  headerTitle: { ...FONTS.bold, fontSize: 18, color: COLORS.gray900 },
  subTitle: { ...FONTS.regular, fontSize: 13, color: COLORS.gray500, marginBottom: 16 },
  scrollArea: { maxHeight: 440 },
  section: { backgroundColor: COLORS.gray50 || '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 10 },
  sectionTitle: { ...FONTS.semibold, fontSize: 13, color: COLORS.gray700, marginBottom: 8, letterSpacing: 0.2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 || '#F3F4F6' },
  rowLabel: { ...FONTS.medium, fontSize: 12, color: COLORS.gray500, flex: 1.2 },
  rowValue: { ...FONTS.regular, fontSize: 12, color: COLORS.gray900, flex: 2, textAlign: 'right', flexWrap: 'wrap' },
  spareHeader: { flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: COLORS.gray300 || '#D1D5DB', marginBottom: 4 },
  spareCol: { ...FONTS.semibold, fontSize: 11, color: COLORS.gray600 },
  spareRow: { flexDirection: 'row', paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 || '#F3F4F6' },
  spareCell: { ...FONTS.regular, fontSize: 11, color: COLORS.gray800 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 18, width: '100%' },
  btn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  cancelBtn: { backgroundColor: COLORS.gray100 || '#F3F4F6', borderWidth: 1, borderColor: COLORS.gray200 },
  cancelText: { ...FONTS.semibold, fontSize: 15, color: COLORS.gray700 },
  confirmText: { ...FONTS.semibold, fontSize: 15, color: '#fff' },
  alertCard: { backgroundColor: '#fff', borderRadius: 16, padding: 28, width: '82%', alignSelf: 'center', alignItems: 'center', marginVertical: 'auto', ...SHADOWS.large },
  alertTitle: { ...FONTS.bold, fontSize: 17, color: COLORS.gray900, textAlign: 'center', marginBottom: 8 },
  alertMsg: { ...FONTS.regular, fontSize: 13, color: COLORS.gray600, textAlign: 'center', lineHeight: 20, marginBottom: 22 },
});

// ─── Screen Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  section: { backgroundColor: COLORS.white, borderRadius: BORDERS.radius.lg, padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.small },
  sectionTitle: { ...FONTS.bold, fontSize: 18, color: COLORS.gray900, marginBottom: SPACING.md, borderLeftWidth: 3, borderLeftColor: COLORS.primary, paddingLeft: SPACING.sm },
  subsectionTitle: { ...FONTS.semibold, fontSize: 14, color: COLORS.gray700, marginBottom: SPACING.sm },
  checkboxGroup: { flexDirection: 'row', flexWrap: 'wrap' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  spareItemCard: { backgroundColor: COLORS.gray50, borderRadius: BORDERS.radius.md, padding: SPACING.sm, marginBottom: SPACING.sm },
  spareItemRow: { flexDirection: 'row', alignItems: 'center' },
  spareInputName: { flex: 3, borderWidth: 1, borderColor: COLORS.gray200, borderRadius: BORDERS.radius.sm, padding: SPACING.sm, marginRight: SPACING.sm, ...FONTS.regular, fontSize: 14, backgroundColor: COLORS.white },
  spareInputSmall: { flex: 1, borderWidth: 1, borderColor: COLORS.gray200, borderRadius: BORDERS.radius.sm, padding: SPACING.sm, marginRight: SPACING.sm, ...FONTS.regular, fontSize: 14, backgroundColor: COLORS.white, textAlign: 'center' },
  removeButton: { padding: SPACING.sm },
  addSpareButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.primary, borderRadius: BORDERS.radius.md, paddingVertical: SPACING.sm, marginTop: SPACING.xs, backgroundColor: COLORS.primaryLight },
  addSpareText: { ...FONTS.medium, fontSize: 14, color: COLORS.primary, marginLeft: SPACING.xs },
  calcButton: { marginBottom: SPACING.md },
  dateButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray200, borderRadius: BORDERS.radius.md, padding: SPACING.md, marginBottom: SPACING.md, backgroundColor: COLORS.white },
  dateText: { ...FONTS.regular, fontSize: 14, color: COLORS.gray700, marginLeft: SPACING.sm },
  actionContainer: { marginTop: SPACING.md, marginBottom: SPACING.lg },
  saveButtonPrimary: { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md, borderRadius: BORDERS.radius.md, marginBottom: SPACING.md, ...SHADOWS.medium },
  saveButtonText: { ...FONTS.bold, fontSize: 16, color: COLORS.white, marginLeft: SPACING.sm },
  secondaryActions: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.sm, flexWrap: 'wrap' },
  secondaryButton: { flex: 1, minWidth: 60, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, paddingVertical: SPACING.sm, borderRadius: BORDERS.radius.md, borderWidth: 1, borderColor: COLORS.gray200, ...SHADOWS.small, gap: 4 },
  estimateBtn: { borderColor: '#FDE68A' },
  invoiceBtn:  { borderColor: COLORS.primaryLight || '#DBEAFE' },
  secondaryButtonText: { ...FONTS.medium, fontSize: 11, color: COLORS.gray700, textAlign: 'center' },
});