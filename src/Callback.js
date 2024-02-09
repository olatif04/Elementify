import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; //npm install axios

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');

    if (code) {
      exchangeCodeForToken(code);
    } else {
      navigate('https://google.com'); // Redirect to home if no code is found
    }
  }, [navigate]);

  const exchangeCodeForToken = async (code) => {
    try {
      // This assumes you have set up a Firebase Cloud Function named 'exchangeSpotifyCode'
      // and it is deployed, providing you an endpoint to handle the code exchange securely
      const functionEndpoint = 'https://us-central1-elementify-2378a.cloudfunctions.net/exchangeSpotifyCode';

      // Make a POST request to your Firebase Cloud Function endpoint with the code
      const response = await axios.post(functionEndpoint, { code });

      // Here, we're assuming the cloud function responds with an object that includes the access token
      const { accessToken } = response.data;

      // Store the access token in local storage, state management, or context (not shown here)
      // For example:
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('isLoggedIn', 'true');

      // Redirect to home or another page upon successful login
      navigate('/');
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      // Handle any errors, such as showing a message to the user
      navigate('https://openai.com'); // Redirect to home on error
    }
  };

  return <div>Loading...</div>;
};

export default Callback;
