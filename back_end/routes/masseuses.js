const express = require('express');
const router = express.Router({ mergeParams: true });

const { getMasseuses, addMasseuse ,getAllMasseuses, deleteMasseuse ,updateMasseuse,getSingleMasseuse} = require('../controllers/masseuses');
const { protect, authorize } = require('../middleware/auth');

// GET masseuses of shop
router.route('/')
.get(getMasseuses)
.post(protect, authorize('admin'), addMasseuse);

router.delete('/:id', protect, authorize('admin'), deleteMasseuse);
router.put('/:id', protect, authorize('admin'), updateMasseuse);
router.get('/all', getAllMasseuses);
router.get('/:id',protect,getSingleMasseuse);
module.exports = router;