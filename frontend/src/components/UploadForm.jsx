/* eslint-disable jsx-a11y/label-has-associated-control */
// # UploadForm.js
import React, { useState, useContext } from 'react';
import format from 'date-fns/format';

import MyContext from '../MyContext';
import { REST_ENDPOINT, STORAGE_KEY } from '../constants';

const UploadForm = () => {
  const { IMG_PATH } = useContext(MyContext);

  const [selectFile, setSelectedFile] = useState(null);
  const [linkContent, setLinkContent] = useState([]);

  async function upload() {
    const formData = new FormData();
    formData.append('fileToUpload', selectFile);
    const filePath = document.getElementById('filePath').value;
    formData.append(
      'filePath',
      filePath.length ? filePath : format(new Date(), 'yyyy-MM'),
    );
    console.log('send upload');

    try {
      const token = window.localStorage.getItem(STORAGE_KEY);
      const response = await fetch(
        `${REST_ENDPOINT}/search?a=uploadImage`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'X-App-Token': token,
          },
        },
      );

      console.log(response);
      const data = await response.json();
      console.log(data);
      setLinkContent(`${IMG_PATH}/${data.filePath}${data.fileName}`);
      //   history.push(
      //     `/media?fileName=${data.fileName}&filePath=${data.filePath}`
      //   );
    } catch (error) {
      console.log(error);
      alert('Error uploading file ', error);
    }
  }
  console.log(IMG_PATH);
  return (
    <div>
      <h3>Upload Form</h3>
      {linkContent !== '' && (
        <div>
          {/* <img src={linkContent} alt="new upload"/> */}
          ![description](
          {linkContent}
          )
        </div>
      )}
      <form action="../uploadImage/">
        <div className="form-group">
          <label htmlFor="fileToUpload">Select image to upload:</label>

          <input
            type="file"
            name="fileToUpload"
            onChange={e => setSelectedFile(e.target.files[0])}
            id="fileToUpload"
          />
        </div>
        <div className="form-group">
          <label htmlFor="filePath">Path</label>
          <input
            type="text"
            className="form-control"
            id="filePath"
            name="filePath"
          />
        </div>
        {/* <div className="form-group">
              <label for="newName">New Name</label>
              <input type="text" className="form-control" id="newName" name="newName" value="" />
            </div> */}
        <button
          type="button"
          className="btn btn-success btn-block"
          onClick={() => upload()}
        >
          Upload
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
