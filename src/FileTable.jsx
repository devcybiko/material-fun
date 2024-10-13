import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';

// function FileTable({ onFileSelect }) {  // Accept onFileSelect as a prop
//   const [files, setFiles] = useState([]);        // State to store files
//   const [loading, setLoading] = useState(true);  // Loading state
//   const [error, setError] = useState(null);      // Error state

//   // Fetch the file list from Flask API
//   useEffect(() => {
//     axios.get('http://127.0.0.1:5000/api/files')
//       .then(response => {
//         setFiles(response.data.files);  // Store the file list
//         setLoading(false);              // Stop loading
//       })
//       .catch(error => {
//         setError(error.message);        // Handle error
//         setLoading(false);
//       });
//   }, []);

//   // Function to fetch file content when a row is clicked
//   const handleRowClick = (fileName) => {
//     // Fetch the file content from the Flask API
//     axios.get(`http://127.0.0.1:5000/api/files/${fileName}`)
//       .then(response => {
//         onFileSelect(response.data.content);  // Pass the content to the parent component
//       })
//       .catch(() => {
//         onFileSelect('Error fetching file content');
//       });
//   };

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (error) {
//     return <p>Error fetching data: {error}</p>;
//   }

//   return (
//     <TableContainer component={Paper}>
//       <Table sx={{ minWidth: 650 }} aria-label="simple table">
//         <TableHead>
//           <TableRow>
//             <TableCell>File Name</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {files.map((file, index) => (
//             <TableRow
//               key={index}
//               hover
//               onClick={() => handleRowClick(file)}  // Handle row click
//               style={{ cursor: 'pointer' }}         // Make the row look clickable
//             >
//               <TableCell>{file}</TableCell>  {/* Display file name */}
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// }

// export default FileTable;

function FileTable({ onFileSelect }) {
    const [files, setFiles] = useState([]);        // State to store files
    const [loading, setLoading] = useState(true);  // Loading state
    const [error, setError] = useState(null);      // Error state
  
    // Fetch the file list from Flask API
    useEffect(() => {
      axios.get('http://127.0.0.1:5000/api/files')
        .then(response => {
          setFiles(response.data.files);  // Store the file list
          setLoading(false);              // Stop loading
        })
        .catch(error => {
          setError(error.message);        // Handle error
          setLoading(false);
        });
    }, []);
  
    // Function to fetch file content when a row is clicked
    const handleRowClick = (fileName) => {
      // Fetch the file content from the Flask API
      axios.get(`http://127.0.0.1:5000/api/files/${fileName}`)
        .then(response => {
          // Pass both file content and file name back to the parent
          onFileSelect(response.data.content, fileName);
        })
        .catch(() => {
          onFileSelect('Error fetching file content', fileName);
        });
    };
  
    if (loading) {
      return <p>Loading...</p>;
    }
  
    if (error) {
      return <p>Error fetching data: {error}</p>;
    }
  
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>File Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((file, index) => (
              <TableRow
                key={index}
                hover
                onClick={() => handleRowClick(file)}  // Handle row click
                style={{ cursor: 'pointer' }}         // Make the row look clickable
              >
                <TableCell>{file}</TableCell>  {/* Display file name */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  
  export default FileTable;
  