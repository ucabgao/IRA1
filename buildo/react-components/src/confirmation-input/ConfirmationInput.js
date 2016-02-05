import React from 'react';
import cx from 'classnames';
import { props, skinnable, t } from '../utils';
import omit from 'lodash/object/omit';
import InputChildren from 'react-input-children';
import { linkState } from '../link-state';
import FlexView from '../flex/FlexView';
import Icon from '../Icon/Icon';


@skinnable()
@props({
  initialValue: t.maybe(t.String),
  onChange: t.maybe(t.Function),
  onConfirm: t.maybe(t.Function),
  onClear: t.maybe(t.Function),
  placeholder: t.maybe(t.String),
  text: t.struct({
    clear: t.maybe(t.String),
    toConfirm: t.maybe(t.String)
  }),
  icon: t.struct({
    clear: t.maybe(t.String),
    toConfirm: t.maybe(t.String)
  }),
  className: t.maybe(t.String),
  id: t.maybe(t.String),
  style: t.maybe(t.Object)
})
export default class ConfirmationInput extends React.Component {

  static defaultProps = {
    onChange: () => {},
    onConfirm: () => {},
    onClear: () => {}
  };

  constructor(props) {
    super(props);
    this.state = {
      focused: false,
      hoveringConfirm: false,
      value: props.initialValue
    };
  }

  componentWillReceiveProps({ initialValue }) {
    if (initialValue !== this.props.initialValue) {
      this.setState({
        value: initialValue
      });
    }
  }

  onEnter = (e) => {
    if (e.which === 13 || e.keyCode === 13) { // if Enter key
      this._onConfirm();
      document.activeElement.blur(); // remove focus
    }
  };

  onBlur = () => {
    const { hoveringConfirm } = this.state;
    if (!hoveringConfirm) {
      this._onConfirm();
    }
    this.setState({ focused: false });
  };

  onFocus = () => {
    this.setState({ focused: true });
  };

  onMouseEnter = () => this.setState({ hoveringConfirm: true });

  onMouseLeave = () => this.setState({ hoveringConfirm: false });

  _onConfirm = () => {
    const {
      props: { initialValue, onConfirm, onChange },
      state: { value },
      onMouseLeave
    } = this;
    const confirmed = (value === initialValue) || (!value && !initialValue);
    if (!confirmed) {
      onConfirm(value);
      onChange(value);
      if (!value) {
        onMouseLeave(); // on confirm, if value is empty, `templateConfirm` disappears -> onMouseLeave never called
      }
    }
  };

  _onClear = () => {
    this.props.onClear();
    this.props.onChange(''); // props.onChange should always receive a string
    this.onMouseLeave(); // on clear `templateConfirm` disappears -> onMouseLeave never called
  };

  getLocals() {
    const {
      props: {
        className,
        initialValue,
        text,
        icon,
        ...props
      },
      state: { value , focused },
      _onClear: onClear,
      _onConfirm: onConfirm,
      onMouseEnter, onMouseLeave
    } = this;
    const confirmed = (value === initialValue) || (!value && !initialValue);
    const showToConfirm = !confirmed;
    const showClear = (value && confirmed && !focused);

    return {
      confirmProps: (showToConfirm || showClear) && {
        text: text[confirmed ? 'clear' : 'toConfirm'],
        icon: icon[confirmed ? 'clear' : 'toConfirm'],
        onMouseDown: showClear ? onClear : onConfirm,
        onMouseEnter,
        onMouseLeave
      },
      inputProps: {
        ...omit(props, 'onChange'),
        valueLink: linkState(this, 'value'),
        onKeyUp: this.onEnter,
        onBlur: this.onBlur,
        onFocus: this.onFocus,
        wrapper: {
          className: cx('confirmation-input', { focused }, className)
        }
      }
    };
  }

  templateConfirm({ text, icon, ...confirmProps }) {
    const props = {
      style: { cursor: 'pointer' },
      className: 'confirmation',
      vAlignContent: 'center',
      ...confirmProps
    };
    return (
      <FlexView {...props}>
        {icon && <Icon icon={icon} />}
        {text}
      </FlexView>
    );
  }

  template({ inputProps, confirmProps }) {
    return (
      <InputChildren {...inputProps}>
        {confirmProps && this.templateConfirm(confirmProps)}
      </InputChildren>
    );
  }

}
