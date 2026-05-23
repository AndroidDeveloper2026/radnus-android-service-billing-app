// src/screens/jobsheet/JobDetailScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Phone, Mail, FileText, Receipt, Edit, Printer } from 'lucide-react-native';
import RNPrint from 'react-native-print';
import { fetchJobById } from '../../store/slices/jobSlice';
import {
  InfoRow,
  StatusChip,
  LoadingOverlay,
  Button,
} from '../../components/UI';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
import { useToast } from 'react-native-toast-notifications';

export default function JobDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();
  const { jobId } = route.params;

  const [generating, setGenerating] = useState(false);

  // Get job from list first (cached) to avoid extra fetch
  const jobsList = useSelector(state => state.jobs.list);
  const currentJobFromList = useMemo(
    () => jobsList.find(job => job.id === jobId),
    [jobsList, jobId],
  );

  // If not in list, fetch from API
  const { currentJob: fetchedJob, loading } = useSelector(state => state.jobs);
  const currentJob = currentJobFromList || fetchedJob;

  useEffect(() => {
    // Only fetch if not already in list
    if (!currentJobFromList && jobId) {
      dispatch(fetchJobById(jobId));
    }
  }, [jobId, currentJobFromList, dispatch]);

  // Generate HTML for PDF
  const generatePDFHTML = () => {
    const val = (v) => (v && v !== 'NIL' && v !== 'N/A' ? v : 'N/A');
    const total = Number(currentJob?.serviceCharges || 0) + Number(currentJob?.spareCharges || 0);
    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB');
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Details - ${currentJob?.jobNo}</title>
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: white;
            padding: 20px;
          }
          .outer-border {
            border: 2px solid #000;
            padding: 20px;
          }
          .header-section {
            border-bottom: 1px solid #000;
            padding-bottom: 12px;
            margin-bottom: 15px;
            text-align: center;
          }
          .company-name {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
          }
          .company-address {
            font-size: 11px;
            color: #444;
            margin: 5px 0;
          }
          .job-title {
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            padding: 8px;
            border-bottom: 1px solid #000;
            margin-bottom: 15px;
          }
          .two-col {
            display: flex;
            border-bottom: 1px solid #000;
            margin-bottom: 15px;
          }
          .col-left {
            width: 50%;
            padding: 8px;
            border-right: 1px solid #000;
          }
          .col-right {
            width: 50%;
            padding: 8px;
          }
          .section-title {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 6px;
          }
          .info-text {
            font-size: 10px;
            margin: 2px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          td {
            padding: 6px;
            border: 1px solid #000;
            font-size: 10px;
          }
          .estimate-box {
            border: 2px dashed #333;
            padding: 12px;
            margin: 15px 0;
            background: #f9f9f9;
          }
          .estimate-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .divider {
            border-top: 1px solid #ddd;
            margin: 8px 0;
          }
          .total-row {
            font-weight: bold;
          }
          .sign-row {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
          }
          .sign-box {
            width: 30%;
            text-align: center;
          }
          .sign-line {
            border-bottom: 1px solid #000;
            margin-bottom: 6px;
            height: 40px;
          }
          .sign-label {
            font-size: 10px;
            font-weight: 600;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 8px;
            border-top: 1px solid #ddd;
            font-size: 9px;
          }
        </style>
      </head>
      <body>
        <div class="outer-border">
          <div class="header-section">
            <div class="company-name">RADNUS COMMUNICATION</div>
            <div class="company-address">
              242, Sinnaya Plaza, MG Road, Puducherry - 605001<br />
              Phone: 81222 73355 / 99409 73030<br />
              Mon–Sat (10AM–7PM) | www.radnus.in
            </div>
          </div>

          <div class="job-title">JOB DETAILS</div>

          <div class="two-col">
            <div class="col-left">
              <div class="section-title">Customer Information</div>
              <div class="info-text"><strong>Name:</strong> ${val(currentJob?.customerName)}</div>
              <div class="info-text"><strong>Phone:</strong> ${val(currentJob?.contact)}</div>
              <div class="info-text"><strong>Alt Contact:</strong> ${val(currentJob?.altContact)}</div>
              <div class="info-text"><strong>Email:</strong> ${val(currentJob?.email)}</div>
              <div class="info-text"><strong>Address:</strong> ${val(currentJob?.address)}</div>
            </div>
            <div class="col-right">
              <div class="section-title">Job Information</div>
              <div class="info-text"><strong>Job No:</strong> ${val(currentJob?.jobNo)}</div>
              <div class="info-text"><strong>Status:</strong> ${val(currentJob?.status)}</div>
              <div class="info-text"><strong>Saved Date:</strong> ${val(currentJob?.savedDate)}</div>
              <div class="info-text"><strong>Delivered Date:</strong> ${formatDate(currentJob?.deliveredDate)}</div>
              <div class="info-text"><strong>Engineer:</strong> ${val(currentJob?.engineerId)}</div>
              <div class="info-text"><strong>Payment Mode:</strong> ${val(currentJob?.paymentMode)}</div>
            </div>
          </div>

          <div class="two-col">
            <div class="col-left">
              <div class="section-title">Device Details</div>
              <div class="info-text"><strong>Make:</strong> ${val(currentJob?.makeId)}</div>
              <div class="info-text"><strong>Model:</strong> ${val(currentJob?.modelId)}</div>
              <div class="info-text"><strong>IMEI:</strong> ${val(currentJob?.imei)}</div>
              <div class="info-text"><strong>Warranty:</strong> ${val(currentJob?.warranty)}</div>
            </div>
            <div class="col-right">
              <div class="section-title">Physical Condition</div>
              <div class="info-text">${currentJob?.physicalConditions?.join(', ') || 'N/A'}</div>
              <div class="section-title" style="margin-top:10px">Accessories</div>
              <div class="info-text">${currentJob?.accessoriesReceived?.join(', ') || 'N/A'}</div>
            </div>
          </div>

          <div class="estimate-box">
            <div class="estimate-row">
              <span>Service Charge</span>
              <span>₹ ${currentJob?.serviceCharges || 0}</span>
            </div>
            <div class="estimate-row">
              <span>Spare Charge</span>
              <span>₹ ${currentJob?.spareCharges || 0}</span>
            </div>
            <div class="divider"></div>
            <div class="estimate-row total-row">
              <span>Total Amount</span>
              <span>₹ ${total}</span>
            </div>
          </div>

          ${currentJob?.remarks ? `
          <div class="section-title">Remarks</div>
          <div class="info-text" style="margin-bottom:15px">${currentJob.remarks}</div>
          ` : ''}

          <div class="sign-row">
            <div class="sign-box">
              <div class="sign-line"></div>
              <div class="sign-label">Customer Signature</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div class="sign-label">For RADNUS</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div class="sign-label">Authorized Signatory</div>
            </div>
          </div>

          <div class="footer">
            This is a computer generated document
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Handle PDF generation and print
  const handlePDF = async () => {
    if (!currentJob) {
      toast.show('Job data not available', { type: 'danger' });
      return;
    }
    setGenerating(true);
    try {
      const html = generatePDFHTML();
      await RNPrint.print({ html });
    } catch (error) {
      console.error('PDF error:', error);
      toast.show('Failed to generate PDF', { type: 'danger' });
    } finally {
      setGenerating(false);
    }
  };

  // Handle Estimate navigation
  const handleEstimate = () => {
    if (!currentJob?.id) {
      toast.show('Job data not available', { type: 'danger' });
      return;
    }
    navigation.navigate('JobSheet', {
      screen: 'EstimateBill',
      params: { id: currentJob.id },
    });
  };

  // Handle Invoice navigation
  const handleInvoice = () => {
    if (!currentJob?.id) {
      toast.show('Job data not available', { type: 'danger' });
      return;
    }
    navigation.navigate('JobSheet', {
      screen: 'InvoiceBill',
      params: { id: currentJob.id },
    });
  };

  const handleCall = () => {
    if (currentJob?.contact) {
      Linking.openURL(`tel:${currentJob.contact}`);
    } else {
      toast.show('No contact number', { type: 'danger' });
    }
  };

  const handleEmailContact = () => {
    if (currentJob?.email) {
      Linking.openURL(`mailto:${currentJob.email}`);
    } else {
      toast.show('No email address', { type: 'danger' });
    }
  };

  const ActionButton = ({ icon: Icon, label, onPress, color }) => (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={generating && (label === 'PDF' || label === 'Print')}
    >
      {generating && (label === 'PDF' || label === 'Print') ? (
        <ActivityIndicator size="small" color={color || COLORS.gray600} />
      ) : (
        <Icon size={24} color={color || COLORS.gray600} />
      )}
      <Text style={[styles.actionLabel, { color: color || COLORS.gray600 }]}>
        {generating && (label === 'PDF' || label === 'Print') ? 'Generating...' : label}
      </Text>
    </TouchableOpacity>
  );

  // Show loading only if we don't have the job and fetch is in progress
  if (!currentJob && loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingOverlay visible={true} />
      </View>
    );
  }

  if (!currentJob && !loading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Job not found</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
        <InfoRow
          label="Make / Model"
          value={`${currentJob?.makeId || '-'} / ${currentJob?.modelId || '-'}`}
        />
        <InfoRow label="IMEI" value={currentJob?.imei} />
        <InfoRow label="Warranty" value={currentJob?.warranty} />
        <InfoRow label="Saved Date" value={currentJob?.savedDate} />
        <InfoRow
          label="Delivered Date"
          value={currentJob?.deliveredDate ? new Date(currentJob.deliveredDate).toLocaleDateString() : '-'}
        />
        <InfoRow label="Engineer" value={currentJob?.engineerId} />
        <InfoRow
          label="Service Charges"
          value={`₹${currentJob?.serviceCharges || 0}`}
        />
        <InfoRow
          label="Spare Charges"
          value={`₹${currentJob?.spareCharges || 0}`}
        />
        <InfoRow
          label="Total Amount"
          value={`₹${currentJob?.estimateAmount || 0}`}
        />
        <InfoRow label="Payment Mode" value={currentJob?.paymentMode || '-'} />
        <InfoRow label="Remarks" value={currentJob?.remarks} />
      </View>

      <View style={styles.actionContainer}>
        <ActionButton
          icon={Phone}
          label="Call"
          onPress={handleCall}
          color={COLORS.success}
        />
        <ActionButton
          icon={Mail}
          label="Email"
          onPress={handleEmailContact}
          color={COLORS.info}
        />
        <ActionButton
          icon={Printer}
          label="PDF"
          onPress={handlePDF}
          color={COLORS.warning}
        />
        <ActionButton
          icon={Receipt}
          label="Invoice"
          onPress={handleInvoice}
          color={COLORS.primary}
        />
        <ActionButton
          icon={FileText}
          label="Estimate"
          onPress={handleEstimate}
          color={COLORS.warning}
        />
      </View>

      <Button
        title="Edit Job"
        onPress={() =>
          navigation.navigate('JobSheetForm', {
            mode: 'edit',
            jobId: currentJob?.id,
          })
        }
        style={styles.editButton}
        icon={Edit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    padding: SPACING.xl,
  },
  errorText: {
    ...FONTS.medium,
    fontSize: 16,
    color: COLORS.gray600,
    marginBottom: SPACING.lg,
  },
  errorButton: {
    minWidth: 120,
  },
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