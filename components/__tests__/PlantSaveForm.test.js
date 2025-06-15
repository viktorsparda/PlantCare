import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlantSaveForm from '../PlantSaveForm';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('react-hot-toast');

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, priority, ...rest }) => {
    // Filtra la prop 'priority' de Next.js y pasa el resto.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={String(src)} alt={alt} {...rest} />;
  },
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

describe('PlantSaveForm', () => {
  const mockOnCancel = jest.fn();
  const mockPhoto = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Default mock for useAuth to return a logged-in user
    useAuth.mockReturnValue({
      user: {
        uid: 'test-user-id',
        getIdToken: jest.fn().mockResolvedValue('fake-token'),
      },
    });
  });

  it('renders the form with initial data', () => {
    render(
      <PlantSaveForm
        sciName="Monstera deliciosa"
        commonName="Costilla de Adán"
        photo={mockPhoto}
        onCancel={mockOnCancel}
      />
    );

    // Check title
    expect(screen.getByRole('heading', { name: /guardar planta/i })).toBeInTheDocument();

    // Check read-only fields
    expect(screen.getByDisplayValue(/monstera deliciosa/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/costilla de adán/i)).toBeInTheDocument();

    // Check editable fields
    expect(screen.getByPlaceholderText(/mi cactus de la abuela/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/frecuencia de riego/i)).toBeInTheDocument();

    // Check buttons
    expect(screen.getByRole('button', { name: /guardar planta/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    
    // Check image preview
        expect(screen.getByAltText(/foto de la planta/i)).toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    const user = userEvent.setup();
    // Mock fetch API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Planta guardada' }),
      })
    );

    render(
      <PlantSaveForm
        sciName="Monstera deliciosa"
        commonName="Costilla de Adán"
        photo={mockPhoto}
        onCancel={mockOnCancel}
      />
    );

    // Fill out the form
    await user.type(screen.getByPlaceholderText(/mi cactus de la abuela/i), 'Monsty');
    await user.type(screen.getByPlaceholderText(/ventana sur/i), 'Sala de estar');
    await user.selectOptions(screen.getByLabelText(/frecuencia de riego/i), ['semanal']);
    await user.selectOptions(screen.getByLabelText(/luz/i), ['indirecta']);
    await user.selectOptions(screen.getByLabelText(/¿maceta con drenaje\?/i), ['sí']);

    // Submit the form
    await user.click(screen.getByRole('button', { name: /guardar planta/i }));

    // Check for success toast and callback
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('¡Planta guardada con éxito!');
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  it('shows an error toast if user is not authenticated', async () => {
    const user = userEvent.setup();
    useAuth.mockReturnValue({ user: null }); // Simulate logged out user

    render(
      <PlantSaveForm
        sciName="Monstera deliciosa"
        commonName="Costilla de Adán"
        photo={mockPhoto}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: /guardar planta/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Debes iniciar sesión para guardar una planta.');
    });

    // Ensure fetch was not called and form was not cancelled
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('shows an error toast if the server returns an error', async () => {
    const user = userEvent.setup();
    // Mock fetch API to return an error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Error del servidor' }),
      })
    );

    render(
      <PlantSaveForm
        sciName="Monstera deliciosa"
        commonName="Costilla de Adán"
        photo={mockPhoto}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: /guardar planta/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al guardar: Error del servidor');
    });

    expect(mockOnCancel).not.toHaveBeenCalled();
  });
});
