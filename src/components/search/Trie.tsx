import { IClub } from "@/lib/models/Club";

class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  clubNames: Set<string>;

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.clubNames = new Set();
  }
}

export class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string, clubName: string): void {
    let currentNode = this.root;

    for (const char of word) {
      if (!currentNode.children.has(char)) {
        currentNode.children.set(char, new TrieNode());
      }
      currentNode = currentNode.children.get(char)!;
    }

    currentNode.isEndOfWord = true;

    currentNode.clubNames.add(clubName);
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
    const collectClubNames = (node: TrieNode) => {
      if (node.isEndOfWord) {
        node.clubNames.forEach((name) => results.add(name));
      }
      for (const [, childNode] of node.children) {
        collectClubNames(childNode);
      }
    };

    collectClubNames(currentNode);

    return Array.from(results);
  }

  getWordsWithPrefixes(queryStrings: string[], allClubs: IClub[]): string[] {
    if (!allClubs || allClubs.length === 0) {
      console.warn("Empty or undefined allClubs array");
      return [];
    }

    allClubs.forEach((club) => {
      const words = club.name.toLowerCase().split(/\s+/);
      words.forEach((word) => this.insert(word, club.name));
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
