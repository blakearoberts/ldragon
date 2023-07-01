import { useState } from 'react';

import {
  AppBar,
  Autocomplete,
  Avatar,
  Badge,
  Box,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { GitHub } from '@mui/icons-material';
import { ImNpm } from 'react-icons/im';

import { SpellTooltip } from 'components';
import {
  Ability,
  useCDragonChampionBin,
  useCDragonFontConfig,
  useDDragonChampion,
  useDDragonChampions,
  useDDragonVersion,
} from 'hooks';

interface Props {
  championId: string;
}

const SpellTooltips: React.FC<Props> = ({ championId }) => {
  const version = useDDragonVersion(),
    { data: championData } = useDDragonChampion(championId),
    { data: bin } = useCDragonChampionBin(championId?.toLowerCase()),
    { data: fontConfig } = useCDragonFontConfig(),
    champion = championData?.data[championId],
    abilityToString = (ability: Ability) => {
      switch (ability) {
        case Ability.Q:
          return 'Q';
        case Ability.W:
          return 'W';
        case Ability.E:
          return 'E';
        case Ability.R:
          return 'R';
        case Ability.P:
          return 'P';
      }
    };

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
        (ability) => {
          const spell = ability === Ability.P ? passive : spells[ability],
            name = ability === Ability.P ? passive.name : spells[ability].name,
            src =
              ability === Ability.P
                ? `https://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${passive.image.full}`
                : `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.image.full}`;

          return (
            <Box key={ability} sx={{ pt: 1 }}>
              <Stack
                direction='row'
                alignItems='center'
                spacing={1}
                sx={{ pb: 1 }}
              >
                <Badge
                  badgeContent={<Box>{abilityToString(ability)}</Box>}
                  sx={{
                    '& .MuiBadge-badge': {
                      width: '22px',
                      height: '22px',
                      borderRadius: '11px',
                      backgroundColor: 'background.paper',
                      border: '1px solid black',
                      borderColor: 'divider',
                    },
                  }}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                >
                  <Avatar variant='rounded' alt={name} src={src} />
                </Badge>
                <Typography variant='h6'>{name}</Typography>
              </Stack>
              <SpellTooltip
                bin={bin}
                fontConfig={fontConfig}
                championId={championId}
                ability={ability}
              />
              <Divider variant='inset' sx={{ pb: 1 }} />
            </Box>
          );
        },
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
    <>
      <AppBar>
        <Toolbar>
          <Container maxWidth='md'>
            <Stack direction='row' alignItems='center' spacing={1}>
              <Typography
                variant='h6'
                noWrap
                component='a'
                href='/ldragon'
                sx={{
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                LDragon
              </Typography>
              <Box flex={1} />
              <IconButton
                color='inherit'
                href='https://github.com/blakearoberts/ldragon'
              >
                <GitHub />
              </IconButton>
              <IconButton
                color='inherit'
                href='https://www.npmjs.com/package/@blakearoberts/ldragon'
              >
                <ImNpm />
              </IconButton>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Container maxWidth='md' sx={{ pt: 2 }}>
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
          sx={{ pb: 1 }}
        />
        <SpellTooltips championId={champion.id} />
      </Container>
    </>
  );
};
