
import { useEffect, useState } from 'react';
import { distance } from 'fastest-levenshtein';

const useFilteredEvents = (initialData) => {
  const [searchValue, setSearchValue] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [found, setFound] = useState(0);
  const similarityThreshold = 0.4;

  useEffect(() => {
    const searchableKeys = [
      'summary',
      'description',
      'date',
      'time'
    ];

    if (!initialData) return;
    if (searchValue === '') {
      setFound(initialData.length);
      setFilteredEvents(initialData);
    } else {

      const filtered = initialData.filter((group) =>
        searchableKeys.some((key) =>
          typeof group[key] === 'string' &&
          (group[key]?.toLowerCase().includes(searchValue.toLowerCase()) ||
            (group[key] !== null && 1 / (1 + distance(group[key].toLowerCase(), searchValue.toLowerCase())) >= similarityThreshold))
        )
      );

      setFound(filtered.length);
      setFilteredEvents(filtered);
    }
  }, [searchValue, initialData, similarityThreshold]);

  const onChange = (text) => {
    setSearchValue(text);
  };

  return { searchValue, onChange, found, filteredEvents };
};

export default useFilteredEvents;
