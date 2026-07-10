require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('Checking database connection to:', supabaseUrl);

  try {
    // Check users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(5);
    
    if (usersError) console.error('Error fetching users:', usersError.message);
    else console.log(`Users found: ${users?.length || 0}`);

    // Check products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .limit(5);

    if (productsError) console.error('Error fetching products:', productsError.message);
    else console.log(`Products found: ${products?.length || 0}`);

    // Check orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .limit(5);

    if (ordersError) console.error('Error fetching orders:', ordersError.message);
    else console.log(`Orders found: ${orders?.length || 0}`);

    console.log('Database check complete.');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkData();
