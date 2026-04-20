// Durchschnittlicher Fortschritt aller Topics eines Fachs
export function avgProgress(topics) {
  const withProgress = (topics || []).filter(t => t.progress?.[0]);
  if (!withProgress.length) return null;
  return Math.round(
    withProgress.reduce((sum, t) => sum + t.progress[0].value, 0) /
      withProgress.length
  );
}

// Farbe (CSS var) abhängig vom Fortschrittswert
export function progColor(value) {
  if (value === null || value === undefined) return 'var(--fg3)';
  if (value >= 80) return 'var(--green)';
  if (value >= 50) return 'var(--yellow)';
  return 'var(--red)';
}
