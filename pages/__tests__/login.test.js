import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signInWithEmailAndPassword } from 'firebase/auth';
import toast from 'react-hot-toast';
import Login from '../login';
import '@testing-library/jest-dom';

// Mocking Next.js router and Firebase
const pushMock = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '',
    query: '',
    asPath: '',
    push: pushMock,
  }),
}));

jest.mock('firebase/auth');


// Mock react-hot-toast
jest.mock('react-hot-toast');

// Mocking AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

describe('Login Page', () => {
  it('renders the login form correctly', () => {
    render(<Login />);

    // Check for the main heading
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();

    // Check for input fields
    expect(screen.getByPlaceholderText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();

    // Check for the submit button
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();

    // Check for the link to the registration page
    expect(screen.getByRole('link', { name: /Regístrate/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting with empty fields', async () => {
    const user = userEvent.setup();
    render(<Login />);

    // Simulate user clicking the submit button without filling in the form
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Use findByTestId for robust async error checking
    expect(await screen.findByTestId("email-error")).toBeInTheDocument();
    expect(await screen.findByTestId("password-error")).toBeInTheDocument();
  });

  it('redirects to dashboard on successful login with verified email', async () => {
    const user = userEvent.setup();
    pushMock.mockClear(); // Clear mock history before test

    // Mock the successful login response
    const mockUser = {
      emailVerified: true,
      reload: jest.fn().mockResolvedValue(true),
    };
    signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

    render(<Login />);

    // Fill out the form
    await user.type(screen.getByPlaceholderText(/correo electrónico/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/contraseña/i), 'password123');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Check for redirection
        await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows unverified email message on login with unverified email', async () => {
    const user = userEvent.setup();
    pushMock.mockClear();
    if (toast.error.mockClear) {
        toast.error.mockClear();
    }

    // Mock the successful login but with unverified email
    const mockUser = {
      emailVerified: false,
      reload: jest.fn().mockResolvedValue(true),
    };
    signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

    render(<Login />);

    // Fill out the form
    await user.type(screen.getByPlaceholderText(/correo electrónico/i), 'unverified@example.com');
    await user.type(screen.getByPlaceholderText(/contraseña/i), 'password123');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Check that toast.error was called and no redirection happened
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
      expect(pushMock).not.toHaveBeenCalled();
    });
  });
});
