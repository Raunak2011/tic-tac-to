import { Cake, Calculator, Camera, Gamepad2 } from 'lucide-react';

// Central list of everything on the homepage. Add a tool here and it shows up
// as a shortcut on the home grid — the page itself lives in src/pages.
export const TOOLS = [
  {
    id: 'age-calculator',
    path: '/age-calculator',
    name: 'Age Calculator',
    tagline: '',
    tag: 'UTILITY',
    status: 'soon',
    accent: '#ffc05a',
    soft: 'rgba(255,192,90,.12)',
    icon: Cake,
  },
  {
    id: 'calculator',
    path: '/calculator',
    name: 'Calculator',
    tagline: '',
    tag: 'UTILITY',
    status: 'soon',
    accent: '#4fe3d8',
    soft: 'rgba(79,227,216,.12)',
    icon: Calculator,
  },
  {
    id: 'tic-tac-toe',
    path: '/tic-tac-toe',
    name: 'Tic Tac Toe',
    tagline: '',
    tag: 'GAME',
    status: 'live',
    accent: '#ff4d74',
    soft: 'rgba(255,77,116,.14)',
    icon: Gamepad2,
  },
  {
    id: 'camera',
    path: '/camera',
    name: 'Camera',
    tagline: '',
    tag: 'CAPTURE',
    status: 'soon',
    accent: '#a79bff',
    soft: 'rgba(167,155,255,.14)',
    icon: Camera,
  },
];

export const getTool = (id) => TOOLS.find((tool) => tool.id === id);
