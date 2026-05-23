// // src/screens/jobsheet/JobSheetFormScreen.js
// import React, { useState, useEffect } from 'react';
// import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import DatePicker from 'react-native-date-picker';
// import { Trash2, Plus } from 'lucide-react-native';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// import { createJob, updateJob, fetchJobById, clearCurrentJob } from '../../store/slices/jobSlice';
// import { fetchEngineers, fetchMakes, fetchModels, fetchFaults, fetchDrawers } from '../../store/slices/adminSlice';
// import { Button, Input, SelectModal, CheckboxItem, SectionCard, LoadingOverlay } from '../../components/UI';
// import { COLORS, SPACING, FONTS } from '../../utils/theme';
// import { useToast } from 'react-native-toast-notifications';

// export default function JobSheetFormScreen() {
//   const dispatch = useDispatch();
//   const navigation = useNavigation();
//   const route = useRoute();
//   const toast = useToast();
//   const { mode, jobId } = route.params || { mode: 'new' };
  
//   const { currentJob, loading } = useSelector(state => state.jobs);
//   const { engineers, makes, models, faults, drawers } = useSelector(state => state.admin);

//   const [formData, setFormData] = useState({
//     customerName: '',
//     contact: '',
//     altContact: '',
//     address: '',
//     email: '',
//     makeId: '',
//     modelId: '',
//     imei: '',
//     warranty: 'No Warranty',
//     patternPin: '',
//     idProof: '',
//     physicalConditions: [],
//     accessoriesReceived: [],
//     batteryNumber: '',
//     engineerId: '',
//     dealerName: '',
//     drawerId: '',
//     serviceCharges: '',
//     spareCharges: '',
//     estimateAmount: '',
//     paymentMode: '',
//     repairDate: new Date(),
//     deliveryDate: new Date(),
//     remarks: '',
//     spareItems: [],
//     status: 'Received',
//   });

//   const [openRepairDate, setOpenRepairDate] = useState(false);
//   const [openDeliveryDate, setOpenDeliveryDate] = useState(false);

//   const physicalOptions = ['Colour Faded', 'Antenna Broken', 'Deformed', 'Battery Damaged', 'LCD Broken / Bleeding', 'Tampered Set', 'Front Cover Scratches', 'Scratches On Body', 'Water Logged'];
//   const accessoryOptions = ['Battery', 'Charger', 'Back Cover', 'Memory Card', 'SIM'];

//   useEffect(() => {
//     dispatch(fetchEngineers());
//     dispatch(fetchMakes());
//     dispatch(fetchModels());
//     dispatch(fetchFaults());
//     dispatch(fetchDrawers());
//     if (mode === 'edit' && jobId) {
//       dispatch(fetchJobById(jobId));
//     }
//     return () => {
//       if (mode === 'edit') dispatch(clearCurrentJob());
//     };
//   }, []);

//   useEffect(() => {
//     if (mode === 'edit' && currentJob) {
//       setFormData({
//         ...currentJob,
//         repairDate: currentJob.repairDate ? new Date(currentJob.repairDate) : new Date(),
//         deliveryDate: currentJob.deliveryDate ? new Date(currentJob.deliveryDate) : new Date(),
//         spareItems: currentJob.spareItems || [],
//       });
//     }
//   }, [currentJob]);

//   const updateField = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

//   const togglePhysical = (item) => {
//     const exists = formData.physicalConditions.includes(item);
//     if (exists) setFormData(prev => ({ ...prev, physicalConditions: prev.physicalConditions.filter(i => i !== item) }));
//     else setFormData(prev => ({ ...prev, physicalConditions: [...prev.physicalConditions, item] }));
//   };

//   const toggleAccessory = (item) => {
//     const exists = formData.accessoriesReceived.includes(item);
//     if (exists) setFormData(prev => ({ ...prev, accessoriesReceived: prev.accessoriesReceived.filter(i => i !== item) }));
//     else setFormData(prev => ({ ...prev, accessoriesReceived: [...prev.accessoriesReceived, item] }));
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
//     const newItems = formData.spareItems.filter((_, i) => i !== index);
//     setFormData(prev => ({ ...prev, spareItems: newItems }));
//   };

//   const calculateEstimate = () => {
//     const service = parseFloat(formData.serviceCharges) || 0;
//     const spare = parseFloat(formData.spareCharges) || 0;
//     const spareItemsTotal = formData.spareItems.reduce((sum, item) => sum + ((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)), 0);
//     const total = service + spare + spareItemsTotal;
//     setFormData(prev => ({ ...prev, estimateAmount: total.toString() }));
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
//       repairDate: formData.repairDate.toISOString().split('T')[0],
//       deliveryDate: formData.deliveryDate.toISOString().split('T')[0],
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

