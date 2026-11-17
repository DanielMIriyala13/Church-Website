const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @route   POST /api/upload
// @desc    Accept image payload (base64 or URL) and return normalized storage URL
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { image, folder = 'members' } = req.body;

        if (!image) {
            return res.status(400).json({ success: false, message: 'No image data provided.' });
        }

        // If Cloudinary environment variables are present, upload to Cloudinary
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
            try {
                const cloudinary = require('cloudinary').v2;
                cloudinary.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_API_SECRET
                });

                const uploadResponse = await cloudinary.uploader.upload(image, {
                    folder: `church_cms/${folder}`
                });

                return res.json({
                    success: true,
                    url: uploadResponse.secure_url
                });
            } catch (cloudErr) {
                console.warn('Cloudinary upload warning:', cloudErr.message);
                // Fall back to direct image string
            }
        }

        // If direct image URL or base64 data URI, store and return it
        res.json({
            success: true,
            url: image
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Failed to process image upload.' });
    }
});

module.exports = router;
