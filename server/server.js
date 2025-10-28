import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// import * as psn from 'psn-api';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 5000;
const NPSSO_TOKEN = process.env.NPSSO_TOKEN;
const DEFAULT_TROPHY_CARD_BACKGROUND = [
    '/assets/trophy-card-default-background-1.png',
    '/assets/trophy-card-default-background-2.png',
    '/assets/trophy-card-default-background-3.png',
    '/assets/trophy-card-default-background-4.png',
    '/assets/trophy-card-default-background-5.png',
    '/assets/trophy-card-default-background-6.png',
];
const MAX_IMAGE_WIDTH = 960;
const OPTIMIZATION_QUALITY = 70;

// Randomize default trophy card background image
const getRandomBackground = () => {
  const randomIndex = Math.floor(Math.random() * DEFAULT_TROPHY_CARD_BACKGROUND.length);
  return DEFAULT_TROPHY_CARD_BACKGROUND[randomIndex];
};

// Use the cors middleware
app.use(cors({
    origin: 'http://localhost:5173'
}));

// Serve static files
app.use('/assets', express.static(path.join(__dirname, '..', 'client', 'src', 'assets')));


if (!NPSSO_TOKEN) {
    console.error('[SERVER] NPSSO_TOKEN is not defined in the .env file.');
    process.exit(1);
}

// We will use a simple token cache to avoid repeated authentication
let authTokens = null;
let tokenExpirationTime = 0;
let psn = {};

// Middleware to get or refresh the authentication tokens - https://psn-api.achievements.app/api-docs/authentication
app.use(async (req, res, next) => {
    try {
        const now = Date.now();
        const isTokenExpired = authTokens && now >= tokenExpirationTime;

        if (Object.keys(psn).length === 0) { // Check if psn is empty
            try {
                // The original named import that failed first
                const psnModule = await import('psn-api');
                
                // Assign all exports to the psn object
                // If it's a dual module, exports are often on .default
                Object.assign(psn, psnModule.default || psnModule);
                
                // If the module fails to export functions, the object will be empty or wrong.
                if (!psn.exchangeNpssoForAccessCode) {
                    console.error("[SERVER] FATAL: PSN functions not found after import.");
                    throw new Error("PSN module failed to load functions.");
                }

            } catch (err) {
                console.error("[SERVER] Module import failed:", err.message);
                throw err;
            }
        }

        // Condition 1: No tokens exist, so perform initial authentication with NPSSO
        if (!authTokens) {
            console.log('Authenticating with NPSSO token...');
            const tempCode = await psn.exchangeNpssoForAccessCode(NPSSO_TOKEN);
            authTokens = await psn.exchangeAccessCodeForAuthTokens(tempCode);
            tokenExpirationTime = now + authTokens.expiresIn * 1000 - 60000;
        }
        // Condition 2: Tokens exist but the access token has expired
        else if (isTokenExpired) {
            console.log('[SERVER] Access token expired, refreshing...');
            const newAuthTokens = await psn.exchangeRefreshTokenForAuthTokens(authTokens.refreshToken);
            authTokens = newAuthTokens;
            tokenExpirationTime = now + authTokens.expiresIn * 1000 - 60000;
        }
        next();
    } catch (error) {
        console.error('[SERVER] Authentication or token refresh failed:', error);
        res.status(500).json({ message: 'Authentication failed. Please check your NPSSO token.' });
    }
});

