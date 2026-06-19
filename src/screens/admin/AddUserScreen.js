// // src/screens/admin/AddUserScreen.js
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
// } from 'react-native';
// import { useDispatch } from 'react-redux';
// import { useNavigation } from '@react-navigation/native';
// import { addUser } from '../../store/slices/userSlice';
// import { Button, Input } from '../../components/UI';
// import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
// import { useToast } from 'react-native-toast-notifications';

// export default function AddUserScreen() {
//   const dispatch = useDispatch();
//   const navigation = useNavigation();
//   const toast = useToast();

//   const [fullName, setFullName] = useState('');
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async () => {
//     if (!fullName.trim() || !username.trim() || !password.trim()) {
//       toast.show('All fields are required', { type: 'danger' });
//       return;
//     }
//     setLoading(true);
//     try {
//       await dispatch(addUser({ name: fullName, username, password })).unwrap();
//       toast.show('User created successfully', { type: 'success' });
//       navigation.goBack();
//     } catch (error) {
//       toast.show(error.message || 'Failed to create user', { type: 'danger' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={styles.content}>
//       <View style={styles.card}>
//         <Text style={styles.title}>Add New User</Text>

//         <Input
//           label="Full Name"
//           value={fullName}
//           onChangeText={setFullName}
//           placeholder="Enter full name"
//           required
//         />
//         <Input
//           label="Username"
//           value={username}
//           onChangeText={setUsername}
//           placeholder="Enter username"
//           required
//           autoCapitalize="none"
//         />
//         <Input
//           label="Password"
//           value={password}
//           onChangeText={setPassword}
//           placeholder="Enter password"
//           secureTextEntry
//           required
//         />

//         <View style={styles.buttonRow}>
//           <Button title="Cancel" variant="secondary" onPress={() => navigation.goBack()} style={styles.button} />
//           <Button title="Save User" onPress={handleSubmit} loading={loading} style={styles.button} />
//         </View>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.gray50,
//   },
//   content: {
//     padding: SPACING.lg,
//   },
//   card: {
//     backgroundColor: COLORS.white,
//     borderRadius: BORDERS.radius.lg,
//     padding: SPACING.lg,
//     ...SHADOWS.medium,
//   },
//   title: {
//     ...FONTS.bold,
//     fontSize: 22,
//     color: COLORS.gray900,
//     marginBottom: SPACING.xl,
//     textAlign: 'center',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: SPACING.md,
//     marginTop: SPACING.lg,
//   },
//   button: {
//     flex: 1,
//   },
// });

//---------------------

// src/screens/admin/AddUserScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  User,
  Users,
  Shield,
  Wrench,
  Plus,
  X,
  ChevronLeft,
  Save,
} from 'lucide-react-native';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
import { useToast } from 'react-native-toast-notifications';
import { api } from '../../utils/api';
import { useDispatch } from 'react-redux';
import { fetchUsers } from '../../store/slices/userSlice';

const roleConfig = {
  user: { 
    icon: User, 
    bg: '#eff6ff', 
    border: '#3b82f6', 
    text: '#1d4ed8', 
    label: 'User (Reception)' 
  },
  engineer: { 
    icon: Wrench, 
    bg: '#f0fdf4', 
    border: '#22c55e', 
    text: '#15803d', 
    label: 'Engineer' 
  },
  admin: { 
    icon: Shield, 
    bg: '#fef3c7', 
    border: '#f59e0b', 
    text: '#b45309', 
    label: 'Admin' 
  },
};

