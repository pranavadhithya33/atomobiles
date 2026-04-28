const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function manageUserCoins() {
  const email = 'pranavadhithya333@gmail.com';
  
  // 1. Find user by email in auth.users
  // Note: we can't search auth.users easily without a filter, but we can search profiles if they exist
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .ilike('name', '%pranav%'); // Just to find them if email isn't in profiles
    
  console.log('Searching for user...');
  
  // Actually, let's just get all profiles to find the right one
  const { data: allProfiles } = await supabase.from('profiles').select('id, name, coins_balance');
  const targetUser = allProfiles.find(p => p.name.toLowerCase().includes('pranav') || p.id === '1ecd5a7a-de28-4413-a97c-9be04cde11ea');

  if (targetUser) {
    console.log('Found user:', targetUser);
    
    // Give them 5000 coins for testing if they have less
    if (targetUser.coins_balance < 5000) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ coins_balance: 5000 })
        .eq('id', targetUser.id)
        .select();
        
      if (error) console.error('Error updating coins:', error);
      else console.log('Updated user coins to 5000:', data[0]);
    }
  } else {
    console.log('User not found in profiles. They might need to sign in first.');
  }
}

manageUserCoins();
