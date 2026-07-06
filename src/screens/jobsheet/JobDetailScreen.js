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
  Modal,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  Phone,
  Mail,
  FileText,
  Receipt,
  Edit,
  Printer,
  AlertCircle,
  X,
  AlertTriangle,
  Lock,
  Unlock,
  User,
  Smartphone,
  CreditCard,
  IndianRupee,
  Package,
  CheckCircle,
  Users,
  Briefcase,
  MapPin,
  AtSign,
  Hash,
  Tag,
  ShoppingBag,
  DollarSign,
  Clipboard,
  List,
  Layers,
  Calendar,
  RefreshCw,
  Shield,
  Home,
  Settings,
} from 'lucide-react-native';
import RNPrint from 'react-native-print';
import {
  fetchJobById,
  cancelJob,
  lockInvoice,
  rebillJob,
  updateJobStatus,
} from '../../store/slices/jobSlice';
import {
  InfoRow,
  StatusChip,
  LoadingOverlay,
  Button,
} from '../../components/UI';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
import { useToast } from 'react-native-toast-notifications';
import { useAuth } from '../../context/AuthContext';
import RepairStepsTimeline from './RepairStepsTimeline';

export default function JobDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();
  const { user } = useAuth();
  const { jobId } = route.params;

  const [generating, setGenerating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelRemarks, setCancelRemarks] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [rebilling, setRebilling] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const jobsList = useSelector(state => state.jobs.list);
  const currentJobFromList = useMemo(
    () => jobsList.find(job => job.id === jobId),
    [jobsList, jobId],
  );

  const { currentJob: fetchedJob, loading } = useSelector(state => state.jobs);
  const currentJob = currentJobFromList || fetchedJob;

  useEffect(() => {
    if (!currentJobFromList && jobId) {
      dispatch(fetchJobById(jobId));
    }
  }, [jobId, currentJobFromList, dispatch]);

  const displayMake = currentJob?.makeName || currentJob?.makeId || '-';
  const displayModel = currentJob?.modelName || currentJob?.modelId || '-';
  const displayEngineer =
    currentJob?.engineerName || currentJob?.engineerId || '-';
  const displayDrawer = currentJob?.drawerName || currentJob?.drawerId || '-';
  const displayServiceRep =
    currentJob?.serviceRepName || currentJob?.serviceRepId || '-';
  const displayStatus = currentJob?.status || 'Received';
  const displayWarranty = currentJob?.warranty || 'No Warranty';

  // ─── Status Options ──────────────────────────────────────────────────────
  const statusOptions = [
    { id: 'Received', label: 'Received', color: '#3b82f6', bg: '#dbeafe' },
    { id: 'Pending', label: 'Pending', color: '#f59e0b', bg: '#fef3c7' },
    { id: 'Repaired', label: 'Repaired', color: '#10b981', bg: '#d1fae5' },
    { id: 'Delivered', label: 'Delivered', color: '#059669', bg: '#a7f3d0' },
    {
      id: 'Delivered NR/NA',
      label: 'Delivered NR/NA',
      color: '#059669',
      bg: '#a7f3d0',
    },
  ];

  // ─── Format Helpers ──────────────────────────────────────────────────────
  const formatDate = dateStr => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = amount => {
    const num = Number(amount) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const getStatusStyle = status => {
    const styles = {
      Received: { bg: '#dbeafe', color: '#1e40af' },
      Pending: { bg: '#fef3c7', color: '#92400e' },
      Repaired: { bg: '#d1fae5', color: '#065f46' },
      Delivered: { bg: '#a7f3d0', color: '#065f46' },
      'Delivered NR/NA': { bg: '#fecaca', color: '#991b1b' },
      Cancelled: { bg: '#fee2e2', color: '#991b1b' },
    };
    return styles[status] || { bg: '#f3f4f6', color: '#374151' };
  };

  // ─── PDF Generation ──────────────────────────────────────────────────────
  const generatePDFHTML = () => {
    const val = v => (v && v !== 'NIL' && v !== 'N/A' ? v : 'N/A');
    const serviceCharge = Number(currentJob?.serviceCharges || 0);
    const spareCharge = Number(currentJob?.spareCharges || 0);
    const total = serviceCharge + spareCharge;
    const advanceAmount = Number(currentJob?.advanceAmount || 0);
    const balance = total - advanceAmount;

    const spareItems = currentJob?.spareItems || [];
    const advanceItems = currentJob?.advanceItems || [];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Details - ${currentJob?.jobNo}</title>
        <style>
          @page { size: A4; margin: 10mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: white; padding: 20px; }
          .outer-border { border: 2px solid #000; padding: 20px; }
          .header-section { border-bottom: 1px solid #000; padding-bottom: 12px; margin-bottom: 15px; text-align: center; }
          .company-name { font-size: 18px; font-weight: bold; }
          .company-address { font-size: 11px; color: #444; margin: 5px 0; }
          .job-title { text-align: center; font-weight: bold; font-size: 16px; padding: 8px; border-bottom: 1px solid #000; margin-bottom: 15px; }
          .two-col { display: flex; border-bottom: 1px solid #000; margin-bottom: 15px; }
          .col-left { width: 50%; padding: 8px; border-right: 1px solid #000; }
          .col-right { width: 50%; padding: 8px; }
          .section-title { font-weight: bold; font-size: 12px; margin-bottom: 6px; }
          .info-text { font-size: 10px; margin: 2px 0; }
          .estimate-box { border: 2px dashed #333; padding: 12px; margin: 15px 0; background: #f9f9f9; }
          .estimate-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 11px; }
          .divider { border-top: 1px solid #ddd; margin: 8px 0; }
          .total-row { font-weight: bold; }
          .advance-row { color: #059669; }
          .balance-row { color: #dc2626; }
          .sign-row { display: flex; justify-content: space-between; margin-top: 30px; }
          .sign-box { width: 30%; text-align: center; }
          .sign-line { border-bottom: 1px solid #000; margin-bottom: 6px; height: 40px; }
          .sign-label { font-size: 10px; font-weight: 600; }
          .footer { text-align: center; margin-top: 15px; padding-top: 8px; border-top: 1px solid #ddd; font-size: 9px; }
          .spare-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10px; }
          .spare-table th { background: #f3f4f6; border: 1px solid #ddd; padding: 5px; text-align: left; }
          .spare-table td { border: 1px solid #ddd; padding: 5px; }
          .advance-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10px; }
          .advance-table th { background: #f3f4f6; border: 1px solid #ddd; padding: 5px; text-align: left; }
          .advance-table td { border: 1px solid #ddd; padding: 5px; }
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
              <div class="info-text"><strong>Name:</strong> ${val(
                currentJob?.customerName,
              )}</div>
              <div class="info-text"><strong>Phone:</strong> ${val(
                currentJob?.contact,
              )}</div>
              <div class="info-text"><strong>Alt Contact:</strong> ${val(
                currentJob?.altContact,
              )}</div>
              <div class="info-text"><strong>Email:</strong> ${val(
                currentJob?.email,
              )}</div>
              <div class="info-text"><strong>Address:</strong> ${val(
                currentJob?.address,
              )}</div>
            </div>
            <div class="col-right">
              <div class="section-title">Job Information</div>
              <div class="info-text"><strong>Job No:</strong> ${val(
                currentJob?.jobNo,
              )}</div>
              <div class="info-text"><strong>Status:</strong> ${val(
                displayStatus,
              )}</div>
              <div class="info-text"><strong>Created Date:</strong> ${formatDate(
                currentJob?.createdAt,
              )}</div>
              <div class="info-text"><strong>Repair Date:</strong> ${formatDate(
                currentJob?.repairDate,
              )}</div>
              <div class="info-text"><strong>Delivery Date:</strong> ${formatDate(
                currentJob?.deliveredDate,
              )}</div>
              <div class="info-text"><strong>Engineer:</strong> ${val(
                displayEngineer,
              )}</div>
              <div class="info-text"><strong>Drawer:</strong> ${val(
                displayDrawer,
              )}</div>
              <div class="info-text"><strong>Payment Mode:</strong> ${val(
                currentJob?.paymentMode,
              )}</div>
            </div>
          </div>

          <div class="two-col">
            <div class="col-left">
              <div class="section-title">Device Details</div>
              <div class="info-text"><strong>Make:</strong> ${val(
                displayMake,
              )}</div>
              <div class="info-text"><strong>Model:</strong> ${val(
                displayModel,
              )}</div>
              <div class="info-text"><strong>IMEI:</strong> ${val(
                currentJob?.imei,
              )}</div>
              <div class="info-text"><strong>Warranty:</strong> ${val(
                displayWarranty,
              )}</div>
              <div class="info-text"><strong>Pattern/PIN:</strong> ${val(
                currentJob?.patternPin,
              )}</div>
              <div class="info-text"><strong>ID Proof:</strong> ${val(
                currentJob?.idProof,
              )}</div>
            </div>
            <div class="col-right">
              <div class="section-title">Physical Condition</div>
              <div class="info-text">${
                currentJob?.physicalConditions?.join(', ') || 'N/A'
              }</div>
              <div class="section-title" style="margin-top:10px">Accessories Received</div>
              <div class="info-text">${
                currentJob?.accessoriesReceived?.join(', ') || 'N/A'
              }</div>
              <div class="info-text"><strong>Battery Number:</strong> ${val(
                currentJob?.batteryNumber,
              )}</div>
            </div>
          </div>

          <div class="two-col">
            <div class="col-left">
              <div class="section-title">Service Details</div>
              <div class="info-text"><strong>Dealer:</strong> ${val(
                currentJob?.dealerName,
              )}</div>
              <div class="info-text"><strong>Service Rep:</strong> ${val(
                displayServiceRep,
              )}</div>
              <div class="info-text"><strong>Insta Follow:</strong> ${val(
                currentJob?.instaFollowers,
              )}</div>
              <div class="info-text"><strong>Google Review:</strong> ${val(
                currentJob?.googleReview,
              )}</div>
            </div>
            <div class="col-right">
              <div class="section-title">Visual Issues</div>
              <div class="info-text">${
                currentJob?.visualIssues?.join(', ') || 'N/A'
              }</div>
              ${
                currentJob?.remarks
                  ? `<div class="section-title" style="margin-top:10px">Remarks</div><div class="info-text">${currentJob.remarks}</div>`
                  : ''
              }
            </div>
          </div>

          ${
            spareItems.length > 0
              ? `
            <div class="section-title">Spare Parts Used</div>
            <table class="spare-table">
              <thead>
                <tr><th>#</th><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
              </thead>
              <tbody>
                ${spareItems
                  .map(
                    (item, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${val(item.name)}</td>
                    <td>${item.qty || 0}</td>
                    <td>₹ ${item.rate || 0}</td>
                    <td>₹ ${(item.qty || 0) * (item.rate || 0)}</td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>
          `
              : ''
          }

          ${
            advanceItems.length > 0
              ? `
            <div class="section-title">Advance Payments</div>
            <table class="advance-table">
              <thead>
                <tr><th>#</th><th>Label</th><th>Amount</th><th>Date</th></tr>
              </thead>
              <tbody>
                ${advanceItems
                  .map(
                    (item, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${val(item.label)}</td>
                    <td>₹ ${item.amount || 0}</td>
                    <td>${formatDate(item.date)}</td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>
          `
              : ''
          }

          <div class="estimate-box">
            <div class="estimate-row"><span>Service Charge</span><span>${formatCurrency(
              serviceCharge,
            )}</span></div>
            <div class="estimate-row"><span>Spare Charge</span><span>${formatCurrency(
              spareCharge,
            )}</span></div>
            ${
              spareItems.length > 0
                ? `
              <div class="estimate-row" style="font-size:9px;color:#6b7280;">
                <span>Spare Items Total</span>
                <span>${formatCurrency(spareCharge)}</span>
              </div>
            `
                : ''
            }
            <div class="divider"></div>
            <div class="estimate-row total-row"><span>Total Amount</span><span>${formatCurrency(
              total,
            )}</span></div>
            ${
              advanceAmount > 0
                ? `
              <div class="estimate-row advance-row"><span>Advance Paid</span><span>${formatCurrency(
                advanceAmount,
              )}</span></div>
              <div class="estimate-row balance-row"><span>Balance Due</span><span>${formatCurrency(
                balance,
              )}</span></div>
            `
                : ''
            }
          </div>

          ${
            currentJob?.isInvoiced
              ? `
            <div style="text-align:center;margin:10px 0;padding:8px;background:#dbeafe;border-radius:4px;font-weight:bold;color:#1d4ed8;">
              🔒 INVOICED — LOCKED
            </div>
          `
              : ''
          }

          ${
            currentJob?.isCancelled
              ? `
            <div style="text-align:center;margin:10px 0;padding:8px;background:#fee2e2;border-radius:4px;font-weight:bold;color:#991b1b;">
              🚫 CANCELLED — ${val(currentJob?.cancelRemarks)}
            </div>
          `
              : ''
          }

          ${
            (currentJob?.rebillHistory?.length || 0) > 0
              ? `
            <div class="section-title">Rebill History</div>
            <div style="font-size:10px;color:#6b7280;margin-bottom:10px;">
              Total Rebill: ${currentJob.rebillHistory.length} time(s)
            </div>
          `
              : ''
          }

          <div class="sign-row">
            <div class="sign-box"><div class="sign-line"></div><div class="sign-label">Customer Signature</div></div>
            <div class="sign-box"><div class="sign-line"></div><div class="sign-label">For RADNUS</div></div>
            <div class="sign-box"><div class="sign-line"></div><div class="sign-label">Authorized Signatory</div></div>
          </div>
          <div class="footer">This is a computer generated document</div>
        </div>
      </html>
    `;
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handlePDF = async () => {
    if (!currentJob) {
      toast.show('Job data not available', { type: 'danger' });
      return;
    }
    setGenerating(true);
    try {
      await RNPrint.print({ html: generatePDFHTML() });
    } catch (error) {
      toast.show('Failed to generate PDF', { type: 'danger' });
    } finally {
      setGenerating(false);
    }
  };

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
    if (currentJob?.contact) Linking.openURL(`tel:${currentJob.contact}`);
    else toast.show('No contact number', { type: 'danger' });
  };

  const handleEmailContact = () => {
    if (currentJob?.email) Linking.openURL(`mailto:${currentJob.email}`);
    else toast.show('No email address', { type: 'danger' });
  };

  // ─── Status Update Handler ──────────────────────────────────────────────
  const handleStatusUpdate = async newStatus => {
    if (isInvoiced || isCancelled) {
      toast.show('Cannot update status - job is locked', { type: 'danger' });
      return;
    }
    setUpdatingStatus(true);
    try {
      const username = user?.username || 'admin';
      await dispatch(
        updateJobStatus({
          id: currentJob.id,
          status: newStatus,
          updatedBy: username,
        }),
      ).unwrap();
      toast.show(`Status updated to ${newStatus}`, { type: 'success' });
      dispatch(fetchJobById(currentJob.id));
    } catch (err) {
      toast.show(err.message || 'Status update failed', { type: 'danger' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ─── Cancel Handler ──────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!cancelRemarks.trim()) {
      toast.show('Please enter cancel reason', { type: 'danger' });
      return;
    }
    setCancelling(true);
    try {
      const username = user?.username || 'admin';
      await dispatch(
        cancelJob({
          id: currentJob.id,
          cancelRemarks: cancelRemarks.trim(),
          cancelledBy: username,
        }),
      ).unwrap();
      setShowCancelModal(false);
      setCancelRemarks('');
      toast.show('Job Sheet Cancelled', { type: 'success' });
      dispatch(fetchJobById(currentJob.id));
    } catch (err) {
      toast.show(err.message || 'Cancel failed ❌', { type: 'danger' });
    } finally {
      setCancelling(false);
    }
  };

  // ─── Rebill Handler ──────────────────────────────────────────────────────
  const handleRebill = () => {
    const rebillCount = (currentJob?.rebillHistory?.length || 0) + 1;
    Alert.alert(
      'Rebill Confirmation',
      `This will:\n• Unlock the job sheet for editing\n• Clear current charges (Rebill #${rebillCount})\n• Set status back to "Received"\n• Save old invoice to rebill history\n\nProceed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          style: 'default',
          onPress: async () => {
            setRebilling(true);
            try {
              const username = user?.username || 'admin';
              await dispatch(
                rebillJob({
                  id: currentJob.id,
                  rebilledBy: username,
                }),
              ).unwrap();
              toast.show(`Rebill #${rebillCount} opened!`, {
                type: 'success',
              });
              dispatch(fetchJobById(currentJob.id));
            } catch (err) {
              toast.show(err.message || 'Rebill failed ❌', { type: 'danger' });
            } finally {
              setRebilling(false);
            }
          },
        },
      ],
    );
  };

  // ─── Invoice Lock Handler ──────────────────────────────────────────────
  const handleLockInvoice = async () => {
    Alert.alert(
      'Generate Invoice',
      'This will mark the job as invoiced and lock it from further edits.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          style: 'default',
          onPress: async () => {
            try {
              await dispatch(lockInvoice(currentJob.id)).unwrap();
              toast.show('Invoice Generated Successfully', { type: 'success' });
              dispatch(fetchJobById(currentJob.id));
            } catch (err) {
              toast.show(err.message || 'Invoice failed ❌', {
                type: 'danger',
              });
            }
          },
        },
      ],
    );
  };

  // ─── Info Section Component ─────────────────────────────────────────────
  const InfoSection = ({ title, icon: Icon, children }) => (
    <View style={styles.infoSection}>
      <View style={styles.infoSectionHeader}>
        {Icon && <Icon size={18} color={COLORS.primary} />}
        <Text style={styles.infoSectionTitle}>{title}</Text>
      </View>
      <View style={styles.infoSectionContent}>{children}</View>
    </View>
  );

  // ─── Info Row Component ─────────────────────────────────────────────────
  const DetailRow = ({ label, value, icon: Icon, valueColor }) => (
    <View style={styles.detailRow}>
      <View style={styles.detailRowLeft}>
        {Icon && <Icon size={16} color={COLORS.gray500} />}
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, valueColor && { color: valueColor }]}>
        {value || '—'}
      </Text>
    </View>
  );

  // ─── Action Button Component ─────────────────────────────────────────────
  const ActionButton = ({ icon: Icon, label, onPress, color, bgColor }) => (
    <TouchableOpacity
      style={[styles.actionButton, bgColor && { backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={generating && label === 'PDF'}
    >
      {generating && label === 'PDF' ? (
        <ActivityIndicator size="small" color={color || COLORS.gray600} />
      ) : (
        <Icon size={22} color={color || COLORS.gray700} />
      )}
      <Text style={[styles.actionLabel, { color: color || COLORS.gray700 }]}>
        {generating && label === 'PDF' ? 'Generating...' : label}
      </Text>
    </TouchableOpacity>
  );

  // ─── Primary Action Button Component ────────────────────────────────────
  const PrimaryActionButton = ({
    icon: Icon,
    label,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
  }) => {
    const getStyles = () => {
      switch (variant) {
        case 'edit':
          return {
            container: styles.primaryEditBtn,
            text: styles.primaryBtnText,
            iconColor: COLORS.white,
          };
        case 'invoice':
          return {
            container: styles.primaryInvoiceBtn,
            text: styles.primaryBtnText,
            iconColor: COLORS.white,
          };
        case 'invoiced':
          return {
            container: styles.primaryInvoicedBtn,
            text: styles.primaryBtnTextDisabled,
            iconColor: COLORS.gray500,
          };
        case 'rebill':
          return {
            container: styles.primaryRebillBtn,
            text: styles.primaryBtnText,
            iconColor: COLORS.white,
          };
        case 'cancel':
          return {
            container: styles.primaryCancelBtn,
            text: styles.primaryBtnText,
            iconColor: COLORS.white,
          };
        default:
          return {
            container: styles.primaryBtn,
            text: styles.primaryBtnText,
            iconColor: COLORS.white,
          };
      }
    };

    const style = getStyles();

    return (
      <TouchableOpacity
        style={[style.container, disabled && styles.primaryBtnDisabled]}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <>
            <Icon size={20} color={style.iconColor} />
            <Text style={style.text}>{label}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  // ─── Summary Card ────────────────────────────────────────────────────────
  const SummaryCard = ({ label, value, icon: Icon, color }) => (
    <View
      style={[styles.summaryCard, { borderLeftColor: color || COLORS.primary }]}
    >
      <View style={styles.summaryCardIcon}>
        <Icon size={20} color={color || COLORS.primary} />
      </View>
      <View style={styles.summaryCardContent}>
        <Text style={styles.summaryCardLabel}>{label}</Text>
        <Text
          style={[styles.summaryCardValue, { color: color || COLORS.gray900 }]}
        >
          {value}
        </Text>
      </View>
    </View>
  );

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

  const isCancelled = currentJob?.isCancelled;
  const isInvoiced = currentJob?.isInvoiced;
  const serviceCharge = Number(currentJob?.serviceCharges || 0);
  const spareCharge = Number(currentJob?.spareCharges || 0);
  const totalAmount = serviceCharge + spareCharge;
  const advanceAmount = Number(currentJob?.advanceAmount || 0);
  const balanceDue = totalAmount - advanceAmount;
  const spareItems = currentJob?.spareItems || [];
  const advanceItems = currentJob?.advanceItems || [];
  const statusStyle = getStatusStyle(displayStatus);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ─── Header Card ────────────────────────────────────────────────────── */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <FileText size={24} color={COLORS.primary} />
            <View>
              <Text style={styles.jobNumber}>{currentJob?.jobNo}</Text>
              <Text style={styles.jobDate}>
                {formatDate(currentJob?.createdAt)} • {currentJob?.time || '—'}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View
              style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
            >
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {displayStatus}
              </Text>
            </View>
          </View>
        </View>

        {isCancelled && (
          <View style={styles.cancelledBanner}>
            <AlertCircle size={16} color="#991b1b" />
            <Text style={styles.cancelledText}>
              Cancelled — {currentJob?.cancelRemarks || 'No reason provided'}
            </Text>
          </View>
        )}

        {isInvoiced && !isCancelled && (
          <View style={styles.invoicedBanner}>
            <Lock size={16} color="#1d4ed8" />
            <Text style={styles.invoicedText}>Invoiced — Locked</Text>
          </View>
        )}

        {/* ─── Summary Cards ────────────────────────────────────────────────── */}
        {/* <View style={styles.summaryRow}>
          <SummaryCard 
            label="Service" 
            value={formatCurrency(serviceCharge)} 
            icon={IndianRupee} 
            color="#7c3aed" 
          />
          <SummaryCard 
            label="Spare" 
            value={formatCurrency(spareCharge)} 
            icon={Package} 
            color="#db2777" 
          />
          <SummaryCard 
            label="Total" 
            value={formatCurrency(totalAmount)} 
            icon={DollarSign} 
            color="#059669" 
          />
        </View> */}

        {/* ✅ FIX: Advance Amount always shown */}
        {/* <View style={styles.summaryRow}>
          <SummaryCard 
            label="Advance Paid" 
            value={formatCurrency(advanceAmount)} 
            icon={CreditCard} 
            color="#0d6efd" 
          />
          <SummaryCard 
            label="Balance Due" 
            value={formatCurrency(balanceDue)} 
            icon={AlertCircle} 
            color={balanceDue > 0 ? '#dc2626' : '#059669'} 
          />
          <SummaryCard 
            label="Payments" 
            value={advanceItems.length} 
            icon={List} 
            color="#f59e0b" 
          />
        </View> */}

        <View style={styles.summaryRow}>
          <SummaryCard
            label="Service"
            value={formatCurrency(serviceCharge)}
            icon={IndianRupee}
            color="#7c3aed"
          />
          <SummaryCard
            label="Spare"
            value={formatCurrency(spareCharge)}
            icon={Package}
            color="#db2777"
          />
          <SummaryCard
            label="Total"
            value={formatCurrency(totalAmount)}
            icon={DollarSign}
            color="#059669"
          />
        </View>

        {/* ✅ Advance Amount always shown */}
        <View style={styles.summaryRow}>
          <SummaryCard
            label="Advance Paid"
            value={formatCurrency(advanceAmount)}
            icon={CreditCard}
            color="#0d6efd"
          />
          <SummaryCard
            label="Balance Due"
            value={formatCurrency(balanceDue)}
            icon={AlertCircle}
            color={balanceDue > 0 ? '#dc2626' : '#059669'}
          />
          <SummaryCard
            label="Payments"
            value={advanceItems.length}
            icon={List}
            color="#f59e0b"
          />
        </View>

        <DetailRow
          label="Advance Amount"
          value={formatCurrency(advanceAmount)}
          icon={CreditCard}
          valueColor="#0d6efd"
        />
      </View>

      {/* ─── Status Update Buttons ────────────────────────────────────────── */}
      {!isCancelled && !isInvoiced && (
        <View style={styles.statusSection}>
          <Text style={styles.statusSectionTitle}>Update Status</Text>
          <View style={styles.statusButtonsRow}>
            {statusOptions.map(option => {
              const isActive = displayStatus === option.id;
              const isDisabled = isInvoiced || isCancelled || updatingStatus;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.statusButton,
                    { backgroundColor: isActive ? option.bg : COLORS.white },
                    { borderColor: isActive ? option.color : COLORS.gray200 },
                    isDisabled && styles.statusButtonDisabled,
                  ]}
                  onPress={() => handleStatusUpdate(option.id)}
                  disabled={isDisabled || isActive}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      { color: isActive ? option.color : COLORS.gray600 },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* ─── Customer Information ─────────────────────────────────────────── */}
      <View style={styles.detailCard}>
        <InfoSection title="Customer Information" icon={User}>
          <DetailRow
            label="Name"
            value={currentJob?.customerName}
            icon={User}
          />
          <DetailRow label="Contact" value={currentJob?.contact} icon={Phone} />
          <DetailRow
            label="Alt Contact"
            value={currentJob?.altContact}
            icon={Phone}
          />
          <DetailRow label="Email" value={currentJob?.email} icon={AtSign} />
          <DetailRow
            label="Address"
            value={currentJob?.address}
            icon={MapPin}
          />
          <DetailRow label="ID Proof" value={currentJob?.idProof} icon={Tag} />
        </InfoSection>
      </View>

      {/* ─── Device Information ───────────────────────────────────────────── */}
      <View style={styles.detailCard}>
        <InfoSection title="Device Details" icon={Smartphone}>
          <DetailRow
            label="Make / Model"
            value={`${displayMake} / ${displayModel}`}
            icon={Smartphone}
          />
          <DetailRow label="IMEI" value={currentJob?.imei} icon={Hash} />
          <DetailRow label="Warranty" value={displayWarranty} icon={Shield} />
          <DetailRow
            label="Pattern / PIN"
            value={currentJob?.patternPin}
            icon={Lock}
          />
          <DetailRow
            label="Physical Condition"
            value={currentJob?.physicalConditions?.join(', ') || '-'}
            icon={Clipboard}
          />
          <DetailRow
            label="Accessories"
            value={currentJob?.accessoriesReceived?.join(', ') || '-'}
            icon={ShoppingBag}
          />
          <DetailRow
            label="Battery Number"
            value={currentJob?.batteryNumber}
            icon={Tag}
          />
        </InfoSection>
      </View>

      {/* ─── Service Information ──────────────────────────────────────────── */}
      <View style={styles.detailCard}>
        <InfoSection title="Service Details" icon={Briefcase}>
          <DetailRow label="Engineer" value={displayEngineer} icon={Users} />
          <DetailRow
            label="Dealer"
            value={currentJob?.dealerName}
            icon={Briefcase}
          />
          <DetailRow label="Drawer" value={displayDrawer} icon={Layers} />
          <DetailRow
            label="Service Rep"
            value={displayServiceRep}
            icon={User}
          />
          <DetailRow
            label="Payment Mode"
            value={currentJob?.paymentMode}
            icon={CreditCard}
          />
          <DetailRow
            label="Service Charge"
            value={formatCurrency(serviceCharge)}
            icon={IndianRupee}
          />
          <DetailRow
            label="Spare Charge"
            value={formatCurrency(spareCharge)}
            icon={Package}
          />
          <DetailRow
            label="Total Amount"
            value={formatCurrency(totalAmount)}
            icon={DollarSign}
            valueColor="#059669"
          />
          <DetailRow
            label="Advance Amount"
            value={formatCurrency(advanceAmount)}
            icon={CreditCard}
            valueColor="#0d6efd"
          />
          <DetailRow
            label="Margin"
            value={formatCurrency(currentJob?.marginAmount || 0)}
            icon={DollarSign}
            valueColor="#f59e0b"
          />
          <DetailRow
            label="Repair Date"
            value={formatDate(currentJob?.repairDate)}
            icon={Calendar}
          />
          <DetailRow
            label="Delivery Date"
            value={formatDate(currentJob?.deliveredDate)}
            icon={Calendar}
          />
          <DetailRow
            label="Insta Follow"
            value={currentJob?.instaFollowers || '-'}
            icon={CheckCircle}
          />
          <DetailRow
            label="Google Review"
            value={currentJob?.googleReview || '-'}
            icon={CheckCircle}
          />
          <DetailRow
            label="Remarks"
            value={currentJob?.remarks || '-'}
            icon={Clipboard}
          />
        </InfoSection>
      </View>

      {/* ─── Visual Issues ────────────────────────────────────────────────── */}
      {currentJob?.visualIssues?.length > 0 && (
        <View style={styles.detailCard}>
          <InfoSection title="Visual Issues" icon={AlertCircle}>
            <View style={styles.visualIssuesContainer}>
              {currentJob.visualIssues.map((issue, index) => (
                <View key={index} style={styles.visualIssueTag}>
                  <AlertCircle size={12} color="#7c3aed" />
                  <Text style={styles.visualIssueText}>{issue}</Text>
                </View>
              ))}
            </View>
          </InfoSection>
        </View>
      )}

      {/* ─── Spare Items ───────────────────────────────────────────────────── */}
      {spareItems.length > 0 && (
        <View style={styles.detailCard}>
          <InfoSection
            title={`Spare Parts (${spareItems.length})`}
            icon={Package}
          >
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.tableColName]}>
                  Item
                </Text>
                <Text style={[styles.tableHeaderText, styles.tableColQty]}>
                  Qty
                </Text>
                <Text style={[styles.tableHeaderText, styles.tableColRate]}>
                  Rate
                </Text>
                <Text style={[styles.tableHeaderText, styles.tableColAmount]}>
                  Amount
                </Text>
              </View>
              {spareItems.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableColName,
                      styles.cellName,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableColQty,
                      styles.cellQty,
                    ]}
                  >
                    {item.qty}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableColRate,
                      styles.cellRate,
                    ]}
                  >
                    ₹{item.rate}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableColAmount,
                      styles.cellAmount,
                    ]}
                  >
                    ₹{(item.qty || 0) * (item.rate || 0)}
                  </Text>
                </View>
              ))}
            </View>
          </InfoSection>
        </View>
      )}

      {/* ─── Advance Payments ─────────────────────────────────────────────── */}
      {advanceItems.length > 0 && (
        <View style={styles.detailCard}>
          <InfoSection
            title={`Advance Payments (${advanceItems.length})`}
            icon={CreditCard}
          >
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.tableColLabel]}>
                  Label
                </Text>
                <Text style={[styles.tableHeaderText, styles.tableColAmount]}>
                  Amount
                </Text>
                <Text style={[styles.tableHeaderText, styles.tableColDate2]}>
                  Date
                </Text>
              </View>
              {advanceItems.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableColLabel,
                      styles.cellName,
                    ]}
                  >
                    {item.label || '-'}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableColAmount,
                      styles.cellAmount,
                    ]}
                  >
                    ₹{item.amount}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableColDate2,
                      styles.cellDate,
                    ]}
                  >
                    {formatDate(item.date)}
                  </Text>
                </View>
              ))}
            </View>
          </InfoSection>
        </View>
      )}

      {/* ─── Rebill History ────────────────────────────────────────────────── */}
      {(currentJob?.rebillHistory?.length || 0) > 0 && (
        <View style={styles.detailCard}>
          <InfoSection
            title={`Rebill History (${currentJob.rebillHistory.length})`}
            icon={RefreshCw}
          >
            {currentJob.rebillHistory.map((rebill, index) => (
              <View key={index} style={styles.rebillItem}>
                <View style={styles.rebillHeader}>
                  <Text style={styles.rebillNumber}>Repair #{index + 1}</Text>
                  <Text style={styles.rebillDate}>
                    {formatDate(rebill.rebilledAt)}
                  </Text>
                </View>
                <View style={styles.rebillDetails}>
                  <Text style={styles.rebillText}>
                    Service: {formatCurrency(rebill.serviceCharge)} | Spare:{' '}
                    {formatCurrency(rebill.spareCharge)} | Total:{' '}
                    {formatCurrency(
                      (rebill.serviceCharge || 0) + (rebill.spareCharge || 0),
                    )}
                  </Text>
                  {rebill.remarks && (
                    <Text style={styles.rebillRemarks}>"{rebill.remarks}"</Text>
                  )}
                  <Text style={styles.rebillBy}>by {rebill.rebilledBy}</Text>
                </View>
              </View>
            ))}
          </InfoSection>
        </View>
      )}

      {/* ─── Repair Steps Timeline ────────────────────────────────────────── */}
      {currentJob?.id && <RepairStepsTimeline jobId={currentJob.id} />}

      {/* ─── Action Buttons Row 1 ──────────────────────────────────────────── */}
      <View style={styles.actionContainer}>
        <ActionButton
          icon={Phone}
          label="Call"
          onPress={handleCall}
          color="#22c55e"
          bgColor="#f0fdf4"
        />
        <ActionButton
          icon={Mail}
          label="Email"
          onPress={handleEmailContact}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <ActionButton
          icon={Printer}
          label="PDF"
          onPress={handlePDF}
          color="#f59e0b"
          bgColor="#fffbeb"
        />
        <ActionButton
          icon={Receipt}
          label="Invoice"
          onPress={handleInvoice}
          color="#8b5cf6"
          bgColor="#f5f3ff"
        />
        <ActionButton
          icon={FileText}
          label="Estimate"
          onPress={handleEstimate}
          color="#06b6d4"
          bgColor="#ecfeff"
        />
      </View>

      {/* ─── Primary Action Buttons Row ───────────────────────────────────── */}
      <View style={styles.primaryActionContainer}>
        {/* Edit Button */}
        {!isCancelled && !isInvoiced && (
          <PrimaryActionButton
            icon={Edit}
            label="Edit Job"
            onPress={() =>
              navigation.navigate('JobSheetForm', {
                mode: 'edit',
                jobId: currentJob?.id,
              })
            }
            variant="edit"
          />
        )}

        {/* Invoice Button */}
        {!isCancelled && (
          <PrimaryActionButton
            icon={isInvoiced ? Lock : Receipt}
            label={isInvoiced ? 'Invoiced' : 'Generate Invoice'}
            onPress={handleLockInvoice}
            variant={isInvoiced ? 'invoiced' : 'invoice'}
            disabled={isInvoiced}
          />
        )}

        {/* Rebill Button */}
        {isInvoiced && !isCancelled && (
          <PrimaryActionButton
            icon={Unlock}
            label={
              rebilling
                ? '...'
                : `Rebill #${(currentJob?.rebillHistory?.length || 0) + 1}`
            }
            onPress={handleRebill}
            variant="rebill"
            loading={rebilling}
            disabled={rebilling}
          />
        )}

        {/* Cancel Button - Prominent Red */}
        {!isCancelled && (
          <PrimaryActionButton
            icon={AlertTriangle}
            label="Cancel Job"
            onPress={() => setShowCancelModal(true)}
            variant="cancel"
          />
        )}
      </View>

      {/* ─── Cancel Modal ──────────────────────────────────────────────────── */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <AlertTriangle size={24} color={COLORS.danger} />
                <Text style={styles.modalTitle}>Cancel Job Sheet</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                <X size={24} color={COLORS.gray600} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalJobNo}>{currentJob?.jobNo}</Text>

            <View style={styles.modalWarningBox}>
              <AlertCircle size={20} color="#991b1b" />
              <Text style={styles.modalWarningText}>
                Once cancelled, this job sheet cannot be edited or invoiced.
              </Text>
            </View>

            <Text style={styles.modalLabel}>
              Cancel Reason <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={4}
              placeholder="Enter reason for cancellation..."
              placeholderTextColor={COLORS.gray400}
              value={cancelRemarks}
              onChangeText={setCancelRemarks}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => {
                  setShowCancelModal(false);
                  setCancelRemarks('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  styles.modalConfirmBtn,
                  (!cancelRemarks.trim() || cancelling) &&
                    styles.modalBtnDisabled,
                ]}
                onPress={handleCancel}
                disabled={!cancelRemarks.trim() || cancelling}
                activeOpacity={0.7}
              >
                <Text style={styles.modalConfirmText}>
                  {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: SPACING.xl,
  },
  errorText: {
    ...FONTS.medium,
    fontSize: 16,
    color: COLORS.gray600,
    marginBottom: SPACING.lg,
  },
  errorButton: { minWidth: 120 },

  // ─── Header Card ────────────────────────────────────────────────────────
  headerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    margin: SPACING.lg,
    padding: SPACING.lg,
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  jobNumber: {
    ...FONTS.bold,
    fontSize: 20,
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  jobDate: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    ...FONTS.semibold,
    fontSize: 12,
  },

  // ─── Banners ──────────────────────────────────────────────────────────────
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  cancelledText: {
    ...FONTS.medium,
    fontSize: 12,
    color: '#991b1b',
    flex: 1,
  },
  invoicedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    gap: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  invoicedText: {
    ...FONTS.medium,
    fontSize: 12,
    color: '#1d4ed8',
    flex: 1,
  },

  // ─── Summary Row ────────────────────────────────────────────────────────
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: SPACING.sm,
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    gap: 8,
  },
  summaryCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCardContent: {
    flex: 1,
  },
  summaryCardLabel: {
    ...FONTS.regular,
    fontSize: 10,
    color: COLORS.gray500,
  },
  summaryCardValue: {
    ...FONTS.bold,
    fontSize: 14,
    color: COLORS.gray900,
  },

  // ─── Status Section ──────────────────────────────────────────────────────
  statusSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusSectionTitle: {
    ...FONTS.semibold,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: SPACING.md,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  statusButtonDisabled: {
    opacity: 0.5,
  },
  statusButtonText: {
    ...FONTS.medium,
    fontSize: 11,
  },

  // ─── Detail Card ────────────────────────────────────────────────────────
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  // ─── Info Section ──────────────────────────────────────────────────────
  infoSection: {
    gap: 8,
  },
  infoSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoSectionTitle: {
    ...FONTS.bold,
    fontSize: 14,
    color: '#0f172a',
  },
  infoSectionContent: {
    gap: 2,
  },

  // ─── Detail Row ────────────────────────────────────────────────────────
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray600,
  },
  detailValue: {
    ...FONTS.medium,
    fontSize: 12,
    color: '#0f172a',
    maxWidth: '55%',
    textAlign: 'right',
  },

  // ─── Visual Issues ─────────────────────────────────────────────────────
  visualIssuesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  visualIssueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#ede9fe',
  },
  visualIssueText: {
    ...FONTS.medium,
    fontSize: 11,
    color: '#7c3aed',
  },

  // ─── Table ─────────────────────────────────────────────────────────────
  tableContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableHeaderText: {
    ...FONTS.semibold,
    fontSize: 11,
    color: COLORS.gray600,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableCell: {
    ...FONTS.regular,
    fontSize: 11,
    color: '#0f172a',
  },
  tableColName: { flex: 2 },
  tableColQty: { flex: 0.8, textAlign: 'center' },
  tableColRate: { flex: 1, textAlign: 'right' },
  tableColAmount: { flex: 1.2, textAlign: 'right' },
  tableColLabel: { flex: 1.5 },
  tableColDate2: { flex: 1.5, textAlign: 'right' },
  cellName: { ...FONTS.medium },
  cellQty: { textAlign: 'center' },
  cellRate: { textAlign: 'right' },
  cellAmount: { ...FONTS.semibold, color: '#059669', textAlign: 'right' },
  cellDate: { textAlign: 'right', color: COLORS.gray500 },

  // ─── Rebill History ────────────────────────────────────────────────────
  rebillItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  rebillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rebillNumber: {
    ...FONTS.semibold,
    fontSize: 12,
    color: '#1e40af',
  },
  rebillDate: {
    ...FONTS.regular,
    fontSize: 10,
    color: COLORS.gray500,
  },
  rebillDetails: {
    gap: 2,
  },
  rebillText: {
    ...FONTS.regular,
    fontSize: 11,
    color: '#0f172a',
  },
  rebillRemarks: {
    ...FONTS.italic,
    fontSize: 10,
    color: COLORS.gray500,
  },
  rebillBy: {
    ...FONTS.regular,
    fontSize: 9,
    color: COLORS.gray400,
  },

  // ─── Action Buttons Row 1 ──────────────────────────────────────────────
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButton: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 56,
  },
  actionLabel: {
    ...FONTS.medium,
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 0.3,
  },

  // ─── Primary Action Buttons Row ────────────────────────────────────────
  primaryActionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: 10,
  },

  // ─── Primary Button Styles ──────────────────────────────────────────────
  primaryBtn: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    ...SHADOWS.small,
  },
  primaryBtnText: {
    ...FONTS.semibold,
    fontSize: 14,
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  primaryBtnTextDisabled: {
    ...FONTS.semibold,
    fontSize: 14,
    color: COLORS.gray500,
    letterSpacing: 0.3,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },

  // ─── Button Variants ────────────────────────────────────────────────────
  primaryEditBtn: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    backgroundColor: '#3b82f6',
    ...SHADOWS.small,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryInvoiceBtn: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    backgroundColor: '#8b5cf6',
    ...SHADOWS.small,
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryInvoicedBtn: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  primaryRebillBtn: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    backgroundColor: '#f59e0b',
    ...SHADOWS.small,
    shadowColor: '#f59e0b',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryCancelBtn: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    backgroundColor: '#ef4444',
    ...SHADOWS.small,
    shadowColor: '#ef4444',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#dc2626',
  },

  // ─── Modal ────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    width: '90%',
    maxWidth: 400,
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    ...FONTS.bold,
    fontSize: 18,
    color: '#0f172a',
  },
  modalJobNo: {
    ...FONTS.semibold,
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: SPACING.md,
  },
  modalWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  modalWarningText: {
    ...FONTS.regular,
    fontSize: 13,
    color: '#991b1b',
    flex: 1,
  },
  modalLabel: {
    ...FONTS.medium,
    fontSize: 14,
    color: '#334155',
    marginBottom: SPACING.xs,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: SPACING.md,
    ...FONTS.regular,
    fontSize: 14,
    color: '#0f172a',
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#f8fafc',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtnDisabled: {
    opacity: 0.5,
  },
  modalCancelBtn: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalCancelText: {
    ...FONTS.semibold,
    fontSize: 14,
    color: '#64748b',
  },
  modalConfirmBtn: {
    backgroundColor: '#ef4444',
  },
  modalConfirmText: {
    ...FONTS.semibold,
    fontSize: 14,
    color: COLORS.white,
  },
});

