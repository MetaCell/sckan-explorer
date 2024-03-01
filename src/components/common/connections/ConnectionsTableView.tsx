import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {vars} from "../../../theme/variables.ts";

const { gray50, gray25} = vars
function createData(
  Origin: string,
  Destination: string,
  Via: string,
) {
  return { Origin, Destination, Via };
}

const rows = [
  createData('Third thoracic dorsal root ganglion', 'Heart right ventricle', 'White matter of spinal cord'),
  createData('Third thoracic dorsal root ganglion', 'Heart right ventricle', 'White matter of spinal cord'),
  createData('Third thoracic dorsal root ganglion', 'Heart right ventricle', 'White matter of spinal cord'),
  createData('Third thoracic dorsal root ganglion', 'Heart right ventricle', 'White matter of spinal cord'),
  createData('Third thoracic dorsal root ganglion', 'Heart right ventricle', 'White matter of spinal cord'),
];

export default function ConnectionsTableView() {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="customized table">
        <TableHead>
          <TableRow  sx={{
            backgroundColor: gray50,
            
            '& .MuiTableCell-root': {
              fontSize: '0.75rem',
              fontWeight: 500
            }
          }}>
            <TableCell style={{ width: '33%' }}>Origin</TableCell>
            <TableCell style={{ width: '33%' }}>Destination</TableCell>
            <TableCell style={{ width: '33%' }}>Via</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.Origin} sx={{
              '&:nth-of-type(even)': {
                backgroundColor: gray25,
              },
              '&:last-child td, &:last-child th': {
                border: 0,
              },
            }}>
              <TableCell scope="row">
                {row.Origin}
              </TableCell>
              <TableCell scope="row">{row.Destination}</TableCell>
              <TableCell scope="row">{row.Via}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
