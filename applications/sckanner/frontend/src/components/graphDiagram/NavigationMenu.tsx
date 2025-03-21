import { Stack, Divider, Tooltip } from '@mui/material';
import FitScreenOutlinedIcon from '@mui/icons-material/FitScreenOutlined';
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
import ZoomOutOutlinedIcon from '@mui/icons-material/ZoomOutOutlined';
import IconButton from '@mui/material/IconButton';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { CameraswitchOutlined, RestartAltOutlined } from '@mui/icons-material';

const ZOOM_CHANGE = 25;

interface NavigationMenuProps {
  engine: DiagramEngine;
  toggleRankdir: () => void;
  resetGraph: () => void;
}

const NavigationMenu = (props: NavigationMenuProps) => {
  const { engine, toggleRankdir, resetGraph } = props;

  const zoomOut = () => {
    const zoomLevel = engine.getModel().getZoomLevel();
    engine.getModel().setZoomLevel(zoomLevel - ZOOM_CHANGE);
    engine.repaintCanvas();
  };

  const zoomIn = () => {
    const zoomLevel = engine.getModel().getZoomLevel();
    engine.getModel().setZoomLevel(zoomLevel + ZOOM_CHANGE);
    engine.repaintCanvas();
  };
  return engine ? (
    <Stack
      direction="row"
      spacing="1rem"
      sx={{
        p: '1.5rem .5rem',
        '& .MuiSvgIcon-root': {
          color: '#6C707A',
        },

        '& .MuiDivider-root': {
          borderColor: '#EAECF0',
          borderWidth: 0.5,
          height: '1.5rem',
        },
        '& .MuiButtonBase-root': {
          padding: 0,

          '&.Mui-disabled': {
            '& .MuiSvgIcon-root': {
              color: '#caced1',
            },
          },
        },
      }}
    >
      <Tooltip arrow title="Autoscale">
        <IconButton onClick={() => engine.zoomToFit()}>
          <FitScreenOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Divider />
      <Tooltip arrow title="Zoom in">
        <IconButton onClick={() => zoomIn()}>
          <ZoomInOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip arrow title="Zoom Out">
        <IconButton>
          <ZoomOutOutlinedIcon onClick={() => zoomOut()} />
        </IconButton>
      </Tooltip>
      <Divider />
      <Tooltip arrow title="Switch orientation">
        <IconButton onClick={toggleRankdir}>
          <CameraswitchOutlined />
        </IconButton>
      </Tooltip>
      <Tooltip arrow title="Reset to default visualisation">
        <IconButton onClick={resetGraph}>
          <RestartAltOutlined />
        </IconButton>
      </Tooltip>
    </Stack>
  ) : null;
};

export default NavigationMenu;