//++++++++++++++++++++++++++++++++++++++++++++++++
// // src/screens/jobsheet/JobDetailScreen.js
// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
//   Linking,
//   StyleSheet,
//   ActivityIndicator,
//   Modal,
//   TextInput,
// } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import {
//   Phone,
//   Mail,
//   FileText,
//   Receipt,
//   Edit,
//   Printer,
//   AlertCircle,
//   X,
//   AlertTriangle,
//   Lock,
//   Unlock,
//   Eye,
//   Download,
//   Send,
// } from 'lucide-react-native';
// import RNPrint from 'react-native-print';
// import {
//   fetchJobById,
//   cancelJob,
//   lockInvoice,
//   rebillJob
// } from '../../store/slices/jobSlice';
// import {
//   InfoRow,
//   StatusChip,
//   LoadingOverlay,
//   Button,
// } from '../../components/UI';
// import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
// import { useToast } from 'react-native-toast-notifications';
// import { useAuth } from '../../context/AuthContext';
// import RepairStepsTimeline from './RepairStepsTimeline';

// export default function JobDetailScreen() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const dispatch = useDispatch();
//   const toast = useToast();
//   const { user } = useAuth();
//   const { jobId } = route.params;

//   const [generating, setGenerating] = useState(false);
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [cancelRemarks, setCancelRemarks] = useState('');
//   const [cancelling, setCancelling] = useState(false);
//   const [rebilling, setRebilling] = useState(false);

