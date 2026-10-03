import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Type for contact form data
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

// Submit contact form to Supabase
export async function submitContactForm(data: ContactFormData) {
  const { data: result, error } = await supabase
    .from('contacts')
    .insert([
      {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim() || null,
        subject: data.subject.trim(),
        message: data.message.trim(),
      },
    ])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return result;
}
