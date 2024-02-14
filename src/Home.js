import React, { useState, useEffect } from 'react'; // Import useEffect along with useState
import axios from 'axios';

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [favoriteGenre, setFavoriteGenre] = useState('');
  const [mostFollowedPlaylist, setMostFollowedPlaylist] = useState(null);
  const [highestFollowerCount, setHighestFollowerCount] = useState(0);


  const retryOperation = async (operation, retries = 3, delay = 1000, multiplier = 2) => {
    try {
      return await operation();
    } catch (error) {
      if (retries <= 0) throw error;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * multiplier, multiplier);
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setIsLoggedIn(false);
        return;
      }

      const authCheckOperation = async () => {
        await axios.get('https://api.spotify.com/v1/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
      };

      try {
        await retryOperation(authCheckOperation);
        setIsLoggedIn(true);
        //fetchTopArtistsAndTracks();
      } catch (error) {
        console.error("Error checking auth status after retries:", error);
        handleLogout();
      }
    };

    checkAuthStatus();
  }, []);

  const fetchWithRetry = async (fetchFunction, retries = 3, delay = 1000, multiplier = 2) => {
    try {
      // Attempt to fetch data from the Firebase function
      return await fetchFunction();
    } catch (error) {
      if (retries === 0) throw new Error('Max retries reached');
      console.log(`Retry in ${delay}ms...`, error);
      
      // Wait for the specified delay before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Recursively call fetchWithRetry with decremented retries and increased delay
      return fetchWithRetry(fetchFunction, retries - 1, delay * multiplier, multiplier);
    }
  };
  

  const handleSpotifyLogin = (e) => {
    e.preventDefault();
    const client_id = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const redirect_uri = encodeURIComponent(process.env.REACT_APP_REDIRECT_URI);
    const scopes = encodeURIComponent('user-read-private user-read-email user-top-read playlist-read-private playlist-read-collaborative');
    const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scopes}&response_type=code&show_dialog=true`;
    window.location.href = spotifyAuthUrl;
  };



  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false); // Update state to reflect logout
    window.location.href = '/';
  };

  const fetchTopArtistsAndTracks = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.log("No access token found. User might not be logged in.");
      return;
    }

    const operation = async () => {
      const [artistsResponse, tracksResponse] = await Promise.all([
        axios.get('https://api.spotify.com/v1/me/top/artists', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }),
        axios.get('https://api.spotify.com/v1/me/top/tracks', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }),
      ]);
      return { artistsResponse, tracksResponse }; // Return both responses
    };

    try {

      const { artistsResponse, tracksResponse } = await fetchWithRetry(operation);

      console.log("Successfully fetched top tracks and artists");
      setTopArtists(artistsResponse.data.items);
      setTopTracks(tracksResponse.data.items);
      calculateFavoriteGenre(artistsResponse.data.items);
      fetchMostFollowedPlaylist();
    } catch (error) {
      console.error("Error fetching data:", error);
      handleLogout();
    }
  };

  const calculateFavoriteGenre = (artists) => {
    const genreCount = artists.reduce((count, { genres }) => {
      genres.forEach(genre => {
        count[genre] = (count[genre] || 0) + 1;
      });
      return count;
    }, {});

    const favoriteGenre = Object.keys(genreCount).reduce((a, b) => genreCount[a] > genreCount[b] ? a : b, '');
    setFavoriteGenre(favoriteGenre);
    console.log("Successfully fetched favorite genre:", favoriteGenre);
  };

  const fetchMostFollowedPlaylist = async () => {
    console.log("Starting fetchMostFollowedPlaylist...");
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.log("No access token found. User might not be logged in.");
      return;
    }
  
    let localMostFollowedPlaylist = null;
    let localHighestFollowerCount = 0;
    let url = 'https://api.spotify.com/v1/me/playlists?limit=50'; // Starting URL
  
    do {
      console.log("Fetching page: ", url);
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }); 
      console.log(`Fetched ${response.data.items.length} playlists.`);
      
      for (const playlist of response.data.items) {
        // Fetch details for each playlist to get the follower count
        const detailUrl = playlist.href; // URL to fetch playlist details
        try {
          const detailResponse = await axios.get(detailUrl, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });
          const followersCount = detailResponse.data.followers.total;
          console.log("Playlist detail fetched:", playlist.name, "with", followersCount, "followers");
  
          if (followersCount > localHighestFollowerCount) {
            localHighestFollowerCount = followersCount;
            localMostFollowedPlaylist = detailResponse.data; // Use detailed playlist data
            console.log("New most followed playlist found:", localMostFollowedPlaylist.name, "with", localHighestFollowerCount, "followers");
          }
        } catch (error) {
          console.error("Error fetching playlist detail:", playlist.name, error);
        }
      }
  
      url = response.data.next; // Prepare URL for the next page, if any
    } while (url); // Continue fetching pages until there are no more to fetch
  
    if (localMostFollowedPlaylist) {
      console.log("Most followed playlist:", localMostFollowedPlaylist.name, "with followers:", localHighestFollowerCount);
      // Here you can update your state or UI with the most followed playlist
    } else {
      console.log("User has no playlists or no followers.");
    }
  };
  

  return (
    <div className="Home">
      <header className="header">
        <h1>Elementify</h1>
        {!isLoggedIn && <button className='button' onClick={handleSpotifyLogin}>Log In With Spotify</button>}
        {isLoggedIn && (
          <>
            <p className="logged-in-text">Logged In</p>
            <button onClick={handleLogout}>Log Out</button>
            <button onClick={fetchTopArtistsAndTracks}>Refresh Data</button>
            <div>
              <h2>Top Tracks</h2>
              <ul>
                {topTracks.map(track => (
                  <li key={track.id}>{track.name} by {track.artists.map(artist => artist.name).join(", ")}</li>
                ))}
              </ul>
              <h2>Top Artists</h2>
              <ul>
                {topArtists.map(artist => (
                  <li key={artist.id}>{artist.name}</li>
                ))}
              </ul>
              <h2>Favorite Genre: </h2>
              <p>{favoriteGenre}</p>
              <h2>Most followed playlist</h2>
              <p>{mostFollowedPlaylist}</p>
              <h3>Count</h3>
              <p>{highestFollowerCount}</p>

            </div>
          </>
        )}
      </header>
    </div>
  );
}

export default Home;
