// // src/components/AdvancePopup.jsx
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   Modal,
//   TouchableOpacity,
//   TextInput,
//   ScrollView,
//   StyleSheet,
//   Alert,
//   Dimensions,
// } from 'react-native';
// import { X, Plus, Trash2, Calendar } from 'lucide-react-native';
// import DatePicker from 'react-native-date-picker';
// import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../utils/theme';

// const { width } = Dimensions.get('window');

// const AdvancePopup = ({
//   visible,
//   onClose,
//   setAdvanceAmount,
//   setAdvanceItems,
//   existingItems = [],
// }) => {
//   const today = new Date();
//   const todayStr = today.toISOString().split('T')[0];

//   const [advances, setAdvances] = useState(() => [...existingItems]);
//   const [label, setLabel] = useState('');
//   const [amount, setAmount] = useState('');
//   const [date, setDate] = useState(today);
//   const [openDatePicker, setOpenDatePicker] = useState(false);

//   const total = advances.reduce((sum, a) => sum + Number(a.amount || 0), 0);

//   const handleAdd = () => {
//     const numAmount = Number(amount);
//     if (!amount || numAmount <= 0) {
//       Alert.alert('Error', 'Enter valid amount');
//       return;
//     }
//     if (!date) {
//       Alert.alert('Error', 'Select a date');
//       return;
//     }
//     setAdvances(prev => [
//       ...prev,
//       {
//         label: label || `Advance ${prev.length + 1}`,
//         amount: numAmount,
//         date: date.toISOString(),
//       },
//     ]);
//     setAmount('');
//     setLabel('');
//     setDate(today);
//   };

//   const handleRemove = (index) => {
//     setAdvances(prev => prev.filter((_, idx) => idx !== index));
//   };

//   const handleSave = () => {
//     setAdvanceItems(advances);
//     setAdvanceAmount(String(total));
//     onClose();
//   };

//   const formatDate = (dateStr) => {
//     if (!dateStr) return '-';
//     const d = new Date(dateStr);
//     return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
//   };

//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="slide"
//       onRequestClose={onClose}
//     >
//       <View style={styles.overlay}>
//         <View style={styles.container}>
//           {/* Header */}
//           <View style={styles.header}>
//             <View style={styles.headerLeft}>
//               <Text style={styles.headerTitle}>💰 Add Advance Payments</Text>
//             </View>
//             <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
//               <X size={24} color={COLORS.white} />
//             </TouchableOpacity>
//           </View>

//           {/* Body */}
//           <View style={styles.body}>
//             {/* Input Row */}
//             <View style={styles.inputRow}>
//               <View style={styles.inputGroupSmall}>
//                 <Text style={styles.inputLabel}>Label (optional)</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="e.g. First Advance"
//                   placeholderTextColor={COLORS.gray400}
//                   value={label}
//                   onChangeText={setLabel}
//                   onSubmitEditing={handleAdd}
//                 />
//               </View>
//               <View style={styles.inputGroupSmall}>
//                 <Text style={styles.inputLabel}>Amount ₹ *</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="0"
//                   placeholderTextColor={COLORS.gray400}
//                   value={amount}
//                   onChangeText={text => setAmount(text.replace(/\D/g, ''))}
//                   keyboardType="numeric"
//                   autoFocus
//                 />
//               </View>
//             </View>

//             <View style={styles.dateRow}>
//               <View style={styles.inputGroupDate}>
//                 <Text style={styles.inputLabel}>Date *</Text>
//                 <TouchableOpacity
//                   style={styles.dateButton}
//                   onPress={() => setOpenDatePicker(true)}
//                 >
//                   <Calendar size={16} color={COLORS.gray600} />
//                   <Text style={styles.dateText}>{formatDate(date.toISOString())}</Text>
//                 </TouchableOpacity>
//                 <DatePicker
//                   modal
//                   open={openDatePicker}
//                   date={date}
//                   onConfirm={(selectedDate) => {
//                     setOpenDatePicker(false);
//                     setDate(selectedDate);
//                   }}
//                   onCancel={() => setOpenDatePicker(false)}
//                 />
//               </View>
//               <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
//                 <Plus size={20} color={COLORS.white} />
//                 <Text style={styles.addButtonText}>Add</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Table */}
//             <ScrollView style={styles.tableContainer} showsVerticalScrollIndicator={false}>
//               <View style={styles.tableHeader}>
//                 <Text style={[styles.tableHeaderText, styles.colLabel]}>Label</Text>
//                 <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount ₹</Text>
//                 <Text style={[styles.tableHeaderText, styles.colDate]}>Date</Text>
//                 <Text style={[styles.tableHeaderText, styles.colAction]}>Action</Text>
//               </View>

