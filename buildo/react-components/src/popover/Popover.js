import React from 'react';
import cx from 'classnames';
import { props, t } from '../utils';

const NO_SIZE_WRAPPER = 'no-size-wrapper';

/**
 * ### Composed of two children: trigger (children) and popover. After a particular event on the trigger (usually "hover" or "click") it renders the popover and positions it relative to it.
 */
@props({
  /**
   * the trigger node. It's always visible
   */
  children: t.ReactNode,
  /**
   * popover settings. The popover is **not** always visible
   */
  popover: t.struct({
    content: t.ReactNode,
    attachToBody: t.maybe(t.Boolean),
    position: t.maybe(t.enums.of(['top', 'bottom', 'left', 'right'])),
    anchor: t.maybe(t.enums.of(['start', 'center', 'end'])),
    event: t.maybe(t.enums.of(['click', 'hover'])),
    onShow: t.maybe(t.Function),
    onHide: t.maybe(t.Function),
    onToggle: t.maybe(t.Function),
    dismissOnScroll: t.maybe(t.Boolean),
    dismissOnClickOutside: t.maybe(t.Boolean),
    className: t.maybe(t.String),
    id: t.maybe(t.String),
    maxWidth: t.maybe(t.union([ t.Number, t.String ])),
    distance: t.maybe(t.Number),
    offsetX: t.maybe(t.Number),
    offsetY: t.maybe(t.Number),
    isOpen: t.maybe(t.Boolean)
  }),
  id: t.maybe(t.String),
  className: t.maybe(t.String),
  style: t.maybe(t.Object)
})
export default class Popover extends React.Component {

  // LIFECYCLE

  constructor(props) {
    super(props);
    this.state = { isOpen: false };
  }

