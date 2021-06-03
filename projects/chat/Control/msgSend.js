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