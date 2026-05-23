// // src/components/UI.js
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Modal,
//   FlatList,
//   TouchableWithoutFeedback,
//   StyleSheet,
// } from 'react-native';
// import { ArrowLeft, Search, X } from 'lucide-react-native';
// import { COLORS, FONTS, SPACING, SHADOWS, BORDERS } from '../utils/theme';

// // ========== BUTTON ==========
// export const Button = ({ title, onPress, variant = 'primary', disabled, loading, style, textStyle, icon: Icon }) => {
//   let bgColor, textColor, borderColor;
  
//   switch (variant) {
//     case 'primary':
//       bgColor = COLORS.primary;
//       textColor = COLORS.white;
//       borderColor = COLORS.primary;
//       break;
//     case 'secondary':
//       bgColor = COLORS.gray100;
//       textColor = COLORS.gray700;
//       borderColor = COLORS.gray200;
//       break;
//     case 'danger':
//       bgColor = COLORS.error;
//       textColor = COLORS.white;
//       borderColor = COLORS.error;
//       break;
//     case 'outline':
//       bgColor = 'transparent';
//       textColor = COLORS.primary;
//       borderColor = COLORS.primary;
//       break;
//     default:
//       bgColor = COLORS.primary;
//       textColor = COLORS.white;
//       borderColor = COLORS.primary;
//   }

//   return (
//     <TouchableOpacity
//       onPress={onPress}
//       disabled={disabled || loading}
//       style={[
//         styles.button,
//         {
//           backgroundColor: disabled ? COLORS.gray200 : bgColor,
//           borderWidth: variant === 'outline' ? 1 : 0,
//           borderColor: borderColor,
//         },
//         style,
//       ]}
//     >
//       {loading ? (
//         <ActivityIndicator color={textColor} />
//       ) : (
//         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//           {Icon && <Icon size={20} color={textColor} style={{ marginRight: SPACING.sm }} />}
//           <Text style={[styles.buttonText, { color: textColor }, textStyle]}>{title}</Text>
//         </View>
//       )}
//     </TouchableOpacity>
//   );
// };

// // ========== INPUT ==========
// export const Input = ({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, error, required, style, leftIcon: LeftIcon, rightIcon: RightIcon }) => {
//   const [isFocused, setIsFocused] = useState(false);
  
//   return (
//     <View style={{ marginBottom: SPACING.lg, ...style }}>
//       {label && (
//         <Text style={[styles.label, { color: error ? COLORS.error : COLORS.gray600 }]}>
//           {label}{required && <Text style={{ color: COLORS.error }}> *</Text>}
//         </Text>
//       )}
//       <View style={[
//         styles.inputContainer,
//         {
//           borderColor: error ? COLORS.error : isFocused ? COLORS.primary : COLORS.gray200,
//           backgroundColor: COLORS.white,
//         },
//       ]}>
//         {LeftIcon && <LeftIcon size={20} color={COLORS.gray400} style={{ marginRight: SPACING.sm }} />}
//         <TextInput
//           style={[styles.input, { flex: 1 }]}
//           value={value}
//           onChangeText={onChangeText}
//           placeholder={placeholder}
//           secureTextEntry={secureTextEntry}
//           keyboardType={keyboardType}
//           placeholderTextColor={COLORS.gray400}
//           onFocus={() => setIsFocused(true)}
//           onBlur={() => setIsFocused(false)}
//         />
//         {RightIcon && <RightIcon size={20} color={COLORS.gray400} style={{ marginLeft: SPACING.sm }} />}
//       </View>
//       {error && <Text style={styles.errorText}>{error}</Text>}
//     </View>
//   );
// };

// // ========== SELECT MODAL ==========
// export const SelectModal = ({ label, value, options, onSelect, placeholder, required, error }) => {
//   const [modalVisible, setModalVisible] = useState(false);
//   const selectedOption = options.find(opt => opt.id === value);
  
