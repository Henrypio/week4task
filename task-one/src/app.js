import FileTree from './fileTree';

export function createFileTree(input) {
  const fileTree = new FileTree();
  
  const firstParent = input[0];
  input.sort((a, b)=>{ 
   return a.id - b.id
  })

  input.unshift(firstParent)
  
  for (const inputNode of input) {
    const parentNode = inputNode.parentId
      ? fileTree.findNodeById(inputNode.parentId)
      : null;

    fileTree.createNode(
      inputNode.id,
      inputNode.name,
      inputNode.type,
      parentNode
    );
  }

  return fileTree;
}