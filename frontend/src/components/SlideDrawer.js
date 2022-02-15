// # SlideDrawer.js
import React from 'react';
import './SlideDrawer.css'
import pkg from '../../package.json';
import SearchTextForm from './SearchTextForm';
import Tree from './Tree';
import NetworkGraph from './NetworkGraph';
import DeleteBtn from './DeleteBtn';
export default class SlideDrawer extends React.Component {
    state = {
        showTree: false,
        showGraph: false
    }

   render(){
       let drawerClasses = 'side-drawer'
       if(this.props.show) {
          drawerClasses = 'side-drawer open'
       }
       return(
   
          <div className={drawerClasses}>
             <h1>Side Bar</h1>
             <div style={{ textAlign: 'left' }}>
                  <SearchTextForm />
             </div>
             <div>
                <h2>Backlinks</h2>
                <ul>
                  {this.props.documentInfo.backlinks &&
                    this.props.documentInfo.backlinks.map(item => (
                      <li key={item + Math.random()}>
                        <a href={`/${item}`}>{item}</a>
                      </li>
                    ))}
                </ul>
              </div>
             <button
                onClick={e =>
                    this.setState({
                        showTree: !this.state.showTree
                      })
                  
                }
              >
                Toggle Show Tree
              </button>
              {this.state.showTree && this.props.documentInfo.tree.length > 1 ? (
                <div className='scroll'>
                  <Tree items={this.props.documentInfo.tree} />
                </div>
              ) : (
                <div>Tree - Hidden</div>
              )}
             <button
                onClick={e =>
                    this.setState({
                        showGraph: !this.state.showGraph
                      })
                }
              >
                Toggle Show Graph
              </button>
              {this.state.showGraph && this.props.documentInfo.tree.length > 1 ? (
                <NetworkGraph nodes={this.props.documentInfo.tree} />
              ) : (
                <div>Graph - Hidden</div>
              )}
             <hr />
             <div>
                <DeleteBtn path={this.props.documentInfo.path} />
             </div>
             <div className="drawer-footer">Notesee App v{pkg.version}</div>
          </div>
)
    }
    
}