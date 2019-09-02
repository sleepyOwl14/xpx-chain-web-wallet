import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { ClipboardModule } from 'ngx-clipboard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxCurrencyModule } from "ngx-currency";
import { NgxUiLoaderModule, NgxUiLoaderConfig, POSITION, SPINNER, PB_DIRECTION } from 'ngx-ui-loader';
import { TagInputModule } from 'ngx-chips';

import { MdbModule } from '../shared/moduls/mdb/mdb.module';
import { TransferTypeComponent } from '../dashboard/components/transfer-type/transfer-type.component';
import { RegisterNamespaceTypeComponent } from '../dashboard/components/register-namespace-type/register-namespace-type.component';
import { MosaicDefinitionTypeComponent } from '../dashboard/components/mosaic-definition-type/mosaic-definition-type.component';
import { MosaicSupplyChangeTypeComponent } from '../dashboard/components/mosaic-supply-change-type/mosaic-supply-change-type.component';
import { ModifyMultisigAccountTypeComponent } from '../dashboard/components/modify-multisig-account-type/modify-multisig-account-type.component';
import { AggregateCompleteTypeComponent } from '../dashboard/components/aggregate-complete-type/aggregate-complete-type.component';
import { AggregateBondedTypeComponent } from '../dashboard/components/aggregate-bonded-type/aggregate-bonded-type.component';
import { LockTypeComponent } from '../dashboard/components/lock-type/lock-type.component';
import { SecretLockTypeComponent } from '../dashboard/components/secret-lock-type/secret-lock-type.component';
import { SecretProofComponent } from '../dashboard/components/secret-proof/secret-proof.component';
import { MosaicsInfoComponent } from '../dashboard/components/mosaics-info/mosaics-info.component';
import { MosaicAliasComponent } from '../dashboard/components/mosaic-alias/mosaic-alias.component';
import { AddressAliasTypeComponent } from '../dashboard/components/address-alias-type/address-alias-type.component';
import { StringFilterPipe } from '../shared/pipes/string-filter.pipe';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { AttestationTypeComponent } from '../dashboard/components/attestation-type/attestation-type.component';
import { VoteTypeComponent } from '../dashboard/components/vote-type/vote-type.component';

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  bgsColor: '#306eb5',
  bgsPosition: POSITION.bottomCenter,
  bgsSize: 40,
  bgsType: SPINNER.rectangleBounce, // background spinner type
  fgsType: SPINNER.chasingDots, // foreground spinner type
  pbDirection: PB_DIRECTION.leftToRight, // progress bar direction
  pbThickness: 5, // progress bar thickness,
  logoPosition: "center-center",
  logoSize: 120,
  logoUrl: "assets/images/ProximaX-Favicon.png"
};

const components = [
  TransferTypeComponent,
  RegisterNamespaceTypeComponent,
  MosaicDefinitionTypeComponent,
  MosaicSupplyChangeTypeComponent,
  ModifyMultisigAccountTypeComponent,
  AggregateCompleteTypeComponent,
  AggregateBondedTypeComponent,
  LockTypeComponent,
  SecretLockTypeComponent,
  SecretProofComponent,
  MosaicsInfoComponent,
  MosaicAliasComponent,
  AddressAliasTypeComponent,
  AttestationTypeComponent,
  VoteTypeComponent
]

const moduls = [
  TagInputModule,
  NgSelectModule,
  NgxPaginationModule,
  ReactiveFormsModule,
  FormsModule,
  ClipboardModule,
  NgxCurrencyModule
];


@NgModule({
  declarations: [
    components,
    StringFilterPipe
  ],
  imports: [
    CommonModule,
    moduls,
    NgxMaskModule.forRoot(),
    MdbModule.forRoot(),
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig)
  ],
  exports: [
    MdbModule,
    NgxMaskModule,
    NgxUiLoaderModule,
    moduls,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    components,
    StringFilterPipe
  ]
})
export class CoreModule { }
