<script setup lang="ts">
import { ref } from 'vue';
import { createAuthorizedURL, requestAccessToken } from '../functions/spotifyApi';


const player_wrapper = ref<HTMLDivElement | null>(null),
    login_btn = ref<HTMLButtonElement | null>(null),
    player_song_name = ref<HTMLElement | null>(null),
    player_artis = ref<HTMLElement | null>(null);

let player_is_paused = true;

function redirectAuthorizedURL() {
    let authorize_url = createAuthorizedURL();
    window.location.href = authorize_url;
}

async function checkSpotifyAuthorizationCode() {
    const url = new URL(document.location.href)
    const url_params = new URLSearchParams(url.search);
    const code = url_params.get('code');

    if (code) {
        let req_at = await requestAccessToken(code);
        if (req_at.error && req_at.error === 'invalid_grant') {
            window.location.href = '/';
            return;
        }
        window.spotify_token = req_at;
        initWebPlaybackSdk(window.spotify_token.access_token);
    }
}

function initWebPlaybackSdk(token: string) {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
        let cb = function(): string {
            return token;
        }
        window.spotify_player = new window.Spotify.Player({
            name: 'Vue',
            getOAuthToken: (cb: (token: string) => void) => {
                //Run code to get a fresh access token
                cb(token);
            },
            //getOAuthToken: cb,
            volume: 0.5
        });

        window.spotify_player.addListener('ready', ({ device_id }:{device_id: any}) => {
            console.log('Ready with Device ID', device_id);
            login_btn.value?.classList.add('hidde');
            player_wrapper.value?.classList.remove('hidde');
        });

        window.spotify_player.addListener('not_ready', ({ device_id }:{device_id: any}) => {
            console.log('Device ID has gone offline', device_id);
        });

        window.spotify_player.addListener('player_state_changed', ((state: any) => {
            if (!state)
                return;
            
            player_is_paused = state.paused;
            if (player_song_name.value && state.track_window.current_track)
                player_song_name.value.innerText = state.track_window.current_track.name;

            if (player_artis.value && state.track_window.current_track) {
                player_artis.value.innerText = '';
                state.track_window.current_track.artists.forEach((e: any, i: Number) => {
                    if (player_artis.value)
                        player_artis.value.innerText = (i === 0) ? e.name : player_artis.value.innerText + ', ' + e.name;
                })
            }
        }));


        window.spotify_player.connect();

    }
}

function playerNextTrack() {
    if (window.spotify_player)
        window.spotify_player.nextTrack();
    else
        console.error('player is not define.');
}

function playerPreviousTrack() {
    if (window.spotify_player)
        window.spotify_player.previousTrack();
    else
        console.error('player is not define.');
}

async function playerPlayPauseTrack() {
    if (window.spotify_player) {
        window.spotify_player.togglePlay();
    }
    else
        console.error('player is not defined');
}

if (!window.spotify_token)
    checkSpotifyAuthorizationCode();
else {
    initWebPlaybackSdk(window.spotify_token.access_token);
}
</script>
<template>
    Spotify
    <button @click="redirectAuthorizedURL" ref="login_btn">Login</button>
    <div class="player hidde" ref="player_wrapper">
        <h3 ref="player_song_name"></h3>
        <span ref="player_artis"></span>
        <div class="player_buttons" ref="player_buttons">
            <button @click="playerPreviousTrack"> Previous </button>
            <button @click="playerPlayPauseTrack">Play/Pause</button>
            <button @click="playerNextTrack"> Next </button>
        </div>
    </div>
</template>
<style scoped>
.hidde {
    display: none;
}
</style>