import React, { FC } from "react";
import { Box, Button } from "@mui/material";
import { MinusIcon, PlusIcon } from "../icons";
import { vars } from "../../theme/variables";
const { gray700, gray100, gray50, primarypurple900, gray25, gray200, primarypurple500 } = vars;

interface ListItem {
  label: string;
  options: (ListItem | string)[];
  expanded: boolean;
}

interface CollapsibleListProps {
  list: ListItem[];
  onItemClick: (item: ListItem | string) => void;
}

const CollapsibleList: FC<CollapsibleListProps> = ({ list, onItemClick }) => {
  const renderOptions = (options: (ListItem | string)[], expanded: boolean, index?: number) => (
    <Box sx={{
        paddingLeft: '0.75rem',
        position: 'relative',

        '&:before': {
            content: '""',
            height: '100%',
            width: '0.0625rem',
            background: gray100,
            position: 'absolute',
            left: '0.4375rem',
            top: 0
        },

        '& .MuiButton-root': {
            position: 'relative',
            '&:hover:before': {
                content: '""',
                height: '100%',
                width: '0.0938rem',
                background: primarypurple900,
                position: 'absolute',
                left: '-0.3125rem',
                top: 0
            },
            '&:focus': {
                color: primarypurple500,
                fontWeight: 600,
                '&:before': {
                    content: '""',
                    height: '100%',
                    width: '0.0938rem',
                    background: primarypurple900,
                    position: 'absolute',
                    left: '-0.3125rem',
                    top: 0
                },
            }
        }
    }}>
    {expanded &&
        options.map((option, optionIndex) => (
        <React.Fragment key={optionIndex}>
            {typeof option === 'string' ? (
            <Button
                variant="contained"
                disableElevation
                onClick={() => onItemClick(option)}
                sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                borderRadius: '0.25rem',
                marginTop: '0.25rem',
                fontSize: '0.875rem',
                fontWeight: '400',
                alignItems: 'center',
                padding: '0 0.5rem',
                height: '2rem',
                background: 'transparent',
                color: gray700,
                '&:hover': {
                    background: gray25,
                    color: gray700,
                },
                '&:focus': {
                    background: gray25,
                    color: gray700,
                },
                }}
            >
                {option}
            </Button>
            ) : (
            <>
                <Button
                variant="contained"
                disableElevation
                onClick={() => onItemClick(option)}
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    borderRadius: '0.25rem',
                    marginTop: '0.25rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    alignItems: 'center',
                    padding: '0 0.5rem',
                    height: '2rem',
                    background: index === 0 ? gray25 : gray50,
                    color: gray700,
                    '&:hover': {
                        background: index === 0 ? gray50 : gray200,
                        color: gray700,
                    },
                    '&:focus': {
                        background: index === 0 ? gray50 : gray200,
                        color: gray700,
                    },
                }}
                >
                {option.label} {option.expanded ? <MinusIcon /> : <PlusIcon />}
                </Button>
                {renderOptions(option.options, option.expanded, optionIndex)}
            </>
            )}
        </React.Fragment>
        ))}
    </Box>
  );
  
  return (
    <Box sx={{ width: '15.625rem', position: 'absolute', bottom: 0 }}>
        {list.map((item, index) => (
        <Box key={index} style={{ padding: '0.125rem 0.125rem 0.125rem 0' }}>
            <Button
            variant="contained"
            disableElevation
            onClick={() => onItemClick(item)}
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                borderRadius: '0.25rem',
                boxSizing: 'border-box',
                fontSize: '0.875rem',
                fontWeight: '500',
                alignItems: 'center',
                padding: '0 0.5rem',
                height: '2rem',
                background: gray100,
                border: '0.0625rem solid transparent',
                color: gray700,
                '&:hover': {
                background: gray100,
                color: gray700,
                borderColor: gray200
                },
                '&:focus': {
                    background: gray100,
                    color: primarypurple500,
                    borderColor: gray200
                },
            }}
            >
            {item.label} {item.expanded ? <MinusIcon /> : <PlusIcon />}
            </Button>
            {renderOptions(item.options, item.expanded)}
        </Box>
        ))}
    </Box>
  )
};

export default CollapsibleList;