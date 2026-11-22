const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getConversations, markMessagesRead } = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');
const { verifiedDoctorOrOtherRoleMiddleware } = require('../middlewares/roleMiddleware');

router.post('/send', authMiddleware, verifiedDoctorOrOtherRoleMiddleware, sendMessage);
router.get('/conversations', authMiddleware, verifiedDoctorOrOtherRoleMiddleware, getConversations);
router.put('/read/:senderId', authMiddleware, verifiedDoctorOrOtherRoleMiddleware, markMessagesRead);
router.get('/:userId', authMiddleware, verifiedDoctorOrOtherRoleMiddleware, getMessages);

module.exports = router;
