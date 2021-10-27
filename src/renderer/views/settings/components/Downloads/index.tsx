import * as React from 'react';

import { Switch } from '~/renderer/components/Switch';
import { Title, Row, Control, Header, SecondaryText } from '../App/style';
import store from '../../store';
import { onSwitchChange } from '../../utils';
import { ipcRenderer } from 'electron';
import { DownloadItem } from '../DownloadItem';
import { observer } from 'mobx-react-lite';
import { NormalButton } from '../App';

const downloadssss = require('/downloads.json');
const downloads: IDownloadItem[] = Array.from(downloadssss.downloads);;

console.log(downloads);

const AskToggle = observer(() => {
  const { downloadsDialog } = store.settings;

  return (
    <Row onClick={onSwitchChange('downloadsDialog')}>
      <Title>Preguntar dónde guardar antes de descargar</Title>
      <Control>
        <Switch value={downloadsDialog} />
      </Control>
    </Row>
  );
});

const onChangeClick = () => {
  ipcRenderer.send('downloads-path-change');
};

const Location = observer(() => {
  return (
    <Row>
      <div>
        <Title>Ubicación</Title>
        <SecondaryText>{store.settings.downloadsPath}</SecondaryText>
      </div>

      <Control>
        <NormalButton onClick={onChangeClick}>Cambiar ubicación</NormalButton>
      </Control>
    </Row>
  );
});

const DDItems = observer(() => {
  return (
    <Row>
      <div>
        <Title>Descargas</Title>
      </div>

      <div>
        
      </div>
    </Row>
  );
});

export const Downloads = () => {
  return (
    <>
      <Header>Configuración de Descargas</Header>
      <Location />
      <AskToggle />

      <DDItems />

      {downloads.map((item) => (
        <DownloadItem item={item} key={item.id}></DownloadItem>
      ))}
    </>
  );
};
