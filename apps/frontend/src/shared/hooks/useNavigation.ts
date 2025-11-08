import { useNavigate } from 'react-router-dom';

export const useAppNavigation = () => {
  const navigate = useNavigate();

  return {
    goToDashboard: () => navigate('/dashboard'),
    goToModule: (id: string) => navigate(`/module/${id}`),
    goToProfile: () => navigate('/profile'),
    goToLogin: () => navigate('/login'),
    goToRegister: () => navigate('/register'),
    goBack: () => navigate(-1),
  };
};
