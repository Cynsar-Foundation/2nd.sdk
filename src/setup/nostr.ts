import { relayPool } from 'nostr-tools'



export interface IRelay{
    addRelay(url:any, opts:{}): any
    pool: any
}

export class Relay implements IRelay {
    pool: any;
    constructor(){
        this.pool = relayPool()
    }

    addRelay(url: any, opts: {}){
        return this.pool.addRelay()
    }

}