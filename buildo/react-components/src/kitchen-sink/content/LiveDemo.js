import React from 'react';
import Playground from 'component-playground';
import MoreOrLess from '../../more-or-less/MoreOrLess';

const footer = '\n__render(Example);';
const footerISO = '\n__renderISO(Example);';

export default class LiveDemo extends React.Component {

  static propTypes = {
    iso: React.PropTypes.bool,
    scope: React.PropTypes.object.isRequired,
    codeText: React.PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.state = { showCode: false };
  }

  componentDidMount() {
    if (this.props.iso) {
      this.contentNodeISO = React.findDOMNode(this.refs.contentNodeISO);
      this.contentNodeISO.innerHTML = React.renderToString(this.getContentISO());
      React.render(this.getContentISO(), this.contentNodeISO);
    }
    this.contentNode = React.findDOMNode(this.refs.contentNode);
    this.forceUpdate();
  }

  componentDidUpdate() {
    const playground = React.findDOMNode(this.refs.playground);
    if (playground) {
      playground.click();
    }
    if (this.props.iso) {
      React.render(this.getContentISO(), this.contentNodeISO);
    }
  }

  __render = (Example) => {
    const content = (
      <div style={{ position: 'relative' }}>
        <Example />
      </div>
    );
    setTimeout(() => React.render(content, this.contentNode));
  };

  __renderISO = (Example) => {
    const content = (
      <div>
        <p>ISOMORPHIC TEST</p>
        <div style={{ position: 'relative' }}>
          <Example />
        </div>
      </div>
    );
    setTimeout(() => React.render(content, this.contentNodeISO));
  };

  getContentISO = () => {
    const { scope, codeText } = this.props;
    const __renderISO = this.__renderISO;
    return <Playground codeText={codeText + footerISO} scope={{ ...scope, __renderISO }} es6Console />;
  };

  toggleCode = () => this.setState({ showCode: !this.state.showCode });

  render() {
    const {
      props: { scope, codeText, iso },
      state: { showCode },
      __render, toggleCode
    } = this;

    return (
      <div className='live-demo'>
        <div className='component' ref='contentNode' />
        {iso && <div className='iso-demo component' ref='contentNodeISO' />}
        {!showCode && <div className='show-code cm-s-monokai CodeMirror' onClick={toggleCode}>SHOW CODE</div>}
        <MoreOrLess expanded={showCode} onExpandedChange={toggleCode} icons={{ expanded: 'angle-up', collapsed: 'angle-down' }}>
          <div style={showCode ? undefined : { position: 'absolute', pointerEvents: 'none', opacity: 0, height: 10, zIndex: -1, overflow: 'hidden' }}>
            {this.contentNode &&
              <Playground codeText={codeText + footer} scope={{ ...scope, __render }} es6Console ref='playground' />
            }
          </div>
        </MoreOrLess>
      </div>
    );
  }

}
