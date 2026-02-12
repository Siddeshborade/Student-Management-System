const pool = require('../config/db');

class Course {
    static async getAll() {
        const [rows] = await pool.execute('SELECT * FROM courses ORDER BY course_name ASC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute('SELECT * FROM courses WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { course_name, course_code, credits } = data;
        const [result] = await pool.execute(
            'INSERT INTO courses (course_name, course_code, credits) VALUES (?, ?, ?)',
            [course_name, course_code, credits]
        );
        return result;
    }

    static async update(id, data) {
        const { course_name, course_code, credits } = data;
        const [result] = await pool.execute(
            'UPDATE courses SET course_name = ?, course_code = ?, credits = ? WHERE id = ?',
            [course_name, course_code, credits, id]
        );
        return result;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM courses WHERE id = ?', [id]);
        return result;
    }
}

module.exports = Course;
