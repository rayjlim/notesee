import React from 'react';
import PropTypes from 'prop-types';
import MarkdownIt from 'markdown-it';
import Editor from 'react-markdown-editor-lite';
import useMdEditor from '../hooks/useMdEditor';
// import style manually
import 'react-markdown-editor-lite/lib/index.css';
import './MdEditor.css';

import Prompt from './Prompt';

// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */);

// eslint-disable-next-line object-curly-newline
const MdEditor = ({ content, path, mode, onSave }) => {
  const {
    hasChanges,
    save,
    showEditor,
    handleEditorChange,
    mdEditor,
    markdown,
    firstTemplate,
  } = useMdEditor(content, path, mode, onSave);

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
            {hasChanges ? 'Save changes' : 'unchanged'}
          </button>
        </div>

        {showEditor && (
          <Editor
            style={{ height: '85vh' }}
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
