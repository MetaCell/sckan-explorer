/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Box, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import { vars } from '../theme/variables.ts';
import { Detail } from './summaryPage/Detail.tsx';
import { Section, SubSection } from './summaryPage/Section.tsx';
import { TabPanel } from './summaryPage/TabPanel.tsx';
import InfoTab from './summaryPage/InfoTab.tsx';
import Loader from './common/Loader.tsx';
import {
  SCKAN_DATABASE_SUMMARY_URL_LATEST,
  SCKAN_DATABASE_SUMMARY_URL_PREVIOUS,
  FILES,
  DATABASE_FILES,
} from '../settings.ts';

const { primaryPurple600, gray500, white } = vars;

const SummaryPage = () => {
  const [data, setData] = useState<{ [x: string]: null }>({});
  const [loaded, setLoaded] = useState(false);
  const [value, setValue] = useState(0);

  // @ts-expect-error Explanation: Handling Event properly
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    const dataToPull = {
      Latest: {
        [FILES.POPULATION]: null,
        [FILES.PHENOTYPE]: null,
        [FILES.SPECIES]: null,
        [FILES.CATEGORY]: null,
      },
      Previous: {
        [FILES.POPULATION]: null,
        [FILES.PHENOTYPE]: null,
        [FILES.SPECIES]: null,
        [FILES.CATEGORY]: null,
      },
    };

    const results = {
      [FILES.POPULATION]: null,
      [FILES.PHENOTYPE]: null,
      [FILES.SPECIES]: null,
      [FILES.CATEGORY]: null,
    };

    for (const file in FILES) {
      const request = new XMLHttpRequest();
      request.open(
        'GET',
        SCKAN_DATABASE_SUMMARY_URL_LATEST + DATABASE_FILES[file],
        false,
      );
      request.send(null);
      if (request.status === 200) {
        dataToPull.Latest[file] = JSON.parse(request.responseText);
      }
    }

    for (const file in FILES) {
      const request = new XMLHttpRequest();
      request.open(
        'GET',
        SCKAN_DATABASE_SUMMARY_URL_PREVIOUS + DATABASE_FILES[file],
        false,
      );
      request.send(null);
      if (request.status === 200) {
        dataToPull.Previous[file] = JSON.parse(request.responseText);
      }
    }

    // @ts-expect-error Explanation: Handling the data properly
    results[FILES.CATEGORY] = dataToPull.Latest[
      FILES.CATEGORY
    ].results.bindings.map((item: any) => {
      let filteredItem = null;
      if (dataToPull.Previous[FILES.CATEGORY]) {
        // @ts-expect-error Explanation: Handling the data properly
        filteredItem = dataToPull.Previous[
          FILES.CATEGORY
        ].results.bindings.filter(
          (prevItem: any) =>
            prevItem.neuron_category.value === item.neuron_category.value,
        );
      }
      if (filteredItem.length) {
        return {
          label: item?.neuron_category?.value,
          count: item?.population_count?.value,
          change:
            item.population_count.value -
            filteredItem[0].population_count.value,
        };
      } else {
        return {
          label: item.neuron_category.value,
          count: item.population_count.value,
          change: 0,
        };
      }
    });

    // @ts-expect-error Explanation: Handling the data properly
    results[FILES.PHENOTYPE] = dataToPull.Latest[
      FILES.PHENOTYPE
    ].results.bindings.map((item: any) => {
      let filteredItem = null;
      if (dataToPull.Previous[FILES.PHENOTYPE]) {
        // @ts-expect-error Explanation: Handling the data properly
        filteredItem = dataToPull.Previous[
          FILES.PHENOTYPE
        ].results.bindings.filter(
          (prevItem: any) =>
            prevItem?.phenotype?.value === item?.phenotype?.value,
        );
      }
      if (filteredItem.length) {
        return {
          label: item?.phenotype?.value.split('/').at(-1),
          count: item?.count?.value,
          change: item.count.value - filteredItem[0].count.value,
        };
      } else {
        return {
          label: item?.phenotype?.value.split('/').at(-1),
          count: item?.count?.value,
          change: 0,
        };
      }
    });

    // @ts-expect-error Explanation: Handling the data properly
    results[FILES.POPULATION] = dataToPull.Latest[
      FILES.POPULATION
    ].results.bindings.map((item: any) => {
      let filteredItem = null;
      if (dataToPull.Previous[FILES.POPULATION]) {
        // @ts-expect-error Explanation: Handling the data properly
        filteredItem = dataToPull.Previous[
          FILES.POPULATION
        ].results.bindings.filter(
          (prevItem: any) => prevItem?.model?.value === item?.model?.value,
        );
      }
      if (filteredItem.length) {
        return {
          label: item?.model?.value,
          category: item?.neuron_category?.value,
          count: item?.count?.value,
          change: item.count.value - filteredItem[0].count.value,
        };
      } else {
        return {
          label: item?.model?.value,
          category: item?.neuron_category?.value,
          count: item?.count?.value,
          change: 0,
        };
      }
    });

    // @ts-expect-error Explanation: Handling the data properly
    results[FILES.SPECIES] = dataToPull.Latest[
      FILES.SPECIES
    ].results.bindings.map((item: any) => {
      let filteredItem = null;
      if (dataToPull.Previous[FILES.SPECIES]) {
        // @ts-expect-error Explanation: Handling the data properly
        filteredItem = dataToPull.Previous[
          FILES.SPECIES
        ].results.bindings.filter(
          (prevItem: any) => prevItem?.type?.value === item?.type?.value,
        );
      }
      if (filteredItem.length) {
        return {
          label: item?.type?.value,
          category: item?.phenotype_label?.value,
          count: item?.count?.value,
          change: item.count.value - filteredItem[0].count.value,
        };
      } else {
        return {
          label: item?.type?.value,
          category: item?.phenotype_label?.value,
          count: item?.count?.value,
          change: 0,
        };
      }
    });

    setLoaded(true);
    setData(results);
  }, []);

  const getDataPerSection = (section: any) => {
    let total = 0;
    const results = section.map((item: any) => {
      total += Number(item.count);
      return (
        <Detail
          keyName={item.label}
          value={item.count}
          labels={item.label}
          index={Math.random()}
        />
      );
    });
    results.push(
      <Detail
        keyName="total"
        value={total}
        labels="Total"
        index={Math.random()}
      />,
    );
    return results;
  };

  const getSubcategories = (section: any) => {
    const categories = [
      ...new Set(
        section.map((item: any) => {
          return item?.category;
        }),
      ),
    ];
    const results = categories.map((category: any) => {
      const filteredItems = section.filter(
        (item: any) => item.category === category,
      );
      return (
        <SubSection title={category}>
          {getDataPerSection(filteredItems)}
          <Divider sx={{ borderColor: gray500 }} />
        </SubSection>
      );
    });
    return results;
  };

  const getDataByFilter = (section: any, filter: string) => {
    return section.filter((item: any) => item.label.includes(filter));
  };

  if (!loaded)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" width={1}>
        <Loader />
      </Box>
    );
  return (
    <Box width={1} className="database-summary">
      <Stack
        justifyContent="center"
        alignItems="center"
        pt="6.5rem"
        pb="6.5rem"
        width={1}
        spacing=".5rem"
      >
        <Typography
          sx={{
            color: primaryPurple600,
            fontSize: '1.875rem',
            fontWeight: 600,
            lineHeight: '2.375rem',
          }}
        >
          Database summary
        </Typography>
        <Typography variant="body1" color={gray500}>
          Last updated on May 15, 2024
        </Typography>
      </Stack>
      <Box
        sx={{
          backgroundColor: white,
          '& .tabpanel': {
            display: 'flex',
            justifyContent: 'center',
          },
        }}
      >
        <Box
          sx={{
            backgroundColor: white,
            position: 'sticky',
            top: '0',
            zIndex: 1,
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            sx={{ borderBottom: 1, borderColor: '#EDEFF2', width: 1 }}
          >
            <Tab label="Summary" />
            <Tab label="Info" />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Section title="Count of Neuron Populations by Model">
            {getSubcategories(data[FILES.POPULATION])}
            <Divider sx={{ borderColor: gray500 }} />
          </Section>
          <Section title="Count of Neuron Populations by Category">
            {getSubcategories(data[FILES.SPECIES])}
          </Section>
          <Section title="Count of Neuron Population by Locational Phenotype">
            {getDataPerSection(
              getDataByFilter(data[FILES.PHENOTYPE], 'Location'),
            )}
            <Divider sx={{ borderColor: gray500 }} />
          </Section>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <InfoTab />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default SummaryPage;
