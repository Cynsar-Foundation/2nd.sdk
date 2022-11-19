import {WebsocketBuilder} from 'websocket-ts'
import {logger} from '../utils/logger'
import {
    Events
 } from '../events/events'

 import { matchFilters } from '../utils/filters'

 interface IRelay {
     url: any
     ws: any
     resolveOpen: any
     untilOpen: any
     wasClosed: any
     openSubs: any
     isSetToSkipVerification: {}
     attemptNumber: number
     nextAttemptSeconds: number
     channels: {}
 }

export class Relay implements IRelay   {
     url: any
     ws: any
     resolveOpen: any
     untilOpen: any
     wasClosed: any
     openSubs:any  = {}
     isSetToSkipVerification:any = {}
     attemptNumber = 1
     nextAttemptSeconds = 1
     channels:any = {}
    
    constructor( relay: IRelay, onNotice= () => {}, onError=() => {}){
        logger.info('Class initialised')
        this.url = this.normalizeRelayUrl(relay.url)
        this.resetOpenState()
        try {
            this.connect(onNotice,onError)
        } catch (error) {
            logger.info('Some error')
        }
        
    }

    normalizeRelayUrl(url: any): any{
        let [host, ...qs] = url.trim().split('?')
        if (host.slice(0, 4) === 'http') host = 'ws' + host.slice(4)
        if (host.slice(0, 2) !== 'ws') host = 'wss://' + host
        if (host.length && host[host.length - 1] === '/') host = host.slice(0, -1)
        return [host, ...qs].join('?')
    }

    resetOpenState(){
        this.untilOpen = new Promise(resolve => {
            this.resolveOpen = resolve
        })
    }

    connect(onNotice = (notice:any) => {}, onError = (error: any) =>{} ) {
        this.ws = new WebsocketBuilder(this.url).build()
    
        this.ws.onOpen = () => {
          logger.info('connected to', this.url)
          this.resolveOpen()
    
          // restablish old subscriptions
          if (this.wasClosed) {
            this.wasClosed = false
            for (let channel in this.openSubs) {
              let filters = this.openSubs[channel]
              let cb = this.channels[channel]
              this.sub({cb, filter: filters}, channel)
            }
          }
        }
        this.ws.onerror = (err: any) => {
          logger.error('error connecting to relay', this.url)
          onError(err)
        }
        this.ws.onclose = () => {
          this.resetOpenState()
          this.attemptNumber++
          this.nextAttemptSeconds += this.attemptNumber ** 3
          if (this.nextAttemptSeconds > 14400) {
            this.nextAttemptSeconds = 14400 // 4 hours
          }
          logger.info(
            `relay ${this.url} connection closed. reconnecting in ${nextAttemptSeconds} seconds.`
          )
          setTimeout(async () => {
            try {
              this.connect()
            } catch (err) {}
          }, this.nextAttemptSeconds * 1000)
    
          this.wasClosed = true
        }
    
        this.ws.onmessage = async (e: { data: string }) => {
          var data
          try {
            data = JSON.parse(e.data)
          } catch (err) {
            data = e.data
          }
    
          if (data.length > 1) {
            if (data[0] === 'NOTICE') {
              if (data.length < 2) return
    
              logger.info('message from relay ' + this.url + ': ' + data[1])
              onNotice(data[1])
              return
            }
    
            if (data[0] === 'EVENT') {
              if (data.length < 3) return
    
              let channel = data[1]
              let event = data[2]
    
              if (
                Events.validateEvent(event) &&
                (this.isSetToSkipVerification[channel] || Events.verifyEventSignature(event)) &&
                this.channels[channel] &&
                matchFilters(this.openSubs[channel], event)
              ) {
                this.channels[channel](event)
              }
              return
            }
          }
        }
      }

    async trySend(params: any){
        let msg = JSON.stringify(params)
        await this.untilOpen
        this.ws.send(msg)
    }

    sub = (
        {cb, filter, beforeSend, skipVerification }: any,
        channel = Math.random().toString().slice(2)
    ) => {
        let filters = []
        if (Array.isArray(filter)) {
            filters = filter
        } else {
            filters.push(filter)
        }

        if (beforeSend) {
            const beforeSendResult = beforeSend({filter, relay: this.url, channel})
            filters = beforeSendResult.filter
        }

        this.trySend(['REQ', channel, ...filters])
        this.channels[channel] = cb
        this.openSubs[channel] = filters
        this.isSetToSkipVerification[channel] = skipVerification

        const activeCallback = cb
        const activeFilters = filters
        const activeBeforeSend = beforeSend

        return {
            sub: ({
                cb = activeCallback,
                filter = activeFilters,
                beforeSend = activeBeforeSend
            }) => this.sub({
                cb, filter, beforeSend, skipVerification
            }, channel),
            unsub: () => {
                delete this.openSubs[channel]
                delete this.channels[channel]
                delete this.isSetToSkipVerification[channel]
                this.trySend(['CLOSE', channel])
            }
        }
     }

    close() {
        this.ws.close
    }

    async publish(event: any, statusCallback: any){
        try {
            await this.trySend(['EVENT', event])
            if (statusCallback) {
                statusCallback(0)
                let { unsub } = this.sub(
                    {
                        cb: () => {
                            statusCallback(1)
                            unsub()
                            clearTimeout(willunSub)
                        },
                        filter: {ids: [event.id]}
                    },
                    `monitor-${event.id.slice(0,5)}`
                )
                let willunSub = setTimeout(unsub, 5000)
            }
        }catch (error){
            if (statusCallback) statusCallback(-1)
        }
    }

    get status(){
        return this.ws.readyState
    }
     
}