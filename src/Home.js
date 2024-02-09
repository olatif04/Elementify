import { useHistory } from 'react-router-dom';
import axios from 'axios';
function Home() {
    
    //const history = useHistory();//for routing easily
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
      //redirect to home page
      window.location.href = '/';
    };
    const fetchUserTopTracks = async () => {
      try {
        const { data } = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        console.log(data); // Your top tracks will be logged in the console.
        // Process and use data in your app
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          console.error("Error data:", error.response.data);
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
      </header>

    </div>
  );
}

export default Home;
//TEST