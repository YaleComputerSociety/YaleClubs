export const getAdjustedNumMembers = (numMembers: number): string => {
  if (numMembers <= 10) {
    return "1 - 10";
  } else if (numMembers <= 25) {
    return "10 - 25";
  } else if (numMembers <= 50) {
    return "25-50";
  } else if (numMembers <= 100) {
    return "50-100";
  } else {
    return "100+";
  }
};