//   return (
//     <View style={{ marginBottom: SPACING.lg }}>
//       {label && <Text style={styles.label}>{label}{required && <Text style={{ color: COLORS.error }}> *</Text>}</Text>}
//       <TouchableOpacity
//         style={[styles.selectTrigger, { borderColor: error ? COLORS.error : COLORS.gray200 }]}
//         onPress={() => setModalVisible(true)}
//       >
//         <Text style={[styles.selectText, { color: selectedOption ? COLORS.gray900 : COLORS.gray400 }]}>
//           {selectedOption ? selectedOption.name : placeholder || 'Select option'}
//         </Text>
//       </TouchableOpacity>
//       {error && <Text style={styles.errorText}>{error}</Text>}
//       <Modal visible={modalVisible} transparent animationType="fade">
//         <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContent}>
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
//                 <TouchableOpacity onPress={() => setModalVisible(false)}>
//                   <X size={24} color={COLORS.gray500} />
//                 </TouchableOpacity>
//               </View>
//               <FlatList
//                 data={options}
//                 keyExtractor={(item) => item.id}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     style={styles.modalItem}
//                     onPress={() => {
//                       onSelect(item.id);
//                       setModalVisible(false);
//                     }}
//                   >
//                     <Text style={styles.modalItemText}>{item.name}</Text>
//                   </TouchableOpacity>
//                 )}
//                 showsVerticalScrollIndicator={false}
//               />
//             </View>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>
//     </View>
//   );
// };

// // ========== CHECKBOX ==========
// export const CheckboxItem = ({ label, checked, onToggle }) => (
//   <TouchableOpacity onPress={onToggle} style={styles.checkboxContainer}>
//     <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
//       {checked && <View style={styles.checkboxInner} />}
//     </View>
//     <Text style={styles.checkboxLabel}>{label}</Text>
//   </TouchableOpacity>
// );

// // ========== SECTION CARD ==========
// export const SectionCard = ({ title, children, style }) => (
//   <View style={[styles.card, SHADOWS.small, style]}>
//     {title && <Text style={styles.cardTitle}>{title}</Text>}
//     {children}
//   </View>
// );

// // ========== STATUS CHIP ==========
// export const StatusChip = ({ status }) => (
//   <View style={[styles.chip, { backgroundColor: getStatusColor(status) }]}>
//     <Text style={styles.chipText}>{status || 'Unknown'}</Text>
//   </View>
// );

// // ========== HEADER BAR ==========
// export const HeaderBar = ({ title, onBack, rightComponent }) => (
//   <View style={styles.header}>
//     {onBack ? (
//       <TouchableOpacity onPress={onBack} style={styles.headerIcon}>
//         <ArrowLeft size={24} color={COLORS.gray900} />
//       </TouchableOpacity>
//     ) : (
//       <View style={{ width: 40 }} />
//     )}
//     <Text style={styles.headerTitle}>{title}</Text>
//     {rightComponent || <View style={{ width: 40 }} />}
//   </View>
// );

// // ========== INFO ROW ==========
// export const InfoRow = ({ label, value }) => (
//   <View style={styles.infoRow}>
//     <Text style={styles.infoLabel}>{label}</Text>
//     <Text style={styles.infoValue}>{value || '-'}</Text>
//   </View>
// );

// // ========== EMPTY STATE ==========
// export const EmptyState = ({ message, icon: Icon }) => (
//   <View style={styles.emptyState}>
//     {Icon && <Icon size={48} color={COLORS.gray300} />}
//     <Text style={styles.emptyStateText}>{message || 'No data found'}</Text>
//   </View>
// );

// // ========== LOADING OVERLAY ==========
// export const LoadingOverlay = ({ visible }) => {
//   if (!visible) return null;
//   return (
//     <View style={styles.loadingOverlay}>
//       <View style={styles.loadingCard}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading...</Text>
//       </View>
//     </View>
//   );
// };