  componentDidMount() {
    this.saveValuesFromNodeTree();
    this.initialized = true;
    if (this.isOpen()) {
      this.addListeners();
      this.forceUpdate();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.saveValuesFromNodeTree();
    if (!this.isStateful() && this.getPopoverProps().isOpen !== this.getPopoverProps(nextProps).isOpen) {
      this.onPopoverOpenChange(nextProps);
    }
  }

  componentWillUnmount() {
    this.removePopover();
    this.removeListeners();
  }

  // LISTENERS

  addOnClickListener = () => {
    if (this.getPopoverProps().dismissOnClickOutside) {
      window.addEventListener('click', this.onClickOutside, false);
    }
  };

  removeOnClickListener = () => {
    if (this.getPopoverProps().dismissOnClickOutside) {
      window.removeEventListener('click', this.onClickOutside, false);
    }
  };

  onClickOutside = (e) => {
    const childrenNode = React.findDOMNode(this.refs.children);
    const popoverNode = this.isAbsolute() ? this.containerNode : childrenNode.childNodes[1];
    const el = e.target || e.srcElement;
    if (!this.isEventInsideTarget(el, childrenNode) && (!popoverNode || !this.isEventInsideTarget(el, popoverNode))) {
      this.hidePopover();
    }
  };

  addOnScrollListener = () => {
    if (this.getPopoverProps().dismissOnScroll) {
      window.addEventListener('mousewheel', this.onScroll, false);
    }
  };

  removeOnScrollListener = () => {
    if (this.getPopoverProps().dismissOnScroll) {
      window.removeEventListener('mousewheel', this.onScroll, false);
    }
  };

  onScroll = () => this.hidePopover();

  addListeners = () => {
    this.addOnScrollListener();
    this.addOnClickListener();
  };

  removeListeners = () => {
    this.removeOnScrollListener();
    this.removeOnClickListener();
  };

  // UTILS

  // extend with default values
  getPopoverProps = (_props) => {
    const props = _props || this.props;
    return {
      type: 'relative',
      position: 'top',
      anchor: 'center',
      event: 'hover',
      onShow: () => {},
      onHide: () => {},
      onToggle: () => {},
      dismissOnClickOutside: true,
      dismissOnScroll: true,
      className: '',
      distance: 5,
      offsetX: 0,
      offsetY: 0,
      ...props.popover
    };
  };

  getPopoverNode = () => {
    let popover;
    if (this.isAbsolute()) {
      popover = this.popoverNode;
    } else {
      const childrenNode = React.findDOMNode(this.refs.children);
      popover = childrenNode.childNodes[1];
    }
    return (popover && popover.id === NO_SIZE_WRAPPER) ? popover.childNodes[0] : popover;
  };

  getOffsetRect = (target) => {
    const box = target.getBoundingClientRect();

    const body = document.body;
    const docElem = document.documentElement;

    const scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    const scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

    const clientTop = docElem.clientTop || body.clientTop || 0;
    const clientLeft = docElem.clientLeft || body.clientLeft || 0;

    const top = Math.round(box.top + scrollTop - clientTop);
    const left = Math.round(box.left + scrollLeft - clientLeft);

    return { top, left };
  };

  saveValuesFromNodeTree = (cb) => {
    const childrenNode = React.findDOMNode(this.refs.children);
    const popoverNode = this.getPopoverNode();

    if (popoverNode) {
      const { clientWidth: childWidth, clientHeight: childHeight } = childrenNode;
      const { clientHeight: popoverHeight, clientWidth: popoverWidth } = popoverNode;
      const { top: childY, left: childX } = this.getOffsetRect(childrenNode);
      const { top: popoverY, left: popoverX } = this.getOffsetRect(popoverNode);

      this.setState({
        child: {
          width: childWidth,
          height: childHeight,
          x: childX,
          y: childY
        },
        popover: {
          width: popoverWidth,
          height: popoverHeight,
          x: popoverX,
          y: popoverY
        }
      }, cb);
    }
  };

  isStateful = (props) => typeof this.getPopoverProps(props).isOpen === 'undefined';

  isOpen = (props) => this.isStateful() ? this.state.isOpen : this.getPopoverProps(props).isOpen;

  isEventInsideTarget = (el, target) => {
    if (!el) {
      return false;
    } else if (el === target) {
      return true;
    } else if (el.parentNode) {
      return this.isEventInsideTarget(el.parentNode, target);
    } else {
      return false;
    }
  };

  // VISIBILITY CHANGE

  appendPopover = () => {
    const hiddenPopover = this.getHiddenPopover();
    this.containerNode = document.createElement('div');
    this.containerNode.innerHTML = React.renderToString(hiddenPopover);
    this.popoverNode = this.containerNode.childNodes[0];
    document.body.appendChild(this.containerNode);

    this.saveValuesFromNodeTree(() => {
      const popover = this.getVisiblePopover();
      this.containerNode.innerHTML = React.renderToString(popover);
    });
  };

  removePopover = () => {
    if (this.containerNode) {
      document.body.removeChild(this.containerNode);
      this.containerNode = null;
    }
  };

  onPopoverOpenChange = (props) => {
    if (this.isOpen(props)) {
      if (this.isAbsolute()) {
        this.appendPopover();
      }
      this.addListeners();
    } else {
      if (this.isAbsolute()) {
        this.removePopover();
      }
      this.removeListeners();
    }
  };

  onPopoverStateChange = () => {
    const { onShow, onHide, onToggle } = this.getPopoverProps();
    if (this.state.isOpen) {
      onShow();
    } else {
      onHide();
    }
    onToggle();
    this.onPopoverOpenChange();
  };

  eventWrapper = (cb) => {
    return (e) => {
      const { event } = this.getPopoverProps();
      const childrenNode = React.findDOMNode(this.refs.children).childNodes[0];
      const el = e.target || e.srcElement;
      if (this.isAbsolute() || (event === 'hover') || this.isEventInsideTarget(el, childrenNode)) {
        cb();
      }
    };
  };

  showPopover = () => this.setIsOpen(true);

  hidePopover = () => this.setIsOpen(false);

  togglePopover = () => this.setIsOpen(!this.isOpen());

  setIsOpen = (isOpen) => {
    if (this.isStateful()) {
      this.setState({ isOpen }, this.onPopoverStateChange);
    } else {
      const { onShow, onHide, onToggle } = this.getPopoverProps();
      const cb = isOpen ? onShow : onHide;
      cb();
      onToggle();
    }
  };

  // LOCALES

  popoverTemplate = (style) => {
    const { position, anchor, className, content, id, event } = this.getPopoverProps();
    const { eventWrapper, hidePopover, isAbsolute } = this;
    const positionClass = `position-${position}`;
    const anchorClass = `anchor-${anchor}`;
    const _className = `popover-content ${positionClass} ${anchorClass} ${className}`;
    const events = !isAbsolute() && event === 'hover' ? { onMouseEnter: eventWrapper(hidePopover) } : undefined;
    return (
      <div className={_className} id={id} style={style} {...events}>
        {content}
      </div>
    );
  };

  getVisiblePopover = () => this.popoverTemplate(this.computePopoverStyle());

  getHiddenPopover = () => {
    const style = { width: '100%', height: '100%', top: 0, left: 0, position: 'absolute', overflow: 'hidden', pointerEvents: 'none' };
    return (
      <div id={NO_SIZE_WRAPPER} style={style}>
        {this.popoverTemplate({ position: 'absolute', visibility: 'hidden' })}
      </div>
    );
  };

  isAbsolute = () => this.getPopoverProps().attachToBody === true;

  getEventCallbacks = () => {
    const { event } = this.getPopoverProps();
    const onHover = event === 'hover';
    const onClick = event === 'click';
    const { eventWrapper, showPopover, hidePopover, togglePopover } = this;
    return {
      onMouseEnter: onHover ? eventWrapper(showPopover) : undefined,
      onMouseLeave: onHover ? eventWrapper(hidePopover) : undefined,
      onClick: onClick ? eventWrapper(togglePopover) : undefined
    };
  };

  computePopoverStyle = () => {
    const { child, popover } = this.state;
    const { anchor, position, maxWidth, offsetX, offsetY, distance } = this.getPopoverProps();

    const isAbsolute = this.isAbsolute();
    const isHorizontal = position === 'top' || position === 'bottom';
    const isVertical = position === 'right' || position === 'left';

    const anchorOffset = { top: 0, left: 0 };
    const positionOffset = { top: 0, left: 0 };

    switch (anchor) {
      case 'start':
        // default -> { top: 0, left: 0 }
        break;
      case 'center':
        anchorOffset.left = isHorizontal ? (child.width - popover.width) / 2 : 0;
        anchorOffset.top = isVertical ? (child.height - popover.height) / 2 : 0;
        break;
      case 'end':
        anchorOffset.left = isHorizontal ? (child.width - popover.width) : 0;
        anchorOffset.top = isVertical ? (child.height - popover.height) : 0;
        break;
    }

    switch (position) {
      case 'top':
        positionOffset.top = -(popover.height + distance);
        break;
      case 'bottom':
        positionOffset.top = child.height + distance;
        break;
      case 'left':
        positionOffset.left = -(popover.width + distance);
        break;
      case 'right':
        positionOffset.left = child.width + distance;
        break;
    }

    return {
      position: 'absolute',
      top: (isAbsolute ? child.y : 0) + (positionOffset.top + anchorOffset.top + offsetY),
      left: (isAbsolute ? child.x : 0) + (positionOffset.left + anchorOffset.left + offsetX),
      maxWidth
    };
  };

  getLocals() {
    const isRelative = !this.isAbsolute();
    const isOpen = this.isOpen();
    const popover = isRelative && (this.initialized && isOpen ? this.getVisiblePopover() : this.getHiddenPopover());
    return {
      ...this.props,
      style: {
        display: 'inline-block',
        position: isRelative ? 'relative' : undefined,
        ...this.props.style
      },
      className: cx('react-popover', this.props.className, { 'is-open': isOpen, 'is-closed': !isOpen }),
      eventCallbacks: this.getEventCallbacks(),
      popover
    };
  }

  // RENDER

  render() {
    const { children, style, className, id, eventCallbacks, popover } = this.getLocals();
    return (
      <div {...{ id, className, style }} {...eventCallbacks} ref='children'>
        {children}
        {popover}
      </div>
    );
  }

}
