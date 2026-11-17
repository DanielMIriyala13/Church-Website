const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Member = require('../models/Member');
const Department = require('../models/Department');
const Announcement = require('../models/Announcement');
const Event = require('../models/Event');
const PrayerRequest = require('../models/PrayerRequest');
const ChurchIdCounter = require('../models/ChurchIdCounter');

const seedDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/church';
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected for seeding...');

        // 1. Initialize Departments
        const departmentsData = [
            {
                name: 'Worship & Choir',
                code: 'CHOIR',
                description: 'Leading the congregation into the presence of God through praise and worship music.',
                meetingSchedule: 'Every Saturday 5:30 PM (Vocal & Band Practice)',
                color: '#D4AF37',
                icon: 'music'
            },
            {
                name: 'Youth Ministry',
                code: 'YOUTH',
                description: 'Empowering young people to grow deep in faith, fellowship, and holy living.',
                meetingSchedule: 'Every Saturday 6:30 PM',
                color: '#1B2A4E',
                icon: 'zap'
            },
            {
                name: 'Sunday School',
                code: 'SUNDAY_SCHOOL',
                description: 'Nurturing children with biblical foundations, scripture memorization, and praise.',
                meetingSchedule: 'Every Sunday 8:30 AM',
                color: '#87CEEB',
                icon: 'book-open'
            },
            {
                name: 'Prayer Team & Intercession',
                code: 'PRAYER_TEAM',
                description: 'Dedicated intercessory team standing in the gap for the church, city, and individual prayer needs.',
                meetingSchedule: 'Every Friday 7:00 PM (Chain Prayer)',
                color: '#4B1D3F',
                icon: 'heart'
            },
            {
                name: 'Women Fellowship',
                code: 'WOMEN',
                description: 'Encouraging Christian sisters, mothers, and daughters in godliness and prayer.',
                meetingSchedule: 'Every Tuesday 11:00 AM',
                color: '#C47A6D',
                icon: 'sun'
            },
            {
                name: 'Media & Technology',
                code: 'MEDIA',
                description: 'Audio, visual projection, live stream broadcasting, and digital church communications.',
                meetingSchedule: 'Every Sunday 8:00 AM & Special Services',
                color: '#2C3E50',
                icon: 'video'
            }
        ];

        for (const dept of departmentsData) {
            await Department.findOneAndUpdate({ code: dept.code }, dept, { upsert: true, new: true });
        }
        console.log('Departments seeded.');

        const choirDept = await Department.findOne({ code: 'CHOIR' });
        const youthDept = await Department.findOne({ code: 'YOUTH' });
        const prayerDept = await Department.findOne({ code: 'PRAYER_TEAM' });

        // 2. Initialize Church ID Counter
        const year = new Date().getFullYear();
        await ChurchIdCounter.findOneAndUpdate(
            { year },
            { $setOnInsert: { lastSequence: 5 } },
            { upsert: true }
        );

        // 3. Seed Super Admin & Members
        const adminMemberData = {
            churchId: 'BSC-2026-0001',
            fullName: 'Rev. Baburao Miriyala',
            phone: '+91 9440284422',
            email: 'pastor@bethesdaks.org',
            address: {
                street: 'Near LEF Bethesda Church',
                city: 'Kadapa',
                state: 'Andhra Pradesh',
                postalCode: '516001'
            },
            gender: 'Male',
            bloodGroup: 'O+',
            joiningDate: new Date('1998-05-15'),
            department: prayerDept ? prayerDept._id : null,
            membershipStatus: 'Active',
            notes: 'Senior Pastor & Overseer'
        };

        const adminMember = await Member.findOneAndUpdate(
            { churchId: adminMemberData.churchId },
            adminMemberData,
            { upsert: true, new: true }
        );

        // Super Admin User
        let adminUser = await User.findOne({ churchId: 'BSC-2026-0001' });
        if (!adminUser) {
            adminUser = new User({
                churchId: 'BSC-2026-0001',
                email: 'pastor@bethesdaks.org',
                password: 'Admin@2026',
                role: 'Super Admin',
                member: adminMember._id,
                isActive: true
            });
            await adminUser.save();
            console.log('Super Admin user created: BSC-2026-0001 / Admin@2026');
        }

        // Demo Member 2 - Worship Leader / Church Admin
        const admin2Data = {
            churchId: 'BSC-2026-0002',
            fullName: 'Daniel Miriyala',
            phone: '+91 9848012345',
            email: 'admin@bethesdaks.org',
            address: { city: 'Kadapa', state: 'Andhra Pradesh' },
            gender: 'Male',
            bloodGroup: 'B+',
            joiningDate: new Date('2010-01-01'),
            department: choirDept ? choirDept._id : null,
            membershipStatus: 'Active'
        };
        const m2 = await Member.findOneAndUpdate({ churchId: admin2Data.churchId }, admin2Data, { upsert: true, new: true });
        if (!await User.findOne({ churchId: 'BSC-2026-0002' })) {
            const u2 = new User({
                churchId: 'BSC-2026-0002',
                email: 'admin@bethesdaks.org',
                password: 'Admin@2026',
                role: 'Church Admin',
                member: m2._id,
                isActive: true
            });
            await u2.save();
        }

        // Demo Member 3 - Youth Leader
        const youthLeaderData = {
            churchId: 'BSC-2026-0003',
            fullName: 'David Miriyala',
            phone: '+91 9123456789',
            email: 'youth@bethesdaks.org',
            gender: 'Male',
            bloodGroup: 'A+',
            department: youthDept ? youthDept._id : null,
            membershipStatus: 'Active'
        };
        const m3 = await Member.findOneAndUpdate({ churchId: youthLeaderData.churchId }, youthLeaderData, { upsert: true, new: true });
        if (!await User.findOne({ churchId: 'BSC-2026-0003' })) {
            const u3 = new User({
                churchId: 'BSC-2026-0003',
                email: 'youth@bethesdaks.org',
                password: 'Leader@2026',
                role: 'Department Head',
                member: m3._id,
                isActive: true
            });
            await u3.save();
        }

        // Demo Member 4 - Church Member
        const churchMemberData = {
            churchId: 'BSC-2026-0004',
            fullName: 'Grace Miriyala',
            phone: '+91 9876543211',
            email: 'grace@example.com',
            gender: 'Female',
            bloodGroup: 'O+',
            department: choirDept ? choirDept._id : null,
            membershipStatus: 'Active'
        };
        const m4 = await Member.findOneAndUpdate({ churchId: churchMemberData.churchId }, churchMemberData, { upsert: true, new: true });
        if (!await User.findOne({ churchId: 'BSC-2026-0004' })) {
            const u4 = new User({
                churchId: 'BSC-2026-0004',
                password: 'Member@2026',
                role: 'Church Member',
                member: m4._id,
                isActive: true
            });
            await u4.save();
        }

        // Demo Member 5
        await Member.findOneAndUpdate(
            { churchId: 'BSC-2026-0005' },
            {
                churchId: 'BSC-2026-0005',
                fullName: 'Samuel Paul',
                phone: '+91 9988776655',
                gender: 'Male',
                bloodGroup: 'AB+',
                membershipStatus: 'Active'
            },
            { upsert: true }
        );

        // 4. Seed Announcements
        const announcements = [
            {
                title: 'Bethesda Silver Jubilee Celebrations – 25 Years of Grace',
                content: 'We welcome all members, families, and believers to join our historic Silver Jubilee Thanksgiving Service. Special prayers, commemorative messages, and fellowship meal will follow.',
                category: 'Special Event',
                priority: 'high',
                status: 'published',
                targetAudience: 'All'
            },
            {
                title: 'All-Night Fasting & Prayer Meeting',
                content: 'Join us this Friday from 9:00 PM to 4:00 AM for an anointed time of intercession, repentance, and waiting upon the Lord.',
                category: 'Fasting & Prayer',
                priority: 'high',
                status: 'published',
                targetAudience: 'All'
            },
            {
                title: 'Youth Revival Camp Registration Open',
                content: 'All church youth between ages 13 to 28 are invited to register for the upcoming 3-day spiritual retreat in Kadapa.',
                category: 'Youth',
                priority: 'medium',
                status: 'published',
                targetAudience: 'Youth'
            }
        ];

        for (const a of announcements) {
            await Announcement.findOneAndUpdate({ title: a.title }, a, { upsert: true });
        }
        console.log('Announcements seeded.');

        // 5. Seed Sample Prayer Requests
        const prayerData = [
            {
                title: 'Healing for Brother Joseph recovering in hospital',
                request: 'Please pray for Brother Joseph who underwent surgery yesterday. Pray for rapid recovery, divine healing, and peace for his family.',
                requesterName: 'Mary Joseph',
                privacyLevel: 'Public',
                status: 'Under Prayer'
            },
            {
                title: 'Prayer for Upcoming 10th and 12th Board Examinations',
                request: 'Lifting all children and youth appearing for government board examinations this month. May the Lord grant them wisdom and calm minds.',
                requesterName: 'Sunday School Department',
                privacyLevel: 'Public',
                status: 'Pending'
            },
            {
                title: 'Thanksgiving: New Job Offered After 6 Months of Waiting',
                request: 'Giving all praise to God for answering prayers and opening a miraculous career door.',
                requesterName: 'Anonymous Church Member',
                isAnonymous: true,
                privacyLevel: 'Public',
                status: 'Answered',
                answeredTestimony: 'Praise the Lord! The Lord provided a peaceful job offer beyond our expectations.'
            }
        ];

        for (const p of prayerData) {
            await PrayerRequest.findOneAndUpdate({ title: p.title }, p, { upsert: true });
        }
        console.log('Prayer requests seeded.');

        console.log('===> SEEDING COMPLETE! <===');
        console.log('Login credentials:');
        console.log('Super Admin:     BSC-2026-0001 / Admin@2026');
        console.log('Church Admin:    BSC-2026-0002 / Admin@2026');
        console.log('Dept Head/Youth: BSC-2026-0003 / Leader@2026');
        console.log('Member:          BSC-2026-0004 / Member@2026');

        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedDB();

