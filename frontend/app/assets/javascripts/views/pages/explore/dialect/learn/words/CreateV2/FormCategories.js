import React from 'react'
import { PropTypes } from 'react'
// import Text from './Text'

// NOTE: importing the non-wrapped provide() version
import FormCategory from './FormCategory'
import { getIndexOfElementById, removeItem, moveItemDown, moveItemUp } from './FormInteractions'
import ProviderHelpers from 'common/ProviderHelpers'
import provide from 'react-redux-provide'
import selectn from 'selectn'
import BrowseComponent from 'views/components/Editor/BrowseComponent'
const { string, array, object, func, number } = PropTypes

export class FormCategories extends React.Component {
  static propTypes = {
    name: string.isRequired,
    className: string,
    textInfo: string,
    items: array,
    idDescribedbyItemBrowse: string,
    idDescribedByItemMove: string,
    textDescribedbyItemBrowse: string,
    textDescribedByItemMove: string,
    textLegendItems: string,
    textBtnAddItem: string,
    textLegendItem: string,
    textBtnRemoveItem: string,
    textBtnMoveItemUp: string,
    textBtnMoveItemDown: string,
    textBtnCreateItem: string,
    textBtnSelectExistingItems: string,
    textLabelItemSearch: string,
    DEFAULT_PAGE: number,
    DEFAULT_PAGE_SIZE: number,
    DEFAULT_LANGUAGE: string,
    DEFAULT_SORT_COL: string,
    DEFAULT_SORT_TYPE: string,
    // REDUX/PROVIDE
    computeCategories: object.isRequired,
    computeDialect: object.isRequired,
    fetchCategories: func.isRequired,
    fetchDialect: func.isRequired,
    fetchResources: func.isRequired,
    splitWindowPath: array.isRequired,
  }
  static defaultProps = {
    className: 'FormCategories',
    idDescribedbyItemBrowse: 'describedbyCategoryBrowse',
    idDescribedByItemMove: 'describedByCategoryMove',
    name: 'FormCategories',
    textDescribedbyItemBrowse: 'Select a category from previously created categories',
    textDescribedByItemMove: `If you are adding multiple Categories, you can change the position of the category with
    the 'Move Category left' and 'Move Category right' buttons`,
    textLegendItems: 'Categories',
    textBtnAddItem: 'Add Category',
    textLegendItem: 'Category',
    textBtnRemoveItem: 'Remove Category',
    textBtnMoveItemUp: 'Move Category left',
    textBtnMoveItemDown: 'Move Category right',
    textBtnCreateItem: 'Create new category',
    textBtnSelectExistingItems: 'Select from existing categories',
    textLabelItemSearch: 'Search existing categories',
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 100,
    DEFAULT_LANGUAGE: 'english',
    DEFAULT_SORT_COL: 'dc:title',
    DEFAULT_SORT_TYPE: 'asc',
  }

  state = {
    items: [],
    loading: true,
    categories: [],
  }

  // Fetch data on initial render
  async componentDidMount() {
    const { fetchCategories, splitWindowPath } = this.props
    const categoriesPath = '/api/v1/path/FV/Workspaces/SharedData/Shared Categories/@children'
    await fetchCategories(categoriesPath)

    const dialect = await selectn('response', this.props.computeDialect)
    if (dialect) {
      this.setState({
        loading: false,
        dialect,
        dialectPath: ProviderHelpers.getDialectPathFromURLArray(splitWindowPath),
      })
    }
  }

  render() {
    const {
      className,
      idDescribedbyItemBrowse,
      idDescribedByItemMove,
      textDescribedbyItemBrowse,
      textDescribedByItemMove,
      textLegendItems,
    } = this.props

    const items = this.state.items

    return (
      <fieldset className={className}>
        <legend>{textLegendItems}</legend>

        <BrowseComponent
          type="FVCategory"
          label="Select from existing categories"
          onComplete={this.handleItemSelected}
          disabled={this.state.dialect === undefined}
          dialect={this.state.dialect}
          containerType="FVWord"
        />

        {items}

        {/* SCREEN READER DESCRIPTIONS --------------- */}
        <span id={idDescribedbyItemBrowse} className="visually-hidden">
          {textDescribedbyItemBrowse}
        </span>
        <span id={idDescribedByItemMove} className="visually-hidden">
          {textDescribedByItemMove}
        </span>
      </fieldset>
    )
  }

  handleItemSelected = (selected, callback) => {
    const uid = selectn('uid', selected)

    let { items } = this.state
    const { dialectPath } = this.state
    const arg = { id: uid, items }

    if (getIndexOfElementById(arg) !== -1) {
      items = removeItem(arg)
    }

    const _props = {
      name: this.props.name,
      className: this.props.className,
      idDescribedbyItemBrowse: this.props.idDescribedbyItemBrowse,
      idDescribedByItemMove: this.props.idDescribedByItemMove,
      textLegendItem: this.props.textLegendItem,
      textBtnRemoveItem: this.props.textBtnRemoveItem,
      textBtnMoveItemUp: this.props.textBtnMoveItemUp,
      textBtnMoveItemDown: this.props.textBtnMoveItemDown,
      textBtnCreateItem: this.props.textBtnCreateItem,
      textBtnSelectExistingItems: this.props.textBtnSelectExistingItems,
      textLabelItemSearch: this.props.textLabelItemSearch,
      handleClickSelectItem: this.handleClickSelectItem,
      handleClickRemoveItem: this.handleClickRemoveItem,
      handleClickMoveItemUp: this.handleClickMoveItemUp,
      handleClickMoveItemDown: this.handleClickMoveItemDown,
      handleItemSelected: this.handleItemSelected,
      computeDialectFromParent: this.props.computeDialect,
      DIALECT_PATH: dialectPath,
    }

    this.setState(
      {
        items: [...items, <FormCategory componentState={3} key={uid} id={uid} {..._props} />],
      },
      () => {
        if (callback) {
          callback()
        }
      }
    )
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

export default provide(FormCategories)