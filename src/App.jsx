import React, { useState } from 'react';
import Header from './Header';  // Import the Header component
import FourColumnLayout from './FourColumnLayout';  // Import FourColumnLayout component
import './App.css';  // Import the CSS file

function App() {
  const [selectedFileContent, setSelectedFileContent] = useState('');  // State for file content

  // Function to update file content when a row is clicked in FileTable
  const handleFileContentChange = (content) => {
    setSelectedFileContent(content);
  };

  return (
    <div>
      <Header />
      <h1>Data Table</h1>
      {/* Pass onFileSelect and fileContent to FourColumnLayout */}
      <FourColumnLayout 
        fileContent={selectedFileContent}
        onFileSelect={handleFileContentChange}  // Pass down the file content handler
      />
    </div>
  );
}

export default App;
