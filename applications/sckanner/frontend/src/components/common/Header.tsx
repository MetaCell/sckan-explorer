import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Logo from '../assets/svg/Logo_beta.svg';
import AboutScannerLogo from '../assets/svg/actions.svg';
import MenuIcon from '@mui/icons-material/Menu';
import About from './About';
import { useNavigate, useLocation } from 'react-router-dom';
import ReleaseDropdown from './ReleaseDropdown';
import { Datasnapshot } from '../../models/json';
import { useDataContext } from '../../context/DataContext';

const pages = [
  {
    title: 'Connectivity',
    link: '/',
  },
  {
    title: 'Database Summary',
    link: '/summary',
  },
];

function Header({
  datasnapshots,
  selectedDatasnaphshot,
  setSelectedDatasnaphshot,
}: {
  datasnapshots: Datasnapshot[];
  selectedDatasnaphshot: string;
  setSelectedDatasnaphshot: (datasnaphshot: string) => void;
}) {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null,
  );
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const { resetWidgetState } = useDataContext();
  const handleCloseNavMenu = (link: string) => {
    setAnchorElNav(null);
    navigate(link);
  };
  const handleChangeDatasnapshot = (datasnapshot: string) => {
    resetWidgetState(datasnapshot);
    setSelectedDatasnaphshot(datasnapshot);
  };
  const [open, setOpen] = React.useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleShareClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setShowCopyFeedback(true);

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleCloseCopyFeedback = () => {
    setShowCopyFeedback(false);
  };

  return (
    <>
      <AppBar position="fixed">
        <Container maxWidth={false} sx={{ padding: 0 }}>
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 4,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              <img src={Logo} />
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {pages.map((page) => (
                  <MenuItem
                    key={page.title}
                    onClick={() => handleCloseNavMenu(page.link)}
                  >
                    <Typography textAlign="center">{page.title}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* mobile menu starts here  */}
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              <img src={Logo} />
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page, i) => (
                <Button
                  key={i}
                  className={pathname === page.link ? 'active' : ''}
                  onClick={() => handleCloseNavMenu(page.link)}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {page.title}
                </Button>
              ))}
            </Box>
            {datasnapshots && selectedDatasnaphshot && (
              <ReleaseDropdown
                datasnapshots={datasnapshots}
                selectedDatasnaphshot={selectedDatasnaphshot}
                setSelectedDatasnaphshot={handleChangeDatasnapshot}
              />
            )}
            <Box sx={{ flexGrow: 0, mr: 2 }}>
              <Button
                variant="contained"
                onClick={handleShareClick}
                color={copied ? 'success' : 'primary'}
              >
                {copied ? 'Copied!' : 'Share Sckanner'}
              </Button>
            </Box>
            <Box sx={{ flexGrow: 0 }}>
              <IconButton sx={{ p: 0 }} onClick={() => setOpen(!open)}>
                <img src={AboutScannerLogo} />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <About open={open} handleClose={() => setOpen(false)} />

      <Snackbar
        open={showCopyFeedback}
        autoHideDuration={3000}
        onClose={handleCloseCopyFeedback}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseCopyFeedback}
          severity="success"
          sx={{ width: '100%' }}
        >
          URL copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}
export default Header;
