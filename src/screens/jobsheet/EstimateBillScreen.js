// src/screens/jobsheet/EstimateBillScreen.js
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
  Platform,
  Share,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import RNPrint from 'react-native-print';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import ViewShot from 'react-native-view-shot';
import { Share2, Printer, Mail, ArrowLeft, FileText } from 'lucide-react-native';
import { api } from '../../utils/api';
import RNFS from 'react-native-fs';

// Import your logo - place logo.png in src/assets/
const logo = require('../../assets/logo.png');

export default function EstimateBillScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  const viewShotRef = useRef(null);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const job = await api.getJobById(id);
      setData(job);
    } catch (error) {
      console.error('Estimate fetch error:', error);
      Alert.alert('Error', 'Failed to load estimate details');
    } finally {
      setLoading(false);
    }
  };

  const val = (v) => (v && v !== 'NIL' ? v : 'N/A');

  const total =
    Number(data?.serviceCharges || 0) +
    Number(data?.spareCharges || 0);

  // Generate HTML for PDF and Print
  const generateHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Estimate - ${data?.jobNo}</title>
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
            margin: 0;
            font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            background: #f5f7fa;
          }
          .wrapper {
            display: flex;
            justify-content: center;
            padding: 30px 0;
          }
          .a4 {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            box-sizing: border-box;
            background: #fff;
            box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            border-radius: 8px;
            position: relative;
          }
          .watermark {
            position: absolute;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 90px;
            color: rgba(0,0,0,0.04);
            font-weight: bold;
            white-space: nowrap;
          }
          .header {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
            border-bottom: 2px solid #222;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .company {
            font-size: 18px;
            font-weight: 700;
          }
          .sub {
            font-size: 12px;
            line-height: 1.6;
            color: #444;
            margin-top: 8px;
          }
          .logo-box {
            text-align: center;
          }
          .logo-box img {
            height: 60px;
            width: 60px;
            border-radius: 30px;
            object-fit: cover;
          }
          .job-box {
            justify-self: end;
          }
          .job-title {
            text-align: center;
            font-weight: 700;
            margin-bottom: 6px;
            font-size: 14px;
          }
          .job-box table {
            font-size: 12px;
            border-collapse: collapse;
            width: 100%;
          }
          .job-box td {
            padding: 2px 6px;
          }
          .section {
            margin-bottom: 18px;
          }
          .section-title {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #222;
            border-left: 4px solid #EF4444;
            padding-left: 8px;
            text-transform: uppercase;
          }
          .box {
            border: 1px solid #ddd;
            padding: 12px;
            border-radius: 8px;
            font-size: 13px;
            background: #fafafa;
            line-height: 1.8;
          }
          .grid {
            display: flex;
            gap: 15px;
          }
          .grid > div {
            flex: 1;
          }
          .estimate-box {
            border: 2px dashed #333;
            padding: 15px;
            font-size: 14px;
            background: #f9f9f9;
            border-radius: 8px;
          }
          .estimate-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .estimate-divider {
            border-top: 1px solid #ddd;
            margin: 10px 0;
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
            height: 50px;
            border-bottom: 1px solid #000;
            margin-bottom: 6px;
          }
          .sign-label {
            font-size: 12px;
            font-weight: 600;
          }
          .remarks-text {
            border: 1px solid #d0d0d0;
            border-left: 4px solid #333;
            border-radius: 4px;
            padding: 12px 16px;
            background: #f9f9f9;
            font-size: 13px;
            line-height: 1.7;
            color: #222;
          }
          @media print {
            body {
              background: #fff;
            }
            .wrapper {
              padding: 0;
            }
            .a4 {
              height: 297mm;
              overflow: hidden;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="a4">
            <div class="watermark">RADNUS</div>

            <!-- HEADER -->
            <div class="header">
              <div>
                <div class="company">RADNUS COMMUNICATION</div>
                <div class="sub">
                  242, Sinnaya Plaza, MG Road,<br />
                  Puducherry - 605001<br />
                  Phone: 81222 73355 / 99409 73030<br />
                  Mon–Sat (10AM–7PM)<br />
                  Website: www.radnus.in
                </div>
              </div>
              <div class="logo-box">
                <div style="width:60px;height:60px;background:#EF4444;border-radius:30px;display:flex;align-items:center;justify-content:center;color:white;font-size:28px;font-weight:bold;margin:0 auto;">R</div>
              </div>
              <div class="job-box">
                <div class="job-title">JOB SHEET</div>
                <table>
                  <tbody>
                    <tr><td><b>Job No</b></td><td>:</td><td>${val(data?.jobNo)}</td></tr>
                    <tr><td><b>Created</b></td><td>:</td><td>${val(data?.savedDate)}</td></tr>
                    <tr><td><b>Delivery</b></td><td>:</td><td>${val(data?.deliveredDate?.split('T')[0])}</td></tr>
                    <tr><td><b>Engineer</b></td><td>:</td><td>${val(data?.engineerId)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- CUSTOMER + DEVICE -->
            <div class="grid section">
              <div>
                <div class="section-title">Customer</div>
                <div class="box">
                  Name: ${val(data?.customerName)}<br />
                  Phone: ${val(data?.contact)}<br />
                  Email: ${val(data?.email)}<br />
                  Address: ${val(data?.address)}
                </div>
              </div>
              <div>
                <div class="section-title">Device</div>
                <div class="box">
                  Brand: ${val(data?.makeId)}<br />
                  Model: ${val(data?.modelId)}<br />
                  IMEI: ${val(data?.imei)}<br />
                  Fault: ${val(data?.physicalConditions?.join(', '))}
                </div>
              </div>
            </div>

            <!-- ESTIMATE -->
            <div class="section">
              <div class="section-title">Estimate Amount</div>
              <div class="estimate-box">
                <div class="estimate-row">
                  <span>Service Charge</span>
                  <span>₹ ${data?.serviceCharges || 0}</span>
                </div>
                <div class="estimate-row">
                  <span>Spare Charge</span>
                  <span>₹ ${data?.spareCharges || 0}</span>
                </div>
                <div class="estimate-divider"></div>
                <div class="estimate-row" style="font-weight: bold;">
                  <span>Total Estimate</span>
                  <span>₹ ${total}</span>
                </div>
              </div>
            </div>

            <!-- REMARKS -->
            ${data?.remarks ? `
            <div class="section">
              <div class="section-title">Remarks</div>
              <div class="remarks-text">${data.remarks}</div>
            </div>
            ` : ''}

            <!-- SIGNATURES -->
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
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Generate and save PDF
  const generatePDF = async () => {
    setGenerating(true);
    try {
      const html = generateHTML();
      const options = {
        html,
        fileName: `Estimate_${data?.jobNo}`,
        directory: 'Documents',
      };
      const file = await RNHTMLtoPDF.convert(options);
      if (file.filePath) {
        return file.filePath;
      }
      return null;
    } catch (error) {
      console.error('PDF generation error:', error);
      Alert.alert('Error', 'Failed to generate PDF');
      return null;
    } finally {
      setGenerating(false);
    }
  };

  // Print
  const handlePrint = async () => {
    setGenerating(true);
    try {
      const html = generateHTML();
      await RNPrint.print({ html });
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Error', 'Failed to print. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Share as PDF
  const handleSharePDF = async () => {
    setGenerating(true);
    try {
      const filePath = await generatePDF();
      if (filePath) {
        await Share.share({
          title: `Estimate_${data?.jobNo}.pdf`,
          url: `file://${filePath}`,
          message: `Estimate for ${data?.customerName}`,
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share PDF');
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
        title: `Estimate - ${data?.jobNo}`,
        url: uri,
        message: `Estimate for ${data?.customerName}`,
      });
    } catch (error) {
      console.error('Share image error:', error);
      Alert.alert('Error', 'Failed to capture or share');
    } finally {
      setGenerating(false);
    }
  };

  // Send email via backend
  const handleEmail = async () => {
    if (!data?.email || data?.email === 'N/A') {
      Alert.alert('No Email', 'Customer email address not available');
      return;
    }
    setSending(true);
    try {
      const API_BASE_URL = 'https://your-backend-url.com'; // Replace with your API URL
      await axios.post(`${API_BASE_URL}/api/jobsheets/send-estimate/${id}`);
      Alert.alert('Success', 'Estimate email sent successfully ✅');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>Loading estimate...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Estimate not found</Text>
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
        <Text style={styles.headerTitle}>Estimate Bill</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Bill Content for ViewShot */}
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
          <View style={styles.billContainer}>
            <View style={styles.watermarkContainer}>
              <Text style={styles.watermark}>RADNUS</Text>
            </View>

            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.companySection}>
                <Text style={styles.companyName}>RADNUS COMMUNICATION</Text>
                <Text style={styles.companyAddress}>
                  242, Sinnaya Plaza, MG Road,{'\n'}
                  Puducherry - 605001{'\n'}
                  Phone: 81222 73355 / 99409 73030{'\n'}
                  Mon–Sat (10AM–7PM){'\n'}
                  Website: www.radnus.in
                </Text>
              </View>
              <View style={styles.logoBox}>
                <Image source={logo} style={styles.logoImage} />
              </View>
              <View style={styles.jobBox}>
                <Text style={styles.jobTitle}>JOB SHEET</Text>
                <View style={styles.jobDetails}>
                  <Text><Text style={styles.jobLabel}>Job No:</Text> {val(data.jobNo)}</Text>
                  <Text><Text style={styles.jobLabel}>Created:</Text> {val(data.savedDate)}</Text>
                  <Text><Text style={styles.jobLabel}>Delivery:</Text> {val(data.deliveredDate?.split('T')[0])}</Text>
                  <Text><Text style={styles.jobLabel}>Engineer:</Text> {val(data.engineerId)}</Text>
                </View>
              </View>
            </View>

            {/* Customer & Device */}
            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <Text style={styles.sectionTitle}>Customer</Text>
                <View style={styles.infoBox}>
                  <Text>Name: {val(data.customerName)}</Text>
                  <Text>Phone: {val(data.contact)}</Text>
                  <Text>Email: {val(data.email)}</Text>
                  <Text>Address: {val(data.address)}</Text>
                </View>
              </View>
              <View style={styles.column}>
                <Text style={styles.sectionTitle}>Device</Text>
                <View style={styles.infoBox}>
                  <Text>Brand: {val(data.makeId)}</Text>
                  <Text>Model: {val(data.modelId)}</Text>
                  <Text>IMEI: {val(data.imei)}</Text>
                  <Text>Fault: {val(data.physicalConditions?.join(', '))}</Text>
                </View>
              </View>
            </View>

            {/* Estimate Amount */}
            <View>
              <Text style={styles.sectionTitle}>Estimate Amount</Text>
              <View style={styles.estimateBox}>
                <View style={styles.estimateRow}>
                  <Text>Service Charge</Text>
                  <Text>₹ {data.serviceCharges || 0}</Text>
                </View>
                <View style={styles.estimateRow}>
                  <Text>Spare Charge</Text>
                  <Text>₹ {data.spareCharges || 0}</Text>
                </View>
                <View style={styles.divider} />
                <View style={[styles.estimateRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total Estimate</Text>
                  <Text style={styles.totalValue}>₹ {total}</Text>
                </View>
              </View>
            </View>

            {/* Remarks */}
            {data.remarks && (
              <View>
                <Text style={styles.sectionTitle}>Remarks</Text>
                <View style={styles.remarksBox}>
                  <Text style={styles.remarksText}>{data.remarks}</Text>
                </View>
              </View>
            )}

            {/* Signatures */}
            <View style={styles.signRow}>
              <View style={styles.signBox}>
                <View style={styles.signLine} />
                <Text style={styles.signLabel}>Customer Signature</Text>
              </View>
              <View style={styles.signBox}>
                <View style={styles.signLine} />
                <Text style={styles.signLabel}>For RADNUS</Text>
              </View>
              <View style={styles.signBox}>
                <View style={styles.signLine} />
                <Text style={styles.signLabel}>Authorized Signatory</Text>
              </View>
            </View>
          </View>
        </ViewShot>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShareImage} disabled={generating}>
            {generating ? <ActivityIndicator size="small" color="#fff" /> : <Share2 size={20} color="#fff" />}
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.printButton]} onPress={handlePrint} disabled={generating}>
            {generating ? <ActivityIndicator size="small" color="#fff" /> : <Printer size={20} color="#fff" />}
            <Text style={styles.actionText}>Print</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={[styles.actionButton, styles.pdfButton]} onPress={handleSharePDF} disabled={generating}>
            {generating ? <ActivityIndicator size="small" color="#fff" /> : <FileText size={20} color="#fff" />}
            <Text style={styles.actionText}>PDF</Text>
          </TouchableOpacity> */}
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
  billContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 700,
  },
  watermarkContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ rotate: '-30deg' }],
  },
  watermark: {
    fontSize: 80,
    color: 'rgba(0,0,0,0.03)',
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#222',
    paddingBottom: 12,
    marginBottom: 20,
  },
  companySection: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  companyAddress: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    lineHeight: 16,
  },
  logoBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  logoImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  jobBox: {
    alignItems: 'flex-end',
  },
  jobTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 4,
  },
  jobDetails: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
  },
  jobLabel: {
    fontWeight: '600',
  },
  twoColumn: {
    flexDirection: 'row',
    marginBottom: 18,
    gap: 15,
  },
  column: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    paddingLeft: 8,
    textTransform: 'uppercase',
  },
  infoBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fafafa',
    lineHeight: 22,
  },
  estimateBox: {
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginVertical: 10,
  },
  totalRow: {
    marginTop: 5,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#EF4444',
  },
  remarksBox: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderLeftWidth: 4,
    borderLeftColor: '#333',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  remarksText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#222',
  },
  signRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  signBox: {
    width: '30%',
    alignItems: 'center',
  },
  signLine: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 6,
    width: '100%',
  },
  signLabel: {
    fontSize: 11,
    fontWeight: '600',
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
  pdfButton: {
    backgroundColor: '#059669',
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