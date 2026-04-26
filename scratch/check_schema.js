require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkSchema() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    console.log('Missing env variables');
    return;
  }
  
  const supabase = createClient(supabaseUrl, serviceKey);
  
  // Try to select user_id from orders
  const { data, error } = await supabase.from('orders').select('user_id').limit(1);
  if (error) {
    if (error.message.includes('column "user_id" does not exist')) {
      console.log('COLUMN_MISSING: user_id');
    } else {
      console.error('Error checking schema:', error.message);
    }
  } else {
    console.log('COLUMN_EXISTS: user_id');
  }
}

checkSchema();
