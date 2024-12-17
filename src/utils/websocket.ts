class VisitorWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private onVisitorCountUpdate: (count: number) => void;

  constructor(updateCallback: (count: number) => void) {
    this.onVisitorCountUpdate = updateCallback;
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket('wss://socketsbay.com/wss/v2/1/demo/');

      this.ws.onopen = () => {
        console.log('WebSocket Connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'visitorCount') {
            this.onVisitorCountUpdate(data.count);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket Disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };
    } catch (error) {
      console.error('WebSocket Connection Error:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts})`);
        this.connect();
      }, 3000);
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export default VisitorWebSocket; 