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
import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';

const innerUlStyle = {
    'fontSize': '0.9em',
    'margin': 0,
    'padding': '0 15px'
};

/**
* Learn Base Page
*/
export default class PageDialectLearnBase extends Component {

  constructor(props, context) {
    super(props, context);
  }

  renderComplexArrayRow(dataItems, render) {
      let rows = [];

      dataItems.map(function(entry, i) {
        rows.push(render(entry, i));
      });

      if (dataItems.length >= 2) {
        rows.push(<li key='more'>...</li>);
      }

      return <ul style={innerUlStyle}>
          {rows}
      </ul>;
  }
}