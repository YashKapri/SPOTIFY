console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs = []; // Global song list for next/previous functionality (deprecated, but kept for context)
let currFolder; // Global folder for playback context
let play; 
let previous;
let next;

// New global variable to hold the list of currently displayed songs with their folder context.
let libraryItems = []; 

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


// Refactored getSongs: It now only returns the songs array for a given folder. No DOM manipulation.
async function getSongs(folder) {
    let songsArray = [];

    // START: Manual Song List for Demonstration
    if (folder === "songs/ncs") {
        songsArray.push("Faded_Lofi.mp3");
        songsArray.push("Sleep_Well.mp3");
    } else if (folder === "songs/Chill_(mood)") {
        songsArray.push("Mellow_Groove.mp3");
    } else if (folder === "songs/Upliftion_(mood)") {
        songsArray.push("Rising_Sun.mp3");
        songsArray.push("Victory_Dance.mp3");
    } else if (folder === "songs/Angry_(mood)") {
        songsArray.push("Release_The_Rage.mp3");
    } else if (folder === "songs/Bright_(mood)") {
        songsArray.push("Neon_Glow.mp3");
    } else if (folder === "songs/karan aujla") {
        songsArray.push("Making_Memories.mp3");
    } else if (folder === "songs/Dark_(mood)") {
        songsArray.push("Into_The_Abyss.mp3");
    } else if (folder === "songs/Funky_(mood)") {
        songsArray.push("Get_Funky.mp3");
    } else if (folder === "songs/Love_(mood)") {
        songsArray.push("My_Love_Song.mp3");
    } else if (folder === "songs/Diljit") {
        songsArray.push("G.O.A.T_Title.mp3");
    } else if (folder === "songs/cs") {
        songsArray.push("Happy_Cover.mp3");
    } else {
        songsArray.push(`${folder.split('/').pop().replaceAll('_', ' ')} Demo Song.mp3`);
    }
    // END: Manual Song List

    // Return objects with song name and folder name
    return songsArray.map(song => ({
        songName: song,
        folderName: folder
    }));
}


