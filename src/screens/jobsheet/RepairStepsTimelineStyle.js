import { StyleSheet } from "react-native";
import { SPACING, FONTS,} from '../../utils/theme';

export default StyleSheet.create({ 
    container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
    flexWrap: 'wrap',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconText: {
    fontSize: 18,
  },
  cardTitle: {
    ...FONTS.bold,
    fontSize: 16,
    color: '#111827',
  },
  cardBody: {
    padding: 16,
  },
  progressPill: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  progressDone: {
    backgroundColor: '#D1FAE5',
  },
  progressPending: {
    backgroundColor: '#FEF3C7',
  },
  progressPillText: {
    ...FONTS.bold,
    fontSize: 13,
    color: '#065F46',
  },
  refreshButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  refreshButtonText: {
    ...FONTS.semibold,
    fontSize: 13,
    color: '#6B7280',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    ...FONTS.medium,
    fontSize: 13,
    color: '#6B7280',
  },
  progressPercent: {
    ...FONTS.bold,
    fontSize: 14,
  },
  progressPercentDone: {
    color: '#065F46',
  },
  progressPercentPending: {
    color: '#92400E',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
    transition: 'width 0.5s ease',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    ...FONTS.regular,
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  stepsContainer: {
    position: 'relative',
  },
  stepItem: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepCircleDone: {
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  stepCirclePending: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  stepCircleText: {
    ...FONTS.bold,
    fontSize: 14,
  },
  stepCircleTextDone: {
    color: '#065F46',
  },
  stepCircleTextPending: {
    color: '#9CA3AF',
  },
  stepContent: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 16,
  },
  stepContentDone: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  stepContentPending: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    borderLeftColor: '#D1D5DB',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  stepTitle: {
    ...FONTS.semibold,
    fontSize: 15,
    color: '#111827',
    flex: 1,
  },
  stepTitleDone: {
    color: '#065F46',
    textDecorationLine: 'line-through',
  },
  stepStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  stepStatusDone: {
    backgroundColor: '#D1FAE5',
  },
  stepStatusPending: {
    backgroundColor: '#F3F4F6',
  },
  stepStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 50,
  },
  stepStatusDotDone: {
    backgroundColor: '#10B981',
  },
  stepStatusDotPending: {
    backgroundColor: '#9CA3AF',
  },
  stepStatusText: {
    ...FONTS.bold,
    fontSize: 12,
  },
  stepStatusTextDone: {
    color: '#065F46',
  },
  stepStatusTextPending: {
    color: '#6B7280',
  },
  stepNote: {
    backgroundColor: '#fff',
    borderRadius: 7,
    padding: 5,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E7EB',
  },
  stepNoteText: {
    ...FONTS.regular,
    fontSize: 13,
    color: '#6B7280',
  },
  stepMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  stepMetaUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepMetaName: {
    ...FONTS.semibold,
    fontSize: 13,
    color: '#374151',
  },
  stepMetaDate: {
    ...FONTS.regular,
    fontSize: 12,
    color: '#9CA3AF',
  },
  avatar: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    flexShrink: 0,
  },
  avatarText: {
    ...FONTS.bold,
    letterSpacing: -0.5,
  },
  transferItem: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  transferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transferFrom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  transferTo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  transferDot: {
    width: 10,
    height: 10,
    borderRadius: 50,
    flexShrink: 0,
  },
  transferFromText: {
    ...FONTS.bold,
    fontSize: 15,
    color: '#991B1B',
  },
  transferToText: {
    ...FONTS.bold,
    fontSize: 15,
    color: '#065F46',
  },
  transferArrow: {
    fontSize: 18,
    color: '#D1D5DB',
  },
  transferMeta: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  transferDate: {
    ...FONTS.regular,
    fontSize: 12,
    color: '#9CA3AF',
  },
  transferNote: {
    ...FONTS.regular,
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  statusItem: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 11,
    borderWidth: 1,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 50,
    flexShrink: 0,
  },
  statusName: {
    ...FONTS.bold,
    fontSize: 15,
  },
  statusUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusUserName: {
    ...FONTS.semibold,
    fontSize: 13,
  },
  statusDate: {
    ...FONTS.medium,
    fontSize: 12,
    marginTop: 4,
  },

});