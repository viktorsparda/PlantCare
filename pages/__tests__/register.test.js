import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import toast from 'react-hot-toast';
import Register from '../register';
import '@testing-library/jest-dom';

// Mocking Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/register',
    pathname: '',
    query: '',
    asPath: '',
    push: jest.fn(),
  }),
}));

// Mocking AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

// Mocking Firebase auth and its functions
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
  getAuth: jest.fn(),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast');


describe('Register Page', () => {
  it('renders the registration form correctly', () => {
    render(<Register />);

    // Check for the main heading
    expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument();

    // Check for input fields
    expect(screen.getByPlaceholderText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();

    // Check for the submit button
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();

    // Check for the link to the login page
    expect(screen.getByRole('link', { name: /inicia sesión/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting with empty fields', async () => {
    const user = userEvent.setup();
    render(<Register />);

    // Simulate user clicking the submit button without filling in the form
    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    // Use findByTestId for robust async error checking
    expect(await screen.findByTestId("email-error")).toBeInTheDocument();
    expect(await screen.findByTestId("password-error")).toBeInTheDocument();
  });

  it('shows success toast on successful registration', async () => {
    const user = userEvent.setup();

    // Mock the successful registration response
    const mockUser = { uid: 'test-uid', email: 'test@example.com' };
    createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    sendEmailVerification.mockResolvedValue(undefined);

    render(<Register />);

    // Fill out the form correctly
    await user.type(screen.getByPlaceholderText(/correo electrónico/i), 'newuser@example.com');
    await user.type(screen.getByPlaceholderText(/contraseña/i), 'Password123!');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    // Check that the success toast is shown
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });

    // Check that the form is cleared
    expect(screen.getByPlaceholderText(/correo electrónico/i)).toHaveValue('');
    expect(screen.getByPlaceholderText(/contraseña/i)).toHaveValue('');
  });
});

