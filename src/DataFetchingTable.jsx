import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';  // Optional: if you prefer axios over fetch

function DataFetchingTable() {
  // State to hold the fetched data
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // To manage loading state
  const [error, setError] = useState(null); // To handle errors

  // Fetch data from an API when the component mounts
  useEffect(() => {
    // Example using axios
    axios.get('https://jsonplaceholder.typicode.com/users') // Example API
      .then((response) => {
        setData(response.data); // Update the state with the fetched data
        setLoading(false);      // Data fetching is complete
      })
      .catch((error) => {
        setError(error.message); // Handle errors
        setLoading(false);
      });
  }, []); // Empty array to ensure it runs only once when the component mounts

  // If data is still loading, show a loading message
  if (loading) {
    return <p>Loading...</p>;
  }

  // If there is an error, show an error message
  if (error) {
    return <p>Error fetching data: {error}</p>;
  }

  // Render the table with the fetched data
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">Username</TableCell>
            <TableCell align="right">Email</TableCell>
            <TableCell align="right">Phone</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.username}</TableCell>
              <TableCell align="right">{row.email}</TableCell>
              <TableCell align="right">{row.phone}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataFetchingTable;
