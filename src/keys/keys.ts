import Mnemonic from 'bitcore-mnemonic'

import lodash, { valuesIn } from 'lodash'

import { LANG } from './keysEnum'

// Have to figure out that how and where to obtain the code and priv key strategy

export interface IKeys {
    create(): any;
    mnemonic: {code: any, priv: any} | undefined
}

export class Keys implements IKeys {
    mnemonic: {code: any, priv: any} | undefined;

    constructor(lang: LANG){
        const values = lodash.values(LANG)
        if (lodash.find(values, lang)){
            this.mnemonic = this.getMnemonicAndPriv(LANG[lang])
        }
    }

    getMnemonicAndPriv(lang: any) {
        if (!lang){
            lang = 'ENGLISH'
        }
        const code = new Mnemonic(Mnemonic.Words[lang])
        const priv = code.toHDPrivateKey();
        return {code, priv}
    }

    create(){

    }

}


