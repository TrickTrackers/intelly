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
import { ValidatorService } from '../../validators/validator.service';
import { e } from '@angular/core/src/render3';

@Component({
  selector: 'app-company-register',
  templateUrl: './user-company-register.component.html',
  styleUrls: [
    './user-company-register.component.css',
    '../../../assets/user-css/core.css',
    '../../../assets/user-css/menu.css',
  ]
})
export class UserCompanyRegisterComponent implements OnInit {
  msgs: Message[] = [];
  currentTab = 0; // Current tab is set to be the first tab (0)
  x;
  PayMethodIds = [];
  creditcardTypes = [];
  yearlist = {};
  ExpiryMonth = {};
  year: any;
  Visiblebtn: boolean = false;
  showAccountInfo: boolean = false;
  showFathiumLic: boolean = false;
  showAutoPay: boolean = false;
  showAccountcreated: boolean = false;
  companyForm: FormGroup;
  FathiumLicenseForm: FormGroup;
  AutoPayAccountForm: FormGroup;
  AccountCreatedForm: FormGroup;
  companyFormErrorObj = {} as any;
  FathiumLicenseFormErrorObj = {} as any;
  AutoPayAccountFormErrorObj = {} as any;
  // AccountCreatedFormErrorObj = {} as any;
  blockSpecial: RegExp = /^[^<>*!]+$/;
  allownumberalphaspance: RegExp = /^[\w\s]+$/;
  alphawithspance: RegExp = /^[a-zA-Z ]*$/;
  alphawithspancewithdot: RegExp = /^[a-zA-Z .]*$/;
  ccRegex: RegExp = /[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$/;
  stateList: any;
  creditCardMask: string = null;
  selectedCompanyDetails: any = {};
  emp_check: boolean = false;
  chk_account: boolean = false;
  credit_account: boolean = false;
  agree_account: boolean = false;
  company_aggrement: string = '';

  paymentTypes = [];
  ArrCPFeesList = [];
  TotalFees: any = 0;
  CostEmp: any;
  CostGig: any;
  cpMinEmp: any;
  cpMinGig: any;

  NoEmp: any = "0";
  DocSpace: any = "0";
  UniqueCompanyId: any;

  FeesTermsCondition_check: boolean = false;
  cpNumberOfEmployees: number = 0;
  cpDocumentStorage: number = 0;
  GigCost: number = 0;

  mpUserName: any = "";
  mpPassword: any = "";
  mpCompanyID: any = "";
  cpUserName: any = "";
  cpPassword: any = "";


  mailSubject: string = "";
  mailContent: string = "";

  invalid: boolean = false;
  selectedstateSuggestion: any;

  constructor(private _router: Router, private MasterService: MasterService, private MessageService: MessageService
    , private CommonAppService: CommonAppService, private formBuilder: FormBuilder, private ValidatorService: ValidatorService) {

    localStorage.setItem('isControlLogin', '');
    localStorage.setItem('isMasterLogin', '');
    localStorage.setItem('isUserLogin', 'false');

    this.getPaymentTypes();
    this.getCardTypes();
    this.intialize();
    this.getYearList();
    this.getExpiryMonth();
    this.GetCPFeesDetails();
    this.GetCpAgreementSetup();

  }
  intialize() {
    this.getStateList();
    this.changeCardType()
    this.buildFormobject();
    this.buildFormErrorobject();
  }
  ngOnInit() {
    this.showAccountInfo = true;
    setTimeout(() => {
      $("#txtcompany").focus();
    }, 200);
  }
  removeValidators(formName, reset?) {
    _.forEach(Object.keys(formName.controls), function (value, keys) {
      if (value != "PayMethodId") {
        if (reset == undefined || reset == null) {
          formName.controls[value].reset();
        }
        formName.controls[value].setValidators(null);
        formName.controls[value].updateValueAndValidity();
      }
    });
  }
  account_type(e) {
    // this.EmpCost = this.ArrCPFeesList[0].cstEmp;
    // this.CostGig = this.ArrCPFeesList[0].cstGig; 
    if (e.value == "0") {
      this.chk_account = false;
      this.credit_account = false;
      this.agree_account = false;
      this.removeValidators(this.AutoPayAccountForm, false);

      this.AutoPayAccountForm.controls['PayMethodId'].setValidators([Validators.required,]);
      this.AutoPayAccountForm.controls['NoEmp'].setValidators([Validators.required,]);
      this.AutoPayAccountForm.controls['DocSpace'].setValidators([Validators.required,]);
    }
    else if (e.value == "1") { //Credit Card Account
      this.chk_account = false;
      this.credit_account = true;
      this.agree_account = true;
      this.removeValidators(this.AutoPayAccountForm, false);
      this.AutoPayAccountForm.controls['PayMethodId'].setValidators([Validators.required,]);
      this.AutoPayAccountForm.controls['ccTypeId'].setValidators([Validators.required,]);
      this.AutoPayAccountForm.controls['ccNo'].setValidators([Validators.required,]);
      this.AutoPayAccountForm.controls['securityCode'].setValidators([Validators.required,]);
      this.AutoPayAccountForm.controls['ccExpiryMonth'].setValidators([Validators.required,]);
      this.AutoPayAccountForm.controls['ccExpiryYear'].setValidators([Validators.required,]);
      this.AutoPayAccountForm.controls['ccFirstName'].setValidators([Validators.required,]);
      this.AutoPayAccountForm.controls['ccAddress1'].setValidators([Validators.required,]);
      this.AutoPayAccountForm.controls['ccCity'].setValidators([Validators.required,]);
      this.AutoPayAccountForm.controls['ccState'].setValidators([Validators.required,]);
      this.AutoPayAccountForm.controls['ccZipcode'].setValidators([Validators.required,]);
      this.AutoPayAccountForm.controls['NoEmp'].setValidators([Validators.required,]);
      this.AutoPayAccountForm.controls['DocSpace'].setValidators([Validators.required,]);
    }
    else if (e.value == "2") { //Checking Account
      this.chk_account = true;
      this.credit_account = false;
      this.agree_account = true;
      this.removeValidators(this.AutoPayAccountForm, false);
      this.AutoPayAccountForm.controls['PayMethodId'].setValidators([Validators.required,]);
      this.AutoPayAccountForm.controls['bankName'].setValidators([Validators.required,]);
      this.AutoPayAccountForm.controls['routingNo'].setValidators([Validators.required,]);
      this.AutoPayAccountForm.controls['accountNo'].setValidators([Validators.required,]);
      this.AutoPayAccountForm.controls['NoEmp'].setValidators([Validators.required,]);
      this.AutoPayAccountForm.controls['DocSpace'].setValidators([Validators.required,]);

    } else if (e.value == "3") {
      this.removeValidators(this.AutoPayAccountForm, false);
      this.agree_account = false;
      this.credit_account = false;
      this.chk_account = false;
    }
    this.GetCPFeesDetails();
    this.calcpFees();
  }

  getExpiryMonth() {
    this.ExpiryMonth = [
      { label: '--select Month--', value: '0' },
      { label: '01 - January', value: '1' },
      { label: '02 - February', value: '2' },
      { label: '03 - March', value: '3' },
      { label: '04 - April', value: '4' },
      { label: '05 - May', value: '5' },
      { label: '06 - June', value: '6' },
      { label: '07 - July', value: '7' },
      { label: '08 - August', value: '8' },
      { label: '09 - September', value: '9' },
      { label: '10 - October', value: '10' },
      { label: '11 - November', value: '11' },
      { label: '12 - December', value: '12' }
    ];
  }
  getPaymentTypes() {
    var req = {};
    this.CommonAppService.getPaymentType(req)
      .then((data) => {
        this.paymentTypes = [
          { label: '--Select--', value: '0' }];

        for (var Value of data) {
          this.paymentTypes.push({ 'label': Value.payType, 'value': Value.payTypeId })
        }
      });
  }
  getCardTypes() {
    var res = {};
    this.CommonAppService.getCPCardTypes(res)
      .then((data) => {
        this.creditcardTypes = [
          { label: '--Select--', value: '0' }];

        for (var Value of data) {
          this.creditcardTypes.push({ 'label': Value.ccType, 'value': Value.ccTypeId })
        }
      });
  }

  changeCardType(item?) {
    if (item == 4) {
      this.creditCardMask = "9999-999999-99999";
    }
    else {
      this.creditCardMask = "9999-9999-9999-9999";
    }

  }

  getYearList() {
    var date = new Date()
    var GetYear = date.getFullYear();
    this.year = _.range(date.getFullYear(), GetYear + 10);
    this.yearlist = this.MasterService.formatDataforDropdown("ccExpiryYear", this.year, "--Select Year--");
  }
  check_ccaddress(event) {
    var mapobject = {
      'cAddress1': 'ccAddress1',
      'cAddress2': 'ccAddress2',
      'cState': 'ccState',
      'cCity': 'ccCity',
      'cZipCode': 'ccZipcode'
    };
    var formdata = this.companyForm.getRawValue();
    if (event.target.checked == true) {
      if (formdata.cState.name == null || formdata.cState.name == undefined) {
        var state = _.filter(this.stateList, (s) => {
          return (s.name.toLowerCase() == formdata.cState.toLowerCase());
        });
        if (state.length == 0) {
          this.MessageService.add({ severity: 'error', summary: 'Error', detail: "State Name is not valid." });
          return false;
        }
        else {

          formdata.cState = state[0];
          this.companyForm.controls["cState"].setValue(state[0]);
        }
      }
      this.MasterService.sameasMappingData(this.companyForm, mapobject, this.AutoPayAccountForm);

    }
  }

  AggreecpFeesTerms() {
    this.FeesTermsCondition_check = true;
  }
  buildFormobject() {
    this.companyForm = this.formBuilder.group({
      company: new FormControl('', { validators: Validators.required }),
      //companyId: new FormControl('', {}),
      modelTitle: new FormControl('', { validators: Validators.required }),
      cAddress1: new FormControl('', { validators: Validators.required }),
      cAddress2: new FormControl(''),
      cCity: new FormControl('', { validators: Validators.required }),
      cState: new FormControl('', { validators: Validators.required }),
      cZipCode: new FormControl('', { validators: Validators.required }),
      cPhoneNo: new FormControl('', { validators: Validators.required }),
      cFax: new FormControl(''),
      cWebsite: new FormControl(''),
      primaryFirstName: new FormControl('', { validators: Validators.required }),
      primaryLastName: new FormControl('', { validators: Validators.required }),
      primarySalutation: new FormControl(''),
      primaryPhoneNo: new FormControl('', { validators: Validators.required }),
      primaryExtension: new FormControl(''),
      primaryMobile: new FormControl(''),
      primaryEmail: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])),
      // primaryEmail: new FormControl('',{validators: Validators.required EmailValidator}),
      // EmailValidatorValidators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])),
      alternateFirstName: new FormControl(''),
      alternateLastName: new FormControl(''),
      alternateSalutation: new FormControl(''),
      alternatePhoneNo: new FormControl(''),
      alternateExtension: new FormControl(''),
      alternateMobile: new FormControl(''),
      alternateEmail: new FormControl('', Validators.compose([Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])),
      userName: new FormControl('', { validators: Validators.required }),
      password: new FormControl('', { validators: Validators.required }),
      confirmpassword: new FormControl('', { validators: Validators.required }),

      auFirstName: new FormControl('', { validators: Validators.required }),
      auLastName: new FormControl('', { validators: Validators.required }),
      emailNotices: new FormControl('', { validators: Validators.required }),
      textNotices: new FormControl('', { validators: Validators.required }),
    });
    this.FathiumLicenseForm = this.formBuilder.group({
      TermsandCondition: new FormControl('', { validators: Validators.required }),
    });
    this.AutoPayAccountForm = this.formBuilder.group({

      PayMethodId: new FormControl(''),// ,{ validators: Validators.required }),
      bankName: new FormControl(''),// { validators: Validators.required }),
      routingNo: new FormControl(''),// { validators: Validators.required }),
      accountNo: new FormControl(''),// { validators: Validators.required }),
      ccTypeId: new FormControl(''),// { validators: Validators.required }),
      ccNo: new FormControl(''),// { validators: Validators.required }),
      securityCode: new FormControl(''),// { validators: Validators.required }),
      ccExpiryMonth: new FormControl(''),// { validators: Validators.required }),
      ccExpiryYear: new FormControl(''),// { validators: Validators.required }),     
      ccFirstName: new FormControl(''),// { validators: Validators.required }),
      ccMiddleName: new FormControl(''),
      ccChkAddress: new FormControl(''),// { validators: Validators.required }),
      ccAddress1: new FormControl(''),// { validators: Validators.required }),
      ccAddress2: new FormControl(''),
      ccCity: new FormControl(''),// { validators: Validators.required }),
      ccState: new FormControl(''),// { validators: Validators.required }),
      ccZipcode: new FormControl(''),// { validators: Validators.required }),      
      NoEmp: new FormControl(''),
      DocSpace: new FormControl(''),
      totalEmpcost: new FormControl(''),
      CostEmp: new FormControl(''),
      CostGig: new FormControl('')
    });
    this.AccountCreatedForm = this.formBuilder.group({
      MasterUserName: new FormControl(''),
      MasterPassword: new FormControl(''),
      CompanyID: new FormControl(''),
      UserName: new FormControl(''),
      Password: new FormControl(''),
    });
  }
  buildFormErrorobject() {
    this.companyFormErrorObj = {
      //companyId: { required: "Company Id is required", },
      company: { required: "Company Name is required", },
      modelTitle: { required: "Model title is required", },
      cAddress1: { required: "Address 1 is required", },
      // cAddress2: { required: "Address 2 is required", },
      cCity: { required: "City Name is required", },
      cState: { required: "State Name is required", },
      cZipCode: { required: "Zipcode is required", },
      cPhoneNo: { required: "Phone Number is required", },
      cFax: { required: "Fax number is required", },
      cWebsite: { required: "Website is required", },
      payTypeId: { required: "Please select Auto paytype.", },
      primaryFirstName: { required: "Primary Firstname is required", },
      primaryLastName: { required: "Primary Lastname is required", },
      primarySalutation: { required: "Primary Salutation is required", },
      primaryPhoneNo: { required: "Primary phone Number is required", },
      primaryExtension: { required: "Primary Extension is required", },
      primaryMobile: { required: "Primary Mobile is required", },
      primaryEmail: { required: "Primary Email is required", pattern: "Enter a valid primary email", },
      alternateEmail: { pattern: "Enter a valid alternate email", },
      auFirstName: { required: "Acceptance First Name can not be empty", minlength: "Acceptance First Name required minimum 2 characters.", },
      auLastName: { required: "Acceptance Last Name can not be empty", minlength: "Acceptance Last Name required minimum 2 characters.", },
      userName: { required: "User Name can not be empty", minlength: "Username required minimum 6 characters.", },
      password: { required: "Password can not be empty", minlength: "Password required minimum 6 characters.", },
      confirmpassword: { required: "Confirm Password can not be empty", minlength: "Password required minimum 6 characters.", },
      emailNotices: { required: "Email Notices is required", pattern: "Enter a valid notices email", },
      textNotices: { required: "Text Notices is required", },
    }
    this.AutoPayAccountFormErrorObj = {
      PayMethodId: { required: "Payment Type is required", },
      bankName: { required: "Bank Name is required", },
      routingNo: { required: "Routing Number is required", maxlength: "Routing number allows only 9 digit numbers.", },
      accountNo: { required: "Account Number is required", },
      ccTypeId: { required: "Credit Card Type is required", },
      ccNo: { required: "Number is required", },
      securityCode: { required: "Security Code is required", },
      ccExpiryMonth: { required: "Expiration Month is required", },
      ccExpiryYear: { required: "Expiration Year is required", },
      ccFirstName: { required: "First Name is required", },
      ccAddress1: { required: "Address 1 is required", },
      ccCity: { required: "City is required", },
      ccState: { required: "State is required", },
      ccZipcode: { required: "ZipCode is required", },
      NoEmp: { required: "Number Of Employees is required", },
      DocSpace: { required: "Document Storage Space is required", },

    }
  }

  //Load all State in dropdown
  getStateList() {
    this.MasterService.loadStateList().then((res) => {
      this.stateList = res;
    });
  }
  onSubmitcompanyDetails(form) {
    var externalvalid = true;
    var externalvalidation_msg = "";
    if (this.companyForm.status == "INVALID") {

      // this.showAccountInfo = false;
      // this.showFathiumLic = true;

      this.showAccountInfo = true;
      this.showFathiumLic = false;
      var errorMessage = this.MasterService.getFormErrorMessage(this.companyForm, this.companyFormErrorObj);
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
      return false;
    }
    else {
      var formdata = this.companyForm.getRawValue();
      formdata.userName = _.trim(formdata.userName);
      formdata.password = _.trim(formdata.password);

      formdata.confirmpassword = _.trim(formdata.confirmpassword);

      if (formdata.cState.name == null || formdata.cState.name == undefined) {
        var state = _.filter(this.stateList, (s) => {
          return (s.name.toLowerCase() == formdata.cState.toLowerCase());
        });
        if (state.length == 0) {
          externalvalid = false;
          externalvalidation_msg = "State Name is not valid.";
        }
        else {
          // _.keyBy(state, 'name')
          formdata.cState = state[0];
          this.companyForm.controls["cState"].setValue(state[0]);
        }
      }

      if (formdata.confirmpassword != formdata.password) {
        externalvalid = false;
        externalvalidation_msg = "Password does not match the confirm password.";
      }
      if (externalvalid) {
        var companydata = this.companyForm.getRawValue();
        var req = {
          UserName: _.trim(companydata.userName),
          PrimaryEmail: _.trim(companydata.primaryEmail),
          isCompany: true
        };
        if (!_.isEmpty(req)) {
          this.MessageService.clear();
          this.CommonAppService.findUserNameAndEmail(req)
            .then((data) => {
              var Error_msg = "";
              var msg_type = 'error';
              if (data.status == 1) {
                this.showAccountInfo = false;
                this.showFathiumLic = true;
                Error_msg = "";
              }
              else {
                Error_msg = data.message;
              }
              if (Error_msg != "") {
                this.MessageService.add({ severity: msg_type, summary: msg_type, detail: Error_msg });
              }
            });
        }
      }
      else {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: externalvalidation_msg });
        return false;
      }
    }
    this.GetCpAgreementSetup();
    this.Visiblebtn = (this.emp_check == true ? true : false);
  }

  CloseAccount() {
    this._router.navigateByUrl('/user-login');
  }
  onFathiumPrevious() {
    this.showFathiumLic = false;
    this.showAccountInfo = true;
    this.showAutoPay == true;
    setTimeout(() => {
      $("#ddpaymentType").focus();
    }, 200);
  }
  AgreeTermsCondition(event) {
    event.target.checked ? this.Visiblebtn = true : this.Visiblebtn = false;
    //this.GetCPFeesDetails();
  }
  OnclickBack() {
    this.showAccountcreated = false;
    this.showAutoPay = true;
  }
  onShowAutoPay() {
    this.showFathiumLic = false;
    this.showAutoPay = true;
    setTimeout(() => {
      var numberOfEmp = (this.cpMinEmp != undefined && this.cpMinEmp != "" && this.cpMinEmp != null ? this.cpMinEmp : 0);
      var DocSpace = (this.cpMinGig != undefined && this.cpMinGig != "" && this.cpMinGig != null ? this.cpMinGig : 0);
      this.AutoPayAccountForm.controls['NoEmp'].setValue(numberOfEmp);
      this.AutoPayAccountForm.controls['DocSpace'].setValue(DocSpace);
      this.calcpFees();
    }, 1000);
  }

  onSubmitAutoPayDetails(form) {
    var externalvalid = true;
    var externalvalidation_msg = "";
    if (this.AutoPayAccountForm.status == "INVALID") {
      // this.showAutoPay=false;
      //this.showAccountcreated=true;    
      this.FeesTermsCondition_check = false;
      var errorMessage = this.MasterService.getFormErrorMessage(this.AutoPayAccountForm, this.AutoPayAccountFormErrorObj);
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
      return false;

    }
    else {
      if (this.AutoPayAccountForm.controls.PayMethodId.value == '1') {
        var creditcardvalid = this.ValidatorService.LuhnCreditValiadtor(this.AutoPayAccountForm.controls.ccNo.value);
        if (!creditcardvalid) {
          externalvalid = false;
          externalvalidation_msg = "Invalid credit card number.";
          this.MessageService.add({ severity: 'error', summary: 'Error', detail: externalvalidation_msg });
          return;
        }
        var formdata = this.AutoPayAccountForm.getRawValue();
        if (formdata.ccState.name == null || formdata.ccState.name == undefined) {
          var state = _.filter(this.stateList, (s) => {
            return (s.name.toLowerCase() == formdata.ccState.toLowerCase());
          });
          if (state.length == 0) {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "State Name is not valid." });
            return false;
          }
          else {

            formdata.ccState = state[0];
            this.AutoPayAccountForm.controls["ccState"].setValue(state[0]);
          }
        }
      }

      if (this.AutoPayAccountForm.controls.PayMethodId.value == "0") {
        this.agree_account = false;
        this.FeesTermsCondition_check = false;
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Payment Type is required" });
        return false;
      }
      else if (this.AutoPayAccountForm.controls.PayMethodId.value == "3") {
        this.agree_account = false;
        this.FeesTermsCondition_check = true;

        if (this.AutoPayAccountForm.controls.NoEmp.value == null) {
          this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Number Of Employees is required" });
          return false;

        } else if (this.AutoPayAccountForm.controls.DocSpace.value == null) {
          this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Document Storage Space is required" });
          return false;
        }
        if (this.calcpFeesErrorMsg()) {
          return false;
        }
        else {
          //   this.agree_account = false;
          //   this.showAutoPay = false;
          //   this.showAccountcreated = true;   

          //   this.showAutoPay = false;
          //   this.showAccountcreated = true;    

          var companydata = this.companyForm.getRawValue();
          var paymentdata = this.AutoPayAccountForm.getRawValue();

          companydata.cState = companydata.cState.value;
          if (paymentdata.ccState == null) {
            paymentdata.ccState = "";
          } else {
            paymentdata.ccState = paymentdata.ccState.value;
          }
          var reqdata = _.merge(companydata, paymentdata);
          reqdata.findInfo = false;
          if (reqdata.NoEmp == "" || reqdata.NoEmp == null || reqdata.NoEmp == undefined || reqdata.NoEmp == "0") {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Number Of Employees is required" });
          }
          else if (reqdata.DocSpace == "" || reqdata.DocSpace == null || reqdata.DocSpace == undefined || reqdata.DocSpace == "0") {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Document Storage Space is required" });
          }
          else {
            this.cpCompanyRegistration(reqdata);
          }
        }
      }
      else if (this.AutoPayAccountForm.controls.NoEmp.value == null) {
        this.agree_account = true;
        this.FeesTermsCondition_check = false;
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Number Of Employees is required" });
        return false;
      } else if (this.AutoPayAccountForm.controls.DocSpace.value == null) {
        this.agree_account = true;
        this.FeesTermsCondition_check = false;
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Document Storage Space is required" });
        return false;
      }
      else if (this.FeesTermsCondition_check == false) {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Please Agree Terms And Conditions" });
        return false;
      }
      else {

        if (this.calcpFeesErrorMsg()) {
          return false;
        }
        else {

          if (this.FeesTermsCondition_check) {
            this.showAutoPay = false;
            this.showAccountcreated = true;
            var companydata = this.companyForm.getRawValue();
            var paymentdata = this.AutoPayAccountForm.getRawValue();
            companydata.cState = companydata.cState.value;
            if (paymentdata.ccState == null) {
              paymentdata.ccState = "";
            } else {
              paymentdata.ccState = paymentdata.ccState.value;
            }
            var reqdata = _.merge(companydata, paymentdata);
            reqdata.findInfo = false;
            if (reqdata.NoEmp == "" || reqdata.NoEmp == null || reqdata.NoEmp == undefined || reqdata.NoEmp == "0") {
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Number Of Employees is required" });
            }
            else if (reqdata.DocSpace == "" || reqdata.DocSpace == null || reqdata.DocSpace == undefined || reqdata.DocSpace == "0") {
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Document Storage Space is required" });
            }
            else {
              this.cpCompanyRegistration(reqdata);
            }
          } else {
            this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Please Agree Terms And Conditions" });
            return false;
          }
        }
      }
    }
  }

  cpCompanyRegistration(req) {
    this.MessageService.clear();
    this.CommonAppService.cpCompanyRegistration(req)
      .then((data) => {
        var Error_msg = "";
        var msg_type = 'error';
        if (data.status != 0) {

          this.showAutoPay = false;
          this.showAccountcreated = true;

          this.mpUserName = req.userName + "_mp";
          this.mpPassword = req.password + "_mp";
          this.mpCompanyID = data.result;
          this.cpUserName = req.userName;
          this.cpPassword = req.password;
          Error_msg = "Company Registered successful!.";
          msg_type = 'success';

        } else {
          // this.companyForm.reset();
          // this.FathiumLicenseForm.reset();
          // this.FathiumLicenseForm.reset();
          // this.AutoPayAccountForm.reset();   
          this.emp_check = false;
          this.showAccountInfo = true;
          this.showAutoPay = false;
          this.showAccountcreated = false;
          // Error_msg = "Company created failed!.";
          // msg_type = 'error';
          msg_type = 'error';
          Error_msg = data.message;
        }
        if (Error_msg != "") {
          this.MessageService.add({ severity: msg_type, summary: msg_type, detail: Error_msg });
        }
      });
  }

  calcpFeesErrorMsg() {
    var CostEmpRs = 0;
    var CostGigRs = 0;
    var TotalCost = 0;
    this.invalid = false;
    var invalid_message = "";
    if (this.AutoPayAccountForm.controls.NoEmp.value != "" && this.AutoPayAccountForm.controls.NoEmp.value != null && this.AutoPayAccountForm.controls.NoEmp.value != undefined) {
      if (parseInt(this.AutoPayAccountForm.controls.NoEmp.value) >= parseInt(this.cpMinEmp)) {
        CostEmpRs = this.AutoPayAccountForm.controls.NoEmp.value * this.ArrCPFeesList[0].cstEmp;
      } else {
        this.invalid = true;
        invalid_message = "A Minimum of " + this.ArrCPFeesList[0].minEmp + " Employees required ";
      }
    }
    if (this.AutoPayAccountForm.controls.DocSpace.value != "" && this.AutoPayAccountForm.controls.DocSpace.value != null && this.AutoPayAccountForm.controls.DocSpace.value != undefined) {
      if (parseInt(this.AutoPayAccountForm.controls.DocSpace.value) >= parseInt(this.cpMinGig)) {
        CostGigRs = this.AutoPayAccountForm.controls.DocSpace.value * this.ArrCPFeesList[0].cstGig;
      } else {
        this.invalid = true;
        invalid_message = invalid_message + "A minimum of " + this.ArrCPFeesList[0].defDsk + " Gig is required";
      }
    }
    if (this.invalid) {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: invalid_message });
    }
    else {
      this.invalid = false;
      this.TotalFees = CostEmpRs + CostGigRs;
    }
    return this.invalid;
  }

  calcpFees() {
    var CostEmpRs = 0;
    var CostGigRs = 0;
    var TotalCost = 0;
    var invalid = false;
    var invalid_message = "";
    if (parseInt(this.AutoPayAccountForm.controls.NoEmp.value) >= parseInt(this.cpMinEmp)) {
      CostEmpRs = this.AutoPayAccountForm.controls.NoEmp.value * this.ArrCPFeesList[0].cstEmp;
    } else {
      invalid = true;
      //invalid_message = "A Minimum of " + this.ArrCPFeesList[0].minEmp + " Employees required ";
      // this.MessageService.add({ severity: 'error', summary: 'Error', detail:  });   
    }

    if (parseInt(this.AutoPayAccountForm.controls.DocSpace.value) >= parseInt(this.cpMinGig)) {
      CostGigRs = this.AutoPayAccountForm.controls.DocSpace.value * this.ArrCPFeesList[0].cstGig;
    } else {
      invalid = true;
      //invalid_message = invalid_message +"A minimum of " + this.ArrCPFeesList[0].defDsk + " Gig is required";

    }
    if (invalid) {
      // this.MessageService.add({ severity: 'error', summary: 'Error', detail: invalid_message });
      return false;
    }
    else {
      this.TotalFees = CostEmpRs + CostGigRs;
    }

  }
  GetCPFeesDetails() {
    var req = {};
    this.CommonAppService.getCpFeesDetails(req)
      .then((data) => {
        this.ArrCPFeesList = data;
        this.CostEmp = this.ArrCPFeesList[0].cstEmp;
        this.GigCost = this.ArrCPFeesList[0].cstGig;
        this.cpMinEmp = this.ArrCPFeesList[0].minEmp;
        this.cpMinGig = this.ArrCPFeesList[0].defDsk;

        //this.cpNumberOfEmployees = '0';
        /// this.DocSpace = '0';
        // this.TotalFees ='0';
      });
  }

  GetCpAgreementSetup() {
    var req = {};
    this.CommonAppService.getAll(req)
      .then((data) => {
        if (data.status != 0) {
          this.company_aggrement = data.result[0].companyAgreement;
        }
      });
  }

  onAutoPayPrevious(event) {
    this.GetCpAgreementSetup();
    this.FathiumLicenseForm.controls['TermsandCondition'].setValue(true);
    this.emp_check = true;
    this.Visiblebtn = (this.emp_check == true ? true : false);
    this.showFathiumLic = true;
    this.showAutoPay = false;
  }
  onShowAccountcreated() {
    this.showAutoPay = false;
  }

  filterStateMultiple(event) {
    let query = event.query;

    this.selectedstateSuggestion = this.filterState(query, this.stateList);
  }
  filterState(query, resonsibilities: any[]): any[] {
    //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
    let filtered: any[] = [];
    for (let i = 0; i < resonsibilities.length; i++) {
      let responsibility = resonsibilities[i];
      if (responsibility.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(responsibility);
      }
    }
    return filtered;
  }

}
