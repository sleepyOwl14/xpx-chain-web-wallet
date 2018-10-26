import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NetworkType } from "nem2-sdk/dist";

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit {

  transferForm: FormGroup;
  transferIsSend = false;
  typeAccount = [
    {
      'value': NetworkType.TEST_NET,
      'label': 'TEST NET'
    }, {
      'value': NetworkType.MAIN_NET,
      'label': 'MAIN NET'
    }, {
      'value': NetworkType.MIJIN_TEST,
      'label': 'MIJIN TEST'
    }, {
      'value': NetworkType.MIJIN,
      'label': 'MIJIN'
    }
  ];


  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.transferForm = this.fb.group({
      acountOrigen: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(40)]],
      acountRecipient: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(40)]],
      amount: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      message: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(80)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]]
    });
  }


  cleanForm(custom?, formControl?) {
    if (custom !== undefined) {
      if (formControl !== undefined) {
        this.transferForm.controls[formControl].get(custom).reset();
        return;
      }
      this.transferForm.get(custom).reset();
      return;
    }
    this.transferForm.reset();
    this.transferForm.get('network').setValue(NetworkType.TEST_NET);
    return;
  }

  getError(control, formControl?) {
    if (formControl === undefined) {
      if (this.transferForm.get(control).getError('required')) {
        return `This field is required`;
      } else if (this.transferForm.get(control).getError('minlength')) {
        return `This field must contain minimum ${this.transferForm.get(control).getError('minlength').requiredLength} characters`;
      } else if (this.transferForm.get(control).getError('maxlength')) {
        return `This field must contain maximum ${this.transferForm.get(control).getError('maxlength').requiredLength} characters`;
      }
    } else {
      if (this.transferForm.controls[formControl].get(control).getError('required')) {
        return `This field is required`;
      } else if (this.transferForm.controls[formControl].get(control).getError('minlength')) {
        return `This field must contain minimum ${this.transferForm.controls[formControl].get(control).getError('minlength').requiredLength} characters`;
      } else if (this.transferForm.controls[formControl].get(control).getError('maxlength')) {
        return `This field must contain maximum ${this.transferForm.controls[formControl].get(control).getError('maxlength').requiredLength} characters`;
      } else if (this.transferForm.controls[formControl].getError('noMatch')) {
        return `Password doesn't match`;
      }
    }
  }

  sendTransfer() {
    console.log('transfer transaction');
  }




}
