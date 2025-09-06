import { useState } from 'react';
import './App.css'
import Logo from './assets/logo.png';

const PROXY_BASE_URL = 'http://localhost:5000';

function App() {
  const [psnId, setPsnId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [psnUsername, setPsnUsername] = useState('');
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

    let accountId = '';

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
      accountId = profileData.accountId;
      console.log(`[CLIENT] Found account ID for username '${psnId}': ${accountId}`);
      setAvatarUrl(profileData.avatarUrl);
      console.log(`[CLIENT] Found avatar URL for username '${psnId}': ${profileData.avatarUrl}`);
      setPsnUsername(profileData.onlineId);
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
        <span className='logo'><img src={Logo} alt='logo' /></span>
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
            <div className='avatar'>
              {avatarUrl && <img src={avatarUrl} alt='User Avatar' />}
            </div>
            <div className='username'>
              {psnUsername && <p>{psnUsername.toUpperCase()}</p>}
            </div>
        </div>
        <div className='trophy-card-container'>
        </div>
      </div>

    </div>
  );
}

export default App;