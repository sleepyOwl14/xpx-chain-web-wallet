import { Component, OnInit, ChangeDetectorRef, AfterViewInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { UploadInput, humanizeBytes, UploadOutput, UploadFile } from 'ng-uikit-pro-standard';
import { Mosaic, MosaicId, UInt64 } from 'tsjs-xpx-chain-sdk';
import {
  Uploader,
  PrivacyType,
  Uint8ArrayParameterData,
  UploadParameter,
  Protocol,
  ConnectionConfig,
  BlockchainNetworkConnection,
  IpfsConnection
} from 'tsjs-chain-xipfs-sdk';
import { AppConfig } from '../../../../config/app.config';
import { ConfigurationForm, SharedService } from '../../../../shared/services/shared.service';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { environment } from '../../../../../environments/environment';
import { HeaderServicesInterface } from '../../../services/services-module.service';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css']
})
export class UploadFileComponent implements OnInit, AfterViewInit {

  @BlockUI() blockUI: NgBlockUI;
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Storage',
    componentName: 'Upload file',
    extraButton: 'Files',
    routerExtraButton: `/${AppConfig.routes.myFile}`
  };
  configurationForm: ConfigurationForm = {};
  uploadForm: FormGroup;
  blockUpload: boolean = false;
  uploading: false;
  files: any[];
  uploadInput: any;
  humanizeBytes: (bytes: number) => string;
  optionsEncryptionMethods: Array<any>;
  dragOver: boolean;
  showEncryptionPassword: boolean;
  showEncryptionKeyPair: boolean;
  signerPrivateKey: any;
  privacyType: any;
  uploader: Uploader;
  goBack = `/${AppConfig.routes.service}`;
  errorMatchPassword: string;
  mosaics: any[];

  constructor(
    private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService
  ) {
    this.files = [];
    this.uploadInput = new EventEmitter<UploadInput>();
    this.humanizeBytes = humanizeBytes;
  }


  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
    this.initialiseStorage();
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }

  /**
   *
   *
   * @memberof UploadFileComponent
   */
  async upload() {
    this.doValidate();
    if (this.uploadForm.valid && !this.blockUpload) {
      const common = {
        password: this.uploadForm.get('walletPassword').value,
        privateKey: ''
      }

      if (this.walletService.decrypt(common)) {
        this.blockUpload = true;
        const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
        try {
          const uploadedFile = this.files[0].nativeFile;
          const uploadedFileType = uploadedFile.type;
          const uploadedFileContent = await this.readFile(uploadedFile);
          const fileName = this.uploadForm.get('filePath').value;
          const optionalFileName = uploadedFile.name;
          const metaParams = Uint8ArrayParameterData.create(uploadedFileContent, optionalFileName, '', uploadedFileType);
          const uploadParams = UploadParameter.createForUint8ArrayUpload(metaParams, account.privateKey);
          const encryptionMethod = this.uploadForm.get('encryptionMethod').value;

          switch (encryptionMethod) {
            case PrivacyType.PLAIN:
              uploadParams.withPlainPrivacy();
              break;
            case PrivacyType.PASSWORD:
              const encryptionPassword = this.uploadForm.controls.encryptionPasswords.get('password').value;
              uploadParams.withPasswordPrivacy(encryptionPassword);
              break;
            case PrivacyType.NEM_KEYS:
              const publicKey = this.uploadForm.get('recipientPublicKey').value;
              const privateKey = this.uploadForm.get('recipientPrivateKey').value;
              uploadParams.withNemKeysPrivacy(privateKey, publicKey);
              uploadParams.withRecipientPublicKey(publicKey);
              break;
          }
          uploadParams.withTransactionMosaics(this.mosaics);
          const result = await this.uploader.upload(uploadParams.build());
          this.clearForm();
          this.sharedService.showSuccessTimeout('Upload', 'Upload successful.', 8000);
          this.blockUpload = false;
        } catch (error) {
          this.blockUpload = false;
          this.sharedService.showError('Error', error);
        }
      }
      else {
        this.blockUpload = false;
      }
    } else {
      //show error here

    }
  }

  /**
   *
   *
   * @memberof UploadFileComponent
   */
  createForm() {
    this.optionsEncryptionMethods = [
      { value: PrivacyType.PLAIN, name: 'Do Not Encrypt' },
      { value: PrivacyType.PASSWORD, name: 'Password' },
      /* { value: PrivacyType.NEM_KEYS, name: 'KEY PAIR' }*/
    ];

    this.uploadForm = this.fb.group({
      // title: [''],
      // description: [''],
      filePath: [''],
      // recipientAddress: ['', [
      //   Validators.minLength(this.configurationForm.address.minLength),
      //   Validators.maxLength(this.configurationForm.address.maxLength)
      // ]],
      recipientPublicKey: [''],
      /* recipientPublicKey: ['', [
         Validators.minLength(this.configurationForm.publicKey.minLength),
         Validators.maxLength(this.configurationForm.publicKey.maxLength)
       ]],*/
      // secureMessage: [''],
      // usePasswordPrivacy: ['', [
      //   Validators.minLength(this.configurationForm.passwordWallet.minLength),
      //   Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      // ]],
      walletPassword: ['', [
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]],
      // password: ['', [
      //   Validators.minLength(this.configurationForm.passwordWallet.minLength),
      //   Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      // ]],
      // fileInput: [''],
      privateKey: [''],
      /* privateKey: ['', [
         Validators.minLength(this.configurationForm.privateKey.minLength),
         Validators.maxLength(this.configurationForm.privateKey.maxLength)
       ]],*/
      // useSecureMessage: [''],
      encryptionMethod: [''],
      // encryptionPassword: ['', [
      //   Validators.minLength(this.configurationForm.passwordWallet.minLength),
      //   Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      // ]],
      /*encryptionPasswords: this.fb.group(
        {
          password: [
            '', [
              Validators.required,
              Validators.minLength(this.configurationForm.passwordEncriptionFile.minLength),
              Validators.maxLength(this.configurationForm.passwordEncriptionFile.maxLength)
            ]
          ],
          confirm_password: [
            '',
            [
              Validators.required,
              Validators.minLength(this.configurationForm.passwordEncriptionFile.minLength),
              Validators.maxLength(this.configurationForm.passwordEncriptionFile.maxLength)
            ]
          ],
        }, {
        validator: this.sharedService.equalsPassword
      }),
      recipientPrivateKey: ['', [
        Validators.minLength(this.configurationForm.privateKey.minLength),
        Validators.maxLength(this.configurationForm.privateKey.maxLength)
      ]]*/
      encryptionPasswords: this.fb.group(
        {
          password: [''],
          confirm_password: [''],

        }, {
        validator: this.sharedService.equalsPassword
      }),
      recipientPrivateKey: ['']
    });

  }

  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @returns
   * @memberof UploadFileComponent
   */
  clearForm(nameInput: string = '', nameControl: string = '') {
    if (nameInput !== '') {
      if (nameControl !== '') {
        this.uploadForm.controls[nameControl].get(nameInput).reset();
        return;
      }

      this.uploadForm.get(nameInput).reset();
      return;
    }
    this.files = [];
    this.uploadForm.reset();
    return;
  }

  /**
   *
   *
   * @memberof UploadFileComponent
   */
  doValidate() {
    this.blockUpload = false;
    const encryptionMethod = this.uploadForm.get('encryptionMethod').value;
    const walletPassword = this.uploadForm.get('walletPassword').value;
    if (walletPassword.length <= 0) {
      this.blockUpload = true;
      this.sharedService.showError('', 'Please enter the wallet password');
    } else if (this.files.length <= 0) {
      this.blockUpload = true;
      this.sharedService.showError('', 'Please choose file to upload');
    } else if (encryptionMethod.length <= 0) {
      this.blockUpload = true;
      this.sharedService.showError('', 'Please choose the encryption method');
    } else {
      switch (encryptionMethod) {
        case PrivacyType.PASSWORD:
          const encryptionPassword = this.uploadForm.controls.encryptionPasswords.get('password').value;
          if (encryptionPassword.length <= 0) {
            this.blockUpload = true;
            this.sharedService.showError('', 'Please enter the encryption password');
          }
          break;
        case PrivacyType.NEM_KEYS:
          const publicKey = this.uploadForm.get('recipientPublicKey').value;
          const privateKey = this.uploadForm.get('recipientPrivateKey').value;
          if (publicKey.length <= 0) {
            this.blockUpload = true;
            this.sharedService.showError('', 'Please enter the encryption public key');
          } else if (privateKey.length <= 0) {
            this.blockUpload = true;
            this.sharedService.showError('', 'Please enter the encryption private key');
          }
          break;
      };
      //this.blockUpload = false;
    }
  }

  /**
   *
   *
   * @param {{ value: any; }} event
   * @memberof UploadFileComponent
   */
  encryptionMethodSelect(event: { value: any; }) {
    // console.log(event);
    switch (event.value) {
      case PrivacyType.PASSWORD:
        this.showEncryptionPassword = true;
        this.showEncryptionKeyPair = false;

        this.uploadForm.controls.encryptionPasswords.get('password').setValidators([
          Validators.required,
          Validators.minLength(this.configurationForm.passwordWallet.minLength),
          Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
        ]);

        this.uploadForm.controls.encryptionPasswords.get('confirm_password').setValidators([
          Validators.required,
          Validators.minLength(this.configurationForm.passwordWallet.minLength),
          Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
        ]);

        break;
      case PrivacyType.NEM_KEYS:
        this.showEncryptionPassword = false;
        this.showEncryptionKeyPair = true;

        this.uploadForm.controls['recipientPrivateKey'].setValidators([
          Validators.required,
          Validators.minLength(this.configurationForm.privateKey.minLength),
          Validators.maxLength(this.configurationForm.privateKey.maxLength)
        ]);

        this.uploadForm.controls['recipientPublicKey'].setValidators([
          Validators.required,
          Validators.minLength(this.configurationForm.publicKey.minLength),
          Validators.maxLength(this.configurationForm.publicKey.maxLength)
        ]);
        break;
      default:
        this.showEncryptionPassword = false;
        this.showEncryptionKeyPair = false;
    }
    this.privacyType = event.value;

  }

  /**
   *
   *
   * @memberof UploadFileComponent
   */
  initialiseStorage() {

    const blockChainNetworkType = this.proximaxProvider.getBlockchainNetworkType(this.walletService.currentAccount.network);
    const blockChainHost = environment.blockchainConnection.host;
    const blockChainPort = environment.blockchainConnection.port;
    const blockChainProtocol = environment.blockchainConnection.protocol === 'https' ? Protocol.HTTPS : Protocol.HTTP;

    const storageHost = environment.storageConnection.host;
    const storagePort = environment.storageConnection.port;
    const storageOptions = environment.storageConnection.options;
    const connectionConfig = ConnectionConfig.createWithLocalIpfsConnection(
      new BlockchainNetworkConnection(blockChainNetworkType, blockChainHost, blockChainPort, blockChainProtocol),
      new IpfsConnection(storageHost, storagePort, storageOptions)
    );

    //set the default network mosaic
    this.mosaics = [];
    this.uploader = new Uploader(connectionConfig);
  }

  /**
   *
   *
   * @param {(UploadOutput | any)} output
   * @memberof UploadFileComponent
   */
  onUploadOutput(output: UploadOutput | any): void {
    if (output.type === 'allAddedToQueue') {
    } else if (output.type === 'addedToQueue') {
      this.files = [];
      this.files.push(output.file); // add file to array when added
    } else if (output.type === 'uploading') {
      // update current data in files array for uploading file
      const index = this.files.findIndex(file => file.id === output.file.id);
      this.files[index] = output.file;
    } else if (output.type === 'removed') {
      // remove file from array when removed
      this.files = this.files.filter((file: UploadFile) => file !== output.file);
    } else if (output.type === 'dragOver') {
      this.dragOver = true;
    } else if (output.type === 'dragOut') {
    } else if (output.type === 'drop') {
      this.dragOver = false;
    }
    this.showFiles();
  }

  /**
   *
   *
   * @param {Blob} file
   * @returns
   * @memberof UploadFileComponent
   */
  readFile(file: Blob) {
    return new Promise<Uint8Array>(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result as ArrayBuffer;
        resolve(new Uint8Array(fileContent));
      };
      reader.onerror = event => reject(event);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   *
   *
   * @param {Blob} file
   * @returns
   * @memberof UploadFileComponent
   */
  readFileToBuffer(file: Blob) {
    return new Promise<Buffer>(function (resolve, reject) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileContent = Buffer.from(reader.result as ArrayBuffer);
        resolve(fileContent);
      };
      reader.onerror = event => reject(event);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   *
   *
   * @returns
   * @memberof UploadFileComponent
   */
  showFiles() {
    let files = '';
    for (let i = 0; i < this.files.length; i++) {
      files += this.files[i].name;
      if (!(this.files.length - 1 === i)) {
        files += ',';
      }
    }
    return files;
  }

  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof UploadFileComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.uploadForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.uploadForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.uploadForm.get(nameInput);
    }
    return validation;
  }

  /**
   *
   *
   * @returns
   * @memberof CreateWalletComponent
   */
  validateMatchPassword() {
    if (this.validateInput('password', 'encryptionPasswords').valid &&
      this.validateInput('confirm_password', 'encryptionPasswords').valid &&
      this.validateInput('', 'encryptionPasswords', 'noMatch') &&
      (this.validateInput('password', 'encryptionPasswords').dirty || this.validateInput('password', 'encryptionPasswords').touched) &&
      (this.validateInput('password', 'encryptionPasswords').dirty || this.validateInput('password', 'encryptionPasswords').touched)) {
      this.errorMatchPassword = '-invalid';
      return true;
    }

    this.errorMatchPassword = '';
    return false;
  }
}
