#!/usr/bin/env node
/**
 * Admin Password Hash Generator
 *
 * Usage:
 *   node generate-admin-hash.mjs "YourPasswordHere"
 *
 * This script generates a bcrypt hash for the admin password.
 * Copy the output and paste it into the Supabase admins table.
 */

import bcrypt from 'bcrypt';

const password = process.argv[2];

if (!password) {
  console.error('\n❌ Error: No password provided');
  console.log('\n📝 Usage:');
  console.log('  node generate-admin-hash.mjs "YourPasswordHere"\n');
  process.exit(1);
}

if (password.length < 8) {
  console.error('\n⚠️  Warning: Password should be at least 8 characters long\n');
}

console.log('\n🔐 Generating password hash...\n');

const hash = await bcrypt.hash(password, 10);

console.log('✅ Hash generated successfully!\n');
console.log('━'.repeat(80));
console.log('\n📋 Copy this hash:\n');
console.log(`   ${hash}`);
console.log('\n━'.repeat(80));
console.log('\n📝 Next steps:');
console.log('   1. Go to Supabase Dashboard → Table Editor → admins');
console.log('   2. Click "Insert Row"');
console.log('   3. Fill in:');
console.log('      - email: gitika@sangeet.com (or your preferred email)');
console.log('      - name: Gitika (or your preferred name)');
console.log('      - hashed_password: [paste the hash above]');
console.log('      - role: superadmin');
console.log('   4. Click "Save"\n');
console.log('🔒 Your password is: ' + password);
console.log('📧 Remember to use this email and password to login!\n');
