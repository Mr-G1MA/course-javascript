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