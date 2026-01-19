import { useState } from 'react';
import api from '../api/axios';

const SalesUpload = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!file) {
      setStatus({ type: 'error', message: 'Please select a CSV file.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsLoading(true);
      setStatus(null);
      const response = await api.post('/api/sales/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus({ type: 'success', message: `Uploaded ${response.data.records} records successfully.` });
      setFile(null);
      form.reset();
    } catch (error) {
      const message = error.response?.data?.message || 'Upload failed. Please try again.';
      setStatus({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="card">
      <h2>Upload Sales CSV</h2>
      <form onSubmit={handleUpload} className="upload-form">
        <input
          type="file"
          name="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {status && (
        <p className={`status status--${status.type}`}>
          {status.message}
        </p>
      )}
    </section>
  );
};

export default SalesUpload;
