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
