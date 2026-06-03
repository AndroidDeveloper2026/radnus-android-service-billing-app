// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/UI';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
import { useToast } from 'react-native-toast-notifications';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();

  const handleLogin = async () => {
    if (!username || !password) {
      toast.show('Please enter username and password', { type: 'danger' });
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      toast.show('Login successful', { type: 'success' });
    } catch (error) {
      toast.show(error.message || 'Login failed', { type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>R</Text>
            </View>
            <Text style={styles.appName}>RADNUS</Text>
            <Text style={styles.tagline}>Service Billing App</Text>
          </View>

          <View style={styles.card}>
            <Input
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              required
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              required
            />
            <Button title="Sign In" onPress={handleLogin} loading={loading} style={styles.loginButton} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 RADNUS COMMUNICATION</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  logoText: {
    fontSize: 40,
    color: COLORS.white,
    ...FONTS.bold,
  },
  appName: {
    ...FONTS.bold,
    fontSize: 32,
    color: COLORS.gray900,
  },
  tagline: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray500,
    marginTop: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.xl,
    padding: SPACING.xl,
    ...SHADOWS.large,
  },
  loginButton: {
    marginTop: SPACING.md,
  },
  footer: {
    marginTop: SPACING.xxxl,
    alignItems: 'center',
  },
  footerText: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray400,
  },
});