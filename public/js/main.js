const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages'); 
const roomName = document.getElementById('room-name'); 
const userList = document.getElementById('users');

//Get username and room 
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true 
});


const socket = io();

//join chat room 

socket.emit('joinRoom', {username, room});

// Ger Room and Users
socket.on('roomUsers', ({ room, users }) =>{
    outputRoomName(room);
    outputUsers(users);
});

//server message
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //Ping mechanism 
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Message sent 
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //Message text
    const msg = e.target.elements.msg.value; 

    socket.emit('chatMessage', msg);

    //clear input 
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

//output messag eto DOM file 
function outputMessage(message) { 
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span> ${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//add room name to DOM file 
function outputRoomName(room) {
    roomName.innerText = room;
}

//add users to DOM file 
function outputUsers(users) {
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}`;
}