// Users API Endpoint - https://psn-api.achievements.app/api-docs/users
app.get('/api/psn-profile/:username', async (req, res) => {
    const { username } = req.params;

    try {
        // Retrieve accountId from username
        const searchResult = await psn.makeUniversalSearch(
            { accessToken: authTokens.accessToken },
            username, 'SocialAllAccounts'
        );
        if (!searchResult) {
            return res.status(404).json({ message: `PSN profile '${username}' not found.` });
        }
        const accountId = (username.toLowerCase() == 'urbandonment') ? 'me' : searchResult.domainResponses[0].results[0].socialMetadata.accountId;

        // Retrieve profile from username
        const profile = await psn.getProfileFromUserName(
            { accessToken: authTokens.accessToken }, username
        )

        // Retrieve played games from accountId
        const userPlayedGames = await psn.getUserPlayedGames(
            { accessToken: authTokens.accessToken }, accountId
        )

        const lastGamePlayed = (userPlayedGames && userPlayedGames.titles && userPlayedGames.titles.length > 0)
            ? userPlayedGames.titles[0].name
            : 'No games played recently';

        // Trophy card game logo
        let lastGamePlayedLogos = [];
        for (let i = 0; i < 8; i++) {
            let lastGamePlayedLogo = userPlayedGames?.titles?.[i]?.imageUrl;
            if (lastGamePlayedLogo) {
                lastGamePlayedLogos.push(lastGamePlayedLogo);
            }
        }
        const lastGamePlayedLogosUrl = lastGamePlayedLogos ?? 'No games played recently';

        // Trophy card background image
        let lastGamePlayedImage = userPlayedGames?.titles?.[0]?.concept?.media?.images;
        let lastGamePlayedDesiredImage = null;
        if (lastGamePlayedImage) {
            for (let i = 0; i < lastGamePlayedImage.length; i++) {
                // console.log(lastGamePlayedImage[i].type + ': ' + lastGamePlayedImage[i].url);
                if (lastGamePlayedImage[i].type === 'GAMEHUB_COVER_ART') {
                    lastGamePlayedDesiredImage = lastGamePlayedImage[i].url;
                    break;
                }
            }
        }
        const lastGamePlayedImageUrl = lastGamePlayedDesiredImage ?? getRandomBackground();

        // API response
        res.json({ accountId: profile.profile.accountId,
            onlineId: profile.profile.onlineId,
            avatarUrl: profile.profile.avatarUrls[0].avatarUrl, 
            isPlus: profile.profile.plus,
            level: profile.profile.trophySummary.level,
            nextLevel: profile.profile.trophySummary.progress,
            platinumTrophies: profile.profile.trophySummary.earnedTrophies.platinum,
            goldTrophies: profile.profile.trophySummary.earnedTrophies.gold,
            silverTrophies: profile.profile.trophySummary.earnedTrophies.silver,
            bronzeTrophies: profile.profile.trophySummary.earnedTrophies.bronze,
            earnedTrophies: profile.profile.trophySummary.earnedTrophies.platinum +
                    profile.profile.trophySummary.earnedTrophies.gold +
                    profile.profile.trophySummary.earnedTrophies.silver +
                    profile.profile.trophySummary.earnedTrophies.bronze,
            lastGamePlayed: lastGamePlayed,
            lastGamePlayedImageUrl: lastGamePlayedImageUrl,
            lastGamePlayedLogosUrl: lastGamePlayedLogosUrl });

    } catch (error) {
        console.error(`[SERVER] Error during profile lookup for ${username}:`, error);
        if (error.message.includes('not found') || error.message.includes('socialMetadata')) {
            res.status(404).json({ message: `Unable to find a profile for ${username}` });
        } else if (error.message.includes('Cannot read properties of undefined') || error.message.includes('hidden')) {
            res.status(406).json({ message: `Unable to display the profile of ${username} due to their privacy setting` });
        }
        else {
            res.status(500).json({ message: 'Internal Server Error during profile lookup' });
        }
    }
});

// API to proxy the image request
app.get('/api/proxy-image', async (req, res) => {
    const imageUrl = req.query.url;
    if (!imageUrl) {
        return res.status(400).send('Image URL is required.');
    }

    // Basic security check: ensure the URL uses http or https
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        return res.status(400).send('Invalid image URL protocol.');
    }

    try {
        const imageResponse = await fetch(imageUrl);
        
        // Check if the response is valid (e.g., status 200-299)
        if (!imageResponse.ok) {
            return res.status(imageResponse.status).send(`Failed to fetch image: ${imageResponse.statusText}`);
        }

        // Check if the content type is an image
        const contentType = imageResponse.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
            return res.status(400).send('URL does not point to a valid image.');
        }

        // Process (Resize and Compress) the image using Sharp
        const imageBuffer = await imageResponse.buffer();
        const processedImageBuffer = await sharp(imageBuffer)
            .resize({ 
                width: MAX_IMAGE_WIDTH,
                withoutEnlargement: true // Prevent upsizing if the image is already smaller
            })
            // Convert to JPEG with reduced quality for compression
            .jpeg({ quality: OPTIMIZATION_QUALITY }) 
            .toBuffer();

        // Check for file size before streaming
        const processedImageSize = processedImageBuffer.length;
        const contentLength = imageResponse.headers.get('content-length');
        const MAX_FILE_SIZE = 15 * 1024 * 1024;
        if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
            return res.status(413).send('Image size exceeds the 15MB limit.');
        }

        // Set the Content-Type header and stream the image
        res.setHeader('Access-Control-Allow-Origin', '*');
        // res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Length', processedImageSize);
        res.send(processedImageBuffer);

    //     imageResponse.body.on('error', (err) => {
    //     console.error("Stream pipe error:", err);
    //     // Use an appropriate status code if the response has not been sent yet
    //     if (!res.headersSent) {
    //         res.status(500).send('Stream error.');
    //     }
    // });
    //     imageResponse.body.pipe(res);
        
    } catch (error) {
        console.error("Proxy error:", error);
        res.status(500).send('An internal server error occurred.');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});

// Serve static files and handle routing
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("/*splat", (req, res) => {
    return res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}