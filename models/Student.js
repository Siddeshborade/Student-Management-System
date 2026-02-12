const pool = require('../config/db');

class Student {
    static async getAll(search = '', sortBy = 'created_at', order = 'DESC') {
        const allowedSort = ['first_name', 'last_name', 'email', 'created_at', 'dob'];
        const allowedOrder = ['ASC', 'DESC'];

        const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'created_at';
        const sortOrder = allowedOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

        let query = 'SELECT * FROM students';
        let params = [];

        if (search) {
            query += ' WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?';
            const searchTerm = `%${search}%`;
            params = [searchTerm, searchTerm, searchTerm];
        }

        query += ` ORDER BY ${sortColumn} ${sortOrder}`;

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute('SELECT * FROM students WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { first_name, last_name, email, dob, phone, address } = data;
        const [result] = await pool.execute(
            'INSERT INTO students (first_name, last_name, email, dob, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, dob, phone || null, address || null]
        );
        return result;
    }

    static async update(id, data) {
        const { first_name, last_name, email, dob, phone, address } = data;
        const [result] = await pool.execute(
            'UPDATE students SET first_name = ?, last_name = ?, email = ?, dob = ?, phone = ?, address = ? WHERE id = ?',
            [first_name, last_name, email, dob, phone || null, address || null, id]
        );
        return result;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM students WHERE id = ?', [id]);
        return result;
    }
}

module.exports = Student;
