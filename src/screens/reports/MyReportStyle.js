import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
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
  info: '#3b82f6',
  infoLight: '#eff6ff',
  purple: '#7c3aed',
  purpleLight: '#f3e8ff',
  pink: '#db2777',
  blue: '#6366f1',
  orange: '#f97316',
};

export default StyleSheet.create({   
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  backButton: {
    padding: 4,
  },
  exportButton: {
    padding: 6,
    backgroundColor: COLORS.successLight,
    borderRadius: 8,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.gray500,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
  },

  // Summary
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - 40) / 2 - 8,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  summaryLabel: {
    fontSize: 9,
    color: COLORS.gray500,
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },

  // Filter
  filterSection: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 13,
    color: COLORS.gray800,
    marginLeft: 6,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
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
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  searchButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 11,
  },
  clearButton: {
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    color: COLORS.gray600,
    fontSize: 11,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  viewToggleActive: {
    backgroundColor: COLORS.primary,
  },
  viewToggleText: {
    fontSize: 11,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  viewToggleTextActive: {
    color: COLORS.white,
  },
  excelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  excelButtonText: {
    fontWeight: '600',
    color: COLORS.success,
    fontSize: 11,
  },

  // Report Container
  reportContainer: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    overflow: 'hidden',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },

  // User Section
  userSection: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray200,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  userHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextSmall: {
    fontSize: 11,
    fontWeight: '600',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  userJobCount: {
    fontSize: 11,
    color: COLORS.gray500,
  },
  userHeaderStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userStatPill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  userStatPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  expandArrow: {
    fontSize: 12,
    color: COLORS.gray400,
  },

  userStatsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },
  userStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  userStatLabel: {
    fontSize: 9,
    color: COLORS.gray400,
  },
  userStatValue: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },

  // Expanded Jobs
  expandedJobs: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: '#fafafa',
  },
  jobRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  jobRowEven: {
    backgroundColor: COLORS.white,
  },
  jobRowOdd: {
    backgroundColor: '#f8fafc',
  },
  jobRowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  jobRowNo: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.blue,
    minWidth: 60,
  },
  jobRowCustomer: {
    fontSize: 12,
    color: COLORS.gray700,
    flex: 1,
  },
  jobRowTotal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '500',
  },

  // Dashboard View
  dashboardTable: {
    padding: 12,
  },
  dashboardTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  dashboardTableHeaderText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  dashboardTableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray100,
  },
  dashboardTableRowText: {
    fontSize: 11,
    color: COLORS.gray700,
  },
  dashboardGrandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  dashboardGrandTotalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  dashboardGrandTotalValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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

  // Error
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  rowEven: {
    backgroundColor: COLORS.white,
  },
  rowOdd: {
    backgroundColor: '#fafafa',
  },

  });