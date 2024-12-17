const getLocalVisitCount = (): number => {
  const count = localStorage.getItem('visitCount');
  return count ? parseInt(count) : 0;
};

const incrementLocalVisitCount = (): number => {
  const currentCount = getLocalVisitCount();
  const newCount = currentCount + 1;
  localStorage.setItem('visitCount', newCount.toString());
  return newCount;
};

const getGlobalVisitCount = async (): Promise<number> => {
  try {
    // Using CountAPI with a namespace specific to your website
    const response = await fetch('https://api.countapi.xyz/hit/smartenergysoftware.co.in/visits');
    const data = await response.json();
    return data.value;
  } catch (error) {
    console.error('Error fetching visit count:', error);
    return 1; // Fallback to 1 if API fails
  }
};

export { getLocalVisitCount, incrementLocalVisitCount, getGlobalVisitCount }; 