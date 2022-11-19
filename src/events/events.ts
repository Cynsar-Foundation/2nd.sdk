import { Buffer } from 'buffer'
import crypto from 'crypto'
import *  as secp256k1 from '@noble/secp256k1'



export interface IEvents {
    event: EventType  | undefined
} 

export interface EventType {
    id: string,
    kind: number, 
    pubkey: string, 
    content: string,
    tags: [],
    created_at: Date
    sig: string
}

export class Events implements IEvents {
    event: EventType | undefined

    constructor(){
        this.event
    }

    static serializeEvent(event: EventType) {
        return JSON.stringify([
          0,
          event.pubkey,
          event.created_at,
          event.kind,
          event.tags,
          event.content
        ])
      }
    
    static getEventHash(event: EventType){
        let buffer = Buffer.from(this.serializeEvent(event))
        let e = crypto.createHash('sha256').update(buffer).digest()
        return Buffer.from(e).toString('hex')
    }

    static validateEvent(event: EventType) {
        if (event.id !== this.getEventHash(event)) return false
        if (typeof event.content !== 'string') return false
        if (typeof event.created_at !== 'number') return false
      
        if (!Array.isArray(event.tags)) return false
        for (let i = 0; i < event.tags.length; i++) {
          let tag: any = event.tags[i]
          if (!Array.isArray(tag)) return false
          for (let j = 0; j < tag.length; j++) {
            if (typeof tag[j] === 'object') return false
          }
        }
      
        return true
      }
      
    static verifyEventSignature(event: EventType) {
        return secp256k1.schnorr.verify(event.sig, event.id, event.pubkey)
    }

    static async signEvent(event: EventType, key: any) {
        return Buffer.from(
          await secp256k1.schnorr.sign(this.getEventHash(event), key)
        ).toString('hex')
      }
    
}

  