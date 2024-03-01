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
  gray800,
  gray600,
  gray700,
  gray400,
  gray100,
  gray25,
  primaryPurple500,
  buttonShadow,
  gray500,
  primaryPurple50,
  primaryPurple700,
  primaryPurple200,
  primaryPurple600,
  primaryPurple25,
  primaryPurple100,
  gray50,
  gray200,
  gray300,
} = vars

const theme = createTheme({
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
    h5: {
      fontSize: '1rem',
      fontWeight:600,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight:600,
    },
    subtitle1: {
      fontSize: '0.875rem',
      fontWeight:500,
      color: gray700
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
            marginRight: 2,
            textTransform: 'none',
            padding: '0.375rem 0.875rem',
            '&.active, &:hover': {
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
        },
      },
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
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: buttonShadow,
          fontSize: '0.875rem',
          fontWeight: 600,
          lineHeight: '1.25rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.25rem',
          gap: '0.25rem',
        },
        contained: {
          boxShadow: 'none',
          background: primaryPurple500,
          color: baseWhite,
          border: `1px solid ${primaryPurple500}`,
          '&:hover': {
            boxShadow: 'none',
            border: '1px solid #8300BF',
            background: primaryPurple600
          }
        },
        outlined: {
            border: `1px solid ${gray100}`,
            background: baseWhite,
            color: gray600,
            '& .MuiSvgIcon-root': {
              fontSize: '1.25rem'
            },
          '&:hover': {
          border: `1px solid ${gray100}`,
          background: gray50,
          }
        },
        text: {
          boxShadow: 'none',
          color: gray500
        }
      },
    },
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '& .MuiButtonBase-root': {
            borderRadius: '0.25rem',
            border: `1px solid ${gray100}`,
            background: baseWhite,
            color: gray600,
            padding: '0.375rem',
            
            '& .MuiSvgIcon-root': {
              fontSize: '1.25rem'
            }
          }
        }
      }
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 500,
        },
        li: {
          fontSize: '0.875rem',
          '& a': {
            color: gray500,
            cursor: 'pointer',
          },
          '&:last-child': {
            color: primaryPurple600
          }
        },
        separator: {
          color: gray300
        }
      }
    },
    MuiSvgIcon: {
      styleOverrides: {
        fontSizeSmall: {
          fontSize: '1rem'
        },
      }
    },
    MuiAccordion: {
      styleOverrides: {
       root: {
         boxShadow: 'none',
         "&:before":{
           display: 'none'
         },
         '& .MuiAccordionSummary-root':{
           paddingLeft: 0,
           gap: '.5rem',
           flexDirection: 'row-reverse',
           '& .MuiTypography-root': {
             fontSize: '0.875rem',
             color: gray700,
             fontWeight: 500
           },
           '& .MuiAccordionSummary-expandIconWrapper':{
             color: gray700,
             fontSize: '1rem',
             '&.Mui-expanded': {
               transform: 'rotate(90deg)',
             }
           },
         },
       },
      }
    },
    MuiChip: {
      styleOverrides: {
       root: {
         width: 'fit-content',
         fontSize: '0.75rem',
         fontWeight: 500,
         lineHeight: '1.125rem',
         height: '1.375rem',
         borderRadius: '1rem',
         padding: '0 0.5rem',
         fontFamily: primaryFont,
         
         '&:active': {
           boxShadow: 'none'
         }
       },
        label: {
         padding: 0
        },
        outlinedPrimary: {
          background: '#FAF1FD',
          borderColor: '#E8C3F8',
          color: primaryPurple500
        },
        outlined: {
          color: primaryPurple700,
          backgroundColor: primaryPurple50,
          borderColor: primaryPurple200,
          
          '&.link': {
            backgroundColor: primaryPurple25,
            borderColor: primaryPurple100,
            padding: '0.125rem 0.625rem'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
       root: {
         boxShadow: 'none'
       },
      }
    },
    MuiTable: {
      styleOverrides: {
       root: {
       
       }
      }
    },
    MuiTableContainer: {
      styleOverrides: {
       root: {
         borderRadius: '0.25rem',
          border: `1px solid ${gray200}`,
         
         '& .MuiTableCell-root': {
           borderBottom: `1px solid ${gray100}`,
           color: gray600,
           fontWeight: 400,
           padding: '.75rem'
         }
       }
      }
    },
    MuiTab: {
      styleOverrides: {
       root: {
         color: gray500,
         padding: '0.5rem 0.75rem',
         fontSize: '0.875rem',
         fontWeight: 600,
         height: '2.25rem',
         
          '&.Mui-selected': {
            background: gray50,
            color: gray700,
            borderRadius: '0.25rem',
            boxShadow: buttonShadow,
          },
       },
      }
    },
    MuiTabs: {
      styleOverrides: {
       root: {
         '& .MuiTabs-indicator': {
            display: 'none'
         }
       },
      }
    },
    MuiDivider: {
      styleOverrides: {
       root: {
         borderColor: gray100
       },
      }
    }
  }
});

export default theme;
