
const parseCategories = (category) => {
  let categories = [];

  if (category !== null) {
    categories = category.split(/[\/,]/).map((category, index) => ({
      id: index,
      name: category.trim(),
    }));
  }

  if (categories.length === 0) {
    categories = [{ id: 0, name: "All Categories" }];
  }

  return categories;
};

export default parseCategories;