import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import App from "./App";
import { vi } from "vitest";

beforeEach(() => {
  // Mock fetch
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("Fetch data", async () => {
  // Define the mock response
  const mockResponse = { message: "Hello World" };

  // Mock fetch implementation
  (fetch as vi.Mock).mockResolvedValueOnce({
    json: async () => mockResponse,
  });

  // Render the component
  render(<App />);

  // Click the button
  const buttonElement = screen.getByRole("button", { name: "fetch data" });
  fireEvent.click(buttonElement);

  // Wait for the fetched data to appear
  const fetchedData = await screen.findByTestId("fetched-data");
  expect(fetchedData.textContent).toContain("Hello World");
});
