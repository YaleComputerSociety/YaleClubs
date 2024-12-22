class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  allCompleteWords: Set<string>;

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.allCompleteWords = new Set();
  }
}

export class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string, subword: string): void {
    let currentNode = this.root;

    for (const char of word) {
      if (!currentNode.children.has(char)) {
        currentNode.children.set(char, new TrieNode());
      }
      currentNode = currentNode.children.get(char)!;
    }

    currentNode.isEndOfWord = true;

    currentNode.allCompleteWords.add(subword);
  }

  search(prefix: string): string[] {
    let currentNode = this.root;

    for (const char of prefix) {
      if (!currentNode.children.has(char)) {
        return [];
      }
      currentNode = currentNode.children.get(char)!;
    }

    const results: Set<string> = new Set();
    const collectAllWords = (node: TrieNode) => {
      if (node.isEndOfWord) {
        node.allCompleteWords.forEach((name) => results.add(name));
      }
      for (const [, childNode] of node.children) {
        collectAllWords(childNode);
      }
    };

    collectAllWords(currentNode);

    return Array.from(results);
  }

  getWordsWithPrefixes(queryStrings: string[], allWords: string[]): string[] {
    console.log(allWords);
    if (!allWords || allWords.length === 0) {
      console.warn("Empty or undefined allWords array");
      return [];
    }

    allWords.forEach((word: string) => {
      const subwords = word.toLowerCase().split(/\s+/);
      subwords.forEach((subword) => this.insert(subword, word));
    });

    let results: Set<string> | null = null;

    for (const query of queryStrings) {
      const prefix = query.trim().toLowerCase();
      if (!prefix) continue;

      const matchingNames = this.search(prefix);

      if (!matchingNames.length) {
        return [];
      }

      results = results ? new Set(matchingNames.filter((name) => results!.has(name))) : new Set(matchingNames);

      if (results.size === 0) break;
    }

    return Array.from(results || []);
  }
}
export default Trie;
