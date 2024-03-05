import React from "react";
import { Box, Divider, Stack, Tab, Tabs, Typography } from "@mui/material";
import { vars } from "../../theme/variables.ts";

const { primarypurple600, gray500, gray700, gray600 } = vars;

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <Stack spacing='1.5rem' p='2rem' pb={0}>
    <Typography variant='h2'>{title}</Typography>
    {children}
  </Stack>
);

const Detail = ({ label, value, note }: { label: string; value: string | number; note?: string | number }) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent='space-between'
    spacing='1.5rem'
  >
    <Typography variant='h5' fontWeight={500} color={gray700}>{label}</Typography>
    <Box>
      <Typography variant='h5' fontWeight={400} width='23rem' textAlign='right' color={gray600}>{value}</Typography>
      {note && <Typography variant='body1' width='23rem' textAlign='right' color={gray500}>{note}</Typography>}
    </Box>
  </Stack>
);

const Notes = ({ text }: { text: string }) => (
  <Box>
    <Typography variant='h5' fontWeight={500} color={gray700}>Notes</Typography>
    <Typography variant='h5' fontWeight={400} color={gray600}>{text}</Typography>
  </Box>
);
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      className="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          width: '50%'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const SummaryPage = () => {
  const [value, setValue] = React.useState(0);
  
  const handleChange = (_: any, newValue: number) => {
    setValue(newValue);
  };
  
  return (
    <Box width={1} className='database-summary'>
      <Stack justifyContent='center' alignItems='center' pt='6.5rem' pb='6.5rem' width={1} spacing={'.5rem'}>
        <Typography
          sx={{
            color: primarypurple600,
            fontSize: '1.875rem',
            fontWeight: 600,
          }}
        >Database summary</Typography>
        <Typography variant='body1' color={gray500}>Last updated on September 15, 2023</Typography>
      </Stack>
      <Box sx={{
        backgroundColor: '#fff',
        '& .tabpanel': {
          display: 'flex',
          justifyContent: 'center'
        }
      }}>
        <Box sx={{
          backgroundColor: '#fff',
          position: 'sticky',
          top: '0',
          zIndex: 1,
        }}>
          <Tabs value={value} onChange={handleChange} sx={{ borderBottom: 1, borderColor: 'divider', width: 1 }}>
            <Tab label="Summary" />
            <Tab label="Info" />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Section title="SPARC Neuron Populations">
            <Detail label="Total SPARC Neuron Populations" value={174} />
            <Detail label="ApINATOMY Models" value={114} />
            <Detail label="SPARC NLP Curated" value={60} note="+21 change (since last stats)" />
            <Detail label="Common Usage Types (CUT)" value={122} />
            <Detail label="Markram 2015 Models" value={56} />
            <Detail label="Huang 2017 Models" value={56} />
            <Notes text='SPARC connectivity only includes populations from ApINATOMY and NLP curated neuron populations. Neuron types from CUT and other evidence based models (EBM) are not considered for the SPARC project.' />
            <Divider />
          </Section>
          <Section title="Locational phenotypes">
            <Detail label="Total count of locational phenotypes in SPARC Populations" value={174} />
            <Detail label="ApINATOMY Models" value={114} />
            <Detail label="SPARC NLP Curated" value={60} note="+21 change (since last stats)" />
            <Notes text='SPARC connectivity only includes populations from ApINATOMY and NLP curated neuron populations. Neuron types from CUT and other evidence based models (EBM) are not considered for the SPARC project.' />
            <Divider />
          </Section>
          <Section title="SPARC Connections">
            <Detail label="Total number of ‘A to B via Nerve C’ SPARC Connections" value={174} />
            <Detail label="ApINATOMY Models" value={114} />
            <Detail label="SPARC NLP Curated" value={60} note="+21 change (since last stats)" />
            <Notes text='SPARC connectivity only includes populations from ApINATOMY and NLP curated neuron populations. Neuron types from CUT and other evidence based models (EBM) are not considered for the SPARC project.' />
          </Section>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Stack p='2rem' spacing='3rem'>
            <Stack>
              <Typography variant='h2'>What is SCKAN database summary? </Typography>
              <Typography variant='h5' fontWeight={400} color={gray600}>SCKAN database summary is a summary of the connectivity stats in SCKAN.</Typography>
            </Stack>
            <Stack spacing='.75rem'>
              <Typography variant='h2'>SPARC Connectivity Stats </Typography>
              <Typography variant='h5' fontWeight={400} color={gray600}>The SPARC Connectivity Knowledgebase of the Automatic Nervous System (SCKAN) includes the neuronal connectivity models based on the Neuron Phenotype Ontology (NPO). NPO represents various neuron types, including Common Usage Types (CUT) and the types from Evidence-Based Models (EBM) such as ApINATOMY and SPARC’s NLP Curated models. The term "connectivity" in this context refers to the connections formed by the neuron types or populations among different anatomical regions. Each connectivity statement in NPO models the connections of a single neuron population based on a set of locational phenotypes, in the following form: </Typography>
              <Typography variant='h5' fontWeight={400} color={gray600}>X at A is connected to B via C’</Typography>
              <ul style={{
                paddingLeft: '1.5rem',
                fontSize: '1rem',
                fontWeight: 400,
                lineHeight: '1.5rem',
                color: '#6C707A'
              }}>
                <li>X represents a neuron type or population</li>
                <li>A represents the region of the soma location</li>
                <li>B represents the region(s) of the axon terminal or the axon sensory terminal</li>
                <li>C represents the axon location(s) including any nerve or nerve plexus</li>
              </ul>
              <Typography variant='h5' fontWeight={400} color={gray600}>
                So, a connectivity statement of the form ‘‘A to B via Nerve C” denotes the connection of a neuron population originating at Region A and projecting to Region(s) B via Nerve(s) C. Please note that the neuron populations modeled in SCKAN are theoretical in that they do not correspond to identified cell types. In cases where a population projects to multiple targets, we do not differentiate whether this is via axon collaterals or distinct cell types.
              </Typography>
            </Stack>
          </Stack>
          
        </TabPanel>
      </Box>
    </Box>
  );
};

export default SummaryPage;
