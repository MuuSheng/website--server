import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
  render(<App />);
  // 检查是否存在"My Website"标题
  const titleElement = screen.getByText(/my website/i);
  expect(titleElement).toBeInTheDocument();
});