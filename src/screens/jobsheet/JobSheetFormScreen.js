// // src/screens/jobsheet/JobSheetFormScreen.js
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import DatePicker from 'react-native-date-picker';
// import { Trash2, Plus, Calendar, Calculator, Save, RefreshCw, Home, FileText, CreditCard } from 'lucide-react-native';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// import { createJob, updateJob, fetchJobById, clearCurrentJob } from '../../store/slices/jobSlice';
// import { fetchEngineers, fetchMakes, fetchModels, fetchFaults, fetchDrawers } from '../../store/slices/adminSlice';
// import { Button, Input, SelectModal, CheckboxItem, SectionCard, LoadingOverlay } from '../../components/UI';
// import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
// import { useToast } from 'react-native-toast-notifications';

// export default function JobSheetFormScreen() {
//   const dispatch = useDispatch();
//   const navigation = useNavigation();
//   const route = useRoute();
//   const toast = useToast();
//   const { mode, jobId } = route.params || { mode: 'new' };
  
//   const { currentJob, loading: jobLoading } = useSelector(state => state.jobs);
//   const { engineers, makes, models, faults, drawers, loading: adminLoading } = useSelector(state => state.admin);
//   const isLoading = jobLoading || adminLoading;

//   const [formData, setFormData] = useState({
//     customerName: '', contact: '', altContact: '', address: '', email: '',
//     makeId: '', modelId: '', imei: '', warranty: 'No Warranty', patternPin: '', idProof: '',
//     physicalConditions: [], accessoriesReceived: [], batteryNumber: '',
//     engineerId: '', dealerName: '', drawerId: '',
//     serviceCharges: '', spareCharges: '', estimateAmount: '', paymentMode: '',
//     repairDate: new Date(), deliveryDate: new Date(), remarks: '', spareItems: [], status: 'Received',
//   });

//   const [openRepairDate, setOpenRepairDate] = useState(false);
//   const [openDeliveryDate, setOpenDeliveryDate] = useState(false);

//   const physicalOptions = ['Colour Faded', 'Antenna Broken', 'Deformed', 'Battery Damaged', 'LCD Broken / Bleeding', 'Tampered Set', 'Front Cover Scratches', 'Scratches On Body', 'Water Logged'];
//   const accessoryOptions = ['Battery', 'Charger', 'Back Cover', 'Memory Card', 'SIM'];

//   useEffect(() => {
//     if (!engineers.length) dispatch(fetchEngineers());
//     if (!makes.length) dispatch(fetchMakes());
//     if (!models.length) dispatch(fetchModels());
//     if (!faults.length) dispatch(fetchFaults());
//     if (!drawers.length) dispatch(fetchDrawers());
//     if (mode === 'edit' && jobId) dispatch(fetchJobById(jobId));
//     return () => { if (mode === 'edit') dispatch(clearCurrentJob()); };
//   }, []);

//   useEffect(() => {
//     if (mode === 'edit' && currentJob) {
//       setFormData({
//         ...currentJob,
//         repairDate: currentJob.repairDate ? new Date(currentJob.repairDate) : new Date(),
//         deliveryDate: currentJob.deliveredDate ? new Date(currentJob.deliveredDate) : new Date(),
//         spareItems: currentJob.spareItems || [],
//       });
//     }
//   }, [currentJob]);

//   const updateField = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

//   const togglePhysical = (item) => {
//     setFormData(prev => ({
//       ...prev,
//       physicalConditions: prev.physicalConditions.includes(item)
//         ? prev.physicalConditions.filter(i => i !== item)
//         : [...prev.physicalConditions, item]
//     }));
//   };

//   const toggleAccessory = (item) => {
//     setFormData(prev => ({
//       ...prev,
//       accessoriesReceived: prev.accessoriesReceived.includes(item)
//         ? prev.accessoriesReceived.filter(i => i !== item)
//         : [...prev.accessoriesReceived, item]
//     }));
//   };

