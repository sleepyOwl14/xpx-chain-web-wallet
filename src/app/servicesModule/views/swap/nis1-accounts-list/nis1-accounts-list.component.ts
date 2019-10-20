import { Component, OnInit } from '@angular/core';
import { first, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';

import { AppConfig } from '../../../../config/app.config';
import { WalletService, AccountsInterface } from '../../../../wallet/services/wallet.service';
import { HeaderServicesInterface } from '../../../../servicesModule/services/services-module.service';
import { NemServiceService } from '../../../../shared/services/nem-service.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-nis1-accounts-list',
  templateUrl: './nis1-accounts-list.component.html',
  styleUrls: ['./nis1-accounts-list.component.css']
})
export class Nis1AccountsListComponent implements OnInit {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Mainnet Swap',
    componentName: 'Transfer Assets'
  };
  accountsNis1: any;
  goBack: string = `/${AppConfig.routes.service}`;
  goList: string = `/${AppConfig.routes.accountNis1TransferXpx}`;
  searchItem = [];

  constructor(
    private walletService: WalletService,
    private router: Router,
    private nemProvider: NemServiceService,
    private sharedService: SharedService
  ) {
    this.walletService.setAccountInfoNis1(null);
    this.accountsNis1 = this.walletService.currentWallet.accounts;
    for (let index = 0; index < this.accountsNis1.length; index++) {
      if (this.accountsNis1[index].nis1Account !== null && this.accountsNis1[index].nis1Account !== undefined) {
        this.accountsNis1[index].nis1Account.address = this.nemProvider.createAddressToString(this.accountsNis1[index].nis1Account.address.value);
        this.searchItem.push(false);
      }
    }
  }

  ngOnInit() { }

  accountSelected(account: any, index: number) {
    this.walletService.setAccountSelectedWalletNis1(account);
    this.searchItem[index] = true;
    const address = this.nemProvider.createAddressToString(account.nis1Account.address.value);
    this.nemProvider.getAccountInfo(address).pipe(first()).pipe((timeout(environment.timeOutTransactionNis1))).subscribe(
      next => {
        this.searchItem[index] = false;
        let consignerOf: boolean = false;
        let consignerAccountsInfo: any = [];

        if (next['meta']['cosignatoryOf'].length > 0) {
          consignerOf = true;
          consignerAccountsInfo = next['meta']['cosignatoryOf'];
        }
        const accountNis1 = {
          nameAccount: account.name,
          address: address,
          publicKey: account.nis1Account.publicKey,
          consignerOf: consignerOf,
          consignerAccounts: consignerAccountsInfo,
          multiSign: false,
          mosaic: null,
          route: `/${AppConfig.routes.nis1AccountList}`
        }

        // this.walletService.setNis1AccounsWallet(accountNis1);
        if (accountNis1.consignerOf) {
          this.walletService.setAccountInfoNis1(accountNis1);
          this.router.navigate([`/${AppConfig.routes.nis1AccountsConsigner}`]);
        } else {
          this.walletService.setNis1AccountSelected(accountNis1);
          this.router.navigate([`/${AppConfig.routes.accountNis1TransferXpx}`]);
        }
      },
      error => {
        this.sharedService.showError('', 'Service not available');
        this.walletService.setAccountInfoNis1(null);
        this.router.navigate([`/${AppConfig.routes.dashboard}`]);
      }
    );
  }
}
