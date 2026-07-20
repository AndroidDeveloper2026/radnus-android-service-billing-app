  import { StyleSheet } from "react-native";

  const COLORS = {
  primary: '#dc2626',
  primaryLight: '#fef2f2',
  white: '#ffffff',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',
  success: '#10b981',
  successLight: '#f0fdf4',
  error: '#ef4444',
  errorLight: '#fef2f2',
  warning: '#f59e0b',
  warningLight: '#fffbeb',
  info: '#4b8cfd',
  infoLight: '#eff6ff',
  purple: '#7c3aed',
  pink: '#db2777',
  blue: '#6366f1',
  infotwo: '#cbddfc',
};

export default StyleSheet.create({ 
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  mainScrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
    paddingTop: 8,
  },

  // Summary Cards
  summaryScroll: {
    flexGrow: 0,
    marginVertical: 8,
  },
  summaryContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  summaryCard: {
    minWidth: 75,
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    marginRight: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryLabel: {
    fontSize: 8,
    color: COLORS.gray500,
    marginTop: 2,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },

  // Stale Jobs Button
  staleJobsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    marginHorizontal: 10,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fcd34d',
    gap: 10,
  },
  staleJobsButtonTextContainer: {
    flex: 1,
  },
  staleJobsButtonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
  },
  staleJobsButtonSubtitle: {
    fontSize: 10,
    color: '#b45309',
    marginTop: 1,
  },

  // Filter Section
  filterSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: COLORS.gray50,
    height: 38,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 4,
    fontSize: 12,
    color: COLORS.gray800,
    marginLeft: 6,
  },
  filterToggle: {
    padding: 8,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    position: 'relative',
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterToggleActive: {
    backgroundColor: COLORS.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 99,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  filterBadgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '700',
  },
  filtersGrid: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.gray200,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 5,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 10,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  chipTextActive: {
    color: COLORS.white,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    padding: 7,
    gap: 4,
    backgroundColor: COLORS.gray50,
  },
  dateButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  dateText: {
    fontSize: 10,
    color: COLORS.gray500,
  },
  dateTextActive: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  dateSeparator: {
    color: COLORS.gray400,
    fontSize: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  applyButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontWeight: '600',
    color: COLORS.white,
    fontSize: 11,
  },
  resetButton: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: COLORS.gray600,
    fontSize: 11,
    fontWeight: '500',
  },
  excelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: 8,
    paddingVertical: 7,
    marginTop: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  excelButtonText: {
    fontWeight: '600',
    color: COLORS.success,
    fontSize: 11,
  },

  // Tabs
  tabsScroll: {
    marginHorizontal: 10,
    marginBottom: 6,
    flexGrow: 0,
  },
  tabsContent: {
    paddingVertical: 4,
    flexDirection: 'row',
    gap: 5,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 0.5,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.gray600,
    marginLeft: 4,
  },
  activeTabText: {
    color: COLORS.white,
  },

  // Report Container
  reportContainer: {
    marginHorizontal: 10,
    marginBottom: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Report Header
  reportHeaderContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    backgroundColor: '#fafafa',
  },
  reportHeaderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  reportHeaderSubtitle: {
    fontSize: 11,
    color: COLORS.gray500,
    marginTop: 2,
  },
  totalDaysContainer: {
    marginTop: 4,
  },
  totalDaysLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.gray600,
  },
  totalRecordsContainer: {
    marginTop: 4,
  },
  totalRecordsLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.gray600,
  },
  totalTextContainer: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  totalText: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  totalTextBold: {
    fontWeight: '700',
    color: COLORS.gray800,
  },

  // Table Styles
  tableWrapper: {
    flex: 1,
    minHeight: 200,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray200,
    minHeight: 36,
    alignItems: 'center',
  },
  headerRow: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    minHeight: 40,
  },
  rowEven: {
    backgroundColor: COLORS.white,
  },
  rowOdd: {
    backgroundColor: '#fafafa',
  },

  tableHeaderCellContainer: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    minHeight: 40,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'left',
  },
  tableCellContainer: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    justifyContent: 'center',
    minHeight: 34,
  },
  tableCell: {
    fontSize: 10,
    color: COLORS.gray700,
  },
  boldCell: {
    fontWeight: '700',
    color: COLORS.gray900,
  },

  // Status Chip
  statusChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusChipText: {
    fontSize: 8,
    fontWeight: '500',
  },

  // Sub Total Styles (for Value Report)
  subTotalContainer: {
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  subTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subTotalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#212529',
  },
  subTotalValues: {
    flexDirection: 'row',
    gap: 20,
  },
  subTotalValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    minWidth: 70,
    textAlign: 'right',
  },
  subTotalBold: {
    fontWeight: '700',
    color: '#212529',
  },

  // Grand Total
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.primaryLight,
    borderTopWidth: 1,
    borderTopColor: '#fecaca',
  },
  grandTotalLabel: {
    fontWeight: '700',
    fontSize: 12,
    color: COLORS.gray800,
  },
  grandTotalValue: {
    fontWeight: '700',
    fontSize: 13,
    color: COLORS.primary,
  },

  // Engineer Group Styles
  engineerGroupContainer: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  engineerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    gap: 8,
  },
  engineerHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray700,
  },
  engineerJobCount: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray500,
  },
  subtotalRow: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#bbf7d0',
  },
  subtotalText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },

  // Rebill Header Styles
  rebillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f0f9ff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  rebillHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rebillHeaderTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e40af',
  },
  rebillStatsBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  rebillStatsBadgeText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#1e40af',
  },
  fullViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  fullViewButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Rebill Summary Grid
  rebillSummaryGrid: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
  },
  rebillSummaryCard: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  rebillSummaryLabel: {
    fontSize: 8,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  rebillSummaryValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray500,
  },
  emptySubText: {
    fontSize: 12,
    color: COLORS.gray400,
  },

  // Loader
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 10,
  },
  loaderText: {
    color: COLORS.gray500,
    fontSize: 13,
  },

});