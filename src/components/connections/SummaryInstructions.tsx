import { Box, Typography } from '@mui/material'
import React from 'react'

const SummaryInstructions = () => {
	return (
		<Box>
			<Typography
				sx={{
					textAlign: 'center',
					marginTop: '2.5rem',
				}}
			>Select a square on the connectivity grid to view details of connections.</Typography>
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
						textAlign: 'center',
					}}
				>SummaryInstructions</Typography>

			</Box>
		</Box>
	)
}

export default SummaryInstructions