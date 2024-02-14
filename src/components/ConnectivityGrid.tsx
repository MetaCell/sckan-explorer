import { Maximize, Minimize } from "@mui/icons-material";
import { Box } from "@mui/material";
import React, { useState, FC } from "react";
import HeatMap from "react-heatmap-grid";

interface ListItem {
  label: string;
  options: string[];
  expanded: boolean;
}

const xLabels: string[] = ["Brain", "Lungs", "Cervical", "Spinal", "Thoraic"];
const initialList: ListItem[] = [
  {
    label: "Brain",
    options: ["Spinal Cord", "Thoraic Nerves"],
    expanded: false,
  },
  { label: "Cranial Nerves", options: ["Citoris", "Cranial"], expanded: false },
  { label: "Lumbar Nerves", options: ["Base", "Ground"], expanded: false },
];

const initialData: number[][] = initialList.reduce((acc, item) => {
  const mainRow: number[] = new Array(xLabels.length)
    .fill(0)
    .map(() => Math.floor(Math.random() * 100));
  const optionRows: number[][] = item.options.map(() =>
    new Array(xLabels.length).fill(0).map(() => Math.floor(Math.random() * 100))
  );
  return [...acc, mainRow, ...optionRows];
}, []);

interface CollapsibleListProps {
  list: ListItem[];
  onItemClick: (item: ListItem | string) => void;
}

const CollapsibleList: FC<CollapsibleListProps> = ({ list, onItemClick }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    {list.map((item, index) => (
      <div key={index} style={{ cursor: "pointer" }}>
        <div onClick={() => onItemClick(item)}>
          {item.expanded ? <Minimize /> : <Maximize />} {item.label}
        </div>
        {item.expanded &&
          item.options.map((option, optionIndex) => (
            <div
              key={optionIndex}
              style={{ marginLeft: "20px", cursor: "pointer" }}
              onClick={() => onItemClick(option)}
            >
              {option}
            </div>
          ))}
      </div>
    ))}
  </div>
);

function ConnectivityGrid() {
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const [list, setList] = useState<ListItem[]>(initialList);
  const [data, setData] = useState<number[][]>(initialData);

  const handleItemClick = (item: ListItem | string) => {
    if (typeof item === "string") {
      // Clicked on an option without children
      alert(`Clicked on ${item}`);
    } else if (item.options) {
      if (collapsed) {
        // Expand
        const mainRow: number[] = new Array(xLabels.length)
          .fill(0)
          .map(() => Math.floor(Math.random() * 100));
        const optionRows: number[][] = item.options.map(() =>
          new Array(xLabels.length)
            .fill(0)
            .map(() => Math.floor(Math.random() * 100))
        );
        setList((prevList) =>
          prevList.map((prevItem) =>
            prevItem.label === item.label
              ? { ...prevItem, expanded: !prevItem.expanded }
              : prevItem
          )
        );
        setData((prevData) => [...prevData, mainRow, ...optionRows]);
      } else {
        // Collapse
        setList((prevList) =>
          prevList.map((prevItem) =>
            prevItem.label === item.label
              ? { ...prevItem, expanded: !prevItem.expanded }
              : prevItem
          )
        );
        setData((prevData) =>
          prevData.filter(
            (_, index) =>
              !list.some(
                (item) => item.expanded && index === list.indexOf(item)
              )
          )
        );
      }
    }
  };

    return (
        <Box p={3} py={10} fontSize={14} sx={{
            '& > div': {
                '& > div:last-of-type': {
                    '& > div': {
                        '& > div:first-of-type': {
                            display: 'flex',
                            alignItems: 'center',
                            margin: '2px',
                            
                            '& > div': {
                                borderRadius: '4px',
                                display: 'flex',
                                fontSize: '14px',
                                fontWeight: '500',
                                alignItems: 'center',
                                padding: '6px 8px !important',
                                background: 'rgba(237, 239, 242, 1)',
                            }
                        }
                    }
                },
                '& > div:first-of-type': {
                    '& > div': {
                        writingMode: 'sideways-lr',
                        lineHeight: 1,
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        fontSize: '14px',
                        fontWeight: '500',
                        margin: '2px',
                        paddingBottom: '14px'
                    }
                }
            }
        }}>
            <HeatMap
                xLabels={xLabels}
                yLabels={list.flatMap((item) => [
                item.label,
                ...(item.expanded ? item.options : []),
                ])}
                xLabelsStyle={(index: number) => ({
                    color: index % 2 ? "transparent" : "#777",
                    fontSize: ".65rem",
                    padding: '0',
                    margin: '0',
                })}
                yLabelsStyle={() => ({
                    fontSize: ".65rem",
                    textTransform: "uppercase",
                    color: "#777",
                    padding: '0',
                    margin: '0'
                })}
                xLabelsLocation={"top"}
                xLabelsVisibility={xLabels.map(() => true)}
                xLabelWidth={160}
                yLabelWidth={250}
                data={data}
                squares
                height={43}
                onClick={(x: any, y: any) => alert(`Clicked ${x}, ${y}`)}
                
                
                cellStyle={(_background: any, value: number, min: number, max: number, _data: any, _x: any, _y: any) => ({
                    background: `rgb(131, 0, 191, ${1 - (max - value) / (max - min)})`,
                    fontSize: "11.5px",
                    color: "#444",
                    widht: '43px',
                    height: '32px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    margin: '2px'
                })}
                cellRender={(_value: any) => <></>}
            />

            
            {collapsed ? (
                <CollapsibleList list={list} onItemClick={handleItemClick} />
            ) : null}
        </Box>
    )
}

export default ConnectivityGrid
