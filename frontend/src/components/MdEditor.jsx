import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MarkdownIt from 'markdown-it';
import Editor from 'react-markdown-editor-lite';
// import style manually
import 'react-markdown-editor-lite/lib/index.css';
import './MdEditor.css';

import constants from '../constants';
import Prompt from './Prompt';

// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */);

// eslint-disable-next-line object-curly-newline
const MdEditor = ({ content, path, mode, onSave }) => {
  const [markdown, setMarkdown] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);
  const [showEditor, setShowEditor] = useState(true);

  const mdEditor = React.useRef(null);

  const handleClick = () => {
    if (mdEditor.current) {
      alert(mdEditor.current.getMdValue());
    }
  };
  // TODO: convert to custom hook
  const save = async () => {
    // console.log(markdown);
    console.log(path);
    const ref = btoa(path);

    // console.log(ref);
    const formData = new URLSearchParams();
    formData.append('ref', ref);
    formData.append('source', markdown);
    const prefix = constants.REST_ENDPOINT;
    const token = window.localStorage.getItem(constants.STORAGE_KEY);

    try {
      const response = await fetch(`${prefix}/index.php?a=edit`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-App-Token': token,
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
      alert('Error: ', error);
    }
  };

  const handleEditorChange = ({ text }) => {
    console.log('editorOnchange');

    let modified = text;

    const regex = /\[\[(.+?)\]\][ ]/g;
    const match = regex.exec(modified);
    console.log(match);
    const found = modified.match(regex);

    console.log(mdEditor.current.getSelection());
    if (found) {
      console.log(match['1']);

      const title = match['1'].replace(/-/g, ' ');
      const filename = match['1'].replace(/ /g, '-').toLowerCase();
      modified = modified.replace(regex, `[${title}](${filename}.md)`);

      // place the cursor
      mdEditor.current.setSelection(mdEditor.current.getSelection());
    }

    setMarkdown(modified);
    setHasChanges(true);
    onSave(modified);
  };

  function firstTemplate() {
    const newContent = `${markdown}\n
## Summary\n
- a\n
## Achievements\n
- b\n
## Next day\n
- c\n`;
    setMarkdown(newContent);
    onSave(newContent);
    setShowEditor(false);
    setTimeout(() => {
      setShowEditor(true);
    }, 20);
  }

  const checkKeyPressed = e => {
    console.log('MdEditor: handle key presss ', e.key);
    // console.log('131:' + markdown + ', hasChanges ' + hasChanges);
    if (e.altKey && e.key === 's') {
      console.log('S keybinding');
      save();
    } else if (e.ctrlKey && e.shiftKey && e.key === '1') {
      console.log('shift 1 - template keybinding');
      firstTemplate();
    }
  };

  useEffect(() => {
    console.log('Editor mode', mdEditor.current.getView());

    if (mode !== 'edit') {
      mdEditor.current.setView({ md: false, html: true });
    } else {
      mdEditor.current.setView({ md: true, html: true });
    }
    document.addEventListener('keydown', checkKeyPressed);
    return () => window.removeEventListener('resize', checkKeyPressed);
  }, []);
  const saveBarStyle = {
    width: '50%',
    display: 'inline-block',
  };

  return (
    <>
      <Prompt dataUnsaved={hasChanges} />
      <div className={hasChanges ? 'changed' : 'unchanged'}>
        <div style={saveBarStyle}>
          <button
            onClick={() => save()}
            title="Alt/Opt + S"
            id="saveBtn"
            type="button"
          >
            Save
          </button>
          <span>{hasChanges ? 'has changes' : 'unchanged'}</span>
        </div>
        <div style={saveBarStyle}>
          {mode !== 'edit' ? <span>preview</span> : <span>editable</span>}
        </div>
        <button onClick={handleClick} type="button">Get value</button>
        {showEditor && (
          <Editor
            style={{ height: '70vh' }}
            ref={mdEditor}
            value={markdown}
            renderHTML={text => mdParser.render(text)}
            onChange={handleEditorChange}
          />
        )}
        <button onClick={() => save()} title="Alt/Opt + S" type="button">
          Save
        </button>
        <button
          onClick={() => firstTemplate()}
          title="Ctrl + Shift + 1"
          type="button"
        >
          Dev Template
        </button>
      </div>
    </>
  );
};

export default MdEditor;

MdEditor.propTypes = {
  content: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
};
