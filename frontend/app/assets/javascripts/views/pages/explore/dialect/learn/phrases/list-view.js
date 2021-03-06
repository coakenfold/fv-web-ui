/*
Copyright 2016 First People's Cultural Council

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import React, { PropTypes } from 'react'
import Immutable, { Map } from 'immutable'

import provide from 'react-redux-provide'
import selectn from 'selectn'

import PromiseWrapper from 'views/components/Document/PromiseWrapper'

import ProviderHelpers from 'common/ProviderHelpers'
import NavigationHelpers from 'common/NavigationHelpers'
import StringHelpers from 'common/StringHelpers'
import UIHelpers from 'common/UIHelpers'

import DocumentListView from 'views/components/Document/DocumentListView'
import DocumentListViewDatatable from 'views/components/Document/DocumentListViewDatatable'
import DataListView from 'views/pages/explore/dialect/learn/base/data-list-view'
import Preview from 'views/components/Editor/Preview'
import IntlService from 'views/services/intl'

const intl = IntlService.instance
/**
 * List view for phrases
 */
@provide
class ListView extends DataListView {
  static defaultProps = {
    disableClickItem: true,
    DISABLED_SORT_COLS: ['state', 'fv-phrase:phrase_books', 'related_audio', 'related_pictures', 'dc:modified'],
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    DEFAULT_LANGUAGE: 'english',
    DEFAULT_SORT_COL: 'fv:custom_order',
    DEFAULT_SORT_TYPE: 'asc',
    ENABLED_COLS: ['title', 'fv:definitions', 'related_pictures', 'related_audio', 'fv-phrase:phrase_books'],
    dialect: null,
    filter: new Map(),
    gridListView: false,
    gridCols: 4,
    controlViaURL: false,
    flashcard: false,
    flashcardTitle: '',
    useDatatable: false,
  }

  static propTypes = {
    disableClickItem: PropTypes.bool,
    properties: PropTypes.object.isRequired,
    windowPath: PropTypes.string.isRequired,
    splitWindowPath: PropTypes.array.isRequired,
    pushWindowPath: PropTypes.func.isRequired,
    computeLogin: PropTypes.object.isRequired,
    fetchDialect2: PropTypes.func.isRequired,
    fetchPhrases: PropTypes.func.isRequired,
    computeDialect2: PropTypes.object.isRequired,
    dialect: PropTypes.object,
    computePhrases: PropTypes.object.isRequired,
    routeParams: PropTypes.object.isRequired,
    pageProperties: PropTypes.object,
    filter: PropTypes.object,
    data: PropTypes.string,
    gridListView: PropTypes.bool,
    gridCols: PropTypes.number,
    controlViaURL: PropTypes.bool,
    parentID: PropTypes.string,
    onPaginationReset: PropTypes.func,
    onPagePropertiesChange: PropTypes.func,
    action: PropTypes.func,
    useDatatable: PropTypes.bool,

    ENABLED_COLS: PropTypes.array,
    DISABLED_SORT_COLS: PropTypes.array,
    DEFAULT_PAGE: PropTypes.number,
    DEFAULT_PAGE_SIZE: PropTypes.number,
    DEFAULT_SORT_COL: PropTypes.string,
    DEFAULT_SORT_TYPE: PropTypes.string,
    flashcard: PropTypes.bool,
    flashcardTitle: PropTypes.string,
  }

