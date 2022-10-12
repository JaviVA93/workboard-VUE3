<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
    createAuthorizedURL, requestAccessToken, playPausePlayback, skipToNextPlayback, skipToPreviousPlayback,
    getCurrentPlayingTrack, getPlaybackState
} from '../functions/spotifyApi';

import SvgPlayButton from './assets/SvgPlayButton.vue';
import SvgPauseButton from './assets/SvgPauseButton.vue';
import SvgBackButton from './assets/SvgBackButton.vue';
import SvgNextButton from './assets/SvgNextButton.vue';
import VinilImg from '../assets/vinilo.png';


const player_wrapper = ref<HTMLDivElement | null>(null),
    login_btn = ref<HTMLButtonElement | null>(null),
    player_song_name = ref<HTMLElement | null>(null),
    player_artis = ref<HTMLElement | null>(null),
    player_track_img = ref<HTMLImageElement | null>(null),
    next_btn = ref<HTMLButtonElement | null>(null),
    play_btn = ref<HTMLButtonElement | null>(null),
    prev_btn = ref<HTMLButtonElement | null>(null),
    play_btn_svg = ref<any>(null),
    pause_btn_svg = ref<any>(null);
let is_paused = true;

function hadleVisibilityChange() {
    if (document.visibilityState === "hidden")
        stopPrintingCurrentPlayingDataLoop();
    else
        startPrintCurrentPlayingDataLoop();
}

async function redirectAuthorizedURL() {
    let [authorize_url, rand_state] = await createAuthorizedURL();
    window.localStorage.spotify_auth_code_verifier = rand_state;
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
        startPrintCurrentPlayingDataLoop();
    }
}

async function playPauseTrack() {
    await playPausePlayback(JSON.parse(window.localStorage.spotify_token).access_token);
    setTimeout(printCurrentPlayingData, 1000);
}

async function skipToNextTrack() {
    await skipToNextPlayback(JSON.parse(window.localStorage.spotify_token).access_token);
    setTimeout(printCurrentPlayingData, 1000);
}

async function skipToPreviousTrack() {
    await skipToPreviousPlayback(JSON.parse(window.localStorage.spotify_token).access_token);
    setTimeout(printCurrentPlayingData, 1000);
}

async function printCurrentPlayingData() {
    await updatePlaybackStateData();

    printCurrentTrack();
    printCurrentArtist();
    printCurrentTrackImg();

    setPlayPauseButton();
}

function startPrintCurrentPlayingDataLoop() {
    window.spotifyData = window.spotifyData || {};
    
    if (window.spotifyData.dataPrinterLoop)
        delete window.spotifyData.dataPrinterLoop;

    window.spotifyData.printerLoopFlag = false;

    window.spotifyData.dataPrinterLoop = async () => {
        try {
            await printCurrentPlayingData();

            if (window.spotifyData.printerLoopFlag !== true)
                setTimeout(window.spotifyData.dataPrinterLoop, 5000);
        } catch (error) {
            console.error(error);
        }
    };
    window.spotifyData.dataPrinterLoop();
}

function stopPrintingCurrentPlayingDataLoop() {
    if (window.spotifyData)
        window.spotifyData.printerLoopFlag = true;
}

async function updatePlaybackStateData() {
    let token = JSON.parse(window.localStorage.spotify_token).access_token;
    let playback_state_data = await getPlaybackState(token);
    window.spotifyData = window.spotifyData || {};
    window.spotifyData.playbackState = playback_state_data;
}

function printCurrentTrack() {
    if (!window.spotifyData || !window.spotifyData.playbackState) return;

    let track_name = (window.spotifyData.playbackState.error) ? 'N/A' : window.spotifyData.playbackState.item.name
    if (player_song_name.value)
        player_song_name.value.innerText = track_name;
}

function printCurrentArtist() {
    if (!window.spotifyData || !window.spotifyData.playbackState) return;

    let artists = '';
    if (window.spotifyData.playbackState.error)
        artists = 'N/A';
    else
        window.spotifyData.playbackState.item.artists.forEach((a: any, i: number) => {
            artists = (i === 0) ? a.name : `${artists}, ${a.name}`;
        });
    if (player_artis.value)
        player_artis.value.innerText = artists;
}

function printCurrentTrackImg() {
    if (!window.spotifyData || !window.spotifyData.playbackState) return;

    if (!window.spotifyData.playbackState.error)
        player_track_img.value?.setAttribute('src', window.spotifyData.playbackState.item.album.images[1].url);
    else if (player_track_img.value?.getAttribute('src') !== VinilImg)
        player_track_img.value?.setAttribute('src', VinilImg);
}

function setPlayPauseButton() {
    if (!window.spotifyData || !window.spotifyData.playbackState) return;

    if (window.spotifyData.playbackState.is_playing === false) {
        pause_btn_svg.value?.$el.classList.add('hidde');
        play_btn_svg.value?.$el.classList.remove('hidde');
    }
    else {
        play_btn_svg.value?.$el.classList.add('hidde');
        pause_btn_svg.value?.$el.classList.remove('hidde');
    }
}

onMounted(() => {
    if (!window.localStorage.spotify_token)
        checkSpotifyAuthorizationCode();
    else {
        startPrintCurrentPlayingDataLoop();
        document.addEventListener('visibilitychange', hadleVisibilityChange);
        login_btn.value?.classList.add('hidde');
        player_wrapper.value?.classList.remove('hidde');
    }
});

</script>


<template>
    <div class="spotify-card">
        <img class="spotify-logo" src="../assets/spotify_icon.png" alt="Spotify logo"/>
        <button class="spotify-login-btn" @click="redirectAuthorizedURL" ref="login_btn">Log in</button>
        <div class="player hidde" ref="player_wrapper">
            <div class="player_left">
                <h2 class="player-song-name" ref="player_song_name"></h2>
                <span class="player-artist-name" ref="player_artis"></span>
                <div class="player-buttons" ref="player_buttons">
                    <button ref="prev_btn" @click="skipToPreviousTrack">
                        <SvgBackButton />
                    </button>
                    <button class="play-btn" ref="play_btn" @click="playPauseTrack">
                        <SvgPlayButton ref="play_btn_svg" />
                        <SvgPauseButton class="hidde" ref="pause_btn_svg" />
                    </button>
                    <button ref="next_btn" @click="skipToNextTrack">
                        <SvgNextButton />
                    </button>
                </div>
            </div>
            <img src="../assets/vinilo.png" ref="player_track_img" class="player-track-img" />
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
    border: 1px solid #000000;
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
    align-items: center;
    margin-left: 40px;
    width: 100%;
}

.player_left {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 10px;
    width: 50%;
}

.player-artist-name {
    font-size: 14px;
    font-weight: 700;
}

.player-track-img {
    width: 150px;
    height: auto;
    margin-left: auto;
    margin-right: 50px;
    box-shadow: #000000 0px 0px 5px;
    border-radius: 10px;
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
    width: 45px;
    background-color: unset;
}

.play-btn svg {
    fill: black !important;
}
</style>