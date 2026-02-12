const Enrollment = require('../models/Enrollment');

exports.getAll = async (req, res) => {
    try {
        const enrollments = await Enrollment.getAll();
        res.json(enrollments);
    } catch (err) {
        console.error('Get enrollments error:', err);
        res.status(500).json({ message: 'Error fetching enrollments.' });
    }
};

exports.getByStudent = async (req, res) => {
    try {
        const enrollments = await Enrollment.getByStudentId(req.params.studentId);
        res.json(enrollments);
    } catch (err) {
        console.error('Get student enrollments error:', err);
        res.status(500).json({ message: 'Error fetching enrollments.' });
    }
};

exports.create = async (req, res) => {
    try {
        const { student_id, course_id } = req.body;

        if (!student_id || !course_id) {
            return res.status(400).json({ message: 'Student ID and Course ID are required.' });
        }

        // Check for duplicate enrollment
        const isDuplicate = await Enrollment.checkDuplicate(student_id, course_id);
        if (isDuplicate) {
            return res.status(409).json({ message: 'Student is already enrolled in this course.' });
        }

        const result = await Enrollment.create(student_id, course_id);
        res.status(201).json({ message: 'Student enrolled successfully.', id: result.insertId });
    } catch (err) {
        console.error('Create enrollment error:', err);
        res.status(500).json({ message: 'Error creating enrollment.' });
    }
};

exports.updateGrade = async (req, res) => {
    try {
        const { grade } = req.body;
        const result = await Enrollment.updateGrade(req.params.id, grade);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Enrollment not found.' });
        }
        res.json({ message: 'Grade updated successfully.' });
    } catch (err) {
        console.error('Update grade error:', err);
        res.status(500).json({ message: 'Error updating grade.' });
    }
};

exports.delete = async (req, res) => {
    try {
        const result = await Enrollment.delete(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Enrollment not found.' });
        }
        res.json({ message: 'Student unenrolled successfully.' });
    } catch (err) {
        console.error('Delete enrollment error:', err);
        res.status(500).json({ message: 'Error removing enrollment.' });
    }
};
