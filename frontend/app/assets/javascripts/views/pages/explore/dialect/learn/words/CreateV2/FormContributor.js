import React from 'react'
import { PropTypes } from 'react'
import Text from './Text'
import Textarea from './Textarea'
import Select from './Select'

import provide from 'react-redux-provide'
import ProviderHelpers from 'common/ProviderHelpers'
// import DocumentListView from 'views/components/Document/DocumentListView'
const { array, func, object, number, string } = PropTypes

export class FormContributor extends React.Component {
  STATE_DEFAULT = 1
  STATE_CREATE_CONTRIBUTOR = 2
  STATE_CREATED_CONTRIBUTOR = 3
  STATE_EDIT_CONTRIBUTOR = 4
  STATE_BROWSE_CONTRIBUTORS = 5

  static propTypes = {
    name: string,
    className: string,
    id: number,
    idDescribedbyItemBrowse: string,
    idDescribedByItemMove: string,
    index: number,
    textBtnRemoveItem: string,
    textBtnMoveItemUp: string,
    textBtnMoveItemDown: string,
    textBtnCreateItem: string,
    textBtnEditItem: string,
    textBtnSelectExistingItems: string,
    textLabelItemSearch: string,
    textLegendItem: string,
    handleClickCreateItem: func,
    handleClickEditItem: func,
    handleClickSelectItem: func,
    handleClickRemoveItem: func,
    handleClickMoveItemUp: func,
    handleClickMoveItemDown: func,
    componentState: number,
    value: string,
    DISABLED_SORT_COLS: array,
    DEFAULT_PAGE: number,
    DEFAULT_PAGE_SIZE: number,
    DEFAULT_LANGUAGE: string,
    DEFAULT_SORT_COL: string,
    DEFAULT_SORT_TYPE: string,
    handleItemChange: func,
    // REDUX/PROVIDE
    computeContributors: object.isRequired,
    createContributor: func.isRequired,
    splitWindowPath: array.isRequired,
    fetchDialect: func.isRequired,
    computeDialect: object.isRequired,
    computeDialect2: object.isRequired,
    computeCreateContributor: object,
    computeContributor: object.isRequired,
    fetchContributors: func.isRequired,
  }
  static defaultProps = {
    id: 0,
    index: 0,
    componentState: 1,
    handleItemChange: () => {},
    handleClickCreateItem: () => {},
    handleClickEditItem: () => {},
    handleClickSelectItem: () => {},
    handleClickRemoveItem: () => {},
    handleClickMoveItemUp: () => {},
    handleClickMoveItemDown: () => {},
    DISABLED_SORT_COLS: ['state'],
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 100,
    DEFAULT_LANGUAGE: 'english',
    DEFAULT_SORT_COL: 'dc:title',
    DEFAULT_SORT_TYPE: 'asc',
  }
  state = {
    componentState: this.props.componentState,
    createItemName: '',
    createItemDescription: '',
  }

  DIALECT_PATH = undefined
  CONTRIBUTOR_PATH = undefined

  // Fetch data on initial render
  async componentDidMount() {
    const { computeDialect, splitWindowPath } = this.props

    // USING this.DIALECT_PATH instead of setting state
    // this.setState({ dialectPath: dialectPath })
    this.DIALECT_PATH = ProviderHelpers.getDialectPathFromURLArray(splitWindowPath)
    this.CONTRIBUTOR_PATH = `${this.DIALECT_PATH}/Contributors`
    // Get data for computeDialect
    if (!computeDialect.success) {
      await this.props.fetchDialect('/' + this.DIALECT_PATH)
    }

    const { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, DEFAULT_SORT_TYPE, DEFAULT_SORT_COL } = this.props
    let currentAppliedFilter = '' // eslint-disable-line
    // if (filter.has('currentAppliedFilter')) {
    //   currentAppliedFilter = Object.values(filter.get('currentAppliedFilter').toJS()).join('')
    // }
    await this.props.fetchContributors(
      this.CONTRIBUTOR_PATH,
      `${currentAppliedFilter}&currentPageIndex=${DEFAULT_PAGE -
        1}&pageSize=${DEFAULT_PAGE_SIZE}&sortOrder=${DEFAULT_SORT_TYPE}&sortBy=${DEFAULT_SORT_COL}`
    )
  }

  //   AFTER SUBMITTING NEW CONTRIBUTOR
  // ProviderHelpers.getEntry(nextProps.computeContributor, this.state.contributorPath).response

