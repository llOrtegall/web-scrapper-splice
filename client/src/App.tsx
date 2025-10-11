import DownloaderSample from './components/DowloaderSample';
import { useAuth } from "./context/auth/AuthContext";
import LoginForm from './components/LoginForm';

function App() {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <DownloaderSample /> : <LoginForm />
}

export default App;