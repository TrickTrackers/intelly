import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonHttpService } from '../../../shared/common-http.service';
import { AppConstant } from '../../../app.constant';
import { LocalStorageService } from '../../../shared/local-storage.service';
import * as appSettings from '../../../../assets/constant.json';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Http, Headers, Response, ResponseContentType, RequestOptions } from '@angular/http';
import { Observable, Subscription } from 'rxjs/Rx';
import { MessageService } from 'primeng/components/common/messageservice';
import { saveAs } from 'file-saver';
import *  as fileMimeTypes from '../../FileMimeType.constant'
import * as _ from 'lodash';
import { CommonAppService } from '../../appservices/common-app.service'

@Injectable()
export class DocumentService implements OnDestroy {
  private fileMovingSubject = new Subject<any>();
  appSettings: any = appSettings;
  api_url: string;
  appendpoint: string;
  documentbase: string;
  public imageBlobUrl: any;
  companyinfo: any = [];
  userinfo: any = [];
  employeeId: any;
  clickOnceUrl: string = AppConstant.CLICKONCE_URL;
  private _subscriptions = new Subscription();
  constructor(private httpService: CommonHttpService, private LocalStorageService: LocalStorageService, private http: HttpClient, private AngHttp: Http, private MessageService: MessageService
    , private _http: Http, public CommonAppService: CommonAppService) {
    this.api_url = this.appSettings.API_ENDPOINT;
    this.appendpoint = this.api_url + AppConstant.API_CONFIG.M_BASE_URL;
    this.documentbase = this.appendpoint + AppConstant.API_CONFIG.API_URL.DOCUMENT.BASE;
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.companyinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.COMPANYINFO);
    if (this.userinfo != undefined && this.userinfo != null) {
      this.employeeId = parseInt(this.userinfo.EmployeeId);
    }
  }

  public GetDocument(data: any): Promise<any> {
    return this.httpService.globalPostService(this.documentbase + "/GetDocumentList", data)
      .then(data => {
        return data;
      });
  }

  public DragDropDoc(data: any): Promise<any> {
    return this.httpService.globalPostService(this.documentbase + "/DragDropDoc", data)
      .then(data => {
        return data;
      });
  }
  public FileMoveUpdates(item) {
    this.fileMovingSubject.next({
      data: item
    });
  }
  getFileMoveUpdates(): Observable<any> {
    return this.fileMovingSubject.asObservable();
  }
  public GetAllDocument(data: any): Promise<any> {
    return this.httpService.globalPostService(this.documentbase + "/GetAllDocument", data)
      .then(data => {
        return data;
      });
  }

  public GetLinkDocument(data: any): Promise<any> {
    return this.httpService.globalPostService(this.documentbase + "/GetLinkDocument", data)
      .then(data => {
        return data;
      });
  }

  public getEmpList(data: any): Promise<any> {
    return this.httpService.globalPostService(this.documentbase + "/GetUserList", data)
      .then(data => {
        return data;
      });
  }

  public documentAccess(data: any): Promise<any> {
    return this.httpService.globalPostService(this.documentbase + "/DocumentAccess", data)
      .then(data => {
        return data;
      });
  }

  public SaveLinkDocument(data: any): Promise<any> {
    return this.httpService.globalPostService(this.documentbase + "/SaveLinkDocument", data)
      .then(data => {
        return data;
      });
  }

  public DeleteDocument(data: any): Promise<any> {
    return this.httpService.globalPostService(this.documentbase + "/DeleteDocument", data)
      .then(data => {
        return data;
      });
  }

  public EditDocument(data: any): Promise<any> {
    return this.httpService.globalPostService(this.documentbase + "/EditDocument", data)
      .then(data => {
        return data;
      });
  }

  public EditDocumentTree(data: any): Promise<any> {
    return this.httpService.globalPostService(this.documentbase + "/EditDocumentTree", data)
      .then(data => {
        return data;
      });
  }

  public GetModuleDocList(data: any): Promise<any> {
    return this.httpService.globalPostService(this.documentbase + "/DocumentModuleList", data)
      .then(data => {
        return data;
      });
  }

  public UploadDocument(formdata: FormData) {
    //////console.log("document list", formdata);
    return this.httpService.globalPostService(this.documentbase + "/Upload", formdata)
      .then(data => {
        return data;
      });

  }


  // public UploadDocument(formdata) {
  //   return new HttpRequest('POST', this.documentbase + "/Upload", formdata, {
  //     reportProgress: true,
  //   });
  // }
  // this.http.request(uploadReq).subscribe(event => {
  //     if (event.type === HttpEventType.UploadProgress){
  //       return this.progress = Math.round(100 * event.loaded / event.total);
  //     } 
  //     else if (event.type === HttpEventType.Response){

  //               return event.body;
  //           }                 
  //   });


  // const uploadReq = new HttpRequest('POST', `http://localhost:52718/api/Document/GetAll`, this.formData, {
  //   reportProgress: true,
  // });

  // public DownloadDocument(data: any): Promise<any> {
  //     return this.httpService.globalPostService(this.documentbase + "/DownloadDocument" , data)
  //       .then(data => {
  //         return data;
  //       });
  //   } 


  // public DownloadDocument(data: any){
  //   return this.httpService.HttpBlobPostService(this.documentbase + "/DownloadDocument", data)
  //     .map(data => {
  //       return data;
  //     });
  // }

  public DownloadDocument(data: any) {
    this.http.post(this.documentbase + "/DownloadDocument", data, { responseType: 'blob' }).subscribe(blob => {
      //  saveAs(blob, 'SomeFileDownloadName.someExtensions', {
      //     type: 'text/plain;charset=windows-1252' // --> or whatever you need here
      //  }
    });
  }

  // downloadFile(data: Response) {
  //   var blob = new Blob([data], { type: 'blob' });
  //   var url = window.URL.createObjectURL(blob);
  //   window.open(url);
  // }

  // downloadfile(data:any){
  //   var headers = new Headers();
  //   headers.append('responseType', 'blob');
  //   return this.http.post( this.documentbase + "/DownloadDocument", data)
  //             .map(res => new Blob([res],{ type: 'image/jpeg' }))
  //             .catch(data);
  // }

  // postAndGetResponse(myParams:any){
  //   return this.AngHttp.post(this.documentbase + "/DownloadDocument", myParams)
  //   .map(response => (<Response>response).blob())
  //   .catch(this.handleError);
  // }

  private handleError(error: any): Promise<any> {
    //console.log('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  //  postAndGetResponse(data: any) {
  //   return this.AngHttp.post(this.documentbase + "/DownloadDocument" ,data ,{responseType: ResponseContentType.Blob })
  //   .map(this.extractData)
  //   .catch(this.handleError);
  // }
  private extractData(res: Response) {
    // let body = res.json();
    return res || {};
  }

  // postAndGetResponse(data:any) {

  //   return this.AngHttp.post(this.documentbase + "/DownloadDocument" ,data)
  //     .map(res => {
  //       return {
  //         filename: data.LinkDoc,
  //         data: res
  //       };
  //     })
  //     .subscribe(res => {
  //         console.log('start download:',res);
  //         var url = window.URL.createObjectURL(res.data.url);
  //         var a = document.createElement('a');
  //         document.body.appendChild(a);
  //         a.setAttribute('style', 'display: none');
  //         a.href = url;
  //         a.download = res.filename;
  //         a.click();
  //         window.URL.revokeObjectURL(url);
  //         a.remove(); // remove the element
  //       }, error => {
  //         console.log('download error:', JSON.stringify(error));
  //       }, () => {
  //         console.log('Completed file download.')
  //       });
  // }

  // postAndGetResponse(data) {
  //   return this.AngHttp.post(this.documentbase + "/DownloadDocument", data, {responseType: ResponseContentType.Blob})
  //     .map(res => {
  //       return {
  //         filename: data.LinkDoc,
  //         data: res.blob()
  //       };
  //     })

  // }

  // public postAndGetResponse(data){
  //     return this.AngHttp.post(this.documentbase + "/DownloadDocument", data, {responseType: ResponseContentType.Blob})
  //     .map(res => {
  //       return {
  //         filename: data.LinkDoc,
  //         data: res.blob()
  //       };
  //     })
  // }

  public postAndGetResponse(data: any): Promise<any> {
    //return this.http.post(this.documentbase + "/DownloadDocument", data , {responseType: 'blob'});
    return this.httpService.globalPostService(this.documentbase + "/DownloadDocument", data)
      .then(data => {
        return data;
      });
  }

  public postAndGetResponsenew(data: any): Promise<any> {
    //return this.http.post(this.documentbase + "/DownloadDocument", data , {responseType: 'blob'});
    return this.httpService.globalPostService(this.documentbase + "/DownloadAllFile", data)
      .then(data => {
        return data;
      });
  }


  public GetDocumentUrlPath(data: any): Promise<any> {
    return this.httpService.globalPostService(this.documentbase + "/GetDocumentUrlPath", data)
      .then(data => {
        return data;
      });
  }

  public SaveDocumentDownloadFile(data: any): Promise<any> {
    return this.httpService.globalPostService(this.documentbase + "/AddDocumentDownloadFile", data)
      .then(data => {
        return data;
      });
  }
  // public postAndGetResponse(c) {
  //   var postData = new FormData();
  //   //postData.append('document', JSON.stringify(c));

  //   var xhr = new XMLHttpRequest();
  //   xhr.open('POST', this.documentbase + "/DownloadDocument", true);
  //   //xhr.setRequestHeader('X-CSRFToken', csrftoken);
  //   xhr.responseType = 'blob';
  //   xhr.onload = function (this, event) {
  //     var blob = this.response;
  //     // var contentDispo = this.getResponseHeader('Content-Disposition');
  //     // var fileName = contentDispo.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)[1];
  //     var a = document.createElement('a');
  //     a.href = window.URL.createObjectURL(blob);
  //     a.download = "Intellimodz-Feedbacks.xlsx";
  //     a.dispatchEvent(new MouseEvent('click'));
  //   }
  //   xhr.send(c);
  // }



  // postAndGetResponse(myParams:any): Promise<any>{
  //   return this.http.post(this.documentbase + "/DownloadDocument", myParams, {responseType: ResponseContentType.Blob})
  //   .map(response => (<Response>response).blob())
  //   .catch(this.handleError);
  // }



  // public GDriveUpload(formdata) {
  //   return new HttpRequest('POST', this.documentbase + "/GDriveUpload", formdata, {
  //     reportProgress: true,
  //   });
  // }

  public GDriveUpload(formdata: FormData) {
    //console.log("document list", formdata);
    return this.httpService.globalPostService(this.documentbase + "/GDriveUpload", formdata)
      .then(data => {
        return data;
      });

  }

  // public GDriveDownload(formdata) {
  //   return new HttpRequest('POST', this.documentbase + "/GDriveDownload", formdata, {
  //     reportProgress: true,
  //   });
  // }

  public GDriveDownload(data: any): Promise<any> {
    //return this.http.post(this.documentbase + "/DownloadDocument", data , {responseType: 'blob'});
    return this.httpService.globalPostService(this.documentbase + "/GDriveDownload", data)
      .then(data => {
        return data;
      });
  }

  // public OneDriveUpload(formdata) {
  //   return new HttpRequest('POST', this.documentbase + "/OneDriveUpload", formdata, {
  //     reportProgress: true,
  //   });
  // }

  public OneDriveUpload(formdata: FormData) {
    //console.log("document list", formdata);
    return this.httpService.globalPostService(this.documentbase + "/OneDriveUpload", formdata)
      .then(data => {
        return data;
      });

  }

  public OneDriveDownload(data: any): Promise<any> {
    //return this.http.post(this.documentbase + "/DownloadDocument", data , {responseType: 'blob'});
    return this.httpService.globalPostService(this.documentbase + "/DropBoxDownload", data)
      .then(data => {
        return data;
      });
  }

  // public SharepointUpload(formdata) {
  //   return new HttpRequest('POST', this.documentbase + "/SharepointUpload", formdata, {
  //     reportProgress: true,
  //   });
  // }

  public SharepointUpload(formdata: FormData) {
    //console.log("document list", formdata);
    return this.httpService.globalPostService(this.documentbase + "/SharepointUpload", formdata)
      .then(data => {
        return data;
      });

  }

  // public SharepointDownload(formdata) {
  //   return new HttpRequest('POST', this.documentbase + "/SharepointDownload", formdata, {
  //     reportProgress: true,
  //   });
  // }
  public SharepointDownload(data: any): Promise<any> {
    //return this.http.post(this.documentbase + "/DownloadDocument", data , {responseType: 'blob'});
    return this.httpService.globalPostService(this.documentbase + "/DropBoxDownload", data)
      .then(data => {
        return data;
      });
  }

  public DropBoxUpload(formdata: FormData) {
    ////console.log("document list", formdata);
    return this.httpService.globalPostService(this.documentbase + "/DropBoxUpload", formdata)
      .then(data => {
        return data;
      });

  }

  public DropBoxDownload(data: any): Promise<any> {
    //return this.http.post(this.documentbase + "/DownloadDocument", data , {responseType: 'blob'});
    return this.httpService.globalPostService(this.documentbase + "/DropBoxDownload", data)
      .then(data => {
        return data;
      });
  }

  public submoduleUnflattenEntities(arr, legoid) {
    var tree = [],
      mappedArr = {},
      arrElem,
      mappedElem: any;
    for (var i = 0; i < arr.length; i++) {
      arrElem = arr[i];
      if (arrElem.isMetrics == 0) {
        mappedArr[arrElem.legoId] = arrElem;
      }
      mappedArr[arrElem.legoId]['children'] = [];
    }
    for (var legoId in mappedArr) {
      if (mappedArr.hasOwnProperty(legoId)) {
        mappedElem = mappedArr[legoId];
        var newArrElem;

        for (var j = 0; j < arr.length; j++) {
          newArrElem = arr[j];
          if (newArrElem.legoId == legoId && newArrElem.isMetrics == 1) {
            if (newArrElem.legoId != legoid) {
              mappedArr[legoId]['children'].push(newArrElem);
            }

          }
        }
        mappedElem.type = "Folder";
        mappedElem.path = " [ #Submodules " + mappedElem.legoCount + " / #Documents  " + mappedElem.documentCount + " ]";
        mappedElem.expanded = true;
        // If the element is not at the root level, add it to its parent array of children.
        if (mappedElem.parentId) {
          if (mappedArr[mappedElem['parentId']] == undefined) {
            tree.push(mappedElem);
          }
          else {
            mappedArr[mappedElem['parentId']]['children'].push(mappedElem);
            mappedArr[mappedElem['parentId']]['children'].sort(function (a, b) {
              return ((a.position > b.position));
            });
          }
        }
        else {
          tree.push(mappedElem);
        }
      }
    }
    return tree;
  }
  public downloadFile(c) {
    this.userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.companyinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.COMPANYINFO);
    var req = {
      DocumentId: c.documentId,
      Version: c.version,
      LegoId: c.legoId,
      LinkDoc: c.linkDoc,
      FileId: c.fileId,
      EmpId: parseInt(this.userinfo.EmployeeId),
      CompanyId: parseInt(this.userinfo.CompanyId),
      service_service_userName: this.companyinfo.service_userName,
      service_password: this.companyinfo.service_password,
      access_token: this.companyinfo.access_token,
      service_id: this.companyinfo.service_id,
      developer_token: this.companyinfo.developer_token,
      client_secret: this.companyinfo.client_secret,
      client_id: this.companyinfo.client_id,
      share_point_url: this.companyinfo.share_point_url
    };

    //this.companyinfo.Service = "IntelliModz";
    //this.companyinfo.Service = "Google Drive";
    switch (this.companyinfo.Service) {
      case "Share Point":
        //this.DocumentService.postAndGetResponse(req)// intellimodz
        this.SharepointDownload(req)
          //this.DocumentService.DropBoxDownload(req)// DropBoxDownload
          .then(res => {
            if (res) {
              if (res.status == 0) {
                if (res.message == "Restricted" || res.message == "NoRights") {
                  this.MessageService.clear();
                  this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
                }
                else {
                  this.MessageService.clear();
                  this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
                }
              }
              else if (res.status == 2) {
                var url = window.URL.createObjectURL(new Blob([res.result], { type: res.message }));
                window.open(url);
                window.URL.revokeObjectURL(url);
              }
              else {
                console.log("result", res)
                var url = window.URL.createObjectURL(new Blob([res.result], { type: res.message }));
                //window.open(url);
                var a = document.createElement('a');
                document.body.appendChild(a);
                a.setAttribute('style', 'display: none');
                a.href = url;
                a.download = c.linkDoc;
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove(); // remove the element
              }
            }
          });
        break;
      case "Google Drive":
        this.GDriveDownload(req)
          .then(res => {
            if (res) {
              if (res.status == 0) {
                if (res.message == "Restricted" || res.message == "NoRights") {
                  this.MessageService.clear();
                  this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
                }
                else {
                  this.MessageService.clear();
                  this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
                }
              }
              else if (res.status == 2) {
                var url = window.URL.createObjectURL(new Blob([res.result], { type: res.message }));
                window.open(url);
                window.URL.revokeObjectURL(url);
              }
              else {
                console.log("result", res)
                var url = window.URL.createObjectURL(new Blob([res.result], { type: res.message }));
                //window.open(url);
                var a = document.createElement('a');
                document.body.appendChild(a);
                a.setAttribute('style', 'display: none');
                a.href = url;
                a.download = c.linkDoc;
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove(); // remove the element
              }
            }
          });
        break;
      case "OneDrive":

        this.OneDriveDownload(req)
          .then(res => {
            if (res) {
              if (res.status == 0) {
                if (res.message == "Restricted" || res.message == "NoRights") {
                  this.MessageService.clear();
                  this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
                }
                else {
                  this.MessageService.clear();
                  this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
                }
              }
              else if (res.status == 2) {
                var url = window.URL.createObjectURL(new Blob([res.result], { type: res.message }));
                window.open(url);
                window.URL.revokeObjectURL(url);
              }
              else {
                console.log("result", res)
                var url = window.URL.createObjectURL(new Blob([res.result], { type: res.message }));
                //window.open(url);
                var a = document.createElement('a');
                document.body.appendChild(a);
                a.setAttribute('style', 'display: none');
                a.href = url;
                a.download = c.linkDoc;
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove(); // remove the element
              }
            }
          });
        break;

      case "DropBox":
        this.DropBoxDownload(req)// DropBoxDownload
          .then(res => {
            if (res) {
              if (res.status == 0) {
                if (res.message == "Restricted" || res.message == "NoRights") {
                  this.MessageService.clear();
                  this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
                }
                else {
                  this.MessageService.clear();
                  this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
                }
              }
              else if (res.status == 2) {
                var url = window.URL.createObjectURL(new Blob([res.result], { type: res.message }));
                window.open(url);
                window.URL.revokeObjectURL(url);
              }
              else {
                console.log("result", res)
                var url = window.URL.createObjectURL(new Blob([res.result], { type: res.message }));
                //window.open(url);
                var a = document.createElement('a');
                document.body.appendChild(a);
                a.setAttribute('style', 'display: none');
                a.href = url;
                a.download = c.linkDoc;
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove(); // remove the element
              }
            }
          });
        break;

      default:
        //// intellimodz file downlaod
        this.MessageService.clear();
        if (!_.isEmpty(req)) {
          var fileName = req.LinkDoc;
          if (fileName != undefined && fileName != null && fileName != "") {
            var AccessType = this.GetDownloadOption()
            if (AccessType == 1) {
              this.GetDocumentUrlPath(req)
                .then(res => {
                  if (res) {
                    var msg = "";
                    var errormsg = "";
                    switch (res.message) {
                      case "1":
                        msg = "Document found";
                        errormsg = "success";
                        break;
                      case "2":
                        msg = "File Does Not Exists";
                        errormsg = "error";
                        break;
                      case "3":
                        msg = "Invalid storage path";
                        errormsg = "error";
                        break;
                      case "4":
                        msg = "Document not found.";
                        errormsg = "error";
                        break;
                      case "5":
                        msg = "Not having permission";
                        errormsg = "error";
                        break;
                      case "6":
                        msg = "Something wents wrong.";
                        errormsg = "error";
                        break;
                    }
                    if (res.status == 1) {
                      if (!_.isEmpty(res.result)) {
                        // var documenturl = res.result; 
                        var documenturl = AppConstant.API_ENDPOINT + AppConstant.FILE_LOCATION.DocumentFilePath + this.userinfo.EmployeeId + "/" + res.result;
                        setTimeout(() => {
                          window.open("https://docs.google.com/viewer?url=" + documenturl, "_blank");
                        }, 1000);
                      }
                    }
                    this.MessageService.clear();
                    this.MessageService.add({ severity: errormsg, summary: errormsg, detail: msg });
                  }
                });
            }
            // else if (AccessType == 2) {
            //   this.SaveDocumentDownloadFile(req)
            //     .then((res) => {
            //       if (res.status == 1) {
            //         window.open(this.clickOnceUrl, "_blank");
            //       }
            //       return false;
            //     })
            //     .catch((error) => {
            //       return false;
            //     });
            //   return false;
            // }
            else {
              var fileExtension = fileName.substr((fileName.lastIndexOf('.'))).toLowerCase();
              var contentType = fileMimeTypes.FileMimeTypes[fileExtension];
              if (contentType != null && contentType != undefined && contentType != "") {
                this.http.post(this.documentbase + "/DownloadAllFile", req, { responseType: "blob", headers: { 'Accept': contentType } })
                  .subscribe(blob => {
                    if (blob.size > 0) {

                      //var rights = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.DOCUMENTACCESSRIGHTS);
                      // if (rights == "Readonly") {
                      //   let fileUrl = window.URL.createObjectURL(blob);
                      //   let ofileUrl = URL.createObjectURL(blob);
                      //   if (fileExtension == '.pdf' || fileExtension == '.png' || fileExtension == '.txt' || fileExtension == '.json') {
                      //     open(fileUrl, "_blank");
                      //   }
                      // }
                      if (AccessType == 1) {
                        let fileUrl = window.URL.createObjectURL(blob);
                        let ofileUrl = URL.createObjectURL(blob);
                        if (fileExtension == '.pdf') {
                          setTimeout(() => {
                            open(fileUrl, "_blank");
                          }, 500);
                        }
                        else {
                          var fileURL = URL.createObjectURL(blob);
                          // open("https://docs.google.com/viewer?url=" + ofileUrl, "_blank");
                          // let fileUrl = window.URL.createObjectURL(blob);
                          // open(fileUrl, "_blank"); 
                        }
                      }
                      else {
                        setTimeout(() => {
                          saveAs(blob, fileName);
                        }, 500);
                      }
                    }
                  });
              }
            }
          }
        }




        // this.postAndGetResponsenew(req)// intellimodz
        //   .then(res => {
        //     if (res) {
        //       if (res.status == 0) {
        //         if (res.message == "Restricted" || res.message == "NoRights") {
        //           this.MessageService.clear();
        //           this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
        //         }
        //         else if (res.message == "Document not found.") {
        //           this.MessageService.clear();
        //           this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
        //         }
        //         else {
        //           this.MessageService.clear();
        //           this.MessageService.add({ severity: 'error', summary: 'Error', detail: res.message });
        //         }
        //       }
        //       else if (res.status == 2) {
        //         var url = window.URL.createObjectURL(new Blob([res.result], { type: res.message }));
        //         window.open(url, '_blank');
        //         //window.URL.revokeObjectURL(url);
        //       }
        //       else {
        //         //   console.log("result", res)
        //         //   var file = new Blob([res.result], { 
        //         //     type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        //         // });

        //         //var url = window.URL.createObjectURL(new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
        //         //window.open(url);.

        //         let blob = new Blob([res.fileContentResult.fileContents], { type: res.fileContentResult.contentType});
        //         let objectUrl = URL.createObjectURL(blob);
        //         // let iFrame = document.createElement('iframe');
        //         saveAs(blob, 'download.pdf');
        //         //open("https://docs.google.com/viewer?url=" + objectUrl, "_blank");



        //         // var url = window.URL.createObjectURL(res);
        //         // var a = document.createElement('a');
        //         // document.body.appendChild(a);
        //         // a.setAttribute('style', 'display: none');
        //         // a.href = url;
        //         // a.download = c.linkDoc;
        //         // a.click();
        //         // window.URL.revokeObjectURL(url);
        //         // a.remove(); // remove the element
        //       }
        //     }

        //   });



        break;
    }
  }

  GetDownloadOption() {
    var defaultDocAccessType = 1;
    var preference = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.PREFERENCESETTINGS);
    if (!_.isEmpty(preference)) {
      var defaultDocAccess = (preference.defaultDocAccess != undefined && preference.defaultDocAccess != null && preference.defaultDocAccess != "" ? preference.defaultDocAccess : 0);
      defaultDocAccessType = (preference.docAccessType != undefined && preference.docAccessType != null && preference.docAccessType == false ? defaultDocAccess : 0);
    }
    return defaultDocAccessType
    // this._subscriptions.add(
    //   this.CommonAppService.getPreferenceSettings().subscribe((preferencesettings) => {
    //     var defaultDocAccess = (preferencesettings.defaultDocAccess != undefined && preferencesettings.defaultDocAccess != null && preferencesettings.defaultDocAccess != "" ? preferencesettings.defaultDocAccess : 0);
    //     defaultDocAccessType = (preferencesettings.docAccessType != undefined && preferencesettings.docAccessType != null && preferencesettings.docAccessType == false ? defaultDocAccess : 0);
    //   }));

    //   // this.setTaskDefaultFilter(preference.taskDefaultFilter);
    //   defaultFliterOption = (preference.taskDefaultFilter == undefined || preference.taskDefaultFilter == null) ? 1 : preference.taskDefaultFilter;
    //   this.isPriority = (preference.isPriority == undefined || preference.isPriority == null) ? false : (preference.isPriority == true) ? true : false;
    // }
    // this._subscriptions.add(
    //   this.CommonAppService.getPreferenceSettings().subscribe((preferencesettings) => {
    //     this.setSelectedFilter(preferencesettings.taskDefaultFilter);
    //     this.isPriority = (preferencesettings.isPriority == undefined || preferencesettings.isPriority == null) ? false : (preferencesettings.isPriority == true) ? true : false;
    //   }));
  }
  ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }
}
