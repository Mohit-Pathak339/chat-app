let currentChatUser = '';
let localStream;
let peerConnection;
let remoteStream;
let mediaRecorder;
let audioChunks = [];
let muteAudio = false;
let videoOff = false;
let isInCall = false;

// Simulate online users list
let allUsers = ['', '', '', '', ''];
let activeUsers = ['', '']; // Example: These users are online

function login() {
    const username = document.getElementById('username').value;
    if (username) {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-page').style.display = 'flex';
        updateOnlineUsersList();
    }
}

function openChat(user) {
    currentChatUser = user;
    document.getElementById('chat-user').innerText = user;
    document.getElementById('chat-interface').style.display = 'block';
    clearChatBox();
}

function closeChat() {
    document.getElementById('chat-interface').style.display = 'none';
}

function sendMessage() {
    const message = document.getElementById('chat-input').value;
    if (message) {
        const chatBox = document.getElementById('chat-box');
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('sender');
        messageDiv.textContent = message;
        chatBox.appendChild(messageDiv);
        document.getElementById('chat-input').value = '';
    }
}

function clearChatBox() {
    document.getElementById('chat-box').innerHTML = '';
}

// Emoji Dialog
function toggleEmojiDialog() {
    const emojiDialog = document.getElementById('emoji-dialog');
    emojiDialog.style.display = emojiDialog.style.display === 'none' ? 'flex' : 'none';
}

function addEmoji(emoji) {
    const chatInput = document.getElementById('chat-input');
    chatInput.value += emoji;
    toggleEmojiDialog();
}

// Voice Recording
function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = function(event) {
                audioChunks.push(event.data);
            };
            mediaRecorder.onstop = function() {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                document.getElementById('audio-player').src = audioUrl;
            };
            mediaRecorder.start();
        });
}

function stopRecording() {
    if (mediaRecorder) {
        mediaRecorder.stop();
    }
}

function sendVoiceRecording() {
    const audioPlayer = document.getElementById('audio-player');
    const audioUrl = audioPlayer.src;
    const chatBox = document.getElementById('chat-box');
    const audioDiv = document.createElement('div');
    audioDiv.innerHTML = `<audio controls src="${audioUrl}"></audio>`;
    audioDiv.classList.add('sender');
    chatBox.appendChild(audioDiv);
}

// Video Call - WebRTC logic
let localVideo = document.getElementById('local-video');
let remoteVideo = document.getElementById('remote-video');

function toggleVideoCall() {
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                localStream = stream;
                localVideo.srcObject = localStream;
                document.getElementById('video-call').style.display = 'flex';
                startPeerConnection();
            })
            .catch(error => console.error('Error accessing media devices.', error));
    }
}

function startPeerConnection() {
    const configuration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };

    peerConnection = new RTCPeerConnection(configuration);

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = event => {
        remoteStream = event.streams[0];
        remoteVideo.srcObject = remoteStream;
    };

    peerConnection.createOffer()
        .then(offer => {
            return peerConnection.setLocalDescription(offer);
        })
        .catch(error => console.error('Error creating offer.', error));
}

function endVideoCall() {
    localStream.getTracks().forEach(track => track.stop());
    remoteStream.getTracks().forEach(track => track.stop());
    peerConnection.close();
    document.getElementById('video-call').style.display = 'none';
    isInCall = false;
}

// Mute/Unmute audio and turn video on/off
function toggleMute() {
    const audioTracks = localStream.getAudioTracks();
    audioTracks.forEach(track => track.enabled = !track.enabled);
    muteAudio = !muteAudio;
    document.getElementById('mute-btn').textContent = muteAudio ? 'Unmute' : 'Mute';
}

function toggleVideo() {
    const videoTracks = localStream.getVideoTracks();
    videoTracks.forEach(track => track.enabled = !track.enabled);
    videoOff = !videoOff;
    document.getElementById('video-btn').textContent = videoOff ? 'Turn Video On' : 'Turn Video Off';
}

// Function to update the online users list dynamically
function updateOnlineUsersList() {
    const userList = document.getElementById('user-list');
    userList.innerHTML = ''; // Clear the list first

    // Loop through all users and display online users
    allUsers.forEach(user => {
        const userListItem = document.createElement('li');
        userListItem.textContent = user;
        
        // Check if the user is online (you can modify this based on real-time data)
        if (activeUsers.includes(user)) {
            userListItem.style.color = 'green'; // Indicating this user is online
        } else {
            userListItem.style.color = 'gray'; // Indicating this user is offline
        }
        
        // On click, open chat with the user
        userListItem.onclick = function() {
            openChat(user);
        };
        
        userList.appendChild(userListItem);
    });
}



