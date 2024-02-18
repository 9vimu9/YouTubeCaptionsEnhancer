const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('v');

const apiUrl = 'http://127.0.0.1:8000/captions/' + videoId;
let duration = 0;
let captions = [];
let video = document.getElementsByClassName('video-stream')[0];
let counter = 0
let intervalId = 0;
const interval = 1000;

fetch(apiUrl,)
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text)
            })
        }
        return response.json();
    })
    .then(data => {
        duration = data.duration;
        captions = data.transcript;

        video.onpause = function () {
            clearInterval(intervalId)
        }

        video.onplay = function () {
            counter = video.currentTime * 1000
            intervalId = setInterval(() => {
                counter += interval;
                if (counter >= duration) {
                    clearInterval(intervalId)
                }
                let currentTime = video.currentTime * 1000;
                let caption = findCaption(captions, currentTime);
                if (caption !== undefined) {
                    // console.log(caption)
                }
            }, interval)
        }

    })
    .catch(error => {
        console.error('Error:', error);
    });

let findCaption = function (arr, currentTime) {
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