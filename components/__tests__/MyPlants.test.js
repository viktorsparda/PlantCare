import { render, screen, waitFor } from '@testing-library/react';
import MyPlants from '../MyPlants';
import { useAuth } from '../../context/AuthContext';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, ...rest }) => {
    // Filtra la prop 'fill' de Next.js y pasa el resto.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={String(src)} alt={alt} {...rest} />;
  },
}));

describe('MyPlants Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      user: {
        uid: 'test-user-id',
        getIdToken: jest.fn().mockResolvedValue('fake-token'),
      },
    });
  });

  it('shows a loading spinner initially', () => {
    global.fetch = jest.fn(() => new Promise(() => {})); // Keep fetch pending
    render(<MyPlants />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays a message when no plants are found', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    render(<MyPlants />);

    await waitFor(() => {
      expect(screen.getByText(/aún no has guardado ninguna planta/i)).toBeInTheDocument();
    });
  });

    it('displays an error message when fetch fails', async () => {
    // Mock console.error to suppress expected error messages in test output
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server Error'),
      })
    );

    render(<MyPlants />);

    await waitFor(() => {
      expect(screen.getByText(/no se pudieron cargar las plantas. intenta de nuevo más tarde./i)).toBeInTheDocument();
    });

    // Restore original console.error
    consoleErrorSpy.mockRestore();
  });

  it('displays a list of plants when fetch is successful', async () => {
    const mockPlants = [
      {
        id: 1,
        personalName: 'Ficus Lyrata',
        sciName: 'Ficus lyrata',
        commonName: 'Fiddle-leaf fig',
        photoPath: 'ficus.jpg',
        watering: 'semanal',
        light: 'indirecta',
      },
      {
        id: 2,
        personalName: 'Suculenta Echeveria',
        sciName: 'Echeveria elegans',
        commonName: 'Mexican snowball',
        photoPath: 'echeveria.jpg',
        watering: 'quincenal',
        light: 'directa',
      },
    ];

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPlants),
      })
    );

    render(<MyPlants />);

    await waitFor(() => {
      // Check for plant names
      expect(screen.getByText('Ficus Lyrata')).toBeInTheDocument();
      expect(screen.getByText('Suculenta Echeveria')).toBeInTheDocument();

      // Check for scientific names
      expect(screen.getByText('Ficus lyrata')).toBeInTheDocument();

      // Check for images by alt text
      expect(screen.getByAltText('Fiddle-leaf fig')).toBeInTheDocument();
      expect(screen.getByAltText('Mexican snowball')).toBeInTheDocument();
    });
  });
});
