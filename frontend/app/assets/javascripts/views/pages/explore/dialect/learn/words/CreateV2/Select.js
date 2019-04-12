import React from 'react'
import { PropTypes } from 'react'
const { string, element, func } = PropTypes

export default class Text extends React.Component {
  static defaultProps = {
    className: 'Text',
    value: undefined,
    handleChange: () => {},
  }

  static propTypes = {
    id: string.isRequired,
    labelText: string.isRequired,
    name: string.isRequired,
    className: string,
    ariaDescribedby: string,
    value: string,
    children: element,
    handleChange: func,
    refSelect: func,
  }

  state = {
    value: this.props.value,
    handleChange: () => {},
    refSelect: () => {},
  }

  componentDidMount() {
    this.props.handleChange(this.state.value)
  }

  render() {
    const { className, ariaDescribedby, id, labelText, name, refSelect } = this.props
    return (
      <div className={`${className} Select`}>
        <label className={`${className}__label Select__label`} htmlFor={id}>
          {labelText}
        </label>
        <select
          aria-describedby={ariaDescribedby}
          className={`${className}__select Select__select`}
          id={id}
          name={name}
          defaultValue={this.state.value}
          onChange={this._handleChange}
          ref={refSelect}
        >
          {this.props.children}
        </select>
      </div>
    )
  }
  _handleChange = (event) => {
    this.setState({ value: event.target.value })
    this.props.handleChange(event.target.value)
  }
}
