import { StyleSheet } from "react-native";
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';

export default StyleSheet.create({ 
    searchHeader: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDERS.radius.md,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.gray900,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tab: {
    marginRight: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.gray500,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  jobCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  jobNumber: {
    ...FONTS.bold,
    fontSize: 16,
    color: COLORS.gray900,
  },
  customerName: {
    ...FONTS.semibold,
    fontSize: 14,
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  contact: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  date: {
    ...FONTS.regular,
    fontSize: 11,
    color: COLORS.gray400,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },

});