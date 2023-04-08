<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { gsap } from 'gsap';
import {
    createAuthorizedURL, requestAccessToken, playPausePlayback, skipToNextPlayback, skipToPreviousPlayback,
    getCurrentPlayingTrack, getPlaybackState
} from '../functions/spotifyApi';

import SvgPlayButton from './assets/SvgPlayButton.vue';
import SvgPauseButton from './assets/SvgPauseButton.vue';
import SvgBackButton from './assets/SvgBackButton.vue';
import SvgNextButton from './assets/SvgNextButton.vue';
import SvgOffButton from './assets/SvgOffButton.vue';
import VinilImg from '../assets/vinilo.png';


const player_wrapper = ref<HTMLDivElement | null>(null),
    login_btn = ref<HTMLButtonElement | null>(null),
    logout_btn = ref<HTMLButtonElement | null>(null),
    error_msg = ref<HTMLSpanElement | null>(null),
    player_song_name = ref<HTMLElement | null>(null),
    player_artis = ref<HTMLElement | null>(null),
    player_track_img = ref<HTMLImageElement | null>(null),
    player_img_wrapper = ref<HTMLDivElement | null>(null),
    next_btn = ref<HTMLButtonElement | null>(null),
    play_btn = ref<HTMLButtonElement | null>(null),
    prev_btn = ref<HTMLButtonElement | null>(null),
    play_btn_svg = ref<any>(null),
    pause_btn_svg = ref<any>(null),
    playPauseRequests = {
        requestPending: false,
        lastRequestTimestamp: 0,
        minElapsedTimeAllowed: 1000,
    };



function handleVisibilityChange() {
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
        login_btn.value?.classList.add('hidden');
        logout_btn.value?.classList.remove('hidden');
        player_wrapper.value?.classList.remove('hidden');
        startPrintCurrentPlayingDataLoop();
    }
}

function logout() {
    window.localStorage.removeItem('spotify_token');

    stopPrintingCurrentPlayingDataLoop();

    login_btn.value?.classList.remove('hidden');
    logout_btn.value?.classList.add('hidden');
    player_wrapper.value?.classList.add('hidden');
}

async function playPauseTrack() {
    const current_timestamp = new Date().getTime();
    const elapsed_time_last_request = current_timestamp - playPauseRequests.lastRequestTimestamp;
    if (!playPauseRequests.requestPending && elapsed_time_last_request > playPauseRequests.minElapsedTimeAllowed) {
        console.dir(playPauseRequests);
        console.dir(elapsed_time_last_request);
        playPauseRequests.requestPending = true;
        playPauseRequests.lastRequestTimestamp = new Date().getTime();
        await playPausePlayback(JSON.parse(window.localStorage.spotify_token).access_token);
        playPauseRequests.requestPending = false;
        setTimeout(printCurrentPlayingData, 1000);
    }
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
    printErrorMessage();
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
    if (!window.localStorage.spotify_token) return;

    let token = JSON.parse(window.localStorage.spotify_token).access_token;
    let playback_state_data = await getPlaybackState(token);
    window.spotifyData = window.spotifyData || {};
    window.spotifyData.playbackState = playback_state_data;
}

function printCurrentTrack() {
    if (!window.spotifyData || !window.spotifyData.playbackState) return;

    let track_name = (window.spotifyData.playbackState.error) ? 'N/A' : window.spotifyData.playbackState.item.name
    if (player_song_name.value && player_song_name.value.innerText !== track_name) {
        const tl = gsap.timeline();
        tl.to(player_song_name.value, { opacity: 0, duration: 0, ease: "power3.inOut" });
        tl.call(() => {
            if (player_song_name.value) player_song_name.value.innerText = track_name
        }, undefined, '>');
        tl.to(player_song_name.value, { opacity: 1, duration: 0.5, ease: "power3.inOut" }, '<');
    }
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

    if (player_artis.value && player_artis.value.innerText !== artists) {
        const tl = gsap.timeline();
        tl.to(player_artis.value, { opacity: 0, duration: 0, ease: "power3.inOut"});
        tl.call(() => {
            if (player_artis.value) player_artis.value.innerText = artists
        }, undefined, '>');
        tl.to(player_artis.value, { opacity: 1, duration: 0.5, ease: "power3.inOut" }, '<');
    }
}

function printCurrentTrackImg() {
    if (!window.spotifyData || !window.spotifyData.playbackState) return;

    if (!window.spotifyData.playbackState.error) {
        const current_img = player_img_wrapper.value?.querySelector('img');
        if (!current_img) return;
        if (current_img.src === window.spotifyData.playbackState.item.album.images[1].url) return;

        const new_img = Object.assign(document.createElement('img'), {
            className: 'player-track-img',
            src: window.spotifyData.playbackState.item.album.images[1].url,
            style: 'opacity: 0;',
            alt: 'Current track',
        });
        player_img_wrapper.value?.prepend(new_img);

        const tl = gsap.timeline();
        tl.to(current_img, { opacity: 0, duration: 0.5, ease: "power3.inOut" });
        tl.to(new_img, { opacity: 1, duration: 0.5, ease: "power3.inOut" }, '<');
        tl.call(() => { current_img.remove(); }, undefined, '>');
    }
    else if (player_track_img.value?.getAttribute('src') !== VinilImg)
        player_track_img.value?.setAttribute('src', VinilImg);
}

