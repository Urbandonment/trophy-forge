import { useState } from 'react';
import './App.css'
import Logo from './assets/logo.png';
import Plus from './assets/plus.png';
import Level from './assets/level.png';
import Bronze from './assets/bronze-trophy.png';
import Silver from './assets/silver-trophy.png';
import Gold from './assets/gold-trophy.png';
import Platinum from './assets/platinum-trophy.png';

const PROXY_BASE_URL = 'http://localhost:5000';

function App() {
  const [psnId, setPsnId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [psnUsername, setPsnUsername] = useState('');
  const [plusStatus, setPlusStatus] = useState('');
  const [level, setLevel] = useState('');
  const [platinumTrophies, setPlatinumTrophies] = useState('');
  const [goldTrophies, setGoldTrophies] = useState('');
  const [silverTrophies, setSilverTrophies] = useState('');
  const [bronzeTrophies, setBronzeTrophies] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleInputChange = (event) => {
    setPsnId(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleUpdateClick();
    }
  };

  const handleUpdateClick = async () => {
    setLoading(true);
    setError('');

    if (!psnId) {
      setError('Please enter a PSN username');
      setLoading(false);
      return;
    }

    // let accountId = '';

    try {
      const profileResponse = await fetch(`${PROXY_BASE_URL}/api/psn-profile/${psnId}`, {
        method: 'GET',
      });
      console.log('RESPONSE CODE: ' + profileResponse.status);

      if (!profileResponse.ok) {
        setError(`Unable to find a PSN profile for: ${psnId}`);
        setLoading(false);
        return;
      }

      const profileData = await profileResponse.json();
      // accountId = profileData.accountId;
      setAvatarUrl(profileData.avatarUrl);
      setPsnUsername(profileData.onlineId);
      setPlusStatus(profileData.isPlus);
      setLoading(false);

    } catch (err) {
      console.error('[CLIENT] Error during profile lookup via proxy:', err);
      if (err instanceof TypeError && err.message.includes('NetworkError')) {
        console.log('[CLIENT] The proxy server is not running');
        setError('The site is experiencing technical issues. Please try again later.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
      setLoading(false);
    }
  };

  return (
    <div className='page'>

      <div className='header'>
        <span className='logo'><img src={Logo} alt='Site Logo' /></span>
        <div className='header-container'>
          <p className='welcome-message'>
            Welcome to Custom Trophy Card
            <br />
            Here you can generate your own custom trophy card using different templates
          </p>
          <div className='fetch-trophy-container'>
              <input
                type='text'
                className='input-psn-id'
                placeholder='Enter a PSN username'
                value={psnId}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleUpdateClick}
                className='button-update'
              >
                Update
              </button>
              <div className='message-container'>
                {loading && <p className='loading-text'>Loading...</p>}
                {error && <p className='error-text'>{error}</p>}
              </div>
            </div>
          </div>
      </div>

      <div className='content'>
        <div className='profile-container'>
            <span className='avatar'>
              {avatarUrl && <img src={avatarUrl} alt='User Avatar' />}
            </span>
            <div className='username-and-plus'>
              <span className={`plus ${plusStatus ? 'plus-active' : ''}`}><img src={Plus} alt='Plus Icon' /></span>
              <p className='username'>{psnUsername.toUpperCase()}</p>
            </div>
        </div>
        <div className='trophy-card-container'>
        </div>
      </div>

    </div>
  );
}

export default App;