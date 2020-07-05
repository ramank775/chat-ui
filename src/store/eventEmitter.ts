
export class EventEmitter<T> {
    private _listener: Function[]
    constructor() {
        this._listener = []
    }
    subscribe(fn: Function) {
        this._listener.push(fn);
        return () => {
            this._listener = this._listener.filter(x => x !== fn);
        }
    }

    emit(data: T) {
        this._listener.forEach((fn:Function) => {
            fn.call(null, data);
        })
    }
}