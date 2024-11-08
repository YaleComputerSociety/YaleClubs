import React from 'react';

const GridComponent = ({ filteredGroups, page, renderItem, numColumns }) => {
  const itemsToDisplay = filteredGroups?.slice(0, page * 100);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
        gap: '20px',
        justifyContent: 'flex-start',
      }}
    >
      {itemsToDisplay?.map((item) => (
        <div key={item.id}>{renderItem(item)}</div> // Ensure to provide a unique key for each item
      ))}
    </div>
  );
};

export default GridComponent;