//               {advances.length === 0 ? (
//                 <View style={styles.emptyState}>
//                   <Text style={styles.emptyText}>No advances added yet</Text>
//                 </View>
//               ) : (
//                 advances.map((item, index) => (
//                   <View key={index} style={styles.tableRow}>
//                     <Text style={[styles.tableCell, styles.colLabel, styles.cellLabel]}>
//                       {item.label || '-'}
//                     </Text>
//                     <Text style={[styles.tableCell, styles.colAmount, styles.cellAmount]}>
//                       ₹ {item.amount}
//                     </Text>
//                     <Text style={[styles.tableCell, styles.colDate, styles.cellDate]}>
//                       {formatDate(item.date)}
//                     </Text>
//                     <TouchableOpacity
//                       style={styles.deleteButton}
//                       onPress={() => handleRemove(index)}
//                     >
//                       <Trash2 size={16} color={COLORS.danger} />
//                     </TouchableOpacity>
//                   </View>
//                 ))
//               )}
//             </ScrollView>

//             {/* Total */}
//             <View style={styles.totalContainer}>
//               <Text style={styles.totalLabel}>Total Advance:</Text>
//               <Text style={styles.totalValue}>₹ {total}</Text>
//             </View>
//           </View>

//           {/* Footer */}
//           <View style={styles.footer}>
//             <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
//               <Text style={styles.saveButtonText}>Save</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   container: {
//     backgroundColor: COLORS.white,
//     borderRadius: 20,
//     width: width * 0.92,
//     maxHeight: '85%',
//     ...SHADOWS.large,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: SPACING.lg,
//     paddingVertical: SPACING.md,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   headerLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     ...FONTS.bold,
//     fontSize: 16,
//     color: COLORS.white,
//   },
//   body: {
//     padding: SPACING.lg,
//   },
//   inputRow: {
//     flexDirection: 'row',
//     gap: SPACING.sm,
//     marginBottom: SPACING.sm,
//   },
//   inputGroupSmall: {
//     flex: 1,
//   },
//   inputGroupDate: {
//     flex: 1,
//   },
//   inputLabel: {
//     ...FONTS.medium,
//     fontSize: 12,
//     color: COLORS.gray600,
//     marginBottom: 4,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//     borderRadius: BORDERS.radius.md,
//     paddingHorizontal: SPACING.md,
//     paddingVertical: 10,
//     ...FONTS.regular,
//     fontSize: 14,
//     color: COLORS.gray900,
//     backgroundColor: COLORS.white,
//   },
//   dateRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     gap: SPACING.sm,
//     marginBottom: SPACING.md,
//   },
//   dateButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//     borderRadius: BORDERS.radius.md,
//     paddingHorizontal: SPACING.md,
//     paddingVertical: 10,
//     backgroundColor: COLORS.white,
//     gap: 8,
//   },
//   dateText: {
//     ...FONTS.regular,
//     fontSize: 14,
//     color: COLORS.gray700,
//   },
//   addButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: SPACING.md,
//     paddingVertical: 10,
//     borderRadius: BORDERS.radius.md,
//     gap: 4,
//     alignSelf: 'flex-end',
//     marginBottom: 2,
//   },
//   addButtonText: {
//     ...FONTS.semibold,
//     fontSize: 13,
//     color: COLORS.white,
//   },
//   tableContainer: {
//     maxHeight: 200,
//     marginBottom: SPACING.md,
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     backgroundColor: COLORS.gray50,
//     paddingVertical: 8,
//     paddingHorizontal: SPACING.sm,
//     borderRadius: BORDERS.radius.sm,
//     marginBottom: 4,
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//   },
//   tableHeaderText: {
//     ...FONTS.semibold,
//     fontSize: 11,
//     color: COLORS.gray600,
//   },
//   tableRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: SPACING.sm,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.gray100,
//   },
//   tableCell: {
//     ...FONTS.regular,
//     fontSize: 12,
//     color: COLORS.gray700,
//   },
//   colLabel: { flex: 2 },
//   colAmount: { flex: 1.2 },
//   colDate: { flex: 1.3 },
//   colAction: { flex: 0.6, textAlign: 'center' },
//   cellLabel: { ...FONTS.medium, color: COLORS.gray900 },
//   cellAmount: { ...FONTS.semibold, color: COLORS.primary },
//   cellDate: { fontSize: 11, color: COLORS.gray500 },
//   deleteButton: {
//     flex: 0.6,
//     alignItems: 'center',
//     padding: 4,
//   },
//   emptyState: {
//     paddingVertical: SPACING.lg,
//     alignItems: 'center',
//   },
//   emptyText: {
//     ...FONTS.regular,
//     fontSize: 13,
//     color: COLORS.gray400,
//   },
//   totalContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingTop: SPACING.sm,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.gray200,
//   },
//   totalLabel: {
//     ...FONTS.bold,
//     fontSize: 15,
//     color: COLORS.gray700,
//   },
//   totalValue: {
//     ...FONTS.bold,
//     fontSize: 16,
//     color: '#16a34a',
//   },
//   footer: {
//     flexDirection: 'row',
//     gap: SPACING.sm,
//     paddingHorizontal: SPACING.lg,
//     paddingBottom: SPACING.lg,
//   },
//   cancelButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: BORDERS.radius.md,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: COLORS.gray200,
//     backgroundColor: COLORS.white,
//   },
//   cancelButtonText: {
//     ...FONTS.semibold,
//     fontSize: 14,
//     color: COLORS.gray700,
//   },
//   saveButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: BORDERS.radius.md,
//     alignItems: 'center',
//     backgroundColor: '#16a34a',
//   },
//   saveButtonText: {
//     ...FONTS.semibold,
//     fontSize: 14,
//     color: COLORS.white,
//   },
// });

