import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// For production
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://coldmailer-wy4n.onrender.com/api' 
  : 'http://localhost:5000/api';

function App() {
  const [inputType, setInputType] = useState('text');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [userDetails, setUserDetails] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([
    {
      id: 'default',
      name: 'Default Template',
      description: 'Professional email template'
    }
  ]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

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
      // Keep the default template if fetch fails
      setError('Failed to load templates from server. Using default template.');
    } finally {
      setTemplatesLoading(false);
    }
  };

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail)
      .then(() => {
        alert('✨ Email copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard. Please select and copy manually.');
      });
  };

  const openInEmail = () => {
    // Extract subject and body from the generated email
    const lines = generatedEmail.split('\n');
    let subject = 'Job Application';
    let body = generatedEmail;

    // Try to extract subject if it exists in the email
    const subjectLine = lines.find(line => line.toLowerCase().includes('subject:'));
    if (subjectLine) {
      subject = subjectLine.replace(/subject:\s*/i, '').trim();
      // Remove the subject line from the body
      body = lines.filter(line => !line.toLowerCase().includes('subject:')).join('\n');
    }

    // Encode the subject and body for mailto link
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);

    // Create mailto link
    const mailtoLink = `mailto:?subject=${encodedSubject}&body=${encodedBody}`;

    // Open email client
    window.location.href = mailtoLink;
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
    <div className="App">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">
            <span className="logo-icon">🚀</span>
            ColdMailer
          </div>
          <div className="nav-links">
            {/* <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#contact" className="nav-link">Contact</a>
            <a href="#about" className="nav-link">About</a> */}
          </div>
          {/* <div className="nav-actions">
            <button className="btn btn-outline">🔐 Sign In</button>
            <button className="btn btn-primary">⭐ Get Started</button>
          </div> */}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-headline">
          AI-Powered Job Application
          <br />
          Email Generator
        </h1>
        <p className="hero-subtitle">
          Transform your job search with personalized, professional emails 
          crafted by AI. Get more interviews with emails that stand out and 
          make hiring managers take notice.
        </p>
        
        <div className="hero-features">
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <span>Generate in seconds</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎯</span>
            <span>Personalized content</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🚀</span>
            <span>Higher response rate</span>
          </div>
        </div>
      </section>

      {/* Main Editor */}
      <div className="container">
        <div className="editor-container">
          <div className="editor-header">
            <div className="editor-title">
              <span>🎯</span>
              AI Email Composer
            </div>
            {/* <div className="file-tabs">
              <div className="file-tab active">composer.js</div>
              <div className="file-tab">templates.json</div>
              <div className="file-tab">settings.py</div>
            </div> */}
          </div>

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
          <div className="result-section">
            <div className="result-header">
              <h2>🎉 Email Ready!</h2>
              <div className="result-actions">
                <span className="template-badge">
                  🎨 {templates.find(t => t.id === selectedTemplate)?.name || 'Default Template'}
                </span>
                <div className="email-buttons">
                  <button onClick={copyToClipboard} className="btn btn-success">
                    📋 Copy to Clipboard
                  </button>
                  <button onClick={openInEmail} className="btn btn-primary">
                    📧 Open in Email
                  </button>
                </div>
              </div>
            </div>
            <div className="email-content">
              <pre>{generatedEmail}</pre>
            </div>
            <div className="result-footer">
              <p>💡 <strong>Pro tip:</strong> Review and personalize the email before sending. Add specific company details or projects you're proud of!</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>Akshat © 2025</p>
      </footer>
    </div>
  );
}

export default App;