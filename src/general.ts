import {Keys, IKeys} from "./keys/keys"
import { LANG } from "./keys/keysEnum"
import { Relay, IRelay } from './setup/nostr'
import { LocalStorage } from 'ts-localstorage'

export class Application {
    lang: LANG = LANG.SPANISH
    name: string = 'Second Exchange SDK'
    keys: IKeys = new Keys(this.lang)
    storage: typeof LocalStorage | undefined
    relayPool: IRelay = new Relay()
    logLevel: string | undefined
}