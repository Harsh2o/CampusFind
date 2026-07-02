const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 16 * 1024 * 1024 } // 16MB
});

// ================= GLOBAL ITEMS =================

// @route   GET /api/items/recent
// @desc    Get 4 most recent items (lost & found) for landing page
// @access  Public
router.get('/recent', async (req, res) => {
  try {
    const lostItems = await LostItem.find().sort({ createdAt: -1 }).limit(2);
    const foundItems = await FoundItem.find().sort({ createdAt: -1 }).limit(2);
    
    // Add type tag
    const formattedLost = lostItems.map(item => ({ ...item.toObject(), itemType: 'lost' }));
    const formattedFound = foundItems.map(item => ({ ...item.toObject(), itemType: 'found' }));
    
    res.json([...formattedLost, ...formattedFound]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/items/my-items
// @desc    Get items reported by the logged-in user
// @access  Private
router.get('/my-items', protect, async (req, res) => {
  try {
    const lostItems = await LostItem.find({ user: req.user._id }).sort({ createdAt: -1 });
    const foundItems = await FoundItem.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    const formattedLost = lostItems.map(item => ({ ...item.toObject(), itemType: 'lost' }));
    const formattedFound = foundItems.map(item => ({ ...item.toObject(), itemType: 'found' }));
    
    res.json([...formattedLost, ...formattedFound]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/items/:type/:id
// @desc    Update an item's status
// @access  Private
router.put('/:type/:id', protect, async (req, res) => {
  try {
    const Model = req.params.type === 'lost' ? LostItem : FoundItem;
    const item = await Model.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership or admin
    if (item.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    item.itemStatus = req.body.status || item.itemStatus;
    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= LOST ITEMS =================

// @route   GET /api/items/lost
// @desc    Get all lost items (with search & filter)
// @access  Public
router.get('/lost', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;

    const items = await LostItem.find(query).populate('user', 'username').sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/items/lost
// @desc    Report a lost item
// @access  Private
router.post('/lost', protect, upload.single('image'), async (req, res) => {
  try {
    const { name, category, dateLost, location, description, contactInfo, lat, lng } = req.body;
    
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const item = new LostItem({
      name, category, dateLost, location, description, contactInfo, imagePath,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      user: req.user._id
    });

    const createdItem = await item.save();

    // SMART MATCHING ALGORITHM
    // Find "Found" items that match the category and share keywords in name/description
    const keywords = name.split(' ').filter(word => word.length > 3).join('|');
    const regex = new RegExp(keywords, 'i');

    const potentialMatches = await FoundItem.find({
      category: category,
      itemStatus: { $ne: 'Returned' },
      $or: [
        { name: regex },
        { description: regex },
        { location: { $regex: new RegExp(location.split(' ')[0], 'i') } } // basic location match
      ]
    }).limit(3);

    res.status(201).json({ item: createdItem, matches: potentialMatches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/items/lost/:id
// @desc    Delete a lost item
// @access  Private (Owner or Admin)
router.delete('/lost/:id', protect, async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    if (item.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (item.imagePath) {
      const filePath = path.join(__dirname, '..', item.imagePath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await LostItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= FOUND ITEMS =================

// @route   GET /api/items/found
// @desc    Get all found items (with search & filter)
// @access  Public
router.get('/found', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;

    const items = await FoundItem.find(query).populate('user', 'username').sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/items/found
// @desc    Report a found item
// @access  Private
router.post('/found', protect, upload.single('image'), async (req, res) => {
  try {
    const { name, category, dateFound, location, description, contactInfo, itemStatus, lat, lng } = req.body;
    
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const item = new FoundItem({
      name, category, dateFound, location, description, contactInfo, imagePath, itemStatus,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      user: req.user._id
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/items/found/:id
// @desc    Delete a found item
// @access  Private (Owner or Admin)
router.delete('/found/:id', protect, async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    if (item.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (item.imagePath) {
      const filePath = path.join(__dirname, '..', item.imagePath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await FoundItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
