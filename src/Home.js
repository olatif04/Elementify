import React, { useState, useEffect } from 'react'; // Import useEffect along with useState
import axios from 'axios';

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [topTracks, setTopTracks] = useState([]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setIsLoggedIn(false);
        return;
      }

      try {
        await axios.get('https://api.spotify.com/v1/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error checking auth status:", error);
        handleLogout();
      }
    };

    checkAuthStatus();
  }, []);

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
    setIsLoggedIn(false); // Update state to reflect logout
    window.location.href = '/';
  };

  const fetchUserTopTracks = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.log("No access token found. User might not be logged in.");
      return;
    }

    try {
      const userInfoResponse = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      console.log(`User info fetched: Email - ${userInfoResponse.data.email}`);

      const topTracksResponse = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      setTopTracks(topTracksResponse.data.items);
      console.log("Successfully fetched top tracks:", topTracksResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      handleLogout();
    }
  };

  return (
    <div className="Home">
      <header className="header">
        <h1>Elementify</h1>
        {!isLoggedIn && <button className='button' onClick={handleSpotifyLogin}>Log In With Spotify</button>}
        {isLoggedIn && <>
          <p className="logged-in-text">Logged In</p>
          <button onClick={handleLogout}>Log Out</button>
          <button onClick={fetchUserTopTracks}>Get Top Tracks</button>
        </>}
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
