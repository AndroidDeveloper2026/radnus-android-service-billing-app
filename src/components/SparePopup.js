// src/components/SparePopup.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { X, Plus, Trash2, Save } from 'lucide-react-native';
import styles from './SparePopupStyle';

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

const SparePopup = ({
  visible,
  onClose,
  setSpareCharge,
  setSpareItems,
  existingItems = [],
}) => {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const [rate, setRate] = useState('');
  const [items, setItems] = useState([]);

  // Initialize items when popup opens or existingItems changes
  useEffect(() => {
    if (visible) {
      setItems(existingItems.map(item => ({
        ...item,
        id: item.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      })));
    }
  }, [visible, existingItems]);

  // Calculate amount for current input
  const amount = (Number(qty) || 0) * (Number(rate) || 0);

  // Add item to list
  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter spare name');
      return;
    }
    if (!rate || Number(rate) <= 0) {
      Alert.alert('Error', 'Please enter valid rate');
      return;
    }
    if (!qty || Number(qty) <= 0) {
      Alert.alert('Error', 'Please enter valid quantity');
      return;
    }

    const newItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      qty: Number(qty),
      rate: Number(rate),
      amount: Number(qty) * Number(rate),
    };

    setItems([...items, newItem]);
    setName('');
    setQty('1');
    setRate('');
  };

  // Remove item from list
  const removeItem = (id) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => setItems(items.filter(item => item.id !== id))
        },
      ]
    );
  };

  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  // Save and close
  const handleSave = () => {
    const itemsWithAmount = items.map(item => ({
      ...item,
      amount: (item.qty || 0) * (item.rate || 0),
    }));
    setSpareCharge(String(total));
    setSpareItems(itemsWithAmount);
    onClose();
  };

  // Render individual item row
  const renderItem = ({ item, index }) => (
    <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
      <Text style={[styles.tableCell, styles.cellName]} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={[styles.tableCell, styles.cellCenter]}>{item.qty}</Text>
      <Text style={[styles.tableCell, styles.cellCenter]}>{item.rate}</Text>
      <Text style={[styles.tableCell, styles.cellRight]}>
        ₹{(item.qty * item.rate).toFixed(0)}
      </Text>
      <TouchableOpacity
        onPress={() => removeItem(item.id)}
        style={styles.deleteButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Trash2 size={18} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Add Spare Items</Text>
              <TouchableOpacity 
                onPress={onClose} 
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color={COLORS.gray600} />
              </TouchableOpacity>
            </View>

            {/* Input Row */}
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputName]}
                placeholder="Spare Name"
                placeholderTextColor={COLORS.gray400}
                value={name}
                onChangeText={setName}
                returnKeyType="next"
              />
              <TextInput
                style={[styles.input, styles.inputSmall]}
                placeholder="Qty"
                placeholderTextColor={COLORS.gray400}
                value={qty}
                onChangeText={setQty}
                keyboardType="numeric"
                returnKeyType="next"
              />
              <TextInput
                style={[styles.input, styles.inputSmall]}
                placeholder="Rate"
                placeholderTextColor={COLORS.gray400}
                value={rate}
                onChangeText={setRate}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleAdd}
              />
              <TextInput
                style={[styles.input, styles.inputSmall, styles.inputReadonly]}
                value={String(amount)}
                editable={false}
                placeholder="Amount"
                placeholderTextColor={COLORS.gray400}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                <Plus size={18} color={COLORS.white} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.cellName]}>Name</Text>
              <Text style={[styles.tableHeaderCell, styles.cellCenter]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.cellCenter]}>Rate</Text>
              <Text style={[styles.tableHeaderCell, styles.cellRight]}>Amount</Text>
              <Text style={[styles.tableHeaderCell, styles.cellAction]}> </Text>
            </View>

            {/* Items List */}
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No items added yet</Text>
                  <Text style={styles.emptySubText}>Add spare parts using the form above</Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
              maxToRenderPerBatch={10}
              windowSize={5}
            />

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total :</Text>
              <Text style={styles.totalValue}>₹ {total.toFixed(0)}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Save size={18} color={COLORS.white} />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};


export default SparePopup;