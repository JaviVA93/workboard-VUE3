

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
    let scope = 'streaming user-read-private user-read-email',
        redirect_uri = 'http://localhost:3000/',
        client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID,
        state = 'some-state-of-my-choice';

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
        client_secret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
    const form_data = new URLSearchParams({
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
    
    const req_data = await request.json();
    console.log(req_data);
    return req_data
}

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