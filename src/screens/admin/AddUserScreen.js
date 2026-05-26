// src/screens/admin/AddUserScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { addUser } from '../../store/slices/userSlice';
import { Button, Input } from '../../components/UI';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
import { useToast } from 'react-native-toast-notifications';

export default function AddUserScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const toast = useToast();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim() || !username.trim() || !password.trim()) {
      toast.show('All fields are required', { type: 'danger' });
      return;
    }
    setLoading(true);
    try {
      await dispatch(addUser({ name: fullName, username, password })).unwrap();
      toast.show('User created successfully', { type: 'success' });
      navigation.goBack();
    } catch (error) {
      toast.show(error.message || 'Failed to create user', { type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Add New User</Text>

        <Input
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter full name"
          required
        />
        <Input
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
          required
          autoCapitalize="none"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
          required
        />

        <View style={styles.buttonRow}>
          <Button title="Cancel" variant="secondary" onPress={() => navigation.goBack()} style={styles.button} />
          <Button title="Save User" onPress={handleSubmit} loading={loading} style={styles.button} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  content: {
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  title: {
    ...FONTS.bold,
    fontSize: 22,
    color: COLORS.gray900,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  button: {
    flex: 1,
  },
});