const fs = require('fs');
const PATH = require('path');

class TreeNode {
  constructor(path, filename = '') {
    this.path = path;
    this.filename = filename;
    this.children = [];
  }
}

const buildTree = (rootPath) => {
  const BLOCKED_EXTENSIONS = ['.txt'];
  const BLOCKED_PATH = ['node_modules', '__tests__', 'coverage', '.git', '.vscode'];
  const root = new TreeNode(rootPath);
  const stack = [root];
  while (stack.length) {
    const currentNode = stack.pop();
    if (currentNode) {
      const children = fs.readdirSync(currentNode.path);

      children.forEach((child) => {
        const childPath = `${currentNode.path}/${child}`;
        const childName = `${child}`;
        const childNode = new TreeNode(childPath, childName);
        const isDirectory = fs.statSync(childNode.path).isDirectory();
        const extension = PATH.extname(childNode.path);
        const isFileBlocked = BLOCKED_EXTENSIONS.includes(extension);
        const isPathBlocked = BLOCKED_PATH.includes(childNode.path);

        if (!isFileBlocked && !isPathBlocked) {
          currentNode.children.push(childNode);
        }
        if (isDirectory && !isFileBlocked && !isPathBlocked) {
          stack.push(childNode);
        }
      });
    }
  }
  return root;
};

module.exports = {
  buildTree,
};
