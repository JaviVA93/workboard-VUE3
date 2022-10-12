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

export async function getToken() {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
        },
        body: "grant_type=client_credentials",
    });

    const data = await result.json();
    return data.access_token;
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

export function createAuthorizedURL() {
    let scope = 'streaming user-read-playback-state user-modify-playback-state user-read-private user-read-email',
        redirect_uri = 'http://localhost:3000/',
        client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

    let authorizeURL = 'https://accounts.spotify.com/authorize?' +
        encodeURI('response_type=code' + '&' +
            'client_id=' + client_id + '&' +
            'scope=' + scope + '&' +
            'redirect_uri=' + redirect_uri + '&' +
            'state=' + generateRandomString(16)
        );

    return authorizeURL;

}

export async function requestAccessToken(code: string) {
    const client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID,
        client_secret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET,
        form_data = new URLSearchParams({
            code: code,
            redirect_uri: 'http://localhost:3000/',
            grant_type: 'authorization_code'
        });
    const request = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: form_data
    });

    return await request.json();
}

async function refreshAccessToken(refresh_token: string) {
    const client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID,
        client_secret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET,
        form_data = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        });
    const request = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret),
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
    Object.entries(refreshed_access_token).forEach( ([key, value]) => {
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