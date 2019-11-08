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
  selector: 'app-employee-register',
  templateUrl: './user-employee-register.component.html',
  styleUrls: [
    './user-employee-register.component.css',
    '../../../assets/user-css/core.css',
    '../../../assets/user-css/menu.css'
  ],

})
export class UserEmployeeRegisterComponent implements OnInit {
  msgs: Message[] = [];
  currentTab = 0; // Current tab is set to be the first tab (0)
  x;

  GetCurrentCompanyID: any = "";

  Visiblebtn: boolean = false;
  showAccountInfo: boolean = false;
  showEmpAccountDetails: boolean = false;
  showEmpAgreeLic: boolean = false;
  empEnrollForm: FormGroup;
  empAccountDetailsForm: FormGroup;
  EmployeeLicenseForm: FormGroup;
  EmpAccountCreatedForm: FormGroup;
  empEnrollFormErrorObj = {} as any;
  empAccountDetailsFormErrorObj = {} as any;

  blockSpecial: RegExp = /^[^<>*!]+$/;
  allownumberalphaspance: RegExp = /^[\w\s]+$/;
  alphawithspance: RegExp = /^[a-zA-Z ]*$/;
  alphawithspancewithdot: RegExp = /^[a-zA-Z .]*$/;

  stateList: any;
  empAgree_check: boolean = false;
  showEmpAccountcreated: boolean = false;
  employee_aggrement: string = "";
  upUserName: any = "";
  selectedstateSuggestion: any;
  constructor(private _router: Router, private MasterService: MasterService, private MessageService: MessageService, private CommonAppService: CommonAppService, private formBuilder: FormBuilder) {

    localStorage.setItem('isControlLogin', '');
    localStorage.setItem('isMasterLogin', '');
    localStorage.setItem('isUserLogin', 'false');

    this.intialize();
    this.GetCpAgreementSetup();

  }
  intialize() {
    this.getStateList();
    this.buildFormobject();
    this.buildFormErrorobject();
  }
  ngOnInit() {
    this.showAccountInfo = true;
    setTimeout(() => {
      $("#companyId").focus();
    }, 200);
  }


  buildFormobject() {
    this.empEnrollForm = this.formBuilder.group({
      companyID: new FormControl('', { validators: Validators.required })
    });
    this.empAccountDetailsForm = this.formBuilder.group({
      FirstName: new FormControl('', { validators: Validators.required }),
      LastName: new FormControl('', { validators: Validators.required }),
      PermanentAddress1: new FormControl('', { validators: Validators.required }),
      PermanentAddress2: new FormControl(''),
      PermanentCity: new FormControl('', { validators: Validators.required }),
      PermanentState: new FormControl('', { validators: Validators.required }),
      PermanentZipcode: new FormControl('', { validators: Validators.required }),
      PermanentPhoneNo: new FormControl('', { validators: Validators.required }),
      CommunicationPhoneNo: new FormControl(''),
      Email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])),

      chkAddress: new FormControl(false),
      communicationAddress1: new FormControl('', { validators: Validators.required }),
      communicationAddress2: new FormControl(''),
      communicationCity: new FormControl('', { validators: Validators.required }),
      communicationState: new FormControl('', { validators: Validators.required }),
      communicationZipcode: new FormControl('', { validators: Validators.required }),
      communicationPhoneNo: new FormControl('', { validators: Validators.required }),
      communicationEmail: new FormControl('', { validators: Validators.required }),

