const ChatWindow = require('./Control/chatWindow');
const UserName = require('./Control/userName');
const PhotoControl = require('./Control/photoControl');
const UserScroll = require('./Control/userScroll');
const MsgScroll = require('./Control/msgScroll');
const StartPage = require('./Control/startPage');
const ServerControl = require('./serverControl');
const MsgSend = require('./Control/msgSend');

class Chat {
  constructor() {
    this.serverControl = new ServerControl(
      `ws://${location.host}/chat/ws`,
      this.onMessage.bind(this)
    );

    this.Control = {
      startPage: new StartPage(
        document.querySelector('#login'),
        this.Entry.bind(this)
      ),
      userName: new UserName(document.querySelector('[data-role=user-name]')),
      userScroll: new UserScroll(document.querySelector('[data-role=user-scroll]')),
      chatWindow: new ChatWindow(document.querySelector('#main')),
      msgScroll: new MsgScroll(document.querySelector('[data-role=msg-scroll]')),
      photoControl: new PhotoControl(
        document.querySelector('[data-role=user-photo]'),
        this.PhotoSet.bind(this)
      ),
    msgSend: new MsgSend(
        document.querySelector('[data-role=msg-send]'),
        this.SendProc.bind(this)
      ),
    };

    this.Control.startPage.show();
  };
  
  async Entry(name) {
    await this.serverControl.connect();
    this.serverControl.Gen(name);
    this.Control.startPage.hide();
    this.Control.chatWindow.show();
    this.Control.userName.set(name);
    this.Control.photoControl.set(`/chat/photos/${name}.png?t=${Date.now()}`);
  }
  
  SendProc(message) {
    this.serverControl.sendTextMessage(message);
    this.Control.msgSend.clear();
  }

  
  onMessage({ type, from, data }) {
    let date = new Date();
    let hours = String(date.getHours()).padStart(2, 0);
    let minutes = String(date.getMinutes()).padStart(2, 0);
    let time = `${hours}:${minutes}`;
    
    if (type === 'new') {
      this.Control.userScroll.add(from);
      this.Control.msgScroll.addSystemMessage(`${from} joined your party ${time}`);
    } 
    else if (type === 'leave') {
      this.Control.userScroll.remove(from);
      this.Control.msgScroll.addSystemMessage(`${from} left our party ${time}`);
    } 
    else if (type === 'text-message') {
      this.Control.msgScroll.add(from, data.message);
    } 
    else if (type === 'user-scroll') {
      for (const item of data) {
        this.Control.userScroll.add(item);
      }
    } 
    else if (type === 'new-avatar') {
      const avatars = document.querySelectorAll(
        `[data-user=${data.name}]`
        );
        
        for (const avatar of avatars) {
          avatar.style.backgroundImage = `url(/chat/photos/${
            data.name
          }.png?t=${Date.now()})`;
        }
      }
    }


    PhotoSet(data) {
      this.Control.photoControl.set(data);
  
      fetch('/chat/upload-photo', {
        method: 'post',
        body: JSON.stringify({
          name: this.Control.userName.get(),
          image: data,
        }),
      });
    }
  }
  
module.exports = Chat;