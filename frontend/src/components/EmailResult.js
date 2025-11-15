import React from "react";
import './css/Results.css';

const EmailResult = ({ generatedEmail, templates, selectedTemplate }) => {
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(generatedEmail)
      .then(() => {
        alert("✨ Email copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        alert("Failed to copy to clipboard. Please select and copy manually.");
      });
  };

  const openInEmail = () => {
    const lines = generatedEmail.split("\n");
    let subject = "Job Application";
    let body = generatedEmail;

    const subjectLine = lines.find((line) =>
      line.toLowerCase().includes("subject:")
    );
    if (subjectLine) {
      subject = subjectLine.replace(/subject:\s*/i, "").trim();
      body = lines
        .filter((line) => !line.toLowerCase().includes("subject:"))
        .join("\n");
    }

    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const mailtoLink = `mailto:?subject=${encodedSubject}&body=${encodedBody}`;

    window.location.href = mailtoLink;
  };

  return (
    <div className="result-section">
      <div className="result-header">
        <h2>🎉 Email Ready!</h2>
        <div className="result-actions">
          <span className="template-badge">
            🎨{" "}
            {templates.find((t) => t.id === selectedTemplate)?.name ||
              "Default Template"}
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
        <p>
          💡 <strong>Pro tip:</strong> Review and personalize the email before
          sending. Add specific company details or projects you're proud of!
        </p>
      </div>
    </div>
  );
};

export default EmailResult;