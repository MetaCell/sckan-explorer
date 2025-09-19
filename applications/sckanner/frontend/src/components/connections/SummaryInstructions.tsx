import { Box, Typography } from '@mui/material';
import React from 'react';

const SummaryInstructions = () => {
  return (
    <Box>
      <Typography
        sx={{
          textAlign: 'center',
          marginTop: '2.5rem',
        }}
      >
        Select a square on the connectivity grid to view details of connections.
      </Typography>
      <Box
        sx={{
          margin: '0 1rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '0.5rem',
          marginTop: '2.5rem',
          height: '40rem',
        }}
      >
        <Typography
          className="SummaryInstructions"
          sx={{
            fontSize: '1rem',
            textAlign: 'left',
            marginLeft: '1rem',
            paddingTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          <h4>How to use the tool</h4>
          <p style={{ fontSize: '0.875rem', fontFamily: 'Asap, sans-serif' }}>
            1. Click on a square in the connectivity grid to view details of
            connections.
          </p>
          <p style={{ fontSize: '0.875rem', fontFamily: 'Asap, sans-serif' }}>
            2. Details of the selected connection will be displayed in the right
            panel.
          </p>
          <p
            style={{
              fontSize: '0.875rem',
              fontFamily: 'Asap, sans-serif',
              marginBottom: '3rem',
            }}
          ></p>

          <h4>Filter the data</h4>
          <p style={{ fontSize: '0.875rem', fontFamily: 'Asap, sans-serif' }}>
            {' '}
            - Use the filters to narrow down the data displayed in the grid.
          </p>
          <p style={{ fontSize: '0.875rem', fontFamily: 'Asap, sans-serif' }}>
            {' '}
            - You can filter by data source, connection type, and more.
          </p>
          <p
            style={{
              fontSize: '0.875rem',
              fontFamily: 'Asap, sans-serif',
              marginBottom: '3rem',
            }}
          ></p>

          <h4>View the data</h4>
          <p style={{ fontSize: '0.875rem', fontFamily: 'Asap, sans-serif' }}>
            {' '}
            - Use the heatmap on the left and then summary heatmap to highlight
            the data of your interest
          </p>
          <p style={{ fontSize: '0.875rem', fontFamily: 'Asap, sans-serif' }}>
            {' '}
            - Once you click on a cluster in the summary map all the details
            about the connections, like{' '}
          </p>
          <p style={{ fontSize: '0.875rem', fontFamily: 'Asap, sans-serif' }}>
            {' '}
            - connection URI, species, sex, graph and triples will be displayed
            in the right panel.
          </p>
          <p
            style={{
              fontSize: '0.875rem',
              fontFamily: 'Asap, sans-serif',
              marginBottom: '3rem',
            }}
          ></p>

          <h4>Export the data</h4>
          <p style={{ fontSize: '0.875rem', fontFamily: 'Asap, sans-serif' }}>
            {' '}
            - Use the export button to download the data displayed in the grid.
          </p>
          <p style={{ fontSize: '0.875rem', fontFamily: 'Asap, sans-serif' }}>
            {' '}
            - Data can be exported in CSV format.
          </p>
          <p
            style={{
              fontSize: '0.875rem',
              fontFamily: 'Asap, sans-serif',
              marginBottom: '2rem',
            }}
          ></p>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 'auto', // Push the links to the bottom
            }}
          >
            <a
              href="https://docs.sparc.science/docs/sckanner"
              target="_blank"
              rel="noreferrer"
            >
              <p
                style={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  fontFamily: 'Asap, sans-serif',
                  marginTop: 'auto',
                  paddingBottom: '1rem',
                }}
              >
                {' '}
                Click here for additional documentation and tutorials.
              </p>
            </a>
            <a
              href="https://forms.gle/4YUjMa5Hx2KPzM8i6"
              target="_blank"
              rel="noreferrer"
            >
              <p
                style={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  fontFamily: 'Asap, sans-serif',
                  marginTop: 'auto',
                  paddingBottom: '1rem',
                  paddingRight: '1rem',
                }}
              >
                {' '}
                Provide your feedback using this form.
              </p>
            </a>
          </Box>
        </Typography>
      </Box>
    </Box>
  );
};

export default SummaryInstructions;
