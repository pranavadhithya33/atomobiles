require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Checking for user_id column in orders...');
  const { data, error } = await supabase.from('orders').select('user_id').limit(1);
  if (error) {
    console.log('Column user_id missing or error:', error.message);
    console.log('I cannot run raw SQL from here. Please go to Supabase Dashboard > SQL Editor and run the content of supabase/auth_coins.sql');
  } else {
    console.log('Column user_id exists!');
  }
}

run();
