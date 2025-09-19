import React from 'react';
import { Stack, Typography } from '@mui/material';
interface SectionProps {
  title: string;
  children: React.ReactNode;
  description?: string | null;
}

export const Section = ({ title, children, description }: SectionProps) => (
  <Stack spacing="1.5rem" p="2rem" pb={0}>
    <Typography variant="h2" sx={{ mb: '.5rem !important' }}>
      {title}
    </Typography>
    {description && (
      <Typography
        variant="body2"
        sx={{
          mb: '1rem !important',
          color: 'text.secondary',
          whiteSpace: 'pre-line',
        }}
      >
        {description}
      </Typography>
    )}
    {children}
  </Stack>
);

export const SubSection = ({ title, children, description }: SectionProps) => (
  <Stack spacing="1.5rem" p="2rem" pb={0}>
    <Typography variant="h2" sx={{ mb: '.5rem !important' }}>
      {title}
    </Typography>
    {description && (
      <Typography
        variant="body2"
        sx={{
          mb: '1rem !important',
          color: 'text.secondary',
          whiteSpace: 'pre-line',
        }}
      >
        {description}
      </Typography>
    )}
    {children}
  </Stack>
);
