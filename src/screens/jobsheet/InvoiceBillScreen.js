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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import RNPrint from 'react-native-print';
import ViewShot from 'react-native-view-shot';
import { Printer, Mail, ArrowLeft, Share2 } from 'lucide-react-native';
import { api } from '../../utils/api';
import RNFS from 'react-native-fs';
import styles from './EstimateBillStyle';

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
  // Holds the real logo as a base64 data-URI so RNPrint renders it correctly
  const [logoBase64, setLogoBase64] = useState('');

  useEffect(() => { fetchJob(); loadLogo(); }, [id]);

  // Resolve the bundled logo asset path and read it as base64
  const loadLogo = async () => {
    try {
      const asset = Image.resolveAssetSource(logo);
      let path = asset?.uri || '';
      if (path.startsWith('file://')) {
        path = path.replace('file://', '');
      } else if (!path.startsWith('/')) {
        const dest = `${RNFS.CachesDirectoryPath}/radnus_logo.png`;
        await RNFS.copyFileAssets('logo.png', dest).catch(() => {});
        path = dest;
      }
      const b64 = await RNFS.readFile(path, 'base64');
      setLogoBase64(`data:image/png;base64,${b64}`);
    } catch (e) {
      console.warn('Logo load failed:', e);
    }
  };

  const fetchJob = async () => {
    try {
      // api.getJobById returns resolved makeName/modelName/engineerName
      const job = await api.getJobById(id);
      setData(job);
    } catch (error) {
      Alert.alert('Error', 'Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const val = (v) => (v && v !== 'NIL' && v !== 'N/A' ? v : '-');

  // FIX: use resolved name fields
  const makeName  = data?.makeName  || data?.makeId  || '-';
  const modelName = data?.modelName || data?.modelId || '-';
  // engineerName not shown on invoice but kept for consistency

  const subTotal   = Number(data?.serviceCharges || 0) + Number(data?.spareCharges || 0);
  const grandTotal = subTotal;

  const paymentLabel =
    data?.paymentMode === 'Cash' ? 'CASH MEMO' :
    data?.paymentMode === 'UPI'  ? 'UPI BILL'  :
    data?.paymentMode === 'Card' ? 'CARD BILL' : 'BILL';

  const billDate = () => {
    const d = new Date();
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  const faults = data?.physicalConditions?.filter(f => f && f !== 'NIL').join(', ') || '-';

  // ─── HTML matching reference Image 1 ──────────────────────────────────────
  const generateInvoiceHTML = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice - ${data?.jobNo}</title>
      <style>
        @page { size: A4; margin: 12mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #111; background: #fff; }

        .page { border: 2px solid #000; padding: 14px 16px; min-height: 270mm; position: relative; }

        /* Watermark */
        .watermark {
          position: fixed; top: 46%; left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.05; font-size: 120px; font-weight: bold;
          white-space: nowrap; pointer-events: none; color: #000;
        }

        /* Top strip: bill label left | contact right */
        .top-strip {
          display: flex; justify-content: space-between;
          align-items: flex-start; margin-bottom: 8px;
        }
        .bill-label { font-weight: 700; font-size: 12px; }
        .contact-block { text-align: right; font-size: 10px; line-height: 1.6; }

        /* Company center */
        .company-block { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 12px; }
        .logo-wrap { display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
        .logo-wrap img { height: 52px; width: auto; margin-right: 12px; }
        .company-name { font-size: 18px; font-weight: 800; letter-spacing: 1px; }
        .company-addr { font-size: 11px; color: #444; margin-top: 2px; }

        /* Customer / Bill info row */
        .info-row { display: flex; justify-content: space-between; margin-bottom: 14px; font-size: 11px; }
        .info-col table { border-collapse: collapse; }
        .info-col td { padding: 2px 4px; }
        .info-col td:first-child { font-weight: 600; white-space: nowrap; }

        /* Items table */
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; }
        .items-table th, .items-table td { border: 1px solid #000; padding: 6px 8px; text-align: center; }
        .items-table th { background: #f0f0f0; font-weight: 700; }

        /* Total */
        .total-section { text-align: right; font-size: 11px; margin-bottom: 16px; }
        .grand-total { font-weight: 700; font-size: 12px; }

        /* Terms */
        .terms-title { font-weight: 700; font-size: 11px; margin-bottom: 4px; margin-top: 14px; }
        .terms-box {
          border: 1px solid #ccc; border-radius: 4px;
          padding: 8px 10px; background: #fafafa;
          font-size: 9.5px; line-height: 1.55;
        }
        .terms-box ol { margin: 0; padding-left: 16px; }

        /* Signature */
        .signature { text-align: right; margin-top: 20px; font-size: 11px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="watermark">RADNUS</div>

        <!-- Top strip -->
        <div class="top-strip">
          <div class="bill-label">${paymentLabel} / BILL</div>
          <div class="contact-block">
            PHONE NO : 81222 73355 / 99409 73030 / 98944 36987<br>
            EMAIL : radnus@gmail.com<br>
            TIMINGS : 10 AM to 7 PM
          </div>
        </div>

        <!-- Company center block -->
        <div class="company-block">
          <div class="logo-wrap">
            <img src="${logoBase64 || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSI0MCIgZmlsbD0iI0VGNDQwMCIvPjx0ZXh0IHg9IjQwIiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI0OCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiPlI8L3RleHQ+PC9zdmc+'}" alt="logo" />
          </div>
          <div class="company-name">RADNUS COMMUNICATION</div>
          <div class="company-addr">242, Sinnaya Plaza, MG Road, Puducherry - 605001</div>
        </div>

        <!-- Customer & Bill info -->
        <div class="info-row">
          <div class="info-col">
            <table>
              <tr><td>Customer</td><td>:</td><td>${val(data?.customerName)}</td></tr>
              <tr><td>Contact</td><td>:</td><td>${val(data?.contact)}</td></tr>
              <tr><td>Address</td><td>:</td><td>${val(data?.address)}</td></tr>
            </table>
          </div>
          <div class="info-col">
            <table>
              <tr><td>Bill No</td><td>:</td><td>${val(data?.jobNo)}</td></tr>
              <tr><td>Bill Date</td><td>:</td><td>${billDate()}</td></tr>
            </table>
          </div>
        </div>

        <!-- Items table — FIX: show resolved make/model names -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width:18%">Make</th>
              <th style="width:18%">Model</th>
              <th style="width:22%">IMEI</th>
              <th style="width:27%">Fault</th>
              <th style="width:15%">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${val(makeName)}</td>
              <td>${val(modelName)}</td>
              <td>${val(data?.imei)}</td>
              <td>${faults}</td>
              <td>₹ ${grandTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <!-- Total -->
        <div class="total-section">
          <div>Sub Total : ₹${subTotal}</div>
          <div class="grand-total">Grand Total : ₹${grandTotal.toFixed(2)}</div>
        </div>

        <!-- Terms & Conditions (English) -->
        <div class="terms-title">TERMS &amp; CONDITIONS</div>
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

        <!-- Terms (Tamil) -->
        <div class="terms-title">விதிமுறைகள்</div>
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

        <div class="signature">Authorized Signature</div>
      </div>
    </body>
    </html>
  `;

  const handlePrint = async () => {
    setGenerating(true);
    try {
      await RNPrint.print({ html: generateInvoiceHTML() });
    } catch (error) {
      Alert.alert('Error', 'Failed to print');
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
        title: `Invoice - ${data?.jobNo}`,
        url: uri,
        message: `Invoice for ${data?.customerName}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share');
    } finally {
      setGenerating(false);
    }
  };

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
      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.95 }}>
          <View style={styles.invoiceContainer}>

            {/* Watermark */}
            <View style={styles.watermarkContainer} pointerEvents="none">
              <Text style={styles.watermark}>RADNUS</Text>
            </View>

            {/* Top strip */}
            <View style={styles.topStrip}>
              <Text style={styles.billLabel}>{paymentLabel} / BILL</Text>
              <View style={styles.contactBlock}>
                <Text style={styles.contactText}>PHONE NO : 81222 73355 / 99409 73030 / 98944 36987</Text>
                <Text style={styles.contactText}>EMAIL : radnus@gmail.com</Text>
                <Text style={styles.contactText}>TIMINGS : 10 AM to 7 PM</Text>
              </View>
            </View>

            {/* Company center */}
            <View style={styles.companyBlock}>
              <View style={styles.logoWrap}>
                <Image source={logo} style={styles.logoImage} resizeMode="contain" />
              </View>
              <Text style={styles.companyName}>RADNUS COMMUNICATION</Text>
              <Text style={styles.companyAddr}>242, Sinnaya Plaza, MG Road, Puducherry - 605001</Text>
            </View>

            {/* Customer & Bill info */}
            <View style={styles.infoRow}>
              <View>
                <Text style={styles.infoLine}><Text style={styles.infoKey}>Customer  </Text>: {val(data.customerName)}</Text>
                <Text style={styles.infoLine}><Text style={styles.infoKey}>Contact    </Text>: {val(data.contact)}</Text>
                <Text style={styles.infoLine}><Text style={styles.infoKey}>Address   </Text>: {val(data.address)}</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoLine}><Text style={styles.infoKey}>Bill No    </Text>: {val(data.jobNo)}</Text>
                <Text style={styles.infoLine}><Text style={styles.infoKey}>Bill Date </Text>: {billDate()}</Text>
              </View>
            </View>

            {/* Items table — FIX: resolved make/model names */}
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.makeCol, styles.tableHead]}>Make</Text>
                <Text style={[styles.tableCell, styles.modelCol, styles.tableHead]}>Model</Text>
                <Text style={[styles.tableCell, styles.imeiCol, styles.tableHead]}>IMEI</Text>
                <Text style={[styles.tableCell, styles.faultCol, styles.tableHead]}>Fault</Text>
                <Text style={[styles.tableCell, styles.totalCol, styles.tableHead, { borderRightWidth: 0 }]}>Total</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.makeCol]}>{val(makeName)}</Text>
                <Text style={[styles.tableCell, styles.modelCol]}>{val(modelName)}</Text>
                <Text style={[styles.tableCell, styles.imeiCol]}>{val(data.imei)}</Text>
                <Text style={[styles.tableCell, styles.faultCol]}>{faults}</Text>
                <Text style={[styles.tableCell, styles.totalCol, { borderRightWidth: 0 }]}>₹ {grandTotal.toFixed(2)}</Text>
              </View>
            </View>

            {/* Totals */}
            <View style={styles.totalSection}>
              <Text style={styles.subTotal}>Sub Total : ₹{subTotal}</Text>
              <Text style={styles.grandTotal}>Grand Total : ₹{grandTotal.toFixed(2)}</Text>
            </View>

            {/* Terms English */}
            <Text style={styles.termsTitle}>TERMS &amp; CONDITIONS</Text>
            <View style={styles.termsBox}>
              {[
                'Replaced parts will not be returned.',
                'Data may be lost during repair/software upgradation.',
                'Company bears no responsibility, whatsoever if equipment is not collected within 45 days from the date of receipt.',
                'Please make sure that you have removed your sim card and/or memory card from your phone.',
                'No delivery will be made without the customer\'s copy of the job order.',
                'Company bears no responsibility, if any fault occurs on additional fault findings while servicing on booked complaints.',
                'Only checking warranty for all services and spares used.',
              ].map((t, i) => (
                <Text key={i} style={styles.termItem}>{i + 1}. {t}</Text>
              ))}
            </View>

            {/* Terms Tamil */}
            <Text style={[styles.termsTitle, { marginTop: 10 }]}>விதிமுறைகள்</Text>
            <View style={styles.termsBox}>
              {[
                'மாற்றப்பட்ட உதிரிப்பாகங்கள் திருப்பி வழங்கப்படமாட்டாது.',
                'பழுது பார்க்கும்போது / சாப்ட்வேர் அப்டேட் செய்யும் போது தகவல்கள் இழக்க நேரிடலாம்.',
                'பெறப்பட்ட நாளிலிருந்து 45 நாட்களுக்குள் பொருள் பெறப்படாவிட்டால் நிறுவனம் பொறுப்பல்ல.',
                'தயவுசெய்து உங்கள் சிம் கார்டு மற்றும் மெமரி கார்டை அகற்றி வழங்கவும்.',
                'வேலை ஒப்பந்த நகல் இல்லாமல் பொருள் வழங்கப்படமாட்டாது.',
                'சரிசெய்யும் போது புதிய குறைகள் ஏற்பட்டால் நிறுவனம் பொறுப்பல்ல.',
                'சேவை மற்றும் உதிரிப்பாகங்களுக்கு மட்டுமே உத்தரவாதம் வழங்கப்படும்.',
              ].map((t, i) => (
                <Text key={i} style={styles.termItem}>{i + 1}. {t}</Text>
              ))}
            </View>

            <Text style={styles.signature}>Authorized Signature</Text>
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

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f5f7fa' },
//   header: {
//     flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
//     paddingHorizontal: 16, paddingVertical: 12,
//     backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
//   },
//   backIcon: { padding: 8 },
//   headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
//   scrollContent: { padding: 16, paddingBottom: 32 },

//   // Invoice card
//   invoiceContainer: {
//     backgroundColor: '#fff', borderWidth: 2, borderColor: '#000',
//     padding: 14, position: 'relative', overflow: 'hidden',
//   },
//   watermarkContainer: {
//     position: 'absolute', top: '42%', left: 0, right: 0,
//     alignItems: 'center', transform: [{ rotate: '-30deg' }],
//   },
//   watermark: { fontSize: 80, color: 'rgba(0,0,0,0.04)', fontWeight: 'bold' },

//   // Top strip
//   topStrip: {
//     flexDirection: 'row', justifyContent: 'space-between',
//     alignItems: 'flex-start', marginBottom: 8,
//   },
//   billLabel: { fontWeight: '700', fontSize: 12, color: '#111' },
//   contactBlock: { alignItems: 'flex-end' },
//   contactText: { fontSize: 9, color: '#333', lineHeight: 15 },

//   // Company block
//   companyBlock: {
//     alignItems: 'center', borderBottomWidth: 2,
//     borderBottomColor: '#000', paddingBottom: 10, marginBottom: 12,
//   },
//   logoWrap: { marginBottom: 4 },
//   logoImage: { width: 70, height: 52 },
//   companyName: { fontSize: 16, fontWeight: '800', letterSpacing: 1, color: '#111' },
//   companyAddr: { fontSize: 10, color: '#555', marginTop: 2 },

//   // Customer info
//   infoRow: {
//     flexDirection: 'row', justifyContent: 'space-between',
//     marginBottom: 14,
//   },
//   infoRight: { alignItems: 'flex-start' },
//   infoLine: { fontSize: 10, marginBottom: 3, color: '#111' },
//   infoKey: { fontWeight: '600' },

//   // Table
//   tableContainer: { borderWidth: 1, borderColor: '#000', marginBottom: 10 },
//   tableHeader: {
//     flexDirection: 'row', backgroundColor: '#f0f0f0',
//     borderBottomWidth: 1, borderBottomColor: '#000',
//   },
//   tableRow: { flexDirection: 'row' },
//   tableHead: { fontWeight: '700', backgroundColor: '#f0f0f0' },
//   tableCell: {
//     paddingVertical: 6, paddingHorizontal: 4,
//     fontSize: 10, textAlign: 'center',
//     borderRightWidth: 1, borderRightColor: '#000',
//   },
//   makeCol: { width: '18%' },
//   modelCol: { width: '18%' },
//   imeiCol: { width: '22%' },
//   faultCol: { width: '27%' },
//   totalCol: { width: '15%' },

//   // Totals
//   totalSection: { alignItems: 'flex-end', marginBottom: 14 },
//   subTotal: { fontSize: 11, color: '#333' },
//   grandTotal: { fontSize: 12, fontWeight: '700', color: '#111' },

//   // Terms
//   termsTitle: { fontWeight: '700', fontSize: 11, marginBottom: 4, color: '#111' },
//   termsBox: {
//     borderWidth: 1, borderColor: '#ccc', borderRadius: 4,
//     padding: 8, backgroundColor: '#fafafa', marginBottom: 2,
//   },
//   termItem: { fontSize: 9.5, lineHeight: 15, color: '#222' },

//   // Signature
//   signature: { textAlign: 'right', marginTop: 16, fontSize: 11, fontWeight: '600' },

//   // Buttons
//   actionButtons: { flexDirection: 'row', marginTop: 16, gap: 10 },
//   actionButton: {
//     flex: 1, flexDirection: 'row', alignItems: 'center',
//     justifyContent: 'center', backgroundColor: '#EF4444',
//     paddingVertical: 12, borderRadius: 8, gap: 8,
//   },
//   printButton: { backgroundColor: '#374151' },
//   emailButton: { backgroundColor: '#2563EB' },
//   actionText: { fontSize: 13, fontWeight: '600', color: '#fff' },

//   center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//   loadingText: { marginTop: 12, color: '#666' },
//   errorText: { fontSize: 16, color: '#EF4444', marginBottom: 16 },
//   backButton: { backgroundColor: '#EF4444', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
//   backButtonText: { color: '#fff', fontWeight: '600' },
// });