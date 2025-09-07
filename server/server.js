import express from 'express';
import cors from 'cors';
import { exchangeNpssoForAccessCode, 
    exchangeAccessCodeForAuthTokens, 
    makeUniversalSearch,
    getProfileFromUserName } from 'psn-api';
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

// Middleware to get or refresh the authentication tokens
app.use(async (req, res, next) => {
    try {
        if (!authTokens) {
            console.log('Authenticating with NPSSO token...');
            // Step 1: Exchange the NPSSO token for a temporary code
            const tempCode = await exchangeNpssoForAccessCode(NPSSO_TOKEN);
            // Step 2: Exchange the temporary code for access and refresh tokens
            authTokens = await exchangeAccessCodeForAuthTokens(tempCode);
        }
        next();
    } catch (error) {
        console.error('[SERVER] Authentication failed:', error);
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
        console.log('[SERVER] PLUS STATUS: ' + profile.profile.onlineId + ' - ' + profile.profile.plus
            + ' - ' + profile.profile.trophySummary.level
        );

        // Response
        res.json({ accountId: profile.profile.accountId,
            onlineId: profile.profile.onlineId,
            avatarUrl: profile.profile.avatarUrls[0].avatarUrl, 
            isPlus: profile.profile.plus,
            level: profile.profile.trophySummary.level,
            platinumTrophies: profile.profile.trophySummary.earnedTrophies.platinum,
            goldTrophies: profile.profile.trophySummary.earnedTrophies.gold,
            silverTrophies: profile.profile.trophySummary.earnedTrophies.silver,
            bronzeTrophies: profile.profile.trophySummary.earnedTrophies.bronze, });

    } catch (error) {
        console.error(`[SERVER] Proxy error during profile fetch for ${username}:`, error);
        res.status(500).json({ message: 'Internal Server Error during profile lookup' });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});