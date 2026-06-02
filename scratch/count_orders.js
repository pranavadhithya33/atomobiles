const { createClient } = require('@supabase/supabase-js');

// Print values to check if they are present in process.env already
console.log('NEXT_PUBLIC_SUPABASE_URL from system:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY is present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing env variables in environment. Exiting.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function countOrders() {
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact' });
  
  if (error) {
    console.error('Error counting orders:', error.message);
    return;
  }
  
  console.log('Total orders in database:', count);
}

countOrders();
