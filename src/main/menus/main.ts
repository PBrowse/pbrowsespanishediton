import { Menu, webContents, app, BrowserWindow, MenuItem } from 'electron';
import { defaultTabOptions } from '~/constants/tabs';
import { viewSource, saveAs, printPage } from './common-actions';
import { WEBUI_BASE_URL, WEBUI_URL_SUFFIX } from '~/constants/files';
import { AppWindow } from '../windows';
import { Application } from '../application';
import { showMenuDialog } from '../dialogs/menu';
import { getWebUIURL } from '~/common/webui';

const isMac = process.platform === 'darwin';

const createMenuItem = (
  shortcuts: string[],
  action: (
    window: AppWindow,
    menuItem: MenuItem,
    shortcutIndex: number,
  ) => void,
  label: string = null,
) => {
  const result: any = shortcuts.map((shortcut, key) => ({
    accelerator: shortcut,
    visible: label != null && key === 0,
    label: label != null && key === 0 ? label : '',
    click: (menuItem: MenuItem, browserWindow: BrowserWindow) =>
      action(
        Application.instance.windows.list.find(
          (x) => x.win.id === browserWindow.id,
        ),
        menuItem,
        key,
      ),
  }));

  return result;
};

export const getMainMenu = () => {
  const template: any = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideothers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    {
      label: 'Archivo',
      submenu: [
        ...createMenuItem(
          ['CmdOrCtrl+N'],
          () => {
            Application.instance.windows.open();
          },
          'Nueva ventana',
        ),
        ...createMenuItem(
          ['CmdOrCtrl+Shift+N'],
          () => {
            Application.instance.windows.open(true);
          },
          'Nueva ventana de icógnito',
        ),
        ...createMenuItem(
          ['CmdOrCtrl+T'],
          (window) => {
            window.viewManager.create(defaultTabOptions);
          },
          'Nueva pestaña',
        ),
        ...createMenuItem(
          ['CmdOrCtrl+Shift+T'],
          (window) => {
            window.send('revert-closed-tab');
          },
          'Revertir pestaña cerrada',
        ),
        {
          type: 'separator',
        },
        ...createMenuItem(
          ['CmdOrCtrl+Shift+W'],
          (window) => {
            window.win.close();
          },
          'Cerrar ventana',
        ),
        ...createMenuItem(
          ['CmdOrCtrl+W', 'CmdOrCtrl+F4'],
          (window) => {
            window.send('remove-tab', window.viewManager.selectedId);
          },
          'Cerrar pestaña',
        ),
        {
          type: 'separator',
        },
        ...createMenuItem(
          ['CmdOrCtrl+S'],
          () => {
            saveAs();
          },
          'Guardar página web como...',
        ),
        {
          type: 'separator',
        },
        ...createMenuItem(
          ['CmdOrCtrl+P'],
          () => {
            printPage();
          },
          'Imprimir',
        ),

        // Hidden items

        // Focus address bar
        ...createMenuItem(['Ctrl+Space', 'CmdOrCtrl+L', 'Alt+D', 'F6'], () => {
          Application.instance.dialogs
            .getPersistent('search')
            .show(Application.instance.windows.current.win);
        }),

        // Toggle menu
        ...createMenuItem(['Alt+F', 'Alt+E'], () => {
          Application.instance.windows.current.send('show-menu-dialog');
        }),
      ],
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' },
              { role: 'delete' },
              { role: 'selectAll' },
              { type: 'separator' },
              {
                label: 'Reconocimiento por voz',
                submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
              },
            ]
          : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
        { type: 'separator' },
        ...createMenuItem(
          ['CmdOrCtrl+F'],
          () => {
            Application.instance.windows.current.send('find');
          },
          'Buscar en página',
        ),
      ],
    },
    {
      label: 'Ver',
      submenu: [
        ...createMenuItem(
          ['CmdOrCtrl+R', 'F5'],
          () => {
            Application.instance.windows.current.viewManager.selected.webContents.reload();
          },
          'Recargar',
        ),
        ...createMenuItem(
          ['CmdOrCtrl+Shift+R', 'Shift+F5'],
          () => {
            Application.instance.windows.current.viewManager.selected.webContents.reloadIgnoringCache();
          },
          'Recargar e ignorar caché',
        ),
      ],
    },
    {
      label: 'Historial',
      submenu: [
        // TODO: Homepage - Ctrl+Shift+H
        ...createMenuItem(
          isMac ? ['Cmd+[', 'Cmd+Left'] : ['Alt+Left'],
          () => {
            const {
              selected,
            } = Application.instance.windows.current.viewManager;
            if (selected) {
              selected.webContents.goBack();
            }
          },
          'Atrás',
        ),
        ...createMenuItem(
          isMac ? ['Cmd+]', 'Cmd+Right'] : ['Alt+Right'],
          () => {
            const {
              selected,
            } = Application.instance.windows.current.viewManager;
            if (selected) {
              selected.webContents.goForward();
            }
          },
          'Adelante',
        ),
        // { type: 'separator' }
        // TODO: list last closed tabs
        // { type: 'separator' }
        // TODO: list last visited
        { type: 'separator' },
        ...createMenuItem(
          isMac ? ['Cmd+Y'] : ['Ctrl+H'],
          () => {
            Application.instance.windows.current.viewManager.create({
              url: getWebUIURL('history'),
              active: true,
            });
          },
          'Administrar historial',
        ),
      ],
    },
    {
      label: 'Marcadores',
      submenu: [
        ...createMenuItem(
          isMac ? ['Cmd+Option+B'] : ['CmdOrCtrl+Shift+O'],
          () => {
            Application.instance.windows.current.viewManager.create({
              url: getWebUIURL('bookmarks'),
              active: true,
            });
          },
          'Administrar marcadores',
        ),
        ...createMenuItem(
          ['CmdOrCtrl+Shift+B'],
          () => {
            const { bookmarksBar } = Application.instance.settings.object;
            Application.instance.settings.updateSettings({
              bookmarksBar: !bookmarksBar,
            });
          },
          'Alternar barra de marcadores',
        ),
        ...createMenuItem(
          ['CmdOrCtrl+D'],
          () => {
            Application.instance.windows.current.webContents.send(
              'show-add-bookmark-dialog',
            );
          },
          'Añadir esta página web a marcadores',
        ),
        // { type: 'separator' }
        // TODO: list bookmarks
      ],
    },
    {
      label: 'Herramientas',
      submenu: [
        {
          label: 'Desarrolladores',
          submenu: [
            ...createMenuItem(
              ['CmdOrCtrl+U'],
              () => {
                viewSource();
              },
              'Ver fuente',
            ),
            ...createMenuItem(
              ['CmdOrCtrl+Shift+I', 'CmdOrCtrl+Shift+J', 'F12'],
              () => {
                setTimeout(() => {
                  Application.instance.windows.current.viewManager.selected.webContents.toggleDevTools();
                });
              },
              'Herramientas de desarrollador...',
            ),

            // Developer tools (current webContents) (dev)
            ...createMenuItem(['CmdOrCtrl+Shift+F12'], () => {
              setTimeout(() => {
                webContents
                  .getFocusedWebContents()
                  .openDevTools({ mode: 'detach' });
              });
            }),
          ],
        },
      ],
    },
    {
      label: 'Pestaña',
      submenu: [
        ...createMenuItem(
          isMac ? ['Cmd+Option+Right'] : ['Ctrl+Tab', 'Ctrl+PageDown'],
          () => {
            Application.instance.windows.current.webContents.send(
              'select-next-tab',
            );
          },
          'Seleccionar siguiente pestaña',
        ),
        ...createMenuItem(
          isMac ? ['Cmd+Option+Left'] : ['Ctrl+Shift+Tab', 'Ctrl+PageUp'],
          () => {
            Application.instance.windows.current.webContents.send(
              'select-previous-tab',
            );
          },
          'Seleccionar anterior pestaña',
        ),
      ],
    },
    {
      label: 'Ventana',
      submenu: [
        { role: 'minimize' },
        { role: 'togglefullscreen' },
        { role: 'zoom' },
        ...(isMac
          ? [
              { type: 'separator' },
              { role: 'front' },
              { type: 'separator' },
              { role: 'window' },
            ]
          : [{ role: 'close', accelerator: '' }]),
        { type: 'separator' },
        {
          label: 'Siempre arriba',
          type: 'checkbox',
          checked: false,
          click(menuItem: MenuItem, browserWindow: BrowserWindow) {
            browserWindow.setAlwaysOnTop(!browserWindow.isAlwaysOnTop());
            menuItem.checked = browserWindow.isAlwaysOnTop();
          },
        },
      ],
    },
  ];

  // Ctrl+1 - Ctrl+8
  template[0].submenu = template[0].submenu.concat(
    createMenuItem(
      Array.from({ length: 8 }, (v, k) => k + 1).map((i) => `CmdOrCtrl+${i}`),
      (window, menuItem, i) => {
        Application.instance.windows.current.webContents.send(
          'select-tab-index',
          i,
        );
      },
    ),
  );

  // Ctrl+9
  template[0].submenu = template[0].submenu.concat(
    createMenuItem(['CmdOrCtrl+9'], () => {
      Application.instance.windows.current.webContents.send('select-last-tab');
    }),
  );

  return Menu.buildFromTemplate(template);
};
