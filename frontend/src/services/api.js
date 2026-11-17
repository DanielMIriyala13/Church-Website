const BASE_URL = process.env.REACT_APP_API_URL || (
    typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? '/api'
        : 'http://localhost:5000/api'
);

// Helper for authorized fetch
const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('church_cms_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
};

// ==================== AUTH API ====================
export const login = async (churchId, password) => {
    return fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ churchId, password })
    });
};

export const getMe = async () => {
    return fetchWithAuth('/auth/me');
};

export const changePassword = async (currentPassword, newPassword) => {
    return fetchWithAuth('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
    });
};

export const setupInitialAdmin = async (adminData) => {
    return fetchWithAuth('/auth/setup-initial-admin', {
        method: 'POST',
        body: JSON.stringify(adminData)
    });
};

export const getUsers = async () => {
    return fetchWithAuth('/auth/users');
};

export const updateUserRole = async (id, updateData) => {
    return fetchWithAuth(`/auth/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
    });
};

export const createUserAccount = async (userData) => {
    return fetchWithAuth('/auth/create-user', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
};

// ==================== MEMBERS API ====================
export const getMembers = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/members?${query}`);
};

export const getMember = async (idOrChurchId) => {
    return fetchWithAuth(`/members/${idOrChurchId}`);
};

export const getMemberStats = async () => {
    return fetchWithAuth('/members/stats');
};

export const getNextChurchId = async () => {
    return fetchWithAuth('/members/next-id');
};

export const createMember = async (memberData) => {
    return fetchWithAuth('/members', {
        method: 'POST',
        body: JSON.stringify(memberData)
    });
};

export const updateMember = async (id, memberData) => {
    return fetchWithAuth(`/members/${id}`, {
        method: 'PUT',
        body: JSON.stringify(memberData)
    });
};

export const deleteMember = async (id) => {
    return fetchWithAuth(`/members/${id}`, {
        method: 'DELETE'
    });
};

// ==================== DEPARTMENTS API ====================
export const getDepartments = async () => {
    const res = await fetch(`${BASE_URL}/departments`);
    return res.json();
};

export const getDepartment = async (id) => {
    const res = await fetch(`${BASE_URL}/departments/${id}`);
    return res.json();
};

export const createDepartment = async (deptData) => {
    return fetchWithAuth('/departments', {
        method: 'POST',
        body: JSON.stringify(deptData)
    });
};

export const updateDepartment = async (id, deptData) => {
    return fetchWithAuth(`/departments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(deptData)
    });
};

export const deleteDepartment = async (id) => {
    return fetchWithAuth(`/departments/${id}`, {
        method: 'DELETE'
    });
};

export const assignDepartmentMember = async (deptId, memberData) => {
    return fetchWithAuth(`/departments/${deptId}/assign-member`, {
        method: 'POST',
        body: JSON.stringify(memberData)
    });
};

// ==================== ATTENDANCE API ====================
export const checkInAttendance = async (checkInData) => {
    return fetchWithAuth('/attendance/checkin', {
        method: 'POST',
        body: JSON.stringify(checkInData)
    });
};

export const getAttendanceRecords = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/attendance?${query}`);
};

export const getAttendanceSummary = async () => {
    return fetchWithAuth('/attendance/summary');
};

export const exportAttendanceCsvUrl = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const token = localStorage.getItem('church_cms_token');
    return `${BASE_URL}/attendance/export-csv?${query}&token=${token}`;
};

export const deleteAttendanceRecord = async (id) => {
    return fetchWithAuth(`/attendance/${id}`, {
        method: 'DELETE'
    });
};

// ==================== PRAYERS API ====================
export const submitPrayerRequest = async (prayerData) => {
    const token = localStorage.getItem('church_cms_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/prayers`, {
        method: 'POST',
        headers,
        body: JSON.stringify(prayerData)
    });
    return res.json();
};

