
enum SocketConnectionState {
    CONNECTING = 0,
    OPEN = 1,
    CLOSING = 2,
    CLOSED = 3
}

export class Socket {
    private _socket?: WebSocket;
    private _isClosed:Boolean = false;
    private _retryCounter:number = 0;
    private _host: string;
    private _retry:number = 3;
    private _retryTimeout: number = 0;
    private _retryTimer:number = 1000;

    public onConnect?: Function;
    public onDisconnect?: Function;
    public onError?: Function;
    public onMessage?: Function;
    public onReconnecting?: Function;
    constructor(host: string, retryCount: number = 3) {
        this._host = host;
        this._retry = retryCount;
    }

    connect() {
        if (window.WebSocket) {
            this._socket = new WebSocket(this._host);
            const socket = this._socket;
            socket.onopen = () => {
                this.onConnect && this.onConnect();
            };
            socket.onmessage = (e) => {
                const data = JSON.parse(e.data);
                let parsedData = data;
                if(Array.isArray(data)) {
                    parsedData = data.map(x=> JSON.parse(x));
                }
                this.onMessage && this.onMessage(parsedData);
            };
            socket.onclose = (e) => {
                if (this._retry <= this._retryCounter || this._isClosed ) {
                    this.onDisconnect && this.onDisconnect(e);
                    return;
                }
                this.reconnect();
            };
            socket.onerror = (err) => {
                console.error(err);
                this.onError && this.onError(err);
            };
        }
        else {
            const err = "WebSocket object is not supported";
            console.error(err);
            this.onError && this.onError(err);
            return -1;
        }
        return 0;
    }
    reconnect() {
        clearTimeout(this._retryTimeout);
        const { CONNECTING, OPEN } = SocketConnectionState;
        if (this._socket && [CONNECTING, OPEN].indexOf(this._socket.readyState) > -1) {
            console.log('Socket is already connected, aborting reconnect');
            return -1;
        }
        this._retryCounter++;
        this._retryTimeout = setTimeout(() => this.connect(), this._retryTimer * this._retryCounter);
        this.onReconnecting && this.onReconnecting();
        return 0;
    }
    disconnect() {
        this._isClosed = true;
        clearTimeout(this._retryTimeout);
        const { CLOSING, CLOSED } = SocketConnectionState;
        if (this._socket && [CLOSING, CLOSED].indexOf(this._socket.readyState) < 0) {
            this._socket.close();
            return 0;
        }
        return -1;
    }
    send(message: Object) {
        if (!(this._socket && this._socket.readyState === SocketConnectionState.OPEN)) {
            console.warn("Socket is not ready yet to send message");
            return -1;
        }
        this._socket.send(JSON.stringify(message));
        return 0;
    }

}
