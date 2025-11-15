import React, { useState } from 'react';
import axios from 'axios';
import './css/Form.css';
import './css/inputs.css';
import './css/Button.css';
import './css/Utilities.css';

const EmailForm = ({ 
  templates, 
  templatesLoading, 
  loading, 
  setLoading, 
  error, 
  setError, 
  setGeneratedEmail,
  API_BASE,
  selectedTemplate,
  setSelectedTemplate // Make sure this is included in destructuring
}) => {
  const [inputType, setInputType] = useState('text');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [userDetails, setUserDetails] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setJobDescription('');
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!jobDescription && !selectedFile) {
      setError('Please provide either a job description or upload a file');
      return;
    }

    setLoading(true);
    setGeneratedEmail('');

    try {
      const formData = new FormData();
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      if (jobDescription) {
        formData.append('text', jobDescription);
      }
      
      formData.append('template', selectedTemplate);
      formData.append('userDetails', userDetails);

      const response = await axios.post(`${API_BASE}/generate-email`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      if (response.data.success) {
        setGeneratedEmail(response.data.email);
      } else {
        setError(response.data.error || 'Failed to generate email');
      }
    } catch (error) {
      console.error('Error generating email:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.code === 'ECONNREFUSED') {
        setError('Cannot connect to server. Please make sure the backend is running on port 5000.');
      } else {
        setError('Failed to generate email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setJobDescription('');
    setSelectedFile(null);
    setFileName('');
    setUserDetails('');
    setGeneratedEmail('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      {/* Input Type Selection */}
      <div className="form-section">
        <label className="section-label">
          <span>📥</span>
          Input Type
        </label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              value="text"
              checked={inputType === 'text'}
              onChange={(e) => {
                setInputType(e.target.value);
                setSelectedFile(null);
                setFileName('');
                setError('');
              }}
            />
            <span className="radio-custom"></span>
            <span>📝 Text Input</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              value="image"
              checked={inputType === 'image'}
              onChange={(e) => {
                setInputType(e.target.value);
                setJobDescription('');
                setError('');
              }}
            />
            <span className="radio-custom"></span>
            <span>🖼️ Image Upload</span>
          </label>
        </div>
      </div>

      {/* Job Description Input */}
      <div className="form-section">
        <label className="section-label">
          <span>💼</span>
          {inputType === 'text' ? 'Job Description' : 'Upload Job Description'}
        </label>
        {inputType === 'text' ? (
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="✨ Paste the job description here... Include details about the role, requirements, company information, and any specific qualifications mentioned."
            rows="8"
            className="text-input"
          />
        ) : (
          <div className="file-upload-section">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".txt,.pdf,.jpg,.jpeg,.png,.doc,.docx,image/*"
              className="file-input"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="file-upload-label">
              📁 Choose File
            </label>
            <span className="file-name">
              {fileName || 'No file chosen'}
            </span>
            <div className="file-hint">
              🚀 Supported formats: Images, PDF, Text files (Max: 10MB)
            </div>
          </div>
        )}
      </div>

      {/* Template Selection */}
      <div className="form-section">
        <label className="section-label">
          <span>🎨</span>
          Email Template
          {templatesLoading && <span className="loading-text"> (Loading templates...)</span>}
        </label>
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className="select-input"
          disabled={templatesLoading}
        >
          {templatesLoading ? (
            <option value="default">Loading templates...</option>
          ) : (
            templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.description}
              </option>
            ))
          )}
        </select>
        {templates.length === 1 && (
          <div className="template-warning">
            ⚠️ Only default template available. Check if server is running.
          </div>
        )}
      </div>

      {/* User Details */}
      <div className="form-section">
        <label className="section-label">
          <span>👤 Your Details</span>
          <span className="optional-label"> - Add your skills, experience, or specific points to highlight</span>
        </label>
        <textarea
          value={userDetails}
          onChange={(e) => setUserDetails(e.target.value)}
          placeholder="💫 Example: 5 years of experience in React and Node.js, led a team of 3 developers, proficient in AWS cloud services, passionate about UX design, achieved 30% growth in previous role..."
          rows="5"
          className="text-input"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="button-group">
        <button 
          type="button" 
          onClick={clearForm}
          className="btn btn-secondary"
        >
          🗑️ Clear Form
        </button>
        <button 
          type="submit" 
          disabled={loading || (!jobDescription && !selectedFile)}
          className="btn btn-primary"
        >
          {loading ? (
            <>
              <div className="loading-spinner-small"></div>
              ✨ Generating...
            </>
          ) : (
            '🚀 Generate Email'
          )}
        </button>
      </div>
    </form>
  );
};

export default EmailForm;