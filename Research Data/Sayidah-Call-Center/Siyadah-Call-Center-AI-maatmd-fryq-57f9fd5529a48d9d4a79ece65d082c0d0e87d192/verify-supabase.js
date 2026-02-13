
const postgres = require('postgres');

async function verifySupabaseData() {
  console.log('🔍 Verifying Supabase data...');
  
  const client = postgres(process.env.DATABASE_URL, {
    prepare: false,
    ssl: 'require',
    max: 1,
  });

  try {
    // اختبار الاتصال
    await client`SELECT 1`;
    console.log('✅ Database connection successful');

    // عرض الجداول المتاحة
    const tables = await client`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('\n📊 Available tables:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    // عدد السجلات في كل جدول
    console.log('\n📈 Record counts:');
    for (const table of tables) {
      try {
        const count = await client`SELECT COUNT(*) as count FROM ${client(table.table_name)}`;
        console.log(`  - ${table.table_name}: ${count[0].count} records`);
      } catch (error) {
        console.log(`  - ${table.table_name}: Error counting records`);
      }
    }

    // عرض بعض البيانات النموذجية
    console.log('\n🔍 Sample data:');
    
    try {
      const opportunities = await client`SELECT name, value, stage FROM opportunities LIMIT 3`;
      console.log('  Opportunities:');
      opportunities.forEach(opp => {
        console.log(`    - ${opp.name}: $${opp.value} (${opp.stage})`);
      });
    } catch (error) {
      console.log('  No opportunities data found');
    }

    try {
      const aiMembers = await client`SELECT name, specialization, active_deals FROM ai_team_members LIMIT 3`;
      console.log('  AI Team Members:');
      aiMembers.forEach(member => {
        console.log(`    - ${member.name}: ${member.specialization} (${member.active_deals} deals)`);
      });
    } catch (error) {
      console.log('  No AI team members data found');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await client.end();
  }
}

// تشغيل التحقق
verifySupabaseData();
