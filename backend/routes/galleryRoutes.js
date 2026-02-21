const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');

// Get all gallery items
router.get('/', async (req, res) => {
    try {
        const galleries = await Gallery.find().sort({ createdAt: -1 });
        res.json(galleries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single gallery item
router.get('/:id', async (req, res) => {
    try {
        const gallery = await Gallery.findById(req.params.id);
        if (!gallery) return res.status(404).json({ message: 'Gallery item not found' });
        res.json(gallery);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create gallery item
router.post('/', async (req, res) => {
    const gallery = new Gallery(req.body);
    try {
        const newGallery = await gallery.save();
        res.status(201).json(newGallery);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update gallery item
router.put('/:id', async (req, res) => {
    try {
        const gallery = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!gallery) return res.status(404).json({ message: 'Gallery item not found' });
        res.json(gallery);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete gallery item
router.delete('/:id', async (req, res) => {
    try {
        const gallery = await Gallery.findByIdAndDelete(req.params.id);
        if (!gallery) return res.status(404).json({ message: 'Gallery item not found' });
        res.json({ message: 'Gallery item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
