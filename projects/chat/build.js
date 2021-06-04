(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{"./Control/chatWindow":2,"./Control/msgScroll":3,"./Control/msgSend":4,"./Control/photoControl":5,"./Control/startPage":6,"./Control/userName":7,"./Control/userScroll":8,"./serverControl":10}],2:[function(require,module,exports){
class ChatWindow{
  constructor(element) {
    this.element = element;
  }

  show() {
    this.element.classList.remove('hidden');
  }

  hide() {
    this.element.classList.add('hidden');
  }
}

module.exports = ChatWindow;
},{}],3:[function(require,module,exports){
class MsgScroll {
  constructor(element) {
    this.element = element;
  }

  add(from, text) {
    let date = new Date();
    let hours = String(date.getHours()).padStart(2, 0);
    let minutes = String(date.getMinutes()).padStart(2, 0);
    let time = `${hours}:${minutes}`;
    const item = document.createElement('div');

    item.classList.add('message-item');
    item.innerHTML = `
    <div class="message-item-left">
        <div
        style="background-image: url(/chat/photos/${from}.png?t=${Date.now()})" 
        class="message-item-photo" data-role="user-avatar" data-user=${from}></div>
    </div>
    <div class="message-item-right">
      <div class="message-item-header">
          <div class="message-item-header-name">${from}</div>
          <div class="message-item-header-time">${time}</div>
      </div>
      <div class="message-item-text">${text}</div>
    </div>
    `;

    this.element.append(item);
    this.element.scrollTop = this.element.scrollHeight;
  }

  addSystemMessage(message) {
    const item = document.createElement('div');

    item.classList.add('message-item', 'message-item-system');
    item.textContent = message;

    this.element.append(item);
    this.element.scrollTop = this.element.scrollHeight;
  }
}

module.exports = MsgScroll;

},{}],4:[function(require,module,exports){
class MsgSend {
  constructor(element, SendProc) {
    this.SendProc = SendProc;
    this.messageInput = element.querySelector('[data-role=message-input]');
    this.messageSendButton = element.querySelector('[data-role=message-send-button]');

    this.messageSendButton.addEventListener('click', () => {
      const message = this.messageInput.value.trim();

      if (message) {
        this.SendProc(message);
      }
    });
  }

  clear() {
    this.messageInput.value = '';
  }
}

module.exports = MsgSend;
},{}],5:[function(require,module,exports){
class PhotoControl {
  constructor(element, PhotoSet) {
    this.element = element;
    this.PhotoSet = PhotoSet;

    this.element.addEventListener('click', (e) => {
      const UploadForm = document.createElement('div');
      const main = document.querySelector('#main');
      UploadForm.classList.add('AvatarSetForm');

      UploadForm.innerHTML = `
      <div class="FormBlock">
        <div class="FormBlock__header">
          Загрузка фото
        </div>
        <div class="FormBlock__content">
          <div class="FormBlock__content-upload"></div>
          <div class="form_user-name" data-role="user-name"></div>
        </>
        <div class="close-elem"></div>
      </div>
      `;

      const getUser = document.querySelector('[data-role=user-name]').textContent;
      UploadForm.querySelector('[data-role=user-name]').textContent = getUser;
      main.append(UploadForm);

      const upload = UploadForm.querySelector('.FormBlock__content-upload');
      const closeElem = UploadForm.querySelector('.close-elem');

      closeElem.addEventListener('click', (e) =>{
        main.removeChild(UploadForm);
      });
      
      upload.addEventListener('dragover', (e) => {
        if (e.dataTransfer.items.length && e.dataTransfer.items[0].kind === 'file') {
          e.preventDefault();
        }
      });
      
      upload.addEventListener('drop', (e) => {
        const file = e.dataTransfer.items[0].getAsFile();
        const reader = new FileReader();        
        
        reader.readAsDataURL(file);
        reader.addEventListener('load', () =>{
          upload.style.backgroundImage = `url(${reader.result})`;
          upload.style.backgroundSize = `contain`;
          const save = document.createElement('div');
          save.classList.add('Save-buttons');
          
          save.innerHTML = `
          <button class="reject-button">Reject</button>
          <button class="save-button">Save</button>
          `;
          UploadForm.querySelector('.FormBlock__content').append(save);
          const saveButton = UploadForm.querySelector('.save-button');
          const rejectButton = UploadForm.querySelector('.reject-button');
          
          saveButton.addEventListener('click', (e)=>{
            e.preventDefault();
            this.PhotoSet(reader.result);
            main.removeChild(UploadForm);
          });
          rejectButton.addEventListener('click', (e)=>{
            e.preventDefault();
            upload.style.backgroundImage = `url('./img/upload.svg')`;
            UploadForm.querySelector('.FormBlock__content').removeChild(save);
            upload.style.backgroundSize = `auto`;
          });
        });
        e.preventDefault();
        
      });



      UploadForm.addEventListener('click', (e) =>{
        if (UploadForm.querySelector('.FormBlock').contains(e.target)||e.target==saveButton||e.target==rejectButton){        }
        else{
          main.removeChild(UploadForm);
        }
      });

    });
  }

  set(photo) {
    this.element.style.backgroundImage = `url(${photo})`;
  }
}

module.exports = PhotoControl;

},{}],6:[function(require,module,exports){
class StartPage{
  constructor(element, Entry) {
    this.element = element;
    this.Entry = Entry;

    const NickInput = element.querySelector('#username__input');
    const submit = element.querySelector('#entry');

    submit.addEventListener('click', () => {
      const name = NickInput.value.trim();

      if (name) {
        this.Entry(name);
      }
    });
  }

  show() {
    this.element.classList.remove('hidden');
  }

  hide() {
    this.element.classList.add('hidden');
  }
}

module.exports = StartPage;
},{}],7:[function(require,module,exports){
class UserName {
  constructor(element) {
    this.element = element;
  }

  set(name) {
    this.name = name;
    this.element.textContent = name;
  }

  get() {
    return this.name;
  }
}

module.exports = UserName;
},{}],8:[function(require,module,exports){
class UserScroll {
  constructor(element) {
    this.element = element;
    this.items = new Set();
  }

  createList() {
    const fragment = document.createDocumentFragment();

    this.element.innerHTML = '';

    for (const name of this.items) {
      const element = document.createElement('div');
      element.classList.add('user-list-item');
      element.textContent = name;
      fragment.append(element);
    }

    this.element.append(fragment);
  }

  add(name) {
    this.items.add(name);
    this.createList();
  }

  remove(name) {
    this.items.delete(name);
    this.createList();
  }
}

module.exports = UserScroll;

},{}],9:[function(require,module,exports){
const Chat = require('./Chat');

new Chat();
},{"./Chat":1}],10:[function(require,module,exports){
 class ServerControl {
  constructor(url, onMessage) {
    this.url = url;
    this.onMessage = onMessage;
  }

  connect() {
    return new Promise((resolve) => {
      this.socket = new WebSocket(this.url);
      this.socket.addEventListener('open', resolve);
      this.socket.addEventListener('message', (e) => {
        this.onMessage(JSON.parse(e.data));
      });
    });
  }

  Gen(name) {
    this.sendMessage('new', { name });
  }

  sendTextMessage(message) {
    this.sendMessage('text-message', { message });
  }

  sendMessage(type, data) {
    this.socket.send(
      JSON.stringify({
        type,
        data,
      })
    );
  }
}

module.exports = ServerControl;

},{}]},{},[9]);
