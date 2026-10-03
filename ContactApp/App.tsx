import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { submitContactForm, ContactFormData } from './lib/supabase';

const { width } = Dimensions.get('window');

// --- Animated Input Component ---
interface AnimatedInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  icon: string;
  error?: string;
}

function AnimatedInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  icon,
  error,
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.parallel([
      Animated.spring(borderAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.parallel([
      Animated.spring(borderAnim, {
        toValue: 0,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.08)', '#7C3AED'],
  });

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <View style={styles.inputWrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.inputIcon}>{icon}</Text>
        <Text style={[styles.inputLabel, isFocused && styles.inputLabelFocused]}>
          {label}
        </Text>
      </View>
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor,
            shadowColor: '#7C3AED',
            shadowOpacity,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            isFocused && styles.inputFocused,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.25)"
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor="#7C3AED"
        />
      </Animated.View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

// --- Success Animation Component ---
function SuccessOverlay({ visible, onReset }: { visible: boolean; onReset: () => void }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 5,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.successOverlay,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.successCard}>
        <Text style={styles.successEmoji}>✅</Text>
        <Text style={styles.successTitle}>Message Sent!</Text>
        <Text style={styles.successSubtitle}>
          Thank you for reaching out. We'll get back to you shortly.
        </Text>
        <TouchableOpacity style={styles.successButton} onPress={onReset}>
          <LinearGradient
            colors={['#7C3AED', '#6D28D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.successButtonGradient}
          >
            <Text style={styles.successButtonText}>Send Another</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// --- Main App ---
export default function App() {
  const [form, setForm] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Floating orb animations
  const orb1 = useRef(new Animated.Value(0)).current;
  const orb2 = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animateOrbs = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(orb1, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(orb1, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(orb2, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(orb2, {
            toValue: 0,
            duration: 8000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    animateOrbs();
  }, []);

  const orb1TranslateY = orb1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const orb2TranslateX = orb2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 25],
  });

  const updateField = useCallback(
    (field: keyof ContactFormData) => (value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email';
    }

    if (form.phone.trim() && form.phone.trim().length > 20) {
      newErrors.phone = 'Phone number too long';
    }

    if (!form.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!form.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (form.message.trim().length > 5000) {
      newErrors.message = 'Message is too long (max 5000 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await submitContactForm(form);
      setShowSuccess(true);
    } catch (error: any) {
      Alert.alert(
        'Submission Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setShowSuccess(false);
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    setErrors({});
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Gradient */}
      <LinearGradient
        colors={['#0F0A1A', '#1A0E2E', '#0D0B14']}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Orbs */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          { transform: [{ translateY: orb1TranslateY }] },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          { transform: [{ translateX: orb2TranslateX }] },
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <LinearGradient
                colors={['#7C3AED', '#A855F7']}
                style={styles.headerIconGradient}
              >
                <Text style={styles.headerIcon}>✉️</Text>
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>Get in Touch</Text>
            <Text style={styles.headerSubtitle}>
              We'd love to hear from you. Fill out the form below and we'll respond as soon as possible.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Glass effect top border */}
            <LinearGradient
              colors={['rgba(124,58,237,0.4)', 'rgba(124,58,237,0)']}
              style={styles.cardTopBorder}
            />

            <AnimatedInput
              label="Full Name"
              value={form.name}
              onChangeText={updateField('name')}
              placeholder="John Doe"
              icon="👤"
              error={errors.name}
            />

            <AnimatedInput
              label="Email Address"
              value={form.email}
              onChangeText={updateField('email')}
              placeholder="john@example.com"
              keyboardType="email-address"
              icon="📧"
              error={errors.email}
            />

            <AnimatedInput
              label="Phone (Optional)"
              value={form.phone}
              onChangeText={updateField('phone')}
              placeholder="+1 (555) 123-4567"
              keyboardType="phone-pad"
              icon="📱"
              error={errors.phone}
            />

            <AnimatedInput
              label="Subject"
              value={form.subject}
              onChangeText={updateField('subject')}
              placeholder="How can we help?"
              icon="📝"
              error={errors.subject}
            />

            <AnimatedInput
              label="Message"
              value={form.message}
              onChangeText={updateField('message')}
              placeholder="Tell us more about your inquiry..."
              multiline
              numberOfLines={5}
              icon="💬"
              error={errors.message}
            />

            {/* Character count */}
            <Text style={styles.charCount}>
              {form.message.length}/5000
            </Text>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
              style={styles.submitTouchable}
            >
              <LinearGradient
                colors={isSubmitting ? ['#4C1D95', '#3B0764'] : ['#7C3AED', '#6D28D9', '#5B21B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitButton}
              >
                {isSubmitting ? (
                  <View style={styles.submitContent}>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={styles.submitText}>Sending...</Text>
                  </View>
                ) : (
                  <View style={styles.submitContent}>
                    <Text style={styles.submitEmoji}>🚀</Text>
                    <Text style={styles.submitText}>Send Message</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Powered by Supabase ⚡</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Overlay */}
      <SuccessOverlay visible={showSuccess} onReset={handleReset} />
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A1A',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },

  // Floating Orbs
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    top: -50,
    right: -60,
  },
  orb2: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(168, 85, 247, 0.06)',
    bottom: 100,
    left: -40,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIconContainer: {
    marginBottom: 16,
  },
  headerIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  // Form Card
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  cardTopBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },

  // Input
  inputWrapper: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputLabelFocused: {
    color: '#A855F7',
  },
  inputContainer: {
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  inputMultiline: {
    minHeight: 120,
    paddingTop: 14,
  },
  inputFocused: {
    backgroundColor: 'rgba(124,58,237,0.04)',
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },

  // Character Count
  charCount: {
    textAlign: 'right',
    color: 'rgba(255,255,255,0.25)',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 20,
  },

  // Submit
  submitTouchable: {
    borderRadius: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitEmoji: {
    fontSize: 18,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.2)',
    fontWeight: '500',
  },

  // Success Overlay
  successOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 10, 26, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  successCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 28,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
    width: width - 60,
    maxWidth: 360,
  },
  successEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  successButton: {
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
  },
  successButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
