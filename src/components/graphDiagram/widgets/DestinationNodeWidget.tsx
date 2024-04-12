import React, {useState} from "react";
import {PortWidget} from "@projectstorm/react-diagrams";
import {Typography, Box} from "@mui/material";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import {CustomNodeModel} from "../models/CustomNodeModel.tsx";
import {DiagramEngine} from "@projectstorm/react-diagrams-core";
import {NodeTypes} from "../../../models/composer.ts";
import {ArrowDownwardIcon, ArrowOutward, DestinationIcon, OriginIcon, ViaIcon} from "../../icons";

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
            {inPort && <PortWidget className="inPortDestination" engine={engine} port={inPort}>
              <div className="inPortDestination"/>
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
                        top: '-3vw',
                        left: '-2vw',
                        width: "18rem",
                        zIndex: isActive ? zIndex : "auto",
                        transform: 'rotate(-45deg)',
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
                                    borderTop={index === 0 ? 'none' : "0.0625rem solid rgba(155, 162, 176, 1)"}
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
                            </React.Fragment>
                        ))}
                    </Box>


                    <Stack
                        padding="0 0.5rem"
                        alignItems="center"
                        justifyContent="center"
                        textAlign="center"
                        spacing={0}
                    >
                        <Box
                            style={{
                                width: "0.0625rem",
                                height: "1rem",
                                marginBottom: '1rem',
                                backgroundColor: "#6C707A",
                            }}
                        />
                        <DestinationIcon fill="rgba(108, 112, 122, 1)"/>
                        <Typography
                            sx={{
                                color: " rgba(74, 76, 79, 1)",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                lineHeight: "1.25rem",
                                marginTop: '0.25rem'
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
                                marginTop: "0.125rem",
                            }}
                        >
                            {model.externalId}
                        </Typography>
                        <Chip
                            label={model.getOptions().anatomicalType}
                            variant="outlined"
                            color="secondary"
                            sx={{
                                marginTop: "0.75rem",
                            }}
                        />
                    </Stack>

                    <Box width={1} mt={2}>
                        {!forwardConnection && <ArrowDownwardIcon style={{ display: 'block', margin: '0 auto 0.25rem' }} />}
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
                                        borderTop={index === 0 ? 'none' : "0.0625rem solid rgba(155, 162, 176, 1)"}
                                    >
                                        <Typography
                                            sx={{
                                                color: "rgba(108, 112, 122, 1)",
                                                fontSize: "0.875rem",
                                                fontWeight: 400,
                                                lineHeight: "1.25rem",
                                                flex: 1
                                            }}
                                        >
                                            {item.name}
                                        </Typography>
                                        <ArrowOutward />
                                    </Stack>
                                </React.Fragment>
                            ))}
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    );
};
