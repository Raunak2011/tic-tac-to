import ToolPlaceholder from './ToolPlaceholder.jsx';
import { getTool } from '../tools.jsx';

const BULLETS = [
  'Live preview straight from your camera',
  'One-tap shutter with instant capture',
  'Photos stay on your device, always',
];

export default function CameraApp() {
  return <ToolPlaceholder tool={getTool('camera')} bullets={BULLETS} />;
}
