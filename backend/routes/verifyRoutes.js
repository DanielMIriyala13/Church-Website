const express = require('express');
const router = express.Router();
const Member = require('../models/Member');

// @route   GET /api/verify/:churchId
// @desc    Public verification of a Church ID card
// @access  Public
router.get('/:churchId', async (req, res) => {
    try {
        const { churchId } = req.params;
        const member = await Member.findOne({ churchId: churchId.toUpperCase() })
            .select('fullName churchId photo membershipStatus joiningDate department bloodGroup')
            .populate('department', 'name');

        if (!member) {
            return res.status(404).json({
                success: false,
                verified: false,
                message: 'Invalid Church ID. Member record not found.'
            });
        }

        res.json({
            success: true,
            verified: true,
            church: 'Bethesda Satyavakyam Church, Kadapa',
            member: {
                fullName: member.fullName,
                churchId: member.churchId,
                photo: member.photo,
                department: member.department ? member.department.name : 'General Assembly',
                membershipStatus: member.membershipStatus,
                joiningDate: member.joiningDate,
                bloodGroup: member.bloodGroup,
                verifiedAt: new Date()
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