      UserName: new FormControl('', { validators: Validators.required }),
      Password: new FormControl('', { validators: Validators.required }),
      ConfirmPassword: new FormControl('', { validators: Validators.required }),

    });
    this.EmployeeLicenseForm = this.formBuilder.group({
      TermsandCondition: new FormControl('')
    });
    this.EmpAccountCreatedForm = this.formBuilder.group({
      UserName: new FormControl(''),
      Password: new FormControl(''),
    });
  }
  buildFormErrorobject() {
    this.empEnrollFormErrorObj = {
      companyID: { required: "Company ID is required", }
    }
    this.empAccountDetailsFormErrorObj = {
      FirstName: { required: "Firstname is required", },
      LastName: { required: "Lastname is required", },
      PermanentAddress1: { required: "Address 1 is required", },
      // PermanentAddress2: { required: "Address 2 is required", },
      PermanentCity: { required: "City Name is required", },
      PermanentState: { required: "State Name is required", },
      PermanentZipcode: { required: "Zipcode is required", },
      PermanentPhoneNo: { required: "Phone Number is required", },
      CommunicationPhoneNo: { required: "Phone Number is required", },
      Email: { required: "Email is required", pattern: "Enter a valid primary email", },

      communicationAddress1: { required: "Communication Address 1 can not be empty", },
      communicationCity: { required: "Communication City can not be empty", },
      communicationState: { required: "Communication State can not be empty", },
      communicationZipcode: { required: "Communication Zip code can not be empty", maxlength: "Communication Zip code allows maximum 6 digits.", },
      communicationPhoneNo: { required: "Communication Phone Number can not be empty", },
      communicationEmail: { required: "Communicational Email ID can not be empty", },

      UserName: { required: "User Name can not be empty", minlength: "Username required minimum 6 characters.", },
      Password: { required: "Password can not be empty", minlength: "Password required minimum 6 characters.", },
      ConfirmPassword: { required: "Confirm Password can not be empty", minlength: "Password required minimum 6 characters.", },
    }
  }

  //Load all State in dropdown
  getStateList() {
    this.MasterService.loadStateList().then((res) => {
      this.stateList = res;
    });
  }
  onSubmitEmpEnrollment(form) {
    var errorMessage = "";
    var externalvalid = true;
    var externalvalidation_msg = "";
    if (this.empEnrollForm.status == "INVALID") {

      // this.showAccountInfo = false;
      // this.showEmpAccountDetails = true;

      // this.showAccountInfo = true;
      // this.showEmpAccountDetails = false;

      errorMessage = this.MasterService.getFormErrorMessage(this.empEnrollForm, this.empEnrollFormErrorObj);
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
      return false;
    }
    else {
      var formdata = this.empEnrollForm.getRawValue();
      formdata.userName = _.trim(formdata.userName);
      formdata.Password = _.trim(formdata.Password);
      formdata.ConfirmPassword = _.trim(formdata.ConfirmPassword);
      if (formdata.ConfirmPassword != formdata.Password) {
        externalvalid = false;
        errorMessage = "Password does not match the confirm password.";
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
        return false;
      } else {
        var req = { UniqueCompanyId: this.empEnrollForm.controls.companyID.value }
        this.CommonAppService.getCompanyID(req)
          .then((data) => {
            if (data.status != 0) {
              this.showAccountInfo = false;
              this.showEmpAccountDetails = true;
              this.GetCurrentCompanyID = data.result;
              errorMessage = data.message;
              setTimeout(() => {
                $("#txtFirstName").focus();
              }, 200);
              return false;
            } else {
              errorMessage = data.message;
              this.MessageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
              return false;
            }

          });
      }
    }
  }

  onSubmitEmployeeDetails(form) {
    var externalvalid = true;
    var externalvalidation_msg = "";
    if (this.empAccountDetailsForm.status == "INVALID") {

      // this.showEmpAccountDetails = false;
      // this.showEmpAgreeLic = true;

      var errorMessage = this.MasterService.getFormErrorMessage(this.empAccountDetailsForm, this.empAccountDetailsFormErrorObj);
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
      return false;
    } else {

      var formdata = this.empAccountDetailsForm.getRawValue();
      formdata.userName = _.trim(formdata.userName);
      formdata.Password = _.trim(formdata.Password);
      formdata.ConfirmPassword = _.trim(formdata.ConfirmPassword);

      if (formdata.PermanentState.name == null || formdata.PermanentState.name == undefined) {
        var state = _.filter(this.stateList, (s) => {
          return (s.name.toLowerCase() == formdata.PermanentState.toLowerCase());
        });
        if (state.length == 0) {
          externalvalid = false;
          externalvalidation_msg = "Primary State Name is not valid.";
        }
        else {
          // _.keyBy(state, 'name')
          formdata.PermanentState = state[0];
          this.empAccountDetailsForm.controls["PermanentState"].setValue(state[0]);
        }
      }
      if (formdata.communicationState.name == null || formdata.communicationState.name == undefined) {
        var state = _.filter(this.stateList, (s) => {
          return (s.name.toLowerCase() == formdata.communicationState.toLowerCase());
        });
        if (state.length == 0) {
          externalvalid = false;
          externalvalidation_msg = "Communication State Name is not valid.";
        }
        else {
          // _.keyBy(state, 'name')
          formdata.communicationState = state[0];
          this.empAccountDetailsForm.controls["communicationState"].setValue(state[0]);
        }
      }

      if (formdata.ConfirmPassword != formdata.Password) {
        externalvalid = false;
        externalvalidation_msg = "Password does not match the confirm password.";
      }
      if (externalvalid) {
        var enrolldata = this.empAccountDetailsForm.getRawValue();
        var req = {
          UserName: _.trim(enrolldata.UserName),
          PrimaryEmail: _.trim(enrolldata.Email),
          isCompany: false
        };
        if (!_.isEmpty(req)) {
          this.MessageService.clear();
          this.CommonAppService.findUserNameAndEmail(req)
            .then((data) => {
              var Error_msg = "";
              var msg_type = 'error';
              if (data.status == 1) {
                this.GetCpAgreementSetup();
                this.showEmpAccountDetails = false;
                this.showEmpAgreeLic = true;
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
  }
  CloseAccount() {
    this.showEmpAccountcreated = false;
    this._router.navigateByUrl('/user-login');
  }
  onEmpAgreePrevious() {
    this.showEmpAgreeLic = false;
    this.showEmpAccountDetails = true;

  }
  AgreeTermsCondition(event) {
    event.target.checked ? this.Visiblebtn = true : this.Visiblebtn = false;
    this.empAgree_check = true;
  }
  onSubmitEmpRegister() {
    var companyid = this.empEnrollForm.getRawValue();
    var empdata = this.empAccountDetailsForm.getRawValue();
    empdata.companyID = this.GetCurrentCompanyID;
    empdata.PermanentState = empdata.PermanentState.value;
    empdata.communicationState = empdata.communicationState.value;
    var req: any = _.merge(companyid, empdata);
    req.CategoryId = 2;
    this.MessageService.clear();
    this.CommonAppService.RegisterEmployee(req)
      .then((data) => {
        var msg = "";
        var Error_msg = "";
        if (data.status != 0) {
          Error_msg = "success";
          this.showEmpAccountcreated = true;
          this.showEmpAgreeLic = false;

          this.upUserName = req.UserName;
          msg = data.message;
        } else {
          Error_msg = "error";
          this.showEmpAgreeLic = false;
          this.showEmpAccountDetails = true;
          msg = data.message;
        }
        if (msg != "") {
          this.MessageService.add({ severity: Error_msg, summary: Error_msg, detail: msg });
        }
      });
  }

  GetCpAgreementSetup() {
    var req = {};
    this.CommonAppService.getAll(req)
      .then((data) => {
        if (data.status != 0) {
          this.employee_aggrement = data.result[0].resellerAgreement;
        }

      });
  }

  onEmpAccountPrevious(event) {
    this.showAccountInfo = true;
    this.showEmpAccountDetails = false;
  }
  checkboxChanged(event) {
    var mapobject = {
      'PermanentAddress1': 'communicationAddress1',
      'PermanentAddress2': 'communicationAddress2',
      'PermanentState': 'communicationState',
      'PermanentCity': 'communicationCity',
      'PermanentZipcode': 'communicationZipcode',
      'PermanentPhoneNo': 'communicationPhoneNo',
      'Email': 'communicationEmail'
    };
    this.empAccountDetailsForm.controls["chkAddress"].setValue(event.target.checked);
    var formdata = this.empAccountDetailsForm.getRawValue();
    if (event.target.checked == true) {
      if (formdata.PermanentState.name == null || formdata.PermanentState.name == undefined) {
        var state = _.filter(this.stateList, (s) => {
          return (s.name.toLowerCase() == formdata.PermanentState.toLowerCase());
        });
        if (state.length == 0) {
          this.MessageService.add({ severity: 'error', summary: 'Error', detail: "Permanent State Name is not valid." });
          return false;
        }
        else {

          formdata.PermanentState = state[0];
          this.empAccountDetailsForm.controls["PermanentState"].setValue(state[0]);
        }
      }
      this.MasterService.sameasMappingData(this.empAccountDetailsForm, mapobject);
    }
    else {
      this.empAccountDetailsForm.controls["communicationAddress1"].setValue(null);
      this.empAccountDetailsForm.controls["communicationAddress2"].setValue(null);
      this.empAccountDetailsForm.controls["communicationState"].setValue(null);
      this.empAccountDetailsForm.controls["communicationCity"].setValue(null);
      this.empAccountDetailsForm.controls["communicationZipcode"].setValue(null);
      this.empAccountDetailsForm.controls["communicationPhoneNo"].setValue(null);
      this.empAccountDetailsForm.controls["communicationEmail"].setValue(null);
    }
  }


  filterResponsibilityMultiple(event) {
    let query = event.query;

    this.selectedstateSuggestion = this.filterResponsibilitry(query, this.stateList);
  }
  filterResponsibilitry(query, resonsibilities: any[]): any[] {
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
