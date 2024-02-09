const functions = require("firebase-functions");
const axios = require("axios");
const cors = require('cors')({ origin: true });

exports.exchangeSpotifyCode = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
  const {code} = request.body;
  const spotifyConfig = functions.config().spotify;

  // Breaking long lines to adhere to max-len
  try {
    const tokenResponse = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: spotifyConfig.redirect_uri,
          client_id: spotifyConfig.client_id,
          client_secret: spotifyConfig.client_secret,
        }), {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
    );

    // Removed extra spaces to adhere to object-curly-spacing
    response.json({
      accessToken: tokenResponse.data.access_token,
      refreshToken: tokenResponse.data.refresh_token,
      expiresIn: tokenResponse.data.expires_in,
    });
  } catch (error) {
    console.error("Error exchanging Spotify code:", error.response || error);
    response.status(500).send("Internal Server Error");
  }
});
});
