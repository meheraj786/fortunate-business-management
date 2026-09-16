import axios from './axios';

// Core CRUD
export const createBackup = () => axios.post('/backups', undefined, { timeout: 2 * 60 * 60 * 1000 });
export const getBackups = () => axios.get('/backups');
export const getBackupReadiness = () => axios.get('/backups/readiness');
export const downloadBackup = (filename) => axios.get(`/backups/download/${filename}`, { responseType: 'blob' });
export const deleteBackup = (filename) => axios.delete(`/backups/${filename}`);

// Backup management
export const getBackupHistory = (params = {}) => axios.get('/backups/history', { params });
export const verifyBackup = (filename) => axios.post(`/backups/verify/${filename}`);
export const updateBackupNotes = (filename, notes) => axios.patch(`/backups/${filename}/notes`, { notes });

// Restore operations
export const inspectBackup = (filename) => axios.get(`/restore/inspect/${filename}`, { timeout: 10 * 60 * 1000 });
export const restoreFromBackup = (filename, options = {}) => axios.post(`/restore/${filename}`, options, {
    timeout: 2 * 60 * 60 * 1000,
});
export const uploadBackupFile = (formData) => axios.post('/restore/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 2 * 60 * 60 * 1000,
});
