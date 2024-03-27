import React, {useState} from "react";
import {PortWidget} from "@projectstorm/react-diagrams";
import {Typography, Box} from "@mui/material";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import {CustomNodeModel} from "../models/CustomNodeModel.tsx";
import {DiagramEngine} from "@projectstorm/react-diagrams-core";
import {NodeTypes} from "../../../models/composer.ts";
import {DestinationIcon, OriginIcon, ViaIcon} from "../../icons";
import {vars} from "../../../theme/variables.ts";

interface DestinationNodeProps {
    model: CustomNodeModel;
    engine: DiagramEngine;
}

export const DestinationNodeWidget: React.FC<DestinationNodeProps> = ({model, engine}) => {
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
                width: "10rem",
                height: "10rem",
                padding: "0.5rem",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.25rem",
                borderRadius: "0.75rem",
                border: "2px solid #088AB2",
                background: "#ECFDFF",
                boxShadow:
                    "0px 4px 10px -4px rgba(8, 138, 178, 0.20), 0px 0px 26px 0px #A5F0FC inset",
            }}
            onClick={toggleColor}
        >
            <Typography
                sx={{
                    color: "#088AB2",
                    textAlign: "center",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    lineHeight: "1.25rem",
                }}
            >
                {model.name}
            </Typography>
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
                        border: "2px solid #088AB2",
                        background: "#ECFDFF",
                        boxShadow: "0px 4px 10px -4px rgba(8, 138, 178, 0.20)",
                        position: "absolute",
                        top: 0,
                        width: "18rem",
                        zIndex: isActive ? zIndex : "auto",
                    }}
                >
                    <Box
                        sx={{
                            padding: "0.75rem 0.5rem",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                        }}
                    >
                        <Typography
                            sx={{
                                color: " #088AB2",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                            }}
                        >
                            From
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            borderRadius: "0.625rem",
                            border: "1px solid #EAECF0",
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
                                    padding=".5rem"
                                    spacing={1}
                                    direction="row"
                                    alignItems="center"
                                >
                                    {item.type === NodeTypes.Origin &&
                                      <OriginIcon fill="#088AB2" width={"1rem"} height={"1rem"}/>}
                                    {item.type === NodeTypes.Via &&
                                      <ViaIcon fill="#088AB2" width={"1rem"} height={"1rem"}/>}
                                    <Typography
                                        sx={{
                                            color: "#667085",
                                            fontSize: "0.875rem",
                                            fontWeight: 500,
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
                                backgroundColor: " #06AED4",
                                transform: "rotate(90deg)",
                            }}
                        />
                        <DestinationIcon fill="#088AB2"/>
                        <Typography
                            sx={{
                                color: " #088AB2",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                lineHeight: "1.25rem",
                            }}
                        >
                            {model.name}
                        </Typography>
                        <Typography
                            sx={{
                                color: " #088AB2",
                                fontSize: "0.75rem",
                                fontWeight: 400,
                                lineHeight: "1.125rem",
                                marginTop: ".25rem !important",
                            }}
                        >
                            {model.externalId}
                        </Typography>
                        <Chip
                            label={model.getOptions().anatomicalType}
                            variant="filled"
                            sx={{
                                background: "#E2ECFB",
                                color: "#184EA2",
                                marginLeft: "10px",
                                marginRight: "10px",

                                "& .MuiChip-deleteIcon": {
                                    fontSize: "14px",
                                    color: vars.primaryBlue500,
                                },
                            }}
                        />
                    </Stack>
                </Box>
            )}
        </Box>
    );
};
