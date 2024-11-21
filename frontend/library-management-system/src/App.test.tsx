import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('increments count when button is clicked', async () => {
  render(<App />);

  const buttonElement = screen.getByRole('button', { name: /fetch data/i });

  fireEvent.click(buttonElement);

  const fetchedData = await screen.findByTestId('fetched-data');
  expect(fetchedData).toHaveTextContent('Hello World');
});