//   const jobsList = useSelector(state => state.jobs.list);
//   const currentJobFromList = useMemo(
//     () => jobsList.find(job => job.id === jobId),
//     [jobsList, jobId],
//   );

//   const { currentJob: fetchedJob, loading } = useSelector(state => state.jobs);
//   const currentJob = currentJobFromList || fetchedJob;

//   useEffect(() => {
//     if (!currentJobFromList && jobId) {
//       dispatch(fetchJobById(jobId));
//     }
//   }, [jobId, currentJobFromList, dispatch]);

//   const displayMake = currentJob?.makeName || currentJob?.makeId || '-';
//   const displayModel = currentJob?.modelName || currentJob?.modelId || '-';
//   const displayEngineer = currentJob?.engineerName || currentJob?.engineerId || '-';

//   // ─── PDF Generation ──────────────────────────────────────────────────────
//   const generatePDFHTML = () => {
//     const val = (v) => (v && v !== 'NIL' && v !== 'N/A' ? v : 'N/A');
//     const total = Number(currentJob?.serviceCharges || 0) + Number(currentJob?.spareCharges || 0);
//     const formatDate = (dateStr) => {
//       if (!dateStr) return 'N/A';
//       return new Date(dateStr).toLocaleDateString('en-GB');
//     };

//     return `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Job Details - ${currentJob?.jobNo}</title>
//         <style>
//           @page { size: A4; margin: 10mm; }
//           * { margin: 0; padding: 0; box-sizing: border-box; }
//           body { font-family: 'Segoe UI', Arial, sans-serif; background: white; padding: 20px; }
//           .outer-border { border: 2px solid #000; padding: 20px; }
//           .header-section { border-bottom: 1px solid #000; padding-bottom: 12px; margin-bottom: 15px; text-align: center; }
//           .company-name { font-size: 18px; font-weight: bold; }
//           .company-address { font-size: 11px; color: #444; margin: 5px 0; }
//           .job-title { text-align: center; font-weight: bold; font-size: 16px; padding: 8px; border-bottom: 1px solid #000; margin-bottom: 15px; }
//           .two-col { display: flex; border-bottom: 1px solid #000; margin-bottom: 15px; }
//           .col-left { width: 50%; padding: 8px; border-right: 1px solid #000; }
//           .col-right { width: 50%; padding: 8px; }
//           .section-title { font-weight: bold; font-size: 12px; margin-bottom: 6px; }
//           .info-text { font-size: 10px; margin: 2px 0; }
//           .estimate-box { border: 2px dashed #333; padding: 12px; margin: 15px 0; background: #f9f9f9; }
//           .estimate-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 11px; }
//           .divider { border-top: 1px solid #ddd; margin: 8px 0; }
//           .total-row { font-weight: bold; }
//           .sign-row { display: flex; justify-content: space-between; margin-top: 30px; }
//           .sign-box { width: 30%; text-align: center; }
//           .sign-line { border-bottom: 1px solid #000; margin-bottom: 6px; height: 40px; }
//           .sign-label { font-size: 10px; font-weight: 600; }
//           .footer { text-align: center; margin-top: 15px; padding-top: 8px; border-top: 1px solid #ddd; font-size: 9px; }
//         </style>
//       </head>
//       <body>
//         <div class="outer-border">
//           <div class="header-section">
//             <div class="company-name">RADNUS COMMUNICATION</div>
//             <div class="company-address">
//               242, Sinnaya Plaza, MG Road, Puducherry - 605001<br />
//               Phone: 81222 73355 / 99409 73030<br />
//               Mon–Sat (10AM–7PM) | www.radnus.in
//             </div>
//           </div>
//           <div class="job-title">JOB DETAILS</div>
//           <div class="two-col">
//             <div class="col-left">
//               <div class="section-title">Customer Information</div>
//               <div class="info-text"><strong>Name:</strong> ${val(currentJob?.customerName)}</div>
//               <div class="info-text"><strong>Phone:</strong> ${val(currentJob?.contact)}</div>
//               <div class="info-text"><strong>Alt Contact:</strong> ${val(currentJob?.altContact)}</div>
//               <div class="info-text"><strong>Email:</strong> ${val(currentJob?.email)}</div>
//               <div class="info-text"><strong>Address:</strong> ${val(currentJob?.address)}</div>
//             </div>
//             <div class="col-right">
//               <div class="section-title">Job Information</div>
//               <div class="info-text"><strong>Job No:</strong> ${val(currentJob?.jobNo)}</div>
//               <div class="info-text"><strong>Status:</strong> ${val(currentJob?.status)}</div>
//               <div class="info-text"><strong>Saved Date:</strong> ${val(currentJob?.savedDate)}</div>
//               <div class="info-text"><strong>Delivered Date:</strong> ${formatDate(currentJob?.deliveredDate)}</div>
//               <div class="info-text"><strong>Engineer:</strong> ${val(displayEngineer)}</div>
//               <div class="info-text"><strong>Payment Mode:</strong> ${val(currentJob?.paymentMode)}</div>
//             </div>
//           </div>
//           <div class="two-col">
//             <div class="col-left">
//               <div class="section-title">Device Details</div>
//               <div class="info-text"><strong>Make:</strong> ${val(displayMake)}</div>
//               <div class="info-text"><strong>Model:</strong> ${val(displayModel)}</div>
//               <div class="info-text"><strong>IMEI:</strong> ${val(currentJob?.imei)}</div>
//               <div class="info-text"><strong>Warranty:</strong> ${val(currentJob?.warranty)}</div>
//             </div>
//             <div class="col-right">
//               <div class="section-title">Physical Condition</div>
//               <div class="info-text">${currentJob?.physicalConditions?.join(', ') || 'N/A'}</div>
//               <div class="section-title" style="margin-top:10px">Accessories</div>
//               <div class="info-text">${currentJob?.accessoriesReceived?.join(', ') || 'N/A'}</div>
//             </div>
//           </div>
//           <div class="estimate-box">
//             <div class="estimate-row"><span>Service Charge</span><span>₹ ${currentJob?.serviceCharges || 0}</span></div>
//             <div class="estimate-row"><span>Spare Charge</span><span>₹ ${currentJob?.spareCharges || 0}</span></div>
//             <div class="divider"></div>
//             <div class="estimate-row total-row"><span>Total Amount</span><span>₹ ${total}</span></div>
//           </div>
//           ${currentJob?.remarks ? `<div class="section-title">Remarks</div><div class="info-text" style="margin-bottom:15px">${currentJob.remarks}</div>` : ''}
//           <div class="sign-row">
//             <div class="sign-box"><div class="sign-line"></div><div class="sign-label">Customer Signature</div></div>
//             <div class="sign-box"><div class="sign-line"></div><div class="sign-label">For RADNUS</div></div>
//             <div class="sign-box"><div class="sign-line"></div><div class="sign-label">Authorized Signatory</div></div>
//           </div>
//           <div class="footer">This is a computer generated document</div>
//         </div>
//       </html>
//     `;
//   };

