import { useState, useRef, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  ClickAwayListener,
  Popper,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ReleaseSelectedCheckIcon, ReleaseDropdownIcon } from '../icons/index';
import { vars } from '../../theme/variables';
import Tooltip from './Tooltip';
import { Datasnapshot } from '../../models/json';

const { gray100, gray700, gray400, gray500, gray50, gray900, gray800 } = vars;

const styles = {
  root: {
    gap: '0.5rem',
    minHeight: '2.25rem',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '0.33rem 0.75rem',
    boxShadow: '0 0.0625rem 0.125rem 0 rgba(16, 24, 40, 0.05)',
    ...{ transition: 'all ease-in-out .3s' },
    '&:hover': {
      background: gray800,
    },
    '&:focus': {
      boxShadow: '0px 0px 0px 4px rgba(155, 24, 216, 0.24)',
    },
  },
  popper: {
    minWidth: 260,
    maxHeight: 320,
    borderRadius: '0.5rem',
    overflowX: 'hidden',
    background: gray900,
    borderColor: gray800,
    zIndex: 1200,
    border: `1px solid ${gray800}`,
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: gray900,
    '& .MuiOutlinedInput-input': {
      padding: 0,
      fontSize: '0.875rem',
      color: gray100,
      fontWeight: '400',
      height: '2.8rem',
      '&::placeholder': {
        fontSize: '0.875rem',
        color: gray500,
        opacity: 1,
        fontWeight: '400',
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      display: 'none',
    },
    '& .MuiOutlinedInput-root': {
      boxShadow: 'none',
      padding: '0',
      border: `0.0625rem solid transparent`,
      background: gray900,
    },
  },
  groupHeader: {
    fontWeight: 700,
    fontSize: '0.625rem',
    padding: '0.5rem 0 0.875rem 0',
    height: '2rem',
    color: gray400,
    background: 'transparent',
  },
  dropdownScrollbox: {
    border: `1px solid ${gray800}`,
    borderRadius: '0.5rem',
    maxHeight: 320,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '2.5rem',
    cursor: 'pointer',
    '&:hover': {
      background: gray800,
      marginX: '-0.5rem',
      paddingX: '0.5rem',
      borderRadius: '0.375rem',
    },
  },
};

// Helper function to format timestamp as 'mon yyyy'
function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const month = date.toLocaleString('en-US', { month: 'short' }).toLowerCase();
  const year = date.getFullYear();
  return `${month} ${year}`;
}

const ReleaseDropdown = ({
  datasnapshots,
  selectedDatasnaphshot,
  setSelectedDatasnaphshot,
}: {
    datasnapshots: Datasnapshot[];
  selectedDatasnaphshot: string;
  setSelectedDatasnaphshot: (datasnaphshot: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const handleInputRef = (input: HTMLInputElement | null) => {
    inputRef.current = input;
  };

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, inputRef]);

  const groupedOptions = useMemo(() => {
    const groups: { [key: string]: Datasnapshot[] } = {};
    datasnapshots.forEach((snapshot) => {
      if (!groups[snapshot.source]) {
        groups[snapshot.source] = [];
      }
      groups[snapshot.source].push(snapshot);
    });
    return Object.entries(groups).map(([group, options]) => ({
      group,
      options,
    }));
  }, [datasnapshots]);

  // Helper to get group name for selected snapshot
  const getGroupNameForSelected = (
    groupedOptions: { group: string; options: Datasnapshot[] }[],
    selectedId: string,
  ) => {
    for (const group of groupedOptions) {
      const found = group.options.find((o) => o.id === parseInt(selectedId));
      if (found) return group.group;
    }
    return '';
  };

  const filteredGroups = groupedOptions.map((group) => ({
    ...group,
    options: group.options.filter((opt) =>
      `${group.group} ${opt.version} ${formatTimestamp(opt.timestamp)}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  }));

  const selectedOption = groupedOptions
    .flatMap((g) => g.options)
    .find((o) => o.id === parseInt(selectedDatasnaphshot));

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: 'relative', minWidth: 220, maxWidth: 237, width: '100%' }}>
        <Tooltip
          body="Choose which data snapshot you want to view."
          placement="bottom"
        >
          <Box
            ref={anchorRef}
            sx={{
              ...styles.root,
              maxWidth: 237,
              width: '100%',
            }}
            onClick={() => {
              setOpen((v) => !v);
            }}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v);
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Typography
                sx={{
                  color: gray50,
                  mr: 1,
                }}
              >
                {getGroupNameForSelected(groupedOptions, selectedDatasnaphshot)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: gray400,
                  fontWeight: 600,
                  mr: 1,
                  maxWidth: '112px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
              >
                {`Data Snapshot ${selectedOption?.version}`}
              </Typography>
              <Box sx={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ReleaseDropdownIcon />
              </Box>
            </Box>
          </Box>
        </Tooltip>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          modifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}
          sx={{ ...styles.popper }}
        >
          <Box sx={{ borderBottom: `1px solid ${gray700}` }}>
            <TextField
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search release"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: gray800, fontSize: '1rem' }} />
                  </InputAdornment>
                ),
              }}
              sx={styles.searchBox}
              inputRef={handleInputRef}
            />
          </Box>
          <Box className="dropdown-scrollbox" sx={styles.dropdownScrollbox}>
            {filteredGroups.map((group) =>
              group.options.length > 0 ? (
                <Box
                  key={group.group}
                  sx={{
                    borderBottom: `1px solid ${gray700}`,
                    paddingX: '0.75rem',
                    paddingBottom: '0.25rem',
                  }}
                >
                  <Typography sx={styles.groupHeader}>
                    {group.group.toUpperCase()}
                  </Typography>
                  {group.options.map((option) => (
                    <Box
                      key={option.id}
                      sx={styles.option}
                      onClick={() => {
                        setSelectedDatasnaphshot(option.id.toString());
                        setOpen(false);
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginRight: '1.5rem',
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            color: gray100,
                          }}
                        >
                          {`Data Snapshot ${option.version}`}
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 400,
                            fontSize: '0.875rem',
                            color: gray400,
                          }}
                        >
                          {formatTimestamp(option.timestamp)}
                        </Typography>
                      </Box>
                      {parseInt(selectedDatasnaphshot) === option.id && (
                        <ReleaseSelectedCheckIcon />
                      )}
                    </Box>
                  ))}
                </Box>
              ) : null,
            )}
          </Box>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default ReleaseDropdown;