//   const filteredModels = models.filter(m => m.makeId === formData.makeId);

//   return (
//     <KeyboardAwareScrollView style={{ flex: 1, backgroundColor: COLORS.lightGray }} contentContainerStyle={{ padding: SPACING.lg }}>
//       <SectionCard title="Physical Condition">
//         <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
//           {physicalOptions.map(opt => (
//             <CheckboxItem key={opt} label={opt} checked={formData.physicalConditions.includes(opt)} onToggle={() => togglePhysical(opt)} />
//           ))}
//         </View>
//       </SectionCard>

//       <SectionCard title="Customer Information">
//         <Input label="Customer Name" value={formData.customerName} onChangeText={v => updateField('customerName', v)} required />
//         <Input label="Contact No" value={formData.contact} onChangeText={v => updateField('contact', v)} keyboardType="phone-pad" required />
//         <Input label="Alt Contact" value={formData.altContact} onChangeText={v => updateField('altContact', v)} />
//         <Input label="Customer Address" value={formData.address} onChangeText={v => updateField('address', v)} multiline />
//         <Input label="Email ID" value={formData.email} onChangeText={v => updateField('email', v)} keyboardType="email-address" />
//       </SectionCard>

//       <SectionCard title="Device Details">
//         <SelectModal label="Make" value={formData.makeId} options={makes} onSelect={v => updateField('makeId', v)} placeholder="Search Make..." />
//         <SelectModal label="Model" value={formData.modelId} options={filteredModels} onSelect={v => updateField('modelId', v)} placeholder="Search Model..." />
//         <Input label="IMEI" value={formData.imei} onChangeText={v => updateField('imei', v)} />
//         <SelectModal label="Warranty" value={formData.warranty} options={[{ id: 'No Warranty', name: 'No Warranty' }, { id: 'In Warranty', name: 'In Warranty' }]} onSelect={v => updateField('warranty', v)} />
//         <Input label="Pattern / PIN" value={formData.patternPin} onChangeText={v => updateField('patternPin', v)} />
//         <SelectModal label="ID Proof" value={formData.idProof} options={[{ id: 'Aadhaar Card', name: 'Aadhaar Card' }, { id: 'Passport', name: 'Passport' }, { id: 'Driving License', name: 'Driving License' }, { id: 'Election ID', name: 'Election ID' }, { id: 'ID Not Required', name: 'ID Not Required' }]} onSelect={v => updateField('idProof', v)} />
//       </SectionCard>

//       <SectionCard title="Accessories Received">
//         <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
//           {accessoryOptions.map(opt => (
//             <CheckboxItem key={opt} label={opt} checked={formData.accessoriesReceived.includes(opt)} onToggle={() => toggleAccessory(opt)} />
//           ))}
//         </View>
//         <Input label="Battery Number" value={formData.batteryNumber} onChangeText={v => updateField('batteryNumber', v)} />
//       </SectionCard>

//       <SectionCard title="Service / Repair Details">
//         <SelectModal label="Select Engineer" value={formData.engineerId} options={engineers} onSelect={v => updateField('engineerId', v)} />
//         <Input label="Dealer Name" value={formData.dealerName} onChangeText={v => updateField('dealerName', v)} />
//         <SelectModal label="Select Drawer" value={formData.drawerId} options={drawers} onSelect={v => updateField('drawerId', v)} />
//         <Input label="Service Charges" value={formData.serviceCharges} onChangeText={v => updateField('serviceCharges', v)} keyboardType="numeric" />
//         <Input label="Spare Charges" value={formData.spareCharges} onChangeText={v => updateField('spareCharges', v)} keyboardType="numeric" />
        
//         <View style={{ marginTop: SPACING.md }}>
//           <Text style={[FONTS.semibold, { marginBottom: SPACING.sm }]}>Spare Parts</Text>
//           {formData.spareItems.map((item, index) => (
//             <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
//               <TextInput placeholder="Spare Name" value={item.name} onChangeText={v => updateSpareItem(index, 'name', v)} style={{ flex: 2, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.sm, marginRight: SPACING.sm }} />
//               <TextInput placeholder="Qty" value={item.qty} onChangeText={v => updateSpareItem(index, 'qty', v)} keyboardType="numeric" style={{ flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.sm, marginRight: SPACING.sm }} />
//               <TextInput placeholder="Rate" value={item.rate} onChangeText={v => updateSpareItem(index, 'rate', v)} keyboardType="numeric" style={{ flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.sm, marginRight: SPACING.sm }} />
//               <TouchableOpacity onPress={() => removeSpareItem(index)}><Trash2 size={20} color={COLORS.danger} /></TouchableOpacity>
//             </View>
//           ))}
//           <Button title="Add Spare" onPress={addSpareItem} variant="secondary" style={{ marginTop: SPACING.sm }} />
//         </View>