// export default AdvancePopup;

//++++++++++++++++++++++++++++++++

// src/components/AdvancePopup.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
  Keyboard,
} from 'react-native';
import { X, Plus, Trash2, Calendar } from 'lucide-react-native';
import DatePicker from 'react-native-date-picker';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../utils/theme';

const { width } = Dimensions.get('window');

const AdvancePopup = ({
  visible,
  onClose,
  setAdvanceAmount,
  setAdvanceItems,
  existingItems = [],
}) => {
  const today = new Date();
  const [advances, setAdvances] = useState([]);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setAdvances(existingItems.length > 0 ? [...existingItems] : []);
    }
  }, [visible, existingItems]);

  const total = advances.reduce((sum, a) => sum + Number(a.amount || 0), 0);

  const handleAdd = () => {
    const numAmount = Number(amount);
    if (!amount || numAmount <= 0) {
      Alert.alert('Error', 'Enter valid amount');
      return;
    }
    if (!date) {
      Alert.alert('Error', 'Select a date');
      return;
    }
    setAdvances(prev => [
      ...prev,
      {
        label: label.trim() || `Advance ${prev.length + 1}`,
        amount: numAmount,
        date: date.toISOString(),
      },
    ]);
    setAmount('');
    setLabel('');
    setDate(today);
    Keyboard.dismiss();
  };

  const handleRemove = (index) => {
    Alert.alert(
      'Remove Payment',
      'Remove this advance payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setAdvances(prev => prev.filter((_, idx) => idx !== index));
          }
        }
      ]
    );
  };

  const handleSave = () => {
    setAdvanceItems(advances);
    setAdvanceAmount(String(total));
    onClose();
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDatePicker = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}> Add Advance Payments</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {/* Input Row */}
            <View style={styles.inputRow}>
              <View style={styles.inputGroupSmall}>
                <Text style={styles.inputLabel}>Label (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. First Advance"
                  placeholderTextColor={COLORS.gray400}
                  value={label}
                  onChangeText={setLabel}
                  onSubmitEditing={() => handleAdd()}
                  returnKeyType="next"
                />
              </View>
              <View style={styles.inputGroupSmall}>
                <Text style={styles.inputLabel}>Amount ₹ *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={COLORS.gray400}
                  value={amount}
                  onChangeText={text => setAmount(text.replace(/\D/g, ''))}
                  keyboardType="numeric"
                  autoFocus
                  onSubmitEditing={() => handleAdd()}
                  returnKeyType="done"
                />
              </View>
            </View>

            <View style={styles.dateRow}>
              <View style={styles.inputGroupDate}>
                <Text style={styles.inputLabel}>Date *</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setOpenDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Calendar size={16} color={COLORS.gray600} />
                  <Text style={styles.dateText}>{formatDatePicker(date)}</Text>
                </TouchableOpacity>
                <DatePicker
                  modal
                  open={openDatePicker}
                  date={date}
                  onConfirm={(selectedDate) => {
                    setOpenDatePicker(false);
                    setDate(selectedDate);
                  }}
                  onCancel={() => setOpenDatePicker(false)}
                  mode="date"
                  locale="en_IN"
                />
              </View>
              <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                <Plus size={20} color={COLORS.white} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Table */}
            <View style={styles.tableWrapper}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.colLabel]}>Label</Text>
                <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount ₹</Text>
                <Text style={[styles.tableHeaderText, styles.colDate]}>Date</Text>
                <Text style={[styles.tableHeaderText, styles.colAction]}>Action</Text>
              </View>

              <ScrollView style={styles.tableContainer} showsVerticalScrollIndicator={false}>
                {advances.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No advances added yet</Text>
                  </View>
                ) : (
                  advances.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.colLabel, styles.cellLabel]}>
                        {item.label || '-'}
                      </Text>
                      <Text style={[styles.tableCell, styles.colAmount, styles.cellAmount]}>
                        ₹ {item.amount}
                      </Text>
                      <Text style={[styles.tableCell, styles.colDate, styles.cellDate]}>
                        {formatDateDisplay(item.date)}
                      </Text>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleRemove(index)}
                      >
                        <Trash2 size={16} color={COLORS.danger} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>

            {/* Total */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Advance:</Text>
              <Text style={styles.totalValue}>₹ {total}</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: width * 0.92,
    maxHeight: '85%',
    ...SHADOWS.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: 16,
    color: COLORS.white,
  },
  body: {
    padding: SPACING.lg,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  inputGroupSmall: {
    flex: 1,
  },
  inputGroupDate: {
    flex: 1,
  },
  inputLabel: {
    ...FONTS.medium,
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDERS.radius.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray900,
    backgroundColor: COLORS.white,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDERS.radius.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  dateText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray700,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: BORDERS.radius.md,
    gap: 4,
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  addButtonText: {
    ...FONTS.semibold,
    fontSize: 13,
    color: COLORS.white,
  },
  tableWrapper: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDERS.radius.md,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    maxHeight: 200,
  },
  tableContainer: {
    maxHeight: 160,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray50,
    paddingVertical: 8,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tableHeaderText: {
    ...FONTS.semibold,
    fontSize: 11,
    color: COLORS.gray600,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  tableCell: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray700,
  },
  colLabel: { flex: 2 },
  colAmount: { flex: 1.2 },
  colDate: { flex: 1.3 },
  colAction: { flex: 0.6, textAlign: 'center' },
  cellLabel: { ...FONTS.medium, color: COLORS.gray900 },
  cellAmount: { ...FONTS.semibold, color: COLORS.primary },
  cellDate: { fontSize: 11, color: COLORS.gray500 },
  deleteButton: {
    flex: 0.6,
    alignItems: 'center',
    padding: 4,
  },
  emptyState: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...FONTS.regular,
    fontSize: 13,
    color: COLORS.gray400,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  totalLabel: {
    ...FONTS.bold,
    fontSize: 15,
    color: COLORS.gray700,
  },
  totalValue: {
    ...FONTS.bold,
    fontSize: 16,
    color: '#16a34a',
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDERS.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  cancelButtonText: {
    ...FONTS.semibold,
    fontSize: 14,
    color: COLORS.gray700,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDERS.radius.md,
    alignItems: 'center',
    backgroundColor: '#16a34a',
  },
  saveButtonText: {
    ...FONTS.semibold,
    fontSize: 14,
    color: COLORS.white,
  },
});

export default AdvancePopup;