// New function to display a list of songs in the library
function displaySongsInLibrary(songsList) {
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""; // Clear the list before repopulating

    for (const item of songsList) {
        // Use data-folder and data-song-name to store context in the HTML
        songUL.innerHTML += `<li data-folder="${item.folderName}" data-song-name="${item.songName}"><img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div> ${item.songName.replaceAll("%20", " ")}</div>
                                <div>Playlist Artist</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
    }

    // Attach event listeners to all newly created songs
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            const songName = e.getAttribute("data-song-name");
            const folderPath = e.getAttribute("data-folder");
            
            // Pass both song name and folder path to playMusic
            playMusic(songName, folderPath);
        })
    })

    return songsList;
}

// Function to populate the modal with all songs for selection
function populateSongSelectionList(allSongs) {
    const ul = document.getElementById("allSongsForSelection");
    ul.innerHTML = ""; // Clear existing list

    allSongs.forEach((item, index) => {
        const songTitle = item.songName.replaceAll("%20", " ");
        ul.innerHTML += `
            <li data-index="${index}">
                <input type="checkbox" id="song-check-${index}" value="${index}">
                <div class="song-details">
                    <div>${songTitle}</div>
                    <div style="color: grey; font-size: 12px;">From ${item.folderName.split('/').pop().replaceAll('_', ' ')}</div>
                </div>
            </li>
        `;
    });
}

// New function to load all songs for the initial library view (as requested by user)
async function loadAllSongsForInitialLibrary() {
    const allFolders = [
        "songs/ncs", "songs/Love_(mood)", "songs/Dark_(mood)", 
        "songs/Bright_(mood)", "songs/Funky_(mood)", "songs/Upliftion_(mood)", 
        "songs/Diljit", "songs/karan aujla", "songs/Angry_(mood)", 
        "songs/Chill_(mood)", "songs/cs"
    ];
    let allSongsList = [];

    for (const folder of allFolders) {
        const folderSongs = await getSongs(folder); // returns {songName, folderName} objects
        allSongsList = allSongsList.concat(folderSongs);
    }
    
    // Set the global libraryItems to the combined list
    libraryItems = allSongsList;
    
    // Display all songs in the library
    displaySongsInLibrary(libraryItems);
    
    // Return the initial song for playback
    if (libraryItems.length > 0) {
        return libraryItems[0];
    }
    return null;
}

// Updated playMusic to accept the folder and set the global currFolder
const playMusic = (track, folder, pause = false) => {
    // We must use the folder for the current track to construct the correct path
    currFolder = folder; 
    currentSong.src = `/${currFolder}/` + track
    
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}


async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json(); 
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            const folderPath = `songs/${item.currentTarget.dataset.folder}`;
            const folderSongs = await getSongs(folderPath); // gets songs in {songName, folderName} format
            
            // Update the global libraryItems to ONLY contain the clicked album's data
            libraryItems = folderSongs; 
            
            displaySongsInLibrary(libraryItems); // Display only the clicked album's songs
            
            // Start playing the first song of the clicked album
            if (libraryItems.length > 0) {
                 playMusic(libraryItems[0].songName, folderPath);
            }
        })
    })
}


async function main() {
    // Get the list of ALL the songs and display them in the library
    const initialSongData = await loadAllSongsForInitialLibrary();
    
    // Fix: Initialize the global button variables after the DOM is ready
    play = document.getElementById("play");
    previous = document.getElementById("previous");
    next = document.getElementById("next");
    
    // Get navigation elements
    const homeLink = document.getElementById("homeLink");
    const searchLink = document.getElementById("searchLink");
    const logoLink = document.getElementById("logoLink");
    const searchContainer = document.getElementById("searchContainer");

    // LOGIN/SIGNUP ELEMENTS
    const loginOverlay = document.getElementById("loginOverlay");
    const loginModal = document.getElementById("loginModal");
    const closeModalBtn = document.querySelector(".login-modal .close-modal-btn");
    const loginForm = document.getElementById("loginForm");
    const loginSuccessMessage = document.getElementById("loginSuccessMessage");
    const signupHeaderBtn = document.querySelector(".header .signupbtn");
    const loginHeaderBtn = document.querySelector(".header .loginbtn");
    const headerButtonsContainer = document.querySelector(".header .buttons");
    const libraryExtras = document.getElementById("libraryExtras");
    const switchToSignupLink = document.getElementById("switchToSignup");
    
    // NEW CREATE PLAYLIST ELEMENTS
    const createPlaylistBtn = document.getElementById("createPlaylistBtn");
    const createPlaylistOverlay = document.getElementById("createPlaylistOverlay");
    const closeCreatePlaylistModal = document.getElementById("closeCreatePlaylistModal");
    const savePlaylistBtn = document.getElementById("savePlaylistBtn");
    const playlistNameInput = document.getElementById("playlistNameInput");
    const playlistSuccessMessage = document.getElementById("playlistSuccessMessage");


    if (initialSongData) {
        // Play the first song from the combined list (paused)
        playMusic(initialSongData.songName, initialSongData.folderName, true);
    } else {
        // Fallback song
        currFolder = "songs/ncs";
        playMusic("Faded_Lofi.mp3", "songs/ncs", true);
    }

    // Display all the albums on the page
    await displayAlbums()
    
    // Add event listener for Logo link to perform a true page reload
    logoLink.addEventListener("click", () => {
        console.log("Spotify Logo clicked - Performing page reload.");
        window.location.reload(); 
    });
    
    // Add event listener for Home link
    homeLink.addEventListener("click", async () => {
        console.log("Home clicked - Loading all songs and hiding search.");
        // Reload all songs into the library view
        const initialSongData = await loadAllSongsForInitialLibrary();
        if (initialSongData) {
            playMusic(initialSongData.songName, initialSongData.folderName);
        }
        // Ensure search bar is hidden
        searchContainer.classList.remove('show-search');
        // Close the left panel on mobile devices (the sidebar slide-in/out logic)
        document.querySelector(".left").style.left = "-120%"; 
    });

    // Add event listener for Search link
    searchLink.addEventListener("click", () => {
        console.log("Search clicked - Toggling search bar.");
        // Toggle the visibility of the search bar
        searchContainer.classList.toggle('show-search');
        // Close the left panel on mobile devices
        document.querySelector(".left").style.left = "-120%"; 
        
        // If the search bar is now visible, focus on the input
        if (searchContainer.classList.contains('show-search')) {
            document.getElementById('searchInput').focus();
        }
    });

    // Function to simulate user login and update UI
    const simulateLogin = (isSignup = false) => {
        // 1. Hide modal and show success message temporarily
        loginForm.style.display = 'none';
        loginModal.querySelector('.login-switch-text').style.display = 'none';
        loginSuccessMessage.innerHTML = isSignup ? "Account created successfully! Redirecting..." : "Logged in successfully! Redirecting...";
        loginSuccessMessage.style.display = 'block';

        setTimeout(() => {
            loginOverlay.style.display = 'none';
            loginForm.style.display = 'flex'; // Reset form display for next time
            loginModal.querySelector('.login-switch-text').style.display = 'block';
            loginSuccessMessage.style.display = 'none'; // Hide success message
            
            // 2. Update Header Buttons to show logged-in state
            headerButtonsContainer.innerHTML = `
                <button class="upgradebtn">Upgrade</button>
                <button class="profilebtn rounded">User</button>
            `;
            
            // 3. Update Library 'Extras' section to premium/user view
            libraryExtras.innerHTML = `
                <div class="create-playlist-card bg-black rounded p-1">
                    <h4>Create your first playlist</h4>
                    <p>It's easy, we'll help you</p>
                    <button class="bg-white rounded" id="createPlaylistBtn">Create playlist</button>
                </div>
            `;
            
            // Re-attach event listeners to new elements
            document.querySelector(".upgradebtn").addEventListener("click", () => alert("Upgrade functionality would go here!"));
            document.querySelector(".profilebtn").addEventListener("click", () => alert("Profile menu functionality would go here!"));
            
            // IMPORTANT: Re-attach listener for the newly created Create Playlist button
            document.getElementById("createPlaylistBtn").addEventListener("click", openCreatePlaylistModal);

        }, 1000); // Wait for 1 second before fully closing and updating
    };


    // LOGIN/SIGNUP MODAL LOGIC

    const openLoginModal = (isSignup = false) => {
        loginOverlay.style.display = "flex";
        loginModal.querySelector('h2').textContent = isSignup ? "Sign up for Spotify" : "Log in to Spotify";
        loginModal.querySelector('.loginbtn-modal').textContent = isSignup ? "Sign Up" : "Log In";
        loginForm.reset();
        loginForm.dataset.isSignup = isSignup; // Use a data attribute to track state
        
        // Ensure switch link text is correct
        const switchLinkParent = loginModal.querySelector('.login-switch-text');
        switchLinkParent.innerHTML = isSignup 
            ? "Already have an account? <a href='#' id='switchToSignup'>Log in here</a>"
            : "Don't have an account? <a href='#' id='switchToSignup'>Sign up for Spotify</a>";
    };
    
    // Open Modal with login/signup buttons
    signupHeaderBtn.addEventListener("click", () => openLoginModal(true));
    loginHeaderBtn.addEventListener("click", () => openLoginModal(false));
    
    // Close Login Modal button
    const closeLoginModal = () => {
        loginOverlay.style.display = "none";
        loginForm.style.display = 'flex'; // Ensure form is visible
        loginModal.querySelector('.login-switch-text').style.display = 'block'; // Ensure switch link is visible
        loginSuccessMessage.style.display = 'none'; // Ensure success message is hidden
    };

    closeModalBtn.addEventListener("click", closeLoginModal);
    
    // Close Login Modal by clicking outside
    loginOverlay.addEventListener("click", (e) => {
        if (e.target.id === "loginOverlay") {
             closeLoginModal();
        }
    });

    // Switch between login and signup within the modal
    loginModal.addEventListener("click", (e) => {
        if (e.target.id === "switchToSignup") {
            e.preventDefault();
            const isLogin = loginForm.dataset.isSignup === 'false' || !loginForm.dataset.isSignup;
            openLoginModal(isLogin);
        }
    });


    // Handle Mock Login/Signup Form Submission
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const isSignup = loginForm.dataset.isSignup === 'true';
        console.log(`Mock ${isSignup ? 'signup' : 'login'} attempt.`);
        // Simulate a successful login/signup
        simulateLogin(isSignup);
    });

    // NEW: CREATE PLAYLIST LOGIC
    
    // Function to open the create playlist modal
    const openCreatePlaylistModal = () => {
        // First, ensure all songs data is available in libraryItems
        if (libraryItems.length === 0) {
            alert("Loading song data... please try again shortly.");
            loadAllSongsForInitialLibrary().then(() => {
                 populateSongSelectionList(libraryItems);
                 createPlaylistOverlay.style.display = "flex";
            });
        } else {
            populateSongSelectionList(libraryItems);
            createPlaylistOverlay.style.display = "flex";
        }
        playlistNameInput.value = "";
        playlistSuccessMessage.style.display = 'none';
        savePlaylistBtn.style.display = 'block';
    };
    
    // Attaching listener to the initial (un-logged-in state) Create Playlist button
    // This will be replaced by the one inside simulateLogin() after login
    createPlaylistBtn.addEventListener("click", () => {
        // A simple alert for un-logged in users
        alert("Please Log in or Sign up to create a playlist!");
    });
    
    // Close Create Playlist Modal
    const closeCreatePlaylistModalFunc = () => {
        createPlaylistOverlay.style.display = "none";
    };
    
    closeCreatePlaylistModal.addEventListener("click", closeCreatePlaylistModalFunc);
    
    // Close Create Playlist Modal by clicking outside
    createPlaylistOverlay.addEventListener("click", (e) => {
        if (e.target.id === "createPlaylistOverlay") {
             closeCreatePlaylistModalFunc();
        }
    });

    // Handle Save Playlist button click
    savePlaylistBtn.addEventListener("click", () => {
        const playlistName = playlistNameInput.value.trim();
        const selectedCheckboxes = document.querySelectorAll('#allSongsForSelection input[type="checkbox"]:checked');
        
        if (!playlistName) {
            alert("Please enter a name for your playlist.");
            return;
        }
        
        if (selectedCheckboxes.length === 0) {
            alert("Please select at least one song for your playlist.");
            return;
        }

        const selectedSongs = Array.from(selectedCheckboxes).map(checkbox => {
            const index = parseInt(checkbox.value);
            return libraryItems[index];
        });
        
        console.log(`New Playlist Created: "${playlistName}"`);
        console.log("Songs:", selectedSongs);
        
        // Simulate success message and close
        playlistSuccessMessage.innerHTML = `Playlist **${playlistName}** created with ${selectedSongs.length} songs!`;
        playlistSuccessMessage.style.display = 'block';
        savePlaylistBtn.style.display = 'none';
        
        setTimeout(closeCreatePlaylistModalFunc, 2000); 
    });


    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (play.src.includes("play.svg")) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${currentSong.duration ? secondsToMinutesSeconds(currentSong.duration) : '00:00'}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")

        // Get the current song name (which is the last segment of the src URL)
        // We use decodeURI as song names might be URI encoded
        const currentSongName = decodeURI(currentSong.src.split("/").slice(-1)[0]);
        
        // Find the index of the current song in the global libraryItems array
        let currentIndex = libraryItems.findIndex(item => item.songName === currentSongName);

        if ((currentIndex - 1) >= 0) {
            const prevSong = libraryItems[currentIndex - 1];
            playMusic(prevSong.songName, prevSong.folderName);
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")
        
        // Get the current song name (which is the last segment of the src URL)
        const currentSongName = decodeURI(currentSong.src.split("/").slice(-1)[0]);

        // Find the index of the current song in the global libraryItems array
        let currentIndex = libraryItems.findIndex(item => item.songName === currentSongName);

        if ((currentIndex + 1) < libraryItems.length) {
            const nextSong = libraryItems[currentIndex + 1];
            playMusic(nextSong.songName, nextSong.folderName);
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })

}

main()