<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
    createAuthorizedURL, requestAccessToken, playPausePlayback, skipToNextPlayback, skipToPreviousPlayback,
    getCurrentPlayingTrack, getPlaybackState
} from '../functions/spotifyApi';

import SvgPlayButton from './Assets/SvgPlayButton.vue';
import SvgPauseButton from './Assets/SvgPauseButton.vue';
import SvgBackButton from './Assets/SvgBackButton.vue';
import SvgNextButton from './Assets/SvgNextButton.vue';


const player_wrapper = ref<HTMLDivElement | null>(null),
    login_btn = ref<HTMLButtonElement | null>(null),
    player_song_name = ref<HTMLElement | null>(null),
    player_artis = ref<HTMLElement | null>(null),
    next_btn = ref<HTMLButtonElement | null>(null),
    play_btn = ref<HTMLButtonElement | null>(null),
    prev_btn = ref<HTMLButtonElement | null>(null),
    play_btn_svg = ref<any>(null),
    pause_btn_svg = ref<any>(null);
let is_paused = true;


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
        window.localStorage.setItem('spotify_token', JSON.stringify(req_at));
        login_btn.value?.classList.add('hidde');
        player_wrapper.value?.classList.remove('hidde');
        printCurrentPlayingData();
    }
}

function playPauseTrack() {
    playPausePlayback(JSON.parse(window.localStorage.spotify_token).access_token);
    is_paused = !is_paused;
    if (is_paused)
        setPlayPauseButton('pause');
    else
        setPlayPauseButton('play');
}

function skipToNextTrack() {
    skipToNextPlayback(JSON.parse(window.localStorage.spotify_token).access_token);
}

function skipToPreviousTrack() {
    skipToPreviousPlayback(JSON.parse(window.localStorage.spotify_token).access_token);
}

function printCurrentPlayingData() {
    let print_int = setInterval(async () => {
        try {
            updatePlaybackStateData();

            let token = JSON.parse(window.localStorage.spotify_token).access_token;
            let v = await getCurrentPlayingTrack(token);
            if (!player_song_name.value)
                return;
            if (v.error)
                console.log(v.error);
            else if (v.item)
                player_song_name.value.innerText = v.item.name;
        } catch (error) {
            console.error(error);
            clearInterval(print_int);
        }
    }, 1000);
}

async function updatePlaybackStateData() {
    let token = JSON.parse(window.localStorage.spotify_token).access_token;
    let playback_state_data = await getPlaybackState(token);
    window.spotifyData = window.spotifyData || {};
    window.spotifyData.playbackState = playback_state_data;
}

function setPlayPauseButton(type: string) {
    if (type === 'play') {
        if (play_btn.value && play_btn_svg.value)
            play_btn.value.innerHTML = play_btn_svg.value.$el.outerHTML;
    }
    else {
        if (play_btn.value && pause_btn_svg.value)
            play_btn.value.innerHTML = pause_btn_svg.value.$el.outerHTML;
    }
}

onMounted(() => {
    if (!window.localStorage.spotify_token)
        checkSpotifyAuthorizationCode();
    else {
        printCurrentPlayingData();
        setPlayPauseButton('play');
        login_btn.value?.classList.add('hidde');
        player_wrapper.value?.classList.remove('hidde');
    }
});

</script>
<template>
    <div class="spotify-card">
        <img class="spotify-logo" src="../assets/spotify_icon.png" />
        <button class="spotify-login-btn" @click="redirectAuthorizedURL" ref="login_btn">Log in</button>
        <div class="player hidde" ref="player_wrapper">
            <h2 class="player-song-name" ref="player_song_name"></h2>
            <span class="player-artist-name" ref="player_artis"></span>
            <div class="player-buttons" ref="player_buttons">
                <button ref="prev_btn" @click="skipToPreviousTrack">
                    <SvgBackButton />
                </button>
                <button class="play-btn" ref="play_btn" @click="playPauseTrack">
                    <SvgPlayButton ref="play_btn_svg" />
                    <SvgPauseButton ref="pause_btn_svg" />
                </button>
                <button ref="next_btn" @click="skipToNextTrack">
                    <SvgNextButton />
                </button>
            </div>
        </div>
    </div>
</template>
<style scoped>
.hidde {
    display: none !important;
}

.spotify-card {
    font-family: 'Dosis', sans-serif !important;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(121, 118, 118);
    width: 500px;
    min-height: 200px;
    position: relative;
    border-radius: 5px;
    color: #000000;
}

.spotify-logo {
    width: 30px;
    position: absolute;
    top: 5px;
    left: 5px;
}

.spotify-login-btn {
    all: unset;

    background-color: #181818;
    color: white;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 1px;
    padding: 15px 35px;
    border-radius: 50px;
}

.spotify-login-btn:hover {
    background-color: #3d3d3d;
}

.spotify-login-btn:focus {
    outline: #000000 solid 1px;
    outline-offset: 1px;
}

.player {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.player-artist-name {
    font-size: 14px;
}

.player-buttons {
    display: flex;
    flex-direction: row;
    gap: 10px;
}

.player-buttons button {
    background-color: unset;
    border: 0;
}

.play-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    background-color: unset;
}

.play-btn svg {
    fill: black !important;
}
</style>