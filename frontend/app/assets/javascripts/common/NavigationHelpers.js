/* globals ENV_CONTEXT_PATH, ENV_WEB_URL, ENV_NUXEO_URL */
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
import selectn from 'selectn'
import ConfGlobal from 'conf/local.js'
import ConfRoutes, { paramMatch } from 'conf/routes'

const arrayPopImmutable = (array, sizeToPop = 1) => {
  return array.slice(0, array.length - sizeToPop)
}

/**
 * Returns the context path (as an array) from local.js, or empty array.
 */
const ContextPath = () => {
  if (ENV_CONTEXT_PATH !== null && typeof ENV_CONTEXT_PATH !== 'undefined') {
    return ENV_CONTEXT_PATH
  } else if (!ConfGlobal.contextPath || ConfGlobal.contextPath.length === 0) {
    return ''
  }

  return ConfGlobal.contextPath
}

/**
 * Adds a forward slash to path if it is missing to help generate URLs
 * @param String path
 */
const AddForwardSlash = (path) => {
  let addForwardSlash = '/'

  if (path.indexOf('/') === 0) {
    addForwardSlash = ''
  }

  return addForwardSlash + path
}

/**
 * Stores some default route parameters
 */
const DefaultRouteParams = {
  theme: 'explore',
  area: 'sections',
}

export default {
  // Navigate to an absolute path, possibly URL encoding the last path part
  // If no NavigationFunc is provided, will return the path
  // Will add context path unless already provided
  navigate: (path, navigationFunc, encodeLastPart = false) => {
    const pathArray = path.split('/')

    if (encodeLastPart) {
      pathArray[pathArray.length - 1] = encodeURIComponent(pathArray[pathArray.length - 1])
    }

    // Only add context path if it doesn't exist
    const transformedPath =
      path.indexOf(ContextPath()) === 0 ? pathArray.join('/') : ContextPath() + pathArray.join('/')

    if (!navigationFunc) {
      return transformedPath
    }
    navigationFunc(transformedPath)
  },
  // Navigate up by removing the last page from the URL
  navigateUp: (currentPathArray, navigationFunc) => {
    navigationFunc('/' + arrayPopImmutable(currentPathArray).join('/'))
  },
  // Navigate forward, replacing the current page within the URL
  navigateForwardReplace: (currentPathArray, forwardPathArray, navigationFunc) => {
    navigationFunc(
      '/' +
        arrayPopImmutable(currentPathArray)
          .concat(forwardPathArray)
          .join('/')
    )
  },
  // Navigate forward, replacing the current page within the URL
  navigateForwardReplaceMultiple: (currentPathArray, forwardPathArray, navigationFunc) => {
    navigationFunc(
      '/' +
        arrayPopImmutable(currentPathArray, forwardPathArray.length)
          .concat(forwardPathArray)
          .join('/')
    )
  },
  // Navigate forward by appending the forward path
  navigateForward: (currentPathArray, forwardPathArray, navigationFunc) => {
    navigationFunc('/' + currentPathArray.concat(forwardPathArray).join('/'))
  },
  // Navigate back to previous page
  navigateBack: () => {
    window.history.back()
  },
  // Method will append given path (/path/to/) to context path
  generateStaticURL: (path) => {
    return ContextPath() + AddForwardSlash(path)
  },
  // Method will lookup a path, based on id, in routes, and generate the correct path
  generateDynamicURL: (routeId, routeParams, moreParams) => {
    const matchedRoute = ConfRoutes.find((route) => route && route.id && route.id === routeId)

    const _params = Object.assign({}, DefaultRouteParams, routeParams, moreParams)

    if (matchedRoute && matchedRoute.path) {
      const outputPath = matchedRoute.path

      matchedRoute.path.forEach((value, key) => {
        if (value instanceof paramMatch) {
          // If dynamic path value exists in parameters - use it
          if (value.id in _params) {
            outputPath[key] = _params[value.id]
          }
        } else if (value instanceof RegExp) {
          // When is regexp an option?
        }
      })

      return ContextPath() + '/' + matchedRoute.path.join('/')
    }
    // TODO: How do we fall back gracefully when no path is found?
  },
  // Generate a UID link from a Nuxeo document path
  generateUIDPath: (theme, item, pluralPathId) => {
    let path = '/' + theme + selectn('path', item)
    // const type = selectn('type', item)

    switch (pluralPathId) {
      case 'words':
      case 'phrases':
        path = path.replace('/Dictionary/', '/learn/' + pluralPathId + '/')
        break

      case 'songs-stories':
      case 'songs':
      case 'stories':
        path = path.replace('/Stories & Songs/', '/learn/' + pluralPathId + '/')
        break

      case 'gallery':
        path = path.replace('/Portal/', '/' + pluralPathId + '/')
        break

      case 'media':
        // Resources can be in folders, so ensure everything after 'Resources' is ignored
        path = path.substring(0, path.lastIndexOf('/Resources/') + 11)
        path = path.replace('/Resources/', '/' + pluralPathId + '/')
        break
      default: // Note: do nothing
    }

    return (path = ContextPath() + path.substring(0, path.lastIndexOf('/') + 1) + selectn('uid', item))
  },
  // Disable link
  disable: (event) => {
    event.preventDefault()
  },
  getContextPath: () => {
    return ContextPath()
  },
  // Checks whether a page being accessed is a Workspace
  isWorkspace: (props) => {
    return props.windowPath && props.windowPath.indexOf('/Workspaces/') !== -1
  },
  getBaseWebUIURL: () => {
    if (ENV_WEB_URL !== null && typeof ENV_WEB_URL !== 'undefined') {
      return ENV_WEB_URL
    }
    return (
      window.location.protocol +
      '//' +
      window.location.hostname +
      (window.location.port ? ':' + window.location.port : '') +
      ContextPath()
    )
  },
  getBaseURL: () => {
    if (ENV_NUXEO_URL !== null && typeof ENV_NUXEO_URL !== 'undefined') {
      return ENV_NUXEO_URL
    }
    return (
      window.location.protocol +
      '//' +
      window.location.hostname +
      (window.location.port ? ':' + window.location.port : '') +
      '/nuxeo/'
    )
  },
}

/*
Given:
  pathArray: ['create']
  splitWindowPath: ["explore", "FV", "Workspaces", "Data", "Athabascan", "Dene", "Dene", "learn", "words", "categories", "641f1def-4df7-41ab-8bae-ff65664ba24c"]
  landmarkArray: ['words', 'phrases'] // looks in splitWindowPath for the first matching item (going back to front)

  Will return:
  'explore/FV/Workspaces/Data/Athabascan/Dene/Dene/learn/words/create'

If not found, returns `undefined`

*/
export const appendPathArrayAfterLandmark = ({ pathArray, splitWindowPath, landmarkArray = ['words', 'phrases'] }) => {
  const _splitWindowPath = [...splitWindowPath].reverse()
  let toReturn = undefined
  landmarkArray.some((landmarkValue) => {
    const indexLandmark = _splitWindowPath.indexOf(landmarkValue)
    if (indexLandmark !== -1) {
      const cut = _splitWindowPath.slice(indexLandmark)
      cut.reverse()
      toReturn = [...cut, ...pathArray].join('/')
      return true
    }
    return false
  })
  return toReturn
}