//   const addSpareItem = () => {
//     setFormData(prev => ({
//       ...prev,
//       spareItems: [...prev.spareItems, { id: Date.now().toString(), name: '', qty: '1', rate: '' }],
//     }));
//   };

//   const updateSpareItem = (index, field, value) => {
//     const newItems = [...formData.spareItems];
//     newItems[index][field] = value;
//     setFormData(prev => ({ ...prev, spareItems: newItems }));
//   };

//   const removeSpareItem = (index) => {
//     setFormData(prev => ({ ...prev, spareItems: prev.spareItems.filter((_, i) => i !== index) }));
//   };

//   const calculateEstimate = () => {
//     const service = parseFloat(formData.serviceCharges) || 0;
//     const spare = parseFloat(formData.spareCharges) || 0;
//     const spareItemsTotal = formData.spareItems.reduce((sum, item) => sum + ((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)), 0);
//     const total = service + spare + spareItemsTotal;
//     updateField('estimateAmount', total.toString());
//     toast.show('Estimate calculated', { type: 'info' });
//   };

//   const handleSave = async () => {
//     if (!formData.customerName || !formData.contact) {
//       toast.show('Customer Name and Contact are required', { type: 'danger' });
//       return;
//     }
//     const submitData = {
//       ...formData,
//       serviceCharges: parseFloat(formData.serviceCharges) || 0,
//       spareCharges: parseFloat(formData.spareCharges) || 0,
//       estimateAmount: parseFloat(formData.estimateAmount) || 0,
//     };
//     try {
//       if (mode === 'edit') {
//         await dispatch(updateJob({ id: jobId, data: submitData })).unwrap();
//         toast.show('Job updated successfully', { type: 'success' });
//       } else {
//         await dispatch(createJob(submitData)).unwrap();
//         toast.show('Job created successfully', { type: 'success' });
//       }
//       navigation.goBack();
//     } catch (error) {
//       toast.show('Failed to save job', { type: 'danger' });
//     }
//   };

//   const filteredModels = useMemo(() => models.filter(m => m.makeId === formData.makeId), [models, formData.makeId]);

//   return (
//     <KeyboardAwareScrollView
//       style={{ flex: 1, backgroundColor: '#F8FAFC' }}
//       contentContainerStyle={{ paddingBottom: SPACING.xxl }}
//       showsVerticalScrollIndicator={false}
//     >
//       <View style={{ padding: SPACING.lg }}>
//         {/* Physical Condition */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Physical Condition</Text>
//           <View style={styles.checkboxGroup}>
//             {physicalOptions.map(opt => (
//               <CheckboxItem key={opt} label={opt} checked={formData.physicalConditions.includes(opt)} onToggle={() => togglePhysical(opt)} />
//             ))}
//           </View>
//         </View>

//         {/* Customer Information */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Customer Information</Text>
//           <Input label="Customer Name" value={formData.customerName} onChangeText={v => updateField('customerName', v)} required />
//           <Input label="Contact No" value={formData.contact} onChangeText={v => updateField('contact', v)} keyboardType="phone-pad" required />
//           <Input label="Alt Contact" value={formData.altContact} onChangeText={v => updateField('altContact', v)} />
//           <Input label="Customer Address" value={formData.address} onChangeText={v => updateField('address', v)} multiline />
//           <Input label="Email ID" value={formData.email} onChangeText={v => updateField('email', v)} keyboardType="email-address" />
//         </View>

//         {/* Device Details */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Device Details</Text>
//           <SelectModal label="Make" value={formData.makeId} options={makes} onSelect={v => updateField('makeId', v)} placeholder="Select Make" />
//           <SelectModal label="Model" value={formData.modelId} options={filteredModels} onSelect={v => updateField('modelId', v)} placeholder="Select Model" />
//           <Input label="IMEI" value={formData.imei} onChangeText={v => updateField('imei', v)} />
//           <SelectModal label="Warranty" value={formData.warranty} options={[{ id: 'No Warranty', name: 'No Warranty' }, { id: 'In Warranty', name: 'In Warranty' }]} onSelect={v => updateField('warranty', v)} />
//           <Input label="Pattern / PIN" value={formData.patternPin} onChangeText={v => updateField('patternPin', v)} />
//           <SelectModal label="ID Proof" value={formData.idProof} options={[{ id: 'Aadhaar Card', name: 'Aadhaar Card' }, { id: 'Passport', name: 'Passport' }, { id: 'Driving License', name: 'Driving License' }, { id: 'Election ID', name: 'Election ID' }, { id: 'ID Not Required', name: 'ID Not Required' }]} onSelect={v => updateField('idProof', v)} />
//         </View>

