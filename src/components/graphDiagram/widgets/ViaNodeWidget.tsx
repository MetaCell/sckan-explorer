import React, {useState} from "react";
import {PortWidget} from "@projectstorm/react-diagrams";
import {Typography, Box} from "@mui/material";
import Stack from "@mui/material/Stack";
import {DestinationIcon, OriginIcon, ViaIcon} from "../../icons";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import {CustomNodeModel} from "../models/CustomNodeModel.tsx";
import {DiagramEngine} from "@projectstorm/react-diagrams-core";
import {NodeTypes} from "../../../models/composer.ts";

interface ViaNodeProps {
    model: CustomNodeModel;
    engine: DiagramEngine;
}

export const VerticalDivider = () => <Box
  style={{
    width: "0.0625rem",
    height: "1rem",
    backgroundColor: " #6C707A",
  }}
/>

export const ViaNodeWidget: React.FC<ViaNodeProps> = ({model, engine}) => {
    // State to toggle the color
    const [isActive, setIsActive] = useState(false);
    const [zIndex, setZIndex] = useState(0);
    // Function to toggle the state
    const toggleColor = () => {
        setIsActive(!isActive);
        setZIndex((prevZIndex) => prevZIndex + 1);
    };

    const outPort = model.getPort("out");
    const inPort = model.getPort("in");


    return (
        <Box
            style={{
                display: "flex",
                width: "6.25rem",
                height: "6.25rem",
                padding: "1.25rem 0.75rem",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.15669rem",
                borderRadius: "0.5rem",
                border: "1.25px solid #6C707A",
                background: "rgba(246, 247, 249)",
                boxShadow:
                    "0px 1px 3px 0px rgba(16, 24, 40, 0.10), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)",
            }}
            onClick={toggleColor}
        >
            <Typography
                sx={{
                    color: "#4A4C4F",
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
            {outPort && <PortWidget engine={engine} port={outPort}>
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
                        border: "1.25px solid #6C707A",
                        background: "#F6F7F9",
                        boxShadow: "0px 4px 8px -2px rgba(16, 24, 40, 0.10), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)",
                        position: "absolute",
                        top: 0,
                        width: "18rem",
                        zIndex: isActive ? zIndex : "auto",
                        maxHeight: "36rem",
                    }}
                >
                  <Typography
                    sx={{
                      color: " #6C707A",
                      fontSize: "0.75rem",
                      fontWeight: 400,
                      lineHeight: "1.125rem"
                    }}
                  >
                    From
                  </Typography>
                    <Box
                        sx={{
                            borderRadius: "0.625rem",
                            border: "1px solid #9BA2B0",
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
                                  borderTop={index !== 0 ? '1px solid #9BA2B0' : 0}
                                >
                                  {item.type === NodeTypes.Origin &&
                                      <OriginIcon fill="#6C707A" width={"1rem"} height={"1rem"}/>}
                                  {item.type === NodeTypes.Via &&
                                      <ViaIcon fill="#6C707A" width={"1rem"} height={"1rem"}/>}
                                  <Typography
                                    sx={{
                                      color: "#6C707A",
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
                    <VerticalDivider />
                    <Stack
                        padding="0.75rem 0.5rem"
                        alignItems="center"
                        justifyContent="center"
                        textAlign="center"
                        spacing="0.25rem"
                    >
                        <ViaIcon fill="#6C707A" />
                        <Typography
                            sx={{
                                color: " #4A4C4F",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                lineHeight: "1.25rem",
                            }}
                        >
                            {model.name}
                        </Typography>
                        <Typography
                            sx={{
                                color: " #6C707A",
                                fontSize: "0.75rem",
                                fontWeight: 400,
                                lineHeight: "1.125rem",
                                marginTop: ".12rem !important",
                            }}
                        >
                            {model.externalId}
                        </Typography>
                        <Chip
                            label={model.getOptions().anatomicalType}
                            variant="filled"
                            sx={{
                                background: "#F2F2FC",
                                border: "1px solid #C0C0F2",
                                color: "#24245B",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                padding: '0.125rem 0.5rem',
                                marginTop: ".75rem !important",
                            }}
                        />
                    </Stack>
                    <VerticalDivider />
                  <Typography
                    sx={{
                      color: " #6C707A",
                      fontSize: "0.75rem",
                      fontWeight: 400,
                      lineHeight: "1.125rem",
                    }}
                  >
                    To
                  </Typography>
                    <Box
                        sx={{
                            borderRadius: "0.625rem",
                            border: "1px solid #9BA2B0",
                            background: "#FFF",
                            width: "100%",
                        }}
                    >
                        {model.getOptions().to?.map((item: { type: string; name: string }, index: number) => (
                            <React.Fragment key={index}>
                                {index > 0 && <Divider/>}
                                <Stack padding=".5rem" spacing={1} direction="row" alignItems="center" borderTop={index !== 0 ? '1px solid #9BA2B0' : 0}>
                                    {item.type === NodeTypes.Via &&
                                      <ViaIcon fill="#6C707A" width={"1rem"} height={"1rem"}/>}
                                    {item.type === NodeTypes.Destination &&
                                      <DestinationIcon fill="#6C707A" width={"1rem"} height={"1rem"}/>}
                                    <Typography sx={{
                                        color: "#6C707A",
                                        fontSize: "0.875rem",
                                        fontWeight: 400,
                                        lineHeight: "1.25rem"
                                    }}>
                                        {item.name}
                                    </Typography>
                                </Stack>
                            </React.Fragment>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
};
