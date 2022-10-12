/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
function generateRandomString(length: Number) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

async function generateCodeChallenge(codeVerifier: string) {
    const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(codeVerifier),
    );

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

export async function getCategories(token: string) {
    const result = await fetch(
        `https://api.spotify.com/v1/browse/categories`,
        {
            method: "GET",
            headers: { Authorization: "Bearer " + token },
        }
    );
    const data = await result.json();
    return data.categories.items;
}

export async function getTrack(track_id: string, token: string) {
    const result = await fetch(
        `https://api.spotify.com/v1/tracks/${track_id}`,
        {
            method: "GET",
            headers: { Authorization: "Bearer " + token },
        }
    );
    const data = await result.json();
    return data;
}

export async function createAuthorizedURL() {
    let scope = 'streaming user-read-playback-state user-modify-playback-state user-read-private user-read-email',
        redirect_uri = 'http://localhost:3000/',
        client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID,
        rand_state = generateRandomString(64),
        hash_rand_state = await generateCodeChallenge(rand_state);

    let authorizeURL = 'https://accounts.spotify.com/authorize?' +
        encodeURI(
            'response_type=code' + '&' +
            'client_id=' + client_id + '&' +
            'scope=' + scope + '&' +
            'redirect_uri=' + redirect_uri + '&' +
            'code_challenge_method=S256' + '&' +
            'code_challenge=' + hash_rand_state
        );

    return [authorizeURL, rand_state];

}

export async function requestAccessToken(code: string) {
    const client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID,
        form_data = new URLSearchParams({
            client_id: client_id,
            code_verifier: window.localStorage.spotify_auth_code_verifier,
            code: code,
            redirect_uri: 'http://localhost:3000/',
            grant_type: 'authorization_code'
        });
    const request = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: form_data
    });

    return await request.json();
}

async function refreshAccessToken(refresh_token: string) {
    const client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID,
        form_data = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
            client_id: client_id
        });
    const request = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: form_data
    });

    return await request.json();
}

async function refreshAccessTokenHadler(refres_token: string, callback: any) {
    let refreshed_access_token = await refreshAccessToken(refres_token);
    if (refreshed_access_token.error) {
        // CONTROL REFRESH TOKEN ERRORS
    }

    let spotify_token = (window.localStorage.spotify_token) ?
        JSON.parse(window.localStorage.spotify_token) : {};
    Object.entries(refreshed_access_token).forEach(([key, value]) => {
        spotify_token[key] = value;
    });
    window.localStorage.setItem('spotify_token', JSON.stringify(spotify_token));
    callback(refreshed_access_token.access_token);
}

export async function getPlaybackState(token: string) {
    const request = await fetch('https://api.spotify.com/v1/me/player', {
        method: 'GET',
        headers: {
            'Authorization': "Bearer " + token,
            'Content-Type': 'application/json'
        }
    });

    if (request.status === 200)
        return await request.json();
    else if (request.status === 204)
        return {
            error: {
                status: 204,
                message: 'Playback not available or active'
            }
        };
    else if (request.status === 401) {
        let res_body = await request.json();
        if (res_body.error && res_body.error.message === 'The access token expired') {
            let refres_token = JSON.parse(window.localStorage.spotify_token).refresh_token;
            refreshAccessTokenHadler(refres_token, getPlaybackState);
        }
    }
    else {
        return await request.json();
    }
}

export async function pausePlayback(token: string) {

    // Check if the playbackState is currently playing
    const playback_state = await getPlaybackState(token);
    if (playback_state.error || playback_state.is_playing === false)
        return false;

    const request = await fetch(`https://api.spotify.com/v1/me/player/pause`, {
        method: 'PUT',
        headers: {
            'Authorization': "Bearer " + token,
            'Content-Type': 'application/json'
        }
    });

    if (request.status === 204)
        return true;
    else {
        let body = await request.json();
        console.error('pausePlayback api request error: ' + request.status);
        console.error(body);
        return false;
    }
}

export async function startResumePlayback(token: string) {

    // Check if the playbackState is not currently playing
    const playback_state = await getPlaybackState(token);
    if (playback_state.error || playback_state.is_playing === true)
        return false;


    const request = await fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: 'PUT',
        headers: {
            'Authorization': "Bearer " + token,
            'Content-Type': 'application/json'
        }
    });

    if (request.status === 204)
        return true;
    else {
        let body = await request.json();
        console.error('startResumePlayback api request error: ' + request.status);
        console.error(body);
        return false;
    }
}

export async function playPausePlayback(token: string) {
    try {
        const playback_state = await getPlaybackState(token);
        if (playback_state.error)
            return;

        let req_url = (playback_state.is_playing === true) ?
            'https://api.spotify.com/v1/me/player/pause' : 'https://api.spotify.com/v1/me/player/play'

        const request = await fetch(req_url, {
            method: 'PUT',
            headers: {
                'Authorization': "Bearer " + token,
                'Content-Type': 'application/json'
            }
        });

        if (request.status === 204)
            return true;
        else {
            const body = await request.json();
            console.error('playPausePlayback api request error: ' + request.status);
            console.error(body);
            return false;
        }
    } catch (e) {
        console.error(e);
    }
}

export async function skipToNextPlayback(token: string) {
    const request = await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: {
            'Authorization': "Bearer " + token,
            'Content-Type': 'application/json'
        }
    });

    if (request.status === 204)
        return true;
    else {
        const body = await request.json();
        console.error('skipToNextPlayback api request error: ' + request.status);
        console.error(body);
        return false;
    }
}

export async function skipToPreviousPlayback(token: string) {
    const request = await fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: {
            'Authorization': "Bearer " + token,
            'Content-Type': 'application/json'
        }
    });

    if (request.status === 204)
        return true;
    else {
        const body = await request.json();
        console.error('skipToNextPlayback api request error: ' + request.status);
        console.error(body);
        return false;
    }
}

export async function getCurrentPlayingTrack(token: string) {
    const request = await fetch('https://api.spotify.com/v1/me/player/currently-playing?additional_types=track,episode', {
        method: 'GET',
        headers: {
            'Authorization': "Bearer " + token,
            'Content-Type': 'application/json'
        }
    });

    return await request.json();
}