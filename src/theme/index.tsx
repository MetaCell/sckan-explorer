import { createTheme } from "@mui/material/styles";
import { vars } from "./variables";
import maximizeIcon from "../../src/components/assets/svg/maximize_icon.svg";
import minimizeIcon from "../../src/components/assets/svg/minimize_icon.svg";
const {
  primaryFont,
  primary500,
  primary600,
  baseBg,
  baseWhite,
  baseContainerBg,
  primarypurple700,
  primarypurple500,
  gray800,
  gray600,
  gray700,
  gray400,
  gray100,
  gray500,
  gray300,
  gray25,
} = vars

let theme = createTheme();

theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: primaryFont,
      letterSpacing: 'normal',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: '150%',
    },
    body1: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: '1.25rem',
    },
    body2: {
      color: gray700,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight:600,
    },
    button: {
      fontSize: '0.875rem',
      color: primary600,
      fontWeight: 600,
      textTransform: 'none'
    }
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: `
      * {
          box-sizing: border-box !important;
          margin: 0;
          font-family: ${primaryFont};
          padding: 0;
        }
      body {
          background: ${baseBg};
        }
      .MuiContainer {
          display: flex;
          width: 100%;
          background: ${baseContainerBg};
          height: calc(100vh - 52px);
          margin-top: 52px;
          overflow: hidden;
          padding: 1rem;
          border-radius: 16px 16px 0 0;
        }
        .flexlayout__layout {
          overflow: inherit;
        }
        .flexlayout__border_bottom {
          border: 0;
          background: transparent;
        }
        .flexlayout__tab {
          margin-top: 0.4em;
          border-radius: 0 0.5rem 0.5rem 0.5rem;
        }
        .flexlayout__tabset {
          background: transparent;



          .flexlayout__tabset_tabbar_outer_top {
            border-bottom: none;
          }
          .flexlayout__tab_toolbar_button-min {
            background: transparent url(${maximizeIcon}) no-repeat right;
            cursor: pointer;
          }
          .flexlayout__tab_toolbar_button-max {
            background: transparent url(${minimizeIcon}) no-repeat right;
            cursor: pointer;
          }
          .flexlayout__tabset_tabbar_outer {
            background-color: transparent;
            height: 2rem !important;
            .flexlayout__tab_toolbar_button {
              &:focus {
                outline: 0;
              }
            }
            .flexlayout__tab_button {
              margin: 0;
              border-radius: 8px 8px 0px 0px;
              padding: 0.25rem 0.5rem;
              margin-right: 0.25rem;
              color: ${gray800};
              min-width: 150px;
              font-size: 0.875rem;
              font-weight: 600;
              &.flexlayout__tab_button--selected {
                background-color: ${baseWhite};
                &:hover {
                  background-color: ${baseWhite};
                }
              }
            }
          }
        }

      `
    },

    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: primary500
        }
      }
    },
    MuiAppBar: {
      styleOverrides : {
        root: {
          background: baseBg,
          boxShadow: 'none',
        }
      }
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '52px !important',
          '& .MuiButton-root': {
            color: 'white',
            margin: 0,
            fontWeight: 500,
            marginRight: 6,
            border: '1px solid transparent',
            textTransform: 'none',
            padding: '0.2rem 0.875rem',
            '&.active': {
              background: gray700,
              borderColor: primarypurple500,
            },
            '&:focus': {
              borderColor: 'transparent',
              outline: '4px solid #9B18D83D',
            },
            '&:hover': {
              background: gray700,
            },
          }
        }
      }
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '& .MuiTouchRipple-root' : {
            display: 'none',
          },
          '&:focus': {
            outline: 0,
          }
        }
      }
    },

    MuiDialog: {
      styleOverrides: {
        root: {
        },
        paper: {
          borderRadius: 12,
          maxWidth: '34.375rem',
          '& .MuiIconButton-root' : {
            color: gray400,
            borderRadius: 0,
            padding: '0.25rem',
            '&:hover': {

            }
          },
          '& .MuiSvgIcon-root': {
            width: '0.85em',
            height: '0.85em',
          }
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 500,
          color: gray800,
          background: gray25,
          padding: '0.813rem 1.5rem'
        }
      }
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          borderColor: gray100,
          borderBottom: 0,
          '& .MuiBox-root': {
            margin: '0.4rem 0 1rem',
            '&.MuiBoxMetacell-footer' : {
              display: 'flex',
              margin: 0,
              borderTop: `1px solid ${gray100}`,
              padding:'1.5rem 0 0.5rem',
              '& p': {
                fontSize: '0.75rem',
                marginRight: '1rem'
              }
            },
            '& p': {
              color: gray600,
            }
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          border: `1px ${gray100} solid`,
          boxShadow: "0 0 4px rgba(0, 0, 0, 0.1)",
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
          },
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent'
            }
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: primarypurple700,
            }
          }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: gray600,
          fontWeight: 600,
          '&.Mui-focused': {
            color: primary600,
          }
        }
      }
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiSvgIcon-root': {
            marginRight: '0.5rem',
            marginLeft: '0.875rem',
            color: gray600,
          }
        }
      }
    },
  }
});

export default theme;
