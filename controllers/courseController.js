const Course = require('../models/Course');

exports.getAll = async (req, res) => {
    try {
        const courses = await Course.getAll();
        res.json(courses);
    } catch (err) {
        console.error('Get courses error:', err);
        res.status(500).json({ message: 'Error fetching courses.' });
    }
};

exports.getById = async (req, res) => {
    try {
        const course = await Course.getById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found.' });
        }
        res.json(course);
    } catch (err) {
        console.error('Get course error:', err);
        res.status(500).json({ message: 'Error fetching course.' });
    }
};

exports.create = async (req, res) => {
    try {
        const { course_name, course_code, credits } = req.body;

        if (!course_name || !course_code || credits === undefined) {
            return res.status(400).json({ message: 'Course name, code, and credits are required.' });
        }

        const creditsNum = parseInt(credits);
        if (isNaN(creditsNum) || creditsNum < 1 || creditsNum > 10) {
            return res.status(400).json({ message: 'Credits must be a number between 1 and 10.' });
        }

        const result = await Course.create({ course_name, course_code, credits: creditsNum });
        res.status(201).json({ message: 'Course created successfully.', id: result.insertId });
    } catch (err) {
        console.error('Create course error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'A course with this code already exists.' });
        }
        res.status(500).json({ message: 'Error creating course.' });
    }
};

exports.update = async (req, res) => {
    try {
        const { course_name, course_code, credits } = req.body;

        if (!course_name || !course_code || credits === undefined) {
            return res.status(400).json({ message: 'Course name, code, and credits are required.' });
        }

        const creditsNum = parseInt(credits);
        if (isNaN(creditsNum) || creditsNum < 1 || creditsNum > 10) {
            return res.status(400).json({ message: 'Credits must be a number between 1 and 10.' });
        }

        const result = await Course.update(req.params.id, { course_name, course_code, credits: creditsNum });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Course not found.' });
        }
        res.json({ message: 'Course updated successfully.' });
    } catch (err) {
        console.error('Update course error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'A course with this code already exists.' });
        }
        res.status(500).json({ message: 'Error updating course.' });
    }
};

exports.delete = async (req, res) => {
    try {
        const result = await Course.delete(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Course not found.' });
        }
        res.json({ message: 'Course deleted successfully.' });
    } catch (err) {
        console.error('Delete course error:', err);
        res.status(500).json({ message: 'Error deleting course.' });
    }
};
