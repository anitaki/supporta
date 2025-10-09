// material-ui
import { Typography, Button, Link, Box, Stack } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import logo from 'assets/logos/animated-logo.gif';

export default function HomePage() {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#6517ab'
        }}
      >
        <img src={logo} alt="Supporta" width="150" />
      </Box>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#6517ab'
        }}
      >
        <MainCard
          sx={{
            maxWidth: 600,
            p: 4,
            textAlign: 'center',
            bgcolor: '#ffffff',
            boxShadow: 3,
            borderRadius: 4
          }}
        >
          {/* Title */}
          <Typography
            variant="h3"
            sx={{ mb: 2, fontWeight: 'bold', color: '#673ab7' }} // Supporta Purple
          >
            Smarter Support, Made Simple.
          </Typography>

          {/* Subtitle */}
          <Typography variant="body1" sx={{ mb: 4, color: '#555' }}>
            Supporta helps small businesses deliver fast, 24/7 customer support with an AI-powered chatbot that feels human. Easy to set up,
            customizable, and always there when your customers need it.
          </Typography>

          {/* Buttons */}
          <Stack spacing={2} direction="column">
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#673ab7',
                '&:hover': { bgcolor: '#5a2ca0' },
                fontWeight: 'bold',
                textTransform: 'none'
              }}
              component={Link}
              href="/auth/register"
            >
              Get Started for Free
            </Button>

            <Typography variant="body2" sx={{ color: '#666' }}>
              Already have an account?
            </Typography>

            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: '#673ab7',
                color: '#673ab7',
                fontWeight: 'bold',
                textTransform: 'none',
                '&:hover': { borderColor: '#5a2ca0', color: '#5a2ca0' }
              }}
              component={Link}
              href="/auth/login"
            >
              Log In
            </Button>
          </Stack>
        </MainCard>
      </Box>
    </>
  );
}
