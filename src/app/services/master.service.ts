import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { CommonHttpService } from '../shared/common-http.service';
import * as _ from "lodash";
@Injectable()
export class MasterService {
  appendpoint: string;
  allcontacts: string;
  timezone: string;
  allinvoicetype: string;
  findtaxdetails: string;
  gsttaxall: string;
  getbookofacc: string;
  gerbookdetails: string;
  seqgen: string;
  acconfig: string;
  acconfiglisturl: string;
  allpayterm: string;
  allpaymode: string;
  currency: string;
  constructor(private httpService: CommonHttpService) {
  }
  public loadStateList() {
    return this.httpService.globalGetServiceByUrl("assets/us_states_list.json", "")
      .then(data => {
        return data;
      });
  }
  public formatDataforDropdown(label, data, Placeholdervalue?, ValueField?) {
    let formatdata = [];
    let customdata = {
      label: null,
      value: null
    };
    if (!_.isEmpty(Placeholdervalue)) {
      formatdata.push({
        label: Placeholdervalue,
        value: null
      });
    }

    _.forEach(data, function (value: any) {
      var shallow = _.clone(customdata);
      var alabel = "";
      if((value[label] != undefined || value[label] != null))
      {
        alabel = value[label];
      }
      else{
        if( typeof value == "object")
        {
          alabel = value[Object.keys(value)[0]];
        }
        else
        {
          alabel = value;
        }
      }
      shallow.label = alabel;
      if (!_.isEmpty(ValueField)) {
        shallow.value = value[ValueField];;
      }
      else {
        shallow.value = value;
      }
      formatdata.push(shallow);
    });
    return formatdata;
  }
  public filterformatDataforDropdown(label, data, Placeholdervalue?) {
    let formatdata = [];
    let customdata = {
      label: null,
      value: null
    };
    if (!_.isEmpty(Placeholdervalue)) {
      formatdata.push({
        label: Placeholdervalue,
        value: null
      });
    }

    _.forEach(data, function (value) {
      var shallow = _.clone(customdata);
      shallow.label = value[label];
      shallow.value = value[label];
      formatdata.push(shallow);
    });
    return formatdata;
  } 


  getFormErrorMessage(formGroupObj: FormGroup, errorObj: any) {
    for (let i in formGroupObj.controls) {
      var formControlObj = formGroupObj.controls[i];
      if (formControlObj instanceof FormControl) {
        if (formControlObj.errors) {
          //console.log(formControlObj.errors);
          if (errorObj[i]) {
            var errormsg = errorObj[i][Object.keys(formControlObj.errors)[0]];
            if (errormsg) {
              return errormsg;
            }
            else {
              return i + " is " + Object.keys(formControlObj.errors)[0]
            }
          }
          else {
            return i + " is " + Object.keys(formControlObj.errors)[0]
          }
          //  return errorObj[i][Object.keys(formControlObj.errors)[0]];
        }
      }
    }
  }

  mappingFormData(form, formData) {
    _.forEach(Object.keys(formData), (value) => {
      let array = formData[name];
      if (form.controls[value]) {
        form.controls[value].patchValue(formData[value], { emitEvent: true });
      }
    });
    return form;
  }
  sameasMappingData(form, mapobject, form2?) {
    var withtwoform = false;
    if (form2 != undefined && form2 != null && !_.isEmpty(form2)) {
      withtwoform = true;
    }
    _.forEach(mapobject, (value, key) => {
      //console.log(key);
      if (form.get(key).value) {
        if(withtwoform == true)
        {
          form2.controls[value].patchValue(form.get(key).value, { emitEvent: true });
        }
        else{
          form.controls[value].patchValue(form.get(key).value, { emitEvent: true });
        }
      }
    });
  }

  public loadDateFormatList() {
    return this.httpService.globalGetServiceByUrl("assets/date_format.json", "")
      .then(data => {
        return data;
      });
  }  
}
