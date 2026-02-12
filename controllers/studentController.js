const Student = require('../models/Student');

// Validation helpers
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => !phone || /^[\d\s\-\+\(\)]{7,15}$/.test(phone);

exports.getAll = async (req, res) => {
    try {
        const { search, sortBy, order } = req.query;
        const students = await Student.getAll(search, sortBy, order);
        res.json(students);
    } catch (err) {
        console.error('Get students error:', err);
        res.status(500).json({ message: 'Error fetching students.' });
    }
};

exports.getById = async (req, res) => {
    try {
        const student = await Student.getById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        res.json(student);
    } catch (err) {
        console.error('Get student error:', err);
        res.status(500).json({ message: 'Error fetching student.' });
    }
};

exports.create = async (req, res) => {
    try {
        const { first_name, last_name, email, dob, phone, address } = req.body;

        // Validation
        if (!first_name || !last_name || !email || !dob) {
            return res.status(400).json({ message: 'First name, last name, email, and date of birth are required.' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }
        if (!isValidPhone(phone)) {
            return res.status(400).json({ message: 'Invalid phone number format.' });
        }

        const result = await Student.create({ first_name, last_name, email, dob, phone, address });
        res.status(201).json({ message: 'Student created successfully.', id: result.insertId });
    } catch (err) {
        console.error('Create student error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'A student with this email already exists.' });
        }
        res.status(500).json({ message: 'Error creating student.' });
    }
};

exports.update = async (req, res) => {
    try {
        const { first_name, last_name, email, dob, phone, address } = req.body;

        if (!first_name || !last_name || !email || !dob) {
            return res.status(400).json({ message: 'First name, last name, email, and date of birth are required.' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }
        if (!isValidPhone(phone)) {
            return res.status(400).json({ message: 'Invalid phone number format.' });
        }

        const result = await Student.update(req.params.id, { first_name, last_name, email, dob, phone, address });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        res.json({ message: 'Student updated successfully.' });
    } catch (err) {
        console.error('Update student error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'A student with this email already exists.' });
        }
        res.status(500).json({ message: 'Error updating student.' });
    }
};

exports.delete = async (req, res) => {
    try {
        const result = await Student.delete(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        res.json({ message: 'Student deleted successfully.' });
    } catch (err) {
        console.error('Delete student error:', err);
        res.status(500).json({ message: 'Error deleting student.' });
    }
};