  render() {
    const {
      className,
      name,
      id,
      idDescribedbyItemBrowse,
      idDescribedByItemMove,
      index,
      textBtnRemoveItem,
      textBtnMoveItemUp,
      textBtnMoveItemDown,
      textBtnCreateItem,
      textBtnEditItem,
      textBtnSelectExistingItems,
      textLabelItemSearch,
      textLegendItem,
      // handleClickSelectItem,
      handleClickRemoveItem,
      handleClickMoveItemUp,
      handleClickMoveItemDown,
      // value,
    } = this.props

    let componentContent = null

    const moveItemBtns = (
      <div>
        {/* Move contributor */}
        <button
          aria-describedby={idDescribedByItemMove}
          onClick={() => {
            handleClickMoveItemUp(id)
          }}
          type="button"
        >
          {textBtnMoveItemUp}
        </button>

        {/* Move contributor */}
        <button
          aria-describedby={idDescribedByItemMove}
          onClick={() => {
            handleClickMoveItemDown(id)
          }}
          type="button"
        >
          {textBtnMoveItemDown}
        </button>
      </div>
    )
    const removeItemBtn = (
      // Remove contributor
      <button
        onClick={() => {
          handleClickRemoveItem(id)
        }}
        type="button"
      >
        {textBtnRemoveItem}
      </button>
    )
    switch (this.state.componentState) {
      case this.STATE_CREATE_CONTRIBUTOR:
        // CREATE A NEW CONTRIBUTOR ------------------------------------
        componentContent = (
          <div>
            <h2>Creating a new contributor</h2>

            {/* Name ------------- */}
            <Text
              className={`${className}__ContributorNewName`}
              id={`${className}__Contributor${index}__NewName`}
              labelText="Contributor name"
              name={`${name}[${index}]__NewName`}
              value=""
              handleChange={(_name) => {
                this.setState({ createItemName: _name })
              }}
            />

            {/* Description ------------- */}
            <Textarea
              className={`${className}__ContributorNewDescription`}
              id={`${className}__Contributor${index}__NewDescription`}
              labelText="Contributor description"
              name={`${name}[${index}]__NewDescription`}
              value=""
              handleChange={(description) => {
                this.setState({ createItemDescription: description })
              }}
            />

            {/* BTN: Create contributor ------------- */}
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                this._handleCreateItemSubmit()
              }}
            >
              Create new contributor
            </button>

            {/* BTN: Cancel, go back ------------- */}
            <button
              type="button"
              onClick={() => {
                this.setState({
                  componentState: this.STATE_DEFAULT,
                })
              }}
            >
              {"Cancel, don't create a new contributor"}
            </button>
          </div>
        )
        break
      case this.STATE_CREATED_CONTRIBUTOR: {
        // CONTRIBUTOR CREATED ------------------------------------
        const { contributorUid } = this.state
        componentContent = (
          <fieldset>
            <legend>{textLegendItem}</legend>

            <input type="hidden" name={`${name}[${index}]`} value={contributorUid} />
            <div>[CONTRIBUTOR ({contributorUid}) HERE]</div>

            {/* Edit contributor */}
            <button
              onClick={() => {
                this._handleClickEditItem(id)
              }}
              type="button"
            >
              {textBtnEditItem}
            </button>

            {removeItemBtn}

            {moveItemBtns}
          </fieldset>
        )
        break
      }
      case this.STATE_EDIT_CONTRIBUTOR:
        // EDITING A CONTRIBUTOR ------------------------------------
        componentContent = (
          <div>
            <h2>TODO: Editing contributor</h2>

            {/* Name ------------- */}
            <Text
              className={`${className}__ContributorEditName`}
              id={`${className}__Contributor${index}__EditName`}
              labelText="Contributor name"
              name={`${name}[${index}]__EditName`}
              value="[some prefilled value"
            />

            {/* Description ------------- */}
            <Textarea
              className={`${className}__ContributorEditDescription`}
              id={`${className}__Contributor${index}__EditDescription`}
              labelText="Contributor description"
              name={`${name}[${index}]__EditDescription`}
              value=""
            />

            {/* BTN: Create contributor ------------- */}
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                this._handleCreateItemSubmit()
              }}
            >
              Update contributor
            </button>

            {/* BTN: Cancel, go back ------------- */}
            <button
              type="button"
              onClick={() => {
                this.setState({
                  componentState: this.STATE_CREATED_CONTRIBUTOR,
                })
              }}
            >
              {"Cancel, don't edit a contributor"}
            </button>
          </div>
        )
        break
      case this.STATE_BROWSE_CONTRIBUTORS: {
        // BROWSING CONTRIBUTORS ------------------------------------
        const _computeContributors = ProviderHelpers.getEntry(this.props.computeContributors, this.CONTRIBUTOR_PATH)
        // const _computeDialect2 = ProviderHelpers.getEntry(this.props.computeDialect2, this.DIALECT_PATH)
        let contributors = []
        if (_computeContributors.response && _computeContributors.response.entries) {
          contributors = _computeContributors.response.entries.map((element, i) => {
            return (
              <option key={i} value={element.uid}>
                {element.title}, {element.type}, {element.state}
              </option>
            )
          })
        }
        componentContent = (
          <div>
            <Select
              className="FormContributor__NewContributorSelect"
              id="FormContributor__NewContributorSelect"
              labelText="Select from existing Contributors"
              name="FormContributor__NewContributorSelect"
              refSelect={(input) => {
                this.newItemSelect = input
              }}
            >
              {/* Note: Using optgroup until React 16 when can use Fragments, eg: <React.Fragment> or <> */}
              <optgroup>{contributors}</optgroup>
            </Select>

            {/* Save/select contributor ------------- */}
            <button
              type="button"
              onClick={() => {
                const contributorUid = this.newItemSelect.value
                this.setState(
                  {
                    componentState: this.STATE_CREATED_CONTRIBUTOR,
                    contributorUid,
                  },
                  () => {
                    this.props.handleItemChange({
                      uid: contributorUid,
                      id: this.props.id,
                    })
                  }
                )
              }}
            >
              Add selected Contributor
            </button>

            {/* BTN: Cancel, go back ------------- */}
            <button
              type="button"
              onClick={() => {
                this.setState({
                  componentState: this.STATE_DEFAULT,
                })
              }}
            >
              {"Cancel, don't add a contributor"}
            </button>
          </div>
        )
        break
      }
      default:
        // INITIAL STATE ------------------------------------
        componentContent = (
          <div>
            {/* Create contributor */}
            <button
              type="button"
              onClick={() => {
                this._handleClickCreateItem()
              }}
            >
              {textBtnCreateItem}
            </button>

            {/* Browse/select contributor */}
            <button
              aria-describedby={idDescribedbyItemBrowse}
              onClick={() => {
                this._handleClickSelectItem()
              }}
              type="button"
            >
              {textBtnSelectExistingItems} (TODO)
            </button>

            {/* Search contributors */}
            <Text
              className={`${className}__Contributor`}
              id={`${className}__Contributor${index}`}
              labelText={textLabelItemSearch}
              name={`${name}[${index}]`}
              value=""
            />

            {removeItemBtn}

            {moveItemBtns}
          </div>
        )
    }
    return (
      <fieldset>
        <legend>{textLegendItem}</legend>
        {componentContent}
      </fieldset>
    )
  }
  _handleClickCreateItem = () => {
    const { handleClickCreateItem } = this.props
    this.setState(
      {
        componentState: this.STATE_CREATE_CONTRIBUTOR,
      },
      () => {
        handleClickCreateItem()
      }
    )
  }
  _handleClickEditItem = (id) => {
    const { handleClickEditItem } = this.props
    this.setState(
      {
        componentState: this.STATE_EDIT_CONTRIBUTOR,
      },
      () => {
        handleClickEditItem(id)
      }
    )
  }
  _handleClickSelectItem = () => {
    const { handleClickSelectItem } = this.props
    this.setState(
      {
        componentState: this.STATE_BROWSE_CONTRIBUTORS,
      },
      () => {
        handleClickSelectItem()
      }
    )
  }
  _handleSubmitExistingItem = (createItemUid) => {
    this.setState(
      {
        componentState: this.STATE_CREATED_CONTRIBUTOR,
        contributorUid: createItemUid,
      },
      () => {
        this.props.handleItemChange({
          uid: createItemUid,
          id: this.props.id,
        })
      }
    )
  }

  async _handleCreateItemSubmit() {
    const { createItemName, createItemDescription } = this.state
    if (createItemName) {
      const now = Date.now()

      await this.props.createContributor(
        `${this.DIALECT_PATH}/Contributors`,
        {
          type: 'FVContributor',
          name: createItemName,
          properties: { 'dc:title': createItemName, 'dc:description': createItemDescription },
        },
        null,
        now
      )

      const contributor = ProviderHelpers.getEntry(
        this.props.computeContributor,
        `${this.DIALECT_PATH}/Contributors/${createItemName}.${now}`
      )
      const response = contributor.response
      if (response && response.uid) {
        this.setState(
          {
            componentState: this.STATE_CREATED_CONTRIBUTOR,
            contributorUid: response.uid,
          },
          () => {
            this.props.handleItemChange({
              uid: response.uid,
              id: this.props.id,
            })
          }
        )
      }
    }
  }
}

export default provide(FormContributor)
