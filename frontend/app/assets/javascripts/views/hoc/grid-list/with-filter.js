import React, { Component, PropTypes } from 'react'
import Immutable, { List, Map } from 'immutable'
import classNames from 'classnames'
import selectn from 'selectn'

import t from 'tcomb-form'

import fields from 'models/schemas/filter-fields'
import options from 'models/schemas/filter-options'

import withToggle from 'views/hoc/view/with-toggle'

import ProviderHelpers from 'common/ProviderHelpers'
import FormHelpers from 'common/FormHelpers'

import { RaisedButton } from 'material-ui'
import IntlService from 'views/services/intl'

const intl = IntlService.instance
const FiltersWithToggle = withToggle()

/**
 * Return 'true' if value was found, 'false' otherwise.
 */
const defaultFilterFunc = function defaultFilterFunc(propertyToSearch, filterValue) {
  if (!propertyToSearch) return true

  if (Array.isArray(propertyToSearch)) {
    return !(propertyToSearch.indexOf(filterValue) === -1)
  }
  return !(propertyToSearch.search(new RegExp(filterValue, 'i')) === -1)
}

export default function withFilter(ComposedFilter, DefaultFetcherParams) {
  class FilteredGridList extends Component {
    static defaultProps = {
      filterOptionsKey: 'Default',
      fullWidth: false,
    }

    static propTypes = {
      applyDefaultFormValues: PropTypes.bool,
      area: PropTypes.string,
      fetcher: PropTypes.func,
      fetcherParams: PropTypes.object,
      filterOptionsKey: PropTypes.string.isRequired,
      fixedList: PropTypes.bool,
      fixedListFetcher: PropTypes.func,
      formValues: PropTypes.any, // TODO: set appropriate propType
      fullWidth: PropTypes.bool,
      initialFormValue: PropTypes.any, // TODO: set appropriate propType
      initialValues: PropTypes.object,
      items: PropTypes.any, // TODO: set appropriate propType
      metadata: PropTypes.object,
    }

    constructor(props, context) {
      super(props, context)

      this.state = {
        options: options,
        formValue: props.initialFormValue || props.formValues,
        defaultFormValue: props.formValues,
        initialFormValue: props.initialFormValue,
      }
      ;['_onReset', '_doFilter', '_onFilterSaveForm'].forEach((method) => (this[method] = this[method].bind(this)))
    }

    componentDidMount() {
      // Only auto-apply with a fixed list
      if (this.props.fixedList && this.props.applyDefaultFormValues) {
        this._onFilterSaveForm(null)
      }
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.area !== this.props.area) {
        this._onReset(null, nextProps)
      }

      // Items may change in a fixed list (e.g. deleted, added)
      const nextPropsItemsList = Immutable.fromJS(nextProps.items)
      const prevPropsItemsList = Immutable.fromJS(this.props.items)

      if (this.props.fixedList && nextPropsItemsList.equals(prevPropsItemsList) === false) {
        this._onReset(null, nextProps)
      }
    }

    render() {
      // TODO: options already declared by import, see about fixing this
      let options = Map(selectn(this.props.filterOptionsKey, this.state.options)) // eslint-disable-line

      // Replace proxied properties where necessary
      if (this.props.area) {
        // TODO: fields already declared by import, see about fixing this
        // eslint-disable-next-line
        const fields = Map(options.get("fields")).map(
          function fieldsMap(field) {
            if (field.hasOwnProperty('nxql')) {
              field.nxql = ProviderHelpers.replaceAllWorkspaceSectionKeys(field.nxql, this.props.area)
            }

            return field
          }.bind(this)
        )

        options = options.set('fields', fields)
      }

      return (
        <div>
          <div className="row">
            <div
              className={classNames('col-xs-12', {
                'col-md-3': !this.props.fullWidth,
                'col-md-12': this.props.fullWidth,
              })}
            >
              <form onSubmit={this._onFilterSaveForm}>
                <FiltersWithToggle
                  label={intl.trans('views.pages.search.filter_items', 'Filter items', 'first')}
                  mobileOnly
                >
                  <t.form.Form
                    ref="filter_form"
                    type={t.struct(selectn(this.props.filterOptionsKey, fields))}
                    context={this.props.initialValues}
                    value={this.state.formValue}
                    options={options.toJS()}
                  />
                  <RaisedButton onTouchTap={this._onReset} label={intl.trans('reset', 'Reset', 'first')} primary />{' '}
                  &nbsp;
                  <RaisedButton type="submit" label={intl.trans('filter', 'Filter', 'first')} primary />
                </FiltersWithToggle>
              </form>
            </div>

            <div
              className={classNames('col-xs-12', {
                'col-md-9': !this.props.fullWidth,
                'col-md-12': this.props.fullWidth,
              })}
            >
              <ComposedFilter {...this.state} {...this.props} />
            </div>
          </div>
        </div>
      )
    }

    _doFilter(filters, props = this.props, isReset) {
      // Filter a fixed list (i.e. all items sent to component)
      if (this.props.fixedList) {
        const filteredList = new List(props.items).filter(function filteredListFilterer(item) {
          // Test each of the filters against item
          for (const filterKey in filters) {
            const filterOptions = selectn([props.filterOptionsKey, 'fields', filterKey], options)
            const filterFunc =
              filterOptions && filterOptions.hasOwnProperty('filterFunc') ? filterOptions.filterFunc : defaultFilterFunc

            const filterValue = filters[filterKey]
            const propertyToSearch = selectn(filterKey, item)

            if (!filterFunc(propertyToSearch, filterValue)) {
              return false
            }
          }

          return true
        })

        props.fixedListFetcher(filteredList)
      } else {
        // Filter a remote list (i.e. partial list sent to component)
        const preparedFilters = FormHelpers.prepareFilters(filters, options, this.props.filterOptionsKey)

        this.props.fetcher(
          Object.assign({}, this.props.fetcherParams, {
            currentPageIndex: 1,
            filters: preparedFilters,
          }),
          isReset ? {} : filters
        )
      }
    }

    _onReset(event, props = this.props) {
      const form = this.refs.filter_form

      // Reset all controlled inputs
      const inputs = Object.assign({}, selectn('refs.input.refs', form), selectn('inputRef.childRefs', form))

      // TODO: see if getProperties() is modifying form
      const properties = FormHelpers.getProperties(form) // eslint-disable-line

      for (const inputKey in inputs) {
        if (typeof inputs[inputKey].forceReset === 'function') {
          inputs[inputKey].forceReset()
        }
      }

      this.setState({
        formValue: this.state.defaultFormValue || null,
      })

      if (props.fixedList) {
        if (this.state.defaultFormValue) {
          this._doFilter(this.state.defaultFormValue, props, true)
        } else {
          props.fixedListFetcher(props.items)
        }
      } else {
        this._doFilter(DefaultFetcherParams.filters, props, true)
      }
    }

    _onFilterSaveForm(e) {
      // Prevent default behaviour
      if (e) {
        e.preventDefault()
      }

      const form = this.refs.filter_form
      const properties = FormHelpers.getProperties(form)

      if (Object.keys(properties).length != 0) {
        this.setState({
          formValue: properties,
        })

        this._doFilter(properties)
      } else {
        this._onReset(null)
      }
    }
  }

  return FilteredGridList
}
