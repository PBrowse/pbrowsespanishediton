import * as React from 'react';

import { Dropdown } from '~/renderer/components/Dropdown';
import { Switch } from '~/renderer/components/Switch';
import { Title, Row, Control, Header } from '../App/style';
import store from '../../store';
import { onSwitchChange } from '../../utils';
import { observer } from 'mobx-react-lite';
import { TopBarVariant } from '~/interfaces';

const onThemeChange = (value: string) => {
  if (value === 'auto') {
    store.settings.themeAuto = true;
  } else {
    store.settings.themeAuto = false;
    store.settings.theme = value;
  }

  store.save();
};


const ThemeVariant = observer(() => {
  const defaultValue = store.settings.theme;

  return (
    <Row>
      <Title>Variantes de temas</Title>
      <Control>
        <Dropdown
          defaultValue={store.settings.themeAuto ? 'auto' : defaultValue}
          onChange={onThemeChange}
        >
          <Dropdown.Item value="auto">Automático</Dropdown.Item>
          <Dropdown.Item value="wexond-light">Luz</Dropdown.Item>
          <Dropdown.Item value="wexond-dark">Obscuro</Dropdown.Item>
          <Dropdown.Item value="wexond-blue">Azul</Dropdown.Item>
          <Dropdown.Item value="wexond-cday">Día Colorido</Dropdown.Item>
         {/* <Dropdown.Item value="wexond-glass">Glasses</Dropdown.Item>*/}
        </Dropdown>
      </Control>
    </Row>
  );
});


const onTopBarChange = (value: TopBarVariant) => {
  store.settings.topBarVariant = value;
  store.save();
};

const TopBarVariant = observer(() => {
  return (
    <Row>
      <Title>Variante de barra de arriba</Title>
      <Control>
        <Dropdown
          defaultValue={store.settings.topBarVariant}
          onChange={onTopBarChange}
        >
          <Dropdown.Item value="default">Lleno</Dropdown.Item>
          <Dropdown.Item value="compact">Compacto</Dropdown.Item>
        </Dropdown>
      </Control>
    </Row>
  );
});

const WarnQuit = observer(() => {
  const { warnOnQuit } = store.settings;

  return (
    <Row onClick={onSwitchChange('warnOnQuit')}>
      <Title>Mostrar diálogo de advertencia al cerrar PBrowse</Title>
      <Control>
        <Switch value={warnOnQuit} />
      </Control>
    </Row>
  );
});

const MenuAnimations = observer(() => {
  const { animations } = store.settings;

  return (
    <Row onClick={onSwitchChange('animations')}>
      <Title>Animaciones del menú</Title>
      <Control>
        <Switch value={animations} />
      </Control>
    </Row>
  );
});

const BookmarksBar = observer(() => {
  const { bookmarksBar } = store.settings;

  return (
    <Row onClick={onSwitchChange('bookmarksBar')}>
      <Title>Mostrar barra de dirección</Title>
      <Control>
        <Switch value={bookmarksBar} />
      </Control>
    </Row>
  );
});

export const Appearance = observer(() => {
  return (
    <>
      <Header>Apariencia</Header>
      <MenuAnimations />
      <BookmarksBar />
      <WarnQuit />
      <ThemeVariant />
      <TopBarVariant />
    </>
  );
});
