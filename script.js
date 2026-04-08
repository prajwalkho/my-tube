
const movies = [
    {
        title: "HTML, CSS,JAVASCRIPT EXAPLAINED, IN 4MIN.mp4",
        poster: "./HTML, CSS,JAVASCRIPT EXAPLAINED.jpg", 
       
        description: " HTML is a standard markup language used to create the structure and content of web pages.  CSS is a styling language used to control the layout and visual appearance of web pages."
    },
    {
        title: "What Is HTML,CSS,JS",
        poster: "./What Is HTML,CSS,JS.jpg",
        description: "Programming language.  Used for client-side scripting.  Supports event-driven programming. Can manipulate HTML and CSS dynamically. Supports AJAX (Asynchronous JavaScript and XML) for dynamic data loading"
       
    },
    {
        title: "What is fronted and backend devlopment",
        poster: "./What is fronted and backend devlopment.jpg",
        description: " JavaScript is a high-level, dynamic programming language used for client-side scripting on the web.  HTML is a standard markup language used to create the structure and content of web pages.  CSS is a styling language used to control the layout and visual appearance of web pages. "
    },
    {
        title: "100th second learn C#",
        poster: "./5th_video_poster.jpg",
        
        description: "Another exciting film..."
    },
    {
        title: "C, C++ and C#",
        poster: "./C_programming.jpg",
        
        description: "Another exciting film..."
    },
    {
        title: "Data Structure",
        poster: "./Data Structure.jpg",
        description: "A data structure is a way to organize, store, and manage data in a computer so that it can be efficiently accessed, modified, and manipulated. Data structures provide a framework for storing and retrieving data, allowing algorithms to work efficiently and effectively."
    },
    {
        title: "How to Learn C Programming Language",
        poster: "./How to Learn C Programming Language.jpg",
        description: " C programming is a procedural, imperative language that provides low-level access to memory, making it efficient for systems programming, embedded systems, and operating systems development."
    },
    {
        title: "PC assembly",
        poster: "./PC assembly.jpg",
        description: "PC assembling involves putting together various hardware components to build a functional computer system. Here's a step-by-step guide: 1. CPU (Central Processing Unit)  2. Motherboard 3. RAM (Memory) 4. Storage Drive (HDD/SSD) 5. Power Supply 6. Graphics Card (optional) 7. Case 8. Cooling System (CPU and Case Fans) 9. Operating System"
    },
];


const movieContainer = document.getElementById('movieContainer');
const searchInput = document.getElementById('searchInput');
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const video = document.getElementById("myVideo");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const volume = document.getElementById("volume");
const videoPlayer = document.getElementById("videoPlayer");


function displayMovies(moviesToDisplay) {
    movieContainer.innerHTML = '';
    moviesToDisplay.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>${movie.description}</p>
            <button onclick="playVideo('${movie.poster}', '${movie.title}')">Watch Now</button>
        `;
        movieContainer.appendChild(movieCard);
    });
}


function playVideo(poster, title) {
   

    let video_url = poster.slice(0,-4) + '.mp4'
    
  
    video.src = `./${video_url}`; 
  
   
    video.poster = poster;
    video.title = title;


    videoPlayer.style.display = "block";

   
    video.play();
}


searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredMovies = movies.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm)
    );

    displayMovies(filteredMovies);
});


// signupForm.addEventListener('submit', (event) => {
//     event.preventDefault();

//     console.log("Sign up form submitted"); 
// });


// loginForm.addEventListener('submit', (event) => {
//     event.preventDefault();
  
//     console.log("Login form submitted"); 
// });


playBtn.addEventListener('click', () => {
    video.play();
});

pauseBtn.addEventListener('click', () => {
    video.pause();
});

volume.addEventListener('input', () => {
    video.volume = volume.value;
});


displayMovies(movies);