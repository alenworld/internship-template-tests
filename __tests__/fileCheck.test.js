const PATH = require('path');
const fs = require('fs');

class TreeNode {
  constructor(path, filename = '') {
    this.path = path;
    this.filename = filename;
    this.children = [];
  }
}
function buildTree(rootPath, filename = '') {
  const root = new TreeNode(rootPath, filename);

  const ignoringPath = ['node_modules', 'coverage', '.git', '__tests__'];

  const stack = [root];
  while (stack.length) {
    const currentNode = stack.pop();

    if (currentNode) {
      const children = fs.readdirSync(currentNode.path);

      children.forEach((child) => {
        if (!(ignoringPath.includes(child))) {
          const childPath = `${currentNode.path}/${child}`;
          const childName = `${child}`;
          const childNode = new TreeNode(childPath, childName);
          currentNode.children.push(childNode);

          if (fs.statSync(childNode.path).isDirectory()) {
            stack.push(childNode);
          }
        }
      });
    }
  }
  return root;
}

const importantFiles = {
  '.eslintrc.json': false,
  'package.json': false,
  '.editorconfig': false,
  'jest.config.js': false,
  'server.js': false,
  'package-lock.json': false,
  'README.md': false,
  LICENSE: false,
  '.gitignore': false,
  test: false,

};

// describe('buildTree', () => {
//   const initialPath = PATH.join(__dirname, '/..');
//   test('should return root node', () => {
//     const rootNode = buildTree(initialPath);
//     expect(rootNode).not.toBeNull();
//     expect(rootNode).toHaveProperty('path', initialPath);
//     expect(rootNode).toHaveProperty('children');
//   });
//   describe('root node checking important files', () => {
//     const currentPath = initialPath;
//     const currentNode = buildTree(currentPath);
//     const childrenPath = currentNode.children.map((child) => child.path);
//     childrenPath.forEach((path) => {
//       if (childrenPath.includes(`${currentPath}/${path}`)) {
//         test(`Path: ${childrenPath}`, (done) => {
//           expect(childrenPath).toBe(1);
//           done();
//         });
//       }
//     });
//   });
// });

// while () {
//   describe(`Checking files in ${currentPath}`, () => {
//     Object.keys(importantFiles).map((filename) => {
//       if (childrenPath.includes(`${currentPath}/${filename}`)) {
//         importantFiles[filename] = true;
//         test(`Path: ${currentPath}, file: ${filename}`, (done) => {
//           expect(importantFiles[filename]).toBe(true);
//           done();
//         });
//       }
//     });
//   });
// }

// Object.keys(importantFiles).map((file) => {
//   if (childrenPath.includes(`${initialPath}/${file}`)) {
//     importantFiles[file] = true;
//     test(`File: ${file} exists in folder ${initialPath}`, (done) => {
//       expect(importantFiles[file]).toBe(true);
//       done();
//     });
//   } else {
//     test(`File: ${file} is not exists, go to another folder`, (done) => {
//       expect(importantFiles[file]).toBe(false);

//       done();
//     });
//   }
// });

//     test('should return root node with exact all files or next test', (done) => {
//       done();
//     });
//   });
// });

// const projectDir = './src/../';

// const items = [];

// const tree = dirTree(projectDir, { exclude: /node_modules|coverage|__tests__|.git|filesCheck.js/, attributes: ['type'] });

// const files = [
//   '.eslintrc.json',
//   'package.json',
//   '.editorconfig',
//   'jest.config.js',
//   'package-lock.json',
//   'README.md',
//   'LICENSE',
//   '.gitignore',
// ];

// const filesCheck = {};

// describe('Tree', () => {
//   beforeEach(() => {
//     items.push(tree);
//   });
//   test('check first item', (done) => {
//     expect(items).toStrictEqual({ name: files[0] });
//     done();
//   });
// });
