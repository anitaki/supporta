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
import { CustomSnackbar } from '../../../ui-component/extended/Snackbar';
const API_URL = import.meta.env.VITE_API_URL;

export default function QAManagement() {
  const [qas, setQAs] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingQA, setEditingQA] = useState(null);
  const [form, setForm] = useState({ question: '', answer: '' });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: ''
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedQA, setSelectedQA] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { api } = useAuth();

  const fetchQAs = async () => {
    try {
      const res = await api.get(`/qa`);
      setQAs(res.data);
    } catch (err) {
      console.error('Error fetching QAs:', err);
    }
  };

  useEffect(() => {
    fetchQAs();
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Add/Edit QA
  const handleSave = async () => {
    try {
      if (editingQA) {
        await api.put(`/qa/${editingQA._id}`, form);
      } else {
        await api.post(`${API_URL}/qa`, form);
      }
      setOpen(false);
      setEditingQA(null);
      fetchQAs();
      setSnackbar({ open: true, severity: 'success', message: 'Your QA was saved successfully' });
    } catch (err) {
      const { msg } = err.response?.data?.msg[0] || {};

      if (msg) {
        setSnackbar({
          open: true,
          severity: 'error',
          message: msg
        });
      } else {
        setSnackbar({
          open: true,
          severity: 'error',
          message: 'Something went wrong. Please try again.'
        });
        setOpen(false);
        setEditingQA(null);
      }
      console.error('Error saving QA:', err);
    }
  };

  // Delete QA
  const confirmDelete = (qa) => {
    setSelectedQA(qa);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`qa/${selectedQA._id}`);
      setOpenDeleteDialog(false);
      setSelectedQA(null);
      fetchQAs();
      setSnackbar({ open: true, severity: 'success', message: 'Your QA was deleted successfully' });
    } catch (err) {
      console.error('Error deleting QA:', err);
      setSnackbar({ open: true, severity: 'error', message: 'Something went wrong. Please try again.' });
    }
  };

  // CSV Upload
  const handleCSVUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchQAs();
      const { validRows, totalRows, msg } = res.data;
      const invalidRows = totalRows - validRows;
      if (validRows > 0 && invalidRows) {
        // Partial success
        setSnackbar({
          open: true,
          severity: 'warning',
          message: `Processed ${validRows} out of ${totalRows} rows successfully. ${invalidRows} rows were skipped.`
        });
      } else if (validRows > 0) {
        // Full success
        setSnackbar({
          open: true,
          severity: 'success',
          message: `Your CSV was processed successfully. Added ${validRows} out of ${totalRows} rows.`
        });
      } else {
        setSnackbar({
          open: true,
          severity: 'error',
          message: msg || 'No valid rows found in CSV. Please check your file and try again.'
        });
      }
    } catch (err) {
      const { msg } = err.response?.data || {};
      console.error('Error uploading your CSV:', err);
      if (msg) {
        setSnackbar({
          open: true,
          severity: 'error',
          message: msg
        });
      } else {
        setSnackbar({
          open: true,
          severity: 'error',
          message: 'Something went wrong. Please try again.'
        });
      }
    } finally {
      setUploading(false);
    }
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
          <IconButton size="small" onClick={() => confirmDelete(params.row)}>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            "Are you sure you want to delete <strong>{selectedQA?.question}" </strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 4 }}>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <CustomSnackbar
        open={snackbar.open}
        autoHideDuration={6000}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
}
