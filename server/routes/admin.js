const express = require('express');
const router = express.Router();
const {
  getDashboard, getAllUsers, createUser, updateUser, deleteUser,
  getAllServices, createService, updateService, deleteService, exportCSV
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/services', getAllServices);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);
router.get('/export', exportCSV);

module.exports = router;
