import React, { useState } from 'react';
import {
  Badge,
  ClickAwayListener,
  InputAdornment,
  Popper,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {
  TextField,
  Box,
  Typography,
  Button,
  Checkbox,
  ListSubheader,
  Chip,
} from '@mui/material';
import { CheckedItemIcon, UncheckedItemIcon } from '../icons/index.tsx';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { vars } from '../../theme/variables.ts';
import { Option } from './Types.ts';

const {
  gray100,
  gray700,
  gray400,
  primaryPurple600,
  white,
  gray600,
  gray500,
  primaryPurple300,
  gray50,
} = vars;

const transition = {
  transition: 'all ease-in-out .3s',
};

const styles = {
  root: {
    gap: '0.5rem',
    minHeight: '2.25rem',
    borderRadius: '0.25rem',
    border: `0.0625rem solid ${gray100}`,
    cursor: 'pointer',
    background: white,
    display: 'flex',
    alignItems: 'center',
    padding: '0.33rem 0.75rem',
    boxShadow: '0 0.0625rem 0.125rem 0 rgba(16, 24, 40, 0.05)',
    // position: 'relative',
    ...transition,
    '& .expand': {
      fontSize: '1.5rem',
    },
    '&:hover': {
      background: gray50,
    },
  },

  rootHover: {
    borderColor: primaryPurple300,
    '&:hover': {
      borderColor: 'none',
    },
  },

  chip: {
    padding: '0.125rem 0.25rem 0.125rem 0.3125rem',
    gap: '0.1875rem',
    height: '1.5rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,

    '&.MuiChip-outlined': {
      background: white,
      border: 0,
      padding: 0,
      '&:hover': {
        background: 'transparent',
      },
    },

    '& .MuiChip-label': {
      padding: 0,
      fontWeight: 600,
      fontSize: '0.875rem',
      color: primaryPurple600,
    },

    '& .MuiChip-deleteIcon': {
      margin: 0,
      color: primaryPurple600,
      fontSize: '1rem',
      '&:hover': {
        color: primaryPurple600,
      },
    },
  },

  toggleIcon: {
    ml: 'auto',
    position: 'relative',
    zIndex: 9,
    fontSize: '1.25rem',
    color: gray600,
  },

  placeholder: {
    color: gray600,
    fontSize: '0.875rem',
    fontWeight: 600,
    userSelect: 'none',
  },

  list: {
    width: '50%',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
  },

  badge: {
    position: 'inherit',
    display: 'inline-block',
    '& .MuiBadge-badge': {
      position: 'absolute',
      width: '1.375rem',
      height: '1.375rem',
      color: gray400,
      display: 'none',
      textAlign: 'center',
      fontSize: '0.75rem',
      borderRadius: '3.125rem',
      fontWeight: 500,
      lineHeight: '150%',
    },
  },

  details: {
    width: '50%',
    overflow: 'auto',
    flexShrink: 0,
    '& .MuiTypography-body2': {
      color: gray700,
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: '142.857%',
      padding: 0,
    },

    '& .MuiTypography-body1': {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: '150%',
      padding: 0,
    },
  },
};

interface EntitiesProps {
  id?: string;
  placeholder: string;
  searchPlaceholder?: string;
  onSearch: (searchValue: string) => Option[];
  selectedOptions: Option[];
  onSelect: (selectedOptions: Option[]) => void;
}

export default function CustomEntitiesDropdown({
  placeholder,
  searchPlaceholder,
  onSearch,
  id,
  selectedOptions,
  onSelect,
}: EntitiesProps) {
  const dropdownButtonRef = React.useRef<null | HTMLElement>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = () => {
    setAnchorEl(anchorEl ? null : dropdownButtonRef.current);
  };

  const open = Boolean(anchorEl);
  const popperId = open ? 'simple-popper' : undefined;

  const [updatedSelectedOptions, setUpdatedSelectedOptions] = useState<
    Option[]
  >([]);
  const [autocompleteOptions, setAutocompleteOptions] = useState<Option[]>([]);
  const [searchValue, setSearchValue] = useState('');

  React.useEffect(() => {
    if (selectedOptions?.length > 1) {
      const temp = selectedOptions.slice(0, 1);
      setUpdatedSelectedOptions(temp);
    } else {
      setUpdatedSelectedOptions(selectedOptions);
    }
  }, [selectedOptions]);

  React.useEffect(() => {
    searchValue !== undefined && setAutocompleteOptions(onSearch(searchValue));
  }, [searchValue, onSearch]);

  const resetSelection = () => {
    const newSelectedOptions = selectedOptions.filter(
      (item) =>
        !autocompleteOptions.filter(
          (selectedItem) => selectedItem.id === item.id,
        ),
    );
    onSelect(newSelectedOptions);
  };

  const handleOptionSelection = (option: Option) => {
    const isOptionAlreadySelected = selectedOptions.some(
      (selected) => selected.id === option.id,
    );
    const newSelectedOptions = isOptionAlreadySelected
      ? selectedOptions.filter((selected) => selected.id !== option.id)
      : [...selectedOptions, option];
    onSelect(newSelectedOptions);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const isOptionSelected = (option: Option) => {
    return selectedOptions.some((selected) => selected.id === option.id);
  };

  return (
    <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
      <Box>
        <Badge sx={styles.badge} badgeContent={selectedOptions?.length}>
          <Box
            aria-describedby={id}
            sx={
              (open && selectedOptions.length > 0) || selectedOptions.length > 0
                ? { ...styles.root, ...styles.rootHover }
                : styles.root
            }
            onClick={handleClick}
            ref={dropdownButtonRef}
          >
            {selectedOptions.length === 0 ? (
              <Typography sx={styles.placeholder}>{placeholder}</Typography>
            ) : (
              <Box gap={0} display="flex" flexWrap="wrap" alignItems="center">
                {updatedSelectedOptions?.map((item: Option) => {
                  return (
                    <Tooltip title={item?.label} placement="top" arrow>
                      <Chip
                        key={item?.id}
                        sx={styles.chip}
                        variant={'outlined'}
                        onClick={(e) => {
                          handleClick();
                          e.stopPropagation();
                        }}
                        label={`${item?.label}`}
                      />
                    </Tooltip>
                  );
                })}
                {selectedOptions?.length > 1 && (
                  <Typography
                    sx={{
                      ...styles.chip,
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0,
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: primaryPurple600,
                    }}
                  >{`, +${selectedOptions?.length - 1}`}</Typography>
                )}
              </Box>
            )}
            {selectedOptions?.length ? (
              <ClearOutlinedIcon
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect([]);
                }}
                sx={{ ...styles.toggleIcon, color: primaryPurple600 }}
              />
            ) : open ? (
              <ExpandLessIcon className="expand" sx={styles.toggleIcon} />
            ) : (
              <ExpandMoreIcon className="expand" sx={styles.toggleIcon} />
            )}
          </Box>
        </Badge>
        <Popper
          key={`popper_${id}`}
          id={popperId}
          open={open}
          placement="bottom-start"
          anchorEl={anchorEl}
          sx={{
            height: '28.125rem',
            borderRadius: '0.5rem',
            background: white,
            boxShadow:
              '0 0.5rem 0.5rem -0.25rem rgba(7, 8, 8, 0.03), 0 1.25rem 1.5rem -0.25rem rgba(7, 8, 8, 0.08)',
            m: '0.25rem 0  !important',
            width: 'auto',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 999,
          }}
        >
          <Box
            display="flex"
            flex={1}
            height={
              autocompleteOptions.length > 0 ? 'calc(100% - 2.75rem)' : 'auto'
            }
          >
            <Box
              sx={{
                ...styles.list,
                width: '100%',
                height: '100%',
              }}
            >
              <Box
                sx={{
                  height: '2.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  '& .MuiSvgIcon-root': {
                    fontSize: '1rem',
                    marginRight: '0 !important',
                    width: '1.2rem',
                    height: '1.2rem',
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: 0,
                    fontSize: '0.875rem',
                    color: gray500,
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
                    border: `${gray100} 0.0625rem solid`,
                    borderRadius: '0.5rem 0.5rem 0 0',
                  },
                  '& .MuiBox-SearchMenu': {
                    outline: 0,
                  },
                }}
              >
                <TextField
                  fullWidth
                  autoFocus={true}
                  type="text"
                  value={searchValue}
                  onChange={handleInputChange}
                  placeholder={searchPlaceholder}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: '1rem', color: gray600 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              {autocompleteOptions.length > 0 ? (
                <>
                  <Box
                    height="calc(100% - 2.8rem)"
                    border={`0.0625rem solid ${gray100}`}
                    borderTop={0}
                    borderRadius="0 0 0.5rem 0.5rem"
                  >
                    <Box
                      height={1}
                      sx={{
                        '& .MuiListSubheader-root': {
                          padding: '0 0.625rem',
                          height: '2.2rem',
                          border: `0.0625rem solid ${gray100}`,
                          borderLeft: 0,

                          '& .MuiTypography-root': {
                            fontSize: '0.75rem',
                            lineHeight: '1.125rem',
                            fontWeight: 600,
                            color: gray700,
                          },
                        },
                        '& .MuiCheckbox-root': {
                          padding: 0,
                        },
                        '& .MuiButton-root': {
                          padding: 0,
                          height: '1.625rem',
                          fontSize: '0.75rem',
                          textTransform: 'none',
                          lineHeight: '1.125rem',
                          fontWeight: 600,
                          color: gray400,
                        },

                        '& ul': {
                          margin: 0,
                          listStyle: 'none',
                          padding: '0.5rem 0.0625rem 0 0.375rem',
                          borderTop: 0,
                          overflow: 'auto',
                          height: 'calc(100% - 2.2rem)',

                          '& li': {
                            padding: '0.5625rem 0.625rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',

                            '&:hover': {
                              background: gray50,
                              borderRadius: '0.375rem',
                            },

                            '&.selected': {
                              borderRadius: '0.375rem',
                            },

                            '& .MuiTypography-body1': {
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              lineHeight: '142.857%',
                              padding: 0,
                            },

                            '& .MuiTypography-body2': {
                              color: gray500,
                              fontSize: '0.75rem',
                              fontWeight: 400,
                              lineHeight: '150%',
                              padding: 0,
                              whiteSpace: 'nowrap',
                            },
                          },
                        },
                      }}
                    >
                      <ListSubheader
                        component="div"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Button
                          onClick={resetSelection}
                          sx={{
                            '&:hover': {
                              background: 'transparent',
                            },
                          }}
                        >
                          Reset Selection
                        </Button>
                      </ListSubheader>
                      <ul>
                        {autocompleteOptions.map((option: Option) => (
                          <li
                            key={option.id}
                            onClick={() => handleOptionSelection(option)}
                            className={
                              isOptionSelected(option) ? 'selected' : ''
                            }
                          >
                            <Checkbox
                              disableRipple
                              icon={<UncheckedItemIcon fontSize="small" />}
                              checkedIcon={<CheckedItemIcon fontSize="small" />}
                              checked={isOptionSelected(option)}
                            />
                            <Typography
                              sx={{ width: 1, height: 1, padding: '0.625rem' }}
                            >
                              {option?.label?.length > 100
                                ? option?.label.slice(0, 100) + '...'
                                : option?.label}
                            </Typography>
                            {/* <Typography whiteSpace="nowrap" variant="body2">
                              {option?.id}
                            </Typography> */}
                          </li>
                        ))}
                      </ul>
                    </Box>
                  </Box>
                </>
              ) : (
                <Typography
                  sx={{
                    width: 1,
                    height: 1,
                    padding: '1rem',
                    fontWeight: 500,
                  }}
                >
                  No results found
                </Typography>
              )}
            </Box>
          </Box>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
