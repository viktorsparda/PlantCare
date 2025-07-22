import "@/styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          // Define default options
          duration: 5000,
          style: {
            background: '#1F2937', // dark:bg-gray-800
            color: '#F9FAFB', // dark:text-gray-50
            border: '1px solid #4B5563', // dark:border-gray-600
          },
          success: {
            iconTheme: {
              primary: '#10B981', // green-500
              secondary: '#F9FAFB',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444', // red-500
              secondary: '#F9FAFB',
            },
          },
        }}
      />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
