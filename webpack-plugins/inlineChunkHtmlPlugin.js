/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

const htmlWebpackPlugin = require("html-webpack-plugin");
const pluginName = "InlineChunkHtmlPlugin";

class InlineChunkHtmlPlugin {
  constructor(tests) {
    this.tests = tests;
  }

  inlinedAssets = [];

  getInlinedTag(publicPath, assets, tag) {
    if (tag.tagName !== "script" || !(tag.attributes && tag.attributes.src)) {
      return tag;
    }
    const scriptName = publicPath
      ? tag.attributes.src.replace(publicPath, "")
      : tag.attributes.src;
    if (!this.tests.some((test) => scriptName.match(test))) {
      return tag;
    }
    const asset = assets[scriptName];
    if (asset == null) {
      return tag;
    }
    this.inlinedAssets.push(scriptName);
    return { tagName: "script", innerHTML: asset.source(), closeTag: true };
  }

  apply(compiler) {
    let publicPath = compiler.options.output.publicPath || "";
    if (publicPath && !publicPath.endsWith("/")) {
      publicPath += "/";
    }

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      const tagFunction = (tag) =>
        this.getInlinedTag(publicPath, compilation.assets, tag);

      const hooks = htmlWebpackPlugin.getHooks(compilation);
      hooks.alterAssetTagGroups.tap(pluginName, (assets) => {
        assets.headTags = assets.headTags.map(tagFunction);
        assets.bodyTags = assets.bodyTags.map(tagFunction);
      });

      hooks.afterEmit.tap(pluginName, () => {
        Object.keys(compilation.assets).forEach((assetName) => {
          if (this.inlinedAssets.includes(assetName))
            delete compilation.assets[assetName];
        });
      });
    });
  }
}

module.exports = InlineChunkHtmlPlugin;
