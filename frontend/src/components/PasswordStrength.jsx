import React from 'react';

const requirements = [
  { label: 'At least 8 characters', test: v => v.length >= 8 },
  { label: 'One uppercase letter', test: v => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: v => /[a-z]/.test(v) },
  { label: 'One number', test: v => /[0-9]/.test(v) },
  { label: 'One special character', test: v => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/~`]/.test(v) },
];

function getStrength(password) {
  if (!password) return { score: 0, label: 'Too Short', color: '#ff006e' };
  let score = requirements.reduce((acc, r) => acc + (r.test(password) ? 1 : 0), 0);
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#ff006e', '#ff6e6e', '#ffbe0b', '#06ffa5', '#06ffa5'];
  return { score, label: labels[score], color: colors[score] };
}