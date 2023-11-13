import { useEffect, useState } from 'react';
import * as levenshtein from 'fast-levenshtein';

const useFilteredData = (initialData) => {
  const [searchValue, setSearchValue] = useState('');
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [found, setFound] = useState(0);
  const similarityThreshold = 3;

  useEffect(() => {
    const searchableKeys = [
      'name',
      'address',
      'category',
      'email',
      'mission',
      'phone',
      'type',
      'benefits',
      'constitution',
    ];

    if (searchValue === '') {
      // If no search value is provided, show all data
      setFound(initialData.length);
      setFilteredGroups(initialData);
    } else {
      const filtered = initialData.filter((group) => {
        for (const key of searchableKeys) {
          if (
            typeof group[key] === 'string' &&
            levenshtein.get(group[key].toLowerCase(), searchValue.toLowerCase()) <= similarityThreshold
          ) {
            return true;
          }
        }

        return false;
      });

      setFound(filtered.length);
      setFilteredGroups(filtered);
    }
  }, [searchValue, initialData, similarityThreshold]);

  const onChange = (text) => {
    setSearchValue(text);
  };

  return { searchValue, onChange, found, filteredGroups };
}

export default useFilteredData;