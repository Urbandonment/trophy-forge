import { useState } from 'react';
import './Home.css'
import Logo from './assets/logo.png';
import Plus from './assets/plus.png';
import Level from './assets/level.png';
import Bronze from './assets/bronze-trophy.png';
import Silver from './assets/silver-trophy.png';
import Gold from './assets/gold-trophy.png';
import Platinum from './assets/platinum-trophy.png';

const PROXY_BASE_URL = 'http://localhost:5000';

function Home() {
  const [psnId, setPsnId] = useState('');
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [psnUsername, setPsnUsername] = useState('');
  const [plusStatus, setPlusStatus] = useState('');
  const [level, setLevel] = useState('');
  const [nextLevel, setNextLevel] = useState('');
  const [platinumTrophies, setPlatinumTrophies] = useState('');
  const [goldTrophies, setGoldTrophies] = useState('');
  const [silverTrophies, setSilverTrophies] = useState('');
  const [bronzeTrophies, setBronzeTrophies] = useState('');
  const [earnedTrophies, setEarnedTrophies] = useState('');
  const [lastGamePlayed, setLastGamePlayed] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  
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

    try {
      const profileResponse = await fetch(`${PROXY_BASE_URL}/api/psn-profile/${psnId}`, {
        method: 'GET',
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        setError(errorData.message);
        setLoading(false);
        return;
      }

      const profileData = await profileResponse.json();
      // accountId = profileData.accountId;
      setAvatarUrl(profileData.avatarUrl);
      setPsnUsername(profileData.onlineId);
      setPlusStatus(profileData.isPlus);
      setLevel(profileData.level);
      setNextLevel(profileData.nextLevel);
      setPlatinumTrophies(profileData.platinumTrophies);
      setGoldTrophies(profileData.goldTrophies);
      setSilverTrophies(profileData.silverTrophies);
      setBronzeTrophies(profileData.bronzeTrophies);
      setEarnedTrophies(profileData.earnedTrophies);
      setLastGamePlayed(profileData.lastGamePlayed);

      // Log the last updated time
      const now = new Date();
      const formattedTime = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      }).format(now);

      setLastUpdated(formattedTime);
      setLoading(false);
      setIsProfileVisible(true);

    } catch (err) {
      console.error(`[CLIENT] Error during profile lookup for ${psnUsername}:`, err);
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
        <a href='/'><span className='logo'><img src={Logo} alt='Site Logo' /></span></a>
        <div className='header-container'>
          <p className='welcome-message'>
            Welcome to <strong>TROPHY FORGE</strong>
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
            {isProfileVisible && (
              <div className='level-and-trophy'>
                <div className='level-and-trophy-pair'>
                  <span className='icon'>{<img src={Level} alt='Level Icon' />}</span>
                  <p className='icon-label' style={{color: '#98DB7C'}}>LEVEL</p>
                  <p className='icon-text'style={{color: '#98DB7C'}}>{level}</p>
                </div>
                <div className='level-and-trophy-pair'>
                  <span className='icon'>{<img src={Platinum} alt='Platinum Icon' />}</span>
                  <p className='icon-label' style={{color: '#64B9FC',}}>PLATINUM</p>
                  <p className='icon-text' style={{color: '#64B9FC'}}>{platinumTrophies}</p>
                </div>
                <div className='level-and-trophy-pair'>
                  <span className='icon'>{<img src={Gold} alt='Gold Icon' />}</span>
                  <p className='icon-label' style={{color: '#FFC54B'}}>GOLD</p>
                  <p className='icon-text' style={{color: '#FFC54B'}}>{goldTrophies}</p>
                </div>
                <div className='level-and-trophy-pair'>
                  <span className='icon'>{<img src={Silver} alt='Silver Icon' />}</span>
                  <p className='icon-label' style={{color: '#D4E3D8'}}>SILVER</p>
                  <p className='icon-text' style={{color: '#D4E3D8'}}>{silverTrophies}</p>
                </div>
                <div className='level-and-trophy-pair'>
                  <span className='icon'>{<img src={Bronze} alt='Bronze Icon' />}</span>
                  <p className='icon-label' style={{ color: '#F66C4C'}}>BRONZE</p>
                  <p className='icon-text' style={{color: '#F66C4C'}}>{bronzeTrophies}</p>
                </div>
                <div className='level-and-trophy-pair'>
                  <p className='icon-label' style={{ color: '#98DB7C'}}>TOTAL</p>
                  <p className='icon-text' style={{color: '#98DB7C'}}>{earnedTrophies + ' trophies'}</p>
                </div>
              </div>
            )}
            <div className='last-message'>
              {isProfileVisible && (
                <div className='last-message-label'>
                  Last game played <span className='last-message-text'>{lastGamePlayed}</span>
                </div>
              )}
              {isProfileVisible && lastUpdated && (
                <div className='last-message-label'>
                  Last updated <span className='last-message-text'>{lastUpdated}</span>
                </div>
              )}
            </div>
        </div>
        <div className='trophy-card-container'>
          {isProfileVisible && (
            <div className='trophy-card'>
              <div className='content-overlay'>
                <div className='top-row'>
                  <div className='user-container'>
                    <span className='trophy-card-avatar'>
                      {avatarUrl && <img src={avatarUrl} alt='User Avatar' />}
                    </span>
                    <div className='username-and-plus'>
                      <span className={`trophy-card-plus ${plusStatus ? 'plus-active' : ''}`}><img src={Plus} alt='Plus Icon' /></span>
                      <p className='trophy-card-username'>{psnUsername}</p>
                    </div>
                  </div>
                  <div className='level-container'>
                    <p className='trophy-card-level'>Level {level}</p>
                  </div>
                </div>
                <div className='bottom-row'></div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default Home;