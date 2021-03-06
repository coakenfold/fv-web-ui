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
import React, { Component, PropTypes } from 'react'
import Immutable, { List, Map } from 'immutable'
import provide from 'react-redux-provide'
import selectn from 'selectn'

import PromiseWrapper from 'views/components/Document/PromiseWrapper'

import ProviderHelpers from 'common/ProviderHelpers'
import DocumentListView from 'views/components/Document/DocumentListView'
import DocumentListViewDatatable from 'views/components/Document/DocumentListViewDatatable'

import DataListView from 'views/pages/explore/dialect/learn/base/data-list-view'
import IntlService from 'views/services/intl'

const intl = IntlService.instance
/**
 * List view for contributors
 */
@provide
class ListView extends DataListView {
  static defaultProps = {
    DISABLED_SORT_COLS: ['state'],
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 100,
    DEFAULT_LANGUAGE: 'english',
    DEFAULT_SORT_COL: 'dc:title',
    DEFAULT_SORT_TYPE: 'asc',
    dialect: null,
    filter: new Map(),
    gridListView: false,
    gridCols: 4,
    useDatatable: false,
  }

  static propTypes = {
    properties: PropTypes.object.isRequired,
    windowPath: PropTypes.string.isRequired,
    splitWindowPath: PropTypes.array.isRequired,
    pushWindowPath: PropTypes.func.isRequired,
    computeLogin: PropTypes.object.isRequired,
    fetchDialect2: PropTypes.func.isRequired,
    fetchContributors: PropTypes.func.isRequired,
    computeDialect2: PropTypes.object.isRequired,
    dialect: PropTypes.object,
    computeContributors: PropTypes.object.isRequired,
    routeParams: PropTypes.object.isRequired,
    filter: PropTypes.object,
    data: PropTypes.string,
    gridListView: PropTypes.bool,
    gridCols: PropTypes.number,
    action: PropTypes.func,

    DISABLED_SORT_COLS: PropTypes.array,
    DEFAULT_PAGE: PropTypes.number,
    DEFAULT_PAGE_SIZE: PropTypes.number,
    DEFAULT_SORT_COL: PropTypes.string,
    DEFAULT_SORT_TYPE: PropTypes.string,
    useDatatable: PropTypes.bool,
  }

  constructor(props, context) {
    super(props, context)

    this.state = {
      columns: [
        {
          name: 'title',
          title: intl.trans('contributor', 'Contributor', 'first'),
          render: (v, data, cellProps) => v,
        },
        {
          name: 'dc:description',
          title: intl.trans('short_proflile', 'Short Profile', 'words'),
          render: (v, data, cellProps) => selectn('properties.dc:description', data),
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
      contributorsPath: `${props.routeParams.dialect_path}/Contributors`,
    }

    // Bind methods to 'this'
    ;[
      '_onNavigateRequest',
      '_onEntryNavigateRequest',
      '_handleRefetch',
      '_handleSortChange',
      '_handleColumnOrderChange',
      '_resetColumns',
      '_fetchListViewData',
    ].forEach((method) => (this[method] = this[method].bind(this)))
  }

  // NOTE: DataListView calls `fetchData`
  fetchData(newProps) {
    if (newProps.dialect == null) {
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

  _onEntryNavigateRequest(item) {
    if (this.props.action) {
      this.props.action(item)
    } else {
      //this.props.pushWindowPath('/' + this.props.routeParams.theme + item.path.replace('Dictionary', 'words/contributors/' + item.uid));
    }
  }

  _fetchListViewData(props, pageIndex, pageSize, sortOrder, sortBy) {
    let currentAppliedFilter = ''

    if (props.filter.has('currentAppliedFilter')) {
      currentAppliedFilter = Object.values(props.filter.get('currentAppliedFilter').toJS()).join('')
    }

    props.fetchContributors(
      this.state.contributorsPath,
      `${currentAppliedFilter}&currentPageIndex=${pageIndex -
        1}&pageSize=${pageSize}&sortOrder=${sortOrder}&sortBy=${sortBy}`
    )
  }

  render() {
    const computeEntities = Immutable.fromJS([
      {
        id: this.state.contributorsPath,
        entity: this.props.computeContributors,
      },
      {
        id: this.props.routeParams.dialect_path,
        entity: this.props.computeDialect2,
      },
    ])

    const computeContributors = ProviderHelpers.getEntry(this.props.computeContributors, this.state.contributorsPath)
    const computeDialect2 = ProviderHelpers.getEntry(this.props.computeDialect2, this.props.routeParams.dialect_path)

    const DocumentView = this.props.useDatatable ? (
      <DocumentListViewDatatable
        objectDescriptions="contributors"
        type="FVContributor"
        data={computeContributors}
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
      />
    ) : (
      <DocumentListView
        objectDescriptions="contributors"
        type="FVContributor"
        data={computeContributors}
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
      />
    )
    return (
      <PromiseWrapper renderOnError computeEntities={computeEntities}>
        {selectn('response.entries', computeContributors) && DocumentView}
      </PromiseWrapper>
    )
  }
}
export default ListView
