import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductionApp from './ProductionApp';

test('renders app', () => {
  render(<ProductionApp />);
  // Basic test that the app renders without crashing
  expect(document.body).toBeInTheDocument();
});