export default function AddUserScreen({ navigation }) {
  const dispatch = useDispatch();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('user');
  const [loading, setLoading] = useState(false);
  const [repLoading, setRepLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'user',
  });

  const [repList, setRepList] = useState([]);
  const [newRepName, setNewRepName] = useState('');

  useEffect(() => {
    fetchReps();
  }, []);

  const fetchReps = async () => {
    try {
      const reps = await api.getSalesReps();
      setRepList(reps || []);
    } catch (error) {
      console.error('Fetch reps error:', error);
      setRepList([]);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) {
      toast.show('All fields required', { type: 'danger' });
      return;
    }

    try {
      setLoading(true);
      await api.addUser(form);
      toast.show('User created successfully', { type: 'success' });
      dispatch(fetchUsers());
      navigation.goBack();
    } catch (error) {
      toast.show(error.response?.data?.message || 'Error creating user', { type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRep = async () => {
    if (!newRepName.trim()) {
      toast.show('Name required', { type: 'danger' });
      return;
    }

    setRepLoading(true);
    try {
      await api.addSalesRep(newRepName.trim());
      setNewRepName('');
      fetchReps();
      toast.show('Sales rep added', { type: 'success' });
    } catch (error) {
      toast.show(error.response?.data?.message || 'Error adding rep', { type: 'danger' });
    } finally {
      setRepLoading(false);
    }
  };

  const handleDeleteRep = async (id, name) => {
    Alert.alert('Delete', `Delete sales rep "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteSalesRep(id);
            fetchReps();
            toast.show('Sales rep deleted', { type: 'success' });
          } catch (error) {
            toast.show('Failed to delete', { type: 'danger' });
          }
        },
      },
    ]);
  };

  const renderUserTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter full name"
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
          placeholderTextColor={COLORS.gray400}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter username"
          value={form.username}
          onChangeText={(text) => setForm({ ...form, username: text })}
          placeholderTextColor={COLORS.gray400}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          value={form.password}
          onChangeText={(text) => setForm({ ...form, password: text })}
          placeholderTextColor={COLORS.gray400}
          secureTextEntry
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Role</Text>
        <View style={styles.roleContainer}>
          {['user', 'engineer', 'admin'].map((role) => {
            const config = roleConfig[role];
            const isSelected = form.role === role;
            const Icon = config.icon;
            return (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleOption,
                  {
                    backgroundColor: isSelected ? config.bg : COLORS.gray50,
                    borderColor: isSelected ? config.border : COLORS.gray200,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => setForm({ ...form, role })}
              >
                <Icon size={16} color={isSelected ? config.text : COLORS.gray600} />
                <Text
                  style={[
                    styles.roleOptionText,
                    { color: isSelected ? config.text : COLORS.gray600 },
                  ]}
                >
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View
          style={[
            styles.roleBadge,
            {
              backgroundColor: roleConfig[form.role]?.bg,
              borderColor: roleConfig[form.role]?.border,
            },
          ]}
        >
          {(() => {
            const Icon = roleConfig[form.role]?.icon;
            return <Icon size={14} color={roleConfig[form.role]?.text} />;
          })()}
          <Text style={[styles.roleBadgeText, { color: roleConfig[form.role]?.text }]}>
            {roleConfig[form.role]?.label}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={loading}>
        <Save size={20} color={COLORS.white} />
        <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save User'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <X size={20} color={COLORS.gray600} />
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSalesRepTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.addRepContainer}>
        <TextInput
          style={styles.repInput}
          placeholder="Sales Rep Name (e.g. Kalai)"
          value={newRepName}
          onChangeText={setNewRepName}
          onSubmitEditing={handleAddRep}
          placeholderTextColor={COLORS.gray400}
        />
        <TouchableOpacity style={styles.addRepButton} onPress={handleAddRep} disabled={repLoading}>
          <Plus size={18} color={COLORS.white} />
          <Text style={styles.addRepButtonText}>{repLoading ? '...' : 'Add'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.repListContainer}>
        {repList.length === 0 ? (
          <Text style={styles.emptyRepText}>No sales reps yet. Add one above</Text>
        ) : (
          repList.map((rep) => (
            <View key={rep.id || rep._id} style={styles.repItem}>
              <View style={styles.repItemLeft}>
                <View style={[styles.repAvatar, { backgroundColor: '#dcfce7' }]}>
                  <Text style={[styles.repAvatarText, { color: '#166534' }]}>
                    {rep.name?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
                <Text style={styles.repItemName}>{rep.name}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteRep(rep.id || rep._id, rep.name)}>
                <Text style={styles.repDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {repList.length > 0 && (
        <Text style={styles.repCount}>
          {repList.length} sales rep{repList.length > 1 ? 's' : ''} registered
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ✅ Removed the header with "Add New User" text - only back button remains */}
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={COLORS.gray900} />
        </TouchableOpacity>
      </View> */}

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'user' && styles.tabActive]}
          onPress={() => setActiveTab('user')}
        >
          <User size={16} color={activeTab === 'user' ? COLORS.white : COLORS.gray600} />
          <Text style={[styles.tabText, activeTab === 'user' && styles.tabTextActive]}>
            Add User
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'salesrep' && styles.tabActive]}
          onPress={() => setActiveTab('salesrep')}
        >
          <Users size={16} color={activeTab === 'salesrep' ? COLORS.white : COLORS.gray600} />
          <Text style={[styles.tabText, activeTab === 'salesrep' && styles.tabTextActive]}>
            Sales Reps
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'user' ? renderUserTab() : renderSalesRepTab()}
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
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radius.md,
    gap: 6,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.gray600,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  tabContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray900,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    borderRadius: BORDERS.radius.md,
    gap: 4,
  },
  roleOptionText: {
    ...FONTS.medium,
    fontSize: 11,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDERS.radius.md,
    borderWidth: 1,
    gap: 4,
  },
  roleBadgeText: {
    ...FONTS.medium,
    fontSize: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginTop: SPACING.md,
    gap: 8,
  },
  saveButtonText: {
    ...FONTS.semibold,
    fontSize: 16,
    color: COLORS.white,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    gap: 8,
  },
  cancelButtonText: {
    ...FONTS.medium,
    fontSize: 16,
    color: COLORS.gray600,
  },
  addRepContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  repInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray900,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  addRepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radius.md,
    gap: 4,
  },
  addRepButtonText: {
    ...FONTS.semibold,
    fontSize: 14,
    color: COLORS.white,
  },
  repListContainer: {
    flex: 1,
  },
  repItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  repItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  repAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repAvatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  repItemName: {
    ...FONTS.medium,
    fontSize: 14,
    color: COLORS.gray800,
  },
  repDeleteText: {
    ...FONTS.medium,
    fontSize: 12,
    color: COLORS.error,
  },
  repCount: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray400,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  emptyRepText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray400,
    textAlign: 'center',
    paddingVertical: SPACING.xxl,
  },
});