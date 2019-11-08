import * as c from '../assets/constant.json';
////console.log("constant file",c);

export const AppConstant = Object.freeze({
  APP: {
    MODULE_NAME: 'IntelliModz-CpMp'
  },
  // API_ENDPOINT: 'http://localhost:52718/',
  API_ENDPOINT: 'https://intellimodz.com/api/',
  UI_MP_ORGIN: 'https://intellimodz.com/',
  UI_UP_ORGIN: 'https://intellimodz.com/',
  PIN_URL: 'https://www.intellimodz.com/IntellimodoulePin/IntellimodoulePin.application',
  CLICKONCE_URL: 'https://intellimodz.com/intellimodzpin/clickoncelogin.application',
  UI_MP_SUBORGIN: 'mp/',
  UI_CP_SUBORGIN: '/cp/',
  UI_UP_SUBORGIN: '/up/',
  FILE_LOCATION: {
    base: "wwwroot",
    ConnectionFilesPath: "StaticFiles/ConnectionFiles/HTML/",
    DocumentFilePath: "StaticFiles/TempFiles/Documents/",
    Connection: "XML",
  },
  ENCRYPTDECRIYPTKEY: 'moc.zdom-illetni-key',
  API_CONFIG: {
    APP_CONTENT: {
      APP_NAME: 'IntelliModz',
      APP_DESC: 'IntelliModz',
    },
    LOCALSTORAGE: {
      STR_PREFIX: 'imodzUP-',
      STR_PREFIX_CP: 'imodzCP-',
      STR_PREFIX_MP: 'imodzMP-',
      STR_PREFIX_UP: 'imodzUP-',
      //STR_PREFIX: 'imodzMP-',
      ISMOBILEDEV: 'ismobileDevice',
      TOKEN: 'token',
      TOKEN_TYPE: 'token_type',
      TOKEN_EXPIRES: "expires_in",
      ROLE: "rl",
      USERINFO: "userinfo",
      //LEGOINFO : "legoinfo",
      IS_ACTINGCP: "isActingCp",
      IS_ACTINGUP: "isActingUp",
      APPSETTING: 'appsettings',
      CompanyId: "companyId",
      SelectedModel: "selectedModel",
      SelectedModuleId: "selectedModuleid",
      isRefModule: "isRefModule",
      RefModuleId: "RefModuleId",
      COMPANYINFO: "companyinfo",
      PREFERENCESETTINGS: "preferenceSettings",
      DOCUMENTACCESSRIGHTS: "documentaccessRights",
      EMPINFOID: "empinfoid",
      EMPMANAGERID: "empmanagerid",
      ISPIN: "isPin",
      PINID: "pinId",
      SELCTEDEMPNAME: "selectedempname",
      PINMODULEID:"pinModuleId"
    },
    M_ACCOUNT_URL: 'V1/account/',
    M_CONNECT_URL: 'connect/',
    M_BASE_URL: 'api/',
    IDENTITY_CONFIG: {
      GRAND_TYPE: "password",
      SCOPE: "api1 openid",
      CLIENTID: "ro.angular",
      CLIENTSECRET: "secret", 
    },
    HEADER_CONTENT_TYPE: {
      FORM_URL_ENCODE: 'application/x-www-form-urlencoded;charset=utf-8;',
      APPLICATION_JSON: 'application/json',
    },
    DATE: {
      format1: 'dd-MM-yyyy',
      apiFormat: 'YYYY-MM-DD',  // A valid moment js data format. Refer https://momentjs.com/docs/#/parsing/string-format/
      displayFormat: 'DD-MM-YYYY',
      sqlDateFormat: 'DD-MM-YYYY',
      dotnetDateFormat: 'MM/DD/YYYY',
      dotnetFullDateFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    ANG_DATE: {
      displaydtime: 'dd-MMM-yyyy HH:mm',
      displayMediumFormat: 'MMM d, y, h:mm:ss a',
      displayFormat: 'dd-MM-y', // 01-31-2019 y-MM-dd
      apiFormat: 'y-MM-dd',
      apiTSFormat: 'y-MM-dd HH:mm',

    },
    EmployeeCategory: {
      MANAGER: 1,
    },
    API_URL: {
      UP_Login: "token",
      UP_userinfo: "userinfo",
      iconPath: "StaticFiles/icons/",
      iconsizeLimit: 20480,//4 kb
      iconDimLimit: 100,//4 kb
      photoPath: "UserPhotos/",
      photosizeLimit: 102400,//102 kb
      photoDimLimit: 600,//600 pixels 
      account: {
        BASE: "Account",
        REGISTER: "/register",
        LOGOUT: "/logout",
        LOGIN: "/login",
        FORGOT: "/forgot",
        RESET: "/reset",
        REFRESHTOKEN: "/RefreshToken"
      },
      SMS: {
        BASE: "company"
      },
      COMPANY: {
        BASE: "company",
        CPDEFAULT: "CpDefaults",
        UPDATE: "/update"
      },
      COMMON: {
        StatusList: "CpStatus",
        CpPayTypeList: "CpPayType",
        EmpCategoryList: "MpCategory"
      },
      EMPLOYEE: {
        BASE: "Employee",
        GETBYCOMPANY: "/GetByCompany",
        REGISTEREMPLOYEE: "registeremployee",
      },
      MESSAGES: {
        BASE: "CpAgreement",
      },
      GROUP: {
        BASE: "MpGroup"
      },
      MASTERGROUP: {
        BASE: "Group",
      },
      RIGHTS: {
        BASE: "MpLegoRights"
      },
      UPMODEL: {
        BASE: "UPModel"
      },
      LEGO: {
        BASE: "Lego"
      },
      WORKFLOW: {
        BASE: "Workflow"
      },
      CONNECTIONS: {
        BASE: "Connections"
      },
      BOOKMARK: {
        BASE: "Bookmark"
      },
      ASSESSMENT: {
        BASE: "Assessment"
      },
      DOCUMENT: {
        BASE: "Document"
      },
      STRATEGY: {
        BASE: "Strategy"
      },
      CPFEESDETAILS: {
        BASE: "CpFeesDetails",
        GETALLCPFEES: ""
      },
      CPAGREEMENT: {
        BASE: "CPAgreement"
        //GETALLCPFEES : ""       
      },
      CPPAYMENTTYPE: {
        BASE: "CpPayType"
      },
      CPCARDTYPE: {
        BASE: "CPCreditCardType"
      },
      DETAILS: {
        BASE: "Details"
      },
      PERFORMANCE: {
        BASE: "Performance"
      },
      COLLABORATION: {
        BASE: "Collaboration"
      },
      OVERALLSEARCH: {
        BASE: "OverallSearch"
      },
      REPORTS: {
        BASE: "Reports"
      },
      PINMODULE: {
        BASE: "Pinmodule"
      },
      SPREADSHEET: {
        BASE: "SpreadSheet"
      },
      NOTIFICATION: {
        BASE: "TextEmail"
      },
    }
  }
});
