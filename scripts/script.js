// Add to song to play list
const fileInput = document.getElementById('sound-file');

// define a playlist use linkedlist to store
const songs = new LinkedList;
let currentSong = songs.head;
let currentIndexSong;

const $ = document.querySelector.bind(document);
const playlist = $('#play-list');

const audioPlayer = document.getElementById('audio-player');

//Control button
const backwardStep = document.getElementById('backward-step');
const backward = document.getElementById('backward');
const forward = document.getElementById('forward');
const forwardStep = document.getElementById('forward-step');
const play = document.getElementById('play');
const shuffle = document.getElementById('shuffle');
const loop = document.getElementById('loop');
const isLoopedSpan = document.querySelector(".is-looped");

// check if song is playing
let isPlaying = true;
let isStarted = false;

// retroCD
const retroCD = document.getElementById("spinCD");

fileInput.addEventListener('change', function(){
    const files = Array.from(fileInput.files);
    files.forEach((file)=>{
        songs.addTail(file);
    })

    render();
    
    if(songs.head != null && isStarted===false){
        updateCurrentSong(songs.head, 1);
        playSelectedSong(currentSong.data);
        isStarted=true;
    }

    this.value = '';

    if(themeSwitcher.checked){
        applyColorToSelectors('#fff');
    }
});

function updateCurrentSong(current, index){
    currentSong = current,
    currentIndexSong = index;
    selectedSongModify(currentIndexSong);
    const currentSongName = document.querySelector('.current-song-name');
    currentSongName.textContent = currentSong.data.name;
}

let playlistItems = document.querySelectorAll('.play-list-item');

playlist.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-item')) {
        const listItem = event.target.closest('li');
        const index = parseInt(listItem.getAttribute('data-index'));
        if(songs.head!==songs.tail){
            if(currentIndexSong === playlistItems.length && index === playlistItems.length){
                updateCurrentSong(songs.getNode(index-1), index-1);
                playSelectedSong(currentSong.data);
            }
            else if(index === currentIndexSong){
                updateCurrentSong(currentSong.next, index);
                playSelectedSong(currentSong.data);
            }
            else if(index < currentIndexSong){
                currentIndexSong -= 1;    
            }
            songs.removeIndex(index);
            
        }else{
            // songs.removeIndex(index);
            // updateCurrentSong(songs.head, 1);
            // audioPlayer.src = '';
            // audioPlayer.pause();
            // toggleControlButtons();
            location.reload();
        }
        render();
    }
    dragAndDrop();
});

const clearBtn = document.querySelector('.clear-list');
clearBtn.addEventListener('click', ()=>{
    if(songs.head !== null){
        if(confirm("Are you sure you want to clear the playlist?")){
            songs.clearList();
            location.reload();
        }
    }
})

function toggleControlButtons() {
    const controlButtons = [backwardStep, backward, forward, forwardStep, play, shuffle, loop];
    if (songs.head ===null) {
        controlButtons.forEach(button => {
            button.disabled = true;
        });
    } else {
        controlButtons.forEach(button => {
            button.disabled = false;
        });
    }
}

toggleControlButtons();

function render(){
    createPlayList();
    //event when click to each playlist item
    playlistItems = document.querySelectorAll('.play-list-item');
    playlistItems.forEach(item => {
        item.firstChild.nextSibling.addEventListener('click', () => {
            const index = parseInt(item.getAttribute('data-index'));
            const selectedSong = songs.getNode(index);
            if(selectedSong !== currentSong){
                updateCurrentSong(selectedSong, index);
                playSelectedSong(currentSong.data);
            }
        });
    });
};

// Check if mouse dragging 
let isMouseDragging = false;

function dragAndDrop(){
    playlistItems.forEach(item => {
        item.setAttribute('draggable',true);
        item.addEventListener('dragstart', function(e){
            isMouseDragging = true;
            e.dataTransfer.setData('text/plain', this.getAttribute('data-index'));
        })

        item.addEventListener('dragover', function(e){
            e.preventDefault();
        })

        item.addEventListener('drop', function(e){
            e.preventDefault();
            if(isMouseDragging){
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                const toIndex = parseInt(this.getAttribute('data-index', 10));
                songs.changePosition(fromIndex, toIndex)
                if(fromIndex === currentIndexSong){
                    currentIndexSong = toIndex;
                }
                else if(currentIndexSong < fromIndex && currentIndexSong >= toIndex){
                    currentIndexSong++;
                }
                else if(currentIndexSong > fromIndex && currentIndexSong <= toIndex){
                    currentIndexSong--;
                }
                selectedSongModify(currentIndexSong);
                createPlayList();
                render()
            }
            isMouseDragging = false;
        })
    })
}

