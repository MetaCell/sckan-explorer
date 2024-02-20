import * as React from "react";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import {Link, Divider, Box} from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface BreadcrumbItem {
  label: string;
  link?: string;
}

interface BreadcrumbProps {
  breadcrumbs?: BreadcrumbItem[];
}
export const BasicBreadcrumbs = ({breadcrumbs}: BreadcrumbProps) => {
  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
  };
  return (
    <Box role="presentation" onClick={handleClick}>
      <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNextIcon fontSize="small" />}>
        {breadcrumbs?.map((item, index) =>
          index < breadcrumbs.length - 1 ? (
            <Link key={index} href={item.link || "#"}>
              {item.label}
            </Link>
          ) : (
            <Typography key={index} color="text.primary">
              {item.label}
            </Typography>
          )
        )}
      </Breadcrumbs>
      <Divider sx={{marginTop: '1.2rem', marginBottom: '7.375rem'}}/>
    </Box>
  );
};