  constructor(props, context) {
    super(props, context)

    const currentTheme = this.props.routeParams.theme

    this.state = {
      columns: [
        {
          name: 'title',
          title: intl.trans('phrase', 'Phrase', 'first'),
          render: (v, data) => {
            const href = NavigationHelpers.generateUIDPath(currentTheme, data, 'phrases')
            const clickHandler = props.disableClickItem ? NavigationHelpers.disable : null
            return (
              <a onClick={clickHandler} href={href}>
                {v}
              </a>
            )
          },
          sortName: 'fv:custom_order',
        },
        {
          name: 'fv:definitions',
          title: intl.trans('definitions', 'Definitions', 'first'),
          render: (v, data, cellProps) => {
            return UIHelpers.renderComplexArrayRow(selectn('properties.' + cellProps.name, data), (entry, i) => {
              if (entry.language === this.props.DEFAULT_LANGUAGE && i < 2) {
                return <li key={i}>{entry.translation}</li>
              }
            })
          },
          sortName: 'fv:definitions/0/translation',
        },
        {
          name: 'related_audio',
          title: intl.trans('audio', 'Audio', 'first'),
          render: (v, data, cellProps) => {
            const firstAudio = selectn('contextParameters.phrase.' + cellProps.name + '[0]', data)
            if (firstAudio) {
              return (
                <Preview
                  minimal
                  tagStyles={{ width: '300px', maxWidth: '100%' }}
                  key={selectn('uid', firstAudio)}
                  expandedValue={firstAudio}
                  type="FVAudio"
                />
              )
            }
          },
        },
        {
          name: 'related_pictures',
          width: 72,
          textAlign: 'center',
          title: intl.trans('picture', 'Picture', 'first'),
          render: (v, data, cellProps) => {
            const firstPicture = selectn('contextParameters.phrase.' + cellProps.name + '[0]', data)
            if (firstPicture) {
              return (
                <img
                  style={{ maxWidth: '62px', maxHeight: '45px' }}
                  key={selectn('uid', firstPicture)}
                  src={UIHelpers.getThumbnail(firstPicture, 'Thumbnail')}
                />
              )
            }
          },
        },
        {
          name: 'fv-phrase:phrase_books',
          title: intl.trans('phrase_books', 'Phrase Books', 'words'),
          render: (v, data) => {
            return UIHelpers.renderComplexArrayRow(
              selectn('contextParameters.phrase.phrase_books', data),
              (entry, i) => <li key={i}>{selectn('dc:title', entry)}</li>
            )
          },
        },
        {
          name: 'dc:modified',
          width: 210,
          title: intl.trans('date_modified', 'Date Modified'),
          render: (v, data) => {
            return StringHelpers.formatUTCDateString(selectn('lastModified', data))
          },
        },
        {
          name: 'dc:created',
          width: 210,
          title: intl.trans('date_created', 'Date Created'),
          render: (v, data) => {
            return StringHelpers.formatUTCDateString(selectn('properties.dc:created', data))
          },
        },
      ],
      sortInfo: {
        uiSortOrder: [],
        currentSortCols: this.props.DEFAULT_SORT_COL,
        currentSortType: this.props.DEFAULT_SORT_TYPE,
      },
      pageInfo: {
        page: this.props.DEFAULT_PAGE,
        pageSize: this.props.DEFAULT_PAGE_SIZE,
      },
    }

    // Reduce the number of columns displayed for mobile
    if (UIHelpers.isViewSize('xs')) {
      this.state.columns = this.state.columns.filter((v) => ['title', 'fv:definitions'].indexOf(v.name) !== -1)
      this.state.hideStateColumn = true
    }

    // Only show enabled cols if specified
    if (this.props.ENABLED_COLS.length > 0) {
      this.state.columns = this.state.columns.filter((v) => this.props.ENABLED_COLS.indexOf(v.name) != -1)
    }

    // Bind methods to 'this'
    [
      '_onEntryNavigateRequest',
      '_handleRefetch',
      '_handleSortChange',
      '_handleColumnOrderChange',
      '_getPathOrParentID',
    ].forEach((method) => (this[method] = this[method].bind(this)))
  }

