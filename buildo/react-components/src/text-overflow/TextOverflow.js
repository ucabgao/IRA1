import React from 'react';
import { props, t } from '../utils';
import { warn } from '../utils/log';
import Popover from '../popover/Popover';

/**
 * ### Text view which, if string content is too large, trims it and shows the full content on "hover" with a `Popover` (or custom component if any)
 */
@props({
  /**
   * in case you want to use a custom component (like a `Tooltip`) to render the full content which is passed as the first argument
   */
  children: t.maybe(t.Function),
  /**
   * this is the full string
   */
  label: t.String,
  id: t.maybe(t.String),
  className: t.maybe(t.String),
  style: t.maybe(t.Object)
}, { strict: false })
export default class TextOverflow extends React.Component {

  constructor(props) {
    super(props);
    this.state = { isOverflowing: false };
  }

  componentDidMount = () => this.verifyOverflow();

  componentDidUpdate = () => this.verifyOverflow();

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.label !== this.props.label) {
      this.reset();
    }
  };

  reset = () => this.setState({ isOverflowing: false });

  logWarnings = () => {
    warn(() => {
      const node = React.findDOMNode(this.refs.text).parentNode;
      const { width, flex } = node.style;
      const flexBasis = flex ? flex.split(' ')[2] : null;
      if (width !== '100%' && flexBasis !== '100%') {
        return [`WARNING: TextOverflow's parent doesn't have "width: 100%" nor "flex-basis: 100%"`, node];
      }
    });
  };

  verifyOverflow = (_state) => {
    const state = _state || this.state;
    if (state.isOverflowing === false) {
      const text = React.findDOMNode(this.refs.text);
      if(text.offsetWidth < text.scrollWidth){
        this.setState({ isOverflowing: true }, this.logWarnings);
      } else {
        this.logWarnings();
      }
    }
  };

  getTextSpan = () => {
    const { label } = this.props;
    const style = {
      display: 'block',
      whiteSpace: 'nowrap',
      width: '100%',
      overflow: 'hidden',
      OTextOverflow: 'ellipsis', // Opera
      textOverflow: 'ellipsis'
    };
    return <span ref='text' style={style}>{label}</span>;
  };

  templateOverflow = () => {
    const { children, label, style, ...other } = this.props;

    if (children) {
      return children(this.getTextSpan());
    } else {
      const props = {
        ...other,
        popover: {
          content: label,
          event: 'hover'
        },
        style: {
          width: '100%',
          ...style
        }
      };

      return <Popover { ...props }>{this.getTextSpan()}</Popover>;
    }
  };

  templeteStandard = () => {
    const { children, label, style, ...other } = this.props;
    const props = {
      ...other,
      style: {
        width: '100%',
        ...style
      }
    };

    return <div { ...props }>{this.getTextSpan()}</div>;
  };

  render() {
    return this.state.isOverflowing ? this.templateOverflow() : this.templeteStandard();
  }

}
