const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const auth = require('../middleware/auth');

router.get('/', auth, enrollmentController.getAll);
router.get('/student/:studentId', auth, enrollmentController.getByStudent);
router.post('/', auth, enrollmentController.create);
router.put('/:id/grade', auth, enrollmentController.updateGrade);
router.delete('/:id', auth, enrollmentController.delete);

module.exports = router;
