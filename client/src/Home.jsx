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

import { Analytics } from '@vercel/analytics/react';

const isDevelopment = process.env.NODE_ENV === 'development';
// If in development, point to the local server/port (e.g., 3001).
// If in production (Vercel), use an empty string so the path becomes relative (e.g., "/api/psn-profile/...")
const PROXY_BASE_URL = isDevelopment
    ? 'http://localhost:5000'
    : '';

const borderOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Blue Neon', value: 'blue neon' },
  { label: 'Green Neon', value: 'green neon' },
  { label: 'Red Neon', value: 'red neon' }
];

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
  const [isFunctionFrameOpen, setIsFunctionFrameOpen] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [currentBackgroundImage, setCurrentBackgroundImage] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isImageUrlInputLoading, setIsImageUrlInputLoading] = useState(false);
  const [selectedBorder, setSelectedBorder] = useState('default');

  const isOkButtonDisabled = currentBackgroundImage === lastGamePlayedImageUrl;

  useEffect(() => {
    if (lastGamePlayedImageUrl) {
        setCurrentBackgroundImage(lastGamePlayedImageUrl);
    }
  }, [lastGamePlayedImageUrl]);
  
  // getProxyURL
  const isExternalUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
  };

  const getProxyUrl = (originalUrl) => {
      if (!originalUrl) {
          return originalUrl;
      }
      if (isExternalUrl(originalUrl)) {
          return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
      }
      return originalUrl;
    };

  // HEADER - INPUT USERNAME FIELD
  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    const MAX_LENGTH = 16;

    // Space character validation
    if (inputValue.includes(' ')) {
        setError('Space character is not allowed');
        return;
    }

    // Maximum length validation
    if (inputValue.length <= MAX_LENGTH) {
      setPsnId(inputValue);
    }
    if (inputValue.length >= MAX_LENGTH) {
        setError('Maximum character limit reached (16 characters)');
    } else {
        setError('');
    }
  };

  // HEADER - INPUT USERNAME FIELD - CTRL + K SHORTCUT
  const inputRef = useRef(null);
  useEffect(() => {
    const handleCtrlKShortcut = (event) => {
      if (event.ctrlKey && event.key === 'k') {
        // Prevent the browser's default behavior (e.g., focusing on the address bar)
        event.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
          setTimeout(() => {
            inputRef.current.select();
          }, 10);
        }
      }
    };
    // Add the event listener to the window
    window.addEventListener('keydown', handleCtrlKShortcut, true);
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleCtrlKShortcut, true);
    };
  }, []);

  // HEADER - INPUT USERNAME FIELD - ENTER SHORTCUT
  const handleEnterKey = (event) => {
    if (event.key === 'Enter') {
      handleUpdateButton();
    }
  };

  // HEADER - INPUT USERNAME FIELD - UPDATE BUTTON
  const handleUpdateButton = async () => {
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

      // Log the update time
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

  // TROPHY CARD - FUNCTIONS FRAME - TOGGLE HANDLING
  useEffect(() => {
    if (isFunctionFrameOpen) {
      const trophyCardFunction = document.querySelector('.trophy-card-function');
      const trophyCardFunctionFrame = document.getElementById('trophy-card-function-frame');
      // Ensure the elements exist before trying to access them
      if (trophyCardFunction && trophyCardFunctionFrame) {
        trophyCardFunctionFrame.style.width = `${trophyCardFunction.offsetWidth}px`;
      }
    }
  }, [isFunctionFrameOpen]);

  // TROPHY CARD - FUNCTIONS FRAME - BUTTONS HANDLING
  const handleFunctionButtons = (functionType) => {
    if (selectedFunction === functionType) {
      setIsFunctionFrameOpen(!isFunctionFrameOpen);
    } else {
      setSelectedFunction(functionType);
      setIsFunctionFrameOpen(true);
    }
  };

  // TROPHY CARD - CHANGE IMAGE - OK BUTTON
  const handleOkButton = () => {
    setCurrentBackgroundImage(lastGamePlayedImageUrl);
  };

  // TROPHY CARD - CHANGE IMAGE - BROWSE BUTTON
  const fileInputRef = useRef(null);
  const handleBrowseButton = () => {
    fileInputRef.current.click();
  }

  const handleBrowseFile = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
          alert('File size exceeds the 5MB limit.');
          return;
        }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MIN_WIDTH = 600;
          const MIN_HEIGHT = 200;
          const MAX_WIDTH = 3840;
          const MAX_HEIGHT = 2160;

          if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
            alert(`Image dimensions are too small. Please upload an image at least ${MIN_WIDTH}x${MIN_HEIGHT} pixels.`);
            return;
          }
          if (img.width > MAX_WIDTH || img.height > MAX_HEIGHT) {
            alert(`Image dimensions are too large. Please upload an image no more than ${MAX_WIDTH}x${MAX_HEIGHT} pixels.`);
            return;
          }
          setCurrentBackgroundImage(e.target.result);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // TROPHY CARD - CHANGE IMAGE - UPLOAD BUTTON
  const handleUploadButton = async () => {
    setIsImageUrlInputLoading(true);
    if (!imageUrlInput) {
        alert('Please enter an image URL.');
        return;
    }

    try {
        const proxyUrl = `${PROXY_BASE_URL}/api/proxy-image?url=${encodeURIComponent(imageUrlInput)}`;
        const response = await fetch(proxyUrl); // Removed { method: 'HEAD' } for full image fetch
        
        if (!response.ok) {
            // Get the specific error from the backend, if available
            const errorText = await response.text();
            alert(`Could not validate the image URL. Server responded with: ${errorText}`);
            return;
        }

        const img = new Image();
        img.onload = () => {
            const MIN_WIDTH = 600;
            const MIN_HEIGHT = 200;
            const MAX_WIDTH = 3840;
            const MAX_HEIGHT = 2160;

            if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
                alert(`Image dimensions are too small. Please upload an image at least ${MIN_WIDTH}x${MIN_HEIGHT} pixels.`);
                return;
            }
            if (img.width > MAX_WIDTH || img.height > MAX_HEIGHT) {
                alert(`Image dimensions are too large. Please upload an image no more than ${MAX_WIDTH}x${MAX_HEIGHT} pixels.`);
                return;
            }
            setCurrentBackgroundImage(imageUrlInput);
            setIsImageUrlInputLoading(false);
        };
        img.src = response.url;

    } catch (err) {
        console.error('Error fetching image from URL: ', err);
        alert('An error occurred. Please check the URL and try again.');
    }
  };

  // TROPHY CARD - BORDER SELECTION
  const handleBorderChange = (event) => {
    setSelectedBorder(event.target.value);
  };
 
  return (
    <div className='page'>
      <div className='header'>
        <a href='/'><span className='logo'><img src={Logo} alt='💀' /></span></a>
        <div className='header-container'>
          <p className='welcome-message'>
            Welcome to <strong>TROPHY FORGE</strong>
            <br />
            Here you can generate your own custom PSN trophy card
          </p>
          <div className='fetch-trophy-container'>
              <div className='input-container'>
                <input
                  ref={inputRef}
                  type='text'
                  className='input-psn-id'
                  placeholder='Enter a PSN username'
                  value={psnId}
                  maxLength={16}
                  onChange={handleInputChange}
                  onKeyDown={handleEnterKey}
                />
                <div className='shortcut-keys'>
                  <img id='ctrl-key' src={CtrlKey} alt='💀' />
                  <img id='k-key' src={KKey} alt='💀' />
                </div>
              </div>
              <button
                onClick={handleUpdateButton}
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
        <div className='content-container'
          style={{
            backgroundImage: `url('${currentBackgroundImage}')`,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backgroundBlendMode: 'overlay',
            backgroundSize: 'cover',
            backgroundPosition: '50% 55%',
            backgroundRepeat: 'no-repeat',
            borderRadius: '0.938rem'}}>
          <div className='profile-container'>
              <span className='avatar'>
                {avatarUrl && <img src={avatarUrl} alt='💀' />}
              </span>
              <div className='username-and-plus'>
                <span className={`plus ${plusStatus ? 'plus-active' : ''}`}><img src={Plus} alt='💀' /></span>
                <p className='username'>{psnUsername}</p>
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
                        style={{width: `${nextLevel}%`}}
                      >
                        {nextLevel >= 25 && (
                          <span className='next-level-progress-bar-text'>{nextLevel}%</span>
                        )}
                      </div>
                      {level < 999 && nextLevel < 25 && (
                        <span className='next-level-progress-bar-text-outside'>{nextLevel}%</span>
                      )}
                      {level === 999 && (
                        <span className='next-level-progress-bar-text-outside' style={{fontStyle: 'italic'}}>MAX</span>
                      )}
                    </div>
                  </div>
                  <div className='level-and-trophy-pair'>
                    <span className='trophy-icon'>{<img src={Platinum} alt='💀' />}</span>
                    <p className='trophy-icon-label' style={{color: '#64B9FC'}}>PLATINUM</p>
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
                    <p className='trophy-icon-label' style={{color: '#F66C4C'}}>BRONZE</p>
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
            <div className='trophy-card-and-functions'>
              <div className='trophy-card-template-container'>
                {isProfileVisible && (
                  <div 
                  className={`trophy-card ${selectedBorder}`}
                  style={{
                    backgroundImage: `url('${getProxyUrl(currentBackgroundImage)}')`, 
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: '50% 45%',
                    backgroundBlendMode: 'overlay'}}>
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
                              <p>Level</p>
                              <p className='trophy-card-level'>{level}</p>
                            </div>
                          </div>
                          <div className='trophy-card-earned-trophies-container'>
                            <span className='trophy-card-earned-trophies-icon'>
                              <img src={EarnedTrophies} alt='💀'></img>
                            </span>
                            <div className='trophy-card-level-wrapper'>
                              <p>Trophies</p>
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
                                <img src={getProxyUrl(logoUrl)} alt=''></img>
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
                )}
              </div>
              <div className='trophy-card-function-container'>
                <div className='trophy-card-function-and-frame'>
                  {isProfileVisible && (
                    <div className='trophy-card-function'>
                      <button className='buttons' onClick={() => handleFunctionButtons('change-image')}>
                        CHANGE IMAGE
                      </button>
                      <button className='buttons' onClick={() => handleFunctionButtons('change-border')}>
                        CHANGE BORDER
                      </button>
                      <button className='buttons' onClick={() => handleFunctionButtons('change-layout')}>
                        CHANGE LAYOUT
                      </button>
                    </div>
                  )}
                  <div 
                    id='trophy-card-function-frame'
                    className={`trophy-card-function-frame ${isFunctionFrameOpen ? 'open' : ''}`}>
                    {selectedFunction === 'change-image' && (
                      <div className='trophy-card-function-frame-label'>
                        <div className='trophy-card-function-frame-row'>
                          <span>Use image from your latest game</span>
                          <button 
                            className={`function-frame-buttons ${isOkButtonDisabled ? 'is-disabled' : ''}`}
                            onClick={handleOkButton}
                            disabled={isOkButtonDisabled}
                            style={{backgroundColor: isOkButtonDisabled ? '#808080' : '#0455BF',}}>
                            OK
                          </button>
                        </div>
                        <div className='trophy-card-function-frame-row'>
                          <span>Upload your own image</span>
                          <button className='function-frame-buttons' onClick={handleBrowseButton}>Browse</button>
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleBrowseFile}
                            style={{display: 'none'}}
                          />
                        </div>
                        <div className='trophy-card-function-frame-row'>
                          <span className='input-upload-image-container'>
                            <input className='input-upload-image' style={{
                                backgroundColor: '#E5E4E2',
                                color: '#3D6685',
                                fontFamily: 'Bitter',
                                border: 0}}
                              type='text'
                              placeholder='Paste an image URL'
                              value={imageUrlInput}
                              onChange={(e) => setImageUrlInput(e.target.value)}
                            />
                            {isImageUrlInputLoading && <div className="input-upload-image-loading"></div>}
                          </span>
                          <button className='function-frame-buttons' onClick={handleUploadButton}>Upload</button>
                        </div>
                      </div>
                    )}
                    {selectedFunction === 'change-border' && (
                      <div className='trophy-card-function-frame-label'>
                        <div className='border-select-control'>
                          <label htmlFor='border-style'>Select trophy card's border</label>
                          <select 
                            id='border-style' 
                            value={selectedBorder} 
                            onChange={handleBorderChange}
                          >
                            {borderOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                    {selectedFunction === 'change-layout' && (
                      <div className='trophy-card-function-frame-label'>
                        <p>Layout options go here.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Analytics />
    </div>
  );
}

export default Home;