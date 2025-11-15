import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmailForm from './EmailForm';
import EmailResult from './EmailResult';
import './css/Editor.css';
import './css/Loading.css';

// For production
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://coldmailer-wy4n.onrender.com/api' 
  : 'http://localhost:5000/api';

const EmailComposer = ({ 
  generatedEmail, 
  setGeneratedEmail, 
  loading, 
  setLoading, 
  error, 
  setError 
}) => {
  const [templates, setTemplates] = useState([
    {
      id: 'default',
      name: 'Default Template',
      description: 'Professional email template'
    }
  ]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('default');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const response = await axios.get(`${API_BASE}/templates`);
      if (response.data.templates && response.data.templates.length > 0) {
        setTemplates(response.data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to load templates from server. Using default template.');
    } finally {
      setTemplatesLoading(false);
    }
  };

  return (
    <>
      <div className="editor-container">
        <div className="editor-header">
          <div className="editor-title">
            <span>🎯</span>
            AI Email Composer
          </div>
        </div>

        <EmailForm 
          templates={templates}
          templatesLoading={templatesLoading}
          loading={loading}
          setLoading={setLoading}
          error={error}
          setError={setError}
          setGeneratedEmail={setGeneratedEmail}
          API_BASE={API_BASE}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate} // Make sure this is passed
        />
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <h3>✨ Crafting Your Perfect Email</h3>
            <p>AI is analyzing the job description and creating a personalized cold email...</p>
          </div>
        </div>
      )}

      {/* Generated Email Display */}
      {generatedEmail && (
        <EmailResult 
          generatedEmail={generatedEmail}
          templates={templates}
          selectedTemplate={selectedTemplate}
        />
      )}
    </>
  );
};

export default EmailComposer;