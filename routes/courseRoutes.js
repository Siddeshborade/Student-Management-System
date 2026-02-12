const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');

router.get('/', auth, courseController.getAll);
router.get('/:id', auth, courseController.getById);
router.post('/', auth, courseController.create);
router.put('/:id', auth, courseController.update);
router.delete('/:id', auth, courseController.delete);

module.exports = router;
