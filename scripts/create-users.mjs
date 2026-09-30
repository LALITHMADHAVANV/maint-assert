import { createClient } from '@supabase/supabase-js';

try {
  process.loadEnvFile('.env.local');
} catch (e) {
  // If .env.local not found, check process.env
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const USERS = [
  { email: 'ceo@textech.garments', password: 'password123', uid: 'CEO-01', name: 'Dr. K. Ramanathan', role: 'CEO', title: 'Chief Executive Officer' },
  { email: 'admin@textech.garments', password: 'password123', uid: 'ADM-01', name: 'V. Sundaram', role: 'ADMIN', title: 'Plant Administrator' },
  { email: 'seniormechanic@textech.garments', password: 'password123', uid: 'MEC-01', name: 'Ramesh Kumar', role: 'SENIOR_MECHANIC', title: 'Senior Mechanic' },
  { email: 'mechanic@textech.garments', password: 'password123', uid: 'MEC-08', name: 'Suresh Babu', role: 'MECHANIC', title: 'Line Mechanic' },
  { email: 'stores@textech.garments', password: 'password123', uid: 'STR-01', name: 'M. Arumugam', role: 'STORE_PERSON', title: 'Store In-Charge' },
];

async function main() {
  try {
    for (const u of USERS) {
      console.log(`Creating ${u.email}...`);
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true
      });

      if (authError) {
        if (authError.message.includes('already registered') || authError.code === 'email_exists') {
          console.log(`User ${u.email} already exists, updating password...`);
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = listData?.users.find(user => user.email === u.email);
          if (existingUser) {
            await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { password: u.password, email_confirm: true });
            const { error: profileError } = await supabaseAdmin.from('users').upsert({
              id: existingUser.id,
              uid: u.uid,
              name: u.name,
              email: u.email,
              role: u.role,
              title: u.title
            });
            if (profileError) throw profileError;
          }
          continue;
        } else {
          throw authError;
        }
      }

      if (authData.user) {
        console.log(`User ${u.email} created. Inserting profile...`);
        const { error: profileError } = await supabaseAdmin.from('users').upsert({
          id: authData.user.id,
          uid: u.uid,
          name: u.name,
          email: u.email,
          role: u.role,
          title: u.title
        });

        if (profileError) throw profileError;
      }
    }
    console.log('All done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
