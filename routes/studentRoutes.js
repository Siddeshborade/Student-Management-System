const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');

router.get('/', auth, studentController.getAll);
router.get('/:id', auth, studentController.getById);
router.post('/', auth, studentController.create);
router.put('/:id', auth, studentController.update);
router.delete('/:id', auth, studentController.delete);

module.exports = router;
