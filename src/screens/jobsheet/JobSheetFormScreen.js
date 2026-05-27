// src/screens/jobsheet/JobSheetFormScreen.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import { Trash2, Plus, Calendar, Calculator, Save, RefreshCw, Home, FileText } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Formik } from 'formik';
import * as yup from 'yup';
import { createJob, updateJob, fetchJobById, clearCurrentJob } from '../../store/slices/jobSlice';
import { fetchEngineers, fetchMakes, fetchModels, fetchFaults, fetchDrawers } from '../../store/slices/adminSlice';
import { Button, Input, SelectModal, CheckboxItem, LoadingOverlay } from '../../components/UI';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
import { useToast } from 'react-native-toast-notifications';
import { useAuth } from '../../context/AuthContext';

// Validation Schema
const JobSheetSchema = yup.object().shape({
  customerName: yup.string().required('Customer name is required'),
  contact: yup.string().required('Contact number is required').min(10, 'Enter valid contact number'),
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
  'Scratches On Body', 'Water Logged'
];
const accessoryOptions = ['Battery', 'Charger', 'Back Cover', 'Memory Card', 'SIM'];

export default function JobSheetFormScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const toast = useToast();
  const { user } = useAuth();
  const { mode, jobId } = route.params || { mode: 'new' };
  
  const { currentJob, loading: jobLoading } = useSelector(state => state.jobs);
  const { engineers, makes, models, drawers, loading: adminLoading } = useSelector(state => state.admin);
  const isLoading = jobLoading || adminLoading;

  const [openRepairDate, setOpenRepairDate] = useState(false);
  const [openDeliveryDate, setOpenDeliveryDate] = useState(false);

  useEffect(() => {
    if (!engineers.length) dispatch(fetchEngineers());
    if (!makes.length) dispatch(fetchMakes());
    if (!models.length) dispatch(fetchModels());
    if (!drawers.length) dispatch(fetchDrawers());
    if (mode === 'edit' && jobId) dispatch(fetchJobById(jobId));
    return () => { if (mode === 'edit') dispatch(clearCurrentJob()); };
  }, []);

  const initialValues = useMemo(() => ({
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
    serviceCharges: currentJob?.serviceCharges?.toString() || '',
    spareCharges: currentJob?.spareCharges?.toString() || '',
    estimateAmount: currentJob?.estimateAmount?.toString() || '',
    paymentMode: currentJob?.paymentMode || '',
    repairDate: currentJob?.repairDate ? new Date(currentJob.repairDate) : new Date(),
    deliveryDate: currentJob?.deliveredDate ? new Date(currentJob.deliveredDate) : new Date(),
    remarks: currentJob?.remarks || '',
    spareItems: currentJob?.spareItems || [],
  }), [currentJob]);

  const calculateEstimate = (setFieldValue, getValues) => {
    const values = getValues();
    const service = parseFloat(values.serviceCharges) || 0;
    const spare = parseFloat(values.spareCharges) || 0;
    const spareItemsTotal = (values.spareItems || []).reduce(
      (sum, item) => sum + ((parseInt(item.qty) || 0) * (parseFloat(item.rate) || 0)), 0
    );
    const total = service + spare + spareItemsTotal;
    setFieldValue('estimateAmount', total.toString());
    toast.show('Estimate calculated', { type: 'info' });
  };

  const handleSave = async (values, { setSubmitting }) => {
    if (!values.customerName || !values.contact) {
      toast.show('Customer Name and Contact are required', { type: 'danger' });
      setSubmitting(false);
      return;
    }

    // Prepare spare items with calculated amount
    const spareItemsWithAmount = (values.spareItems || []).map(item => ({
      name: item.name || '',
      qty: parseInt(item.qty) || 0,
      rate: parseFloat(item.rate) || 0,
      amount: (parseInt(item.qty) || 0) * (parseFloat(item.rate) || 0),
    }));

    const submitData = {
      ...values,
      serviceCharges: parseFloat(values.serviceCharges) || 0,
      spareCharges: parseFloat(values.spareCharges) || 0,
      estimateAmount: parseFloat(values.estimateAmount) || 0,
      spareItems: spareItemsWithAmount,
    };

    try {
      if (mode === 'edit') {
        await dispatch(updateJob({ id: jobId, data: submitData })).unwrap();
        toast.show('Job updated successfully', { type: 'success' });
      } else {
        await dispatch(createJob(submitData)).unwrap();
        toast.show('Job created successfully', { type: 'success' });
      }
      navigation.goBack();
    } catch (error) {
      console.error('Save error:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to save job';
      toast.show(errorMsg, { type: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAwareScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} showsVerticalScrollIndicator={false}>
      <Formik
        initialValues={initialValues}
        validationSchema={JobSheetSchema}
        onSubmit={handleSave}
        enableReinitialize
      >
        {({ values, setFieldValue, handleSubmit, isSubmitting, errors, touched }) => {
          const filteredModels = models.filter(m => m.makeId === values.makeId);

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
                        if (exists) {
                          setFieldValue('physicalConditions', values.physicalConditions.filter(i => i !== opt));
                        } else {
                          setFieldValue('physicalConditions', [...(values.physicalConditions || []), opt]);
                        }
                      }}
                    />
                  ))}
                </View>
              </View>

              {/* Customer Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Customer Information</Text>
                <Input
                  label="Customer Name"
                  value={values.customerName}
                  onChangeText={text => setFieldValue('customerName', text)}
                  required
                  error={touched.customerName && errors.customerName}
                />
                <Input
                  label="Contact No"
                  value={values.contact}
                  onChangeText={text => setFieldValue('contact', text)}
                  keyboardType="phone-pad"
                  required
                  error={touched.contact && errors.contact}
                />
                <Input
                  label="Alt Contact"
                  value={values.altContact}
                  onChangeText={text => setFieldValue('altContact', text)}
                  keyboardType="phone-pad"
                />
                <Input
                  label="Customer Address"
                  value={values.address}
                  onChangeText={text => setFieldValue('address', text)}
                  multiline
                />
                <Input
                  label="Email ID"
                  value={values.email}
                  onChangeText={text => setFieldValue('email', text)}
                  keyboardType="email-address"
                  error={touched.email && errors.email}
                />
              </View>

              {/* Device Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Device Details</Text>
                <SelectModal
                  label="Make"
                  value={values.makeId}
                  options={makes}
                  onSelect={v => setFieldValue('makeId', v)}
                  placeholder="Select Make"
                />
                <SelectModal
                  label="Model"
                  value={values.modelId}
                  options={filteredModels}
                  onSelect={v => setFieldValue('modelId', v)}
                  placeholder="Select Model"
                />
                <Input label="IMEI" value={values.imei} onChangeText={text => setFieldValue('imei', text)} />
                <SelectModal
                  label="Warranty"
                  value={values.warranty}
                  options={[{ id: 'No Warranty', name: 'No Warranty' }, { id: 'In Warranty', name: 'In Warranty' }]}
                  onSelect={v => setFieldValue('warranty', v)}
                />
                <Input label="Pattern / PIN" value={values.patternPin} onChangeText={text => setFieldValue('patternPin', text)} />
                <SelectModal
                  label="ID Proof"
                  value={values.idProof}
                  options={[
                    { id: 'Aadhaar Card', name: 'Aadhaar Card' },
                    { id: 'Passport', name: 'Passport' },
                    { id: 'Driving License', name: 'Driving License' },
                    { id: 'Election ID', name: 'Election ID' },
                    { id: 'ID Not Required', name: 'ID Not Required' }
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
                        if (exists) {
                          setFieldValue('accessoriesReceived', values.accessoriesReceived.filter(i => i !== opt));
                        } else {
                          setFieldValue('accessoriesReceived', [...(values.accessoriesReceived || []), opt]);
                        }
                      }}
                    />
                  ))}
                </View>
                <Input label="Battery Number" value={values.batteryNumber} onChangeText={text => setFieldValue('batteryNumber', text)} />
              </View>

              {/* Service / Repair Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Service & Repair</Text>
                <SelectModal
                  label="Engineer"
                  value={values.engineerId}
                  options={engineers}
                  onSelect={v => setFieldValue('engineerId', v)}
                />
                <Input label="Dealer Name" value={values.dealerName} onChangeText={text => setFieldValue('dealerName', text)} />
                <SelectModal
                  label="Drawer"
                  value={values.drawerId}
                  options={drawers}
                  onSelect={v => setFieldValue('drawerId', v)}
                />
                
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: SPACING.sm }}>
                    <Input label="Service Charges" value={values.serviceCharges} onChangeText={text => setFieldValue('serviceCharges', text)} keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input label="Spare Charges" value={values.spareCharges} onChangeText={text => setFieldValue('spareCharges', text)} keyboardType="numeric" />
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
                            const newItems = [...(values.spareItems || [])];
                            newItems[index] = { ...newItems[index], name: v };
                            setFieldValue('spareItems', newItems);
                          }}
                          style={styles.spareInputName}
                          placeholderTextColor={COLORS.gray400}
                        />
                        <TextInput
                          placeholder="Qty"
                          value={item.qty?.toString()}
                          onChangeText={v => {
                            const newItems = [...(values.spareItems || [])];
                            newItems[index] = { ...newItems[index], qty: v };
                            setFieldValue('spareItems', newItems);
                          }}
                          keyboardType="numeric"
                          style={styles.spareInputSmall}
                          placeholderTextColor={COLORS.gray400}
                        />
                        <TextInput
                          placeholder="Rate"
                          value={item.rate?.toString()}
                          onChangeText={v => {
                            const newItems = [...(values.spareItems || [])];
                            newItems[index] = { ...newItems[index], rate: v };
                            setFieldValue('spareItems', newItems);
                          }}
                          keyboardType="numeric"
                          style={styles.spareInputSmall}
                          placeholderTextColor={COLORS.gray400}
                        />
                        <TouchableOpacity onPress={() => {
                          const newItems = (values.spareItems || []).filter((_, i) => i !== index);
                          setFieldValue('spareItems', newItems);
                        }} style={styles.removeButton}>
                          <Trash2 size={18} color={COLORS.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  <TouchableOpacity onPress={() => {
                    const newItems = [...(values.spareItems || []), { id: Date.now().toString(), name: '', qty: '1', rate: '' }];
                    setFieldValue('spareItems', newItems);
                  }} style={styles.addSpareButton}>
                    <Plus size={18} color={COLORS.primary} />
                    <Text style={styles.addSpareText}>Add Spare Part</Text>
                  </TouchableOpacity>
                </View>

                <Input
                  label="Estimate Amount"
                  value={values.estimateAmount}
                  onChangeText={text => setFieldValue('estimateAmount', text)}
                  keyboardType="numeric"
                />
                <Button
                  title="Calculate Estimate"
                  onPress={() => calculateEstimate(setFieldValue, () => values)}
                  variant="secondary"
                  style={styles.calcButton}
                  icon={Calculator}
                />

                <Input label="Payment Mode" value={values.paymentMode} onChangeText={text => setFieldValue('paymentMode', text)} />

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

                <Input label="Remarks" value={values.remarks} onChangeText={text => setFieldValue('remarks', text)} multiline />
              </View>

              {/* Action Buttons */}
              <View style={styles.actionContainer}>
                <TouchableOpacity style={styles.saveButtonPrimary} onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.8}>
                  <Save size={22} color={COLORS.white} />
                  <Text style={styles.saveButtonText}>Save Job Sheet</Text>
                </TouchableOpacity>

                <View style={styles.secondaryActions}>
                  <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.replace('JobSheetForm', { mode, jobId })}>
                    <RefreshCw size={20} color={COLORS.gray700} />
                    <Text style={styles.secondaryButtonText}>Refresh</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.secondaryButton} onPress={() => calculateEstimate(setFieldValue, () => values)}>
                    <Calculator size={20} color={COLORS.gray700} />
                    <Text style={styles.secondaryButtonText}>Estimate</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.secondaryButton} onPress={() => Alert.alert('Invoice', 'Save job first to generate invoice')}>
                    <FileText size={20} color={COLORS.gray700} />
                    <Text style={styles.secondaryButtonText}>Invoice</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Home')}>
                    <Home size={20} color={COLORS.gray700} />
                    <Text style={styles.secondaryButtonText}>Home</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      </Formik>
      <LoadingOverlay visible={isLoading} />
    </KeyboardAwareScrollView>
  );
}

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
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radius.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    ...SHADOWS.small,
  },
  secondaryButtonText: {
    ...FONTS.medium,
    fontSize: 12,
    color: COLORS.gray700,
    marginLeft: SPACING.xs,
  },
});