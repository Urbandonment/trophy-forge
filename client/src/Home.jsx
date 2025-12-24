import { useState, useRef, useEffect, useCallback } from 'react';
import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';
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

const isDevelopment = process.env.NODE_ENV === 'development';
const PROXY_BASE_URL = isDevelopment
    ? 'http://localhost:5000'
    : '';

const borderOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Blue Neon', value: 'blue neon' },
  { label: 'Green Neon', value: 'green neon' },
  { label: 'Orange Neon', value: 'orange neon' },
  { label: 'Purple Neon', value: 'purple neon' },
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

  // Helper function to update button that can be called with a name
  const handleUpdateButtonWithName = useCallback(async (username) => {
    setLoading(true);
    setError('');

    if (!username) {
      setError('Please enter a PSN username');
      setLoading(false);
      return;
    }

    try {
      const profileResponse = await fetch(`${PROXY_BASE_URL}/api/psn-profile/${username}`, {
        method: 'GET',
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        setError(errorData.message);
        setLoading(false);
        return;
      }

      const profileData = await profileResponse.json();
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
      console.error(`[CLIENT] Error during profile lookup for ${username}:`, err);
      if (err instanceof TypeError && err.message.includes('NetworkError')) {
        console.log('[CLIENT] The proxy server is not running');
        setError('The site is experiencing technical issues. Please try again later.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
      setLoading(false);
    }
  }, []);

  // Read URL search parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const nameParam = urlParams.get('name');
    if (nameParam) {
      setPsnId(nameParam);
      // Trigger search automatically if name parameter exists
      setTimeout(() => {
        handleUpdateButtonWithName(nameParam);
      }, 100);
    }
  }, [handleUpdateButtonWithName]);

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
    if (!psnId) {
      setError('Please enter a PSN username');
      return;
    }

    // Update URL with search parameter
    const url = new URL(window.location.href);
    url.searchParams.set('name', psnId);
    window.history.pushState({}, '', url);

    // Call the helper function
    await handleUpdateButtonWithName(psnId);
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

  // TROPHY CARD - CAPTURE AS IMAGE
  const trophyCardRef = useRef(null);
  
  // Shared function to capture the trophy card as an image
  const captureTrophyCardImage = async () => {
    if (!trophyCardRef.current) {
      alert('Trophy card not found');
      return;
    }

    try {
      const container = trophyCardRef.current;
      const trophyCard = container.querySelector('.trophy-card');
      
      if (!trophyCard) {
        alert('Trophy card element not found');
        return;
      }

      // Helper function to optimize image size
      const optimizeImage = async (img, maxSize) => {
        if (img.src.startsWith('data:')) {
          return img.src; // Already optimized
        }

        return new Promise((resolve) => {
          const tempImg = new Image();
          tempImg.crossOrigin = 'anonymous';
          tempImg.onload = () => {
            // Only optimize if image is larger than maxSize
            if (tempImg.naturalWidth <= maxSize && tempImg.naturalHeight <= maxSize) {
              resolve(img.src);
              return;
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate optimal size maintaining aspect ratio
            let targetWidth = tempImg.naturalWidth;
            let targetHeight = tempImg.naturalHeight;
            
            if (targetWidth > maxSize) {
              const ratio = maxSize / targetWidth;
              targetWidth = maxSize;
              targetHeight = targetHeight * ratio;
            }
            if (targetHeight > maxSize) {
              const ratio = maxSize / targetHeight;
              targetHeight = maxSize;
              targetWidth = targetWidth * ratio;
            }
            
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(tempImg, 0, 0, targetWidth, targetHeight);
            
            resolve(canvas.toDataURL('image/png', 1.0));
          };
          tempImg.onerror = () => resolve(img.src);
          tempImg.src = img.src;
        });
      };

      // Get device pixel ratio for high-quality capture (like browser screenshot)
      const devicePixelRatio = window.devicePixelRatio || 2;
      
      // Optimize background image to ensure it covers trophy card at device pixel ratio
      const trophyCardWidth = trophyCard.offsetWidth || 600;
      const trophyCardHeight = trophyCard.offsetHeight || 200;
      const cardAspectRatio = trophyCardWidth / trophyCardHeight;
      const bgTargetWidth = Math.ceil(trophyCardWidth * devicePixelRatio);
      const bgTargetHeight = Math.ceil(trophyCardHeight * devicePixelRatio);
      
      let optimizedBgUrl = currentBackgroundImage;
      if (currentBackgroundImage) {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        optimizedBgUrl = await new Promise((resolve) => {
          bgImg.onload = () => {
            const imgAspectRatio = bgImg.naturalWidth / bgImg.naturalHeight;
            
            // Calculate minimum size needed for cover
            // For cover to work: if image is wider than card, height must be >= card height
            // If image is taller than card, width must be >= card width
            let minWidth, minHeight;
            if (imgAspectRatio > cardAspectRatio) {
              // Image is wider - need height to match card height
              minHeight = bgTargetHeight;
              minWidth = bgTargetHeight * imgAspectRatio;
            } else {
              // Image is taller - need width to match card width
              minWidth = bgTargetWidth;
              minHeight = bgTargetWidth / imgAspectRatio;
            }
            
            // Only optimize if image is too small or way too large
            const isTooSmall = bgImg.naturalWidth < minWidth || bgImg.naturalHeight < minHeight;
            const isTooLarge = bgImg.naturalWidth > minWidth * 3 || bgImg.naturalHeight > minHeight * 3;
            
            if (isTooSmall || isTooLarge) {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // Scale to meet minimum requirements (for cover) or reduce if too large
              let targetWidth, targetHeight;
              if (isTooSmall) {
                // Scale up to meet minimum
                const scale = Math.max(minWidth / bgImg.naturalWidth, minHeight / bgImg.naturalHeight);
                targetWidth = bgImg.naturalWidth * scale;
                targetHeight = bgImg.naturalHeight * scale;
              } else {
                // Scale down but keep it large enough for cover
                const scale = Math.min((minWidth * 2) / bgImg.naturalWidth, (minHeight * 2) / bgImg.naturalHeight);
                targetWidth = bgImg.naturalWidth * scale;
                targetHeight = bgImg.naturalHeight * scale;
              }
              
              canvas.width = Math.ceil(targetWidth);
              canvas.height = Math.ceil(targetHeight);
              
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
              
              resolve(canvas.toDataURL('image/png', 1.0));
            } else {
              // Image is already good size, use proxy URL
              resolve(getProxyUrl(currentBackgroundImage));
            }
          };
          bgImg.onerror = () => resolve(getProxyUrl(currentBackgroundImage));
          bgImg.src = getProxyUrl(currentBackgroundImage);
          setTimeout(() => resolve(getProxyUrl(currentBackgroundImage)), 10000);
        });
      } else {
        optimizedBgUrl = '';
      }

      // Optimize all img elements based on their type
      const images = container.querySelectorAll('img');
      const imageOptimizations = Array.from(images).map(async (img) => {
        // Set CORS
        if (img.src && !img.src.startsWith('data:')) {
          img.crossOrigin = 'anonymous';
        }
        
        // Wait for image to load first
        if (!img.complete || img.naturalWidth === 0) {
          await new Promise((resolve) => {
            const onLoad = () => {
              img.removeEventListener('load', onLoad);
              img.removeEventListener('error', onError);
              resolve();
            };
            const onError = () => {
              img.removeEventListener('load', onLoad);
              img.removeEventListener('error', onError);
              resolve();
            };
            img.addEventListener('load', onLoad);
            img.addEventListener('error', onError);
            setTimeout(() => {
              img.removeEventListener('load', onLoad);
              img.removeEventListener('error', onError);
              resolve();
            }, 8000);
          });
        }

        // Optimize based on image type and display size, accounting for device pixel ratio
        const isGameLogo = img.closest('.trophy-card-game-logo');
        const isAvatar = img.closest('.trophy-card-avatar');
        const computedStyle = window.getComputedStyle(img);
        const displayWidth = parseFloat(computedStyle.width) || img.offsetWidth;
        // Optimize to device pixel ratio * display size for crisp rendering
        const targetSize = Math.ceil(displayWidth * devicePixelRatio);
        
        if (isGameLogo) {
          // Game logos: optimize to device pixel ratio * display size (e.g., 128px * 2 = 256px)
          const maxSize = Math.max(256, targetSize);
          const optimizedSrc = await optimizeImage(img, maxSize);
          img.src = optimizedSrc;
        } else if (isAvatar) {
          // Avatar: optimize to device pixel ratio * display size (e.g., 48px * 2 = 96px)
          const maxSize = Math.max(192, targetSize);
          const optimizedSrc = await optimizeImage(img, maxSize);
          img.src = optimizedSrc;
        } else {
          // Other icons: optimize to device pixel ratio * display size
          const maxSize = Math.max(256, targetSize);
          const optimizedSrc = await optimizeImage(img, maxSize);
          img.src = optimizedSrc;
        }
      });

      await Promise.all(imageOptimizations);
      
      // Create an img element for background to ensure it fills the entire trophy card
      // This is more reliable than CSS background-image for html-to-image
      let bgImgElement = null;
      if (optimizedBgUrl) {
        bgImgElement = document.createElement('img');
        bgImgElement.src = optimizedBgUrl;
        bgImgElement.crossOrigin = 'anonymous';
        
        // Wait for image to load first to get its dimensions
        await new Promise((resolve) => {
          const onLoad = () => {
            bgImgElement.removeEventListener('load', onLoad);
            bgImgElement.removeEventListener('error', onError);
            resolve();
          };
          const onError = () => {
            bgImgElement.removeEventListener('load', onLoad);
            bgImgElement.removeEventListener('error', onError);
            resolve();
          };
          bgImgElement.addEventListener('load', onLoad);
          bgImgElement.addEventListener('error', onError);
          setTimeout(() => {
            bgImgElement.removeEventListener('load', onLoad);
            bgImgElement.removeEventListener('error', onError);
            resolve();
          }, 2000);
        });
        
        // Calculate dimensions to maintain aspect ratio while covering the card
        const cardWidth = trophyCard.offsetWidth;
        const cardHeight = trophyCard.offsetHeight;
        const cardAspectRatio = cardWidth / cardHeight;
        const imgAspectRatio = bgImgElement.naturalWidth / bgImgElement.naturalHeight;
        
        let imgWidth, imgHeight, imgTop, imgLeft;
        
        if (imgAspectRatio > cardAspectRatio) {
          // Image is wider - fit height and extend width
          imgHeight = cardHeight;
          imgWidth = cardHeight * imgAspectRatio;
          imgTop = '0';
          imgLeft = `${(cardWidth - imgWidth) / 2}px`;
        } else {
          // Image is taller - fit width and extend height
          imgWidth = cardWidth;
          imgHeight = cardWidth / imgAspectRatio;
          imgLeft = '0';
          imgTop = `${(cardHeight - imgHeight) / 2}px`;
        }
        
        bgImgElement.style.position = 'absolute';
        bgImgElement.style.top = imgTop;
        bgImgElement.style.left = imgLeft;
        bgImgElement.style.width = `${imgWidth}px`;
        bgImgElement.style.height = `${imgHeight}px`;
        bgImgElement.style.zIndex = '-1';
        bgImgElement.style.pointerEvents = 'none';
        bgImgElement.style.objectFit = 'none'; // Don't scale, use exact dimensions
        
        // Ensure trophy card has relative positioning for absolute child
        if (window.getComputedStyle(trophyCard).position === 'static') {
          trophyCard.style.position = 'relative';
        }
        
        // Insert as first child so it's behind all content
        trophyCard.insertBefore(bgImgElement, trophyCard.firstChild);
      }
      
      // Also set CSS background as fallback (but img element will be on top)
      trophyCard.style.backgroundImage = optimizedBgUrl ? `url('${optimizedBgUrl}')` : 'none';
      trophyCard.style.backgroundSize = 'cover';
      trophyCard.style.backgroundPosition = 'center center';
      trophyCard.style.backgroundRepeat = 'no-repeat';
      
      // Force a reflow to ensure styles are applied
      trophyCard.offsetHeight;
      
      // Wait for everything to render
      await new Promise(resolve => setTimeout(resolve, 300));

      let dataUrl;
      
      // Try html-to-image first (better quality, like browser screenshot)
      try {
        // Ensure element is visible and has dimensions
        if (trophyCard.offsetWidth === 0 || trophyCard.offsetHeight === 0) {
          throw new Error('Trophy card has no dimensions');
        }
        
        dataUrl = await toPng(trophyCard, {
          backgroundColor: '#00000000', // Transparent background
          pixelRatio: devicePixelRatio, // Match browser screenshot quality
          cacheBust: true,
          skipFonts: false,
          skipAutoScale: false,
        });
      } catch (htmlToImageError) {
        console.warn('html-to-image failed, falling back to html2canvas:', htmlToImageError);
        
        // Fallback to html2canvas if html-to-image fails
        const canvas = await html2canvas(trophyCard, {
          backgroundColor: null,
          scale: devicePixelRatio, // Match browser screenshot quality
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: trophyCard.offsetWidth,
          height: trophyCard.offsetHeight,
        });
        
        dataUrl = canvas.toDataURL('image/png', 1.0);
      }

      // Clean up: remove the temporary background img element
      if (bgImgElement && bgImgElement.parentNode) {
        bgImgElement.parentNode.removeChild(bgImgElement);
      }

      return dataUrl;
    } catch (error) {
      console.error('Error capturing image:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Failed to capture image: ${error.message || 'Unknown error'}. Please try again.`);
      throw error;
    }
  };

  // Download the captured image
  const handleCaptureImage = async () => {
    try {
      const dataUrl = await captureTrophyCardImage();
      
      // Download the image
      const link = document.createElement('a');
      link.download = `trophy-card-${psnUsername || 'card'}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      // Error already handled in captureTrophyCardImage
    }
  };

  // Copy the captured image to clipboard
  const handleCopyToClipboard = async () => {
    try {
      const dataUrl = await captureTrophyCardImage();
      
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Copy to clipboard using Clipboard API
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);
      
      alert('Image copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert(`Failed to copy image to clipboard: ${error.message || 'Unknown error'}. Please try again.`);
    }
  };

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
                {avatarUrl && <img src={getProxyUrl(avatarUrl)} alt='💀' />}
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
              <div className='trophy-card-template-container' ref={trophyCardRef}>
                {isProfileVisible && (
                  <div 
                  className={`trophy-card ${selectedBorder}`}
                  style={{
                    backgroundImage: `url('${getProxyUrl(currentBackgroundImage)}')`, 
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center center',
                    backgroundBlendMode: 'overlay'}}>
                    <div className='top-row'>
                      <div className='trophy-card-user-container'>
                        <span className='trophy-card-avatar'>
                          {avatarUrl && <img src={getProxyUrl(avatarUrl)} alt='💀' />}
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
                      <button 
                        className='buttons' 
                        onClick={() => handleFunctionButtons('change-image')}
                      >
                        CHANGE IMAGE
                      </button>
                      <button 
                        className='buttons' 
                        onClick={() => handleFunctionButtons('change-border')}
                      >
                        CHANGE BORDER
                      </button>
                      <button 
                        className='buttons' 
                        onClick={() => handleFunctionButtons('change-layout')}
                      >
                        CHANGE LAYOUT
                      </button>
                      <button 
                        className='buttons' 
                        onClick={handleCaptureImage}
                      >
                        CAPTURE AS IMAGE
                      </button>
                      <button 
                        className='buttons' 
                        onClick={handleCopyToClipboard}
                      >
                        COPY TO CLIPBOARD
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
                            style={{backgroundColor: isOkButtonDisabled ? '#808080' : '#0455BF',}}
                          >
                            OK
                          </button>
                        </div>
                        <div className='trophy-card-function-frame-row'>
                          <span>Upload your own image</span>
                          <button 
                            className='function-frame-buttons' 
                            onClick={handleBrowseButton}
                          >
                            Browse
                          </button>
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
                          <button 
                            className='function-frame-buttons' 
                            onClick={handleUploadButton}
                          >
                            Upload
                          </button>
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
    </div>
  );
}

export default Home;