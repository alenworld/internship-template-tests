const path = require('path');

class TreeNode {
  constructor(path) {
    this.path = path;
    this.children = [];
  }
}
function buildTree(rootPath) {
  return new TreeNode(rootPath);
}
