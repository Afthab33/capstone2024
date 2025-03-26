import { render, screen } from '@testing-library/react';
import DoctorChat from '@/app/DoctorChat/page';
import { useRouter } from 'next/navigation';

// Mock `useRouter` hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

test('renders DoctorChat page', () => {
  // Set up the mocked router behavior
  const mockPush = jest.fn();
  // Properly mock useRouter to return the expected object structure
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
  });

  render(<DoctorChat />);

  // Check if loading text is rendered
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
