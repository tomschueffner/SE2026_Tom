export function progressColor(value) {
  if (value === null) return 'bg-gray-300';
  if (value >= 80)    return 'bg-green-500';
  if (value >= 50)    return 'bg-yellow-500';
  return 'bg-red-500';
}

export function progressColorHex(value) {
  if (value === null) return '#d1d5db'; // gray-300
  if (value >= 80)    return '#22c55e'; // green-500
  if (value >= 50)    return '#eab308'; // yellow-500
  return '#ef4444';                     // red-500
}
