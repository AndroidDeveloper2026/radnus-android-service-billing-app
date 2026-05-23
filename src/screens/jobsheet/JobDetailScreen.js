// // src/screens/jobsheet/JobDetailScreen.js
// import React, { useEffect } from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { Phone, Mail, FileText, Receipt, Edit } from 'lucide-react-native';
// import { fetchJobById } from '../../store/slices/jobSlice';
// import { InfoRow, StatusChip, LoadingOverlay, Button } from '../../components/UI';
// import { COLORS, SPACING } from '../../utils/theme';
// import { useToast } from 'react-native-toast-notifications';

// export default function JobDetailScreen() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const dispatch = useDispatch();
//   const toast = useToast();
//   const { jobId } = route.params;
//   const { currentJob, loading } = useSelector(state => state.jobs);

//   useEffect(() => {
//     if (jobId) dispatch(fetchJobById(jobId));
//   }, [jobId]);

//   if (!currentJob && !loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Job not found</Text></View>;

//   const handleCall = () => {
//     if (currentJob?.contact) Linking.openURL(`tel:${currentJob.contact}`);
//     else toast.show('No contact number', { type: 'danger' });
//   };

//   const handleEmail = () => {
//     if (currentJob?.email) Linking.openURL(`mailto:${currentJob.email}`);
//     else toast.show('No email address', { type: 'danger' });
//   };

//   const handlePDF = () => {
//     Alert.alert('PDF', 'PDF generation would happen here');
//   };

//   const handleInvoice = () => {
//     Alert.alert('Invoice', 'Invoice generation would happen here');
//   };

//   return (
//     <ScrollView style={{ flex: 1, backgroundColor: COLORS.lightGray, padding: SPACING.lg }}>
//       <View style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: SPACING.lg, marginBottom: SPACING.lg }}>
//         <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
//           <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.primary }}>{currentJob?.jobNo}</Text>
//           <StatusChip status={currentJob?.status} />
//         </View>
//         <InfoRow label="Customer" value={currentJob?.customerName} />
//         <InfoRow label="Contact" value={currentJob?.contact} />
//         <InfoRow label="Alt Contact" value={currentJob?.altContact} />
//         <InfoRow label="Address" value={currentJob?.address} />
//         <InfoRow label="Email" value={currentJob?.email} />
//         <InfoRow label="Make / Model" value={`${currentJob?.makeId || '-'} / ${currentJob?.modelId || '-'}`} />
//         <InfoRow label="IMEI" value={currentJob?.imei} />
//         <InfoRow label="Warranty" value={currentJob?.warranty} />
//         <InfoRow label="Saved Date" value={currentJob?.savedDate} />
//         <InfoRow label="Delivered Date" value={currentJob?.deliveredDate || '-'} />
//         <InfoRow label="Engineer" value={currentJob?.engineerId} />
//         <InfoRow label="Service Charges" value={`₹${currentJob?.serviceCharges || 0}`} />
//         <InfoRow label="Spare Charges" value={`₹${currentJob?.spareCharges || 0}`} />
//         <InfoRow label="Total Amount" value={`₹${currentJob?.estimateAmount || 0}`} />
//         <InfoRow label="Payment Mode" value={currentJob?.paymentMode || '-'} />
//         <InfoRow label="Remarks" value={currentJob?.remarks} />
//       </View>

//       <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.lg }}>
//         <TouchableOpacity onPress={handleCall} style={{ alignItems: 'center' }}><Phone size={28} color={COLORS.primary} /><Text>Call</Text></TouchableOpacity>
//         <TouchableOpacity onPress={handleEmail} style={{ alignItems: 'center' }}><Mail size={28} color={COLORS.primary} /><Text>Email</Text></TouchableOpacity>
//         <TouchableOpacity onPress={handlePDF} style={{ alignItems: 'center' }}><FileText size={28} color={COLORS.primary} /><Text>PDF</Text></TouchableOpacity>
//         <TouchableOpacity onPress={handleInvoice} style={{ alignItems: 'center' }}><Receipt size={28} color={COLORS.primary} /><Text>Invoice</Text></TouchableOpacity>
//       </View>

