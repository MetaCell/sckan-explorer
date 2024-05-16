import { Box, Typography } from "@mui/material"
import { PhenotypeDetail } from "../common/Types"
import { vars } from "../../theme/variables";

const { gray100 } = vars;


const PhenotypeLegend = (
	{ phenotypes }: { phenotypes: PhenotypeDetail[] }
) => {
	return (
		<Box sx={{
			position: 'sticky',
			bottom: 0,
			padding: '0 1.5rem',
			background: '#fff'
		}}>
			<Box sx={{
				borderTop: `0.0625rem solid ${gray100}`,
				padding: '0.9375rem 0',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between'
			}}>
				<Typography sx={{
					fontSize: '0.75rem',
					fontWeight: 500,
					lineHeight: '1.125rem',
					color: '#818898'
				}}>Phenotype</Typography>

				<Box sx={{
					display: 'flex',
					alignItems: 'center',
					gap: '1.5rem'
				}}>
					{phenotypes?.map((type: PhenotypeDetail) => (
						<Box sx={{
							p: '0.1875rem 0.25rem',
							display: 'flex',
							alignItems: 'center',
							gap: '0.375rem'
						}}
							key={type.label}
						>
							<Box sx={{
								width: '1.4794rem',
								height: '1rem',
								borderRadius: '0.125rem',
								background: `${type.color}`
							}} />
							<Typography sx={{
								fontSize: '0.75rem',
								fontWeight: 400,
								lineHeight: '1.125rem',
								color: '#4A4C4F'
							}}>{type.label}</Typography>
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	)

}

export default PhenotypeLegend
