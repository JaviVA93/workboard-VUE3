<script setup lang="ts">
import { ref } from 'vue';
import {
    createAuthorizedURL, requestAccessToken, playPausePlayback, skipToNextPlayback, skipToPreviousPlayback,
    getCurrentPlayingTrack
} from '../functions/spotifyApi';
import spotify_icon from '../assets/spotify_icon.png';


const player_wrapper = ref<HTMLDivElement | null>(null),
    login_btn = ref<HTMLButtonElement | null>(null),
    player_song_name = ref<HTMLElement | null>(null),
    player_artis = ref<HTMLElement | null>(null);

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
        login_btn.value?.classList.add('hidde');
        player_wrapper.value?.classList.remove('hidde');
        printCurrentPlayingTrack();
    }
}

function playPauseTrack() {
    playPausePlayback(window.spotify_token.access_token);
}

function skipToNextTrack() {
    skipToNextPlayback(window.spotify_token.access_token);
}

function skipToPreviousTrack() {
    skipToPreviousPlayback(window.spotify_token.access_token);
}

function printCurrentPlayingTrack() {
    let print_int = setInterval(async () => {
        try {
            let v = await getCurrentPlayingTrack(window.spotify_token.access_token)
            if (!player_song_name.value)
                return;

            if (v.error)
                console.log(v.error);
            else if (v.item)
                player_song_name.value.innerText = v.item.name;
        } catch (error) {
            clearInterval(print_int);
        }
    }, 1000);
}

if (!window.spotify_token)
    checkSpotifyAuthorizationCode();

</script>
<template>
    <div class="spotify-card">
        <img class="spotify-logo" src="../assets/spotify_icon.png" />
        <button class="spotify-login-btn" @click="redirectAuthorizedURL" ref="login_btn">Login</button>
        <div class="player hidde" ref="player_wrapper">
            <h3 ref="player_song_name"></h3>
            <span ref="player_artis"></span>
            <div class="player_buttons" ref="player_buttons">
                <button @click="skipToPreviousTrack"> Prev </button>
                <button @click="playPauseTrack">Play / Pause</button>
                <button @click="skipToNextTrack"> Next </button>
            </div>
        </div>
    </div>
</template>
<style scoped>
.hidde {
    display: none;
}

.spotify-card {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(121, 118, 118);
    width: 500px;
    min-height: 100px;
    position: relative;
    border-radius: 5px;
}

.spotify-logo {
    width: 30px;
    position: absolute;
    top: 0;
    left: 0;
}

.spotify-login-btn {

}
</style>