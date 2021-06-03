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