//   // ─── Handlers ─────────────────────────────────────────────────────────────
//   const handlePDF = async () => {
//     if (!currentJob) { toast.show('Job data not available', { type: 'danger' }); return; }
//     setGenerating(true);
//     try {
//       await RNPrint.print({ html: generatePDFHTML() });
//     } catch (error) {
//       toast.show('Failed to generate PDF', { type: 'danger' });
//     } finally {
//       setGenerating(false);
//     }
//   };

//   const handleEstimate = () => {
//     if (!currentJob?.id) { toast.show('Job data not available', { type: 'danger' }); return; }
//     navigation.navigate('JobSheet', { screen: 'EstimateBill', params: { id: currentJob.id } });
//   };

//   const handleInvoice = () => {
//     if (!currentJob?.id) { toast.show('Job data not available', { type: 'danger' }); return; }
//     navigation.navigate('JobSheet', { screen: 'InvoiceBill', params: { id: currentJob.id } });
//   };

//   const handleCall = () => {
//     if (currentJob?.contact) Linking.openURL(`tel:${currentJob.contact}`);
//     else toast.show('No contact number', { type: 'danger' });
//   };

//   const handleEmailContact = () => {
//     if (currentJob?.email) Linking.openURL(`mailto:${currentJob.email}`);
//     else toast.show('No email address', { type: 'danger' });
//   };

