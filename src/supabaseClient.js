import { createClient } from '@supabase/supabase-js';

// CRA uses process.env, not import.meta.env
const supabaseUrl = process.env.REACT_APP_URL;
const supabaseKey = process.env.REACT_APP_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to fetch the user's profile
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error.message);
    return null;
  }

  return data;
};
