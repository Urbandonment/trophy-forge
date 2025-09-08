import React from 'react';
import Plus from './assets/plus.png';

const TrophyCard = ({
  avatarUrl,
  psnUsername,
  plusStatus,
  level,
  platinumTrophies,
  goldTrophies,
  silverTrophies,
  bronzeTrophies,
}) => {
  return (
    <div className='trophy-card'>
      <div className='card-header'>
        {/* <span className='card-avatar'>
            {avatarUrl && <img src={avatarUrl} alt='User Avatar' />}
        </span>
        <div className='card-username-and-plus'>
            <span className={`card-plus ${plusStatus ? 'plus-active' : ''}`}><img src={Plus} alt='Plus Icon' /></span>
            <p className='card-username'>{psnUsername.toUpperCase()}</p>
        </div> */}
      </div>
      <div className='card-body'>
      </div>
    </div>
  );
};

export default TrophyCard;