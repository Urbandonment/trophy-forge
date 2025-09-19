import { useState, useRef, useEffect } from 'react';
import './Home.css'
import Logo from './assets/logo.png';
import CtrlKey from './assets/ctrl-key.png';
import KKey from './assets/k-key.png';
import Plus from './assets/plus.png';
import Level from './assets/level.png';
import Bronze from './assets/bronze-trophy.png';
import Silver from './assets/silver-trophy.png';
import Gold from './assets/gold-trophy.png';
import Platinum from './assets/platinum-trophy.png';
import EarnedTrophies from './assets/earned-trophies.png';
import Level99 from './assets/1-99.png';
import Level199 from './assets/100-199.png';
import Level299 from './assets/200-299.png';
import Level399 from './assets/300-399.png';
import Level499 from './assets/400-499.png';
import Level599 from './assets/500-599.png';
import Level699 from './assets/600-699.png';
import Level799 from './assets/700-799.png';
import Level899 from './assets/800-899.png';
import Level998 from './assets/900-998.png';
import Level999 from './assets/999.png';
import BronzeTC from './assets/trophy-card-bronze-trophy.png';
import SilverTC from './assets/trophy-card-silver-trophy.png';
import GoldTC from './assets/trophy-card-gold-trophy.png';
import PlatinumTC from './assets/trophy-card-platinum-trophy.png';
import defaultBackgroundImage from './assets/trophy-card-background.jpg';

const PROXY_BASE_URL = 'http://localhost:5000';

