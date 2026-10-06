import { Alert } from './components/ui/Alert';
import { API_BASE_URL } from './config/apiConfig';
import { TicketsPage } from './pages/TicketsPage';

export function App() {
  if (!API_BASE_URL) {
    return (
      <main style={{ padding: 24 }}>
        <Alert
          variant="error"
          message="La aplicación no tiene configurada la dirección del servidor. Define VITE_API_BASE_URL y vuelve a generar el build."
        />
      </main>
    );
  }
  return <TicketsPage />;
}
