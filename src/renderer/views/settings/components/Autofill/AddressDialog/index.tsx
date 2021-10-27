import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { Button } from '~/renderer/components/Button';
import store from '../../../store';
import { Textfield } from '~/renderer/components/Textfield';
import { Dropdown } from '~/renderer/components/Dropdown';
import { Row } from '../../App/style';
import { Dialog, Title, Content, Buttons, CloseButton } from '../../Dialog';

export default observer(() => {
  return (
    <Dialog
      visible={store.dialogContent === 'edit-address'}
      style={{ width: 344 }}
    >
      <Title>Editar dirección</Title>
      <Content>
        <Textfield label="Nombre" />
        <Textfield label="Calle" />
        <Row>
          <Textfield label="Código postal" style={{ marginRight: 24 }} />
          <Textfield label="Ciudad o municipio " />
        </Row>
        <Dropdown>
          <Dropdown.Item value="pl">Polonia</Dropdown.Item>
        </Dropdown>
      </Content>
      <Buttons>
        <CloseButton />
        <Button>Guardar</Button>
      </Buttons>
    </Dialog>
  );
});
