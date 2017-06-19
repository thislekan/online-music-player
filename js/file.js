// To display track info in music-player box
const statusPrompt = document.getElementById("status-prompt");
const trackInfo = document.getElementById("track-info");
const trackDuration = document.getElementById("track-duration");
const progressBar = document.getElementById("progress-bar");
const box = document.getElementById("box");
const trackProgress = document.getElementById("track-progress");
const colorProgress = document.getElementById("color-progress");

// for controlling playlist (Buttons designed to have different UI)
const shuffleTrack = document.getElementById("shuffle");
const prev = document.getElementById("prev");
const playTrack = document.getElementById("play");
const pause = document.getElementById("pause");
const next = document.getElementById("next");
const repeat = document.getElementById("repeat");
const volumeButton = document.getElementById("volume-popup");
const progressButton = document.getElementById("progress-button");
const forSeeking = document.getElementById("for-seeking");
const volumeControl = document.getElementById("volume-control");
const volumeText = document.getElementById("vc");
const volumeProgress = document.getElementById("volume-progress");
const listToggler = document.getElementById("list-toggler");

// for background manipulation
let topLayer = document.getElementById("topmost-layer");
let list = document.getElementById("track-listing");

// setting event listener to each track in the tracklist UI
let track1 = document.getElementById("track1");
let track2 = document.getElementById("track2");
let track3 = document.getElementById("track3");
let track4 = document.getElementById("track4");
let track5 = document.getElementById("track5");
let track6 = document.getElementById("track6");
let track7 = document.getElementById("track7");
let track8 = document.getElementById("track8");
let track9 = document.getElementById("track9");
let track10 = document.getElementById("track10");

