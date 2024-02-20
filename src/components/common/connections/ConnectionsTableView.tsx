import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

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
            backgroundColor: '#F7F7F8',
          }}>
            <TableCell>Origin</TableCell>
            <TableCell>Destination</TableCell>
            <TableCell>Via</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.Origin} sx={{
              '&:nth-of-type(even)': {
                backgroundColor: '#FCFCFD',
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
