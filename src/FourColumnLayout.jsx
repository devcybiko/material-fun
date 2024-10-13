import React, { useEffect, useRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import FileTable from './FileTable';
import { useCodeMirror } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { linter } from '@codemirror/lint';
import { autocompletion } from '@codemirror/autocomplete';  // Import autocomplete
import axios from 'axios';
import './App.css';

// Define fetchVariableNames inside the same file
const fetchVariableNames = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:5000/api/variables');  // Adjust URL if necessary
    return response.data.variables;  // Assuming the API returns { variables: [...] }
  } catch (error) {
    console.error('Error fetching variable names:', error);
    return [];
  }
};

function FourColumnLayout({ fileContent, onFileSelect }) {
  const editorRef = useRef();
  const [currentContent, setCurrentContent] = useState(fileContent);
  const [fileName, setFileName] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [variableNames, setVariableNames] = useState([]);  // State for fetched variable names

  // Fetch variable names from web service when component mounts
  useEffect(() => {
    const loadVariableNames = async () => {
      const variables = await fetchVariableNames();
      console.log('Fetched variables:', variables);  // Debugging output
      setVariableNames(variables);  // Store fetched variable names in state
    };

    loadVariableNames();
  }, []);

  // Custom completion source function for variable names
  function variableNameCompleter(context) {
    console.log('Current variableNames:', variableNames);  // Debugging output

    const word = context.matchBefore(/[$]{0,1}\w*/);
    if (!word) return null;
    if (word.from === word.to && !context.explicit) return null;

    const options = variableNames  // Use fetched variable names for hinting
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
      javascript(),  // Language mode
      autocompletion({ override: [variableNameCompleter] })  // Add autocomplete with custom completer
    ],
    height: "400px",
    onChange: (value) => {
      setCurrentContent(value);
    },
  });

  useEffect(() => {
    if (editorView && editorState) {
      const transaction = editorView.state.update({
        changes: { from: 0, to: editorView.state.doc.length, insert: fileContent }
      });
      editorView.dispatch(transaction);
      setCurrentContent(fileContent);
    }
  }, [fileContent, editorView, editorState]);

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
      <Grid item xs={4}>
        <Paper style={{ padding: '20px' }}>
          <FileTable onFileSelect={(content, selectedFileName) => {
            onFileSelect(content);
            setFileName(selectedFileName);
          }} />
        </Paper>
      </Grid>

      <Grid item xs={4}>
        <Paper style={{ padding: '20px' }}>
          <h3>Edit File Content:</h3>
          <div ref={editorRef} />
          <Button variant="contained" color="primary" onClick={handleSave} style={{ marginTop: '10px' }}>
            Save
          </Button>
        </Paper>
      </Grid>

      <Grid item xs={4}>
        <Paper style={{ padding: '20px' }}>
          <h3>Save Status:</h3>
          <p>{saveMessage}</p>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default FourColumnLayout;
