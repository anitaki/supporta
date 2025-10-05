// assets
import { IconBrandChrome, IconKey, IconLibrary } from '@tabler/icons-react';

// constant
const icons = {
  IconBrandChrome, IconKey, IconLibrary
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const pages = {
  id: 'pages',
  title: 'Pages',
  caption: 'Pages Caption',
  icon: icons.IconKey,
  type: 'group',
  children: [
     {
          id: 'qa-management',
          title: 'Q&A Content',
          type: 'item',
          url: '/qa',
          icon: icons.IconLibrary,
          breadcrumbs: false
        },
  ]
};

export default pages;