//         {/* Accessories Received */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Accessories Received</Text>
//           <View style={styles.checkboxGroup}>
//             {accessoryOptions.map(opt => (
//               <CheckboxItem key={opt} label={opt} checked={formData.accessoriesReceived.includes(opt)} onToggle={() => toggleAccessory(opt)} />
//             ))}
//           </View>
//           <Input label="Battery Number" value={formData.batteryNumber} onChangeText={v => updateField('batteryNumber', v)} />
//         </View>

//         {/* Service / Repair Details */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Service & Repair</Text>
//           <SelectModal label="Engineer" value={formData.engineerId} options={engineers} onSelect={v => updateField('engineerId', v)} />
//           <Input label="Dealer Name" value={formData.dealerName} onChangeText={v => updateField('dealerName', v)} />
//           <SelectModal label="Drawer" value={formData.drawerId} options={drawers} onSelect={v => updateField('drawerId', v)} />
          
//           <View style={styles.row}>
//             <View style={{ flex: 1, marginRight: SPACING.sm }}>
//               <Input label="Service Charges" value={formData.serviceCharges} onChangeText={v => updateField('serviceCharges', v)} keyboardType="numeric" />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Input label="Spare Charges" value={formData.spareCharges} onChangeText={v => updateField('spareCharges', v)} keyboardType="numeric" />
//             </View>
//           </View>

//           {/* Spare Parts */}
//           <View style={{ marginTop: SPACING.md }}>
//             <Text style={styles.subsectionTitle}>Spare Parts</Text>
//             {formData.spareItems.map((item, index) => (
//               <View key={item.id} style={styles.spareItemCard}>
//                 <View style={styles.spareItemRow}>
//                   <TextInput
//                     placeholder="Part name"
//                     value={item.name}
//                     onChangeText={v => updateSpareItem(index, 'name', v)}
//                     style={styles.spareInputName}
//                     placeholderTextColor={COLORS.gray400}
//                   />
//                   <TextInput
//                     placeholder="Qty"
//                     value={item.qty}
//                     onChangeText={v => updateSpareItem(index, 'qty', v)}
//                     keyboardType="numeric"
//                     style={styles.spareInputSmall}
//                     placeholderTextColor={COLORS.gray400}
//                   />
//                   <TextInput
//                     placeholder="Rate"
//                     value={item.rate}
//                     onChangeText={v => updateSpareItem(index, 'rate', v)}
//                     keyboardType="numeric"
//                     style={styles.spareInputSmall}
//                     placeholderTextColor={COLORS.gray400}
//                   />
//                   <TouchableOpacity onPress={() => removeSpareItem(index)} style={styles.removeButton}>
//                     <Trash2 size={18} color={COLORS.danger} />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             ))}
//             <TouchableOpacity onPress={addSpareItem} style={styles.addSpareButton}>
//               <Plus size={18} color={COLORS.primary} />
//               <Text style={styles.addSpareText}>Add Spare Part</Text>
//             </TouchableOpacity>
//           </View>

//           <Input label="Estimate Amount" value={formData.estimateAmount} onChangeText={v => updateField('estimateAmount', v)} keyboardType="numeric" />
//           <Button title="Calculate Estimate" onPress={calculateEstimate} variant="secondary" style={styles.calcButton} icon={Calculator} />

//           <Input label="Payment Mode" value={formData.paymentMode} onChangeText={v => updateField('paymentMode', v)} />