function createPlayList(){
    const listSongName = new Array;
    let index = 1;
    songs.forEach((song)=>{
        listSongName.push({name: song.name, index: index++});
    })
    
    const htmls = listSongName.map(item=>{
        return `
                <li class="play-list-item" data-index = "${item.index}">
                    <span class="song-name">
                        ${item.name}
                    </span>
                    <i class="fa-solid fa-trash-can remove-item"></i>
                </li>
        `
    })
    playlist.innerHTML = htmls.join('\n');
    selectedSongModify(currentIndexSong);
    toggleControlButtons();
    if(themeSwitcher.checked){
        applyColorToSelectors('#fff');
    }
}

function selectedSongModify(index){
    const playlistItems = document.querySelectorAll('.play-list-item');
    // Remove bold class from all items
    playlistItems.forEach(item => {
                item.firstChild.nextSibling.classList.remove('selected-song');
    });

    // Add bold class to the clicked item
    playlistItems.item(index-1).firstChild.nextSibling.classList.add('selected-song');
}


function playSelectedSong(file) {
    audioPlayer.src = URL.createObjectURL(file);
    audioPlayer.load();
    audioPlayer.play();
    toggleRotation()
};

function playNextSong(){
    if(currentSong.next!==null){
        updateCurrentSong(currentSong.next, currentIndexSong+1);
        playSelectedSong(currentSong.data);
    }
}

function playPrevSong(){
    if(currentSong !== songs.head){
        let song = songs.head;
        while(song.next !== currentSong){
            song = song.next;
        }
        updateCurrentSong(song, currentIndexSong-1);
        playSelectedSong(currentSong.data);
    }
} 

backward.addEventListener('click', ()=>{
    audioPlayer.currentTime -= 5;
});

forward.addEventListener('click', ()=>{
    audioPlayer.currentTime += 5;
});

forwardStep.addEventListener('click', ()=>{
    playNextSong();
});

backwardStep.addEventListener('click',()=>{
    playPrevSong();
});

play.addEventListener('click', ()=>{
    if(audioPlayer.paused){
        audioPlayer.play();
        play.innerHTML = `<i class="fa-solid fa-pause play-btn-icon"></i>`;
        isPlaying = false;
    }else{
        audioPlayer.pause();
        play.innerHTML = `<i class="fa-solid fa-play play-btn-icon"></i>`;
        isPlaying = true;
    }
    toggleRotation();
});

shuffle.addEventListener('click', ()=>{
    songs.shuffle();
    updateCurrentSong(songs.head, 1);
    render();
    playSelectedSong(currentSong.data);
});

let isLooped = false;

loop.addEventListener("click", function() {
    if (!isLooped) {
        audioPlayer.loop = true;
        isLooped = true;
        isLoopedSpan.style.display = "block";
    } else {
        audioPlayer.loop = false;
        isLooped = false;
        isLoopedSpan.style.display = "none";
    }
});

audioPlayer.addEventListener('play', ()=>{
    play.innerHTML = '<i class="fa-solid fa-pause play-btn-icon"></i>';
    isPlaying = true;
    toggleRotation()
})

audioPlayer.addEventListener('pause', ()=>{
    play.innerHTML = '<i class="fa-solid fa-play play-btn-icon"></i>';
    isPlaying = false;
    toggleRotation()
})

audioPlayer.addEventListener('ended', ()=>{
    if(currentSong !== songs.tail){
        updateCurrentSong(currentSong.next, currentIndexSong+1);
        playSelectedSong(currentSong.data);
    }
})

let rotationDegree = 0;
let rotationInterval = null;

function toggleRotation() {
    if (audioPlayer.paused) {
        clearInterval(rotationInterval);
        rotationInterval = null;
    } else {
        if (!rotationInterval) {
            retroCD.style.transition = "transform 2s linear";
            rotationInterval = setInterval(() => {
                rotationDegree += 5;
                retroCD.style.transform = `rotate(${rotationDegree}deg)`;
            }, 100);
        }
    }
}