  render() {
    const computeEntities = Immutable.fromJS([
      {
        id: this._getPathOrParentID(this.props),
        entity: this.props.computePhrases,
      },
    ])

    // If dialect not supplied, promise wrapper will need to wait for compute dialect
    if (!this.props.dialect) {
      computeEntities.push(
        new Map({
          id: this.props.routeParams.dialect_path,
          entity: this.props.computeDialect2,
        })
      )
    }

    const computePhrases = ProviderHelpers.getEntry(this.props.computePhrases, this._getPathOrParentID(this.props))
    const computeDialect2 = this.props.dialect || this.getDialect()

    const DocumentView = this.props.useDatatable ? (
      <DocumentListViewDatatable
        objectDescriptions="phrases"
        type="FVPhrase"
        data={computePhrases}
        gridCols={this.props.gridCols}
        gridListView={this.props.gridListView}
        refetcher={this._handleRefetch}
        onSortChange={this._handleSortChange}
        onSelectionChange={this._onEntryNavigateRequest}
        page={this.state.pageInfo.page}
        pageSize={this.state.pageInfo.pageSize}
        onColumnOrderChange={this._handleColumnOrderChange}
        columns={this.state.columns}
        sortInfo={this.state.sortInfo.uiSortOrder}
        className="browseDataGrid"
        dialect={selectn('response', computeDialect2)}
        flashcard={this.props.flashcard}
        flashcardTitle={this.props.flashcardTitle}
      />
    ) : (
      <DocumentListView
        objectDescriptions="phrases"
        type="FVPhrase"
        data={computePhrases}
        gridCols={this.props.gridCols}
        gridListView={this.props.gridListView}
        refetcher={this._handleRefetch}
        onSortChange={this._handleSortChange}
        onSelectionChange={this._onEntryNavigateRequest}
        page={this.state.pageInfo.page}
        pageSize={this.state.pageInfo.pageSize}
        onColumnOrderChange={this._handleColumnOrderChange}
        columns={this.state.columns}
        sortInfo={this.state.sortInfo.uiSortOrder}
        className="browseDataGrid"
        dialect={selectn('response', computeDialect2)}
        flashcard={this.props.flashcard}
        flashcardTitle={this.props.flashcardTitle}
      />
    )
    return (
      <PromiseWrapper renderOnError computeEntities={computeEntities}>
        {selectn('response.entries', computePhrases) && DocumentView}
      </PromiseWrapper>
    )
  }

  // NOTE: DataListView calls `fetchData`
  fetchData(newProps) {
    if (newProps.dialect === null && !this.getDialect(newProps)) {
      newProps.fetchDialect2(newProps.routeParams.dialect_path)
    }
    this._fetchListViewData(
      newProps,
      newProps.DEFAULT_PAGE,
      newProps.DEFAULT_PAGE_SIZE,
      newProps.DEFAULT_SORT_TYPE,
      newProps.DEFAULT_SORT_COL
    )
  }

  getDialect(props = this.props) {
    return ProviderHelpers.getEntry(props.computeDialect2, props.routeParams.dialect_path)
  }

  _fetchListViewData(props, pageIndex, pageSize, sortOrder, sortBy) {
    let currentAppliedFilter = ''

    if (props.filter.has('currentAppliedFilter')) {
      currentAppliedFilter = Object.values(props.filter.get('currentAppliedFilter').toJS()).join('')
    }
    props.fetchPhrases(
      this._getPathOrParentID(props),
      `${currentAppliedFilter}&currentPageIndex=${pageIndex -
        1}&pageSize=${pageSize}&sortOrder=${sortOrder}&sortBy=${sortBy}`
    )
  }

  _getPathOrParentID(newProps) {
    return newProps.parentID ? newProps.parentID : newProps.routeParams.dialect_path + '/Dictionary'
  }

  _onEntryNavigateRequest(item) {
    if (this.props.action) {
      this.props.action(item)
    } else {
      NavigationHelpers.navigate(
        NavigationHelpers.generateUIDPath(this.props.routeParams.theme, item, 'phrases'),
        this.props.pushWindowPath,
        true
      )
    }
  }
}

export default ListView
