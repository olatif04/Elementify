import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // You'll need to install axios if not already installed

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');

    if (code) {
      exchangeCodeForToken(code);
    } else {
      navigate('/'); // Redirect to home if no code is found
    }
  }, [navigate]);

  const exchangeCodeForToken = async (code) => {
    try {
      // Call your backend service to handle the code exchange
      const response = await axios.post('/api/exchangeCode', { code });
      const { accessToken } = response.data;

      // Here you would usually store the access token in your app's state
      // For example, using Context API, Redux, or another state management library
      // For now, let's log it to the console and navigate to the home page
      console.log('Access Token:', accessToken);
      navigate('/'); // Redirect to home after successful login
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      navigate('/'); // Redirect to home on error
    }
  };

  return <div>Loading...</div>;
};

export default Callback;
