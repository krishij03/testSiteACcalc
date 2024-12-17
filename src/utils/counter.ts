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
    const response = await fetch('https://api.countapi.xyz/hit/smartenergysoftware.co.in/visits');
    const data = await response.json();
    
    // Broadcast the new count to all connected clients
    if (typeof window !== 'undefined' && window.WebSocket) {
      const ws = new WebSocket('wss://socketsbay.com/wss/v2/1/demo/');
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'visitorCount', count: data.value }));
        ws.close();
      };
    }
    
    return data.value;
  } catch (error) {
    console.error('Error fetching visit count:', error);
    return 0;
  }
};

export { getLocalVisitCount, incrementLocalVisitCount, getGlobalVisitCount }; 