// // ========== HELPERS ==========
// const getStatusColor = (status) => {
//   switch (status?.toLowerCase()) {
//     case 'received': return COLORS.info;
//     case 'delivered': return COLORS.success;
//     case 'pending': return COLORS.warning;
//     default: return COLORS.gray400;
//   }
// };

// // ========== STYLES ==========
// const styles = StyleSheet.create({
//   // Button
//   button: {
//     paddingVertical: SPACING.md,
//     paddingHorizontal: SPACING.lg,
//     borderRadius: BORDERS.radius.md,
//     alignItems: 'center',
//     justifyContent: 'center',
//     ...SHADOWS.small,
//   },
//   buttonText: {
//     ...FONTS.semibold,
//     fontSize: 16,
//   },
//   // Input
//   label: {
//     ...FONTS.medium,
//     fontSize: 14,
//     marginBottom: SPACING.xs,
//     color: COLORS.gray700,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderRadius: BORDERS.radius.md,
//     paddingHorizontal: SPACING.md,
//     backgroundColor: COLORS.white,
//     height: 48,
//   },
//   input: {
//     ...FONTS.regular,
//     fontSize: 16,
//     color: COLORS.gray900,
//     paddingVertical: SPACING.sm,
//   },
//   errorText: {
//     ...FONTS.regular,
//     fontSize: 12,
//     color: COLORS.error,
//     marginTop: SPACING.xs,
//   },
//   // Select Modal
//   selectTrigger: {
//     borderWidth: 1,
//     borderRadius: BORDERS.radius.md,
//     padding: SPACING.md,
//     backgroundColor: COLORS.white,
//     height: 48,
//     justifyContent: 'center',
//   },
//   selectText: {
//     ...FONTS.regular,
//     fontSize: 16,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: COLORS.white,
//     borderTopLeftRadius: BORDERS.radius.xl,
//     borderTopRightRadius: BORDERS.radius.xl,
//     maxHeight: '80%',
//     ...SHADOWS.large,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: SPACING.lg,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.gray200,
//   },
//   modalTitle: {
//     ...FONTS.semibold,
//     fontSize: 18,
//     color: COLORS.gray900,
//   },
//   modalItem: {
//     padding: SPACING.lg,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.gray100,
//   },
//   modalItemText: {
//     ...FONTS.regular,
//     fontSize: 16,
//     color: COLORS.gray700,
//   },
//   // Checkbox
//   checkboxContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: SPACING.lg,
//     marginBottom: SPACING.sm,
//   },
//   checkbox: {
//     width: 20,
//     height: 20,
//     borderRadius: 6,
//     borderWidth: 2,
//     borderColor: COLORS.primary,
//     marginRight: SPACING.sm,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   checkboxChecked: {
//     backgroundColor: COLORS.primary,
//   },
//   checkboxInner: {
//     width: 10,
//     height: 10,
//     borderRadius: 3,
//     backgroundColor: COLORS.white,
//   },
//   checkboxLabel: {
//     ...FONTS.regular,
//     fontSize: 14,
//     color: COLORS.gray700,
//   },
//   // Card
//   card: {
//     backgroundColor: COLORS.white,
//     borderRadius: BORDERS.radius.lg,
//     padding: SPACING.lg,
//     marginBottom: SPACING.lg,
//   },
//   cardTitle: {
//     ...FONTS.bold,
//     fontSize: 18,
//     color: COLORS.gray900,
//     marginBottom: SPACING.md,
//   },
//   // Chip
//   chip: {
//     paddingHorizontal: SPACING.sm,
//     paddingVertical: SPACING.xs,
//     borderRadius: BORDERS.radius.sm,
//     alignSelf: 'flex-start',
//   },
//   chipText: {
//     ...FONTS.medium,
//     fontSize: 12,
//     color: COLORS.white,
//   },
//   // Header
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: SPACING.lg,
//     paddingVertical: SPACING.md,
//     backgroundColor: COLORS.white,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.gray200,
//     ...SHADOWS.small,
//   },
//   headerIcon: {
//     padding: SPACING.sm,
//   },
//   headerTitle: {
//     ...FONTS.bold,
//     fontSize: 20,
//     color: COLORS.gray900,
//   },
//   // Info Row
//   infoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: SPACING.sm,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.gray100,
//   },
//   infoLabel: {
//     ...FONTS.regular,
//     fontSize: 14,
//     color: COLORS.gray500,
//   },
//   infoValue: {
//     ...FONTS.medium,
//     fontSize: 14,
//     color: COLORS.gray900,
//   },
//   // Empty State
//   emptyState: {
//     padding: SPACING.xxxl,
//     alignItems: 'center',
//   },
//   emptyStateText: {
//     ...FONTS.regular,
//     fontSize: 14,
//     color: COLORS.gray400,
//     marginTop: SPACING.md,
//   },
//   // Loading
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1000,
//   },
//   loadingCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: BORDERS.radius.lg,
//     padding: SPACING.xl,
//     alignItems: 'center',
//     ...SHADOWS.large,
//   },
//   loadingText: {
//     ...FONTS.medium,
//     fontSize: 14,
//     color: COLORS.gray700,
//     marginTop: SPACING.md,
//   },
// });

