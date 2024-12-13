console.log("let start javascript");
let currentSong = new Audio;
let songs;
let currfolder;

// Get the current port number
const portNumber = window.location.port;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:${portNumber}/${currfolder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];

    // Check if the port number is present
    if (portNumber) {
        console.log(`The port number is: ${portNumber}`);
    } else {
        console.log("No port number is specified in the URL.");
    }


    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currfolder}/`)[1]);
        }

    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>GOPAL CHAUHAN</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
                        </li>`
    }
    // Attach the event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    if (songs.length == 0) {
        console.log(songs);
        document.querySelector(".playbar").style.display = "none";
        let no_song = document.querySelector(".songlist");
        no_song.innerHTML = `<h1>There is no song please enter some song</h1>`
        console.log(no_song);
    }
    else {
        document.querySelector(".playbar").removeAttribute("style");
    }

    return songs;
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/music/" + track);
    currentSong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

}

async function displayalbum() {
    console.log("displaying ablums");

    let a = await fetch(`http://127.0.0.1:${portNumber}/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]

            // get the meta data of the folder
            let a = await fetch(`http://127.0.0.1:${portNumber}/songs/${folder}/info.json`);
            let response = await a.json();

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                                                                      <div  class="play">
                                                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                                              xmlns="http://www.w3.org/2000/svg">
                                                                              <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                                                                  stroke-linejoin="round" />
                                                                          </svg>
                                                                      </div>
                                                                      <img src="/songs/${folder}/cover.jpg" alt="" srcset="">
                                                                      <h2>${response.title}</h2>
                                                                      <p>${response.description}</p>
                                                                  </div>`
        }
    }

    // load the playlist whwn ever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })

    })


}

async function main() {

    // Get the list of all songs
    await getSongs("songs/ncs");
    playMusic(songs[0], true)

    // display all album on the page
    displayalbum();

    //Attach the event listener to next,play & pervious
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    })

    // listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / 
    ${secondsToMinutesSeconds(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    }
    )

    // add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;

    })

    // add an event listener to close buttons
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";

    })

    //add an event listener to pervious 
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    //add an event listener to next 
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",
        (e) => {
            // console.log("setting volume to ", e.target.value, "/100");
            currentSong.volume = (parseInt(e.target.value)) / 100;
            if (document.querySelector(".volume>img").src.includes("mute.svg")) {

                document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
            }
        }
    )

    //add an event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            currentSong.volume = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
            currentSong.volume = 0.1;
        }
    })


}

main()


