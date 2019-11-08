//  import * as mx_con from '../../../../../app/views/user-panel/connections/mx-connections/mx-connections.component'
// import { MxConnectionsComponent } from '../../../../../app/views/user-panel/connections/mx-connections/mx-connections.component';

var GLOBAL_CONFIG = {
    // rootPath: 'http://localhost:52718/',
    rootPath: 'https://intellimodz.com/api/test/',
    apiPath: 'api/',
    Connection: 'Connections/',
    Employee: "Employee/",
};

// get app info 
var app_token = localStorage.getItem('imodzUP-token');
var app_token_type = localStorage.getItem('imodzUP-token_type');
var app_user_info = {};
var userinfo = localStorage.getItem('imodzUP-userinfo');
var CompanyId = 0;
var EmployeeId = 0;
var parentmodel_ID = parseInt(localStorage.getItem('imodzUP-selectedModel'));
var model_ID = parseInt(localStorage.getItem('imodzUP-selectedModuleid'));
var connection_ID = 0;
if (userinfo != null && userinfo != undefined && userinfo != "") {
    app_user_info = JSON.parse(userinfo);
    CompanyId = parseInt(app_user_info.CompanyId);
    EmployeeId = parseInt(app_user_info.EmployeeId);
}
var auth = app_token_type.replace(/"/g, '') + ' ' + app_token.replace(/"/g, '');
$.ajaxSetup({
    headers: {
        'Authorization': auth,
        //  'Access-Control-Allow-Origin': '*,'+document.location.host,
        //  'Access-Control-Allow-Methods': 'GET, POST,PUT,OPTIONS',
        //  'Access-Control-Allow-Headers' : 'Origin, Content-Type, Accept, Authorization, X-Request-With',
        //  'Access-Control-Allow-Credentials' : true
    }
})
// console.log("user info : ", app_user_info);
// Parses URL parameters. Supported parameters are:
// - lang=xy: Specifies the language of the user interface.
// - touch=1: Enables a touch-style user interface.
// - storage=local: Enables HTML5 local storage.
// - chrome=0: Chromeless mode.

/// variable for connection file name
var connectionFileName;

var mode, data1;
$("#alert_meassage").css("display", "block");
window.onload = setTimeout(page_load, 500);

function page_load() {
    $("#alert_meassage").css("display", "block");
    mode = getParameterByName("c_mode");
    data1 = getParameterByName("name");
    connection_ID = getParameterByName("con_id");
    connection_ID = (connection_ID != "" && connection_ID != null && connection_ID != undefined) ? connection_ID : 0;
    //  model_ID = getParameterByName("ModelId");

    if (mode != null) {

        if (mode == "E") {
            var req_data = {
                "con_id": connection_ID,
                "modelId": parentmodel_ID,
                "legoId": model_ID,
                "name": data1
            };
            $.ajax({

                type: "POST",
                url: GLOBAL_CONFIG.rootPath + GLOBAL_CONFIG.apiPath + GLOBAL_CONFIG.Connection + "GetConDoc",
                data: JSON.stringify(req_data),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                //  crossDomain:true,
                async: false,
                //  cache: false,
                beforeSend: function(xhr) {
                    /* Authorization header */
                    //    xhr = setRequestHeader(xhr);
                },
                success: function(res) {
                    $("#body_loader").hide();
                    //  var sdata = xml.documentElement.outerHTML;
                    if (res.status == 1) {
                        var sdata = StringToXML(res.result.xml).documentElement.outerHTML;
                        var sdata = res.result.xml;
                        import1(sdata, data1);
                        $("#alert_meassage").css("display", "none");
                    }
                    //var sdata = xml.activeElement.innerHTML;
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    $("#body_loader").hide();
                    //alert();
                    //alert(xhr.status);
                    //alert(xhr.responseText);
                    //alert(thrownError);
                }
            });
            //var value_xml = sessionStorage.getItem("xml_file");
            //import1(value_xml, data1);
        }
    }
    $("#alert_meassage").css("display", "none");
}