//           {/* Date Pickers */}
//           <TouchableOpacity onPress={() => setOpenRepairDate(true)} style={styles.dateButton}>
//             <Calendar size={20} color={COLORS.gray600} />
//             <Text style={styles.dateText}>Repair Date: {formData.repairDate.toLocaleDateString()}</Text>
//           </TouchableOpacity>
//           <DatePicker modal open={openRepairDate} date={formData.repairDate} onConfirm={date => { setOpenRepairDate(false); updateField('repairDate', date); }} onCancel={() => setOpenRepairDate(false)} />

//           <TouchableOpacity onPress={() => setOpenDeliveryDate(true)} style={styles.dateButton}>
//             <Calendar size={20} color={COLORS.gray600} />
//             <Text style={styles.dateText}>Delivery Date: {formData.deliveryDate.toLocaleDateString()}</Text>
//           </TouchableOpacity>
//           <DatePicker modal open={openDeliveryDate} date={formData.deliveryDate} onConfirm={date => { setOpenDeliveryDate(false); updateField('deliveryDate', date); }} onCancel={() => setOpenDeliveryDate(false)} />

//           <Input label="Remarks" value={formData.remarks} onChangeText={v => updateField('remarks', v)} multiline />
//         </View>

//         {/* REDESIGNED ACTION BUTTONS SECTION */}
//         <View style={styles.actionContainer}>
//           {/* Primary Save Button */}
//           <TouchableOpacity style={styles.saveButtonPrimary} onPress={handleSave} activeOpacity={0.8}>
//             <Save size={22} color={COLORS.white} />
//             <Text style={styles.saveButtonText}>Save Job Sheet</Text>
//           </TouchableOpacity>

