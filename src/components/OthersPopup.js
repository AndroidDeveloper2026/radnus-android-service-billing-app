// src/components/OthersPopup.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
  Keyboard,
  FlatList,
} from 'react-native';
import { X, Plus, Trash2, Calendar, Receipt } from 'lucide-react-native';
import DatePicker from 'react-native-date-picker';
import { COLORS } from '../utils/theme';
import styles from './OthersPopupStyle';

const { width } = Dimensions.get('window');

// ─── Category Options ──────────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
  { id: 'courier', label: 'Courier' },
  { id: 'petrol', label: 'Petrol' },
  { id: 'return', label: 'Return' },
  { id: 'food', label: 'Food' },
  { id: 'transport', label: 'Transport' },
  { id: 'other', label: 'Other' },
];

// ─── Memoized Category Chip Component ─────────────────────────────────────
const CategoryChip = React.memo(({ item, isSelected, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(item.id);
  }, [onPress, item.id]);

  return (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        isSelected && styles.categoryChipSelected,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.categoryChipText,
          isSelected && styles.categoryChipTextSelected,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
});

CategoryChip.displayName = 'CategoryChip';

// ─── Memoized Table Row Component ────────────────────────────────────────
const TableRow = React.memo(({ item, index, onRemove }) => {
  const formatDateDisplay = useCallback((dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }, []);

  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [onRemove, index]);

  return (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.colCategory, styles.cellCategory]}>
        {item.category || '-'}
      </Text>
      <Text style={[styles.tableCell, styles.colAmount, styles.cellAmount]}>
        ₹ {item.amount}
      </Text>
      <Text style={[styles.tableCell, styles.colDate, styles.cellDate]}>
        {formatDateDisplay(item.date)}
      </Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleRemove}
      >
        <Trash2 size={16} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  );
});

TableRow.displayName = 'TableRow';

