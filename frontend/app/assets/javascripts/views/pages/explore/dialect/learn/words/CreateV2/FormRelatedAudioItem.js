import React from 'react'
import { PropTypes } from 'react'
import Text from './Text'
import Textarea from './Textarea'
// import Select from './Select`'
import File from './File'
import Checkbox from './Checkbox'
import FormContributors from './FormContributors'
import FormRecorders from './FormRecorders'
import ProviderHelpers from 'common/ProviderHelpers'
// import DocumentListView from 'views/components/Document/DocumentListView'

// see about dropping:
import selectn from 'selectn'
import provide from 'react-redux-provide'

const { array, func, object, number, string } = PropTypes

export class FormRelatedAudioItem extends React.Component {
  STATE_DEFAULT = 1
  STATE_CREATE = 2
  STATE_CREATED = 3
  STATE_EDIT = 4
  STATE_BROWSE = 5

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
    fetchResources: func.isRequired,
    computeResources: object.isRequired,
    createAudio: func.isRequired,
  }
  static defaultProps = {
    className: 'FormRelatedAudioItem',
    id: 0,
    index: 0,
    componentState: 1,
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
    createItemFile: {},
    createItemIsShared: false,
    createItemIsChildFocused: false,
    createItemContributors: [],
    createItemRecorders: [],
  }

  DIALECT_PATH = undefined
  CONTRIBUTOR_PATH = undefined

  // Fetch data on initial render
  async componentDidMount() {
    const { computeDialect, fetchContributors, fetchDialect, fetchResources, splitWindowPath } = this.props

    // USING this.DIALECT_PATH instead of setting state
    // this.setState({ dialectPath: dialectPath })
    this.DIALECT_PATH = ProviderHelpers.getDialectPathFromURLArray(splitWindowPath)
    this.CONTRIBUTOR_PATH = `${this.DIALECT_PATH}/Contributors`
    // Get data for computeDialect
    if (!computeDialect.success) {
      await fetchDialect('/' + this.DIALECT_PATH)
    }

    const { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, DEFAULT_SORT_TYPE, DEFAULT_SORT_COL } = this.props
    let currentAppliedFilter = '' // eslint-disable-line
    // if (filter.has('currentAppliedFilter')) {
    //   currentAppliedFilter = Object.values(filter.get('currentAppliedFilter').toJS()).join('')
    // }
    // Get contrinbutors
    await fetchContributors(
      this.CONTRIBUTOR_PATH,
      `${currentAppliedFilter}&currentPageIndex=${DEFAULT_PAGE -
        1}&pageSize=${DEFAULT_PAGE_SIZE}&sortOrder=${DEFAULT_SORT_TYPE}&sortBy=${DEFAULT_SORT_COL}`
    )

    // Get existing audio files
    // TODO: hardcoded current page and page size!
    await fetchResources(
      '/FV/Workspaces/',
      `AND ecm:primaryType LIKE 'FVAudio' AND ecm:isCheckedInVersion = 0 AND ecm:isTrashed = 0 AND ecm:currentLifeCycleState != 'Disabled' AND (ecm:path STARTSWITH '${
        this.DIALECT_PATH
      }/Resources/')&currentPageIndex=${0}&pageSize=${10}`
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
      // textBtnEditItem,
      textBtnSelectExistingItems,
      // textLabelItemSearch,
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
      case this.STATE_CREATE:
        // CREATE AUDIO ------------------------------------
        componentContent = (
          <div>
            <h2>Create new audio (...)</h2>
            {/* Name --------------- */}
            {/* <Text className="CreateAudio__Name" id="CreateAudio__Name" labelText="Name" name="dc:title" value="" /> */}

            {/* Name ------------- */}
            <Text
              className={`${className}__ContributorNewName`}
              id={`${className}__Contributor${index}__NewName`}
              labelText="Related Audio Item name"
              name={`${name}[${index}]__NewName`}
              value=""
              handleChange={(data) => {
                this.setState({ createItemName: data })
              }}
            />
            {/* Description --------------- */}
            <Textarea
              className="CreateAudio__Description"
              id="CreateAudio__Description"
              labelText="Description"
              name="dc:description"
              value=""
              handleChange={(data) => {
                this.setState({ createItemDescription: data })
              }}
            />

            {/* File --------------- */}
            <File
              className="CreateAudio__File"
              id="CreateAudio__File"
              labelText="File"
              name="file"
              value=""
              handleChange={(data) => {
                this.setState({ createItemFile: data })
              }}
            />

            {/* Shared --------------- */}
            <Checkbox
              className="CreateAudio__Shared"
              id="CreateAudio__Shared"
              labelText="Shared accross dialects?"
              name="fvm:shared"
              handleChange={(data) => {
                this.setState({ createItemIsShared: data })
              }}
            />
            {/* Child focused --------------- */}
            <Checkbox
              className="CreateAudio__ChildFocused"
              id="CreateAudio__ChildFocused"
              labelText="Child focused "
              name="fvm:child_focused"
              handleChange={(data) => {
                this.setState({ createItemIsChildFocused: data })
              }}
            />

            {/* Contributors: fvm:source --------------- */}
            <FormContributors
              name="fv:source"
              textInfo="Contributors who helped create this audio."
              handleItemsUpdate={(data) => {
                this.setState({ createItemContributors: data })
              }}
            />

            {/* Recorders: fvm:recorder --------------- */}
            <FormRecorders
              name="fvm:recorder"
              textInfo="Recorders who helped create this audio."
              handleItemsUpdate={(data) => {
                this.setState({ createItemRecorders: data })
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
              Create new Audio Item
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
              {"Cancel, don't add a new Audio Item"}
            </button>
          </div>
        )
        break
      case this.STATE_CREATED: {
        // AUDIO CREATED/SELECTED ------------------------------------
        const { audioUid } = this.state
        componentContent = (
          <fieldset>
            <legend>{textLegendItem}</legend>

            <input type="hidden" name={`${name}[${index}]`} value={audioUid} />
            <div>[AUDIO ({audioUid}) HERE]</div>

            {removeItemBtn}

            {moveItemBtns}
          </fieldset>
        )
        break
      }
      case this.STATE_EDIT:
        // EDITING A CONTRIBUTOR ------------------------------------
        componentContent = (
          <div>
            <h2>TODO: Editing contributor</h2>

            {/* Name ------------- */}
            <Text
              className={`${className}__ContributorEditName`}
              id={`${className}__Contributor${index}__EditName`}
              labelText="Related Audio Item name"
              name={`${name}[${index}]__EditName`}
              value="[some prefilled value"
            />

            {/* Description ------------- */}
            <Textarea
              className={`${className}__ContributorEditDescription`}
              id={`${className}__Contributor${index}__EditDescription`}
              labelText="Related Audio Item description"
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
                  componentState: this.STATE_CREATED,
                })
              }}
            >
              {"Cancel, don't update contributor"}
            </button>
          </div>
        )
        break
      case this.STATE_BROWSE: {
        // Select from existing audio  ------------------------------------

        const { computeResources, computeDialect2 } = this.props // eslint-disable-line
        const _computeResources = ProviderHelpers.getEntry(computeResources, '/FV/Workspaces/')
        const items =
          selectn('response.entries', _computeResources) || selectn('response_prev.entries', _computeResources) || []
        let audioExisting = []

        audioExisting = items.map((element, i) => {
          const uid = element.uid
          const audioId = `related_audio_${uid}`
          return (
            <div className={`${className}__browseItem`} key={i}>
              <div className={`${className}__browseItemGroup1`}>
                <input
                  className={`${className}__browseItemRadio`}
                  type="radio"
                  id={audioId}
                  name="related_audio"
                  value={uid}
                />
              </div>
              <div className={`${className}__browseItemGroup2`}>
                <label htmlFor={audioId}>{`Select '${element.title}'`}</label>
                <audio src={selectn('properties.file:content.data', element)} preload="none" controls />
              </div>
            </div>
          )
        })

        componentContent = (
          <div>
            <div
              onChange={(event) => {
                this.setState({
                  relatedAudioUid: event.target.value,
                })
              }}
            >
              {audioExisting}
            </div>

            {/* Save/select contributor ------------- */}
            <button
              type="button"
              disabled={this.state.relatedAudioUid === undefined}
              onClick={() => {
                this.setState({
                  componentState: this.STATE_CREATED,
                  audioUid: this.state.relatedAudioUid,
                })
              }}
            >
              Add selected Related Audio Item
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
              {"Cancel, don't add Related Audio Item"}
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
              {textBtnSelectExistingItems}
            </button>

            {removeItemBtn}

            {moveItemBtns}
          </div>
        )
    }
    return (
      <fieldset className={className}>
        <legend>{textLegendItem}</legend>
        {componentContent}
      </fieldset>
    )
  }
  _handleClickCreateItem = () => {
    const { handleClickCreateItem } = this.props
    this.setState(
      {
        componentState: this.STATE_CREATE,
      },
      () => {
        // console.log('!', this.refs.ItemNewName)
        // if (this.refs.ItemNewName) {
        //   console.log('!!!!!! focusing!!!!!!!')
        //   this.refs.ItemNewName.focus()
        // }
        handleClickCreateItem()
      }
    )
  }
  _handleClickEditItem = (id) => {
    const { handleClickEditItem } = this.props
    this.setState(
      {
        componentState: this.STATE_EDIT,
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
        componentState: this.STATE_BROWSE,
      },
      () => {
        handleClickSelectItem()
      }
    )
  }
  _handleSubmitExistingItem = (createItemUid) => {
    this.setState(
      {
        componentState: this.STATE_CREATED,
        contributorUid: createItemUid,
      },
      () => {}
    )
  }

  async _handleCreateItemSubmit() {
    // const { createItemName, createItemDescription } = this.state
    // if (createItemName) {
    //   const now = Date.now()
    //   await this.props.createContributor(
    //     `${this.DIALECT_PATH}/Contributors`,
    //     {
    //       type: 'FVContributor',
    //       name: createItemName,
    //       properties: { 'dc:title': createItemName, 'dc:description': createItemDescription },
    //     },
    //     null,
    //     now
    //   )
    //   const contributor = ProviderHelpers.getEntry(
    //     this.props.computeContributor,
    //     `${this.DIALECT_PATH}/Contributors/${createItemName}.${now}`
    //   )
    //   const response = contributor.response
    //   if (response && response.uid) {
    //     this.setState({
    //       componentState: this.STATE_CREATED,
    //       contributorUid: response.uid,
    //     })
    //   }
    // }
    // const timestamp = Date.now()
    // const {
    //   createItemName,
    //   createItemDescription,
    //   createItemFile,
    //   createItemIsShared,
    //   createItemIsChildFocused,
    //   createItemContributors,
    //   createItemRecorders,
    // } = this.state
    // const docParams = {
    //   type: 'FVAudio',
    //   name: createItemName,
    //   properties: {
    //   },
    // }
    /*
    {"params":{
    "type":"FVAudio",
    "name":"adsf",
    "properties":{
        "dc:title":"adsf",
        "dc:description":"adfs",
        "fvm:shared":true,
        "fvm:child_focused":true,
        "fvm:recorder":[
            "231bcb24-8aa2-482e-a6b5-ff9360c8fc83",
            "231bcb24-8aa2-482e-a6b5-ff9360c8fc83"
        ],
        "fvm:source":[ // contributor
            "231bcb24-8aa2-482e-a6b5-ff9360c8fc83",
            "df08a447-9d7b-44cc-9d6c-07120a1abe6f"
        ]
}
},"context":{},"input":"/FV/Workspaces/Data/Athabascan/Dene/Dene/Resources"}
*/
    // await this.props.createAudio(`${this.DIALECT_PATH}/Resources`, docParams, file, timestamp)
  }
}

export default provide(FormRelatedAudioItem)
