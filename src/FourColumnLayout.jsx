import React, { useEffect, useRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FileTable from './FileTable';
import { useCodeMirror } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { autocompletion } from '@codemirror/autocomplete';
import axios from 'axios';
import './App.css';

// Function to fetch the list of files from the server
const fetchFiles = async () => {
  try {
    const response = await axios.get(`http://127.0.0.1:5000/api/files?_=${new Date().getTime()}`);
    console.log('Fetched file list:', response.data.files);  // Debugging: log the fetched file list
    return response.data.files;
  } catch (error) {
    console.error('Error fetching file list:', error);  // Debugging: log error
    return [];
  }
};

const fetchVariableNames = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:5000/api/variables');
    return response.data.variables;
  } catch (error) {
    console.error('Error fetching variable names:', error);  // Debugging: log error
    return [];
  }
};

function FourColumnLayout({ fileContent, onFileSelect }) {
  const editorRef = useRef();
  const [currentContent, setCurrentContent] = useState(fileContent);
  const [fileName, setFileName] = useState('');  // State for the current file being edited
  const [saveMessage, setSaveMessage] = useState('');  // Status message for third column
  const [fileList, setFileList] = useState([]);  // State to store the list of files
  const [variableNames, setVariableNames] = useState([]);
  const [open, setOpen] = useState(false);  // State to control dialog open/close
  const [newFileName, setNewFileName] = useState('');  // State to hold new file name input

  // Fetch files and variable names when the component mounts
  useEffect(() => {
    const loadFilesAndVariables = async () => {
      const files = await fetchFiles();
      setFileList(files);  // Update the file list
      console.log('Initial file list:', files);  // Debugging: log initial file list
      const variables = await fetchVariableNames();
      setVariableNames(variables);
    };

    loadFilesAndVariables();
  }, []);

  function variableNameCompleter(context) {
    const word = context.matchBefore(/\w*/);
    if (!word) return null;
    if (word.from === word.to && !context.explicit) return null;

    const options = variableNames
      .filter(name => name.startsWith(word.text))
      .map(name => ({
        label: name,
        type: 'variable',
      }));

    return {
      from: word.from,
      options: options,
    };
  }

  const { view: editorView, state: editorState } = useCodeMirror({
    container: editorRef.current,
    value: fileContent,
    extensions: [
      javascript(),
      autocompletion({ override: [variableNameCompleter] })
    ],
    height: "400px",
    onChange: (value) => {
      setCurrentContent(value);
    },
  });

  // Open the dialog box
  const handleClickOpen = () => {
    setOpen(true);
  };

  // Close the dialog box
  const handleClose = () => {
    setOpen(false);
  };

  // Handle file creation and update the file list, then automatically load the new file for editing
  const handleCreateFile = async () => {
    try {
      console.log('Creating file:', newFileName);  // Debugging: log the new file name
      const response = await axios.post('http://127.0.0.1:5000/api/create-file', { fileName: newFileName });
      setSaveMessage(response.data.message);  // Set success message

      console.log('File created, response:', response.data.message);  // Debugging: log the response from the API

      // Fetch the updated list of files after creating the new file
      const updatedFiles = await fetchFiles();  
      console.log('Updated file list:', updatedFiles);  // Debugging: log the updated file list
      setFileList(updatedFiles);  // Update the file list

      // Automatically load the newly created file into the editor
      setFileName(newFileName);  // Set the newly created file as the current file
      setCurrentContent('');  // Since it's a new file, set the editor content to an empty string
      console.log('Loading new file into editor:', newFileName);  // Debugging: log that the new file is being loaded

      // Update the editor with the new empty content
      if (editorView) {
        const transaction = editorView.state.update({
          changes: { from: 0, to: editorView.state.doc.length, insert: '' }  // Clear the editor and insert empty content
        });
        editorView.dispatch(transaction);
        console.log('Editor updated for new file:', newFileName);  // Debugging: confirm the editor was updated
      }

    } catch (error) {
      console.error('Error creating file:', error);  // Debugging: log the error
      if (error.response && error.response.data) {
        setSaveMessage(error.response.data.message);  // Set error message if API returns an error
      } else {
        setSaveMessage('Error: Could not create file.');
      }
    } finally {
      setOpen(false);  // Close the dialog in both success and error cases
    }
  };

  const handleSave = () => {
    if (fileName) {
      axios.post(`http://127.0.0.1:5000/api/save-file`, {
        fileName: fileName,
        content: currentContent,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        setSaveMessage(response.data.message);
      })
      .catch(error => {
        setSaveMessage('Error saving file: ' + error.message);
      });
    } else {
      setSaveMessage("No file selected to save.");
    }
  };

  return (
    <Grid container spacing={2} style={{ padding: '20px' }}>
      {/* First column: Table with "+" button and updated file list */}
      <Grid item xs={4}>
        <Paper style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>File List</h3>
            <IconButton onClick={handleClickOpen}>
              <AddIcon />  {/* "+" Icon */}
            </IconButton>
          </div>
          <FileTable
            files={fileList}  // Pass the updated file list to FileTable
            onFileSelect={(content, selectedFileName) => {
              onFileSelect(content);
              setFileName(selectedFileName);
              setCurrentContent(content);  // Load the selected file's content into the editor
            }}
          />
        </Paper>
      </Grid>

      {/* Second column: CodeMirror Editor for file content */}
      <Grid item xs={4}>
        <Paper style={{ padding: '20px' }}>
          <h3>Edit File Content: {fileName ? `"${fileName}"` : 'No file selected'}</h3>  {/* Display the current file name */}
          <div ref={editorRef} />
          <Button variant="contained" color="primary" onClick={handleSave} style={{ marginTop: '10px' }}>
            Save
          </Button>
        </Paper>
      </Grid>

      {/* Third column: Display save message */}
      <Grid item xs={4}>
        <Paper style={{ padding: '20px' }}>
          <h3>Save Status:</h3>
          <p>{saveMessage}</p>  {/* Display the status message (error or success) here */}
        </Paper>
      </Grid>

      {/* Dialog Box for New File Creation */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            fullWidth
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateFile} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

export default FourColumnLayout;
