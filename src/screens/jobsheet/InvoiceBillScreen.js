// src/screens/jobsheet/InvoiceBillScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Share,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import RNPrint from 'react-native-print';
import ViewShot from 'react-native-view-shot';
import { Printer, Mail, ArrowLeft, Download } from 'lucide-react-native';
import { api } from '../../utils/api';

// Import your logo
const logo = require('../../assets/logo.png');

export default function InvoiceBillScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  const viewShotRef = useRef(null);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const job = await api.getJobById(id);
      setData(job);
    } catch (error) {
      console.error('Invoice fetch error:', error);
      Alert.alert('Error', 'Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const val = (v) => (v && v !== 'NIL' && v !== 'N/A' ? v : '-');

  const subTotal = (data?.serviceCharges || 0) + (data?.spareCharges || 0);
  const grandTotal = subTotal;

  const paymentLabel = 
    data?.paymentMode === 'Cash' ? 'CASH MEMO' :
    data?.paymentMode === 'UPI' ? 'UPI BILL' :
    data?.paymentMode === 'Card' ? 'CARD BILL' : 'BILL';

  const formatDate = () => {
    const date = new Date();
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  // Generate HTML for PDF and Print
  const generateInvoiceHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${data?.jobNo}</title>
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: white;
            padding: 0;
            margin: 0;
          }
          .invoice-container {
            width: 210mm;
            min-height: 297mm;
            padding: 15px 18px;
            border: 2px solid #000;
            position: relative;
            background: #fff;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.05;
            width: 300px;
            pointer-events: none;
          }
          /* Header Section */
          .header-section {
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
          }
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            font-size: 11px;
          }
          .bill-label {
            font-weight: bold;
            font-size: 12px;
          }
          .contact-info {
            text-align: right;
            font-size: 10px;
            line-height: 1.4;
          }
          .company-center {
            text-align: center;
            margin-top: 6px;
          }
          .company-logo {
            height: 45px;
            width: auto;
          }
          .company-name {
            font-size: 16px;
            font-weight: bold;
            margin: 4px 0;
            letter-spacing: 1px;
          }
          .company-address {
            font-size: 11px;
            margin: 0;
          }
          /* Info Section */
          .info-section {
            margin-top: 12px;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
          }
          .info-table {
            line-height: 1.6;
          }
          .info-table td {
            padding: 2px;
          }
          .info-label {
            font-weight: bold;
            width: 70px;
          }
          /* Items Table */
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 18px;
            font-size: 11px;
          }
          .items-table th {
            border: 1px solid #000;
            padding: 6px;
            background: #f3f3f3;
            font-weight: bold;
            text-align: center;
          }
          .items-table td {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
          }
          .total-section {
            text-align: right;
            margin-top: 8px;
            font-size: 11px;
          }
          .grand-total {
            font-weight: bold;
            font-size: 12px;
          }
          /* Terms Section */
          .terms-section {
            margin-top: 18px;
          }
          .terms-title {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 4px;
          }
          .terms-box {
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 8px 10px;
            background: #fafafa;
            font-size: 9px;
            line-height: 1.4;
          }
          .terms-box ol {
            margin: 0;
            padding-left: 16px;
          }
          .signature {
            text-align: right;
            margin-top: 18px;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Watermark -->
          <div class="watermark">RADNUS</div>

          <!-- Header Section -->
          <div class="header-section">
            <div class="header-top">
              <div class="bill-label">${paymentLabel} / BILL</div>
              <div class="contact-info">
                PHONE NO : 81222 73355 / 99409 73030 / 98944 36987<br />
                EMAIL : radnus@gmail.com<br />
                TIMINGS : 10 AM to 7 PM
              </div>
            </div>
            <div class="company-center">
              <div style="font-size: 28px; font-weight: bold; color: #EF4444;">R</div>
              <div class="company-name">RADNUS COMMUNICATION</div>
              <div class="company-address">242, Sinnaya Plaza, MG Road, Puducherry - 605001</div>
            </div>
          </div>

          <!-- Customer & Bill Info -->
          <div class="info-section">
            <table class="info-table">
              <tbody>
                <tr><td class="info-label">Customer</td><td>:</td><td>${val(data?.customerName)}</td></tr>
                <tr><td class="info-label">Contact</td><td>:</td><td>${val(data?.contact)}</td></tr>
                <tr><td class="info-label">Address</td><td>:</td><td>${val(data?.address)}</td></tr>
              </tbody>
            </table>
            <table class="info-table">
              <tbody>
                <tr><td class="info-label">Bill No</td><td>:</td><td>${val(data?.jobNo)}</td></tr>
                <tr><td class="info-label">Bill Date</td><td>:</td><td>${formatDate()}</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width:20%">Make</th>
                <th style="width:20%">Model</th>
                <th style="width:20%">IMEI</th>
                <th style="width:25%">Fault</th>
                <th style="width:15%">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${val(data?.makeId)}</td>
                <td>${val(data?.modelId)}</td>
                <td>${val(data?.imei)}</td>
                <td>${val(data?.physicalConditions?.join(', ') || '-')}</td>
                <td>₹ ${grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Total Section -->
          <div class="total-section">
            <div>Sub Total : ₹${subTotal}</div>
            <div class="grand-total">Grand Total : ₹${grandTotal.toFixed(2)}</div>
          </div>

          <!-- Terms & Conditions -->
          <div class="terms-section">
            <div class="terms-title">TERMS & CONDITIONS</div>
            <div class="terms-box">
              <ol>
                <li>Replaced parts will not be returned.</li>
                <li>Data may be lost during repair/software upgradation.</li>
                <li>Company bears no responsibility, whatsoever if equipment is not collected within 45 days from the date of receipt.</li>
                <li>Please make sure that you have removed your sim card and/or memory card from your phone. Gadget hub does not accept responsibility for loss of these items.</li>
                <li>No delivery will be made without the customer's copy of the job order.</li>
                <li>Company bears no responsibility, if any fault occurs on additional fault findings while servicing on booked complaints.</li>
                <li>Only checking warranty for all services and spares used.</li>
              </ol>
            </div>

            <!-- Tamil Terms -->
            <div class="terms-title" style="margin-top: 12px;">விதிமுறைகள்</div>
            <div class="terms-box">
              <ol>
                <li>மாற்றப்பட்ட உதிரிப்பாகங்கள் திருப்பி வழங்கப்படமாட்டாது.</li>
                <li>பழுது பார்க்கும்போது / சாப்ட்வேர் அப்டேட் செய்யும் போது தகவல்கள் இழக்க நேரிடலாம்.</li>
                <li>பெறப்பட்ட நாளிலிருந்து 45 நாட்களுக்குள் பொருள் பெறப்படாவிட்டால் நிறுவனம் பொறுப்பல்ல.</li>
                <li>தயவுசெய்து உங்கள் சிம் கார்டு மற்றும் மெமரி கார்டை அகற்றி வழங்கவும்.</li>
                <li>வேலை ஒப்பந்த நகல் இல்லாமல் பொருள் வழங்கப்படமாட்டாது.</li>
                <li>சரிசெய்யும் போது புதிய குறைகள் ஏற்பட்டால் நிறுவனம் பொறுப்பல்ல.</li>
                <li>சேவை மற்றும் உதிரிப்பாகங்களுக்கு மட்டுமே உத்தரவாதம் வழங்கப்படும்.</li>
              </ol>
            </div>
          </div>

          <!-- Signature -->
          <div class="signature">Authorized Signature</div>
        </div>
      </body>
      </html>
    `;
  };

  // Print Invoice
  const handlePrint = async () => {
    setGenerating(true);
    try {
      const html = generateInvoiceHTML();
      await RNPrint.print({ html });
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Error', 'Failed to print');
    } finally {
      setGenerating(false);
    }
  };

  // Share as Image
  const handleShareImage = async () => {
    if (!viewShotRef.current) return;
    setGenerating(true);
    try {
      const uri = await viewShotRef.current.capture();
      await Share.share({
        title: `Invoice - ${data?.jobNo}`,
        url: uri,
        message: `Invoice for ${data?.customerName}`,
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share');
    } finally {
      setGenerating(false);
    }
  };

  // Send Email
  const handleEmail = async () => {
    setSending(true);
    Alert.alert('Coming Soon', 'Email feature will be available soon');
    setSending(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>Loading invoice...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Invoice not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Invoice Content for Image Share */}
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
          <View style={styles.invoiceContainer}>
            {/* Header Section */}
            <View style={styles.headerBorder}>
              <View style={styles.headerTop}>
                <Text style={styles.billLabel}>{paymentLabel} / BILL</Text>
                <View>
                  <Text style={styles.contactText}>PHONE NO : 81222 73355 / 99409 73030 / 98944 36987</Text>
                  <Text style={styles.contactText}>EMAIL : radnus@gmail.com</Text>
                  <Text style={styles.contactText}>TIMINGS : 10 AM to 7 PM</Text>
                </View>
              </View>
              <View style={styles.companyCenter}>
                <Text style={styles.logoBig}>R</Text>
                <Text style={styles.companyName}>RADNUS COMMUNICATION</Text>
                <Text style={styles.companyAddress}>242, Sinnaya Plaza, MG Road, Puducherry - 605001</Text>
              </View>
            </View>

            {/* Customer & Bill Info */}
            <View style={styles.infoSection}>
              <View>
                <Text style={styles.infoText}><Text style={styles.infoLabel}>Customer</Text> : {val(data.customerName)}</Text>
                <Text style={styles.infoText}><Text style={styles.infoLabel}>Contact</Text> : {val(data.contact)}</Text>
                <Text style={styles.infoText}><Text style={styles.infoLabel}>Address</Text> : {val(data.address)}</Text>
              </View>
              <View>
                <Text style={styles.infoText}><Text style={styles.infoLabel}>Bill No</Text> : {val(data.jobNo)}</Text>
                <Text style={styles.infoText}><Text style={styles.infoLabel}>Bill Date</Text> : {formatDate()}</Text>
              </View>
            </View>

            {/* Items Table */}
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.makeCol]}>Make</Text>
                <Text style={[styles.tableCell, styles.modelCol]}>Model</Text>
                <Text style={[styles.tableCell, styles.imeiCol]}>IMEI</Text>
                <Text style={[styles.tableCell, styles.faultCol]}>Fault</Text>
                <Text style={[styles.tableCell, styles.totalCol]}>Total</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.makeCol]}>{val(data.makeId)}</Text>
                <Text style={[styles.tableCell, styles.modelCol]}>{val(data.modelId)}</Text>
                <Text style={[styles.tableCell, styles.imeiCol]}>{val(data.imei)}</Text>
                <Text style={[styles.tableCell, styles.faultCol]}>{val(data.physicalConditions?.join(', ') || '-')}</Text>
                <Text style={[styles.tableCell, styles.totalCol]}>₹ {grandTotal.toFixed(2)}</Text>
              </View>
            </View>

            {/* Total Section */}
            <View style={styles.totalSection}>
              <Text>Sub Total : ₹{subTotal}</Text>
              <Text style={styles.grandTotal}>Grand Total : ₹{grandTotal.toFixed(2)}</Text>
            </View>

            {/* Terms & Conditions */}
            <View style={styles.termsSection}>
              <Text style={styles.termsTitle}>TERMS & CONDITIONS</Text>
              <View style={styles.termsBox}>
                <Text>1. Replaced parts will not be returned.</Text>
                <Text>2. Data may be lost during repair/software upgradation.</Text>
                <Text>3. Company bears no responsibility, whatsoever if equipment is not collected within 45 days from the date of receipt.</Text>
                <Text>4. Please make sure that you have removed your sim card and/or memory card from your phone. Gadget hub does not accept responsibility for loss of these items.</Text>
                <Text>5. No delivery will be made without the customer's copy of the job order.</Text>
                <Text>6. Company bears no responsibility, if any fault occurs on additional fault findings while servicing on booked complaints.</Text>
                <Text>7. Only checking warranty for all services and spares used.</Text>
              </View>

              <Text style={[styles.termsTitle, { marginTop: 12 }]}>விதிமுறைகள்</Text>
              <View style={styles.termsBox}>
                <Text>1. மாற்றப்பட்ட உதிரிப்பாகங்கள் திருப்பி வழங்கப்படமாட்டாது.</Text>
                <Text>2. பழுது பார்க்கும்போது / சாப்ட்வேர் அப்டேட் செய்யும் போது தகவல்கள் இழக்க நேரிடலாம்.</Text>
                <Text>3. பெறப்பட்ட நாளிலிருந்து 45 நாட்களுக்குள் பொருள் பெறப்படாவிட்டால் நிறுவனம் பொறுப்பல்ல.</Text>
                <Text>4. தயவுசெய்து உங்கள் சிம் கார்டு மற்றும் மெமரி கார்டை அகற்றி வழங்கவும்.</Text>
                <Text>5. வேலை ஒப்பந்த நகல் இல்லாமல் பொருள் வழங்கப்படமாட்டாது.</Text>
                <Text>6. சரிசெய்யும் போது புதிய குறைகள் ஏற்பட்டால் நிறுவனம் பொறுப்பல்ல.</Text>
                <Text>7. சேவை மற்றும் உதிரிப்பாகங்களுக்கு மட்டுமே உத்தரவாதம் வழங்கப்படும்.</Text>
              </View>
            </View>

            {/* Signature */}
            <Text style={styles.signature}>Authorized Signature</Text>
          </View>
        </ViewShot>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShareImage} disabled={generating}>
            {generating ? <ActivityIndicator size="small" color="#fff" /> : <Download size={20} color="#fff" />}
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.printButton]} onPress={handlePrint} disabled={generating}>
            {generating ? <ActivityIndicator size="small" color="#fff" /> : <Printer size={20} color="#fff" />}
            <Text style={styles.actionText}>Print</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.emailButton]} onPress={handleEmail} disabled={sending}>
            {sending ? <ActivityIndicator size="small" color="#fff" /> : <Mail size={20} color="#fff" />}
            <Text style={styles.actionText}>Email</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  invoiceContainer: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    padding: 15,
    minHeight: 700,
  },
  headerBorder: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  billLabel: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  contactText: {
    fontSize: 9,
    textAlign: 'right',
  },
  companyCenter: {
    alignItems: 'center',
    marginTop: 4,
  },
  logoBig: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  companyAddress: {
    fontSize: 10,
    textAlign: 'center',
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  infoText: {
    fontSize: 10,
    marginBottom: 2,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 55,
  },
  tableContainer: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#000',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f3f3',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontSize: 10,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  makeCol: { width: '20%' },
  modelCol: { width: '20%' },
  imeiCol: { width: '20%' },
  faultCol: { width: '25%' },
  totalCol: { width: '15%' },
  totalSection: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  grandTotal: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  termsSection: {
    marginTop: 18,
  },
  termsTitle: {
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 4,
  },
  termsBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fafafa',
  },
  signature: {
    textAlign: 'right',
    marginTop: 18,
    fontSize: 11,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  printButton: {
    backgroundColor: '#374151',
  },
  emailButton: {
    backgroundColor: '#2563EB',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});