import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { AppConfig } from '../../../../config/app.config';
import { SharedService } from '../../../../shared/services/shared.service';
import { TransactionsService } from '../../../../transfer/services/transactions.service';

@Component({
  selector: 'app-view-all-accounts',
  templateUrl: './view-all-accounts.component.html',
  styleUrls: ['./view-all-accounts.component.css']
})
export class ViewAllAccountsComponent implements OnInit {

  accountChanged: boolean = false;
  componentName = 'View all';
  currentAccount: any = [];
  moduleName = 'Accounts';
  objectKeys = Object.keys;
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    createNewAccount: `/${AppConfig.routes.selectTypeCreationAccount}`,
    viewDetails: `/${AppConfig.routes.account}/`
  };

  constructor(
    private transactionService: TransactionsService,
    private walletService: WalletService
  ) {}

  ngOnInit() {
    this.currentAccount = this.walletService.current;
  }

  /**
   *
   *
   * @param {string} nameSelected
   * @memberof ViewAllAccountsComponent
   */
  changeAsPrimary(nameSelected: string) {
    // this.sharedService.showSuccess('', 'Account changed to default');
    this.accountChanged = true;
    this.walletService.changeAsPrimary(nameSelected);
    this.walletService.use(this.walletService.current);
    this.currentAccount = this.walletService.current;
    this.transactionService.updateBalance();
    setTimeout(() => {
      this.accountChanged = false;
    }, 2000);
  }

}