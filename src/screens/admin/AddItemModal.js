// src/screens/admin/AddItemModal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';
import { SelectModal, Button } from '../../components/UI';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';

const AddItemModal = ({ visible, type, makes, selectedMakeId, onSelectMake, onSubmit, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getTitle = () => {
    switch (type) {
      case 'make': return 'Add Make';
      case 'model': return 'Add Model';
      case 'fault': return 'Add Fault';
      case 'drawer': return 'Add Drawer';
      case 'engineer': return 'Add Engineer';
      default: return 'Add Item';
    }
  };

  const getPlaceholder = () => {
    switch (type) {
      case 'make': return 'Enter Make';
      case 'model': return 'Model Name';
      case 'fault': return 'Enter Fault';
      case 'drawer': return 'Enter Drawer';
      case 'engineer': return 'Enter Engineer';
      default: return 'Enter name';
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const success = await onSubmit(inputValue);
    setSubmitting(false);
    if (success) {
      setInputValue('');
      onClose();
    }
  };

  const handleClose = () => {
    setInputValue('');
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{getTitle()}</Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color={COLORS.gray500} />
            </TouchableOpacity>
          </View>

          {type === 'model' && (
            <SelectModal
              label="Select Make"
              value={selectedMakeId}
              options={makes}
              onSelect={onSelectMake}
              placeholder="Select Make"
              required
            />
          )}

          <TextInput
            style={styles.input}
            placeholder={getPlaceholder()}
            value={inputValue}
            onChangeText={setInputValue}
            autoCapitalize="words"
            editable={!submitting}
          />

          <View style={styles.buttons}>
            <Button title="Cancel" variant="secondary" onPress={handleClose} style={styles.button} />
            <Button title="Save" onPress={handleSubmit} loading={submitting} style={styles.button} />
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
  modal: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    width: '85%',
    ...SHADOWS.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...FONTS.bold,
    fontSize: 18,
    color: COLORS.gray900,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    ...FONTS.regular,
    fontSize: 16,
    backgroundColor: COLORS.white,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  button: {
    flex: 1,
  },
});

export default AddItemModal;