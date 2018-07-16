const path = require("path");

const paths = {
  build: path.resolve(__dirname, "build")
};

const externals = {
  react: {
    root: "React",
    commonjs2: "react",
    commonjs: "react",
    amd: "react"
  },
  "react-dom": {
    root: "ReactDOM",
    commonjs2: "react-dom",
    commonjs: "react-dom",
    amd: "react-dom"
  }
};

const mod = {
  rules: [{ test: /.js$/, use: "babel-loader" }]
};

module.exports = [
  {
    mode: "development",
    entry: "./parent.js",
    output: {
      path: paths.build,
      filename: "parent.js",
      library: "FriendlyFrame",
      libraryTarget: "umd"
    },
    module: mod,
    externals
  },
  {
    mode: "development",
    entry: "./child.js",
    output: {
      path: paths.build,
      filename: "child.js",
      library: "FriendlyFrame",
      libraryTarget: "umd"
    },
    module: mod,
    externals
  }
];
