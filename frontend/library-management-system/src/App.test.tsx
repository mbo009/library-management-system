import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('Fetch data', async () => {
  render(<App />);

  const buttonElement = screen.getByRole('button', { name: 'fetch data' });

  fireEvent.click(buttonElement);

  const fetchedData = await screen.findByTestId('fetched-data');
  expect(fetchedData.textContent).toContain('Hello World');
});
