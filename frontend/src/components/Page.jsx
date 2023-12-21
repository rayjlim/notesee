import React from 'react';
import MdEditor from './MdEditor';
import SlideDrawer from './SlideDrawer';
import Backdrop from './Backdrop';
import FavoritesList from './FavoritesList';
import BreadcrumbList from './BreadcrumbList';
import usePage from '../hooks/usePage';

const Page = () => {
  const {
    documentInfo,
    setDocumentInfo,
    showSideBar,
    setShowSideBar,
    createPage,
    visual,
    mode,
    switchMode,
  } = usePage();

  return (
    <>
      {visual.loading ? (
        <span>Loading</span>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            {showSideBar && (
              <>
                <SlideDrawer
                  show={showSideBar}
                  documentInfo={documentInfo}
                />
                <Backdrop
                  close={
                    () => setShowSideBar(!showSideBar)
                  }
                />
              </>
            )}
            <button
              id="sideBarBtn"
              onClick={() => { setShowSideBar(!showSideBar); }}
              title="Alt/Opt + B"
              type="button"
              style={{ margin: '0 1rem' }}
            >
              Side Bar
            </button>
            <span>
              {`Modified Date: ${documentInfo.modifiedDate} `}
            </span>
            {visual.showCreateButton && (
              <button onClick={() => createPage()} className="create-btn" type="button">
                {`Create ${documentInfo.path}`}
              </button>
            )}
            <span style={{ margin: '0 1rem' }}>
              {'Switch Mode: '}
              <button onClick={() => switchMode()} title="Alt/Opt + M" type="button">
                {mode === 'edit' ? 'Editor' : 'Read'}
              </button>
            </span>
          </div>
          <MdEditor
            content={documentInfo.markdown}
            path={documentInfo.path}
            onSave={markdown => setDocumentInfo({ ...documentInfo, markdown })}
            mode={mode}
          />
          <div className="half-row backlinks">
            <h2>Backlinks</h2>
            <ul>
              {documentInfo.backlinks
                && documentInfo.backlinks.map(item => (
                  <li key={item}>
                    <a href={`/${item}`}>{item}</a>
                  </li>
                ))}
            </ul>
          </div>
          <FavoritesList
            path={documentInfo.path}
            isFavorite={documentInfo.isFavorite}
          />
        </>
      )}
      <BreadcrumbList />
    </>
  );
};
export default Page;
