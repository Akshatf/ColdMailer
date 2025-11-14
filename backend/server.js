const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'text/plain',
    'application/pdf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, text files, and PDFs are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Email templates
const emailTemplates = {
  formal: {
    name: 'Formal',
    description: 'Professional and traditional approach',
    prompt: `Write a formal job application email that highlights the candidate's relevant skills and experience matching the job description. Use professional language, proper business format, and maintain a respectful tone throughout. Include a clear subject line, proper salutation, structured body paragraphs, and professional closing.`
  },
  creative: {
    name: 'Creative',
    description: 'Engaging and memorable approach',
    prompt: `Write a creative and engaging job application email that showcases the candidate's personality while maintaining professionalism. Make it memorable with a unique opening, showcase enthusiasm for the role, and use compelling language that stands out without being overly casual. Include specific examples of how the candidate's skills match the role.`
  },
  direct: {
    name: 'Direct', 
    description: 'Concise and to the point',
    prompt: `Write a direct and concise job application email that gets straight to the point. Focus on key qualifications and how they directly match the job requirements. Use clear, straightforward language, bullet points for key skills, and avoid unnecessary fluff while maintaining professionalism.`
  },
  default: {
    name: 'Standard',
    description: 'Balanced professional approach',
    prompt: `Write a professional job application email that effectively matches the candidate's skills and experience with the job requirements. Use a balanced tone that is both professional and personable. Highlight the most relevant qualifications, express genuine interest in the position and company, and end with a call to action.`
  }
};

// Utility function to extract text from file
const extractTextFromFile = async (filePath, mimetype) => {
  try {
    if (mimetype.startsWith('image/')) {
      // For images, we'll return a message since we can't process images without OCR
      return 'Image file uploaded - please ensure the job description is clear and readable in the image.';
    } else if (mimetype === 'application/pdf') {
      // For PDFs, return a simple message (in production, you'd use a PDF parser)
      return 'PDF file uploaded - processing text from PDF would be implemented in production.';
    } else if (mimetype === 'text/plain') {
      // For text files, read the content
      return fs.readFileSync(filePath, 'utf8');
    } else {
      return 'File uploaded - content processing would be implemented based on file type.';
    }
  } catch (error) {
    throw new Error(`Error reading file: ${error.message}`);
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Job Mail Generator API is running!',
    endpoints: {
      templates: '/api/templates',
      generateEmail: '/api/generate-email'
    }
  });
});

app.post('/api/generate-email', upload.single('file'), async (req, res) => {
  try {
    const { text, template = 'default', userDetails } = req.body;
    const file = req.file;

    console.log('Request received:', { 
      hasText: !!text, 
      hasFile: !!file, 
      template,
      userDetailsLength: userDetails?.length 
    });

    if (!text && !file) {
      return res.status(400).json({ 
        success: false,
        error: 'Either text description or file upload is required' 
      });
    }

const model = genAI.getGenerativeModel({
  // model: "gemini-2.0-flash-exp"
  model: "gemini-2.5-flash",
});
// model: "gemini-2.5-flash",


    let jobDescription = '';

    if (file) {
      console.log('Processing file:', file.originalname, file.mimetype);
      jobDescription = await extractTextFromFile(file.path, file.mimetype);
      
      // Clean up uploaded file after processing
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    } else {
      jobDescription = text;
    }

    const selectedTemplate = emailTemplates[template] || emailTemplates.default;

    const prompt = `
      ${selectedTemplate.prompt}
      
      JOB DESCRIPTION:
      ${jobDescription}
      
      ${userDetails ? `CANDIDATE INFORMATION TO INCORPORATE:
      ${userDetails}` : ''}
      
      Please generate a complete email with:
      1. A compelling subject line
      2. Professional salutation
      3. Structured body paragraphs that:
         - Express interest in the position
         - Highlight relevant skills and experience
         - Show knowledge of the company (if implied in job description)
         - Connect candidate's qualifications to job requirements
      4. Professional closing with call to action
      5. Appropriate signature
      
      Make the email personalized, professional, and tailored to the specific job description.
      Format the response as a ready-to-use email.
    `;

    console.log('Sending request to Gemini AI...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const emailContent = response.text();

    console.log('Email generated successfully');
    res.json({ 
      success: true, 
      email: emailContent,
      templateUsed: template,
      templateName: selectedTemplate.name
    });

  } catch (error) {
    console.error('Error generating email:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate email', 
      details: error.message 
    });
  }
});

// Get available templates
app.get('/api/templates', (req, res) => {
  const templatesList = Object.entries(emailTemplates).map(([id, template]) => ({
    id,
    name: template.name,
    description: template.description
  }));
  
  res.json({
    success: true,
    templates: templatesList
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(port, () => {
  console.log(`📧 Job Mail Generator API is ready!`);
  console.log(`🔗 http://localhost:${port}`);
});