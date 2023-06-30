import { useState } from 'react';

import { SpellTooltip } from 'components';
import {
  Ability,
  useCDragonChampionBin,
  useCDragonFontConfig,
  useDDragonChampion,
  useDDragonChampions,
} from 'hooks';
import {
  Autocomplete,
  Box,
  CircularProgress,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

interface Props {
  championId: string;
}

const SpellTooltips: React.FC<Props> = ({ championId }) => {
  const { data: championData } = useDDragonChampion(championId),
    { data: bin } = useCDragonChampionBin(championId?.toLowerCase()),
    { data: fontConfig } = useCDragonFontConfig(),
    champion = championData?.data[championId];

  if (champion === undefined || bin === undefined || fontConfig === undefined)
    return (
      <Stack direction='row' justifyContent='center'>
        <CircularProgress />
      </Stack>
    );

  const { spells, passive } = champion;
  return (
    <>
      {[Ability.P, Ability.Q, Ability.W, Ability.E, Ability.R].map(
        (ability) => (
          <Box key={ability} sx={{ pt: 1 }}>
            <Typography variant='h6'>
              {ability === Ability.P ? passive.name : spells[ability].name}
            </Typography>
            <SpellTooltip
              bin={bin}
              fontConfig={fontConfig}
              championId={championId}
              ability={ability}
            />
          </Box>
        ),
      )}
    </>
  );
};

interface Champion {
  name: string;
  id: string;
}

export const App = () => {
  const { data: champions } = useDDragonChampions(),
    [champion, setChampion] = useState<Champion>({
      name: 'Aatrox',
      id: 'Aatrox',
    });

  if (champions === undefined)
    return (
      <Container maxWidth='md' sx={{ pt: 1 }}>
        <Stack direction='row' justifyContent='center'>
          <CircularProgress />
        </Stack>
      </Container>
    );

  const options = Object.values(champions.data).map(({ name, id }) => ({
    name,
    id,
  }));
  return (
    <Container maxWidth='md' sx={{ pt: 1 }}>
      <Autocomplete
        value={champion}
        onChange={(_, value) => {
          if (value) setChampion(value);
        }}
        disablePortal
        options={options}
        autoHighlight
        getOptionLabel={({ name }) => name}
        isOptionEqualToValue={({ id: option }, { id: value }) =>
          option === value
        }
        renderInput={(params) => <TextField {...params} label='Champion' />}
      />
      <Divider sx={{ pt: 1 }} />
      <SpellTooltips championId={champion.id} />
    </Container>
  );
};