export const getPublicPrayers = async () => {
    const res = await fetch(`${BASE_URL}/prayers/public`);
    return res.json();
};

export const getManagementPrayers = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/prayers/management?${query}`);
};

export const updatePrayerStatus = async (id, statusData) => {
    return fetchWithAuth(`/prayers/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(statusData)
    });
};

export const deletePrayerRequest = async (id) => {
    return fetchWithAuth(`/prayers/${id}`, {
        method: 'DELETE'
    });
};

// ==================== ANNOUNCEMENTS API ====================
export const getAnnouncements = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/announcements?${query}`);
    return res.json();
};

export const getAdminAnnouncements = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/announcements/admin/all?${query}`);
};

export const getAnnouncement = async (id) => {
    const res = await fetch(`${BASE_URL}/announcements/${id}`);
    return res.json();
};

export const createAnnouncement = async (announcementData) => {
    return fetchWithAuth('/announcements', {
        method: 'POST',
        body: JSON.stringify(announcementData)
    });
};

export const updateAnnouncement = async (id, announcementData) => {
    return fetchWithAuth(`/announcements/${id}`, {
        method: 'PUT',
        body: JSON.stringify(announcementData)
    });
};

export const updateAnnouncementStatus = async (id, status) => {
    return fetchWithAuth(`/announcements/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    });
};

export const deleteAnnouncement = async (id) => {
    return fetchWithAuth(`/announcements/${id}`, {
        method: 'DELETE'
    });
};

// ==================== DASHBOARD API ====================
export const getDashboardStats = async () => {
    return fetchWithAuth('/dashboard/stats');
};

// ==================== VERIFICATION API ====================
export const verifyChurchId = async (churchId) => {
    const res = await fetch(`${BASE_URL}/verify/${churchId}`);
    return res.json();
};

// ==================== UPLOAD API ====================
export const uploadImage = async (base64Image, folder = 'members') => {
    return fetchWithAuth('/upload', {
        method: 'POST',
        body: JSON.stringify({ image: base64Image, folder })
    });
};

// ==================== LEGACY WEBSITE APIs ====================
export const getEvents = async () => {
    const response = await fetch(`${BASE_URL}/events`);
    return response.json();
};

export const getEvent = async (id) => {
    const response = await fetch(`${BASE_URL}/events/${id}`);
    return response.json();
};

export const createEvent = async (eventData) => {
    return fetchWithAuth('/events', {
        method: 'POST',
        body: JSON.stringify(eventData)
    });
};

export const getGallery = async () => {
    const response = await fetch(`${BASE_URL}/gallery`);
    return response.json();
};

export const createGallery = async (galleryData) => {
    return fetchWithAuth('/gallery', {
        method: 'POST',
        body: JSON.stringify(galleryData)
    });
};

export const createContact = async (contactData) => {
    const response = await fetch(`${BASE_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
    });
    return response.json();
};

const api = {
    login,
    getMe,
    changePassword,
    setupInitialAdmin,
    getUsers,
    updateUserRole,
    createUserAccount,
    getMembers,
    getMember,
    getMemberStats,
    getNextChurchId,
    createMember,
    updateMember,
    deleteMember,
    getDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    assignDepartmentMember,
    checkInAttendance,
    getAttendanceRecords,
    getAttendanceSummary,
    exportAttendanceCsvUrl,
    deleteAttendanceRecord,
    submitPrayerRequest,
    getPublicPrayers,
    getManagementPrayers,
    updatePrayerStatus,
    deletePrayerRequest,
    getAnnouncements,
    getAdminAnnouncements,
    getAnnouncement,
    createAnnouncement,
    updateAnnouncement,
    updateAnnouncementStatus,
    deleteAnnouncement,
    getDashboardStats,
    verifyChurchId,
    uploadImage,
    getEvents,
    getEvent,
    createEvent,
    getGallery,
    createGallery,
    createContact
};

export default api;
