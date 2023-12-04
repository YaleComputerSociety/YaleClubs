
import { useEffect, useState } from 'react';
import { distance } from 'fastest-levenshtein';

const useFilteredData = (initialData) => {
  const [searchValue, setSearchValue] = useState('');
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [found, setFound] = useState(0);
  const similarityThreshold = 0.4;

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
      'leaders'
    ];

    if (!initialData) return;
    if (searchValue === '') {
      setFound(initialData.length);
      setFilteredGroups(initialData);
    } else {

      const filtered = initialData.filter((group) =>
        searchableKeys.some((key) =>
          typeof group[key] === 'string' &&
          (group[key]?.toLowerCase().includes(searchValue.toLowerCase()) ||
            (group[key] !== null && 1 / (1 + distance(group[key].toLowerCase(), searchValue.toLowerCase())) >= similarityThreshold))
        )
      );

      setFound(filtered.length);
      setFilteredGroups(filtered);
    }
  }, [searchValue, initialData, similarityThreshold]);

  const onChange = (text) => {
    setSearchValue(text);
  };

  return { searchValue, onChange, found, filteredGroups };
};

export default useFilteredData;