//         <Input label="Estimate Amount" value={formData.estimateAmount} onChangeText={v => updateField('estimateAmount', v)} keyboardType="numeric" />
//         <Button title="Calculate Estimate" onPress={calculateEstimate} variant="secondary" style={{ marginBottom: SPACING.md }} />
        
//         <Input label="Payment Mode" value={formData.paymentMode} onChangeText={v => updateField('paymentMode', v)} />
        
//         <TouchableOpacity onPress={() => setOpenRepairDate(true)} style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.md, marginBottom: SPACING.md }}>
//           <Text>Repair Date: {formData.repairDate.toLocaleDateString()}</Text>
//         </TouchableOpacity>
//         <DatePicker modal open={openRepairDate} date={formData.repairDate} onConfirm={date => { setOpenRepairDate(false); updateField('repairDate', date); }} onCancel={() => setOpenRepairDate(false)} />
        
//         <TouchableOpacity onPress={() => setOpenDeliveryDate(true)} style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.md }}>
//           <Text>Delivery Date: {formData.deliveryDate.toLocaleDateString()}</Text>
//         </TouchableOpacity>
//         <DatePicker modal open={openDeliveryDate} date={formData.deliveryDate} onConfirm={date => { setOpenDeliveryDate(false); updateField('deliveryDate', date); }} onCancel={() => setOpenDeliveryDate(false)} />
        
//         <Input label="Remarks" value={formData.remarks} onChangeText={v => updateField('remarks', v)} multiline />
//       </SectionCard>

//       <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.lg, marginBottom: SPACING.xxl }}>
//         <Button title="Save" onPress={handleSave} style={{ flex: 1, marginRight: SPACING.sm }} />
//         <Button title="Refresh" onPress={() => navigation.replace('JobSheetForm', { mode, jobId })} variant="secondary" style={{ flex: 1, marginHorizontal: SPACING.sm }} />
//         <Button title="Estimate" onPress={calculateEstimate} variant="secondary" style={{ flex: 1, marginHorizontal: SPACING.sm }} />
//         <Button title="Invoice" onPress={() => Alert.alert('Invoice', 'Invoice generation would happen here')} variant="secondary" style={{ flex: 1, marginHorizontal: SPACING.sm }} />
//         <Button title="Home" onPress={() => navigation.navigate('Home')} variant="secondary" style={{ flex: 1, marginLeft: SPACING.sm }} />
//       </View>
//       <LoadingOverlay visible={loading} />
//     </KeyboardAwareScrollView>
//   );
// }

//===================

// src/screens/jobsheet/JobSheetFormScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import { Trash2, Plus } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { createJob, updateJob, fetchJobById, clearCurrentJob } from '../../store/slices/jobSlice';
import { fetchEngineers, fetchMakes, fetchModels, fetchFaults, fetchDrawers } from '../../store/slices/adminSlice';
import { Button, Input, SelectModal, CheckboxItem, SectionCard, LoadingOverlay } from '../../components/UI';
import { COLORS, SPACING, FONTS } from '../../utils/theme';
import { useToast } from 'react-native-toast-notifications';

