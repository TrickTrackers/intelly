import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/operator/do';
import { Observable } from 'rxjs/Rx';
import { AppConstant } from '../app.constant';
import { PrimengConstant } from '../app.primeconfig';
import { LocalStorageService } from './local-storage.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { CommonAppService } from '../services/appservices/common-app.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import * as _ from 'lodash';
import * as $ from 'jquery';
@Injectable()
export class JWTTokenInterceptorService {
    Role: any;

    constructor(private localStorageService: LocalStorageService, private messageservice: MessageService,
        private route: ActivatedRoute, private router: Router, private CommonAppService: CommonAppService, private confirmationService: ConfirmationService) { }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        var authToken: any = this.localStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.TOKEN);
        this.Role = this.localStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.ROLE);

        if (authToken) {
            var formatedtoken = this.localStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.TOKEN_TYPE)
                + " " + authToken;

            if (req.body instanceof FormData) {
                req = req.clone({
                    setHeaders: {
                        'Authorization': formatedtoken
                    }
                });
            }
            else {
                req = req.clone({
                    setHeaders: {
                        'Authorization': formatedtoken,
                        'Content-Type': 'application/json'
                    }
                });
            }

        }
        else {
            // console.error('Token Empty');
        }

        return next.handle(req)
            .do(event => {
                //console.log(this.route.paramMap); 
                var res: any = event;
                if (res.type > 1) {
                    $("#spinner").hide();
                    if (res.status == 203) {
                        if (window.location.hash.indexOf("#/ibacus") < 0 && res.url.indexOf('/role/') < 0) {
                            if (res.body.code == "403") {

                            }
                            else {
                                window.location.href = "./assets/access.html";
                            }

                            return false;
                        }

                    }
                    // else if (res.status == 201) 
                    // {
                    //     var rights = "Readonly";
                    //     this.localStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.DOCUMENTACCESSRIGHTS, rights);
                    // }
                    // else{
                    //     var rights = "Unrestricted";
                    //     this.localStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.DOCUMENTACCESSRIGHTS, rights);
                    // }
                }
            },
                error => {
                    this.messageservice.clear();
                    if (error.url.indexOf("Document/DownloadAllFile") > 0) {
                        var message = "Something went wrong.";
                        switch (error.status) {
                            case 404:
                                message = "File Does Not Exists";
                                break;
                            case 406:
                                message = "Invalid storage path";
                                break;
                            case 304:
                                message = "UnAuthorized to access this document.";
                                break;
                            default:
                                message = "Something went wrong.";
                                break;
                        }
                        this.messageservice.add({ severity: 'error', summary: 'Error', detail: message });
                        return false;
                    }
                    if (error instanceof HttpErrorResponse && error.status == 0 && PrimengConstant.GLOBAL_ERROR.SERVER_PROB_MSG_ENABLE) {
                        this.messageservice.add({ severity: 'error', summary: 'Error', detail: PrimengConstant.GLOBAL_ERROR.SERVER_PROBLEM });
                        return false;
                    }
                    else if (error instanceof HttpErrorResponse && error.status >= 400) {
                        // Handle Error
                        if (error.error != null) {
                            var errorNature = error.error;
                            var errormessage = PrimengConstant.COMMON[errorNature.error];
                            var werrormessage = PrimengConstant.COMMON["testss"];
                            if (errormessage) {
                                this.messageservice.add({ severity: 'error', summary: 'Error ', detail: errormessage });
                            }
                            else {
                                _.forEach(Object.keys(errorNature), (value) => {
                                    var errorArray = errorNature[value];
                                    _.forEach(errorArray, (error) => {
                                        var errormsg = error;
                                        if (error == "The input was not valid.") {
                                            errormsg = value + " is not valid."
                                        }
                                        this.messageservice.add({ severity: 'error', summary: 'Error ', detail: errormsg });
                                    });

                                });
                                if (errorNature[""] != undefined) {
                                    if (errorNature[""].length > 0) {
                                        var errorlist = errorNature[""];
                                        _.forEach(errorNature[""], (value) => {
                                            this.messageservice.add({ severity: 'error', summary: 'Error ', detail: value });
                                        });
                                    }
                                    else
                                        this.messageservice.add({ severity: 'error', summary: 'Error ', detail: PrimengConstant.GLOBAL_ERROR.SERVER_PROBLEM });
                                }
                            }
                        }
                        else {
                            this.messageservice.clear();
                            // this.messageservice.add({ severity: 'error', summary: 'Error ', detail: error.statusText });
                            if (error.status == 401) {
                                this.RequestRefreshToken();
                            }
                        }
                    }
                    return true;
                }
            );
    }
    RequestRefreshToken() {
        this.confirmationService.confirm({
            header: "Your session has expired",
            message: 'Your session has expired. Do you want extend the session time?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.CommonAppService.refreshToken()
                    .then((res) => {
                        if (!_.isEmpty(res)) {
                            if (res.status == 1) {
                                window.location.reload();
                            } else {
                                this.RedirectToLogin();
                            }
                        }
                    })
                    .catch((error) => {
                        this.RedirectToLogin();
                    });
            },
            reject: () => {
                this.RedirectToLogin();
            }
        }); 
    }
    RedirectToLogin() {
        setTimeout(e => {
            $("#app_main_container").html("");
            this.CommonAppService.logOut("");
        }, 6000);
    }
}
