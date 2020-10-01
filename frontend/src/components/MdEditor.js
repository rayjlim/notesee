import React, { useState, Fragment } from 'react';
import Editor from 'react-editor-md';
import langSetting from '../lang';
import Constants from '../constants';
import Prompt from './Prompt';
import './MdEditor.css';

const MdEditor = props => {
  
  const [markdown, setMarkdown] = useState(props.content);
  const [hasChanges, setHasChanges] = useState(false);

  const save = async function () {
    console.log(markdown);
    console.log(props.path);
    const ref = btoa(props.path);

    console.log(ref);
    const formData = new URLSearchParams();
    formData.append('ref', ref);
    formData.append('source', markdown);
    const prefix = Constants.REST_ENDPOINT;
    const token = window.localStorage.getItem('appToken');

    try {
      const response = await fetch(prefix + '/index.php?a=edit', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-app-token': token,
        },
        body: formData,
      });

      if (response.ok) {
        const results = await response.json();
        // alert('saved');
        console.log(results);
        if (results.status === 'success') {
          setHasChanges(false);
          props.onSave(markdown);
        } else {
          alert('Server Error on Save');
        }
      } else {
        console.log('Network response was not ok.');
      }
    } catch (error) {
      alert('Error: ' + error);
    }
  };
  const editorOnchange = editor => {
    console.log('onchange2 =>');
    // console.log( editor.getMarkdown());

    const modified = editor.getMarkdown();

    let newCursor = editor.getCursor();
    console.log(newCursor);
    const regex = /\[\[(.+?)\]\][ ]/g;
    let match = regex.exec(modified);
    console.log(match);
    const found = modified.match(regex);
    if (found) {
      console.log(match['1']);

      const title = match['1'].replace(/-/g, ' ');
      const filename = match['1'].replace(/ /g, '-');

      console.log(match.index + ' ' + regex.lastIndex);

      const matchLen = match['1'].length;
      const replaced = modified.replace(
        regex,
        `[${title}](${filename}.md)`
      );

      // set the text
      editor.clear();
      editor.insertValue(replaced);

      //place the cursor
      console.log(newCursor.ch, matchLen);
      newCursor.ch = newCursor.ch + matchLen + 3;
      editor.setCursor(newCursor);
    }

    setMarkdown(editor.getMarkdown());
    setHasChanges(true);
    props.onSave(editor.getMarkdown())
  };

  return (
    <Fragment>
      <Prompt dataUnsaved={hasChanges} />
      <div className={hasChanges? 'changed' : 'unchanged'}>
      <button onClick={e => save()}>Save</button>
      <span>{hasChanges ? 'has changes' : 'unchanged'}</span>
      <Editor
        config={{
          // testEditor.getMarkdown().replace(/`/g, '\\`')
          path: '/assets/',
          delay: 0, 
          markdown: props.content,
          onchange: editorOnchange,
          lang: langSetting,
        }}
      />
      <button onClick={e => save()}>Save</button>
      </div>
    </Fragment>
  );
};
export default MdEditor;
