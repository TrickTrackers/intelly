import { Component, OnInit } from '@angular/core';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { FormBuilder, FormGroup, FormControl, Validators, EmailValidator, FormArray, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MasterService } from '../../services/master.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { GrowlModule } from 'primeng/growl';
import { Message } from 'primeng/api';
import * as _ from 'lodash';
import { CommonAppService } from '../../../app/services/appservices/common-app.service';
import { debounce } from 'rxjs/operators/debounce';

@Component({
  selector: 'app-user-forgot-password',
  templateUrl: './user-forgot-password.component.html',
  styleUrls: ['./user-forgot-password.component.css']
})
export class UserForgotPasswordComponent implements OnInit {
  showFrogotPwd:boolean = true;
  ForgotPwdForm: FormGroup;
  ForgotPwdFormErrorObj = {} as any;
  constructor(private _router: Router, private MasterService: MasterService, private MessageService: MessageService, private CommonAppService: CommonAppService, private formBuilder: FormBuilder)
   {
   
    this.intialize(); 
   }


   intialize(){
     this.buildFromObj();
     this.buildFormErrorobject();
   }



   buildFromObj(){
    this.ForgotPwdForm = this.formBuilder.group({
      Password: new FormControl('', {validators: Validators.required}),
      ConfirmPassword: new FormControl('',{validators: Validators.required})
    })
  }

  buildFormErrorobject() {
   this.ForgotPwdFormErrorObj = {
    Password: { required: "New Password is required", },
    ConfirmPassword: { required: "Conform Password is required", }
  }
   }

   onSubmitForgotPwd(form)  {
    //debugger

    var errorMessage = "";
    var externalvalid = true;
    var externalvalidation_msg = "";
    if (this.ForgotPwdForm.status == "INVALID") {

      // this.showAccountInfo = false;
      // this.showEmpAccountDetails = true;
 
      // this.showAccountInfo = true;
      // this.showEmpAccountDetails = false;

      errorMessage = this.MasterService.getFormErrorMessage(this.ForgotPwdForm, this.ForgotPwdFormErrorObj);
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
      return false;      
    }
    else {    
     var formdata =  this.ForgotPwdForm.getRawValue();
     //var newpwd = _trim(p)   
      var CurrentID = localStorage.getItem('sessionForgotPwd');
      var req = this.ForgotPwdForm.getRawValue();
      var req1 = {StatementType : 'AddForgotPwd'}
     
      var reqdata = _.merge(CurrentID, req,req1);
      
        this.CommonAppService.upForgotPwd(req)
      .then((data) => {        
        if (data.status != 0) {                    
          errorMessage = data.message;
          return false;
        } else {
          errorMessage = data.message;                     
          this.MessageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
          return false;
        }       
      });
    }    
  }
  ngOnInit() {
  }

}
