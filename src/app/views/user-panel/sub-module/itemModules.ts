export const moduleItems = [
  {
    name    : 'Employees',
    url     : '/home?module=Employees&moduleid=2&lvl=1',
    icon    : 'icon-puzzle',
    children: [
      {
        name: 'Submodule 1',
        url : '/home?module=Submodule 1&moduleid=3&lvl=2',
        icon: 'icon-puzzle'
      },
      {
        name: 'Submodule 2',
        url : '/home?module=Submodule 2&moduleid=4&lvl=2',
        icon: 'icon-puzzle'
      }
    ]
  },
  {
    name    : 'Module Two',
    url     : '/home?module=Employees&moduleid=2&lvl=1',
    icon    : 'icon-puzzle',
    children: [
      {
        name: 'Submodule 1',
        url : '/home?module=Submodule 1&moduleid=3&lvl=2',
        icon: 'icon-puzzle'
      },
      {
        name: 'Submodule 2',
        url : '/home?module=Submodule 2&moduleid=4&lvl=2',
        icon: 'icon-puzzle'
      }
    ]
  }
];