//======================

// src/components/UI.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { ArrowLeft, Search, X } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, SHADOWS, BORDERS } from '../utils/theme';

// ========== BUTTON ==========
export const Button = ({ title, onPress, variant = 'primary', disabled, loading, style, textStyle, icon: Icon }) => {
  let bgColor, textColor, borderColor;
  
  switch (variant) {
    case 'primary':
      bgColor = COLORS.primary;
      textColor = COLORS.white;
      borderColor = COLORS.primary;
      break;
    case 'secondary':
      bgColor = COLORS.gray100;
      textColor = COLORS.gray700;
      borderColor = COLORS.gray200;
      break;
    case 'danger':
      bgColor = COLORS.error;
      textColor = COLORS.white;
      borderColor = COLORS.error;
      break;
    case 'outline':
      bgColor = 'transparent';
      textColor = COLORS.primary;
      borderColor = COLORS.primary;
      break;
    default:
      bgColor = COLORS.primary;
      textColor = COLORS.white;
      borderColor = COLORS.primary;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? COLORS.gray200 : bgColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: borderColor,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {Icon && <Icon size={20} color={textColor} style={{ marginRight: SPACING.sm }} />}
          <Text style={[styles.buttonText, { color: textColor }, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ========== INPUT ==========
export const Input = ({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, error, required, style, leftIcon: LeftIcon, rightIcon: RightIcon }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <View style={{ marginBottom: SPACING.lg, ...style }}>
      {label && (
        <Text style={[styles.label, { color: error ? COLORS.error : COLORS.gray600 }]}>
          {label}{required && <Text style={{ color: COLORS.error }}> *</Text>}
        </Text>
      )}
      <View style={[
        styles.inputContainer,
        {
          borderColor: error ? COLORS.error : isFocused ? COLORS.primary : COLORS.gray200,
          backgroundColor: COLORS.white,
        },
      ]}>
        {LeftIcon && <LeftIcon size={20} color={COLORS.gray400} style={{ marginRight: SPACING.sm }} />}
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          placeholderTextColor={COLORS.gray400}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {RightIcon && <RightIcon size={20} color={COLORS.gray400} style={{ marginLeft: SPACING.sm }} />}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// ========== SELECT MODAL ==========
export const SelectModal = ({ label, value, options, onSelect, placeholder, required, error }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedOption = options.find(opt => opt.id === value);
  
  return (
    <View style={{ marginBottom: SPACING.lg }}>
      {label && <Text style={styles.label}>{label}{required && <Text style={{ color: COLORS.error }}> *</Text>}</Text>}
      <TouchableOpacity
        style={[styles.selectTrigger, { borderColor: error ? COLORS.error : COLORS.gray200 }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.selectText, { color: selectedOption ? COLORS.gray900 : COLORS.gray400 }]}>
          {selectedOption ? selectedOption.name : placeholder || 'Select option'}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color={COLORS.gray500} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={options}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      onSelect(item.id);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

// ========== CHECKBOX ==========
export const CheckboxItem = ({ label, checked, onToggle }) => (
  <TouchableOpacity onPress={onToggle} style={styles.checkboxContainer}>
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && <View style={styles.checkboxInner} />}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

// ========== SECTION CARD ==========
export const SectionCard = ({ title, children, style }) => (
  <View style={[styles.card, SHADOWS.small, style]}>
    {title && <Text style={styles.cardTitle}>{title}</Text>}
    {children}
  </View>
);

// ========== STATUS CHIP ==========
export const StatusChip = ({ status }) => (
  <View style={[styles.chip, { backgroundColor: getStatusColor(status) }]}>
    <Text style={styles.chipText}>{status || 'Unknown'}</Text>
  </View>
);

// ========== HEADER BAR ==========
export const HeaderBar = ({ title, onBack, rightComponent }) => (
  <View style={styles.header}>
    {onBack ? (
      <TouchableOpacity onPress={onBack} style={styles.headerIcon}>
        <ArrowLeft size={24} color={COLORS.gray900} />
      </TouchableOpacity>
    ) : (
      <View style={{ width: 40 }} />
    )}
    <Text style={styles.headerTitle}>{title}</Text>
    {rightComponent || <View style={{ width: 40 }} />}
  </View>
);

// ========== INFO ROW ==========
export const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '-'}</Text>
  </View>
);

// ========== EMPTY STATE ==========
export const EmptyState = ({ message, icon: Icon }) => (
  <View style={styles.emptyState}>
    {Icon && <Icon size={48} color={COLORS.gray300} />}
    <Text style={styles.emptyStateText}>{message || 'No data found'}</Text>
  </View>
);

// ========== LOADING OVERLAY ==========
export const LoadingOverlay = ({ visible }) => {
  if (!visible) return null;
  return (
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingCard}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
};

// ========== HELPERS ==========
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'received': return COLORS.info;
    case 'delivered': return COLORS.success;
    case 'pending': return COLORS.warning;
    default: return COLORS.gray400;
  }
};

// ========== STYLES ==========
const styles = StyleSheet.create({
  // Button
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDERS.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  buttonText: {
    ...FONTS.semibold,
    fontSize: 16,
  },
  // Input
  label: {
    ...FONTS.medium,
    fontSize: 14,
    marginBottom: SPACING.xs,
    color: COLORS.gray700,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BORDERS.radius.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    height: 48,
  },
  input: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.gray900,
    paddingVertical: SPACING.sm,
  },
  errorText: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  // Select Modal
  selectTrigger: {
    borderWidth: 1,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    height: 48,
    justifyContent: 'center',
  },
  selectText: {
    ...FONTS.regular,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDERS.radius.xl,
    borderTopRightRadius: BORDERS.radius.xl,
    maxHeight: '80%',
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: {
    ...FONTS.semibold,
    fontSize: 18,
    color: COLORS.gray900,
  },
  modalItem: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  modalItemText: {
    ...FONTS.regular,
    fontSize: 16,
    color: COLORS.gray700,
  },
  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  checkboxLabel: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray700,
  },
  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    ...FONTS.bold,
    fontSize: 18,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  // Chip
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDERS.radius.sm,
    alignSelf: 'flex-start',
  },
  chipText: {
    ...FONTS.medium,
    fontSize: 12,
    color: COLORS.white,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    ...SHADOWS.small,
  },
  headerIcon: {
    padding: SPACING.sm,
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: 20,
    color: COLORS.gray900,
  },
  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  infoLabel: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray500,
  },
  infoValue: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.gray900,
  },
  // Empty State
  emptyState: {
    padding: SPACING.xxxl,
    alignItems: 'center',
  },
  emptyStateText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray400,
    marginTop: SPACING.md,
  },
  // Loading
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.large,
  },
  loadingText: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.gray700,
    marginTop: SPACING.md,
  },
});