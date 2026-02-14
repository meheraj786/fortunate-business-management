import axios from './axios';

export const createBackup = () => axios.post('/backups');
export const getBackups = () => axios.get('/backups');
export const downloadBackup = (filename) => axios.get(`/backups/download/${filename}`, { responseType: 'blob' });
export const deleteBackup = (filename) => axios.delete(`/backups/${filename}`);
