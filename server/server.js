import express from 'express';
import cors from 'cors';
import { exchangeNpssoForAccessCode, 
    exchangeAccessCodeForAuthTokens,
    exchangeRefreshTokenForAuthTokens,
    makeUniversalSearch,
    getProfileFromUserName,
    getUserPlayedGames } from 'psn-api';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const app = express();
const PORT = process.env.PORT || 5000;
const NPSSO_TOKEN = process.env.NPSSO_TOKEN;

// Use the cors middleware.
app.use(cors({
    origin: 'http://localhost:5173'
}));

if (!NPSSO_TOKEN) {
    console.error('[SERVER] NPSSO_TOKEN is not defined in the .env file.');
    process.exit(1);
}

// We will use a simple token cache to avoid repeated authentication
let authTokens = null;
let tokenExpirationTime = 0;

// Middleware to get or refresh the authentication tokens - https://psn-api.achievements.app/api-docs/authentication
app.use(async (req, res, next) => {
    try {
        const now = Date.now();
        const isTokenExpired = authTokens && now >= tokenExpirationTime;


        // Condition 1: No tokens exist, so perform initial authentication with NPSSO
        if (!authTokens) {
            console.log('Authenticating with NPSSO token...');
            const tempCode = await exchangeNpssoForAccessCode(NPSSO_TOKEN);
            authTokens = await exchangeAccessCodeForAuthTokens(tempCode);
            tokenExpirationTime = now + authTokens.expiresIn * 1000 - 60000;
        }
        // Condition 2: Tokens exist but the access token has expired
        else if (isTokenExpired) {
            console.log('[SERVER] Access token expired, refreshing...');
            const newAuthTokens = await exchangeRefreshTokenForAuthTokens(authTokens.refreshToken);
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
        const searchResult = await makeUniversalSearch(
            { accessToken: authTokens.accessToken },
            username, 'SocialAllAccounts'
        );
        if (!searchResult) {
            return res.status(404).json({ message: `PSN profile '${username}' not found.` });
        }
        const accountId = (username.toLowerCase() == 'urbandonment') ? 'me' : searchResult.domainResponses[0].results[0].socialMetadata.accountId;

        // Retrieve profile from username
        const profile = await getProfileFromUserName(
            { accessToken: authTokens.accessToken }, username
        )

        // Retrieve games from accountId
        const userPlayedGames = await getUserPlayedGames(
            { accessToken: authTokens.accessToken }, accountId
        )

        const lastGamePlayed = (userPlayedGames && userPlayedGames.titles && userPlayedGames.titles.length > 0)
            ? userPlayedGames.titles[0].name
            : 'No games played recently';

        // API response
        res.json({ accountId: profile.profile.accountId,
            onlineId: profile.profile.onlineId,
            avatarUrl: profile.profile.avatarUrls[0].avatarUrl, 
            isPlus: profile.profile.plus,
            level: profile.profile.trophySummary.level,
            platinumTrophies: profile.profile.trophySummary.earnedTrophies.platinum,
            goldTrophies: profile.profile.trophySummary.earnedTrophies.gold,
            silverTrophies: profile.profile.trophySummary.earnedTrophies.silver,
            bronzeTrophies: profile.profile.trophySummary.earnedTrophies.bronze,
            earnedTrophies: profile.profile.trophySummary.earnedTrophies.platinum +
                    profile.profile.trophySummary.earnedTrophies.gold +
                    profile.profile.trophySummary.earnedTrophies.silver +
                    profile.profile.trophySummary.earnedTrophies.bronze,
            lastGamePlayed: lastGamePlayed });

    } catch (error) {
        console.error(`[SERVER] Proxy error during profile fetch for ${username}:`, error);
        res.status(500).json({ message: 'Internal Server Error during profile lookup' });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});