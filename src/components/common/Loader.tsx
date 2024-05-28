import { Box, CircularProgress } from "@mui/material";
import React from 'react'

const Loader = () => {
	return (
		<Box display="flex" justifyContent="center" alignItems="center" height="100vh" width="100vw">
			<CircularProgress />
		</Box>
	)
}

export default Loader