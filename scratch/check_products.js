const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, our_price');
  
  if (error) {
    console.error('Error fetching products:', error.message);
    return;
  }
  
  console.log('Products Count:', data.length);
  console.log('Products:', JSON.stringify(data, null, 2));
}

checkProducts();
