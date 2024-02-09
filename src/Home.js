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
      try {
        const { data } = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        setTopTracks(data.items); // Set the top tracks in state
      } catch (error) {
        console.error("Error fetching top tracks:", error);
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
