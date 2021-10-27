import { AppWindow } from '../windows';
import {
  clipboard,
  nativeImage,
  Menu,
  session,
  ipcMain,
  BrowserView,
} from 'electron';
import { isURL, prefixHttp } from '~/utils';
import { saveAs, viewSource, printPage } from './common-actions';

export const getViewMenu = (
  appWindow: AppWindow,
  params: Electron.ContextMenuParams,
  webContents: Electron.WebContents,
) => {
  let menuItems: Electron.MenuItemConstructorOptions[] = [];

  if (params.linkURL !== '') {
    menuItems = menuItems.concat([
      {
        label: 'Abrir enlace en nueva pestaña',
        click: () => {
          appWindow.viewManager.create(
            {
              url: params.linkURL,
              active: false,
            },
            true,
          );
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Copiar enlace',
        click: () => {
          clipboard.clear();
          clipboard.writeText(params.linkURL);
        },
      },
      {
        type: 'separator',
      },
    ]);
  }

  if (params.hasImageContents) {
    menuItems = menuItems.concat([
      {
        label: 'Abrir imagen en nueva pestaña',
        click: () => {
          appWindow.viewManager.create(
            {
              url: params.srcURL,
              active: false,
            },
            true,
          );
        },
      },
      {
        label: 'Copiar imagen',
        click: () => webContents.copyImageAt(params.x, params.y),
      },
      {
        label: 'Copiar enlace de imagen',
        click: () => {
          clipboard.clear();
          clipboard.writeText(params.srcURL);
        },
      },
      {
        label: 'Guardar imagen como...',
        click: () => {
          appWindow.webContents.downloadURL(params.srcURL);
        },
      },
      {
        type: 'separator',
      },
    ]);
  }

  if (params.isEditable) {
    menuItems = menuItems.concat([
      {
        role: 'undo',
        accelerator: 'CmdOrCtrl+Z',
      },
      {
        role: 'redo',
        accelerator: 'CmdOrCtrl+Shift+Z',
      },
      {
        type: 'separator',
      },
      {
        role: 'cut',
        accelerator: 'CmdOrCtrl+X',
      },
      {
        role: 'copy',
        accelerator: 'CmdOrCtrl+C',
      },
      {
        role: 'pasteAndMatchStyle',
        accelerator: 'CmdOrCtrl+V',
        label: 'Paste',
      },
      {
        role: 'paste',
        accelerator: 'CmdOrCtrl+Shift+V',
        label: 'Paste as plain text',
      },
      {
        role: 'selectAll',
        accelerator: 'CmdOrCtrl+A',
      },
      {
        type: 'separator',
      },
    ]);
  }

  if (!params.isEditable && params.selectionText !== '') {
    menuItems = menuItems.concat([
      {
        role: 'copy',
        accelerator: 'CmdOrCtrl+C',
      },
      {
        type: 'separator',
      },
    ]);
  }

  if (params.selectionText !== '') {
    const trimmedText = params.selectionText.trim();

    if (isURL(trimmedText)) {
      menuItems = menuItems.concat([
        {
          label: 'Ir a ' + trimmedText,
          click: () => {
            appWindow.viewManager.create(
              {
                url: prefixHttp(trimmedText),
                active: true,
              },
              true,
            );
          },
        },
        {
          type: 'separator',
        },
      ]);
    }
  }

  if (
    !params.hasImageContents &&
    params.linkURL === '' &&
    params.selectionText === '' &&
    !params.isEditable
  ) {
    menuItems = menuItems.concat([
      {
        label: 'Ir atrás',
        accelerator: 'Alt+Left',
        enabled: webContents.canGoBack(),
        click: () => {
          webContents.goBack();
        },
      },
      {
        label: 'Ir adelante',
        accelerator: 'Alt+Right',
        enabled: webContents.canGoForward(),
        click: () => {
          webContents.goForward();
        },
      },
      {
        label: 'Recargar',
        accelerator: 'CmdOrCtrl+R',
        click: () => {
          webContents.reload();
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Guardar como...',
        accelerator: 'CmdOrCtrl+S',
        click: async () => {
          saveAs();
        },
      },
      {
        label: 'Imprimir',
        accelerator: 'CmdOrCtrl+P',
        click: async () => {
          printPage();
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Ver fuente de página',
        accelerator: 'CmdOrCtrl+U',
        click: () => {
          viewSource();
        },
      },
    ]);
  }

  menuItems.push({
    label: 'Inspeccionar',
    accelerator: 'CmdOrCtrl+Shift+I',
    click: () => {
      webContents.inspectElement(params.x, params.y);

      if (webContents.isDevToolsOpened()) {
        webContents.devToolsWebContents.focus();
      }
    },
  });

  return Menu.buildFromTemplate(menuItems);
};