export default function JobSheetFormScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const toast = useToast();
  const { mode, jobId } = route.params || { mode: 'new' };
  
  const { currentJob, loading } = useSelector(state => state.jobs);
  const { engineers, makes, models, faults, drawers } = useSelector(state => state.admin);

  const [formData, setFormData] = useState({
    customerName: '',
    contact: '',
    altContact: '',
    address: '',
    email: '',
    makeId: '',
    modelId: '',
    imei: '',
    warranty: 'No Warranty',
    patternPin: '',
    idProof: '',
    physicalConditions: [],
    accessoriesReceived: [],
    batteryNumber: '',
    engineerId: '',
    dealerName: '',
    drawerId: '',
    serviceCharges: '',
    spareCharges: '',
    estimateAmount: '',
    paymentMode: '',
    repairDate: new Date(),      // Date object for picker
    deliveryDate: new Date(),    // Date object for picker
    remarks: '',
    spareItems: [],
    status: 'Received',
  });

  const [openRepairDate, setOpenRepairDate] = useState(false);
  const [openDeliveryDate, setOpenDeliveryDate] = useState(false);

  const physicalOptions = ['Colour Faded', 'Antenna Broken', 'Deformed', 'Battery Damaged', 'LCD Broken / Bleeding', 'Tampered Set', 'Front Cover Scratches', 'Scratches On Body', 'Water Logged'];
  const accessoryOptions = ['Battery', 'Charger', 'Back Cover', 'Memory Card', 'SIM'];

  useEffect(() => {
    dispatch(fetchEngineers());
    dispatch(fetchMakes());
    dispatch(fetchModels());
    dispatch(fetchFaults());
    dispatch(fetchDrawers());
    if (mode === 'edit' && jobId) {
      dispatch(fetchJobById(jobId));
    }
    return () => {
      if (mode === 'edit') dispatch(clearCurrentJob());
    };
  }, []);

  // ✅ FIX: Convert date strings from Redux to Date objects for pickers
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
    const exists = formData.physicalConditions.includes(item);
    if (exists) setFormData(prev => ({ ...prev, physicalConditions: prev.physicalConditions.filter(i => i !== item) }));
    else setFormData(prev => ({ ...prev, physicalConditions: [...prev.physicalConditions, item] }));
  };

  const toggleAccessory = (item) => {
    const exists = formData.accessoriesReceived.includes(item);
    if (exists) setFormData(prev => ({ ...prev, accessoriesReceived: prev.accessoriesReceived.filter(i => i !== item) }));
    else setFormData(prev => ({ ...prev, accessoriesReceived: [...prev.accessoriesReceived, item] }));
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
    const newItems = formData.spareItems.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, spareItems: newItems }));
  };

  const calculateEstimate = () => {
    const service = parseFloat(formData.serviceCharges) || 0;
    const spare = parseFloat(formData.spareCharges) || 0;
    const spareItemsTotal = formData.spareItems.reduce((sum, item) => sum + ((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)), 0);
    const total = service + spare + spareItemsTotal;
    setFormData(prev => ({ ...prev, estimateAmount: total.toString() }));
    toast.show('Estimate calculated', { type: 'info' });
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
      // repairDate and deliveryDate are Date objects – they will be stringified automatically
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

  const filteredModels = models.filter(m => m.makeId === formData.makeId);

  return (
    <KeyboardAwareScrollView style={{ flex: 1, backgroundColor: COLORS.lightGray }} contentContainerStyle={{ padding: SPACING.lg }}>
      <SectionCard title="Physical Condition">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {physicalOptions.map(opt => (
            <CheckboxItem key={opt} label={opt} checked={formData.physicalConditions.includes(opt)} onToggle={() => togglePhysical(opt)} />
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Customer Information">
        <Input label="Customer Name" value={formData.customerName} onChangeText={v => updateField('customerName', v)} required />
        <Input label="Contact No" value={formData.contact} onChangeText={v => updateField('contact', v)} keyboardType="phone-pad" required />
        <Input label="Alt Contact" value={formData.altContact} onChangeText={v => updateField('altContact', v)} />
        <Input label="Customer Address" value={formData.address} onChangeText={v => updateField('address', v)} multiline />
        <Input label="Email ID" value={formData.email} onChangeText={v => updateField('email', v)} keyboardType="email-address" />
      </SectionCard>

      <SectionCard title="Device Details">
        <SelectModal label="Make" value={formData.makeId} options={makes} onSelect={v => updateField('makeId', v)} placeholder="Search Make..." />
        <SelectModal label="Model" value={formData.modelId} options={filteredModels} onSelect={v => updateField('modelId', v)} placeholder="Search Model..." />
        <Input label="IMEI" value={formData.imei} onChangeText={v => updateField('imei', v)} />
        <SelectModal label="Warranty" value={formData.warranty} options={[{ id: 'No Warranty', name: 'No Warranty' }, { id: 'In Warranty', name: 'In Warranty' }]} onSelect={v => updateField('warranty', v)} />
        <Input label="Pattern / PIN" value={formData.patternPin} onChangeText={v => updateField('patternPin', v)} />
        <SelectModal label="ID Proof" value={formData.idProof} options={[{ id: 'Aadhaar Card', name: 'Aadhaar Card' }, { id: 'Passport', name: 'Passport' }, { id: 'Driving License', name: 'Driving License' }, { id: 'Election ID', name: 'Election ID' }, { id: 'ID Not Required', name: 'ID Not Required' }]} onSelect={v => updateField('idProof', v)} />
      </SectionCard>

      <SectionCard title="Accessories Received">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {accessoryOptions.map(opt => (
            <CheckboxItem key={opt} label={opt} checked={formData.accessoriesReceived.includes(opt)} onToggle={() => toggleAccessory(opt)} />
          ))}
        </View>
        <Input label="Battery Number" value={formData.batteryNumber} onChangeText={v => updateField('batteryNumber', v)} />
      </SectionCard>

      <SectionCard title="Service / Repair Details">
        <SelectModal label="Select Engineer" value={formData.engineerId} options={engineers} onSelect={v => updateField('engineerId', v)} />
        <Input label="Dealer Name" value={formData.dealerName} onChangeText={v => updateField('dealerName', v)} />
        <SelectModal label="Select Drawer" value={formData.drawerId} options={drawers} onSelect={v => updateField('drawerId', v)} />
        <Input label="Service Charges" value={formData.serviceCharges} onChangeText={v => updateField('serviceCharges', v)} keyboardType="numeric" />
        <Input label="Spare Charges" value={formData.spareCharges} onChangeText={v => updateField('spareCharges', v)} keyboardType="numeric" />
        
        <View style={{ marginTop: SPACING.md }}>
          <Text style={[FONTS.semibold, { marginBottom: SPACING.sm }]}>Spare Parts</Text>
          {formData.spareItems.map((item, index) => (
            <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <TextInput placeholder="Spare Name" value={item.name} onChangeText={v => updateSpareItem(index, 'name', v)} style={{ flex: 2, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.sm, marginRight: SPACING.sm }} />
              <TextInput placeholder="Qty" value={item.qty} onChangeText={v => updateSpareItem(index, 'qty', v)} keyboardType="numeric" style={{ flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.sm, marginRight: SPACING.sm }} />
              <TextInput placeholder="Rate" value={item.rate} onChangeText={v => updateSpareItem(index, 'rate', v)} keyboardType="numeric" style={{ flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.sm, marginRight: SPACING.sm }} />
              <TouchableOpacity onPress={() => removeSpareItem(index)}><Trash2 size={20} color={COLORS.danger} /></TouchableOpacity>
            </View>
          ))}
          <Button title="Add Spare" onPress={addSpareItem} variant="secondary" style={{ marginTop: SPACING.sm }} />
        </View>

        <Input label="Estimate Amount" value={formData.estimateAmount} onChangeText={v => updateField('estimateAmount', v)} keyboardType="numeric" />
        <Button title="Calculate Estimate" onPress={calculateEstimate} variant="secondary" style={{ marginBottom: SPACING.md }} />
        
        <Input label="Payment Mode" value={formData.paymentMode} onChangeText={v => updateField('paymentMode', v)} />
        
        <TouchableOpacity onPress={() => setOpenRepairDate(true)} style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.md, marginBottom: SPACING.md }}>
          <Text>Repair Date: {formData.repairDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <DatePicker modal open={openRepairDate} date={formData.repairDate} onConfirm={date => { setOpenRepairDate(false); updateField('repairDate', date); }} onCancel={() => setOpenRepairDate(false)} />
        
        <TouchableOpacity onPress={() => setOpenDeliveryDate(true)} style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.md }}>
          <Text>Delivery Date: {formData.deliveryDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <DatePicker modal open={openDeliveryDate} date={formData.deliveryDate} onConfirm={date => { setOpenDeliveryDate(false); updateField('deliveryDate', date); }} onCancel={() => setOpenDeliveryDate(false)} />
        
        <Input label="Remarks" value={formData.remarks} onChangeText={v => updateField('remarks', v)} multiline />
      </SectionCard>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.lg, marginBottom: SPACING.xxl }}>
        <Button title="Save" onPress={handleSave} style={{ flex: 1, marginRight: SPACING.sm }} />
        <Button title="Refresh" onPress={() => navigation.replace('JobSheetForm', { mode, jobId })} variant="secondary" style={{ flex: 1, marginHorizontal: SPACING.sm }} />
        <Button title="Estimate" onPress={calculateEstimate} variant="secondary" style={{ flex: 1, marginHorizontal: SPACING.sm }} />
        <Button title="Invoice" onPress={() => Alert.alert('Invoice', 'Invoice generation would happen here')} variant="secondary" style={{ flex: 1, marginHorizontal: SPACING.sm }} />
        <Button title="Home" onPress={() => navigation.navigate('Home')} variant="secondary" style={{ flex: 1, marginLeft: SPACING.sm }} />
      </View>
      <LoadingOverlay visible={loading} />
    </KeyboardAwareScrollView>
  );
}