function check_value(name) {

    var url = GLOBAL_CONFIG.rootPath + GLOBAL_CONFIG.apiPath + GLOBAL_CONFIG.Connection + 'Common';
    var req_data = {
        Name: name,
        legoid: model_ID,
        options: 5
    };
    $.ajax({
        url: url,
        type: 'POST',
        async: false,
        data: JSON.stringify(req_data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function(xhr) {
            if (xhr && xhr.overrideMimeType) {
                xhr.overrideMimeType("application/j-son;charset=UTF-8");
            }
        },
        success: function(res) {
            var valid = true;
            if (res.status == 1) {
                valid = false;
            }
            sessionStorage.setItem("check_is_v", valid);
        }
    });
}

function setRequestHeader(xhr) {
    var auth = app_token_type + ' ' + app_token;
    return xhr.setRequestHeader("Authorization", auth.toString());
}
//import1();
function stringDivider(str, width, spaceReplacer) {

    if (str.length > width) {
        var p = width
        for (; p > 0 && str[p] != ' '; p--) {}
        if (p > 5) {
            var left = str.substring(0, p);
            var right = str.substring(p + 1);
            return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
        }

    }
    return str;
}

function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function get_model() {
    $("#alert_meassage").css("display", "block");
    var model = getParameterByName("ModelId");
    var view = getParameterByName("View");
    var l1 = getParameterByName("L1");
    var arr = [];
    var sd = "";
    var data1 = "";
    var url = GLOBAL_CONFIG.rootPath + GLOBAL_CONFIG.apiPath + GLOBAL_CONFIG.Connection + 'Common';
    var req_data = {
        "companyId": CompanyId,
        "legoid": model_ID,
        "options": 4
    };
    $.ajax({
        url: url,
        type: 'POST',
        async: false,
        data: JSON.stringify(req_data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function(xhr) {
            if (xhr && xhr.overrideMimeType) {
                xhr.overrideMimeType("application/j-son;charset=UTF-8");
            }
            // /* Authorization header */
            // xhr.setRequestHeader("Authorization", app_token_type + ' ' + app_token);
            // // setRequestHeader(xhr);
        },
        success: function(res) {
            if (res.status == 1) {
                data1 = res.result;
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert();
            //alert(xhr.status);
            //alert(xhr.responseText);
            //alert(thrownError);
        }

    });
    return data1;
}

function getdata() {
    var arr = [];
    var url = GLOBAL_CONFIG.rootPath + GLOBAL_CONFIG.apiPath + GLOBAL_CONFIG.Employee + 'GeneralEmployeeList';
    var data_req = {
        CompanyId: CompanyId,
        Active: 1
    };
    $.ajax({
        url: url,
        type: 'POST',
        async: false,
        data: JSON.stringify(data_req),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        beforeSend: function(xhr) {
            if (xhr && xhr.overrideMimeType) {
                xhr.overrideMimeType("application/j-son;charset=UTF-8");
            }
            /* Authorization header */
            //    setRequestHeader(xhr);
        },
        success: function(res) {
            if (res.status == 1) {
                _.forEach(res.result, (data) => {
                    arr.push(data.firstName + " " + data.lastName);
                });
            }
        },
        error: function(error) {}
    });
    return arr;
}


function createRequestObject() {
    var obj;
    var browser = navigator.appName;
    if (browser == "Microsoft Internet Explorer") {
        obj = new ActiveXObject("Microsoft.XMLHTTP");
    } else {
        obj = new XMLHttpRequest();
    }
    return obj;
}

function upload_save(xmldata, name, status, img_data) {
    var model = getParameterByName("ModelId");
    var url = GLOBAL_CONFIG.rootPath + GLOBAL_CONFIG.apiPath + GLOBAL_CONFIG.Connection + 'SaveXml';
    var options = (connection_ID != "" && connection_ID != null && connection_ID != 0) ? 3 : 2;
    var req_data = {
        xml: xmldata,
        name: name,
        legoId: model_ID,
        modelId: parentmodel_ID,
        companyId: CompanyId,
        employeeId: EmployeeId,
        con_id: connection_ID,
        status: status,
        htmlc: img_data,
        options: options
    };
    
    $.ajax({
        type: "POST",
        url: url,
        async: false,
        data: JSON.stringify(req_data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function(xhr) {
            if (xhr && xhr.overrideMimeType) {
                xhr.overrideMimeType("application/j-son;charset=UTF-8");
            }
            /* Authorization header */
            //    xhr = setRequestHeader(xhr);
        },
        success: function(msg) {
            sessionStorage.setItem("isgraphchanged", 0);
            sessionStorage.setItem("connetionName", name);
            if (status == false) {
                $.iaoAlert({
                    msg: "Saved Successfully",
                    type: "success",
                    mode: "dark"
                })
            } else {
                $.iaoAlert({
                    msg: "Updated Successfully",
                    type: "success",
                    mode: "dark"
                })
            }
        }
    });

}
// Extends EditorUi to update I/O action states based on availability of backend
(function() {
    var editorUiInit = EditorUi.prototype.init;
    // editorUiInit.firstName="Test uniiii";
    EditorUi.prototype.init = function() {
        editorUiInit.apply(this, arguments);
        // this.save(this.editor.getOrCreateFilename());
        // this.actions.get('export').setEnabled(false);

        // Updates action states which require a backend
        //  if (!Editor.useLocalStorage) {

        //    mxUtils.post(OPEN_URL, '', mxUtils.bind(this, function (req) {
        //      var enabled = req.getStatus() != 404;

        //      this.actions.get('open').setEnabled(enabled || Graph.fileSupport);
        //      this.actions.get('import').setEnabled(enabled || Graph.fileSupport);
        //      this.actions.get('save').setEnabled(enabled);
        //      this.actions.get('saveAs').setEnabled(enabled);
        //      this.actions.get('export').setEnabled(enabled);
        //    }));
        //  }
        //this.save(this.editor.getOrCreateFilename()); 

        //document.write("You have entered : " + retVal);    

    };

    // Adds required resources (disables loading of fallback properties, this can only
    // be used if we know that all keys are defined in the language specific file)
    mxResources.loadDefaultBundle = false;
    var bundle = mxResources.getDefaultBundle(RESOURCE_BASE, mxLanguage) ||
        mxResources.getSpecialBundle(RESOURCE_BASE, mxLanguage);

    // Fixes possible asynchronous requests
    mxUtils.getAll([bundle, STYLE_PATH + '/default.xml'], function(xhr) {
        // Adds bundle text to resources
        mxResources.parse(xhr[0].getText());

        // Configures the default graph theme
        var themes = new Object();
        themes[Graph.prototype.defaultThemeName] = xhr[1].getDocumentElement();

        // Main
        new EditorUi(new Editor(urlParams['chrome'] == '0', themes));
    }, function() {
        document.body.innerHTML = '<center style="margin-top:10%;">Error loading resource files. Please check browser console.</center>';
    });
})();

function StringToXML(oString) {
    if (window.DOMParser) {
        // code for modern browsers
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(oString, "text/xml");
        return xmlDoc;
    } else {
        // code for old IE browsers
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(oString);
        return xmlDoc;
    }

}

function getFileName() {
    return connectionFileName;
}

function setFileName() {
    // var name = prompt("Enter your name : ", "your name here");
    // if (name != null && name != undefined && name != "") {
    //   clearFileName();
    //   connectionFileName = name;
    //   EditorUi.prototype.saveFile(false, 'save');
    // }
    // else {
    //   alert('Invaid Name');
    // }
    // EditorUi.prototype.customSaveFile();
    return true

}

function clearFileName() {
    connectionFileName = "";
}