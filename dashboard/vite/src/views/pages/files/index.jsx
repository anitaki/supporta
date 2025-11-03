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
  IconButton,
  CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Upload, Edit, Delete } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDate } from '../../../utils/formatDate';
import { CustomSnackbar } from '../../../ui-component/extended/Snackbar';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import ImageIcon from '@mui/icons-material/Image';
// const API_URL = import.meta.env.VITE_API_URL;

export default function FileManagement() {
  const [files, setFiles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', file: null });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: ''
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { api } = useAuth();

  const fetchFiles = async () => {
    try {
      const res = await api.get(`/file`);
      setFiles(res.data);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Add/Edit File
  const handleSave = async () => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      if (form.file) formData.append('file', form.file);

      // Determine upload route based on file type
      let uploadRoute = '/upload';
      if (form.file) {
        const isPDF = form.file.type === 'application/pdf';
        uploadRoute = isPDF ? '/upload/pdf' : '/upload/image';
      }

      if (editingFile) {
        await api.patch(`/upload/${editingFile._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post(uploadRoute, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setOpen(false);
      setEditingFile(null);
      setForm({ title: '', description: '', file: null });
      fetchFiles();

      setSnackbar({ open: true, severity: 'success', message: 'Your file was saved successfully' });
    } catch (err) {
      console.error('Error saving file:', err);
      const message = err.response?.data?.msg?.[0]?.msg || 'Something went wrong. Please try again.';
      setSnackbar({ open: true, severity: 'error', message });
    } finally {
      setUploading(false);
    }
  };

  // Delete QA
  const confirmDelete = (file) => {
    setSelectedFile(file);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`file/${selectedFile._id}`);
      setOpenDeleteDialog(false);
      setSelectedFile(null);
      fetchFiles();
      setSnackbar({ open: true, severity: 'success', message: 'Your file was deleted successfully' });
    } catch (err) {
      console.error('Error deleting file:', err);
      setSnackbar({ open: true, severity: 'error', message: 'Something went wrong. Please try again.' });
    }
  };

  const columns = [
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'uploadedAt', headerName: 'Uploaded At', width: 150, valueFormatter: (params) => formatDate(params) },
    // {
    //   field: 'type',
    //   headerName: 'URL',
    //   width: 80,
    //   renderCell: (params) =>
    //     params.row.type === 'pdf' ? (
    //       <IconButton size="small" onClick={() => window.open(params.row.url, '_blank')} title="Open file">
    //         <PictureAsPdfRoundedIcon fontSize="small" />
    //       </IconButton>
    //     ) : (
    //       <IconButton size="small" onClick={() => window.open(params.row.url, '_blank')} title="Open file">
    //         <ImageIcon fontSize="small" />
    //       </IconButton>
    //     )
    // },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}
          gap={0.5}
        >
          <IconButton size="small" onClick={() => window.open(params.row.url, '_blank')} title="Open file">
            {params.row.type === 'pdf' ? <PictureAsPdfRoundedIcon fontSize="small" /> : <ImageIcon fontSize="small" />}
          </IconButton>

          <IconButton
            size="small"
            title="Edit file"
            onClick={() => {
              setEditingFile(params.row);
              setForm({
                title: params.row.title,
                description: params.row.description
              });
              setOpen(true);
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => confirmDelete(params.row)} title="Delete file">
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={600}>
          File Content Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingFile(null);
              setForm({ title: '', description: '' });
              setOpen(true);
            }}
            sx={{ mr: 1 }}
          >
            Add New
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <DataGrid rows={files} columns={columns} getRowId={(row) => row._id} autoHeight disableRowSelectionOnClick />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingFile ? 'Edit File' : 'Add File'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Box mt={1} sx={{ display: 'flex' }} gap={2}>
            <Button variant="outlined" component="label" sx={{ borderRadius: 1 }}>
              <Upload/> Upload File 
              <input type="file" hidden accept=".pdf,image/*" onChange={(e) => setForm({ ...form, file: e.target.files[0] })} />
            </Button>
            {form.file ? <Typography mt={1}>{form.file.name}</Typography> : <Typography mt={1}>No file selected</Typography>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={uploading}>
            {uploading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            "Are you sure you want to delete <strong>{selectedFile?.originalName} </strong>?
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