const CAPTIONS_URL = 'http://127.0.0.1:8000/captions/'
let videoId = getVideoId()
let duration = 0;
let captions = [];
let video = document.getElementsByClassName('video-stream')[0];
let counter = 0
let intervalId = undefined;
const interval = 1000;

getCaptions(videoId);

video.onpause = stopCaptioning

video.onplay = async function () {
    console.log("video played")
    if (getVideoId() !== videoId) {
        videoId = getVideoId()
        console.log("video ID : " + videoId)
        await getCaptions(videoId);
        return;
    }
    showCaptions();
}

function findCaptions(arr, currentTime) {
    let start = 0;
    let end = arr.length - 1;

    while (start <= end) {
        let mid = Math.floor((start + end) / 2);
        let caption = arr[mid]
        if (currentTime >= caption['start'] && currentTime < caption['end']) {
            return caption;
        } else if (caption['end'] < currentTime) {
            start = mid + 1;
        } else {
            end = mid - 1;
        }
    }

    return undefined;
}

function showCaptions() {
    if (!captions.length) {
        return;
    }
    counter = video.currentTime * 1000
    intervalId = setInterval(() => {
        counter += interval;
        if (counter >= duration) {
            stopCaptioning()
        }
        let currentTime = video.currentTime * 1000;
        let caption = findCaptions(captions, currentTime);
        if (caption !== undefined) {
            console.log(caption)
        }
    }, interval)
}


function getVideoId() {
    return (new URLSearchParams(window.location.search)).get('v');
}

async function getCaptions(videoId) {
    await fetch(CAPTIONS_URL + videoId)
        .then(response => {
            if (!response.ok) {
                stopCaptioning();
                return response.text().then(text => {
                    console.error('Error:', text);
                    throw new Error(text)
                })
            }
            console.log("transcript captured")
            return response.json();
        })
        .then(data => {
            duration = data.duration;
            captions = data.transcript;
            showCaptions()
        })
        .catch(error => {
            stopCaptioning();
            console.error('Error:', error);
            throw new Error(error)
        });
}

function stopCaptioning() {
    if (intervalId === undefined) {
        return;
    }

    duration = 0;
    captions = [];
    clearInterval(intervalId)
}

