import React, { useState, useEffect, Fragment } from 'react';
import Editor from 'react-editor-md';
import langSetting from '../lang';
import Constants from '../constants';
import Prompt from './Prompt';
import './MdEditor.css';

export default function MdEditor(props) {
  const [markdown, setMarkdown] = useState(props.content);
  const [hasChanges, setHasChanges] = useState(false);
  const [showEditor, setShowEditor] = useState(true);
 
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
        console.log(results);
        if (results.status === 'success') {
          setHasChanges(false);
          // props.onSave(markdown);
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
    console.log('editorOnchange');
    // console.log(editor.getMarkdown());

    const modified = editor.getMarkdown();
    console.log(editor);
    let newCursor = editor.getCursor();
    // console.log(newCursor);
    const regex = /\[\[(.+?)\]\][ ]/g;
    let match = regex.exec(modified);
    console.log(match);
    const found = modified.match(regex);
    if (found) {
      console.log(match['1']);

      const title = match['1'].replace(/-/g, ' ');
      const filename = match['1'].replace(/ /g, '-').toLowerCase();

      console.log(match.index + ' ' + regex.lastIndex);

      const matchLen = match['1'].length;
      const replaced = modified.replace(regex, `[${title}](${filename}.md)`);

      // set the text
      editor.clear();
      editor.insertValue(replaced);

      //place the cursor
      console.log(newCursor.ch, matchLen);
      newCursor.ch = newCursor.ch + matchLen + 3;
      editor.setCursor(newCursor);
      editor.unwatch();
      editor.watch();
    }

    setMarkdown(editor.getMarkdown());
    setHasChanges(true);
    props.onSave(editor.getMarkdown());
  };

  function firstTemplate() {
    const newContent =
      markdown +
      `\n
## Summary\n
- a\n
## Achievements\n
- b\n
## Next day\n
- c\n`;
    setMarkdown(newContent);
    props.onSave(newContent);
    setShowEditor(false);
    setTimeout(() => {
      setShowEditor(true);
    }, 20);
  }

  const editorOnload = editor => {
    console.log('editor loaded: ' + props.mode);
    if (props.mode !== 'edit') {
      editor.unwatch();
      editor.watch();
      editor.previewing();
      // editor.fullscreen();
      console.log('preview');
    } else {
      editor.previewing();
      setTimeout(() => {
        editor.previewing();
      }, 20);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', e => {
      console.log('mdeditor: handle key presss ' + e.key);
      // console.log('131:' + markdown + ', hasChanges ' + hasChanges);
      if (e.altKey && e.key === 's') {
        console.log('S keybinding');
        // Note: this is a hack because the markdown value is taken from the init value
        document.getElementById('saveBtn').click();
        // save();
      } else if (e.ctrlKey && e.shiftKey && e.key === '1') {
        console.log('shift 1 - template keybinding');
        firstTemplate();
      }
    });
  });
  const divStyle = {
    width: '50%',
    display: 'inline-block',
  };

  return (
    <Fragment>
      <Prompt dataUnsaved={hasChanges} />
      <div className={hasChanges ? 'changed' : 'unchanged'}>
        <div style={divStyle}>
          <button onClick={e => save()} title="Alt/Opt + S" id="saveBtn">
            Save
          </button>
          <span> {hasChanges ? 'has changes' : 'unchanged'}</span>
         
        </div>
        <div style={divStyle}>
          {props.mode !== 'edit' ? <span>preview</span> : <span>editable</span>}
        </div>

        {showEditor && (
          <Editor
            config={{
              path: '/assets/',
              delay: 0,
              markdown: markdown,
              lang: langSetting,
              onload: editorOnload,
              onchange: editorOnchange,
            }}
          />
        )}
        <button onClick={e => save()} title="Alt/Opt + S">
          Save
        </button>
        <button onClick={e => firstTemplate()} title="Ctrl + Shift + 1">
          Dev Template
        </button>
      </div>
    </Fragment>
  );
}
