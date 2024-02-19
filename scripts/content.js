const CAPTIONS_URL = 'http://127.0.0.1:8000/captions/'
const INTERVAL = 100;

let videoId = getVideoId()
let duration = 0;
let captions = [];
let video = document.getElementsByClassName('video-stream')[0];

getCaptions(videoId);

video.onpause = stopCaptioning

video.onplay = async function () {
    console.log("video played")
    if (getVideoId() !== videoId) {
        videoId = getVideoId()
        console.log("video ID : " + videoId)
        await getCaptions(videoId);
    }
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
    console.log("Sdsds")
    if (video.paused) {
        stopCaptioning();
        return;
    }
    const currentTime = video.currentTime * 1000;
    if (currentTime >= duration) {
        return;
    }
    let caption = findCaptions(captions, currentTime);
    console.log(caption)
    let captionTime = INTERVAL;
    if (caption !== undefined) {
        const nextCaptionIndex = caption['next_caption_index'];
        captionTime = Math.floor(captions[nextCaptionIndex]['start'] - video.currentTime * 1000);
    }
    setTimeout(function () {
        showCaptions();
    }, captionTime)
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
}

function mutateCaption(caption) {
    let captionTiles = document.querySelectorAll(
        '.ytp-caption-segment'
    )
    const lines = caption.split('\\n');
    if (lines.length !== captionTiles.length) {
        return;
    }
    for (const i in lines) {
        console.log(captionTiles[i].innerText)
        console.log(lines[i]);
    }
}