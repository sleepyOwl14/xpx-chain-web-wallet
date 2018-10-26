import { InjectionToken } from '@angular/core';

export const APP_CONFIG = new InjectionToken('app.config');
export const AppConfig: Config = {
  routes: {
    home: 'home',
    login: 'login',
    dashboard: 'dashboard',
    createWallet: 'create-wallet',
    importWallet: 'import-wallet',
    apostille:'apostille',
    transactions:'transactions-get',
    addNode: 'add-node',
    explorer: 'explorer',
    service:'dashboard-service',
    notFound: 'not-found'
  }
};

export const NameRoute = {
  [AppConfig.routes.home]: 'Home',
  [AppConfig.routes.login]: 'Login',
  [AppConfig.routes.dashboard]: 'Dashboard',
  [AppConfig.routes.createWallet]: 'Create wallet',
  [AppConfig.routes.importWallet]: 'Import wallet',
  [AppConfig.routes.apostille]: 'Apostille',
  [AppConfig.routes.transactions]: 'Transactions get',
  [AppConfig.routes.addNode]: 'Add node',
  [AppConfig.routes.explorer]: 'Explorer',
  [AppConfig.routes.service]: ' Dashboard service',
  [AppConfig.routes.notFound]: '404 not found'
}

export interface Config {
  routes: {
    home: string;
    login: string;
    dashboard: string;
    createWallet: string;
    importWallet: string;
    apostille: string;
    transactions:string;
    addNode: string;
    explorer: string;
    service:string;
    notFound: string;
  };
}