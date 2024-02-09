import React, { useState } from 'react'; // Import useState
import axios from 'axios';

function Home() {
    const [topTracks, setTopTracks] = useState([]); // Add state to hold the top tracks

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    const handleSpotifyLogin = (e) => {
        e.preventDefault();
        const client_id = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
        const redirect_uri = encodeURIComponent(process.env.REACT_APP_REDIRECT_URI);
        const scopes = encodeURIComponent('user-read-private user-read-email user-top-read');
        const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scopes}&response_type=code&show_dialog=true`;
        window.location.href = spotifyAuthUrl;
    };
    
    const handleLogout = () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/';
    };

    const fetchUserTopTracks = async () => {
      console.log("Attempting to fetch user's top tracks...");
    
      // Ensure there's an access token before making the request
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.log("No access token found. User might not be logged in.");
        return; // Early return if there's no access token
      }
    
      try {
        console.log("Access token found, making request to Spotify API...");
        const { data } = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
    
        // Log the raw data for inspection
        console.log("Successfully fetched top tracks:", data);
    
        // Update the top tracks state only if items are present in the response
        if (data && data.items) {
          setTopTracks(data.items);
          console.log("Top tracks state updated.");
        } else {
          console.log("No items found in the response.");
        }
      } catch (error) {
        console.error("Error fetching top tracks:", error);
    
        // Additional logging based on the error type
        if (error.response) {
          // The request was made and the server responded with a status code
          console.error("Error response data:", error.response.data);
          console.error("Error status:", error.response.status);
          console.error("Error headers:", error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error("Error request:", error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Error message:", error.message);
        }
        console.error("Error config:", error.config);
      }
    };

    return (
        <div className="Home">
          <header className="header">
            <h1>Elementify</h1>
            <button className='button' onClick={handleSpotifyLogin}>Log In With Spotify</button>
            {isLoggedIn && <p className="logged-in-text">Logged In</p>}
            {isLoggedIn && <button onClick={handleLogout}>Log Out</button>}
            {isLoggedIn && <button onClick={fetchUserTopTracks}>Get info</button>}
            {/* Render the list of top tracks */}
            {isLoggedIn && topTracks.length > 0 && (
              <ul>
                {topTracks.map((track) => (
                  <li key={track.id}>{track.name} by {track.artists.map(artist => artist.name).join(", ")}</li>
                ))}
              </ul>
            )}
          </header>
        </div>
    );
}

export default Home;
