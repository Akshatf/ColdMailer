import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import EmailComposer from './components/EmailComposer';
import Footer from './components/Footer';
import './App.css';
// import './components/css/Background.css';
function App() {
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="App">
      <Navbar />
      <Hero />
      
      <div className="container">
        <EmailComposer 
          generatedEmail={generatedEmail}
          setGeneratedEmail={setGeneratedEmail}
          loading={loading}
          setLoading={setLoading}
          error={error}
          setError={setError}
        />
      </div>

      <Footer />
    </div>
  );
}

export default App;