import { Dimensions, Platform, StyleSheet } from "react-native";
const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#007bff',
  danger: '#dc3545',
  white: '#ffffff',
  gray50: '#f8f9fa',
  gray100: '#f5f5f5',
  gray200: '#e0e0e0',
  gray300: '#cccccc',
  gray400: '#999999',
  gray500: '#666666',
  gray600: '#444444',
  gray700: '#333333',
  gray800: '#222222',
  gray900: '#111111',
  success: '#28a745',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

const FONTS = {
  regular: { fontFamily: 'System' },
  medium: { fontFamily: 'System', fontWeight: '500' },
  semibold: { fontFamily: 'System', fontWeight: '600' },
  bold: { fontFamily: 'System', fontWeight: '700' },
};

const BORDERS = {
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
};

const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

export default StyleSheet.create({   
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: width > 600 ? '90%' : '95%',
    maxHeight: height * 0.9,
  },
  modal: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    maxHeight: height * 0.9,
    ...SHADOWS.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: 18,
    color: COLORS.gray900,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDERS.radius.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : SPACING.xs,
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray900,
    backgroundColor: COLORS.white,
    height: 44,
    minWidth: 50,
  },
  inputName: {
    flex: 2,
    minWidth: 100,
  },
  inputSmall: {
    flex: 1,
    minWidth: 55,
  },
  inputReadonly: {
    backgroundColor: COLORS.gray50,
    color: COLORS.gray500,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radius.sm,
    height: 44,
    gap: 4,
    minWidth: 70,
  },
  addButtonText: {
    ...FONTS.medium,
    fontSize: 13,
    color: COLORS.white,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray50,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDERS.radius.sm,
    marginBottom: SPACING.xs,
  },
  tableHeaderCell: {
    ...FONTS.medium,
    fontSize: 12,
    color: COLORS.gray700,
  },
  cellName: {
    flex: 2.5,
  },
  cellCenter: {
    flex: 1,
    textAlign: 'center',
  },
  cellRight: {
    flex: 1.2,
    textAlign: 'right',
    paddingRight: SPACING.sm,
  },
  cellAction: {
    width: 35,
  },
  list: {
    maxHeight: height * 0.35,
    minHeight: 100,
  },
  listContent: {
    paddingBottom: SPACING.xs,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  rowEven: {
    backgroundColor: COLORS.white,
  },
  rowOdd: {
    backgroundColor: COLORS.gray50,
  },
  tableCell: {
    ...FONTS.regular,
    fontSize: 13,
    color: COLORS.gray900,
  },
  deleteButton: {
    width: 35,
    alignItems: 'center',
    padding: SPACING.xs,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.gray400,
  },
  emptySubText: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray300,
    marginTop: SPACING.xs,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderTopWidth: 2,
    borderTopColor: COLORS.gray200,
    marginTop: SPACING.sm,
  },
  totalLabel: {
    ...FONTS.bold,
    fontSize: 16,
    color: COLORS.gray800,
  },
  totalValue: {
    ...FONTS.bold,
    fontSize: 18,
    color: COLORS.primary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  cancelButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radius.sm,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    minWidth: 80,
  },
  cancelButtonText: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.gray700,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radius.sm,
    backgroundColor: COLORS.primary,
    gap: 6,
    minWidth: 80,
    justifyContent: 'center',
  },
  saveButtonText: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.white,
  },

});