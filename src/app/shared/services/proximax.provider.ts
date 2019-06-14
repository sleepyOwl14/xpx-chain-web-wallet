import { Injectable } from '@angular/core';
import { crypto } from 'js-xpx-catapult-library';
import {
  Password,
  SimpleWallet,
  MosaicInfo,
  TransactionHttp,
  Listener,
  AccountHttp,
  MosaicHttp,
  NamespaceHttp,
  MosaicService,
  NamespaceService,
  TransactionStatusError,
  SignedTransaction,
  NamespaceId,
  QueryParams,
  NetworkType,
  Account,
  PublicAccount,
  TransferTransaction,
  Deadline,
  Mosaic,
  MosaicId,
  UInt64,
  PlainMessage,
  Address,
  MosaicAmountView,
  Transaction,
  MosaicSupplyChangeTransaction,
  RegisterNamespaceTransaction,
  AccountInfo,
  MosaicNonce,
  MosaicDefinitionTransaction,
  MosaicProperties,
  TransactionStatus,
  TransactionAnnounceResponse,
  MosaicSupplyType,
  AliasTransaction,
  AliasActionType
} from 'tsjs-xpx-catapult-sdk';

import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { commonInterface, walletInterface } from '../interfaces/shared.interfaces';
import { MosaicXPXInterface } from '../../dashboard/services/transaction.interface';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProximaxProvider {

  url: any;
  infoMosaic: MosaicInfo;
  transactionHttp: TransactionHttp;
  websocketIsOpen = false;
  connectionWs: Listener;
  accountHttp: AccountHttp;
  mosaicHttp: MosaicHttp;
  namespaceHttp: NamespaceHttp;
  mosaicService: MosaicService;
  namespaceService: NamespaceService;
  transactionStatusError: TransactionStatusError;
  mosaicXpx: MosaicXPXInterface = {
    mosaic: 'prx.xpx',
    mosaicId: '0dc67fbe1cad29e3',
    divisibility: 6
  };

  constructor() {
  }


  /**
     * Create account simple
     *
     * @param {string} walletName
     * @param {Password} password
     * @param {number} network
     * @returns {SimpleWallet}
     * @memberof ProximaxProvider
     */
  createAccountSimple(walletName: string, password: Password, network: number): SimpleWallet {
    return SimpleWallet.create(walletName, password, network);
  }

  /**
    * Create a password
    *
    * @param {string} value
    * @returns {Password}
    * @memberof ProximaxProvider
    */
  createPassword(value: string): Password {
    return new Password(value);
  }

  /**
   * Create account simple
   *
   * @param {string} nameWallet
   * @param {Password} password
   * @param {string} privateKey
   * @param {number} network
   * @returns {SimpleWallet}
   * @memberof ProximaxProvider
   */
  createAccountFromPrivateKey(nameWallet: string, password: Password, privateKey: string, network: number): SimpleWallet {
    return SimpleWallet.createFromPrivateKey(nameWallet, password, privateKey, network);
  }

  /**
  * Decrypt and return private key
  * @param password
  * @param encryptedKey
  * @param iv
  */
  decryptPrivateKey(password: Password, encryptedKey: string, iv: string): string {
    const common: commonInterface = {
      password: password.value,
      privateKey: ''
    };

    const wallet: walletInterface = {
      encrypted: encryptedKey,
      iv: iv,
    };

    crypto.passwordToPrivatekey(common, wallet, 'pass:bip32');
    return common.privateKey;
  }


  /******************** FIN COW **********************/






  /**
   *
   *
   * @param {NamespaceId} namespaceId
   * @param {QueryParams} [queryParams]
   * @returns
   * @memberof ProximaxProvider
   */
  async getInfoMosaicFromNamespacePromise(namespaceId: NamespaceId, queryParams?: QueryParams) {
    /* const promise = await new Promise(async (resolve, reject) => {
       if (this.infoMosaic === undefined) {
         const mosaicInfo = await this.mosaicHttp.getMosaicsFromNamespace(namespaceId).toPromise();
         resolve(mosaicInfo);
       } else {
         reject(null);
       }
     });
     return await promise;*/
    return null;
  }


  /**
   *
   *
   * @param {SignedTransaction} signedTransaction
   * @returns {Observable<TransactionAnnounceResponse>}
   * @memberof ProximaxProvider
   */
  announce(signedTransaction: SignedTransaction): Observable<TransactionAnnounceResponse> {
    return this.transactionHttp.announce(signedTransaction);
  }

  /**
   *
   *
   * @param {NetworkType} network
   * @returns
   * @memberof ProximaxProvider
   */
  blockchainNetworkConnection(network: NetworkType) {
    const blockChainNetworkType = this.getBlockchainNetworkType(network);
    return null; /* new BlockchainNetworkConnection(
      blockChainNetworkType,
      environment.blockchainConnection.host,
      environment.blockchainConnection.port,
      environment.blockchainConnection.protocol
    );*/
  }



  /**
   * Check if Address it is correct
   * @param privateKey privateKey
   * @param address address
   * @return checkAddress
   */
  checkAddress(privateKey: string, net: NetworkType, address: string): boolean {
    return (Account.createFromPrivateKey(privateKey, net).address.plain() === address) ? true : false;
  }



  /**
 * createPublicAccount
 * @param publicKey
 * @param network
 * @returns {PublicAccount}
 */
  createPublicAccount(publicKey: string, network: NetworkType): PublicAccount {
    return PublicAccount.createFromPublicKey(publicKey, network);
  }

  /**
   *
   *
   * @param {string} publicKey
   * @param {NetworkType} networkType
   * @returns {Address}
   * @memberof ProximaxProvider
   */
  createAddressFromPublicKey(publicKey: string, networkType: NetworkType): Address {
    return Address.createFromPublicKey(publicKey, networkType)
  }

  /**
   * Create transaction
   *
   * @param recipientAddress
   * @param message
   * @param network
   */
  createTransaction(recipient: string, amount: any, message: string, network: NetworkType) {
    const recipientAddress = this.createFromRawAddress(recipient);
    return TransferTransaction.create(
      Deadline.create(5),
      recipientAddress,
      [new Mosaic(new MosaicId(this.mosaicXpx.mosaic), UInt64.fromUint(Number(amount)))],
      PlainMessage.create(message),
      network
    );
  }

  /**
   * Create an Address from a given raw address.
   *
   * @param {*} address
   * @returns {Address}
   * @memberof ProximaxProvider
   */
  createFromRawAddress(address: string): Address {
    return Address.createFromRawAddress(address);
  }

  createNonceRandom() {
    return MosaicNonce.createRandom();
  }

  /**
   *
   *
   * @param {MosaicId} mosaicId
   * @param {MosaicSupplyType} mosaicSupplyType
   * @param {UInt64} delta
   * @param {NetworkType} network
   * @returns {MosaicSupplyChangeTransaction}
   * @memberof ProximaxProvider
   */
  buildMosaicSupplyChange(
    mosaicId: MosaicId,
    mosaicSupplyType: MosaicSupplyType,
    delta: UInt64,
    network: NetworkType
  ): MosaicSupplyChangeTransaction {
    return MosaicSupplyChangeTransaction.create(
      Deadline.create(5),
      mosaicId,
      mosaicSupplyType,
      delta,
      network
    );
  }


  /**
   *
   *
   * @param {MosaicNonce} nonce
   * @param {Account} account
   * @param {boolean} supplyMutableParam
   * @param {boolean} transferableParam
   * @param {boolean} levyMutableParam
   * @param {number} divisibilityParam
   * @param {number} durationParam
   * @param {NetworkType} network
   * @returns {MosaicDefinitionTransaction}
   * @memberof ProximaxProvider
   */
  buildMosaicDefinition(
    nonce: MosaicNonce,
    account: Account,
    supplyMutableParam: boolean,
    transferableParam: boolean,
    levyMutableParam: boolean,
    divisibilityParam: number,
    durationParam: number,
    network: NetworkType
  ): MosaicDefinitionTransaction {
    return MosaicDefinitionTransaction.create(
      Deadline.create(5),
      nonce,
      MosaicId.createFromNonce(nonce, account.publicAccount),
      MosaicProperties.create({
        supplyMutable: supplyMutableParam,
        transferable: transferableParam,
        levyMutable: levyMutableParam,
        divisibility: divisibilityParam,
        duration: UInt64.fromUint(durationParam)
      }),
      network
    );
  }

  /**
  *
  *
  * @param {any} amount
  * @param {any} divisibility
  * @returns
  * @memberof ProximaxProvider
  */
  formatterAmount(amount: number, divisibility: number) {
    const amountDivisibility = Number(amount / Math.pow(10, divisibility));
    return (amountDivisibility).toLocaleString('en-us', { minimumFractionDigits: divisibility });
  }

  /**
   * Get account info from address
   *
   * @param {Address} address
   * @returns {Observable<AccountInfo>}
   * @memberof ProximaxProvider
   */
  getAccountInfo(address: Address): Observable<AccountInfo> {
    return this.accountHttp.getAccountInfo(address);
  }

  /**
   *
   *
   * @param {NetworkType} network
   * @returns {NetworkType}
   * @memberof ProximaxProvider
   */
  getBlockchainNetworkType(network: NetworkType): NetworkType {
    switch (network) {
      case NetworkType.MAIN_NET:
        return NetworkType.MAIN_NET;
      case NetworkType.MIJIN:
        return NetworkType.MIJIN;
      case NetworkType.MIJIN_TEST:
        return NetworkType.MIJIN_TEST;
      case NetworkType.TEST_NET:
        return NetworkType.TEST_NET;
    }
  }

  /**
   * get
   *
   * @param {string} privateKey
   * @param {*} net
   * @returns {PublicAccount}
   * @memberof ProximaxProvider
   */
  getPublicAccountFromPrivateKey(privateKey: string, net: NetworkType): PublicAccount {
    return Account.createFromPrivateKey(privateKey, net).publicAccount;
  }

  /**
   * get
   *
   * @param {string} privateKey
   * @param {*} net
   * @returns {Account}
   * @memberof ProximaxProvider
   */
  getAccountFromPrivateKey(privateKey: string, net: NetworkType): Account {
    return Account.createFromPrivateKey(privateKey, net);
  }

  /**
   * Get mosaic
   *
   * @param {any} mosaicId
   * @returns
   * @memberof ProximaxProvider
   */
  getMosaic(mosaicId: MosaicId): Observable<MosaicInfo> {
    return this.mosaicHttp.getMosaic(mosaicId);
  }

  /**
   *
   *
   * @param {MosaicId[]} mosaicIsd
   * @returns {Observable<MosaicInfo[]>}
   * @memberof ProximaxProvider
   */
  getMosaics(mosaicIsd: MosaicId[]): Observable<MosaicInfo[]> {
    return this.mosaicHttp.getMosaics(mosaicIsd);
  }

  /**
   *Get balance mosaics in form of MosaicAmountViews for a given account address
   *
   * @param {Address} address
   * @returns {Observable<MosaicAmountView[]>}
   * @memberof ProximaxProvider
   */
  getBalance(address: Address): Observable<MosaicAmountView[]> {
    return this.mosaicService.mosaicsAmountViewFromAddress(address);
  }

  /**
   *Gets an array of confirmed transactions for which an account is signer or receiver.
   *
   * @param {*} publicKey
   * @param {NetworkType} network
   * @param {QueryParams} [queryParams]
   * @returns {Observable<Transaction[]>}
   * @memberof ProximaxProvider
   */
  getTransactionsFromAccount(publicAccount: PublicAccount, queryParams?): Observable<Transaction[]> {
    return this.accountHttp.transactions(publicAccount, new QueryParams(100));
  }

  /**
   * Gets a transaction for a transactionId
   *
   * @param {string} transactionId
   * @returns {Observable<Transaction>}
   * @memberof ProximaxProvider
   */
  getTransaction(transactionId: string): any { //Observable<Transaction> {
    return this.transactionHttp.getTransaction(transactionId);
  }

  /**
   *Gets the array of transactions for which an account is the sender or receiver and which have not yet been included in a block.
   *
   * @param {*} publicKey
   * @param {NetworkType} network
   * @param {QueryParams} [queryParams]
   * @returns {Observable<Transaction[]>}
   * @memberof ProximaxProvider
   */
  getUnconfirmedTransactionsFromAnAccount(publicAccount: PublicAccount, queryParams?: QueryParams): any {//Observable<Transaction[]> {
    return this.accountHttp.unconfirmedTransactions(publicAccount, queryParams);
  }

  /**
   * Return getTransaction from id or hash
   * @param param
   */
  getTransactionInformation(hash: string, node = ''): any {//Observable<Transaction> {
    const transaction: TransactionHttp = (node === '') ? this.transactionHttp : new TransactionHttp(environment.protocol + '://' + `${node}`);
    return transaction.getTransaction(hash);
  }

  /**
   *Gets a transaction status for a transaction hash
   *
   * @param {string} hash
   * @returns {Observable<TransactionStatus>}
   * @memberof ProximaxProvider
   */
  getTransactionStatusError(hash: string): Observable<TransactionStatus> {
    // console.log('hash', hash)
    return this.transactionHttp.getTransactionStatus(hash);
  }

  /**
   * Gnenerate account simple
   *
   * @param {*} network
   * @returns {Account}
   * @memberof ProximaxProvider
   */
  generateNewAccount(network: NetworkType): Account {
    return Account.generateNewAccount(network);
    // account.address.pretty()
    // account.privateKey
  }

  /**
   * Get namespace id
   *
   * @param {any} id
   * @returns
   * @memberof ProximaxProvider
   */
  getNamespaceId(id: string | number[]): NamespaceId {
    return new NamespaceId(id);
  }

  /**
   *
   *
   * @param {(string | number[])} id
   * @returns {MosaicId}
   * @memberof ProximaxProvider
   */
  getMosaicId(id: string | number[]): MosaicId {
    return new MosaicId(id);
  }

  /**
   *
   *
   * @param {NamespaceId} namespace
   * @returns {Observable<NamespaceInfo>}
   * @memberof ProximaxProvider
   */
  getNamespace(namespace: NamespaceId): any {// Observable<NamespaceInfo> {
    return this.namespaceHttp.getNamespace(namespace);
  }

  /**
   * GET INFO MOSAICS, RETURN PROMISE
   *
   * @param {MosaicId[]} mosaicsId
   * @returns
   * @memberof ProximaxProvider
   */
  getMosaicViewPromise(mosaicsId: MosaicId[]): any {//{Promise<MosaicView[]> {
    return this.mosaicService.mosaicsView(mosaicsId).toPromise();
  }


  /**
   * How many different mosaics does your account hold?
   * Call mosaicsAmountViewFromAddress function, passing your account’s address as a parameter.
   *
   * @param {Address} address
   * @memberof ProximaxProvider
   */
  getMosaicsAmountView(address: Address) {
    this.mosaicService
      .mosaicsAmountViewFromAddress(address)
      .pipe(
        mergeMap((_) => _)
      )
      .subscribe(mosaic => console.log('You have', mosaic.relativeAmount(), mosaic.fullName()),
        err => console.error(err));
  }


  /**
  *
  *
  * @param {string} url
  * @memberof ProximaxProvider
  */
  initInstances(url: string) {
    this.url = `${environment.protocol}://${url}`;
    this.accountHttp = new AccountHttp(this.url);
    this.mosaicHttp = new MosaicHttp(this.url);
    this.namespaceHttp = new NamespaceHttp(this.url);
    this.mosaicService = new MosaicService(this.accountHttp, this.mosaicHttp);
    this.namespaceService = new NamespaceService(this.namespaceHttp);
    this.transactionHttp = new TransactionHttp(this.url);
  }

  /**
   *
   *
   * @param {AliasActionType} aliasActionType
   * @param {NamespaceId} namespaceId
   * @param {MosaicId} mosaicId
   * @param {NetworkType} network
   * @returns
   * @memberof ProximaxProvider
   */
  linkingNamespaceToMosaic(aliasActionType: AliasActionType, namespaceId: NamespaceId, mosaicId: MosaicId, network: NetworkType) {
    return AliasTransaction.createForMosaic(
      Deadline.create(),
      aliasActionType,
      namespaceId,
      mosaicId,
      network
    );
  }

  /**
   *
   *
   * @param {string} mosaicId
   * @param {number} supply
   * @param {number} mosaicSupplyType
   * @param {NetworkType} network
   * @returns {MosaicSupplyChangeTransaction}
   * @memberof ProximaxProvider
   */
  mosaicSupplyChangeTransaction(mosaicId: string, supply: number, mosaicSupplyType: number, network: NetworkType): MosaicSupplyChangeTransaction {
    return MosaicSupplyChangeTransaction.create(
      Deadline.create(),
      new MosaicId(mosaicId),
      mosaicSupplyType,
      UInt64.fromUint(supply),
      network
    );
  }

  /**
   *
   *
   * @param {string} name
   * @param {NetworkType} network
   * @param {number} [duration=100]
   * @returns {RegisterNamespaceTransaction}
   * @memberof ProximaxProvider
   */
  registerRootNamespaceTransaction(name: string, network: NetworkType, duration: number = 100): RegisterNamespaceTransaction {
    // Crear namespace transaction
    // console.log('duration;', duration)
    return RegisterNamespaceTransaction.createRootNamespace(
      Deadline.create(23),
      name,
      UInt64.fromUint(duration),
      network);

  }

  /**
   *
   *
   * @param {string} rootNamespace
   * @param {string} subnamespaceName
   * @param {NetworkType} network
   * @returns {RegisterNamespaceTransaction}
   * @memberof ProximaxProvider
   */
  registersubNamespaceTransaction(rootNamespace: string, subnamespaceName: string, network: NetworkType): RegisterNamespaceTransaction {
    // Crear namespace transaction
    return RegisterNamespaceTransaction.createSubNamespace(
      Deadline.create(23),
      subnamespaceName,
      rootNamespace,
      network
    );
  }

  /**
  *
  *
  * @param {NetworkType} network
  * @param {string} address
  * @param {string} [message]
  * @param {number} [amount=0]
  * @returns {TransferTransaction}
  * @memberof ProximaxProvider
  */
  buildTransferTransaction(network: NetworkType, address: Address, message?: string, amount: number = 0): TransferTransaction {
    const mosaicId = new MosaicId(this.mosaicXpx.mosaicId);
    return TransferTransaction.create(
      Deadline.create(5),
      address,
      [new Mosaic(mosaicId, UInt64.fromUint(Number(amount)))],
      PlainMessage.create(message),
      network
    );
  }
}
