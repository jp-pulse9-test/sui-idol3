import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PickRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home and trigger pick modal
    navigate('/', { replace: true });
    
    // Trigger pick modal after a short delay
    setTimeout(() => {
      const pickButton = document.querySelector('[data-pick-trigger]') as HTMLElement;
      if (pickButton) {
        pickButton.click();
      }
    }, 100);
  }, [navigate]);

  return null;
};

export default PickRedirect;
