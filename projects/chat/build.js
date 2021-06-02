(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class LoginWindow{
  constructor(element, onLogin) {
    this.element = element;
    this.onLogin = onLogin;

    const loginNameInput = element.querySelector('#username__input');
    const submitButton = element.querySelector('#entry');

    submitButton.addEventListener('click', () => {
      const name = loginNameInput.value.trim();

      if (name) {
        this.onLogin(name);
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

module.exports = LoginWindow;
},{}],2:[function(require,module,exports){
class MainWindow{
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

module.exports = MainWindow;
},{}],3:[function(require,module,exports){
class MessageList {
  constructor(element) {
    this.element = element;
  }

  add(from, text) {
    const date = new Date();
    const hours = String(date.getHours()).padStart(2, 0);
    const minutes = String(date.getMinutes()).padStart(2, 0);
    const time = `${hours}:${minutes}`;
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

module.exports = MessageList;

},{}],4:[function(require,module,exports){
class MessageSender {
  constructor(element, onSend) {
    this.onSend = onSend;
    this.messageInput = element.querySelector('[data-role=message-input]');
    this.messageSendButton = element.querySelector('[data-role=message-send-button]');

    this.messageSendButton.addEventListener('click', () => {
      const message = this.messageInput.value.trim();

      if (message) {
        this.onSend(message);
      }
    });
  }

  clear() {
    this.messageInput.value = '';
  }
}

module.exports = MessageSender;
},{}],5:[function(require,module,exports){
class UserList {
  constructor(element) {
    this.element = element;
    this.items = new Set();
  }

  buildDOM() {
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
    this.buildDOM();
  }

  remove(name) {
    this.items.delete(name);
    this.buildDOM();
  }
}

module.exports = UserList;

},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
class UserPhoto {
  constructor(element, onUpload) {
    this.element = element;
    this.onUpload = onUpload;

    this.element.addEventListener('dragover', (e) => {
      if (e.dataTransfer.items.length && e.dataTransfer.items[0].kind === 'file') {
        e.preventDefault();
      }
    });

    this.element.addEventListener('drop', (e) => {
      const file = e.dataTransfer.items[0].getAsFile();
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.addEventListener('load', () => this.onUpload(reader.result));
      e.preventDefault();
    });
  }

  set(photo) {
    this.element.style.backgroundImage = `url(${photo})`;
  }
}

module.exports = UserPhoto;

},{}],8:[function(require,module,exports){
const MegaChat = require('./megaChat');

new MegaChat();
},{"./megaChat":9}],9:[function(require,module,exports){
const LoginWindow = require('./Control/loginWindow');
const MainWindow = require('./Control/mainWindow');
const UserName = require('./Control/userName');
const UserList = require('./Control/userList');
const UserPhoto = require('./Control/userPhoto');
const MessageList = require('./Control/messageList');
const MessageSender = require('./Control/messageSender');
const WSClient = require('./wsClient');

class MegaChat {
  constructor() {
    this.wsClient = new WSClient(
      `ws://${location.host}/chat/ws`,
      this.onMessage.bind(this)
    );

    this.Control = {
      loginWindow: new LoginWindow(
        document.querySelector('#login'),
        this.onLogin.bind(this)
      ),
      mainWindow: new MainWindow(document.querySelector('#main')),
      userName: new UserName(document.querySelector('[data-role=user-name]')),
      userList: new UserList(document.querySelector('[data-role=user-list]')),
      messageList: new MessageList(document.querySelector('[data-role=messages-list]')),
      messageSender: new MessageSender(
        document.querySelector('[data-role=message-sender]'),
        this.onSend.bind(this)
      ),
      userPhoto: new UserPhoto(
        document.querySelector('[data-role=user-photo]'),
        this.onUpload.bind(this)
      ),
    };

    this.Control.loginWindow.show();
  };

  onUpload(data) {
    this.Control.userPhoto.set(data);

    fetch('/chat/upload-photo', {
      method: 'post',
      body: JSON.stringify({
        name: this.Control.userName.get(),
        image: data,
      }),
    });
  }

  onSend(message) {
    this.wsClient.sendTextMessage(message);
    this.Control.messageSender.clear();
  }

  async onLogin(name) {
    await this.wsClient.connect();
    this.wsClient.sendHello(name);
    this.Control.loginWindow.hide();
    this.Control.mainWindow.show();
    this.Control.userName.set(name);
    this.Control.userPhoto.set(`/chat/photos/${name}.png?t=${Date.now()}`);
  }

  onMessage({ type, from, data }) {
    console.log(type, from, data);

    if (type === 'hello') {
      this.Control.userList.add(from);
      this.Control.messageList.addSystemMessage(`${from} вошел в чат`);
    } else if (type === 'user-list') {
      for (const item of data) {
        this.Control.userList.add(item);
      }
    } else if (type === 'bye-bye') {
      this.Control.userList.remove(from);
      this.Control.messageList.addSystemMessage(`${from} вышел из чата`);
    } else if (type === 'text-message') {
      this.Control.messageList.add(from, data.message);
    } else if (type === 'photo-changed') {
      const avatars = document.querySelectorAll(
        `[data-role=user-avatar][data-user=${data.name}]`
      );

      for (const avatar of avatars) {
        avatar.style.backgroundImage = `url(/chat/photos/${
          data.name
        }.png?t=${Date.now()})`;
      }
    }
  }
}

module.exports = MegaChat;
},{"./Control/loginWindow":1,"./Control/mainWindow":2,"./Control/messageList":3,"./Control/messageSender":4,"./Control/userList":5,"./Control/userName":6,"./Control/userPhoto":7,"./wsClient":10}],10:[function(require,module,exports){
 class WSClient {
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

  sendHello(name) {
    this.sendMessage('hello', { name });
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

module.exports = WSClient;

},{}]},{},[8]);
