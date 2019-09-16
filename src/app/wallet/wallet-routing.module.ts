import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { CreateWalletComponent } from './views/create-wallet/create-wallet.component';
import { ImportWalletComponent } from './views/import-wallet/import-wallet.component';
import { WalletCreatedComponent } from './views/wallet-created/wallet-created.component';
import { SelectionWalletCreationTypeComponent } from './views/selection-wallet-creation-type/selection-wallet-creation-type.component';
import { WalletNis1FoundComponent } from './views/wallet-nis1-found/wallet-nis1-found.component';
import { TransferXpxComponent } from './views/transfer-xpx/transfer-xpx.component';
import { WalletNis1AccountsConsignerComponent } from './views/wallet-nis1-accounts-consigner/wallet-nis1-accounts-consigner.component';

const routes: Routes = [
  {
    path: AppConfig.routes.createWallet,
    component: CreateWalletComponent,
    data: {
      meta: {
        title: 'createWallet.title',
        description: 'createWallet.text',
        override: true,
      },
    }
  },
  {
    path: AppConfig.routes.importWallet,
    component: ImportWalletComponent,
    data: {
      meta: {
        title: 'importWallet.title',
        description: 'importWallet.text',
        override: true,
      },
    }
  },
  {
    path: AppConfig.routes.walletCreated,
    component: WalletCreatedComponent,
    data: {
      meta: {
        title: 'walletCreated.title',
        description: 'walletCreated.text',
        override: true,
      },
    }
  },
  {
    path: AppConfig.routes.selectTypeCreationWallet,
    component: SelectionWalletCreationTypeComponent,
    data: {
      meta: {
        title: 'selectTypeCreationWallet.title',
        description: 'selectTypeCreationWallet.text',
        override: true,
      },
    }
  },
  {
    path: AppConfig.routes.walletNis1Found,
    component: WalletNis1FoundComponent,
    data: {
      meta: {
        title: 'accountNis1Found.title',
        description: 'accountNis1Found.text',
        override: true,
      },
    }
  },
  {
    path: AppConfig.routes.transferXpx,
    component: TransferXpxComponent,
    data: {
      meta: {
        title: 'transferXpx.title',
        description: 'transferXpx.text',
        override: true,
      },
    }
  },
  {
    path: AppConfig.routes.walletNis1AccountConsigner,
    component: WalletNis1AccountsConsignerComponent,
    data: {
      meta: {
        title: 'walletNis1AccountConsigner.title',
        description: 'walletNis1AccountConsigner.text',
        override: true,
      },
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WalletRoutingModule { }
