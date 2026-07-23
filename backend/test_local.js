const postgres = require('postgres');
const sql = postgres('postgresql://postgres:12102004@localhost:5432/recipe_generator');
sql`SELECT COUNT(*) as num FROM recipes`.then(res => {
    console.log('Local recipes:', res[0].num);
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