//   // ─── Cancel Handler ──────────────────────────────────────────────────────
//   const handleCancel = async () => {
//     if (!cancelRemarks.trim()) {
//       toast.show('Please enter cancel reason', { type: 'danger' });
//       return;
//     }
//     setCancelling(true);
//     try {
//       const username = user?.username || 'admin';
//       await dispatch(cancelJob({
//         id: currentJob.id,
//         cancelRemarks: cancelRemarks.trim(),
//         cancelledBy: username
//       })).unwrap();
//       setShowCancelModal(false);
//       setCancelRemarks('');
//       toast.show('Job Sheet Cancelled ✅', { type: 'success' });
//       dispatch(fetchJobById(currentJob.id));
//     } catch (err) {
//       toast.show(err.message || 'Cancel failed ❌', { type: 'danger' });
//     } finally {
//       setCancelling(false);
//     }
//   };

//   // ─── Rebill Handler ──────────────────────────────────────────────────────
//   const handleRebill = () => {
//     const rebillCount = (currentJob?.rebillHistory?.length || 0) + 1;
//     Alert.alert(
//       'Rebill Confirmation',
//       `This will:\n• Unlock the job sheet for editing\n• Clear current charges (Rebill #${rebillCount})\n• Set status back to "Received"\n• Save old invoice to rebill history\n\nProceed?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Proceed',
//           style: 'default',
//           onPress: async () => {
//             setRebilling(true);
//             try {
//               const username = user?.username || 'admin';
//               await dispatch(rebillJob({
//                 id: currentJob.id,
//                 rebilledBy: username
//               })).unwrap();
//               toast.show(`Rebill #${rebillCount} opened!`, { type: 'success' });
//               dispatch(fetchJobById(currentJob.id));
//             } catch (err) {
//               toast.show(err.message || 'Rebill failed ❌', { type: 'danger' });
//             } finally {
//               setRebilling(false);
//             }
//           }
//         }
//       ]
//     );
//   };

