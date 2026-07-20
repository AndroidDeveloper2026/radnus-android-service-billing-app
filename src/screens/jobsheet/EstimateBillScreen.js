
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
  Share,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import RNPrint from 'react-native-print';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import ViewShot from 'react-native-view-shot';
import { Share2, Printer, Mail, ArrowLeft, FileText } from 'lucide-react-native';
import { api } from '../../utils/api';
import RNFS from 'react-native-fs';
import styles from './EstimateBillStyle';

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
  // Holds the real logo as a base64 data-URI so RNPrint renders it correctly
  const [logoBase64, setLogoBase64] = useState('');

  useEffect(() => { fetchJob(); loadLogo(); }, [id]);

  // Resolve the bundled logo asset path and read it as base64
  const loadLogo = async () => {
    try {
      // React Native resolves require() to an asset path we can read with RNFS
      const asset = Image.resolveAssetSource(logo);
      let path = asset?.uri || '';
      // On Android the uri may be an asset:// or file:// path
      if (path.startsWith('file://')) {
        path = path.replace('file://', '');
      } else if (path.startsWith('/')) {
        // already a filesystem path
      } else {
        // Fallback: copy from bundle to a temp file RNFS can read
        const dest = `${RNFS.CachesDirectoryPath}/radnus_logo.png`;
        await RNFS.copyFileAssets('logo.png', dest).catch(() => {});
        path = dest;
      }
      const b64 = await RNFS.readFile(path, 'base64');
      setLogoBase64(`data:image/png;base64,${b64}`);
    } catch (e) {
      // If reading fails, generateHTML falls back to the placeholder
      console.warn('Logo load failed:', e);
    }
  };

  const fetchJob = async () => {
    try {
      // api.getJobById now returns resolved makeName/modelName/engineerName
      const job = await api.getJobById(id);
      setData(job);
    } catch (error) {
      Alert.alert('Error', 'Failed to load estimate details');
    } finally {
      setLoading(false);
    }
  };

  const val = (v) => (v && v !== 'NIL' && v !== 'N/A' ? v : 'N/A');

  // FIX: use resolved name fields
  const makeName = data?.makeName || data?.makeId || 'N/A';
  const modelName = data?.modelName || data?.modelId || 'N/A';
  const engineerName = data?.engineerName || data?.engineerId || 'N/A';

  const total = Number(data?.serviceCharges || 0) + Number(data?.spareCharges || 0);

  // Generate HTML matching the reference image (Image 2)
  const generateHTML = () => {
    const faults = data?.physicalConditions?.filter(f => f && f !== 'NIL').join(', ') || 'N/A';
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Estimate - ${data?.jobNo}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; font-size: 11px; color: #222; }
          .page { position: relative; }
          .watermark {
            position: fixed; top: 45%; left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 100px; color: rgba(0,0,0,0.04);
            font-weight: bold; white-space: nowrap; pointer-events: none;
          }
          /* Header */
          .header {
            display: flex; align-items: center;
            border-bottom: 2px solid #111;
            padding-bottom: 12px; margin-bottom: 16px;
          }
          .header-left { flex: 1; }
          .company-name { font-size: 17px; font-weight: 800; letter-spacing: 0.5px; }
          .company-sub { font-size: 10px; color: #555; line-height: 1.7; margin-top: 4px; }
          .header-center { width: 90px; text-align: center; }
          .header-center img { width: 75px; height: 75px; object-fit: contain; }
          .header-right { flex: 1; text-align: right; }
          .job-sheet-label { font-weight: 700; font-size: 13px; margin-bottom: 6px; }
          .job-table { font-size: 11px; border-collapse: collapse; margin-left: auto; }
          .job-table td { padding: 2px 4px; }
          .job-table td:first-child { font-weight: 600; }
          .job-table td:nth-child(2) { padding: 2px 6px; }
          /* Sections */
          .grid { display: flex; gap: 14px; margin-bottom: 16px; }
          .grid > div { flex: 1; }
          .section-title {
            font-size: 12px; font-weight: 700; color: #111;
            border-left: 4px solid #EF4444; padding-left: 8px;
            text-transform: uppercase; margin-bottom: 8px;
          }
          .info-box {
            border: 1px solid #ddd; border-radius: 6px;
            padding: 10px 12px; background: #fafafa;
            font-size: 11px; line-height: 1.9;
          }
          /* Estimate */
          .estimate-box {
            border: 2px dashed #444; border-radius: 6px;
            padding: 14px; background: #f9f9f9;
            font-size: 12px; margin-bottom: 16px;
          }
          .est-row { display: flex; justify-content: space-between; padding: 4px 0; }
          .est-divider { border-top: 1px solid #ccc; margin: 8px 0; }
          .est-total { font-weight: 700; font-size: 13px; }
          .est-total-val { font-weight: 700; font-size: 13px; color: #EF4444; }
          /* Remarks */
          .remarks-box {
            border: 1px solid #ccc; border-left: 4px solid #333;
            border-radius: 4px; padding: 10px 14px;
            background: #f9f9f9; font-size: 11px;
            line-height: 1.7; margin-bottom: 16px;
          }
          /* Signatures */
          .sign-row { display: flex; justify-content: space-between; margin-top: 30px; }
          .sign-box { width: 28%; text-align: center; }
          .sign-line { height: 48px; border-bottom: 1px solid #000; margin-bottom: 6px; }
          .sign-label { font-size: 10px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="watermark">RADNUS</div>

          <div class="header">
            <div class="header-left">
              <div class="company-name">RADNUS COMMUNICATION</div>
              <div class="company-sub">
                242, Sinnaya Plaza, MG Road,<br>
                Puducherry - 605001<br>
                Phone: 81222 73355 / 99409 73030<br>
                98944 36987<br>
                Mon–Sat (10AM–7PM)<br>
                Website: www.radnus.in
              </div>
            </div>
            <div class="header-center">
              <img src="${logoBase64 || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSI0MCIgZmlsbD0iI0VGNDQwMCIvPjx0ZXh0IHg9IjQwIiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI0OCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiPlI8L3RleHQ+PC9zdmc+'}" alt="logo" />
            </div>
            <div class="header-right">
              <div class="job-sheet-label">JOB SHEET</div>
              <table class="job-table">
                <tr><td>Job No</td><td>:</td><td>${val(data?.jobNo)}</td></tr>
                <tr><td>Created</td><td>:</td><td>${val(data?.savedDate)}</td></tr>
                <tr><td>Delivery</td><td>:</td><td>${data?.deliveredDate ? data.deliveredDate.split('T')[0] : 'N/A'}</td></tr>
                <tr><td>Engineer</td><td>:</td><td>${val(engineerName)}</td></tr>
              </table>
            </div>
          </div>

          <div class="grid">
            <div>
              <div class="section-title">Customer</div>
              <div class="info-box">
                Name: ${val(data?.customerName)}<br>
                Phone: ${val(data?.contact)}<br>
                Email: ${val(data?.email)}<br>
                Address: ${val(data?.address)}
              </div>
            </div>
            <div>
              <div class="section-title">Device</div>
              <div class="info-box">
                Brand: ${val(makeName)}<br>
                Model: ${val(modelName)}<br>
                IMEI: ${data?.imei || 'N/A'}<br>
                Fault: ${faults}
              </div>
            </div>
          </div>

          <div class="section-title">Estimate Amount</div>
          <div class="estimate-box">
            <div class="est-row"><span>Service Charge</span><span>₹ ${data?.serviceCharges || 0}</span></div>
            <div class="est-row"><span>Spare Charge</span><span>₹ ${data?.spareCharges || 0}</span></div>
            <div class="est-divider"></div>
            <div class="est-row"><span class="est-total">Total Estimate</span><span class="est-total-val">₹ ${total}</span></div>
          </div>

          ${data?.remarks ? `
          <div class="section-title">Remarks</div>
          <div class="remarks-box">${data.remarks}</div>
          ` : ''}

          <div class="sign-row">
            <div class="sign-box"><div class="sign-line"></div><div class="sign-label">Customer Signature</div></div>
            <div class="sign-box"><div class="sign-line"></div><div class="sign-label">For RADNUS</div></div>
            <div class="sign-box"><div class="sign-line"></div><div class="sign-label">Authorized Signatory</div></div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const file = await RNHTMLtoPDF.convert({
        html: generateHTML(),
        fileName: `Estimate_${data?.jobNo}`,
        directory: 'Documents',
      });
      return file.filePath || null;
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = async () => {
    setGenerating(true);
    try {
      await RNPrint.print({ html: generateHTML() });
    } catch (error) {
      Alert.alert('Error', 'Failed to print. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

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
      Alert.alert('Error', 'Failed to share PDF');
    } finally {
      setGenerating(false);
    }
  };

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
      Alert.alert('Error', 'Failed to share');
    } finally {
      setGenerating(false);
    }
  };

  const handleEmail = async () => {
    if (!data?.email || data?.email === 'N/A') {
      Alert.alert('No Email', 'Customer email address not available');
      return;
    }
    Alert.alert('Coming Soon', 'Email feature will be available soon');
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

  const faults = data.physicalConditions?.filter(f => f && f !== 'NIL').join(', ') || 'N/A';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Estimate Bill</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.95 }}>
          <View style={styles.billContainer}>
            {/* Watermark */}
            <View style={styles.watermarkContainer} pointerEvents="none">
              <Text style={styles.watermark}>RADNUS</Text>
            </View>

            {/* Header Row */}
            <View style={styles.headerRow}>
              <View style={styles.companySection}>
                <Text style={styles.companyName}>RADNUS COMMUNICATION</Text>
                <Text style={styles.companyAddress}>
                  242, Sinnaya Plaza, MG Road,{'\n'}
                  Puducherry - 605001{'\n'}
                  Phone: 81222 73355 / 99409 73030{'\n'}
                  98944 36987{'\n'}
                  Mon–Sat (10AM–7PM){'\n'}
                  Website: www.radnus.in
                </Text>
              </View>
              <View style={styles.logoBox}>
                <Image source={logo} style={styles.logoImage} resizeMode="contain" />
              </View>
              <View style={styles.jobBox}>
                <Text style={styles.jobSheetLabel}>JOB SHEET</Text>
                <View style={styles.jobDetailsBox}>
                  <View style={styles.jobRow}>
                    <Text style={styles.jobKey}>Job No</Text>
                    <Text style={styles.jobColon}> : </Text>
                    <Text style={styles.jobVal}>{val(data.jobNo)}</Text>
                  </View>
                  <View style={styles.jobRow}>
                    <Text style={styles.jobKey}>Created</Text>
                    <Text style={styles.jobColon}> : </Text>
                    <Text style={styles.jobVal}>{val(data.savedDate)}</Text>
                  </View>
                  <View style={styles.jobRow}>
                    <Text style={styles.jobKey}>Delivery</Text>
                    <Text style={styles.jobColon}> : </Text>
                    <Text style={styles.jobVal}>{data.deliveredDate ? data.deliveredDate.split('T')[0] : 'N/A'}</Text>
                  </View>
                  {/* FIX: show resolved engineer name */}
                  <View style={styles.jobRow}>
                    <Text style={styles.jobKey}>Engineer</Text>
                    <Text style={styles.jobColon}> : </Text>
                    <Text style={styles.jobVal}>{val(engineerName)}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Customer & Device */}
            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <Text style={styles.sectionTitle}>Customer</Text>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>Name: {val(data.customerName)}</Text>
                  <Text style={styles.infoText}>Phone: {val(data.contact)}</Text>
                  <Text style={styles.infoText}>Email: {val(data.email)}</Text>
                  <Text style={styles.infoText}>Address: {val(data.address)}</Text>
                </View>
              </View>
              <View style={styles.column}>
                <Text style={styles.sectionTitle}>Device</Text>
                <View style={styles.infoBox}>
                  {/* FIX: use resolved name fields */}
                  <Text style={styles.infoText}>Brand: {val(makeName)}</Text>
                  <Text style={styles.infoText}>Model: {val(modelName)}</Text>
                  <Text style={styles.infoText}>IMEI: {data.imei || 'N/A'}</Text>
                  <Text style={styles.infoText}>Fault: {faults}</Text>
                </View>
              </View>
            </View>

            {/* Estimate Amount */}
            <Text style={styles.sectionTitle}>Estimate Amount</Text>
            <View style={styles.estimateBox}>
              <View style={styles.estimateRow}>
                <Text style={styles.estimateLabel}>Service Charge</Text>
                <Text style={styles.estimateValue}>₹ {data.serviceCharges || 0}</Text>
              </View>
              <View style={styles.estimateRow}>
                <Text style={styles.estimateLabel}>Spare Charge</Text>
                <Text style={styles.estimateValue}>₹ {data.spareCharges || 0}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.estimateRow}>
                <Text style={styles.totalLabel}>Total Estimate</Text>
                <Text style={styles.totalValue}>₹ {total}</Text>
              </View>
            </View>

            {/* Remarks */}
            {!!data.remarks && (
              <View style={{ marginBottom: 16 }}>
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
          <TouchableOpacity style={[styles.actionButton, styles.emailButton]} onPress={handleEmail} disabled={sending}>
            {sending ? <ActivityIndicator size="small" color="#fff" /> : <Mail size={20} color="#fff" />}
            <Text style={styles.actionText}>Email</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
