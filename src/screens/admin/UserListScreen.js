// src/screens/admin/UserListScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Trash2, UserPlus } from 'lucide-react-native';
import { fetchUsers, deleteUser } from '../../store/slices/userSlice';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
import { useToast } from 'react-native-toast-notifications';

export default function UserListScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const toast = useToast();
  const { list, loading } = useSelector(state => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, []);

  const handleDelete = (id, username) => {
    Alert.alert(
      'Delete User',
      `Delete user "${username}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteUser(id)).unwrap();
              toast.show('User deleted', { type: 'success' });
            } catch (error) {
              toast.show('Failed to delete', { type: 'danger' });
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.userRole}>{item.role || 'user'}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item._id, item.username)}>
        <Trash2 size={20} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User List</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddUser')}
        >
          <UserPlus size={20} color={COLORS.white} />
          <Text style={styles.addButtonText}>Add User</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  title: {
    ...FONTS.bold,
    fontSize: 20,
    color: COLORS.gray900,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radius.md,
    gap: SPACING.xs,
  },
  addButtonText: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.white,
  },
  listContent: {
    padding: SPACING.lg,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    ...FONTS.semibold,
    fontSize: 16,
    color: COLORS.gray900,
  },
  userRole: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
  },
  loader: {
    marginTop: SPACING.xxl,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: SPACING.xxl,
    color: COLORS.gray400,
  },
});