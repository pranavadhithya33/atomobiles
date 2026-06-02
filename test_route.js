require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function run() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Try to update current_step and step1 for the first order
  const { data: orders, error: fetchErr } = await supabase.from('orders').select('id').limit(1);
  if (fetchErr || !orders.length) return console.log('No orders');
  
  const id = orders[0].id;
  const updateData = { step1: 'Test', current_step: 1 };
  
  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  console.log('Error:', error);
  console.log('Data:', data);
}
run();
