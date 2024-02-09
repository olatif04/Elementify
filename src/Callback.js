import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const exchangeCodeForToken = async (code) => {
      console.log('Starting exchange code for token with code:', code); // Log the authorization code
      try {
        const functionEndpoint = 'https://us-central1-elementify-2378a.cloudfunctions.net/exchangeSpotifyCode';
        console.log('Making POST request to function endpoint:', functionEndpoint); // Log the endpoint
        const response = await axios.post(functionEndpoint, { code });
        console.log('Response from function:', response); // Log the response
        const { accessToken } = response.data;
        console.log('Received access token:', accessToken); // Log the access token
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('isLoggedIn', 'true'); // Indicate user is logged in
        console.log('User logged in, navigating to home page'); // Log navigation
        navigate('/'); // Navigate to home page after successful exchange
      } catch (error) {
        console.error('Error exchanging code for token:', error); // Log any errors
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error(error.response.data);
          console.error(error.response.status);
          console.error(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error', error.message);
        }
        navigate('/'); // Consider navigating to an error page or showing an error message
      }
    };

    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    console.log('URL search params:', searchParams.toString()); // Log the full query string
    if (code) {
      console.log('Authorization code found in URL:', code); // Log the found code
      exchangeCodeForToken(code);
    } else {
      console.log('No authorization code found in URL, navigating to home'); // Log the absence of code
      navigate('/'); // No code present, navigate home or to an error page
    }
  }, [navigate]);

  return <div>Loading...</div>;
};

export default Callback;
