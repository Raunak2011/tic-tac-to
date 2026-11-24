import ToolPlaceholder from './ToolPlaceholder.jsx';
import { getTool } from '../tools.jsx';

const BULLETS = [
  'Everyday arithmetic on a clean keypad',
  'Keyboard support for fast typing',
  'Your last answers, kept in view',
];

export default function Calculator() {
  return <ToolPlaceholder tool={getTool('calculator')} bullets={BULLETS} />;
}
