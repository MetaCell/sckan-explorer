import React, {useState} from "react";
import {PortWidget} from "@projectstorm/react-diagrams";
import {Typography, Box} from "@mui/material";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import {CustomNodeModel} from "../models/CustomNodeModel.tsx";
import {DiagramEngine} from "@projectstorm/react-diagrams-core";
import {NodeTypes} from "../../../models/composer.ts";
import {ArrowDownwardIcon, DestinationIcon, OriginIcon, ViaIcon} from "../../icons";

interface DestinationNodeProps {
    model: CustomNodeModel;
    engine: DiagramEngine;
    forwardConnection: boolean;
}

export const DestinationNodeWidget: React.FC<DestinationNodeProps> = ({
                                                                          model,
                                                                          engine,
                                                                          forwardConnection,
                                                                      }) => {
    // State to toggle the color
    const [isActive, setIsActive] = useState(false);
    const [zIndex, setZIndex] = useState(0);

    // Function to toggle the state
    const toggleColor = () => {
        setIsActive(!isActive);
        setZIndex((prevZIndex) => prevZIndex + 1);
    };


    const inPort = model.getPort("in");

    return (
        <Box
            style={{
                display: "flex",
                width: "7rem",
                height: "7rem",
                padding: "0",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.25rem",
                transform: 'rotate(45deg)',
                borderRadius: "0.5rem",
                border: "0.0781rem solid #6C707A",
                background: "#f3f4f8",
                boxShadow:
                    "0rem 0.0625rem 0.125rem 0rem #1018280F,0rem 0.0625rem 0.1875rem 0rem #1018281A",
            }}
            onClick={toggleColor}
        >
            <Box position='relative' sx={{transform: 'rotate(-45deg)', height: 1, flexShrink: 0, alignItems: "center", display: "flex",}}>
                <Typography
                    sx={{
                        color: "#4A4C4F",
                        textAlign: "center",
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        lineHeight: "1.25rem",
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    {model.name}
                </Typography>
                {forwardConnection && <ArrowDownwardIcon style={{ position: 'absolute', bottom: '-0.5rem', left: '50%', transform: 'translateX(-50%)' }} />}
            </Box>
            {inPort && <PortWidget engine={engine} port={inPort}>
              <div className="circle-port"/>
            </PortWidget>}

            {isActive && (
                <Box
                    style={{
                        display: "flex",
                        padding: "0.5rem",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.25rem",
                        borderRadius: "0.75rem",
                        border: "0.0781rem solid rgba(108, 112, 122, 1)",
                        background: "rgba(246, 247, 249, 1)",
                        boxShadow: "0rem 0.125rem 0.25rem -0.125rem rgba(16, 24, 40, 0.06), 0rem 0.25rem 0.5rem -0.125rem rgba(16, 24, 40, 0.1)",
                        position: "absolute",
                        top: 0,
                        width: "18rem",
                        zIndex: isActive ? zIndex : "auto",
                        transform: 'rotate(-45deg)'
                    }}
                >
                    <Typography
                        sx={{
                            color: "rgba(108, 112, 122, 1)",
                            textAlign: 'center',
                            lineHeight: '1.125rem',
                            fontSize: "0.75rem",
                            fontWeight: 400,
                        }}
                    >
                        From
                    </Typography>
                    <Box
                        sx={{
                            borderRadius: "0.625rem",
                            border: "0.0625rem solid rgba(155, 162, 176, 1)",
                            background: "#FFF",
                            width: "100%",
                        }}
                    >
                        {model.getOptions().from?.map((item: {
                            type: string;
                            name: string
                        }, index: number) => (
                            <React.Fragment key={index}>
                                <Stack
                                    padding="0.5rem"
                                    spacing={1}
                                    direction="row"
                                    alignItems="center"
                                >
                                    {item.type === NodeTypes.Origin &&
                                      <OriginIcon fill="rgba(71, 84, 103, 1)" width={"1rem"} height={"1rem"}/>}
                                    {item.type === NodeTypes.Via &&
                                      <ViaIcon fill="rgba(71, 84, 103, 1)" width={"1rem"} height={"1rem"}/>}
                                    <Typography
                                        sx={{
                                            color: "rgba(108, 112, 122, 1)",
                                            fontSize: "0.875rem",
                                            fontWeight: 400,
                                            lineHeight: "1.25rem",
                                        }}
                                    >
                                        {item.name}
                                    </Typography>
                                </Stack>
                                {index < (model.getOptions().from?.length ?? 0) - 1 && <Divider/>}
                            </React.Fragment>
                        ))}
                    </Box>


                    <Stack
                        padding="0.75rem 0.5rem"
                        alignItems="center"
                        justifyContent="center"
                        textAlign="center"
                        spacing={2}
                    >
                        <Box
                            style={{
                                width: "1rem",
                                height: "0.125rem",
                                backgroundColor: "rgba(108, 112, 122, 1)",
                                transform: "rotate(90deg)",
                            }}
                        />
                        <DestinationIcon fill="rgba(108, 112, 122, 1)"/>
                        <Typography
                            sx={{
                                color: " rgba(74, 76, 79, 1)",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                lineHeight: "1.25rem",
                            }}
                        >
                            {model.name}
                        </Typography>
                        <Typography
                            sx={{
                                color: "rgba(108, 112, 122, 1)",
                                fontSize: "0.75rem",
                                fontWeight: 400,
                                lineHeight: "1.125rem",
                                marginTop: "0.125rem !important",
                            }}
                        >
                            {model.externalId}
                        </Typography>
                        <Chip
                            label={model.getOptions().anatomicalType}
                            variant="outlined"
                            color="secondary"
                            // sx={{
                            //     background: "#E2ECFB",
                            //     color: "#184EA2",
                            //     marginLeft: "0.625rem",
                            //     marginRight: "0.625rem",

                            //     "& .MuiChip-deleteIcon": {
                            //         fontSize: "0.875rem",
                            //         color: vars.mediumBlue,
                            //     },
                            // }}
                        />
                    </Stack>
                </Box>
            )}
        </Box>
    );
};
