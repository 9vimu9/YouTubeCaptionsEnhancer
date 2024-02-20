const CAPTIONS_URL = 'http://127.0.0.1:8000/captions/'
const INTERVAL = 5;

let videoId = getVideoId()
let duration = 0;
let captions = [];
let video = document.getElementsByClassName('video-stream')[0];
let nextCaptionIndex = undefined;
let timeoutId = undefined;
let caption = undefined;

getCaptions(videoId);


video.onplay = async function () {
    console.log("video played")
    nextCaptionIndex = undefined;
    clearTimeout(timeoutId)
    if (getVideoId() !== videoId) {
        videoId = getVideoId()
        video = document.getElementsByClassName('video-stream')[0];
        console.log("video ID : " + videoId)
        await getCaptions(videoId);
    } else {
        showCaptions();
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
    if (captions === undefined || !captions.length) {
        return;
    }
    if (video.paused) {
        return;
    }
    const currentTime = video.currentTime * 1000;
    if (currentTime >= duration) {
        return;
    }
    if (caption === undefined) {
        if (nextCaptionIndex) {
            caption = captions[nextCaptionIndex];
        } else {
            caption = findCaptions(captions, currentTime);
        }
    }

    let captionTime = INTERVAL;
    let captionTiles = document.querySelectorAll(
        '.ytp-caption-segment'
    );
    if (caption !== undefined && captionTiles.length) {
        mutateCaption(caption['text'], captionTiles)
        nextCaptionIndex = caption['next_caption_index'];
        let nextStartTime;
        if (nextCaptionIndex === null) {
            nextStartTime = caption['end']
        } else {
            nextStartTime = captions[nextCaptionIndex]['start'];
        }
        captionTime = Math.floor(nextStartTime - video.currentTime * 1000);
        caption = undefined;
    }
    timeoutId = setTimeout(function () {
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
                return response.text().then(text => {
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
            duration = undefined;
            captions = undefined;
            console.error('Error:', error);
        });
}

function mutateCaption(caption, captionTiles) {
    const lines = caption.split('\n');
    const lineLengths = lines.map(function (line) {
        return line.length;
    })
    const innerTextLengths = Array.from(captionTiles).map(function (captionTile) {
        return captionTile.innerText.length;
    });

    const innerTextMaxChars = Math.max(...innerTextLengths);
    const lineMaxChars = Math.max(...lineLengths);

    let subtitlePanel = document.querySelector(
        '.caption-window.ytp-caption-window-bottom'
    );
    subtitlePanel.style.width = calculateWidth(
        innerTextMaxChars,
        lineMaxChars,
        parseInt(subtitlePanel.style.width, 10)
    ) + 'px';
    for (const i in lines) {
        captionTiles[i].innerText = lines[i];
    }
}

function calculateWidth(innerTextLength, newTextLength, currentWidth) {
    return (currentWidth / innerTextLength) * newTextLength + 10
}