//   // ─── Invoice Lock Handler ──────────────────────────────────────────────
//   const handleLockInvoice = async () => {
//     Alert.alert(
//       'Generate Invoice',
//       'This will mark the job as invoiced and lock it from further edits.',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Generate',
//           style: 'default',
//           onPress: async () => {
//             try {
//               await dispatch(lockInvoice(currentJob.id)).unwrap();
//               toast.show('Invoice Generated Successfully 🔒', { type: 'success' });
//               dispatch(fetchJobById(currentJob.id));
//             } catch (err) {
//               toast.show(err.message || 'Invoice failed ❌', { type: 'danger' });
//             }
//           }
//         }
//       ]
//     );
//   };

//   // ─── Action Button Component ─────────────────────────────────────────────
//   const ActionButton = ({ icon: Icon, label, onPress, color, bgColor }) => (
//     <TouchableOpacity
//       style={[styles.actionButton, bgColor && { backgroundColor: bgColor }]}
//       onPress={onPress}
//       activeOpacity={0.7}
//       disabled={generating && (label === 'PDF')}
//     >
//       {generating && label === 'PDF' ? (
//         <ActivityIndicator size="small" color={color || COLORS.gray600} />
//       ) : (
//         <Icon size={22} color={color || COLORS.gray700} />
//       )}
//       <Text style={[styles.actionLabel, { color: color || COLORS.gray700 }]}>
//         {generating && label === 'PDF' ? 'Generating...' : label}
//       </Text>
//     </TouchableOpacity>
//   );

