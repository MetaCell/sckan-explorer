import {Box, Button, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import CustomFilterDropdown from "./common/CustomFilterDropdown";
import {vars} from "../theme/variables";
import {Option} from "./common/Types";
import {mockEntities} from "./common/MockEntities";
import HeatmapGrid from "./common/Heatmap";
import {useDataContext} from "../context/DataContext.ts";
import {getYAxis} from "../services/heatmapService.ts";

export interface ListItem {
    label: string;
    options: (ListItem | string)[];
    expanded: boolean;
}

const {gray500, white: white, gray25, gray100, primaryPurple600, gray400} = vars;

const xLabels: string[] = ["Brain", "Lungs", "Cervical", "Spinal", "Thoraic", "Kidney", "Urinary Tract", "Muscle organ", "Small Intestine", "Pancreas", "Skin", "Spleen", "Stomach", "Urinary bladder"];


const getEntities = (searchValue: string /* unused */): Option[] => {

    console.log(`Received search value: ${searchValue}`);

    // Return mockEntities or perform other logic
    return mockEntities;
};

function ConnectivityGrid() {
    const {hierarchicalNodes} = useDataContext();

    const [list, setList] = useState<ListItem[]>([]);
    const [data, setData] = useState<number[][]>([]);

    // Convert hierarchicalNodes to ListItems
    useEffect(() => {
        const listItems = getYAxis(hierarchicalNodes);
        setList(listItems);
        const initialData = listItems.reduce((acc: number[][], item: ListItem) => {
            const mainRow: number[] = new Array(xLabels.length)
                .fill(0)
                .map(() => Math.floor(Math.random() * 100));
            const optionRows: number[][] = item.options.map(() =>
                new Array(xLabels.length).fill(0).map((_, i: number) => i % 3 === 0 ? Math.floor(Math.random() * 100) : 0)
            );
            return [...acc, mainRow, ...optionRows];
        }, []);
        setData(initialData);
    }, [hierarchicalNodes]);

    const [selectedCell, setSelectedCell] = useState<{ x: number, y: number } | null>(null);

    const handleClick = (x: number, y: number): void => {
        setSelectedCell({x, y});
    };
    return (
        <Box minHeight='100%' p={3} pb={0} fontSize={14} display='flex' flexDirection='column'>
            <Box pb={2.5}>
                <Typography variant="h6" sx={{fontWeight: 400}}>Connection Origin to End Organ</Typography>
            </Box>

            <Box display="flex" gap={1} flexWrap='wrap'>
                <CustomFilterDropdown
                    key={"Origin"}
                    placeholder="Origin"
                    options={{
                        value: "",
                        id: "origin",
                        searchPlaceholder: "Search origin",
                        onSearch: (searchValue: string): Option[] => getEntities(searchValue),
                    }}
                />
                <CustomFilterDropdown
                    key={"End Origin"}
                    placeholder="End organ"
                    options={{
                        value: "",
                        id: "endorgan",
                        searchPlaceholder: "Search End organ",
                        onSearch: (searchValue: string) => getEntities(searchValue),
                    }}
                />
                <CustomFilterDropdown
                    key={"Species"}
                    placeholder="Species"
                    options={{
                        value: "",
                        id: "species",
                        searchPlaceholder: "Search Species",
                        onSearch: (searchValue: string) => getEntities(searchValue),
                    }}
                />
                <CustomFilterDropdown
                    key={"Phenotype"}
                    placeholder="Phenotype"
                    options={{
                        value: "",
                        id: "phenotype",
                        searchPlaceholder: "Search Phenotype",
                        onSearch: (searchValue: string) => getEntities(searchValue),
                    }}
                />
                <CustomFilterDropdown
                    key={"ApiNATOMY"}
                    placeholder="ApiNATOMY"
                    options={{
                        value: "",
                        id: "ApiNATOMY",
                        searchPlaceholder: "Search ApiNATOMY",
                        onSearch: (searchValue: string) => getEntities(searchValue),
                    }}
                />
                <CustomFilterDropdown
                    key={"Via"}
                    placeholder="Via"
                    options={{
                        value: "",
                        id: "via",
                        searchPlaceholder: "Search Via",
                        onSearch: (searchValue: string) => getEntities(searchValue),
                    }}
                />
            </Box>

            <HeatmapGrid list={list} data={data} xLabels={xLabels} setList={setList} setData={setData}
                         xAxis={'End organ'} yAxis={'Connection Origin'} cellClick={handleClick}
                         selectedCell={selectedCell}/>

            <Box
                py={1.5}
                borderTop={`0.0625rem solid ${gray100}`}
                width={1}
                display='flex'
                alignItems='center'
                justifyContent='space-between'
                position='sticky'
                bottom={0}
                sx={{background: white}}
            >
                <Button variant="text" sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    lineHeight: '1.25rem',
                    color: primaryPurple600,
                    padding: 0,

                    '&:hover': {
                        background: 'transparent'
                    }
                }}>Reset grid</Button>

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '1.875rem',
                    padding: '0 0.75rem',
                    borderRadius: '0.25rem',
                    background: gray25,
                    border: `0.0625rem solid ${gray100}`,
                    gap: '0.75rem'

                }}>
                    <Typography sx={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        lineHeight: '1.125rem',
                        color: gray500
                    }}>Connections</Typography>

                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}>
                        <Typography sx={{
                            fontSize: '0.75rem',
                            fontWeight: 400,
                            lineHeight: '1.125rem',
                            color: gray400
                        }}>1</Typography>

                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                            {[1, 2, 3, 4, 5, 6].reverse().map((el: number) => <Box sx={{
                                width: '1.5rem',
                                height: '1rem',
                                background: `rgba(131, 0, 191, ${1 - (el / 6.5)})`,
                            }}/>)}
                        </Box>

                        <Typography sx={{
                            fontSize: '0.75rem',
                            fontWeight: 400,
                            lineHeight: '1.125rem',
                            color: gray400
                        }}>100+</Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default ConnectivityGrid
