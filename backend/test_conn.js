const postgres = require('postgres');
const sql = postgres('postgresql://postgres.civqoyhnqqggqzuizvsw:Swatadru%40123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres');
sql`SELECT 1 as num`.then(res => {
    console.log('Connected!', res);
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
