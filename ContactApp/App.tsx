import React, { useState, useRef, useCallback } from 'react';
import {
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
import './global.css';

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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.parallel([
      Animated.spring(borderAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 60,
        friction: 8,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.01,
        useNativeDriver: false,
        tension: 60,
        friction: 8,
      }),
    ]).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.parallel([
      Animated.spring(borderAnim, {
        toValue: 0,
        useNativeDriver: false,
        tension: 60,
        friction: 8,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 60,
        friction: 8,
      }),
    ]).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#9333EA'],
  });

  const shadowOpacity = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  return (
    <View className="mb-5">
      <View className="flex-row items-center mb-2">
        <Text className="text-sm mr-1.5">{icon}</Text>
        <Text
          className={`text-xs font-semibold uppercase tracking-wider ${
            isFocused ? 'text-purple-600' : 'text-gray-500'
          }`}
        >
          {label}
        </Text>
      </View>
      <Animated.View
        style={[
          {
            borderRadius: 12,
            borderWidth: 1.5,
            backgroundColor: isFocused ? '#FAF5FF' : '#FFFFFF',
            borderColor,
            shadowColor: '#9333EA',
            shadowOpacity,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: isFocused ? 4 : 1,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TextInput
          className={`px-4 py-3.5 text-base text-gray-900 font-normal ${
            multiline ? 'min-h-[120px] pt-3.5' : ''
          }`}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#C4B5CC"
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor="#9333EA"
        />
      </Animated.View>
      {error ? (
        <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

// --- Success Animation Component ---
function SuccessOverlay({
  visible,
  onReset,
}: {
  visible: boolean;
  onReset: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
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
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.97)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View
        className="bg-white rounded-3xl p-10 items-center shadow-2xl"
        style={{
          width: width - 60,
          maxWidth: 360,
          borderWidth: 1,
          borderColor: '#F3E8FF',
          shadowColor: '#9333EA',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
          elevation: 12,
        }}
      >
        {/* Success checkmark circle */}
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-5"
          style={{ backgroundColor: '#F3E8FF' }}
        >
          <Text className="text-4xl">✓</Text>
        </View>
        <Text className="text-2xl font-extrabold text-gray-900 mb-2">
          Message Sent!
        </Text>
        <Text className="text-sm text-gray-500 text-center leading-5 mb-7">
          Thank you for reaching out. We'll get back to you shortly.
        </Text>
        <TouchableOpacity
          className="w-full rounded-xl overflow-hidden"
          onPress={onReset}
        >
          <LinearGradient
            colors={['#9333EA', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingVertical: 16,
              alignItems: 'center',
              borderRadius: 12,
            }}
          >
            <Text className="text-white text-base font-bold">
              Send Another Message
            </Text>
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
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
        form.email.trim()
      )
    ) {
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
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Subtle purple accent at very top */}
      <LinearGradient
        colors={['#F3E8FF', '#FFFFFF']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 200,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: Platform.OS === 'ios' ? 64 : 48,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="items-center mb-8">
            {/* Icon badge */}
            <View
              className="mb-4"
              style={{
                shadowColor: '#9333EA',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={['#9333EA', '#7C3AED']}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text className="text-2xl">✉️</Text>
              </LinearGradient>
            </View>
            <Text className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Get in Touch
            </Text>
            <Text className="text-sm text-gray-400 text-center leading-5 px-6">
              We'd love to hear from you. Fill out the form below and we'll
              respond as soon as possible.
            </Text>
          </View>

          {/* Form Card */}
          <View
            className="bg-white rounded-2xl p-6 mb-6"
            style={{
              borderWidth: 1,
              borderColor: '#F0E6F6',
              shadowColor: '#9333EA',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 20,
              elevation: 3,
            }}
          >
            {/* Purple accent line at top of card */}
            <LinearGradient
              colors={['#9333EA', '#C084FC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}
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
            <Text className="text-right text-gray-300 text-xs -mt-3 mb-5">
              {form.message.length}/5000
            </Text>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
              style={{
                borderRadius: 14,
                shadowColor: '#9333EA',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 6,
              }}
            >
              <LinearGradient
                colors={
                  isSubmitting
                    ? ['#C084FC', '#C084FC']
                    : ['#9333EA', '#7C3AED']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 14,
                  paddingVertical: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSubmitting ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text className="text-white text-lg font-bold tracking-wide">
                      Sending...
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Text className="text-lg">🚀</Text>
                    <Text className="text-white text-lg font-bold tracking-wide">
                      Send Message
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="items-center mt-4">
            <Text className="text-xs text-gray-300 font-medium">
              Powered by Supabase ⚡
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Overlay */}
      <SuccessOverlay visible={showSuccess} onReset={handleReset} />
    </View>
  );
}