// ─── Main Component ──────────────────────────────────────────────────────
const OthersPopup = ({
  visible,
  onClose,
  setOthersAmount,
  setOthersItems,
  existingItems = [],
}) => {
  const today = useMemo(() => new Date(), []);
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const flatListRef = useRef(null);
  const tableListRef = useRef(null);

  // ─── Effects ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      setItems(prev => {
        const newItems = existingItems.length > 0 ? [...existingItems] : [];
        if (JSON.stringify(prev) !== JSON.stringify(newItems)) {
          return newItems;
        }
        return prev;
      });
    }
  }, [visible, existingItems]);

  // ─── Memoized Values ────────────────────────────────────────────────────
  const total = useMemo(() => {
    return items.reduce((sum, a) => sum + Number(a.amount || 0), 0);
  }, [items]);

  // ─── Memoized Formatters ────────────────────────────────────────────────
  const formatDateDisplay = useCallback((dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }, []);

  const formatDatePicker = useCallback((date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleCategorySelect = useCallback((selectedCategory) => {
    if (selectedCategory === 'other') {
      setShowCustomInput(true);
      setCategory('');
      setCustomCategory('');
    } else {
      setShowCustomInput(false);
      setCategory(selectedCategory);
      setCustomCategory('');
    }
  }, []);

  const handleAdd = useCallback(() => {
    const numAmount = Number(amount);
    if (!amount || numAmount <= 0) {
      Alert.alert('Error', 'Enter valid amount');
      return;
    }
    
    let finalCategory = category;
    if (showCustomInput && customCategory.trim()) {
      finalCategory = customCategory.trim();
    } else if (!finalCategory) {
      Alert.alert('Error', 'Please select or enter a category');
      return;
    }

    if (!date) {
      Alert.alert('Error', 'Select a date');
      return;
    }

    const newItem = {
      category: finalCategory,
      amount: numAmount,
      date: date.toISOString(),
    };

    setItems(prev => [...prev, newItem]);
    setAmount('');
    setCategory('');
    setCustomCategory('');
    setShowCustomInput(false);
    setDate(today);
    Keyboard.dismiss();
  }, [amount, category, showCustomInput, customCategory, date, today]);

  const handleRemove = useCallback((index) => {
    Alert.alert(
      'Remove Expense',
      'Remove this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setItems(prev => prev.filter((_, idx) => idx !== index));
          }
        }
      ]
    );
  }, []);

  const handleSave = useCallback(() => {
    setOthersItems(items);
    setOthersAmount(String(total));
    onClose();
  }, [items, total, setOthersItems, setOthersAmount, onClose]);

  // ─── Renderers ──────────────────────────────────────────────────────────
  const renderCategoryItem = useCallback(({ item }) => {
    const isSelected = category === item.id || (item.id === 'other' && showCustomInput);
    return (
      <CategoryChip
        item={item}
        isSelected={isSelected}
        onPress={handleCategorySelect}
      />
    );
  }, [category, showCustomInput, handleCategorySelect]);

  const renderTableRow = useCallback(({ item, index }) => {
    return (
      <TableRow
        item={item}
        index={index}
        onRemove={handleRemove}
      />
    );
  }, [handleRemove]);

  const keyExtractor = useCallback((item, index) => `category-${item.id}`, []);
  const tableKeyExtractor = useCallback((_, index) => `item-${index}`, []);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* ─── Header ────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>💰 Add Other Expenses</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* ─── Body ──────────────────────────────────────────────────── */}
          <ScrollView 
            style={styles.body}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={true}
          >
            {/* ─── Category Selection ────────────────────────────────── */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryListWrapper}>
                <FlatList
                  ref={flatListRef}
                  data={CATEGORY_OPTIONS}
                  renderItem={renderCategoryItem}
                  keyExtractor={keyExtractor}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryListContent}
                  style={styles.categoryFlatList}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={6}
                  windowSize={10}
                  initialNumToRender={6}
                />
              </View>
              
              {showCustomInput && (
                <View style={styles.customInputWrapper}>
                  <TextInput
                    style={styles.customInput}
                    placeholder="Enter custom category"
                    placeholderTextColor={COLORS.gray400}
                    value={customCategory}
                    onChangeText={setCustomCategory}
                    autoFocus
                    onSubmitEditing={handleAdd}
                  />
                </View>
              )}
            </View>

            {/* ─── Amount & Date ────────────────────────────────────── */}
            <View style={styles.row2}>
              <View style={[styles.fieldWrapper, { flex: 1, marginRight: 4 }]}>
                <Text style={styles.inputLabel}>Amount ₹ *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={COLORS.gray400}
                  value={amount}
                  onChangeText={text => setAmount(text.replace(/\D/g, ''))}
                  keyboardType="numeric"
                  autoFocus={!showCustomInput}
                  onSubmitEditing={handleAdd}
                  returnKeyType="done"
                />
              </View>
              <View style={[styles.fieldWrapper, { flex: 1, marginLeft: 4 }]}>
                <Text style={styles.inputLabel}>Date</Text>
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
            </View>

            {/* ─── Add Button ───────────────────────────────────────── */}
            <TouchableOpacity style={styles.addButton} onPress={handleAdd} activeOpacity={0.8}>
              <View style={styles.addButtonIconWrap}>
                <Plus size={16} color={COLORS.white} />
              </View>
              <Text style={styles.addButtonText}>Add Expense</Text>
            </TouchableOpacity>

            {/* ─── Table ────────────────────────────────────────────── */}
            <View style={styles.tableWrapper}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.colCategory]}>Category</Text>
                <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount ₹</Text>
                <Text style={[styles.tableHeaderText, styles.colDate]}>Date</Text>
                <Text style={[styles.tableHeaderText, styles.colAction]}>Action</Text>
              </View>

              <View style={styles.tableContainer}>
                {items.length === 0 ? (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIconWrap}>
                      <Receipt size={22} color={COLORS.gray300} />
                    </View>
                    <Text style={styles.emptyText}>No expenses added yet</Text>
                    <Text style={styles.emptySubText}>Items you add will show up here</Text>
                  </View>
                ) : (
                  <FlatList
                    ref={tableListRef}
                    data={items}
                    renderItem={renderTableRow}
                    keyExtractor={tableKeyExtractor}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={15}
                    initialNumToRender={10}
                    scrollEnabled={true}
                    style={{ maxHeight: 140 }}
                  />
                )}
              </View>
            </View>

            {/* ─── Total ────────────────────────────────────────────── */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Others:</Text>
              <Text style={styles.totalValue}>₹ {total}</Text>
            </View>

            {/* ─── Action Buttons ────────────────────────────────────── */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.7}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Spacer */}
            <View style={{ height: 8 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default React.memo(OthersPopup);

// // src/components/OthersPopup.js
// import React, { useState, useEffect } from 'react';
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
//   Keyboard,
//   FlatList,
// } from 'react-native';
// import { X, Plus, Trash2, Calendar, Receipt } from 'lucide-react-native';
// import DatePicker from 'react-native-date-picker';
// import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../utils/theme';
// import styles from './OthersPopupStyle';

// const { width } = Dimensions.get('window');

// // ─── Category Options ──────────────────────────────────────────────────────
// const CATEGORY_OPTIONS = [
//   { id: 'courier', label: 'Courier' },
//   { id: 'petrol', label: 'Petrol' },
//   { id: 'return', label: 'Return' },
//   { id: 'food', label: 'Food' },
//   { id: 'transport', label: 'Transport' },
//   { id: 'other', label: 'Other' },
// ];

// const OthersPopup = ({
//   visible,
//   onClose,
//   setOthersAmount,
//   setOthersItems,
//   existingItems = [],
// }) => {
//   const today = new Date();
//   const [items, setItems] = useState([]);
//   const [category, setCategory] = useState('');
//   const [amount, setAmount] = useState('');
//   const [date, setDate] = useState(today);
//   const [openDatePicker, setOpenDatePicker] = useState(false);
//   const [customCategory, setCustomCategory] = useState('');
//   const [showCustomInput, setShowCustomInput] = useState(false);

//   useEffect(() => {
//     if (visible) {
//       setItems(existingItems.length > 0 ? [...existingItems] : []);
//     }
//   }, [visible, existingItems]);

//   const total = items.reduce((sum, a) => sum + Number(a.amount || 0), 0);

//   const handleCategorySelect = (selectedCategory) => {
//     if (selectedCategory === 'other') {
//       setShowCustomInput(true);
//       setCategory('');
//       setCustomCategory('');
//     } else {
//       setShowCustomInput(false);
//       setCategory(selectedCategory);
//       setCustomCategory('');
//     }
//   };

//   const handleAdd = () => {
//     const numAmount = Number(amount);
//     if (!amount || numAmount <= 0) {
//       Alert.alert('Error', 'Enter valid amount');
//       return;
//     }
    
//     let finalCategory = category;
//     if (showCustomInput && customCategory.trim()) {
//       finalCategory = customCategory.trim();
//     } else if (!finalCategory) {
//       Alert.alert('Error', 'Please select or enter a category');
//       return;
//     }

//     if (!date) {
//       Alert.alert('Error', 'Select a date');
//       return;
//     }

//     setItems(prev => [
//       ...prev,
//       {
//         category: finalCategory,
//         amount: numAmount,
//         date: date.toISOString(),
//       },
//     ]);
//     setAmount('');
//     setCategory('');
//     setCustomCategory('');
//     setShowCustomInput(false);
//     setDate(today);
//     Keyboard.dismiss();
//   };

//   const handleRemove = (index) => {
//     Alert.alert(
//       'Remove Expense',
//       'Remove this expense?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { 
//           text: 'Remove', 
//           style: 'destructive',
//           onPress: () => {
//             setItems(prev => prev.filter((_, idx) => idx !== index));
//           }
//         }
//       ]
//     );
//   };

//   const handleSave = () => {
//     setOthersItems(items);
//     setOthersAmount(String(total));
//     onClose();
//   };

//   const formatDateDisplay = (dateStr) => {
//     if (!dateStr) return '-';
//     const d = new Date(dateStr);
//     return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
//   };

//   const formatDatePicker = (date) => {
//     if (!date) return '';
//     return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
//   };

//   const renderCategoryItem = ({ item }) => {
//     const isSelected = category === item.id || (item.id === 'other' && showCustomInput);
//     const isOtherSelected = item.id === 'other' && showCustomInput;

//     return (
//       <TouchableOpacity
//         style={[
//           styles.categoryChip,
//           isSelected && styles.categoryChipSelected,
//           isOtherSelected && styles.categoryChipSelected,
//         ]}
//         onPress={() => handleCategorySelect(item.id)}
//         activeOpacity={0.7}
//       >
//         <Text
//           style={[
//             styles.categoryChipText,
//             (isSelected || isOtherSelected) && styles.categoryChipTextSelected,
//           ]}
//         >
//           {item.label}
//         </Text>
//       </TouchableOpacity>
//     );
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
//           {/* ─── Header ────────────────────────────────────────────────── */}
//           <View style={styles.header}>
//             <View style={styles.headerLeft}>
//               <Text style={styles.headerTitle}>💰 Add Other Expenses</Text>
//             </View>
//             <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
//               <X size={24} color={COLORS.white} />
//             </TouchableOpacity>
//           </View>

//           {/* ─── Body ──────────────────────────────────────────────────── */}
//           <ScrollView 
//             style={styles.body}
//             showsVerticalScrollIndicator={false}
//             keyboardShouldPersistTaps="handled"
//           >
//             {/* ─── Category Selection ────────────────────────────────── */}
//             <View style={styles.fieldWrapper}>
//               <Text style={styles.inputLabel}>Category</Text>
//               <FlatList
//                 data={CATEGORY_OPTIONS}
//                 renderItem={renderCategoryItem}
//                 keyExtractor={(item) => item.id}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.categoryList}
//               />
              
//               {showCustomInput && (
//                 <View style={styles.customInputWrapper}>
//                   <TextInput
//                     style={styles.customInput}
//                     placeholder="Enter custom category"
//                     placeholderTextColor={COLORS.gray400}
//                     value={customCategory}
//                     onChangeText={setCustomCategory}
//                     autoFocus
//                     onSubmitEditing={handleAdd}
//                   />
//                 </View>
//               )}
//             </View>

//             {/* ─── Amount & Date ────────────────────────────────────── */}
//             <View style={styles.row2}>
//               <View style={[styles.fieldWrapper, { flex: 1, marginRight: 4 }]}>
//                 <Text style={styles.inputLabel}>Amount ₹ *</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="0"
//                   placeholderTextColor={COLORS.gray400}
//                   value={amount}
//                   onChangeText={text => setAmount(text.replace(/\D/g, ''))}
//                   keyboardType="numeric"
//                   autoFocus={!showCustomInput}
//                   onSubmitEditing={handleAdd}
//                   returnKeyType="done"
//                 />
//               </View>
//               <View style={[styles.fieldWrapper, { flex: 1, marginLeft: 4 }]}>
//                 <Text style={styles.inputLabel}>Date</Text>
//                 <TouchableOpacity
//                   style={styles.dateButton}
//                   onPress={() => setOpenDatePicker(true)}
//                   activeOpacity={0.7}
//                 >
//                   <Calendar size={16} color={COLORS.gray600} />
//                   <Text style={styles.dateText}>{formatDatePicker(date)}</Text>
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
//                   mode="date"
//                   locale="en_IN"
//                 />
//               </View>
//             </View>

//             {/* ─── Add Button ───────────────────────────────────────── */}
//             <TouchableOpacity style={styles.addButton} onPress={handleAdd} activeOpacity={0.8}>
//               <View style={styles.addButtonIconWrap}>
//                 <Plus size={16} color={COLORS.white} />
//               </View>
//               <Text style={styles.addButtonText}>Add Expense</Text>
//             </TouchableOpacity>

//             {/* ─── Table ────────────────────────────────────────────── */}
//             <View style={styles.tableWrapper}>
//               <View style={styles.tableHeader}>
//                 <Text style={[styles.tableHeaderText, styles.colCategory]}>Category</Text>
//                 <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount ₹</Text>
//                 <Text style={[styles.tableHeaderText, styles.colDate]}>Date</Text>
//                 <Text style={[styles.tableHeaderText, styles.colAction]}>Action</Text>
//               </View>

//               <ScrollView style={styles.tableContainer} showsVerticalScrollIndicator={false}>
//                 {items.length === 0 ? (
//                   <View style={styles.emptyState}>
//                     <View style={styles.emptyIconWrap}>
//                       <Receipt size={22} color={COLORS.gray300} />
//                     </View>
//                     <Text style={styles.emptyText}>No expenses added yet</Text>
//                     <Text style={styles.emptySubText}>Items you add will show up here</Text>
//                   </View>
//                 ) : (
//                   items.map((item, index) => (
//                     <View key={index} style={styles.tableRow}>
//                       <Text style={[styles.tableCell, styles.colCategory, styles.cellCategory]}>
//                         {item.category || '-'}
//                       </Text>
//                       <Text style={[styles.tableCell, styles.colAmount, styles.cellAmount]}>
//                         ₹ {item.amount}
//                       </Text>
//                       <Text style={[styles.tableCell, styles.colDate, styles.cellDate]}>
//                         {formatDateDisplay(item.date)}
//                       </Text>
//                       <TouchableOpacity
//                         style={styles.deleteButton}
//                         onPress={() => handleRemove(index)}
//                       >
//                         <Trash2 size={16} color={COLORS.danger} />
//                       </TouchableOpacity>
//                     </View>
//                   ))
//                 )}
//               </ScrollView>
//             </View>

//             {/* ─── Total ────────────────────────────────────────────── */}
//             <View style={styles.totalContainer}>
//               <Text style={styles.totalLabel}>Total Others:</Text>
//               <Text style={styles.totalValue}>₹ {total}</Text>
//             </View>

//             {/* ─── Action Buttons (Inside Card) ────────────────────── */}
//             <View style={styles.footer}>
//               <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
//                 <Text style={styles.cancelButtonText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.7}>
//                 <Text style={styles.saveButtonText}>Save</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Bottom Spacer */}
//             <View style={{ height: 8 }} />
//           </ScrollView>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default OthersPopup;