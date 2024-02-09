const functions = require('firebase-functions');
const axios = require('axios');

exports.exchangeSpotifyCode = functions.https.onRequest(async (request, response) => {
  const { code } = request.body;

  try {
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'https://elementify-2378a.web.app/callback',
      client_id: 'bb8e4bc87a76404db6a9c2e420474ea1',
      client_secret: '69cf708184504f1ca76465d041592e3d',
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    response.json({
      accessToken: tokenResponse.data.access_token,
      // You can also send back the refresh token and expiration time if needed
      refreshToken: tokenResponse.data.refresh_token,
      expiresIn: tokenResponse.data.expires_in,
    });
  } catch (error) {
    console.error('Error exchanging Spotify code:', error.response || error);
    response.status(500).send('Internal Server Error');
  }
});
