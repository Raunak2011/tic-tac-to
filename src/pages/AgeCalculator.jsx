import ToolPlaceholder from './ToolPlaceholder.jsx';
import { getTool } from '../tools.jsx';

const BULLETS = [
  'Age in years, months, days and total weeks',
  'Countdown to the next birthday',
  'Compare two dates in a single view',
];

export default function AgeCalculator() {
  return <ToolPlaceholder tool={getTool('age-calculator')} bullets={BULLETS} />;
}
