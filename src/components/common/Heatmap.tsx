import React, { FC, Dispatch, SetStateAction } from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { vars } from "../../theme/variables";
import CollapsibleList from "./CollapsibleList";
import HeatMap from "react-heatmap-grid";
const { gray50, primarypurple900, gray25, gray300, gray100A, gray500 } = vars;

interface ListItem {
  label: string;
  options: (ListItem | string)[];
  expanded: boolean;
}

const generateYLabels = (list: (ListItem | string)[], prefix = ''): string[] => {
  let labels: string[] = [];
  list.forEach(item => {
    const label = typeof item === 'string' ? item : item.label;
    const fullLabel = prefix ? `${prefix} - ${label}` : label;
    labels.push(label);
    if (typeof item !== 'string' && item.expanded && item.options) {
        labels = labels.concat(generateYLabels(item.options, fullLabel));
    }
  });
  return labels;
};

interface HeatmapGridProps {
  list: ListItem[];
  xLabels: string[];
  data: number[][];
  cellClick?: (x: number, y: number) => void;
  xAxis?: string;
  yAxis?: string;
  setList: Dispatch<SetStateAction<ListItem[]>>;
  setData: Dispatch<SetStateAction<number[][]>>; 
  selectedCell?: {x: number, y: number} | null;
}

const HeatmapGrid: FC<HeatmapGridProps> = ({ list, xLabels, data, xAxis, yAxis, setList, setData, cellClick, selectedCell }) => {
  const [collapsed] = React.useState<boolean>(true);

  const handleItemClick = (item: ListItem | string) => {
    if (typeof item === "string") {
      // Clicked on an option without children
      alert(`Clicked on ${item}`);
    } else if (item.options) {
      const updateList = (list: ListItem[], selectedItem: ListItem) => {
        return list.map((listItem): ListItem => {
          if (listItem.label === selectedItem.label) {
            return { ...listItem, expanded: !listItem.expanded };
          } else if (listItem.options) {
            return {
              ...listItem,
              options: updateList(listItem.options as ListItem[], selectedItem),
            };
          }
          return listItem;
        });
      };

      const updatedList = updateList(list, item);

      if (collapsed) {
        // Expand
        setList(updatedList);
        setData((prevData:number[][]) => {
          const mainRow: number[] = new Array(xLabels.length)
            .fill(0)
            .map(() => Math.floor(Math.random() * 100));
          const optionRows: number[][] = updatedList.flatMap((item) =>
            item.expanded ? item.options.map(() =>
              new Array(xLabels.length)
                .fill(0)
                .map(() => Math.floor(Math.random() * 100))
            ) : []
          );
          return [...prevData, mainRow, ...optionRows];
        });
      } else {
        // Collapse
        setList(updatedList.filter((item) => !item.expanded));
        setData((prevData: number[][])  =>
          prevData.filter(
            (_, index) =>
              !updatedList.some(
                (item) => item.expanded && index === updatedList.indexOf(item)
              )
          )
        );
      }
    }
  };
  
  return (
    <Box flex={1} my={3} display='inline-flex' flexDirection='column'>
      <Box mb={1.5} pl="17.375rem">
        <Typography sx={{
          textAlign: 'center',
          fontSize: '0.875rem',
          fontWeight: 400,
          lineHeight: '1.25rem',
          minWidth: '4.0625rem',
          color: gray500

        }}>{xAxis}</Typography>
      </Box>
      <Box display='flex' alignItems='center'>
      <Typography sx={{
          textAlign: 'center',
          fontSize: '0.875rem',
          marginTop: '4.875rem',
          paddingRight: '0.75rem',
          fontWeight: 400,
          writingMode: 'vertical-lr',
          lineHeight: 1,
          color: gray500

      }}>{yAxis}</Typography>

      <Box position='relative' sx={{
        '& > div:first-of-type': {
        '& > div:last-of-type': {
            '& > div': {
            '& > div': {
                '&:not(:first-of-type)': {
                '&:hover': {
                    boxShadow: '0rem 0.0625rem 0.125rem 0rem #1018280F, 0rem 0.0625rem 0.1875rem 0rem #1018281A'
                },
                '& > div': {
                    paddingTop: '0 !important',
                    height: '100%',

                    '& > div': {
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                    }
                }
                },
                '&:first-of-type': {
                width: '15.625rem',
                flex: 'none !important',
                '& > div': {
                    opacity: 0
                }
                }
            }
            }
        },
        '& > div:first-of-type': {
        '& > div': {
            writingMode: 'vertical-lr',
            lineHeight: 1,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginLeft: '0.1563rem',
            padding: '0.875rem 0',
            position: 'relative',
            borderRadius: '0.25rem',

            '&:hover': {
                background: gray50,
                '&:before': {
                    content: '""',
                    width: '100%',
                    height: '0.0625rem',
                    background: primarypurple900,
                    position: 'absolute',
                    top: '-0.25rem',
                    left: 0
                },
            },

            '&:first-of-type': {
                marginLeft: 0,
                width: '15.625rem',
                flex: 'none !important',
                '&:hover': {
                    background: 'none',
                    '&:before': {
                        display: 'none'
                    }
                }
            }
            }
        }
        }
      }}>
      <HeatMap
        xLabels={xLabels}
        yLabels={generateYLabels(list)}
        xLabelsLocation={"top"}
        xLabelsVisibility={xLabels.map(() => true)}
        xLabelWidth={160}
        yLabelWidth={250}
        data={data}
        squares
        height={43}
        onClick={(x: number, y: number) => cellClick && cellClick(x, y)}
        cellStyle={(_background: string, value: number, min: number, max: number, _data: string, _x: number, _y: number) => {
          const isSelectedCell = selectedCell?.x === _x && selectedCell?.y === _y
          return {
            fontSize: "0.7188rem",
            widht: '2.6875rem',
            height: '2rem',
            borderRadius: '0.25rem',
            borderWidth: isSelectedCell ? '0.125rem' : '0.0625rem',
            borderStyle: 'solid',
            borderColor: isSelectedCell ? '#8300BF' : 1 - (max - value) / (max - min) <= 0.1  ? gray100A : 'rgba(255, 255, 255, 0.2)',
            background: 1 - (max - value) / (max - min) <= 0.1  ? gray25 : `rgba(131, 0, 191, ${1 - (max - value) / (max - min)})`,
            margin: '0.125rem'
          }
        }}
        cellRender={(value: string, x: number, y: number) => (
          <Tooltip
            arrow
            placement="right"
            title={
              <Box>
                <Typography sx={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  lineHeight: '1.125rem',
                  color: gray300

                }}>{`${x} -> ${y}`}</Typography>
                <Typography sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  lineHeight: '1.125rem',
                  color: gray25,
                  marginTop: '0.125rem'

                }}>{`${value}`} connections</Typography>
              </Box>
            }
          >
            <Box sx={{ opacity: 0 }}>{value}</Box>
          </Tooltip>
        )}
      />

      {collapsed ? (
        <CollapsibleList list={list} onItemClick={handleItemClick} />
      ) : null}
      </Box>
      </Box>

    </Box>
  )
};

export default HeatmapGrid;