
const crypto = require('crypto')
const { pick } = require('lodash')
const { CreatedGraphQLType } = require('../graphql/utils')

function createBaseActions (api, app) {
  return {
    graphql (docOrQuery, variables = {}) {
      if (!app.schema) {
        throw new Error(`actions.graphql() called before schema is generated.`)
      }
      return app.graphql(docOrQuery, variables)
    },
    resolve (...args) {
      return app.resolve(...args)
    }
  }
}

function createStoreActions (api, app) {
  const baseActions = createBaseActions(api, app)

  return {
    ...baseActions,

    addMetaData (key, data) {
      return api.store.addMetaData(key, data)
    },
    addContentType (options) {
      return api.store.addContentType(options)
    },
    getContentType (typeName) {
      return api.store.getContentType(typeName)
    },
    slugify (string) {
      return api.store.slugify(string)
    },

    store: {
      createReference (typeName, id) {
        return api.store.createReference(typeName, id)
      }
    },

    // deprecated actions
    // TODO: warn when used

    createTypeName (typeName) {
      return api.store.createTypeName(typeName)
    },
    createReference (typeName, id) {
      return api.store.createReference(typeName, id)
    },
    makeUid (orgId) {
      return crypto.createHash('md5').update(orgId).digest('hex')
    },
    makeTypeName (string = '') {
      return api.store.createTypeName(string)
    }
  }
}

function createSchemaActions (api, app) {
  const baseActions = createStoreActions(api, app)
  const GraphQLJSON = require('graphql-type-json')
  const graphql = require('graphql')

  // TODO: these should just be imported from gridsome/graphql instead
  const graphqlTypes = pick(graphql, [
    // Definitions
    'GraphQLSchema',
    'GraphQLScalarType',
    'GraphQLObjectType',
    'GraphQLInterfaceType',
    'GraphQLUnionType',
    'GraphQLEnumType',
    'GraphQLInputObjectType',
    // Type Wrappers
    'GraphQLList',
    'GraphQLNonNull',
    // Built-in Directives defined by the Spec
    'GraphQLDeprecatedDirective',
    // Standard Scalars
    'GraphQLInt',
    'GraphQLFloat',
    'GraphQLString',
    'GraphQLBoolean',
    'GraphQLID'
  ])

  return {
    ...baseActions,
    ...graphqlTypes,

    GraphQLJSON,

    addSchema (schema) {
      app._schemas.push(schema)
    },

    addSchemaTypes (typesOrSDL) {
      app._schemaTypes.push(typesOrSDL)
    },

    addSchemaResolvers (resolvers) {
      app._schemaResolvers.push(resolvers)
    },

    schema: {
      createObjectType: options => ({ options, type: CreatedGraphQLType.Object }),
      createUnionType: options => ({ options, type: CreatedGraphQLType.Union }),
      createInterfaceType: options => ({ options, type: CreatedGraphQLType.Interface }),
      createInputObjectType: options => ({ options, type: CreatedGraphQLType.InputObject })
    }
  }
}

function createPagesActions (api, app, { digest }) {
  const baseActions = createBaseActions(api, app)
  const internals = { digest, isManaged: false }

  return {
    ...baseActions,

    getContentType (typeName) {
      return api.store.getContentType(typeName)
    },

    createPage (options) {
      return app.pages.createPage(options, internals)
    }
  }
}

function createManagedPagesActions (api, app, { digest }) {
  const baseActions = createPagesActions(api, app, { digest })
  const internals = { digest, isManaged: true }

  return {
    ...baseActions,

    createPage (options) {
      return app.pages.createPage(options, internals)
    },
    updatePage (options) {
      return app.pages.updatePage(options, internals)
    },
    removePage (page) {
      return app.pages.removePage(page)
    },
    removePageByPath (path) {
      return app.pages.removePageByPath(path)
    },
    removePagesByComponent (component) {
      return app.pages.removePagesByComponent(component)
    },
    findAndRemovePages (query) {
      return app.pages.findAndRemovePages(query)
    },
    findPage (query) {
      return app.pages.findPage(query)
    },
    findPages (query) {
      return app.pages.findPages(query)
    }
  }
}

module.exports = {
  createBaseActions,
  createStoreActions,
  createSchemaActions,
  createPagesActions,
  createManagedPagesActions
}