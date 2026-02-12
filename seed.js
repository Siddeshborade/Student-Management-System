const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function seed() {
    try {
        // Check if admin user already exists
        const [rows] = await pool.execute('SELECT id FROM users WHERE username = ?', ['admin']);

        if (rows.length > 0) {
            console.log('Admin user already exists. Skipping seed.');
            process.exit(0);
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await pool.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            ['admin', hashedPassword, 'admin']
        );

        console.log('Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: admin123');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
}

seed();
