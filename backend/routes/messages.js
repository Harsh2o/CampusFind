const express = require('express');
const { protect } = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/messages/:userId
// @desc    Get conversation between logged in user and another user
// @access  Private
router.get('/:userId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    }).sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/messages/contacts/list
// @desc    Get list of users the logged in user has chatted with
// @access  Private
router.get('/contacts/list', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    }).populate('sender', 'username').populate('receiver', 'username').sort({ createdAt: -1 });

    const contactsMap = new Map();
    
    messages.forEach(msg => {
      // Find the "other" user
      const otherUser = msg.sender._id.toString() === req.user._id.toString() ? msg.receiver : msg.sender;
      if (!contactsMap.has(otherUser._id.toString())) {
        contactsMap.set(otherUser._id.toString(), {
          _id: otherUser._id,
          username: otherUser.username,
          lastMessage: msg.content,
          timestamp: msg.createdAt
        });
      }
    });

    res.json(Array.from(contactsMap.values()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
