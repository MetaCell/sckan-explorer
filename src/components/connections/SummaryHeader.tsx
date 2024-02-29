import { Box, Button, Divider, Typography } from "@mui/material";
import { vars } from "../../theme/variables";

const { gray100, primary600, gray600A } = vars;

function SummaryHeader() {
    return (
      <Box sx={{
          borderBottom: `0.0625rem solid ${gray100}`,
          p: '0.625rem 0.75rem 0.625rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
      }}>
          <Typography sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              lineHeight: '1.25rem',
              color: primary600
          }}>Summary</Typography>

          <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
          }}>
              <Typography sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  lineHeight: '1.25rem',
                  color: gray600A

              }}>23 connections</Typography>

              <Divider sx={{
                  height: '2.25rem',
                  width: '0.0625rem',
                  background: gray100
              }} />

              <Button variant="contained">Download results (.csv)</Button>
          </Box>
      </Box>
    )
}

export default SummaryHeader
