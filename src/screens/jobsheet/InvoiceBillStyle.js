import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
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
  backIcon: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  scrollContent: { padding: 16, paddingBottom: 32 },

  // Invoice card
  invoiceContainer: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkContainer: {
    position: 'absolute',
    top: '42%',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ rotate: '-30deg' }],
  },
  watermark: { fontSize: 80, color: 'rgba(0,0,0,0.04)', fontWeight: 'bold' },

  // Top strip
  topStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  billLabel: { fontWeight: '700', fontSize: 12, color: '#111' },
  contactBlock: { alignItems: 'flex-end' },
  contactText: { fontSize: 9, color: '#333', lineHeight: 15 },

  // Company block
  companyBlock: {
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
    marginBottom: 12,
  },
  logoWrap: { marginBottom: 4 },
  logoImage: { width: 70, height: 52 },
  companyName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#111',
  },
  companyAddr: { fontSize: 10, color: '#555', marginTop: 2 },

  // Customer info
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  infoRight: { alignItems: 'flex-start' },
  infoLine: { fontSize: 10, marginBottom: 3, color: '#111' },
  infoKey: { fontWeight: '600' },

  // Table
  tableContainer: { borderWidth: 1, borderColor: '#000', marginBottom: 10 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableRow: { flexDirection: 'row' },
  tableHead: { fontWeight: '700', backgroundColor: '#f0f0f0' },
  tableCell: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontSize: 10,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  makeCol: { width: '18%' },
  modelCol: { width: '18%' },
  imeiCol: { width: '22%' },
  faultCol: { width: '27%' },
  totalCol: { width: '15%' },

  // Totals
  totalSection: { alignItems: 'flex-end', marginBottom: 14 },
  subTotal: { fontSize: 11, color: '#333' },
  grandTotal: { fontSize: 12, fontWeight: '700', color: '#111' },

  // Terms
  termsTitle: {
    fontWeight: '700',
    fontSize: 11,
    marginBottom: 4,
    color: '#111',
  },
  termsBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fafafa',
    marginBottom: 2,
  },
  termItem: { fontSize: 9.5, lineHeight: 15, color: '#222' },

  // Signature
  signature: {
    textAlign: 'right',
    marginTop: 16,
    fontSize: 11,
    fontWeight: '600',
  },

  // Buttons
  actionButtons: { flexDirection: 'row', marginTop: 16, gap: 10 },
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
  printButton: { backgroundColor: '#374151' },
  emailButton: { backgroundColor: '#2563EB' },
  actionText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: { marginTop: 12, color: '#666' },
  errorText: { fontSize: 16, color: '#EF4444', marginBottom: 16 },
  backButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: { color: '#fff', fontWeight: '600' },
});
