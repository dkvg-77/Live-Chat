const socket = io();
const {Name, room} = Qs.parse(location.search, {
    ignoreQueryPrefix : true
})

// Get DOM elements in respective Js variables
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp')
const messageContainer = document.querySelector(".container")

// Audio that will play on receiving messages
var audio = new Audio('ting.mp3');

const time = ()=>{
    let d = new Date();
    let hour = d.getHours();
    let minutes = d.getMinutes();
    let messageElement2 = document.createElement('span');
    messageElement2.innerText = `${hour}:${minutes}`;
    messageElement2.classList.add('time');

    return messageElement2;
}

// Function which will append event info to the contaner
const append = (message, position)=>{
    const messageElement = document.createElement('div');
    const messageElement1 = document.createElement('span');
    messageElement.append(messageElement1);
    let messageElement2 = time();
    messageElement.append(messageElement2);
    messageElement1.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
    if(position =='left'){ 
        audio.play();
    }
}

// Ask new user for his/her Name and let the server know

socket.emit("new-user-joined", {Name, room}, (error)=>{
    if(error){
        alert(error)
        location.href = "/"
    }
})

// If a new user joins, receive his/her Name from the server
socket.on('user-joined', Name =>{
    append(`${Name.toUpperCase()} joined the chat`, 'left')
})

// If server sends a message, receive it
socket.on('receive', data =>{
    append(`${data.Name.toUpperCase()}: ${data.message}`, 'left')
})

// If a user leaves the chat, append the info to the container
socket.on('left', Name =>{
    append(`${Name.toUpperCase()} left the chat`, 'left')
})


socket.on("roomData",({room, users})=>{
    let sidec = document.getElementById("room_info");
    sidec.innerHTML = "";
    sidec.innerHTML += `<div id = "room_name"> Room: ${room.toUpperCase()} <div/>`;
    sidec.innerHTML += `<div id = "room_length" > Users: ${users.length} <div/>`
    sidec.innerHTML += `<hr>`;
    let i = 1;
    sidec.innerHTML += `<div id = "users_list"> <div/>`;
    let usersl = document.getElementById("users_list"); 
    for(let value of users){
        usersl.innerHTML +=  `<div id = "users_ele"> ${i++}) ${value.Name.toUpperCase()} <div/>`
    }
})

// If the form gets submitted, send server the message
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    append(`You: ${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = ''
})