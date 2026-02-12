const pool = require('../config/db');

class Enrollment {
    static async getAll() {
        const query = `
      SELECT 
        e.id,
        e.student_id,
        e.course_id,
        e.enrollment_date,
        e.grade,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        s.email AS student_email,
        c.course_name,
        c.course_code
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN courses c ON e.course_id = c.id
      ORDER BY e.enrollment_date DESC
    `;
        const [rows] = await pool.execute(query);
        return rows;
    }

    static async getByStudentId(studentId) {
        const query = `
      SELECT 
        e.id,
        e.course_id,
        e.enrollment_date,
        e.grade,
        c.course_name,
        c.course_code,
        c.credits
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = ?
      ORDER BY e.enrollment_date DESC
    `;
        const [rows] = await pool.execute(query, [studentId]);
        return rows;
    }

    static async checkDuplicate(studentId, courseId) {
        const [rows] = await pool.execute(
            'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?',
            [studentId, courseId]
        );
        return rows.length > 0;
    }

    static async create(studentId, courseId) {
        const [result] = await pool.execute(
            'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)',
            [studentId, courseId]
        );
        return result;
    }

    static async updateGrade(id, grade) {
        const [result] = await pool.execute(
            'UPDATE enrollments SET grade = ? WHERE id = ?',
            [grade, id]
        );
        return result;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM enrollments WHERE id = ?', [id]);
        return result;
    }
}

module.exports = Enrollment;
