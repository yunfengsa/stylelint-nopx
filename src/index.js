'use strict'

const stylelint = require('stylelint')
const valueParser = require('postcss-value-parser')
const ruleName = 'dxymom/no-px'

const messages = stylelint.utils.ruleMessages(ruleName, {
  rpx() {
    return `Use rpx instead of px`
  },
})

const defaultSecondaryOptions = {
  ignore: [ '1px' ]
}

const post1px = /\s+1px/

const propInList = (prop, list) => {
  return prop && list.some(item => {
    return !post1px.test(item) && prop.indexOf(item) > -1
  })
}

const propAdd1pxInList = (prop, list) => {
  return prop && list.some(item => {
    if (!post1px.test(item)) return
    return prop.indexOf(item.replace(post1px, '')) > -1
  })
}

/**
 * check if a value has forbidden `px`
 * @param {string} value
 */
const hasForbiddenPX = (node, options) => {
  const type = node.type
  const value = type === 'decl' ? node.value : node.params
  const prop = type === 'decl' ? node.prop : null

  const parsed = valueParser(value)
  let hasPX = false

  const ignore = options.ignore || defaultSecondaryOptions.ignore
  const ignore1px = ignore.indexOf('1px') > -1
  const ignoreFunctions = options.ignoreFunctions || []

  if (type === 'decl' && propInList(node.prop, ignore)) return

  parsed.walk(node => {
    // if node is `url(xxx)`, prevent the traversal
    if (
      node.type === 'function' &&
      (
        node.value === 'url' ||
        ignoreFunctions.indexOf(node.value) > -1
      )
    ) {
      return false
    }

    let matched
    if (node.type === 'word' && (matched = node.value.match(/^([-,+]?\d+(\.\d+)?)px$/))) {
      const px = matched[1]

      if (px === '0') {
        return
      }

      if (px !== '1') {
        hasPX = true
        return
      }

      if (!propAdd1pxInList(prop, ignore) && !ignore1px) {
        hasPX = true
      }
    } else if (node.type === 'string' && /(@\{[\w-]+\})px\b/.test(node.value)) {
      hasPX = true
    }
  })

  return hasPX
}

module.exports = stylelint.createPlugin(ruleName, (primaryOption, secondaryOptionObject) => {
  primaryOption = primaryOption || ''

  return (root, result) => {
    if (!primaryOption) return

    secondaryOptionObject = secondaryOptionObject || defaultSecondaryOptions

    root.walkDecls(declaration => {
      if (hasForbiddenPX(declaration, secondaryOptionObject)) {
        stylelint.utils.report({
          ruleName: ruleName,
          result: result,
          node: declaration,
          message: messages.rpx(),
        })
      }
    })

    root.walkAtRules(atRule => {
      if (hasForbiddenPX(atRule, secondaryOptionObject)) {
        stylelint.utils.report({
          ruleName: ruleName,
          result: result,
          node: atRule,
          message: messages.rpx(),
        })
      }
    })
  }
})

module.exports.ruleName = ruleName
module.exports.messages = messages