let Player = function(playlist){
  this.playlist = playlist;
  this.index = 0;
}
Player.prototype = {
  // Plays songs in the playlist.
  play: function (index) {
    let self = this;
    let song;

    index = typeof index === "number" ? index : self.index;
    let track = self.playlist[index];

    //if track's already loaded, use current track.
    // else, setup and load new howl
    if (track.howl){
      song = track.howl;
    }else {
      song = track.howl = new Howl({
        src: [track.url],
        html5: true,
        onplay: function () {
          trackInfo.innerHTML = playlist.tracks[index].title + " - " + playlist.tracks[index].artist.name;
          trackDuration.innerHTML = self.formatTime(Math.round(song.duration()));
          box.style.backgroundImage = "url(" + playlist.tracks[index].album.thumbnail + ")";
          statusPrompt.innerHTML = "";
          requestAnimationFrame(self.step.bind(self));
        },
        onload: function(){
          statusPrompt.innerHTML = "Loading..."
        },
        onend: function(){
          setTimeout(function () {
            self.skip("next");
          }, 2000);
        },
        onpause: function(){
          statusPrompt.innerHTML = "Paused. Press play to continue.";
          trackInfo.innerHTML = "";
        }
      });
    }
    // music starts
    song.play();
    // keeoing track of the current song's index
    self.index = index;
  },

  // Pauses the current playing track
  pause: function(){
    let self = this;
    // get the howl/song to be manipulated
    let song = self.playlist[self.index].howl;
    // pauses the song
    song.pause();
  },
  // skip functionality, for next or previous button.
  skip: function(direction){
    let self = this;
    let index = 0;
    // skips song according to button clicked (prev or next)
    if (direction === "prev") {
      index = self.index - 1;
      if (index < 0) {
        index = self.playlist.length - 1;
      }
    }else {
      index = self.index + 1;
      if (index >= self.playlist.length) {
        index = 0;
      }
    }
    self.skipTo(index);
  },
  // shuffles the playlist
  shuffle: function() {
    let self = this;
    let index = Math.floor(Math.random() * self.playlist.length);
    let presentTrack = self.playlist[self.index].howl;
    if (presentTrack.playing()) {
      presentTrack.stop();
    }
    self.play(index);
  },
  // skips to a specific track based on the index
  skipTo: function(index){
    let self = this;

    if (self.playlist[self.index].howl) {
      self.playlist[self.index].howl.stop();
    }
    // plays the tracked being skipped to
    self.play(index);
  },
  // repeats the current song
  repeat: function() {
    let self = this;
    let currentSong = self.playlist[self.index].howl;
    let seek = Math.round(currentSong.seek());
    let songDuration = currentSong.duration();
    let presentTime = Math.round(currentSong.seek());
    time = Math.floor((songDuration * 1000) - (presentTime * 1000));
    statusPrompt.innerHTML = "On Repeat";
    if (currentSong.playing()) {
      setTimeout(function () {
        currentSong.stop();
        currentSong.play();
      }, time - 3000);
    }
  },
  // controls the volume of the music-player
  volume: function(realX){
    let self = this;
    currentSong = self.playlist[self.index].howl;
    Howler.volume(realX);
  },
  // styles the appearance of the volume control and actual volume of the player
  volumeButton: function(){
    volumeControl.style.opacity = 1;
    volumeText.style.opacity = 1;
    volumeProgress.style.opacity = 1;

    setTimeout(function () {
      volumeControl.style.opacity = 0;
      volumeText.style.opacity = 0;
      volumeProgress.style.opacity = 0;
    }, 5000);
  },
  // for seeking a particular time in current rack if desired, also while it's playing.
  seek: function(per){
    let self = this;
    let currentSong = self.playlist[self.index].howl;
    // converts the percentage into a seek position
    if (currentSong.playing()) {
      currentSong.seek(currentSong.duration() * per);
    }
  },
  // for updating track progress
  step: function(){
    let self = this;
    // get the current track being played
    let currentSong = self.playlist[self.index].howl;
    // determine the current position (in seconds) of the track.
    let seek = currentSong.seek() || 0;
    trackProgress.innerHTML = self.formatTime(Math.round(seek));
    colorProgress.style.width = (((seek / currentSong.duration()) * 100) || 0) + '%';
    progressButton.style.width = (((seek / currentSong.duration()) * 100) || 0) + '%';
    //if current track is still playing, keep updating track-progress
    if (currentSong.playing()) {
      requestAnimationFrame(self.step.bind(self));
    }
  },
  formatTime: function(secs){
    let minutes = Math.floor(secs/60) || 0;
    let seconds = (secs - minutes * 60) || 0;

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  },
  togglePlaylist: function(){
    var self = this;
    list.style.display = "none";
    if (list.style.display === "none") {
      topLayer.style.display = "none";
      list.style.display = "inline";
      list.style.transform = "translate(0px, 0px) rotate(0deg)";
      list.style.transition = "2s ease-out";
    }else {
      list.style.display = "none";
      topLayer.style.display = "inline";
    }
  }
};

// filtering songs without url and updating their current url with the right one
let songSource = playlist.tracks.filter(function(song) {
  if (song["is_external"] === false) {
    song.url = "http://southpawgroup.com/gidimusicplayer/gidimusic/newplayer/songs/Various/" + song.url;
  }
  return song.url;
});
//setting instances of new player.
let player = new Player(songSource);
//let player = new Player(playlist.tracks);

// setting events to buttons for control;