//   // ─── Primary Action Button Component ────────────────────────────────────
//   const PrimaryActionButton = ({
//     icon: Icon,
//     label,
//     onPress,
//     variant = 'primary',
//     disabled = false,
//     loading = false,
//   }) => {
//     const getStyles = () => {
//       switch (variant) {
//         case 'edit':
//           return {
//             container: styles.primaryEditBtn,
//             text: styles.primaryBtnText,
//             iconColor: COLORS.white,
//           };
//         case 'invoice':
//           return {
//             container: styles.primaryInvoiceBtn,
//             text: styles.primaryBtnText,
//             iconColor: COLORS.white,
//           };
//         case 'invoiced':
//           return {
//             container: styles.primaryInvoicedBtn,
//             text: styles.primaryBtnTextDisabled,
//             iconColor: COLORS.gray500,
//           };
//         case 'rebill':
//           return {
//             container: styles.primaryRebillBtn,
//             text: styles.primaryBtnText,
//             iconColor: COLORS.white,
//           };
//         case 'cancel':
//           return {
//             container: styles.primaryCancelBtn,
//             text: styles.primaryBtnText,
//             iconColor: COLORS.white,
//           };
//         default:
//           return {
//             container: styles.primaryBtn,
//             text: styles.primaryBtnText,
//             iconColor: COLORS.white,
//           };
//       }
//     };

//     const style = getStyles();

//     return (
//       <TouchableOpacity
//         style={[style.container, disabled && styles.primaryBtnDisabled]}
//         onPress={onPress}
//         activeOpacity={0.7}
//         disabled={disabled || loading}
//       >
//         {loading ? (
//           <ActivityIndicator size="small" color={COLORS.white} />
//         ) : (
//           <>
//             <Icon size={20} color={style.iconColor} />
//             <Text style={style.text}>{label}</Text>
//           </>
//         )}
//       </TouchableOpacity>
//     );
//   };

//   if (!currentJob && loading) {
//     return <View style={styles.loadingContainer}><LoadingOverlay visible={true} /></View>;
//   }

//   if (!currentJob && !loading) {
//     return (
//       <View style={styles.errorContainer}>
//         <Text style={styles.errorText}>Job not found</Text>
//         <Button title="Go Back" onPress={() => navigation.goBack()} style={styles.errorButton} />
//       </View>
//     );
//   }

//   const isCancelled = currentJob?.isCancelled;
//   const isInvoiced = currentJob?.isInvoiced;

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       {/* ─── Main Card ──────────────────────────────────────────────────────── */}
//       <View style={styles.detailCard}>
//         <View style={styles.jobHeader}>
//           <Text style={styles.jobNumber}>{currentJob?.jobNo}</Text>
//           <StatusChip status={currentJob?.status} />
//         </View>

//         {isCancelled && (
//           <View style={styles.cancelledBanner}>
//             <AlertCircle size={16} color="#991b1b" />
//             <Text style={styles.cancelledText}>
//               Cancelled — {currentJob?.cancelRemarks || 'No reason provided'}
//             </Text>
//           </View>
//         )}

//         {isInvoiced && !isCancelled && (
//           <View style={styles.invoicedBanner}>
//             <Lock size={16} color="#1d4ed8" />
//             <Text style={styles.invoicedText}>Invoiced — Locked</Text>
//           </View>
//         )}

//         <View style={styles.divider} />
//         <InfoRow label="Customer" value={currentJob?.customerName} />
//         <InfoRow label="Contact" value={currentJob?.contact} />
//         <InfoRow label="Alt Contact" value={currentJob?.altContact} />
//         <InfoRow label="Address" value={currentJob?.address} />
//         <InfoRow label="Email" value={currentJob?.email} />
//         <InfoRow label="Make / Model" value={`${displayMake} / ${displayModel}`} />
//         <InfoRow label="IMEI" value={currentJob?.imei} />
//         <InfoRow label="Warranty" value={currentJob?.warranty} />
//         <InfoRow label="Physical Condition" value={currentJob?.physicalConditions?.join(', ') || '-'} />
//         <InfoRow label="Accessories" value={currentJob?.accessoriesReceived?.join(', ') || '-'} />
//         <InfoRow label="Saved Date" value={currentJob?.savedDate} />
//         <InfoRow label="Delivered Date" value={currentJob?.deliveredDate ? new Date(currentJob.deliveredDate).toLocaleDateString() : '-'} />
//         <InfoRow label="Engineer" value={displayEngineer} />
//         <InfoRow label="Service Charges" value={`₹${currentJob?.serviceCharges || 0}`} />
//         <InfoRow label="Spare Charges" value={`₹${currentJob?.spareCharges || 0}`} />
//         <InfoRow label="Total Amount" value={`₹${Number(currentJob?.serviceCharges || 0) + Number(currentJob?.spareCharges || 0)}`} />
//         <InfoRow label="Payment Mode" value={currentJob?.paymentMode || '-'} />
//         <InfoRow label="Remarks" value={currentJob?.remarks || '-'} />
//       </View>

//       {/* ─── Repair Steps Timeline ────────────────────────────────────────── */}
//       {currentJob?.id && (
//         <RepairStepsTimeline jobId={currentJob.id} />
//       )}

//       {/* ─── Action Buttons Row 1 ──────────────────────────────────────────── */}
//       <View style={styles.actionContainer}>
//         <ActionButton
//           icon={Phone}
//           label="Call"
//           onPress={handleCall}
//           color="#22c55e"
//           bgColor="#f0fdf4"
//         />
//         <ActionButton
//           icon={Mail}
//           label="Email"
//           onPress={handleEmailContact}
//           color="#3b82f6"
//           bgColor="#eff6ff"
//         />
//         <ActionButton
//           icon={Printer}
//           label="PDF"
//           onPress={handlePDF}
//           color="#f59e0b"
//           bgColor="#fffbeb"
//         />
//         <ActionButton
//           icon={Receipt}
//           label="Invoice"
//           onPress={handleInvoice}
//           color="#8b5cf6"
//           bgColor="#f5f3ff"
//         />
//         <ActionButton
//           icon={FileText}
//           label="Estimate"
//           onPress={handleEstimate}
//           color="#06b6d4"
//           bgColor="#ecfeff"
//         />
//       </View>

//       {/* ─── Primary Action Buttons Row ───────────────────────────────────── */}
//       <View style={styles.primaryActionContainer}>
//         {/* Edit Button */}
//         {!isCancelled && !isInvoiced && (
//           <PrimaryActionButton
//             icon={Edit}
//             label="Edit Job"
//             onPress={() => navigation.navigate('JobSheetForm', { mode: 'edit', jobId: currentJob?.id })}
//             variant="edit"
//           />
//         )}

//         {/* Invoice Button */}
//         {!isCancelled && (
//           <PrimaryActionButton
//             icon={isInvoiced ? Lock : Receipt}
//             label={isInvoiced ? 'Invoiced' : 'Generate Invoice'}
//             onPress={handleLockInvoice}
//             variant={isInvoiced ? 'invoiced' : 'invoice'}
//             disabled={isInvoiced}
//           />
//         )}

//         {/* Rebill Button */}
//         {isInvoiced && !isCancelled && (
//           <PrimaryActionButton
//             icon={Unlock}
//             label={rebilling ? '...' : `Rebill #${(currentJob?.rebillHistory?.length || 0) + 1}`}
//             onPress={handleRebill}
//             variant="rebill"
//             loading={rebilling}
//             disabled={rebilling}
//           />
//         )}

