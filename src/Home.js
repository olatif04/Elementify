import { useHistory } from 'react-router-dom';
import ShowListings from './ShowListings';
function Home() {
    
    const history = useHistory();//for routing easily
    
  return (
    <div className="Home">
      <header className="header">
        <h1>Elementify</h1>
        <button className='button' onClick={goToSellPage}>Log In With Spotify</button>
      </header>

    </div>
  );
}

export default Home;