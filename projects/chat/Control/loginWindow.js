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