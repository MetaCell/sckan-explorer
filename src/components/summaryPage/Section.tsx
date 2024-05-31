import React from 'react';
import { Stack, Typography } from '@mui/material';
interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export const Section = ({ title, children }: SectionProps) => (
  <Stack spacing="1.5rem" p="2rem" pb={0}>
    <Typography variant="h2" sx={{ mb: '.5rem !important' }}>
      {title}
    </Typography>
    {children}
  </Stack>
);
