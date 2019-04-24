import React from 'react'
import { PropTypes } from 'react'
import Text from './Text'
import Select from './Select'
import FormMoveButtons from './FormMoveButtons'
import FormRemoveButton from './FormRemoveButton'
import { removeItem, moveItemDown, moveItemUp } from './FormInteractions'
const { string } = PropTypes

export default class FormLiteralTranslations extends React.Component {
  static defaultProps = {
    className: 'FormLiteralTranslations',
    name: 'FormLiteralTranslations',
    groupName: 'FormLiteralTranslations__group',
  }

  static propTypes = {
    name: string.isRequired,
    className: string,
    groupName: string,
  }

  state = {
    items: [],
  }

  render() {
    const { className, groupName } = this.props

    const items = this.state.items
    return (
      <fieldset className={`${className} ${groupName}`}>
        <legend>Literal Translations</legend>
        <p className="alert alert-info">Describe what the word translates to regardless of context</p>

        <button
          type="button"
          onClick={() => {
            this.handleClickAddItem()
          }}
        >
          Add a Literal Translation
        </button>

        {items}

        {/* SCREEN READER DESCRIPTIONS --------------- */}
        <span id="describedbyLanguageLiteralTranslation" className="visually-hidden">
          You are adding a Literal Translation for the new word. Please specify the Language of the Literal Translation.
        </span>
        <span id="describedByTranslationLiteralTranslation" className="visually-hidden">
          You are adding a Literal Translation for the new word. Please type a Translation of the Literal Translation in
          the selected Language.
        </span>
        <span id="describedByLiteralTranslationMove" className="visually-hidden">
          {`If you are adding multiple Literal Translations, you can change the position of the Literal Translation with
the 'Move Literal Translation up' and 'Move Literal Translation down' buttons`}
        </span>
      </fieldset>
    )
  }

  handleClickAddItem = () => {
    const items = this.state.items
    const { className } = this.props
    const id = `${className}_${items.length}_${Date.now()}`

    items.push(
      <fieldset key={id} id={id} className={this.props.groupName}>
        <legend>Literal Translation</legend>

        <div className="FormItemButtons">
          <FormMoveButtons
            id={id}
            idDescribedByItemMove={'describedByDefinitionMove'}
            textBtnMoveItemUp={'Move Definition up'}
            textBtnMoveItemDown={'Move Definition down'}
            handleClickMoveItemUp={this.handleClickMoveItemUp}
            handleClickMoveItemDown={this.handleClickMoveItemDown}
          />
          <FormRemoveButton
            id={id}
            textBtnRemoveItem={'Remove Definition'}
            handleClickRemoveItem={this.handleClickRemoveItem}
          />
        </div>
        <Select
          ariaDescribedby="describedbyLanguageLiteralTranslation"
          className="LiteralTranslationLanguage"
          id="CreateWord__LiteralTranslationLanguage0"
          labelText="Language"
          name="fv:literal_translation[0][language]"
        >
          {/* Note: Using optgroup until React 16 when can use Fragments, eg: <React.Fragment> or <> */}
          <optgroup>
            <option value="english">English</option>
            <option value="french">French</option>
            <option value="mandarin">Mandarin</option>
          </optgroup>
        </Select>
        <Text
          className="Create__LiteralTranslationTranslation"
          ariaDescribedby="describedByTranslationLiteralTranslation"
          id="CreateWord__LiteralTranslationTranslation0"
          labelText="Translation"
          name="fv:literal_translation[0][translation]"
        />
      </fieldset>
    )
    this.setState({
      items,
    })
  }
  handleClickRemoveItem = (id) => {
    this.setState({
      items: removeItem({ id, items: this.state.items }),
    })
  }
  handleClickMoveItemDown = (id) => {
    this.setState({
      items: moveItemDown({ id, items: this.state.items }),
    })
  }
  handleClickMoveItemUp = (id) => {
    this.setState({
      items: moveItemUp({ id, items: this.state.items }),
    })
  }
}