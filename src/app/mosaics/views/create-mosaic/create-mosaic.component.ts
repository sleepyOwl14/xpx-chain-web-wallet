import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subscription } from 'rxjs';
import { UInt64, Deadline, AggregateTransaction, MosaicSupplyType, SignedTransaction, MosaicId } from 'tsjs-xpx-chain-sdk';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { DataBridgeService } from '../../../shared/services/data-bridge.service';
import { WalletService, AccountsInterface, AccountsInfoInterface } from '../../../wallet/services/wallet.service';
import { TransactionsService } from '../../../transactions/services/transactions.service';
import { environment } from '../../../../environments/environment';
import { HeaderServicesInterface } from '../../../servicesModule/services/services-module.service';
import { MosaicService } from '../../../servicesModule/services/mosaic.service';


@Component({
  selector: 'app-create-mosaic',
  templateUrl: './create-mosaic.component.html',
  styleUrls: ['./create-mosaic.component.css']
})
export class CreateMosaicComponent implements OnInit {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Mosaics',
    componentName: 'Create',
  };
  @BlockUI() blockUI: NgBlockUI;
  configurationForm: ConfigurationForm = {};
  isOwner = false;
  mosaicForm: FormGroup;

  mosaicSupplyType: any = [{
    value: MosaicSupplyType.Increase,
    label: 'Increase',
    selected: true,
    disabled: false
  }, {
    value: MosaicSupplyType.Decrease,
    label: 'Decrease',
    selected: false,
    disabled: false
  }];
  durationByBlock = '5760';
  blockSend: boolean = false;
  transactionSigned: SignedTransaction[] = [];
  transactionReady: SignedTransaction[] = [];
  subscribe = ['transactionStatus'];
  rentalFee = 4576;
  calculateRentalFee: any = '10,000.000000';
  currentAccount: AccountsInterface;
  insufficientBalance = true;
  accountInfo: AccountsInfoInterface;
  deltaSupply: number;
  invalidDivisibility: boolean;
  // invalidSupply: boolean;
  blockButton: boolean;
  errorDivisibility: string;
  errorSupply: string;
  maxLengthSupply: number = 13;
  optionsSuply = {
    prefix: '',
    thousands: ',',
    decimal: '.',
    precision: '0'
  };
  supplyMutable: any;
  transferable: any;
  divisibility: any;
  aggregateTransaction: AggregateTransaction;
  fee: any = '0.000000';
  amountAccount: number;
  notExpire: any;
  subscription: Subscription[] = [];
  vestedBalance: { part1: string; part2: string; };
  passwordMain: string = 'password';
  invalidSupply: boolean;

  constructor(
    private fb: FormBuilder,
    private proximaxProvider: ProximaxProvider,
    private walletService: WalletService,
    private dataBridge: DataBridgeService,
    private sharedService: SharedService,
    private transactionService: TransactionsService,
    private mosaicServices: MosaicService,
  ) {
  }

  ngOnInit() {
    this.createForm();
    this.subscribeValue();
    // this.amountAccount = this.walletService.getAmountAccount();
    this.balance();
    this.walletService.getAccountsInfo$().subscribe(
      x => this.validateBalance()
    );
    // this.calculateRentalFee = this.transactionService.amountFormatterSimple(Number(this.rentalFee));
    this.configurationForm = this.sharedService.configurationForm;
    this.mosaicForm.disable();
    this.validateBalance();
    this.mosaicForm.get('duration').valueChanges.subscribe(next => {
      this.durationByBlock = this.transactionService.calculateDurationforDay(next).toString();
      this.validateRentalFee(this.rentalFee * parseFloat(this.durationByBlock));
    });
    this.mosaicForm.get('divisibility').valueChanges.subscribe(next => {
      if (next > 6) {
        this.maxLengthSupply = 13;
        this.errorDivisibility = '-invalid';
        this.invalidDivisibility = true;
        this.blockButton = true;
      } else {
        this.optionsSuply = {
          prefix: '',
          thousands: ',',
          decimal: '.',
          precision: next
        };
        this.invalidSupply = false;
        this.maxLengthSupply = 13 + parseFloat(next);
        this.errorDivisibility = '';
        this.blockButton = false;
        this.invalidDivisibility = false;
      }
      // this.mosaicForm.get('deltaSupply').setValue('');
    });

    this.mosaicForm.get('deltaSupply').valueChanges.subscribe(next => {
      if (parseFloat(next) <= this.configurationForm.mosaicWallet.maxSupply) {
        if (next === 0) {
          this.invalidSupply = true;
        } else {
          this.invalidSupply = false;
        }

        // this.invalidSupply = false;
        this.blockButton = false;
        this.errorSupply = '';

        if (!this.mosaicForm.get('divisibility').value) {
          this.deltaSupply = parseInt(next);
        } else {
          this.deltaSupply = parseInt(this.transactionService.addZeros(this.mosaicForm.get('divisibility').value, next));
        }
      } else {
        this.errorSupply = '-invalid';
        this.blockButton = true;
        // this.invalidSupply = true;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscribe.forEach(element => {
      if (this.subscribe[element] !== undefined) {
        this.subscribe[element].unsubscribe();
      }
    });
  }


  /**
   *
   *
   * @param {number} amount
   * @returns
   * @memberof CreateMosaicComponent
   */
  async validateRentalFee(amount: number) {
    const accountInfo = this.walletService.filterAccountInfo();
    if (accountInfo && accountInfo.accountInfo && accountInfo.accountInfo.mosaics && accountInfo.accountInfo.mosaics.length > 0) {
      const xpxInBalance = accountInfo.accountInfo.mosaics.find(element => {
        return element.id.toHex() === new MosaicId(environment.mosaicXpxInfo.id).toHex();
      });

      if (xpxInBalance) {
        const invalidBalance = xpxInBalance.amount.compact() < amount;
        const mosaic = await this.mosaicServices.filterMosaics([xpxInBalance.id]);
        if (mosaic && mosaic[0].mosaicInfo) {
          this.calculateRentalFee = this.transactionService.amountFormatterSimple(amount);
        } else {
          this.insufficientBalance = true;
        }

        if (invalidBalance) {
          this.insufficientBalance = false;
        } else if (!invalidBalance) {
          this.insufficientBalance = false;
        }

        return;
      }
    }

    this.insufficientBalance = true;
  }


  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  balance() {
    this.subscription.push(this.transactionService.getBalance$().subscribe(
      next => this.vestedBalance = this.transactionService.getDataPart(next, 6),
      error => this.vestedBalance = {
        part1: '0',
        part2: '000000'
      }
    ));
    let vestedBalance = this.vestedBalance.part1.concat(this.vestedBalance.part2).replace(/,/g,'');
    this.amountAccount = Number(vestedBalance)
  }

  /**
   *
   *
   * @param {*} inputType
   * @memberof CreateMosaicComponent
   */
  changeInputType(inputType) {
    let newType = this.sharedService.changeInputType(inputType)
    this.passwordMain = newType;
  }

  /**
   * Create form namespace
   *
   * @memberof CreateMosaicComponent
   */
  createForm() {
    this.mosaicForm = this.fb.group({
      deltaSupply: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
      duration: [''],
      divisibility: ['', [Validators.required]],
      notExpire: [true],
      transferable: [false],
      supplyMutable: [false],
    });
  }

  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  clearForm() {
    if (this.mosaicForm.get('duration').disabled) {
      this.mosaicForm.get('duration').enable({
        emitEvent: false
      });
    }

    this.calculateRentalFee = '10,000.000000';
    this.optionsSuply = {
      prefix: '',
      thousands: ',',
      decimal: '.',
      precision: '0'
    };
    this.invalidSupply = false;
    this.mosaicForm.reset({
      deltaSupply: '',
      password: '',
      duration: '',
      divisibility: '',
      transferable: false,
      supplyMutable: false,
      notExpire: true,
    },{
      emitEvent: false
    });
  }

  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  cleanCheck() {
    this.divisibility = '';
    this.transferable = false;
    this.supplyMutable = false;
  }

  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  subscribeValue() {
    const account = this.walletService.currentAccount;
    const duration = (this.mosaicForm.get('duration').enabled) ? parseInt(this.durationByBlock) : undefined;
    let params = {
      nonce: null,
      account: account,
      supplyMutable: '',
      transferable: '',
      divisibility: '',
      duration: duration,
      network: this.walletService.currentAccount.network
    }

    this.mosaicForm.get('supplyMutable').valueChanges.subscribe(
      supplyMutable => {
        this.supplyMutable = supplyMutable;
        params.supplyMutable = this.supplyMutable;
        this.buildMosaicDefinition(account, params)
      });
    this.mosaicForm.get('transferable').valueChanges.subscribe(
      transferable => {
        this.transferable = transferable
        params.transferable = this.transferable;
        this.buildMosaicDefinition(account, params)

      });
    this.mosaicForm.get('divisibility').valueChanges.subscribe(
      divisibility => {
        this.divisibility = divisibility
        params.divisibility = this.divisibility;
        params.nonce = this.proximaxProvider.createNonceRandom();
        this.buildMosaicDefinition(account, params)
      });
  }

  /**
   *
   *
   * @param {*} account
   * @param {*} params
   * @memberof CreateMosaicComponent
   */
  buildMosaicDefinition(account, params) {
    const mosaicDefinitionTransaction = this.proximaxProvider.buildMosaicDefinition(params);
    const mosaicSupplyChangeTransaction = this.proximaxProvider.buildMosaicSupplyChange(
      mosaicDefinitionTransaction.mosaicId,
      MosaicSupplyType.Increase,
      UInt64.fromUint(this.deltaSupply),
      this.walletService.currentAccount.network
    );

    this.aggregateTransaction = AggregateTransaction.createComplete(
      Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
      [
        mosaicDefinitionTransaction.toAggregate(account.publicAccount),
        mosaicSupplyChangeTransaction.toAggregate(account.publicAccount)
      ],
      this.walletService.currentAccount.network,
      []
    );
    this.fee = this.transactionService.amountFormatterSimple(this.aggregateTransaction.maxFee.compact());
  }
  /**
   *
   *
   * @param {*} $event
   * @memberof CreateMosaicComponent
   */
  changeNotExpire($event) {
    if (!$event.checked) {
      this.calculateRentalFee = '0.000000'
      if (this.mosaicForm.get('duration').disabled) {
        this.mosaicForm.get('duration').enable({
          emitEvent: false
        });
      }
    } else {
      this.noExpite();
      if (this.mosaicForm.get('duration').enabled) {
        this.mosaicForm.get('duration').setValue('', {
          emitEvent: false
        });
        this.mosaicForm.get('duration').disable({
          emitEvent: false
        });
      }
    }
  }

  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  send() {
    if (this.mosaicForm.valid && !this.blockSend) {
      const validateAmount = this.transactionService.validateBuildSelectAccountBalance(this.amountAccount, Number(this.fee), Number(this.calculateRentalFee.replace(/,/g,'')));
      if (validateAmount) {
        const common = {
          password: this.mosaicForm.get('password').value,
          privateKey: ''
        }

        if (this.walletService.decrypt(common)) {
          this.blockSend = true;
          const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
          const nonce = this.proximaxProvider.createNonceRandom();
          const duration = undefined;
          const params = {
            nonce: nonce,
            account: account,
            supplyMutable: this.mosaicForm.get('supplyMutable').value,
            transferable: this.mosaicForm.get('transferable').value,
            divisibility: this.mosaicForm.get('divisibility').value,
            duration: duration,
            network: this.walletService.currentAccount.network
          }

          const mosaicDefinitionTransaction = this.proximaxProvider.buildMosaicDefinition(params);
          const mosaicSupplyChangeTransaction = this.proximaxProvider.buildMosaicSupplyChange(
            mosaicDefinitionTransaction.mosaicId,
            MosaicSupplyType.Increase,
            UInt64.fromUint(this.deltaSupply),
            this.walletService.currentAccount.network
          );

          const aggregateTransaction = AggregateTransaction.createComplete(
            Deadline.create(),
            [
              mosaicDefinitionTransaction.toAggregate(account.publicAccount),
              mosaicSupplyChangeTransaction.toAggregate(account.publicAccount)
            ],
            this.walletService.currentAccount.network,
            []
          );


          // I SIGN THE TRANSACTION
          const generationHash = this.dataBridge.blockInfo.generationHash
          const signedTransaction = account.sign(aggregateTransaction, generationHash);  //Update-sdk-dragon
          this.transactionSigned.push(signedTransaction);
          this.proximaxProvider.announce(signedTransaction).subscribe(
            async x => {
              if (this.subscribe['transactionStatus'] === undefined || this.subscribe['transactionStatus'] === null) {
                this.getTransactionStatus();
              }

              this.setTimeOutValidate(signedTransaction.hash);
            }, error => {
              this.blockSend = false;
            }
          );
        } else {
          this.blockSend = false;
        }
      } else {
        this.sharedService.showError('', 'Insufficient Balance');
      }
    }
  }

  /**
   *
   *
   * @param {string} hash
   * @memberof CreateMosaicComponent
   */
  setTimeOutValidate(hash: string) {
    setTimeout(() => {
      let exist = false;
      for (let element of this.transactionReady) {
        if (hash === element.hash) {
          exist = true;
        }
      }
      (exist) ? '' : this.sharedService.showWarning('', 'Error connecting to the node');
    }, 5000);
  }

  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  getTransactionStatus() {
    // Get transaction status
    this.subscribe['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
          for (let element of this.transactionSigned) {
            const match = statusTransaction['hash'] === element.hash;
            if (match) {
              this.transactionReady.push(element);
              this.blockSend = false;
              this.clearForm();
              this.cleanCheck();
            }

            if (statusTransaction['type'] === 'confirmed' && match) {
              this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['hash']);
            } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            } else if (match) {
              this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['hash']);
            }
          }
        }
      }
    );
  }

  /**
   *
   *
   * @param {string} quantity
   * @returns
   * @memberof CreateMosaicComponent
   */
  getQuantity(quantity: string) {
    return this.sharedService.amountFormat(quantity);
  }

  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  validateBalance() {
    this.mosaicForm.disable();
    this.currentAccount = this.walletService.currentAccount;
    this.accountInfo = this.walletService.filterAccountInfo(this.currentAccount.name);
    if (this.accountInfo && this.accountInfo.accountInfo && this.accountInfo.accountInfo.mosaics && this.accountInfo.accountInfo.mosaics.length > 0) {
      const mosaicXPX = this.accountInfo.accountInfo.mosaics.find(x => x.id.toHex() === environment.mosaicXpxInfo.id);
      if (mosaicXPX) {
        // console.log(mosaicXPX);
        const amountMosaicXpx = this.transactionService.amountFormatterSimple(mosaicXPX.amount.compact()).replace(/,/g, '');
        const rentalFee = this.calculateRentalFee.replace(/,/g,'');
        if (Number(amountMosaicXpx) >= (Number(rentalFee) + Number(this.fee))) {
          this.insufficientBalance = false;
          this.mosaicForm.enable();
          return;
        }
      }
    }

    this.insufficientBalance = true;
    return;
  }

  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof CreateMosaicComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.mosaicForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.mosaicForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.mosaicForm.get(nameInput);
    }
    return validation;
  }


  /**
   *
   *
   * @param {*} e
   * @memberof CreateMosaicComponent
   */
  limitLength(e) {
    if (isNaN(parseInt(e.target.value))) {
      e.target.value = ''
    } else {
      if (parseInt(e.target.value) > 6) {
        e.target.value = ''
      } else if (parseInt(e.target.value) < 0) {
        e.target.value = ''
      }
    }
  }

  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  noExpite() {
    const accountInfo = this.walletService.filterAccountInfo();
    if (accountInfo && accountInfo.accountInfo && accountInfo.accountInfo.mosaics && accountInfo.accountInfo.mosaics.length > 0) {
      const xpxInBalance = accountInfo.accountInfo.mosaics.find(element => {
        return element.id.toHex() === new MosaicId(environment.mosaicXpxInfo.id).toHex();
      });

      const invalidBalance = xpxInBalance.amount.compact() < 10000000;
      if (invalidBalance) {
        this.insufficientBalance = true;
      } else {
        this.calculateRentalFee = '10.000000';
        this.insufficientBalance = false;
      }
    }
  }
}