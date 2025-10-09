// assets
import { IconBrandChrome, IconKey, IconLibrary, IconFileNeutral } from '@tabler/icons-react';

// constant
const icons = {
  IconBrandChrome, IconKey, IconLibrary, IconFileNeutral
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
          {
          id: 'file-management',
          title: 'File Content',
          type: 'item',
          url: '/file',
          icon: icons.IconFileNeutral,
          breadcrumbs: false
        },
  ]
};

export default pages;
