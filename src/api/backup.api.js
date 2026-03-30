import axios from './axios';

// Core CRUD
export const createBackup = () => axios.post('/backups');
export const getBackups = () => axios.get('/backups');
export const downloadBackup = (filename) => axios.get(`/backups/download/${filename}`, { responseType: 'blob' });
export const deleteBackup = (filename) => axios.delete(`/backups/${filename}`);

// Backup management
export const getBackupHistory = (params = {}) => axios.get('/backups/history', { params });
export const verifyBackup = (filename) => axios.post(`/backups/verify/${filename}`);
export const updateBackupNotes = (filename, notes) => axios.patch(`/backups/${filename}/notes`, { notes });

// Restore operations
export const inspectBackup = (filename) => axios.get(`/restore/inspect/${filename}`);
export const restoreFromBackup = (filename, options = {}) => axios.post(`/restore/${filename}`, options);
export const uploadBackupFile = (formData) => axios.post('/restore/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 5 * 60 * 1000, // 5 min for large uploads
});

