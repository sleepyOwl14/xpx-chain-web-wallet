import axios from 'axios'
import { Account, AccountHttp, AccountOwnedAssetService, Address, AssetHttp, NEMLibrary, NetworkTypes, PublicAccount } from 'nem-library'
// import { promiseTimeout } from '../services/javascript-promise-timeout'

export default {
  data: () => {
    return {
      configNIS1: null,
      accountHttp: null,
      assetHttp: null,
      namespace: {
        root: 'prx',
        sub: 'xpxx'
      },
      divisibility: 6
    }
  },
  methods: {
    async validateBalanceAccounts (xpxFound, addressSigner) {
      const quantityFillZeros = this.$generalService.addZeros(this.divisibility, xpxFound.quantity)
      let realQuantity = this.$generalService.amountFormatter(quantityFillZeros, xpxFound, this.divisibility)
      const unconfirmedTxn = await this.getUnconfirmedTransaction(addressSigner)
      if (unconfirmedTxn.length > 0) {
        for (const item of unconfirmedTxn) {
          let existMosaic = null
          if (item.type === 257 && item['signer']['address']['value'] === addressSigner['value'] && item['_assets'].length > 0) {
            existMosaic = item['_assets'].find(
              (mosaic) => mosaic.assetId.namespaceId === this.namespace.root && mosaic.assetId.name === this.namespace.sub
            )
          } else if (
            item.type === 4100 &&
            item['otherTransaction']['type'] === 257 &&
            item['otherTransaction']['signer']['address']['value'] === addressSigner['value']
          ) {
            existMosaic = item['otherTransaction']['_assets'].find(
              (mosaic) => mosaic.assetId.namespaceId === this.namespace.root && mosaic.assetId.name === this.namespace.sub
            )
          }

          if (existMosaic) {
            const unconfirmedFormatter = parseFloat(this.$generalService.amountFormatter(existMosaic.quantity, xpxFound, this.divisibility))
            const quantityWhitoutFormat = realQuantity.split(',').join('')
            const residue = this.transactionService.subtractAmount(parseFloat(quantityWhitoutFormat), unconfirmedFormatter)
            const quantityFormat = this.$generalService.amountFormatter(parseInt((residue).toString().split('.').join('')), xpxFound, this.divisibility)
            realQuantity = quantityFormat
          }
        }
      }

      return realQuantity
    },
    async searchInfoAccountMultisig (accountInfoOwnedSwap, cosignatoryOf, accountsMultisigInfo) {
      if (accountInfoOwnedSwap.data.meta.cosignatoryOf.length > 0) {
        cosignatoryOf = accountInfoOwnedSwap.meta.cosignatoryOf
        for (let multisig of cosignatoryOf) {
          try {
            const addressMultisig = this.createAddressToString(multisig.address)
            const ownedMosaic = await this.getOwnedMosaics(addressMultisig)
            const xpxFound = ownedMosaic.find(el => el.assetId.namespaceId === this.namespace.root && el.assetId.name === this.namespace.sub)
            console.log('ownedMosaicownedMosaicownedMosaic', ownedMosaic)
            if (xpxFound) {
              multisig.balance = await this.validateBalanceAccounts(xpxFound, addressMultisig)
              multisig.mosaic = xpxFound
              accountsMultisigInfo.push(multisig)
            }
          } catch (error) {
            cosignatoryOf = []
            accountsMultisigInfo = []
          }
        }
      }

      return {
        cosignatoryOf,
        accountsMultisigInfo
      }
    },
    async searchInfoOwnedSwap (addressOwnedSwap, publicAccount, accountsMultisigInfo, cosignatoryOf) {
      let nis1AccountsInfo = null
      try {
        // SEARCH INFO OWNED SWAP
        const ownedMosaic = await this.getOwnedMosaics(addressOwnedSwap)
        const xpxFound = ownedMosaic.find(el => el.assetId.namespaceId === this.namespace.root && el.assetId.name === this.namespace.sub)
        if (xpxFound) {
          const balance = await this.validateBalanceAccounts(xpxFound, addressOwnedSwap)
          const params = { publicAccount, accountsMultisigInfo, balance, cosignersAccounts: cosignatoryOf, isMultiSign: false, name, xpxFound }
          nis1AccountsInfo = this.buildAccountInfoNIS1(params)
          // this.setNis1AccountsFound$(nis1AccountsInfo)
        } else if (cosignatoryOf.length > 0) {
          const params = { publicAccount, accountsMultisigInfo, balance: null, cosignersAccounts: cosignatoryOf, isMultiSign: false, name, xpxFound: null }
          nis1AccountsInfo = this.buildAccountInfoNIS1(params)
          // this.setNis1AccountsFound$(nis1AccountsInfo)
        } else {
          // this.setNis1AccountsFound$(null)
          this.$store.commit('SHOW_SNACKBAR', {
            snackbar: true,
            text: 'The account has no balance to swap',
            color: 'warning'
          })
        }
      } catch (error) {
        // this.setNis1AccountsFound$(null)
        this.$store.commit('SHOW_SNACKBAR', {
          snackbar: true,
          text: 'It was not possible to connect to the server, try later',
          color: 'error'
        })
      }

      return nis1AccountsInfo
    },
    buildAccountInfoNIS1 (data) {
      let cosignatoryOf = false
      if (data.cosignersAccounts.length > 0) {
        cosignatoryOf = true
      }

      return {
        nameAccount: data.name,
        address: data.publicAccount.address,
        publicKey: data.publicAccount.publicKey,
        cosignerOf: cosignatoryOf,
        cosignerAccounts: data.cosignersAccounts,
        multisigAccountsInfo: data.accountsMultisigInfo,
        mosaic: data.xpxFound,
        isMultiSig: data.isMultiSign,
        balance: data.balance
      }
    },
    createAddressToString (address) {
      return new Address(address)
    },
    createAccountFromPrivateKey (privateKey) {
      return Account.createWithPrivateKey(privateKey)
    },
    createPublicAccountFromPublicKey (publicKey) {
      return PublicAccount.createWithPublicKey(publicKey)
    },
    getAccountInfo (address) {
      this.configNIS1 = this.getConfigFromNetworkNis1(NEMLibrary.getNetworkType()).nis1Config
      const url = `${this.configNIS1.url}/account/get?address=${address.plain()}`
      return axios.get(url, { timeout: this.configNIS1.timeOutTransaction })
    },
    getConfigFromNetworkNis1 (nis1Network) {
      let config = null
      switch (nis1Network) {
        case NetworkTypes.TEST_NET:
          config = this.$configInfo.data.environment.PUBLICTEST
          break
        case NetworkTypes.MAIN_NET:
          config = this.$configInfo.data.environment.MAINNET
          break
      }

      console.log('retornando aqui', config)
      return config
    },
    getOwnedMosaics (address) {
      this.accountHttp = new AccountHttp(this.nodes)
      this.assetHttp = new AssetHttp(this.nodes)
      const accountOwnedMosaics = new AccountOwnedAssetService(this.accountHttp, this.assetHttp)
      return new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('promise timeout')), this.configNIS1.timeOutTransaction)
        accountOwnedMosaics.fromAddress(address).toPromise().then(resolve).catch(reject)
      })
    },
    getUnconfirmedTransaction (address) {
      return this.accountHttp.unconfirmedTransactions(address).toPromise()
    },
    setNetworkFromCatapultNet (catapultNetwork) {
      NEMLibrary.reset()
      const siriusNetwork = this.$blockchainProvider.getNetworkTypes()
      switch (catapultNetwork) {
        case siriusNetwork.testnet.value:
          NEMLibrary.bootstrap(NetworkTypes.TEST_NET)
          console.log(NEMLibrary.getNetworkType())
          break
        case siriusNetwork.mainnet.value:
          NEMLibrary.bootstrap(NetworkTypes.MAIN_NET)
          break
      }
    },
    swap (publicAccount) {
      let status = false
      let infoOwnedSwap = null
      const promise = new Promise(async (resolve, reject) => {
        try {
          let cosignatoryOf = []
          let accountsMultisigInfo = []
          const addressOwnedSwap = this.createAddressToString(publicAccount.address.pretty())
          const accountInfoOwnedSwap = await this.getAccountInfo(addressOwnedSwap)
          if (accountInfoOwnedSwap.data.meta.cosignatories.length === 0) {
            // INFO ACCOUNTS MULTISIG
            const accountInfoMultisig = await this.searchInfoAccountMultisig(accountInfoOwnedSwap, cosignatoryOf, accountsMultisigInfo)
            cosignatoryOf = accountInfoMultisig.cosignatoryOf
            accountsMultisigInfo = accountInfoMultisig.accountsMultisigInfo
            infoOwnedSwap = await this.searchInfoOwnedSwap(addressOwnedSwap, publicAccount, accountsMultisigInfo, cosignatoryOf)
            status = false
            if (infoOwnedSwap) {
              status = true
            }
          } else {
            status = false
            this.$store.commit('SHOW_SNACKBAR', {
              snackbar: true,
              text: 'Swap does not support this account type',
              color: 'error'
            })
          }
        } catch (error) {
          status = false
          this.$store.commit('SHOW_SNACKBAR', {
            snackbar: true,
            text: 'It was not possible to connect to the server, try later',
            color: 'error'
          })
        }

        console.log('infoOwnedSwap', infoOwnedSwap)
        resolve({ status, infoOwnedSwap })
      })

      return promise
    }
  }
}
