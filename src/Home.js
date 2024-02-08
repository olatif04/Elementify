import { useHistory } from 'react-router-dom';
function Home() {
    
    //const history = useHistory();//for routing easily
    
    const handleSpotifyLogin = (e) => {
        e.preventDefault();
        const client_id = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
        const redirect_uri = encodeURIComponent(process.env.REACT_APP_REDIRECT_URI);
        const scopes = encodeURIComponent('user-read-private user-read-email'); // Scopes separated by spaces
        const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scopes}&response_type=code&show_dialog=true`;
        window.location.href = spotifyAuthUrl;
    };

  return (
    <div className="Home">
      <header className="header">
        <h1>Elementify</h1>
        <button className='button' onClick={handleSpotifyLogin}>Log In With Spotify</button>
      </header>

    </div>
  );
}

export default Home;