//       <Button title="Edit Job" onPress={() => navigation.navigate('JobSheetForm', { mode: 'edit', jobId: currentJob?.id })} style={{ marginBottom: SPACING.lg }} />
//       <LoadingOverlay visible={loading} />
//     </ScrollView>
//   );
// }

//=============================

// src/screens/jobsheet/JobDetailScreen.js
import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Phone, Mail, FileText, Receipt, Edit } from 'lucide-react-native';
import { fetchJobById } from '../../store/slices/jobSlice';
import { InfoRow, StatusChip, LoadingOverlay, Button } from '../../components/UI';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
import { useToast } from 'react-native-toast-notifications';

export default function JobDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();
  const { jobId } = route.params;
  const { currentJob, loading } = useSelector(state => state.jobs);

  useEffect(() => {
    if (jobId) dispatch(fetchJobById(jobId));
  }, [jobId]);

  if (!currentJob && !loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Job not found</Text>
      </View>
    );
  }

  const handleCall = () => {
    if (currentJob?.contact) Linking.openURL(`tel:${currentJob.contact}`);
    else toast.show('No contact number', { type: 'danger' });
  };

  const handleEmail = () => {
    if (currentJob?.email) Linking.openURL(`mailto:${currentJob.email}`);
    else toast.show('No email address', { type: 'danger' });
  };

  const handlePDF = () => Alert.alert('PDF', 'PDF generation would happen here');
  const handleInvoice = () => Alert.alert('Invoice', 'Invoice generation would happen here');

  const ActionButton = ({ icon: Icon, label, onPress, color }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.7}>
      <Icon size={24} color={color || COLORS.gray600} />
      <Text style={[styles.actionLabel, { color: color || COLORS.gray600 }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.gray50 }} showsVerticalScrollIndicator={false}>
      <View style={styles.detailCard}>
        <View style={styles.jobHeader}>
          <Text style={styles.jobNumber}>{currentJob?.jobNo}</Text>
          <StatusChip status={currentJob?.status} />
        </View>

        <View style={styles.divider} />

        <InfoRow label="Customer" value={currentJob?.customerName} />
        <InfoRow label="Contact" value={currentJob?.contact} />
        <InfoRow label="Alt Contact" value={currentJob?.altContact} />
        <InfoRow label="Address" value={currentJob?.address} />
        <InfoRow label="Email" value={currentJob?.email} />
        <InfoRow label="Make / Model" value={`${currentJob?.makeId || '-'} / ${currentJob?.modelId || '-'}`} />
        <InfoRow label="IMEI" value={currentJob?.imei} />
        <InfoRow label="Warranty" value={currentJob?.warranty} />
        <InfoRow label="Saved Date" value={currentJob?.savedDate} />
        <InfoRow label="Delivered Date" value={currentJob?.deliveredDate || '-'} />
        <InfoRow label="Engineer" value={currentJob?.engineerId} />
        <InfoRow label="Service Charges" value={`₹${currentJob?.serviceCharges || 0}`} />
        <InfoRow label="Spare Charges" value={`₹${currentJob?.spareCharges || 0}`} />
        <InfoRow label="Total Amount" value={`₹${currentJob?.estimateAmount || 0}`} />
        <InfoRow label="Payment Mode" value={currentJob?.paymentMode || '-'} />
        <InfoRow label="Remarks" value={currentJob?.remarks} />
      </View>

      <View style={styles.actionContainer}>
        <ActionButton icon={Phone} label="Call" onPress={handleCall} color={COLORS.success} />
        <ActionButton icon={Mail} label="Email" onPress={handleEmail} color={COLORS.info} />
        <ActionButton icon={FileText} label="PDF" onPress={handlePDF} color={COLORS.warning} />
        <ActionButton icon={Receipt} label="Invoice" onPress={handleInvoice} color={COLORS.accent} />
      </View>

      <Button
        title="Edit Job"
        onPress={() => navigation.navigate('JobSheetForm', { mode: 'edit', jobId: currentJob?.id })}
        style={styles.editButton}
        icon={Edit}
      />

      <LoadingOverlay visible={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    margin: SPACING.lg,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  jobNumber: {
    ...FONTS.bold,
    fontSize: 20,
    color: COLORS.gray900,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: SPACING.md,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    ...SHADOWS.small,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionLabel: {
    ...FONTS.medium,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  editButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
});