import { useState, useEffect, useRef } from 'react';
import constants from '../constants';

const useMdEditor = (content, path, mode, onSave) => {
  const [markdown, setMarkdown] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);
  const [showEditor, setShowEditor] = useState(true);

  const mdEditor = useRef(null);
  const cursorPosition = useRef(null);

  const handleEditorChange = ({ text }) => {
    console.log('editor onChange');

    let modified = text;

    const regex = /\[\[(.+?)\]\][ ]/g;
    const match = regex.exec(modified);
    const found = modified.match(regex);

    if (cursorPosition.current !== null) {
      mdEditor.current.setSelection(cursorPosition.current);
      cursorPosition.current = null;
    }
    if (found) {
      console.log(match['1']);

      const title = match['1'].replace(/-/g, ' ');
      const filename = match['1'].replace(/ /g, '-').toLowerCase();
      modified = modified.replace(regex, `[${title}](${filename}) `);

      // place the cursor
      // mdEditor.current.setSelection({ start: 2, end: 5, text: '33' });
      const newPosition = mdEditor.current.getSelection().start + filename.length;
      cursorPosition.current = { start: newPosition, end: newPosition };
    }

    setMarkdown(modified);
    setHasChanges(true);
    onSave(modified);
  };

  const save = async () => {
    const ref = btoa(path);

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
    if (e.altKey && e.key === 's') {
      console.log('S keybinding');
      document.getElementById('saveBtn').click();
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
    return () => document.removeEventListener('resize', checkKeyPressed);
  }, []);

  return {
    hasChanges,
    save,
    showEditor,
    handleEditorChange,
    mdEditor,
    markdown,
    firstTemplate,
  };
};
export default useMdEditor;