// Share to social media 
const shareBtn = document.querySelector(".share-btn");

shareBtn.addEventListener('click', async()=>{
    try{
        await navigator.share({
            title: document.title, 
            text:'Listen your playlist',
            url: window.location.href,
        });
        console.log('Sharing was successful');
    }
    catch(err){
        console.error('Could not share', err);
    }
});

//SWITCH THEME
const themeSwitcher = document.getElementById('theme-switcher');
const appBackground = document. querySelector('.container');
const imgUrlDark = '../assets/imgs/Dark-theme-background.jpg';
const imgUrlLight = '../assets/imgs/Background.png'
const playerContainer = document.querySelector('.player-container');
const playlistContainer = document.querySelector('.playlist-container');
const themeLightIcon = document.querySelector('.theme-light-icon');
const themeDarkIcon = document.querySelector('.theme-dark-icon');

themeSwitcher.addEventListener('change', () => {
    if (themeSwitcher.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        appBackground.style.backgroundImage = `url(${imgUrlDark})`;
        applyColorToSelectors('#fff');
        playerContainer.style.backgroundColor = 'var(--dark-theme-color)';
        playlistContainer.style.backgroundColor = 'var(--dark-theme-color)';
        themeLightIcon.classList.add('theme-hide-icon');
        themeDarkIcon.classList.remove('theme-hide-icon');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        appBackground.style.backgroundImage = `url(${imgUrlLight})`;
        applyColorToSelectors('#333');
        playerContainer.style.backgroundColor = 'var(--light-theme-color)';
        playlistContainer.style.backgroundColor = 'var(--light-theme-color)';
        themeLightIcon.classList.remove('theme-hide-icon');
        themeDarkIcon.classList.add('theme-hide-icon');
    }
});

function applyColorToSelectors(color) {
    const selectors = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, li, i');
    selectors.forEach(selector => {
        selector.style.color = color;
        
        selector.addEventListener('mouseover', ()=>{
            if(selector.classList.contains("control-btn-icon")){
                selector.style.color = '#00ffff';
            }

            else if(selector.classList.contains("share-btn")){
                selector.style.color = '#00ffff';
            }

            else if(selector.classList.contains("clear-list")){
                selector.style.color = 'rgb(255, 57, 57)';
            }

            else if(selector.classList.contains("remove-item")){
                selector.style.color = 'rgb(255, 57, 57)';
            }
        });
        selector.addEventListener('mouseout', ()=>{
            selector.style.color = color;
        });

        if(selector.classList.contains("play-btn-icon")){
            selector.style.color =  '#000';
        }
    });
}

// Manage Timeline and timeprogress
const progressLine = document.querySelector('.timeline-process');
const timeline = document.querySelector('.timeline');
const currentTime = document.querySelector('.current-time');
const remainTime = document.querySelector('.remaining-time');

audioPlayer.addEventListener('timeupdate', updateTime);

function updateTime() {
  const duration = audioPlayer.duration;
  const current = audioPlayer.currentTime;
//   const remaining = duration - current;
  const progressWidth = (current / duration) * timeline.clientWidth;
  progressLine.style.width = `${progressWidth}px`;
  currentTime.textContent = formatTime(current);
  remainTime.textContent = formatTime(duration);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

timeline.addEventListener('click', function(event) {
  const timelineWidth = timeline.clientWidth;
  const clickX = event.offsetX;
  const duration = audioPlayer.duration;
  const newPosition = (clickX / timelineWidth) * duration;
  audioPlayer.currentTime = newPosition;
});

// Manage Speed
const speedSlider = document.getElementById('speed-slider');
const speedLabel = document.getElementById('speed-label');

speedSlider.addEventListener('input', updateSpeed);

function updateSpeed() {
  const speed = speedSlider.value;
  audioPlayer.playbackRate = speed;
  speedLabel.textContent = `${speed}x`;
}

// Manage volume
const volumeSlider = document.getElementById('volume-slider');
const volumeLabel = document.getElementById('volume-label');

volumeSlider.addEventListener('input', updateVolume);

function updateVolume() {
  const volume = volumeSlider.value;
  audioPlayer.volume = volume;
  volumeLabel.textContent = `${volume * 100}%`;
}