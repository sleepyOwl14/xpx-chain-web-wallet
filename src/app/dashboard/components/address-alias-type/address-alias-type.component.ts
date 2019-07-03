import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { NamespaceId } from 'tsjs-xpx-chain-sdk';

import { TransactionsInterface } from '../../services/transaction.interface';
import { NamespacesService } from '../../../servicesModule/services/namespaces.service';

@Component({
  selector: 'app-address-alias-type',
  templateUrl: './address-alias-type.component.html',
  styleUrls: ['./address-alias-type.component.scss']
})
export class AddressAliasTypeComponent implements OnInit {

  @Input() addressAlias: TransactionsInterface = null;
  namespaceId: string = '';
  namespaceName: string = '';
  typeTransactionHex: string;

  constructor(
    private namespaceService: NamespacesService
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges) {
    // NAMESPACE
    this.namespaceId = '';
    this.namespaceName = '';
    this.typeTransactionHex = `${this.addressAlias.data['type'].toString(16).toUpperCase()}`;
    const namespaceId = new NamespaceId([this.addressAlias.data['namespaceId'].id.lower, this.addressAlias.data['namespaceId'].id.higher]);
    this.namespaceId = namespaceId.toHex();
    const namespaceInfo = await this.namespaceService.getNamespaceFromId(namespaceId);
    if (namespaceInfo !== null && namespaceInfo !== undefined) {
      this.namespaceName = (namespaceInfo.namespaceName.name !== '') ? namespaceInfo.namespaceName.name : '';
    }
  }

}
