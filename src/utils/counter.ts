const getGlobalVisitCount = async (): Promise<number> => {
  try {
    // Using the CORS-enabled version of CountAPI
    const response = await fetch('https://api.countapi.xyz/hit/smartenergysoftware.co.in/visits', {
      mode: 'cors',  // Explicitly request CORS
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Counter API request failed');
    }

    const data = await response.json();
    return data.value || 1;
  } catch (error) {
    console.error('Error fetching visit count:', error);
    
    // Fallback request with different endpoint
    try {
      const getResponse = await fetch('https://api.countapi.xyz/get/smartenergysoftware.co.in/visits', {
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!getResponse.ok) {
        throw new Error('Fallback counter request failed');
      }

      const getData = await getResponse.json();
      return getData.value || 1;
    } catch (fallbackError) {
      console.error('Fallback counter failed:', fallbackError);
      return 1;
    }
  }
};

export { getGlobalVisitCount };