function printErrorMessage() {
    if (!window.spotifyData || !window.spotifyData.playbackState || !error_msg.value) return;

    if (window.spotifyData.playbackState.error) {
        error_msg.value.innerText = window.spotifyData.playbackState.error.message;
        error_msg.value.classList.remove('hidden');
    }
    else {
        error_msg.value.innerText = '';
        error_msg.value.classList.add('hidden');
    }
}

function setPlayPauseButton() {
    if (!window.spotifyData || !window.spotifyData.playbackState) return;

    if (window.spotifyData.playbackState.is_playing === false) {
        pause_btn_svg.value?.$el.classList.add('hidden');
        play_btn_svg.value?.$el.classList.remove('hidden');
    }
    else {
        play_btn_svg.value?.$el.classList.add('hidden');
        pause_btn_svg.value?.$el.classList.remove('hidden');
    }
}

onMounted(() => {
    if (!window.localStorage.spotify_token)
        checkSpotifyAuthorizationCode();
    else {
        startPrintCurrentPlayingDataLoop();
        document.addEventListener('visibilitychange', handleVisibilityChange);
        login_btn.value?.classList.add('hidden');
        logout_btn.value?.classList.remove('hidden');
        player_wrapper.value?.classList.remove('hidden');
    }
});

</script>


<template>
    <div class="spotify-card">
        <div class="top">
            <img class="spotify-logo" src="../assets/spotify_icon.png" alt="Spotify logo" />
            <span class="error-msg hidden" ref="error_msg">Playback not available or active</span>
            <button class="spotify-logout-btn" @click="logout" ref="logout_btn" aria-label="Logout">
                <SvgOffButton />
            </button>
        </div>
        <button class="spotify-login-btn" @click="redirectAuthorizedURL" ref="login_btn" aria-label="Login">
            Log in
        </button>
        <div class="player hidden" ref="player_wrapper">
            <div class="player_left">
                <h2 class="player-song-name" ref="player_song_name"></h2>
                <span class="player-artist-name" ref="player_artis"></span>
                <div class="player-buttons" ref="player_buttons">
                    <button ref="prev_btn" @click="skipToPreviousTrack" aria-label="Previous song">
                        <SvgBackButton />
                    </button>
                    <button class="play-btn" ref="play_btn" @click="playPauseTrack" aria-label="Play pause song">
                        <SvgPlayButton ref="play_btn_svg" />
                        <SvgPauseButton class="hidden" ref="pause_btn_svg" />
                    </button>
                    <button ref="next_btn" @click="skipToNextTrack" aria-label="Next song">
                        <SvgNextButton />
                    </button>
                </div>
            </div>
            <div ref="player_img_wrapper" class="player-img-wrapper">
                <img src="../assets/vinilo.png" ref="player_track_img" class="player-track-img" alt="Current track"/>
            </div>
        </div>
    </div>
</template>


<style>
.hidden {
    display: none !important;
}

.spotify-card {
    display: flex;
    flex-direction: column;
    font-family: 'Dosis', sans-serif !important;
    background-color: rgb(121, 118, 118);
    width: 450px;
    max-width: 100%;
    min-height: 200px;
    position: relative;
    border-radius: 5px;
    color: #000000;
    border: 1px solid #000000;
    padding: 5px 5px 13px;
}

.spotify-card .top {
    display: flex;
    align-items: center;
    gap: 5px;
}

.spotify-card .bottom {
    display: flex;
    align-items: flex-start;
    margin-top: auto;
}

.spotify-card .spotify-logo {
    width: 30px;
}

.spotify-card .spotify-login-btn {
    all: unset;

    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    background-color: #181818;
    color: white;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 1px;
    padding: 15px 35px;
    border-radius: 50px;
}

.spotify-card .spotify-login-btn:hover {
    background-color: #3d3d3d;
}

.spotify-card .spotify-login-btn:focus {
    outline: #000000 solid 1px;
    outline-offset: 1px;
}

.spotify-card .spotify-logout-btn {
    all: unset;
    margin-left: auto;
    width: 30px;
}

.spotify-card .spotify-logout-btn:focus svg {
    fill: #3d3d3d;
}

.spotify-card .player {
    display: flex;
    align-items: center;
    gap: 40px;
    width: 100%;

    position: relative;
    align-self: center;

    padding: 0 20px;
}

.spotify-card .player_left {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 10px;
    width: 50%;
}

.spotify-card .player-artist-name {
    font-size: 14px;
    font-weight: 700;
}

.spotify-card .player-img-wrapper {
    width: 150px;
    max-width: 100%;
    height: 150px;
    position: relative;
}

.spotify-card .player-track-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: auto;
    max-height: 100%;
    object-fit: cover;
    box-shadow: #000000 0px 0px 5px;
    border-radius: 10px;
}

.spotify-card .player-buttons {
    display: flex;
    flex-direction: row;
    gap: 10px;
}

.spotify-card .player-buttons button {
    background-color: unset;
    border: 0;
}

.spotify-card .play-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 45px;
    background-color: unset;
}

.spotify-card .play-btn svg {
    fill: black !important;
}

@media screen and (max-width: 450px) {
    .spotify-card .player {
        width: 100%;
        gap: 10px;
        flex-direction: column;
    }

    .spotify-card .player_left {
        order: 2;
    }

    .spotify-card .player-img-wrapper {
        order: 1;
    }

    .spotify-card .player_left {
        width: 100%;
    }
}
</style>