function getLevelIcon(level) {
  if (level >=1 && level <= 99) {
    return Level99;
  }
  if (level >=100 && level <= 199) {
    return Level199;
  }
  if (level >=200 && level <= 299) {
    return Level299;
  }
  if (level >=300 && level <= 399) {
    return Level399;
  }
  if (level >=400 && level <= 499) {
    return Level499;
  }
  if (level >=500 && level <= 599) {
    return Level599;
  }
  if (level >=600 && level <= 699) {
    return Level699;
  }
  if (level >=700 && level <= 799) {
    return Level799;
  }
  if (level >=800 && level <= 899) {
    return Level899;
  }
  if (level >=900 && level <= 998) {
    return Level998;
  }
  else {
    return Level999;
  }
}

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
  const [lastGamePlayedImageUrl, setLastGamePlayedImageUrl] = useState('');
  const [lastGamePlayedLogosUrl, setLastGamePlayedLogosUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  
  const handleInputChange = (event) => {
    setPsnId(event.target.value);
  };

  // Ctrl + K key down handling
  const inputRef = useRef(null);
  useEffect(() => {
    const handleCtrlKKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'k') {
        // Prevent the browser's default behavior (e.g., focusing on the address bar)
        event.preventDefault();
        // Focus the input field if the ref exists
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };
    // Add the event listener to the window
    window.addEventListener('keydown', handleCtrlKKeyDown, true);
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleCtrlKKeyDown, true);
    };
  }, []);

  // Enter key down handling
  const handleEnterKeyDown = (event) => {
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
      setLastGamePlayedImageUrl(profileData.lastGamePlayedImageUrl);
      setLastGamePlayedLogosUrl(profileData.lastGamePlayedLogosUrl);

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

  const lastGamePlayedImageUrlFinal = lastGamePlayedImageUrl || defaultBackgroundImage;

  return (
    <div className='page'>

      <div className='header'>
        <a href='/'><span className='logo'><img src={Logo} alt='💀' /></span></a>
        <div className='header-container'>
          <p className='welcome-message'>
            Welcome to <strong>TROPHY FORGE</strong>
            <br />
            Here you can generate your own custom trophy card using different templates
          </p>
          <div className='fetch-trophy-container'>
              <div className='input-container'>
                <input
                  ref={inputRef}
                  type='text'
                  className='input-psn-id'
                  placeholder='Enter a PSN username'
                  value={psnId}
                  onChange={handleInputChange}
                  onKeyDown={handleEnterKeyDown}
                />
                <div className='shortcut-keys'>
                  <img src={CtrlKey} alt='💀' style={{height: '37px'}} />
                  <img src={KKey} alt='💀' style={{height: '30px'}} />
                </div>
              </div>
              <button
                onClick={handleUpdateClick}
                className='buttons'
              >
                UPDATE
              </button>
              <div className='message-container'>
                {loading && <p className='loading-text'>Loading...</p>}
                {error && <p className='error-text'>{error}</p>}
              </div>
            </div>
          </div>
      </div>

      <div className='content'>
        <div className='content-container'>

          <div className='profile-container'>
              <span className='avatar'>
                {avatarUrl && <img src={avatarUrl} alt='💀' />}
              </span>
              <div className='username-and-plus'>
                <span className={`plus ${plusStatus ? 'plus-active' : ''}`}><img src={Plus} alt='💀' /></span>
                <p className='username'>{psnUsername.toUpperCase()}</p>
              </div>
              {isProfileVisible && (
                <div className='level-and-trophy'>
                  <div className='level-and-trophy-pair'>
                    <span className='trophy-icon'>{<img src={Level} alt='💀' />}</span>
                    <p className='trophy-icon-label' style={{color: '#98DB7C'}}>LEVEL</p>
                    <p className='trophy-icon-text'style={{color: '#98DB7C'}}>{level}</p>
                    <div className='next-level-progress-bar'>
                      <div 
                        className='next-level-progress-bar-fill'
                        style={{ width: `${nextLevel}%` }}
                      >
                        {nextLevel >= 20 && (
                          <span className='next-level-progress-bar-text'>{nextLevel}%</span>
                        )}
                      </div>
                      {level < 999 && nextLevel < 20 && (
                        <span className='next-level-progress-bar-text-outside'>{nextLevel}%</span>
                      )}
                      {level === 999 && (
                        <span className='next-level-progress-bar-text-outside' style={{fontStyle: 'italic'}}>MAX</span>
                      )}
                    </div>
                  </div>
                  <div className='level-and-trophy-pair'>
                    <span className='trophy-icon'>{<img src={Platinum} alt='💀' />}</span>
                    <p className='trophy-icon-label' style={{color: '#64B9FC',}}>PLATINUM</p>
                    <p className='trophy-icon-text' style={{color: '#64B9FC'}}>{platinumTrophies}</p>
                  </div>
                  <div className='level-and-trophy-pair'>
                    <span className='trophy-icon'>{<img src={Gold} alt='💀' />}</span>
                    <p className='trophy-icon-label' style={{color: '#FFC54B'}}>GOLD</p>
                    <p className='trophy-icon-text' style={{color: '#FFC54B'}}>{goldTrophies}</p>
                  </div>
                  <div className='level-and-trophy-pair'>
                    <span className='trophy-icon'>{<img src={Silver} alt='💀' />}</span>
                    <p className='trophy-icon-label' style={{color: '#D4E3D8'}}>SILVER</p>
                    <p className='trophy-icon-text' style={{color: '#D4E3D8'}}>{silverTrophies}</p>
                  </div>
                  <div className='level-and-trophy-pair'>
                    <span className='trophy-icon'>{<img src={Bronze} alt='💀' />}</span>
                    <p className='trophy-icon-label' style={{ color: '#F66C4C'}}>BRONZE</p>
                    <p className='trophy-icon-text' style={{color: '#F66C4C'}}>{bronzeTrophies}</p>
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
            <div className='trophy-card-template-container'>
              {isProfileVisible && (
                <div 
                className='trophy-card'
                style={{
                  backgroundImage: `url('${lastGamePlayedImageUrlFinal}')`
                }}>
                  <div className='content-overlay'>
                    <div className='top-row'>
                      <div className='trophy-card-user-container'>
                        <span className='trophy-card-avatar'>
                          {avatarUrl && <img src={avatarUrl} alt='💀' />}
                        </span>
                        <div className='username-and-plus'>
                          <span className={`trophy-card-plus ${plusStatus ? 'trophy-card-plus-active' : ''}`}><img src={Plus} alt='💀' /></span>
                          <p className='trophy-card-username'>{psnUsername}</p>
                        </div>
                      </div>
                        <div className='trophy-card-top-row-right-side-container'>
                          <div className='trophy-card-level-container'>
                            <span className='trophy-card-level-icon'>
                              <img src={getLevelIcon(level)} alt='💀'></img>
                            </span>
                            <div className='trophy-card-level-wrapper'>
                              <p style={{ fontSize: '14px'}}>Level</p>
                              <p className='trophy-card-level'>{level}</p>
                            </div>
                          </div>
                          <div className='trophy-card-earned-trophies-container'>
                            <span className='trophy-card-earned-trophies-icon'>
                              <img src={EarnedTrophies} alt='💀'></img>
                            </span>
                            <div className='trophy-card-level-wrapper'>
                              <p style={{ fontSize: '14px'}}>Trophies</p>
                              <p className='trophy-card-level'>{earnedTrophies}</p>
                            </div>
                          </div>
                        </div>
                    </div>
                    <div className='bottom-row'>
                      <div className='trophy-card-game-container'>
                        <div className='trophy-card-game-container'>
                          {lastGamePlayedLogosUrl.map((logoUrl, index) => (
                            <div className='trophy-card-game-pair' key={index}>
                              <span className='trophy-card-game-logo'>
                                <img src={logoUrl} alt=''></img>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className='trophy-card-trophy-container'>
                        <div className='trophy-card-trophy-pair'>
                          <span className='trophy-card-trophy-icon'>
                            <img src={PlatinumTC} alt='💀'></img>
                          </span>
                          <p className='trophy-card-trophy-text'>{platinumTrophies}</p>
                        </div>
                        <div className='trophy-card-trophy-pair'>
                          <span className='trophy-card-trophy-icon'>
                            <img src={GoldTC} alt='💀'></img>
                          </span>
                          <p className='trophy-card-trophy-text'>{goldTrophies}</p>
                        </div>
                        <div className='trophy-card-trophy-pair'>
                          <span className='trophy-card-trophy-icon'>
                            <img src={SilverTC} alt='💀'></img>
                          </span>
                          <p className='trophy-card-trophy-text'>{silverTrophies}</p>
                        </div>
                        <div className='trophy-card-trophy-pair'>
                          <span className='trophy-card-trophy-icon'>
                            <img src={BronzeTC} alt='💀'></img>
                          </span>
                          <p className='trophy-card-trophy-text'>{bronzeTrophies}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className='trophy-card-function-container'>
              {isProfileVisible && (
                <div className='trophy-card-function'>
                  <button className='buttons'>
                    CHANGE IMAGE
                  </button>
                  <button className='buttons'>
                    CHANGE COLOR
                  </button>
                  <button className='buttons'>
                    CHANGE LAYOUT
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Home;