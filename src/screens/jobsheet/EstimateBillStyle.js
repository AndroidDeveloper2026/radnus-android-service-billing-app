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

  billContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ rotate: '-30deg' }],
  },
  watermark: { fontSize: 80, color: 'rgba(0,0,0,0.04)', fontWeight: 'bold' },

  // Header row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: '#111',
    paddingBottom: 12,
    marginBottom: 18,
  },
  companySection: { flex: 1, paddingRight: 8 },
  companyName: { fontSize: 15, fontWeight: '800', color: '#111' },
  companyAddress: { fontSize: 10, color: '#555', marginTop: 4, lineHeight: 16 },
  logoBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  logoImage: { width: 70, height: 70 },
  jobBox: { flex: 1, alignItems: 'flex-end' },
  jobSheetLabel: {
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 6,
    color: '#111',
  },
  jobDetailsBox: { backgroundColor: '#f5f5f5', padding: 8, borderRadius: 6 },
  jobRow: { flexDirection: 'row', marginBottom: 2 },
  jobKey: { fontSize: 10, fontWeight: '600', width: 52 },
  jobColon: { fontSize: 10 },
  jobVal: { fontSize: 10, flex: 1 },

  // Section layout
  twoColumn: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  column: { flex: 1 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    paddingLeft: 8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 7,
    backgroundColor: '#fafafa',
  },
  infoText: { fontSize: 11, lineHeight: 20, color: '#222' },

  // Estimate
  estimateBox: {
    borderWidth: 2,
    borderColor: '#444',
    borderStyle: 'dashed',
    padding: 14,
    borderRadius: 7,
    backgroundColor: '#f9f9f9',
    marginBottom: 18,
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  estimateLabel: { fontSize: 12, color: '#333' },
  estimateValue: { fontSize: 12, color: '#333' },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd', marginVertical: 8 },
  totalLabel: { fontSize: 13, fontWeight: '700', color: '#111' },
  totalValue: { fontSize: 13, fontWeight: '700', color: '#EF4444' },

  // Remarks
  remarksBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderLeftWidth: 4,
    borderLeftColor: '#444',
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  remarksText: { fontSize: 11, lineHeight: 18, color: '#222' },

  // Signatures
  signRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
  },
  signBox: { width: '30%', alignItems: 'center' },
  signLine: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 6,
    width: '100%',
  },
  signLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },

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