playTrack.addEventListener("click", function() {
  player.play();
});
pause.addEventListener("click", function() {
  player.pause();
});
next.addEventListener("click", function() {
  player.skip('next');
});
prev.addEventListener("click", function() {
  player.skip('prev');
});
shuffleTrack.addEventListener("click", function(){
  player.shuffle();
});
volumeButton.addEventListener("click", function(){
  player.volumeButton();
});
repeat.addEventListener("click", function() {
  player.repeat();
});
listToggler.addEventListener("click", function() {
  player.togglePlaylist();
});
forSeeking.addEventListener("click", function getCoords(event) {
  let x = event.clientX;
  let windowBreadth = window.innerWidth;
  let box;
  let trackwidth;
  let boxStart;
  let realX;
  if (windowBreadth >= 430) {
    box = (40/100) * windowBreadth;
    boxStart = (30/100) * windowBreadth;
    trackwidth = x - (boxStart + 1);
    realX = ((x - (boxStart + 1)) / box);
  }else if (windowBreadth >= 380 && windowBreadth <= 429) {
    box = (60/100) * windowBreadth;
    boxStart = (20/100) * windowBreadth;
    trackwidth = x - (boxStart + 1);
    realX = ((x - (boxStart + 1)) / box);
  }else {
    box = (90/100) * windowBreadth;
    boxStart = (5/100) * windowBreadth;
    trackwidth = x - (boxStart + 1);
    realX = ((x - (boxStart + 1)) / box);
  }
  console.log(trackwidth);
  console.log(realX);
  player.seek(realX)
});
volumeControl.addEventListener("click", function(){
  let x = event.clientX;
  let windowBreadth = window.innerWidth;
  let box;
  let boxStart;
  let volumeWidth;
  let progressWidth;
  let realX;
  if (windowBreadth >= 430) {
    box = (40/100) * windowBreadth;
    boxStart = (30/100) * windowBreadth;
    volumeWidth = (x -(boxStart + 1));
    progressWidth = Math.round(volumeWidth/box * 100);
    realX = (progressWidth / 100) * 1;
  }else if (windowBreadth >= 380 && windowBreadth <= 429) {
    box = (60/100) * windowBreadth;
    boxStart = (20/100) * windowBreadth;
    volumeWidth = (x - (boxStart + 1));
    progressWidth = Math.round(volumeWidth/box * 100);
    realX = (progressWidth / 100) * 1;
  }else {
    box = (90/100) * windowBreadth;
    boxStart = (5/100) * windowBreadth;
    volumeWidth = (x - (boxStart + 1));
    progressWidth = Math.round(volumeWidth/box * 100);
    realX = (progressWidth / 100) * 1;
  }
  console.log(volumeWidth);
  console.log(progressWidth);
  console.log(realX);
  volumeProgress.style.width = progressWidth + "%";
  player.volume(realX);
});

// Playing the corresponding tracks from the tracklist UI
track1.addEventListener("click", function() {
  player.skipTo(0);
  list.style.display = "none";
  topLayer.style.display = "inline";
});
track2.addEventListener("click", function() {
  player.skipTo(1);
  list.style.display = "none";
  topLayer.style.display = "inline";
});
track3.addEventListener("click", function() {
  player.skipTo(2);
  list.style.display = "none";
  topLayer.style.display = "inline";
});
track4.addEventListener("click", function() {
  player.skipTo(3);
  list.style.display = "none";
  topLayer.style.display = "inline";
});
track5.addEventListener("click", function() {
  player.skipTo(4);
  list.style.display = "none";
  topLayer.style.display = "inline";
});
track6.addEventListener("click", function() {
  player.skipTo(5);
  list.style.display = "none";
  topLayer.style.display = "inline";
});
track7.addEventListener("click", function() {
  player.skipTo(6);
  list.style.display = "none";
  topLayer.style.display = "inline";
});
track8.addEventListener("click", function() {
  player.skipTo(7);
  list.style.display = "none";
  topLayer.style.display = "inline";
});
track9.addEventListener("click", function() {
  player.skipTo(8);
  list.style.display = "none";
  topLayer.style.display = "inline";
});
track10.addEventListener("click", function() {
  player.skipTo(9);
  list.style.display = "none";
  topLayer.style.display = "inline";
});
// cache the playlist in the DOM to avoid lengthy wait
window.onload = function() {
  for (let i = 0; i < playlist.tracks.length; i++) {
    let tracks = [playlist.tracks[i].url];
    var music = document.createElement("Audio");
    let tracklist = tracks;
    music.src = tracklist;
  }
}
