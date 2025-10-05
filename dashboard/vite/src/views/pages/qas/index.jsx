// src/pages/qa/QAManagement.jsx
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Upload, Edit, Delete } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDate } from '../../../utils/formatDate';
const API_URL = import.meta.env.VITE_API_URL;

export default function QAManagement() {
  const [qas, setQAs] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingQA, setEditingQA] = useState(null);
  const [form, setForm] = useState({ question: '', answer: '' });

  const { api } = useAuth();

  // Fetch QAs
  const fetchQAs = async () => {
    try {
      const res = await api.get(`${API_URL}/qa`);
      setQAs(res.data);
    } catch (err) {
      console.error('Error fetching QAs:', err);
    }
  };

  useEffect(() => {
    fetchQAs();
  }, []);

  // Add/Edit QA
  const handleSave = async () => {
    if (editingQA) {
      await api.put(`${API_URL}/qa/${editingQA._id}`, form);
    } else {
      await api.post(`${API_URL}/qa`, form);
    }
    setOpen(false);
    setEditingQA(null);
    fetchQAs();
  };

  // Delete QA
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this QA?')) return;
    await api.delete(`${API_URL}/qa/${id}`);
    fetchQAs();
  };

  // CSV Upload
  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    await api.post('/qa/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    fetchQAs();
  };

  const columns = [
    { field: 'question', headerName: 'Question', flex: 1 },
    { field: 'answer', headerName: 'Answer', flex: 1 },
    { field: 'updatedAt', headerName: 'Last Modified', width: 150, valueFormatter: (params) => formatDate(params) },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton
            size="small"
            onClick={() => {
              setEditingQA(params.row);
              setForm({
                question: params.row.question,
                answer: params.row.answer
              });
              setOpen(true);
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row._id)}>
            <Delete fontSize="small" />
          </IconButton>
        </>
      )
    }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={600}>
          Q&A Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingQA(null);
              setForm({ question: '', answer: '' });
              setOpen(true);
            }}
            sx={{ mr: 1 }}
          >
            Add New
          </Button>
          <Button variant="outlined" startIcon={<Upload />} component="label">
            Upload CSV
            <input type="file" hidden accept=".csv" onChange={handleCSVUpload} />
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <DataGrid rows={qas} columns={columns} getRowId={(row) => row._id} autoHeight disableRowSelectionOnClick />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingQA ? 'Edit QA' : 'Add QA'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Question"
            margin="normal"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
          />
          <TextField
            fullWidth
            label="Answer"
            margin="normal"
            multiline
            rows={3}
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