//           {/* Secondary Actions Row */}
//           <View style={styles.secondaryActions}>
//             <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.replace('JobSheetForm', { mode, jobId })}>
//               <RefreshCw size={20} color={COLORS.gray700} />
//               <Text style={styles.secondaryButtonText}>Refresh</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.secondaryButton} onPress={calculateEstimate}>
//               <Calculator size={20} color={COLORS.gray700} />
//               <Text style={styles.secondaryButtonText}>Estimate</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.secondaryButton} onPress={() => Alert.alert('Invoice', 'Invoice generation would happen here')}>
//               <FileText size={20} color={COLORS.gray700} />
//               <Text style={styles.secondaryButtonText}>Invoice</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Home')}>
//               <Home size={20} color={COLORS.gray700} />
//               <Text style={styles.secondaryButtonText}>Home</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//       <LoadingOverlay visible={isLoading} />
//     </KeyboardAwareScrollView>
//   );
// }

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
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   spareItemCard: {
//     backgroundColor: COLORS.gray50,
//     borderRadius: BORDERS.radius.md,
//     padding: SPACING.sm,
//     marginBottom: SPACING.sm,
//   },
//   spareItemRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   spareInputName: {
//     flex: 3,
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//     borderRadius: BORDERS.radius.sm,
//     padding: SPACING.sm,
//     marginRight: SPACING.sm,
//     ...FONTS.regular,
//     fontSize: 14,
//     backgroundColor: COLORS.white,
//   },
//   spareInputSmall: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//     borderRadius: BORDERS.radius.sm,
//     padding: SPACING.sm,
//     marginRight: SPACING.sm,
//     ...FONTS.regular,
//     fontSize: 14,
//     backgroundColor: COLORS.white,
//     textAlign: 'center',
//   },
//   removeButton: {
//     padding: SPACING.sm,
//   },
//   addSpareButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//     borderColor: COLORS.primary,
//     borderRadius: BORDERS.radius.md,
//     paddingVertical: SPACING.sm,
//     marginTop: SPACING.xs,
//     backgroundColor: COLORS.primaryLight,
//   },
//   addSpareText: {
//     ...FONTS.medium,
//     fontSize: 14,
//     color: COLORS.primary,
//     marginLeft: SPACING.xs,
//   },
//   calcButton: {
//     marginBottom: SPACING.md,
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
//   },
//   dateText: {
//     ...FONTS.regular,
//     fontSize: 14,
//     color: COLORS.gray700,
//     marginLeft: SPACING.sm,
//   },
//   // New Action Buttons Styles
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
//     ...SHADOWS.medium,
//   },
//   saveButtonText: {
//     ...FONTS.bold,
//     fontSize: 16,
//     color: COLORS.white,
//     marginLeft: SPACING.sm,
//   },
//   secondaryActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: SPACING.sm,
//   },
//   secondaryButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.white,
//     paddingVertical: SPACING.sm,
//     borderRadius: BORDERS.radius.md,
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//     ...SHADOWS.small,
//   },
//   secondaryButtonText: {
//     ...FONTS.medium,
//     fontSize: 12,
//     color: COLORS.gray700,
//     marginLeft: SPACING.xs,
//   },
// });

//============================

// src/screens/jobsheet/JobSheetFormScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import { Trash2, Plus, Calendar, Calculator, Save, RefreshCw, Home, FileText, CreditCard } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { createJob, updateJob, fetchJobById, clearCurrentJob } from '../../store/slices/jobSlice';
import { fetchEngineers, fetchMakes, fetchModels, fetchFaults, fetchDrawers } from '../../store/slices/adminSlice';
import { Button, Input, SelectModal, CheckboxItem, SectionCard, LoadingOverlay } from '../../components/UI';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
import { useToast } from 'react-native-toast-notifications';

export default function JobSheetFormScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const toast = useToast();
  const { mode, jobId } = route.params || { mode: 'new' };
  
  const { currentJob, loading: jobLoading } = useSelector(state => state.jobs);
  const { engineers, makes, models, faults, drawers, loading: adminLoading } = useSelector(state => state.admin);
  const isLoading = jobLoading || adminLoading;

  const [formData, setFormData] = useState({
    customerName: '', contact: '', altContact: '', address: '', email: '',
    makeId: '', modelId: '', imei: '', warranty: 'No Warranty', patternPin: '', idProof: '',
    physicalConditions: [], accessoriesReceived: [], batteryNumber: '',
    engineerId: '', dealerName: '', drawerId: '',
    serviceCharges: '', spareCharges: '', estimateAmount: '', paymentMode: '',
    repairDate: new Date(), deliveryDate: new Date(), remarks: '', spareItems: [], status: 'Received',
  });

  const [openRepairDate, setOpenRepairDate] = useState(false);
  const [openDeliveryDate, setOpenDeliveryDate] = useState(false);

  const physicalOptions = ['Colour Faded', 'Antenna Broken', 'Deformed', 'Battery Damaged', 'LCD Broken / Bleeding', 'Tampered Set', 'Front Cover Scratches', 'Scratches On Body', 'Water Logged'];
  const accessoryOptions = ['Battery', 'Charger', 'Back Cover', 'Memory Card', 'SIM'];

  useEffect(() => {
    if (!engineers.length) dispatch(fetchEngineers());
    if (!makes.length) dispatch(fetchMakes());
    if (!models.length) dispatch(fetchModels());
    if (!faults.length) dispatch(fetchFaults());
    if (!drawers.length) dispatch(fetchDrawers());
    if (mode === 'edit' && jobId) dispatch(fetchJobById(jobId));
    return () => { if (mode === 'edit') dispatch(clearCurrentJob()); };
  }, []);

  useEffect(() => {
    if (mode === 'edit' && currentJob) {
      setFormData({
        ...currentJob,
        repairDate: currentJob.repairDate ? new Date(currentJob.repairDate) : new Date(),
        deliveryDate: currentJob.deliveredDate ? new Date(currentJob.deliveredDate) : new Date(),
        spareItems: currentJob.spareItems || [],
      });
    }
  }, [currentJob]);

  const updateField = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const togglePhysical = (item) => {
    setFormData(prev => ({
      ...prev,
      physicalConditions: prev.physicalConditions.includes(item)
        ? prev.physicalConditions.filter(i => i !== item)
        : [...prev.physicalConditions, item]
    }));
  };

  const toggleAccessory = (item) => {
    setFormData(prev => ({
      ...prev,
      accessoriesReceived: prev.accessoriesReceived.includes(item)
        ? prev.accessoriesReceived.filter(i => i !== item)
        : [...prev.accessoriesReceived, item]
    }));
  };

  const addSpareItem = () => {
    setFormData(prev => ({
      ...prev,
      spareItems: [...prev.spareItems, { id: Date.now().toString(), name: '', qty: '1', rate: '' }],
    }));
  };

  const updateSpareItem = (index, field, value) => {
    const newItems = [...formData.spareItems];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, spareItems: newItems }));
  };

  const removeSpareItem = (index) => {
    setFormData(prev => ({ ...prev, spareItems: prev.spareItems.filter((_, i) => i !== index) }));
  };

  const calculateEstimate = () => {
    const service = parseFloat(formData.serviceCharges) || 0;
    const spare = parseFloat(formData.spareCharges) || 0;
    const spareItemsTotal = formData.spareItems.reduce((sum, item) => sum + ((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)), 0);
    const total = service + spare + spareItemsTotal;
    updateField('estimateAmount', total.toString());
    toast.show('Estimate calculated', { type: 'info' });
  };

  // Handle Estimate Navigation
  const handleEstimate = () => {
    if (mode === 'edit' && jobId) {
      // For existing job, navigate to Estimate screen with job ID
      navigation.navigate('JobSheet', {
        screen: 'EstimateBill',
        params: { id: jobId },
      });
    } else if (mode === 'new' && formData.customerName) {
      // For new job, save first then show estimate
      Alert.alert(
        'Save First',
        'Please save the job sheet before generating estimate.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save & Continue', onPress: handleSaveAndContinue }
        ]
      );
    } else {
      toast.show('Please fill customer name and save the job first', { type: 'info' });
    }
  };

  // Handle Invoice Navigation
  const handleInvoice = () => {
    if (mode === 'edit' && jobId) {
      // For existing job, navigate to Invoice screen with job ID
      navigation.navigate('JobSheet', {
        screen: 'InvoiceBill',
        params: { id: jobId },
      });
    } else if (mode === 'new' && formData.customerName) {
      // For new job, save first then show invoice
      Alert.alert(
        'Save First',
        'Please save the job sheet before generating invoice.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save & Continue', onPress: handleSaveAndContinue }
        ]
      );
    } else {
      toast.show('Please fill customer name and save the job first', { type: 'info' });
    }
  };

  // Save and then navigate to Estimate/Invoice
  const handleSaveAndContinue = async (targetScreen) => {
    if (!formData.customerName || !formData.contact) {
      toast.show('Customer Name and Contact are required', { type: 'danger' });
      return;
    }
    
    const submitData = {
      ...formData,
      serviceCharges: parseFloat(formData.serviceCharges) || 0,
      spareCharges: parseFloat(formData.spareCharges) || 0,
      estimateAmount: parseFloat(formData.estimateAmount) || 0,
    };
    
    try {
      let result;
      if (mode === 'edit') {
        result = await dispatch(updateJob({ id: jobId, data: submitData })).unwrap();
      } else {
        result = await dispatch(createJob(submitData)).unwrap();
      }
      toast.show('Job saved successfully', { type: 'success' });
      
      // Navigate to Estimate or Invoice after save
      if (targetScreen === 'estimate') {
        navigation.navigate('JobSheet', {
          screen: 'EstimateBill',
          params: { id: result.id || result._id },
        });
      } else if (targetScreen === 'invoice') {
        navigation.navigate('JobSheet', {
          screen: 'InvoiceBill',
          params: { id: result.id || result._id },
        });
      }
    } catch (error) {
      toast.show('Failed to save job', { type: 'danger' });
    }
  };

  const handleSave = async () => {
    if (!formData.customerName || !formData.contact) {
      toast.show('Customer Name and Contact are required', { type: 'danger' });
      return;
    }
    const submitData = {
      ...formData,
      serviceCharges: parseFloat(formData.serviceCharges) || 0,
      spareCharges: parseFloat(formData.spareCharges) || 0,
      estimateAmount: parseFloat(formData.estimateAmount) || 0,
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
      toast.show('Failed to save job', { type: 'danger' });
    }
  };

  const filteredModels = useMemo(() => models.filter(m => m.makeId === formData.makeId), [models, formData.makeId]);

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: '#F8FAFC' }}
      contentContainerStyle={{ paddingBottom: SPACING.xxl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ padding: SPACING.lg }}>
        {/* Physical Condition */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Physical Condition</Text>
          <View style={styles.checkboxGroup}>
            {physicalOptions.map(opt => (
              <CheckboxItem key={opt} label={opt} checked={formData.physicalConditions.includes(opt)} onToggle={() => togglePhysical(opt)} />
            ))}
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <Input label="Customer Name" value={formData.customerName} onChangeText={v => updateField('customerName', v)} required />
          <Input label="Contact No" value={formData.contact} onChangeText={v => updateField('contact', v)} keyboardType="phone-pad" required />
          <Input label="Alt Contact" value={formData.altContact} onChangeText={v => updateField('altContact', v)} />
          <Input label="Customer Address" value={formData.address} onChangeText={v => updateField('address', v)} multiline />
          <Input label="Email ID" value={formData.email} onChangeText={v => updateField('email', v)} keyboardType="email-address" />
        </View>

        {/* Device Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Details</Text>
          <SelectModal label="Make" value={formData.makeId} options={makes} onSelect={v => updateField('makeId', v)} placeholder="Select Make" />
          <SelectModal label="Model" value={formData.modelId} options={filteredModels} onSelect={v => updateField('modelId', v)} placeholder="Select Model" />
          <Input label="IMEI" value={formData.imei} onChangeText={v => updateField('imei', v)} />
          <SelectModal label="Warranty" value={formData.warranty} options={[{ id: 'No Warranty', name: 'No Warranty' }, { id: 'In Warranty', name: 'In Warranty' }]} onSelect={v => updateField('warranty', v)} />
          <Input label="Pattern / PIN" value={formData.patternPin} onChangeText={v => updateField('patternPin', v)} />
          <SelectModal label="ID Proof" value={formData.idProof} options={[{ id: 'Aadhaar Card', name: 'Aadhaar Card' }, { id: 'Passport', name: 'Passport' }, { id: 'Driving License', name: 'Driving License' }, { id: 'Election ID', name: 'Election ID' }, { id: 'ID Not Required', name: 'ID Not Required' }]} onSelect={v => updateField('idProof', v)} />
        </View>

        {/* Accessories Received */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessories Received</Text>
          <View style={styles.checkboxGroup}>
            {accessoryOptions.map(opt => (
              <CheckboxItem key={opt} label={opt} checked={formData.accessoriesReceived.includes(opt)} onToggle={() => toggleAccessory(opt)} />
            ))}
          </View>
          <Input label="Battery Number" value={formData.batteryNumber} onChangeText={v => updateField('batteryNumber', v)} />
        </View>

        {/* Service / Repair Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service & Repair</Text>
          <SelectModal label="Engineer" value={formData.engineerId} options={engineers} onSelect={v => updateField('engineerId', v)} />
          <Input label="Dealer Name" value={formData.dealerName} onChangeText={v => updateField('dealerName', v)} />
          <SelectModal label="Drawer" value={formData.drawerId} options={drawers} onSelect={v => updateField('drawerId', v)} />
          
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: SPACING.sm }}>
              <Input label="Service Charges" value={formData.serviceCharges} onChangeText={v => updateField('serviceCharges', v)} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Spare Charges" value={formData.spareCharges} onChangeText={v => updateField('spareCharges', v)} keyboardType="numeric" />
            </View>
          </View>

          {/* Spare Parts */}
          <View style={{ marginTop: SPACING.md }}>
            <Text style={styles.subsectionTitle}>Spare Parts</Text>
            {formData.spareItems.map((item, index) => (
              <View key={item.id} style={styles.spareItemCard}>
                <View style={styles.spareItemRow}>
                  <TextInput
                    placeholder="Part name"
                    value={item.name}
                    onChangeText={v => updateSpareItem(index, 'name', v)}
                    style={styles.spareInputName}
                    placeholderTextColor={COLORS.gray400}
                  />
                  <TextInput
                    placeholder="Qty"
                    value={item.qty}
                    onChangeText={v => updateSpareItem(index, 'qty', v)}
                    keyboardType="numeric"
                    style={styles.spareInputSmall}
                    placeholderTextColor={COLORS.gray400}
                  />
                  <TextInput
                    placeholder="Rate"
                    value={item.rate}
                    onChangeText={v => updateSpareItem(index, 'rate', v)}
                    keyboardType="numeric"
                    style={styles.spareInputSmall}
                    placeholderTextColor={COLORS.gray400}
                  />
                  <TouchableOpacity onPress={() => removeSpareItem(index)} style={styles.removeButton}>
                    <Trash2 size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={addSpareItem} style={styles.addSpareButton}>
              <Plus size={18} color={COLORS.primary} />
              <Text style={styles.addSpareText}>Add Spare Part</Text>
            </TouchableOpacity>
          </View>

          <Input label="Estimate Amount" value={formData.estimateAmount} onChangeText={v => updateField('estimateAmount', v)} keyboardType="numeric" />
          <Button title="Calculate Estimate" onPress={calculateEstimate} variant="secondary" style={styles.calcButton} icon={Calculator} />

          <Input label="Payment Mode" value={formData.paymentMode} onChangeText={v => updateField('paymentMode', v)} />

          {/* Date Pickers */}
          <TouchableOpacity onPress={() => setOpenRepairDate(true)} style={styles.dateButton}>
            <Calendar size={20} color={COLORS.gray600} />
            <Text style={styles.dateText}>Repair Date: {formData.repairDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          <DatePicker modal open={openRepairDate} date={formData.repairDate} onConfirm={date => { setOpenRepairDate(false); updateField('repairDate', date); }} onCancel={() => setOpenRepairDate(false)} />

          <TouchableOpacity onPress={() => setOpenDeliveryDate(true)} style={styles.dateButton}>
            <Calendar size={20} color={COLORS.gray600} />
            <Text style={styles.dateText}>Delivery Date: {formData.deliveryDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          <DatePicker modal open={openDeliveryDate} date={formData.deliveryDate} onConfirm={date => { setOpenDeliveryDate(false); updateField('deliveryDate', date); }} onCancel={() => setOpenDeliveryDate(false)} />

          <Input label="Remarks" value={formData.remarks} onChangeText={v => updateField('remarks', v)} multiline />
        </View>

        {/* ACTION BUTTONS SECTION */}
        <View style={styles.actionContainer}>
          {/* Primary Save Button */}
          <TouchableOpacity style={styles.saveButtonPrimary} onPress={handleSave} activeOpacity={0.8}>
            <Save size={22} color={COLORS.white} />
            <Text style={styles.saveButtonText}>Save Job Sheet</Text>
          </TouchableOpacity>

          {/* Secondary Actions Row */}
          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.replace('JobSheetForm', { mode, jobId })}>
              <RefreshCw size={20} color={COLORS.gray700} />
              <Text style={styles.secondaryButtonText}>Refresh</Text>
            </TouchableOpacity>

            {/* Estimate Button - Navigates to EstimateBill Screen */}
            <TouchableOpacity style={styles.secondaryButton} onPress={handleEstimate}>
              <Calculator size={20} color={COLORS.gray700} />
              <Text style={styles.secondaryButtonText}>Estimate</Text>
            </TouchableOpacity>

            {/* Invoice Button - Navigates to InvoiceBill Screen */}
            <TouchableOpacity style={styles.secondaryButton} onPress={handleInvoice}>
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