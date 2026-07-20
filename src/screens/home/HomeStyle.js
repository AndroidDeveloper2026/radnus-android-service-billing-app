import { StyleSheet } from "react-native";
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';

export default StyleSheet.create({ 
container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  greeting: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray500,
  },
  welcome: {
    ...FONTS.bold,
    fontSize: 24,
    color: COLORS.gray900,
    marginTop: 2,
  },
  headerBadge: {
    flexDirection: 'row', // ADDED to make it horizontal
    alignItems: 'center', // ADDED
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radius.md,
  },
  userAvatar: { // NEW STYLE
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  userInitials: { // NEW STYLE
    ...FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
  },
  headerBadgeText: {
    ...FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
  },
  sectionSubtitle: {
    ...FONTS.regular,
    fontSize: 13,
    color: COLORS.gray500,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statCardWrapper: {
    flex: 1,
    marginRight: SPACING.md,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.md,
    alignItems: 'center',
    // ...SHADOWS.small,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    ...FONTS.bold,
    fontSize: 24,
    color: COLORS.gray900,
  },
  statTitle: {
    ...FONTS.medium,
    fontSize: 11,
    color: COLORS.gray500,
    marginTop: 2,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDERS.radius.md,
    ...SHADOWS.medium,
  },
  quickActionText: {
    ...FONTS.semibold,
    fontSize: 16,
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
  recentSection: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: 18,
    color: COLORS.gray900,
  },
  viewAllLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    ...FONTS.medium,
    fontSize: 13,
    color: COLORS.primary,
    marginRight: 4,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  recentLeft: {
    flex: 1,
  },
  recentJobNo: {
    ...FONTS.semibold,
    fontSize: 14,
    color: COLORS.gray900,
    marginBottom: 2,
  },
  recentCustomer: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray500,
  },
  recentStatus: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDERS.radius.sm,
  },
  recentStatusText: {
    ...FONTS.medium,
    fontSize: 11,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xxxl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  footerText: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray400,
  },
  footerSubtext: {
    ...FONTS.regular,
    fontSize: 10,
    color: COLORS.gray300,
    marginTop: SPACING.xs,
  },
});