//         {/* Cancel Button - Prominent Red */}
//         {!isCancelled && (
//           <PrimaryActionButton
//             icon={AlertTriangle}
//             label="Cancel Job"
//             onPress={() => setShowCancelModal(true)}
//             variant="cancel"
//           />
//         )}
//       </View>

//       {/* ─── Cancel Modal ──────────────────────────────────────────────────── */}
//       <Modal
//         visible={showCancelModal}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setShowCancelModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalCard}>
//             <View style={styles.modalHeader}>
//               <View style={styles.modalHeaderLeft}>
//                 <AlertTriangle size={24} color={COLORS.danger} />
//                 <Text style={styles.modalTitle}>Cancel Job Sheet</Text>
//               </View>
//               <TouchableOpacity onPress={() => setShowCancelModal(false)}>
//                 <X size={24} color={COLORS.gray600} />
//               </TouchableOpacity>
//             </View>

//             <Text style={styles.modalJobNo}>{currentJob?.jobNo}</Text>

//             <View style={styles.modalWarningBox}>
//               <AlertCircle size={20} color="#991b1b" />
//               <Text style={styles.modalWarningText}>
//                 Once cancelled, this job sheet cannot be edited or invoiced.
//               </Text>
//             </View>

//             <Text style={styles.modalLabel}>
//               Cancel Reason <Text style={{ color: COLORS.danger }}>*</Text>
//             </Text>
//             <TextInput
//               style={styles.modalInput}
//               multiline
//               numberOfLines={4}
//               placeholder="Enter reason for cancellation..."
//               placeholderTextColor={COLORS.gray400}
//               value={cancelRemarks}
//               onChangeText={setCancelRemarks}
//               autoFocus
//             />

//             <View style={styles.modalButtons}>
//               <TouchableOpacity
//                 style={[styles.modalBtn, styles.modalCancelBtn]}
//                 onPress={() => { setShowCancelModal(false); setCancelRemarks(''); }}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.modalCancelText}>Close</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[
//                   styles.modalBtn,
//                   styles.modalConfirmBtn,
//                   (!cancelRemarks.trim() || cancelling) && styles.modalBtnDisabled
//                 ]}
//                 onPress={handleCancel}
//                 disabled={!cancelRemarks.trim() || cancelling}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.modalConfirmText}>
//                   {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//     </ScrollView>
//   );
// }

// // ─── Styles ──────────────────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f1f5f9',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f1f5f9'
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f1f5f9',
//     padding: SPACING.xl
//   },
//   errorText: {
//     ...FONTS.medium,
//     fontSize: 16,
//     color: COLORS.gray600,
//     marginBottom: SPACING.lg
//   },
//   errorButton: { minWidth: 120 },

//   // ─── Detail Card ────────────────────────────────────────────────────────
//   detailCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 16,
//     margin: SPACING.lg,
//     padding: SPACING.lg,
//     ...SHADOWS.medium,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//   },
//   jobHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: SPACING.md
//   },
//   jobNumber: {
//     ...FONTS.bold,
//     fontSize: 20,
//     color: '#0f172a',
//     letterSpacing: 0.5,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#e2e8f0',
//     marginVertical: SPACING.md
//   },

//   // ─── Banners ──────────────────────────────────────────────────────────────
//   cancelledBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fee2e2',
//     padding: SPACING.sm,
//     paddingHorizontal: SPACING.md,
//     borderRadius: 8,
//     marginBottom: SPACING.sm,
//     gap: 8,
//     borderWidth: 1,
//     borderColor: '#fecaca',
//   },
//   cancelledText: {
//     ...FONTS.medium,
//     fontSize: 12,
//     color: '#991b1b',
//     flex: 1,
//   },
//   invoicedBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#dbeafe',
//     padding: SPACING.sm,
//     paddingHorizontal: SPACING.md,
//     borderRadius: 8,
//     marginBottom: SPACING.sm,
//     gap: 8,
//     borderWidth: 1,
//     borderColor: '#bfdbfe',
//   },
//   invoicedText: {
//     ...FONTS.medium,
//     fontSize: 12,
//     color: '#1d4ed8',
//     flex: 1,
//   },

//   // ─── Action Buttons Row 1 ──────────────────────────────────────────────
//   actionContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginHorizontal: SPACING.lg,
//     marginBottom: SPACING.md,
//     paddingVertical: SPACING.md,
//     backgroundColor: COLORS.white,
//     borderRadius: 16,
//     ...SHADOWS.small,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//   },
//   actionButton: {
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 6,
//     borderRadius: 10,
//     minWidth: 56,
//   },
//   actionLabel: {
//     ...FONTS.medium,
//     fontSize: 11,
//     marginTop: 4,
//     letterSpacing: 0.3,
//   },

//   // ─── Primary Action Buttons Row ────────────────────────────────────────
//   primaryActionContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginHorizontal: SPACING.lg,
//     marginBottom: SPACING.xl,
//     gap: 10,
//   },

//   // ─── Primary Button Styles ──────────────────────────────────────────────
//   primaryBtn: {
//     flex: 1,
//     minWidth: 100,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     gap: 8,
//     ...SHADOWS.small,
//   },
//   primaryBtnText: {
//     ...FONTS.semibold,
//     fontSize: 14,
//     color: COLORS.white,
//     letterSpacing: 0.3,
//   },
//   primaryBtnTextDisabled: {
//     ...FONTS.semibold,
//     fontSize: 14,
//     color: COLORS.gray500,
//     letterSpacing: 0.3,
//   },
//   primaryBtnDisabled: {
//     opacity: 0.6,
//   },

//   // ─── Button Variants ────────────────────────────────────────────────────
//   primaryEditBtn: {
//     flex: 1,
//     minWidth: 100,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     gap: 8,
//     backgroundColor: '#3b82f6',
//     ...SHADOWS.small,
//     shadowColor: '#3b82f6',
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   primaryInvoiceBtn: {
//     flex: 1,
//     minWidth: 100,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     gap: 8,
//     backgroundColor: '#8b5cf6',
//     ...SHADOWS.small,
//     shadowColor: '#8b5cf6',
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   primaryInvoicedBtn: {
//     flex: 1,
//     minWidth: 100,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     gap: 8,
//     backgroundColor: '#e2e8f0',
//     borderWidth: 1,
//     borderColor: '#cbd5e1',
//   },
//   primaryRebillBtn: {
//     flex: 1,
//     minWidth: 100,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     gap: 8,
//     backgroundColor: '#f59e0b',
//     ...SHADOWS.small,
//     shadowColor: '#f59e0b',
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   primaryCancelBtn: {
//     flex: 1,
//     minWidth: 100,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     gap: 8,
//     backgroundColor: '#ef4444',
//     ...SHADOWS.small,
//     shadowColor: '#ef4444',
//     shadowOpacity: 0.4,
//     shadowRadius: 10,
//     elevation: 5,
//     borderWidth: 1,
//     borderColor: '#dc2626',
//   },

//   // ─── Modal ────────────────────────────────────────────────────────────────
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(15,23,42,0.6)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 20,
//     padding: SPACING.lg,
//     width: '90%',
//     maxWidth: 400,
//     ...SHADOWS.large,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: SPACING.xs,
//   },
//   modalHeaderLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   modalTitle: {
//     ...FONTS.bold,
//     fontSize: 18,
//     color: '#0f172a',
//   },
//   modalJobNo: {
//     ...FONTS.semibold,
//     fontSize: 14,
//     color: '#3b82f6',
//     marginBottom: SPACING.md,
//   },
//   modalWarningBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fef2f2',
//     padding: SPACING.sm,
//     paddingHorizontal: SPACING.md,
//     borderRadius: 8,
//     marginBottom: SPACING.md,
//     gap: 8,
//     borderWidth: 1,
//     borderColor: '#fecaca',
//   },
//   modalWarningText: {
//     ...FONTS.regular,
//     fontSize: 13,
//     color: '#991b1b',
//     flex: 1,
//   },
//   modalLabel: {
//     ...FONTS.medium,
//     fontSize: 14,
//     color: '#334155',
//     marginBottom: SPACING.xs,
//   },
//   modalInput: {
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     borderRadius: 10,
//     padding: SPACING.md,
//     ...FONTS.regular,
//     fontSize: 14,
//     color: '#0f172a',
//     minHeight: 100,
//     textAlignVertical: 'top',
//     backgroundColor: '#f8fafc',
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     gap: SPACING.sm,
//     marginTop: SPACING.md,
//   },
//   modalBtn: {
//     flex: 1,
//     paddingVertical: SPACING.md,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   modalBtnDisabled: {
//     opacity: 0.5,
//   },
//   modalCancelBtn: {
//     backgroundColor: '#f1f5f9',
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//   },
//   modalCancelText: {
//     ...FONTS.semibold,
//     fontSize: 14,
//     color: '#64748b',
//   },
//   modalConfirmBtn: {
//     backgroundColor: '#ef4444',
//   },
//   modalConfirmText: {
//     ...FONTS.semibold,
//     fontSize: 14,
//     color: COLORS.white,
//   },
// });
