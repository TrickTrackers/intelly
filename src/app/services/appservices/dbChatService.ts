import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Rx';
import { CommonHttpService } from './../../shared/common-http.service';
import { HubConnection } from '@aspnet/signalr';
import * as signalR from '@aspnet/signalr';
import { ChatMessage, MessageDetails } from './../../Models/chatmessage.model';
import { AppConstant } from './../../app.constant';
import * as appSettings from './../../../assets/constant.json';
import { LocalStorageService } from './../../shared/local-storage.service';
import { ModuleService } from '../../services/module.services';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';
import { Router, Params } from '@angular/router';
@Injectable()
export class DbGroupService {
    ReceiveOnlineUserActivity = new Subject<any>();
    ReceiveAllOnlineUserList = new Subject<any>();
    Receivemessage = new Subject<any>();
    ReceiveNotification = new Subject<any>();
    ReceivePrivatemessage = new Subject<any>();
    ReceiveMessageHistory = new Subject<any>();
    connectionEstablished = new Subject<boolean>();
    unreadMsgCountSubject = new Subject<any>();
    SingleunreadMsgCountSubject = new Subject<any>();
    taskResponsibilitesSubject = new Subject<any>();
    TaskListNotification = new Subject<any>();
    public _hubConnection: HubConnection | undefined;
    private actionUrl: string;
    private hubUrl: string;
    private headers: HttpHeaders;
    public connectionIsEstablished = false;
    public userInfo: any;
    public unreadPvtMsgCountData: any;
    public userList: any;
    appSettings: any = appSettings;
    queryParamsObject: any = {};
    retryAttempt: number = 4;
    constructor(
        private http: HttpClient, public router: Router,
        private CommonHttpService: CommonHttpService, private LocalStorageService: LocalStorageService, public ModuleService: ModuleService, private MessageService: MessageService
    ) {
        this.actionUrl = this.appSettings.API_ENDPOINT;
        this.hubUrl = this.actionUrl + "dbChathub";
        this.userInfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
        //this.init();
        this.headers = new HttpHeaders();
        this.headers = this.headers.set('Content-Type', 'application/json');
        this.headers = this.headers.set('Accept', 'application/json');
        // var req= {
        //     toId : this.userInfo.employeeId
        // };
        // this.getunreadPvtMsgCount(req)
        // .then((res: any) => {
        //     if (res.status == 1) {
        //         this.unreadPvtMsgCountData=res.result;
        //     }
        //   }, error => {
        //     console.log("Error Happend");

        //   });
        this.router.routerState.root.queryParams.subscribe((params: Params) => {
            this.queryParamsObject = params;
        });
    }
    public getunreadCount() {
        return this.unreadPvtMsgCountData;
    }
    public setSingleUnreadCount(employee, messageData?) {
        var sameSender = false;
        if (messageData.fromId == this.userInfo.EmployeeId) {
            sameSender = true;
        }
        if (!sameSender) {
            var empUnreadCount = {
                displayName: employee.displayName,
                fromId: messageData.fromId,
                toId: messageData.toId,
                messageType: messageData.messageType,
                unreadcount: employee.notificationCount
            };
            this.SingleunreadMsgCountSubject.next(empUnreadCount);
        }
    }
    public setunreadCount(employee, messageData?) {
        var idx = _.findIndex(this.unreadPvtMsgCountData, (e) => {
            return (e.fromId == employee.employeeId)
        });
        var empUnreadCount = {
            displayName: employee.displayName,
            fromId: messageData.fromId,
            toId: messageData.toId,
            messageType: messageData.messageType,
            unreadcount: employee.notificationCount
        };
        if (idx > -1) {
            this.unreadPvtMsgCountData[idx] = empUnreadCount;
        }
        else {
            this.unreadPvtMsgCountData.push(empUnreadCount);
        }
        this.unreadMsgCountSubject.next(this.unreadPvtMsgCountData);
    }
    public removeUnreadCount(empId) {
        var idx = _.findIndex(this.unreadPvtMsgCountData, (e) => {
            return (e.fromId == empId)
        });
        if (idx > -1) {
            this.unreadPvtMsgCountData.splice(idx, 1);
            this.unreadMsgCountSubject.next(this.unreadPvtMsgCountData);
        }
    }
    // send(newsItem: NewsItem): NewsItem {
    //     if (this._hubConnection) {
    //         this._hubConnection.invoke('Send', newsItem);
    //     }
    //     return newsItem;
    // }
    public getunreadPvtMsgCount(data: any) {
        //     this.http
        //   .post(this.actionUrl + "/api/GroupMessage/GroupOperation",data)
        //   .subscribe(res => console.log(res));
        return this.CommonHttpService.globalPostService(this.actionUrl + "api/GroupMessage/unreadMessageCount", data)
            .then((res: any) => {
                if (res.status == 1) {
                    this.unreadPvtMsgCountData = res.result;
                    this.unreadMsgCountSubject.next(this.unreadPvtMsgCountData);
                }
                return res;
            });
    }
    public updateConnectionId(data: any) {
        return this.CommonHttpService.globalPostService(this.actionUrl + "api/GroupMessage/ChatConnection", data)
            .then(data => {
                return data;
            });
    }
    public getAllGroups(data: any) {
        //     this.http
        //   .post(this.actionUrl + "/api/GroupMessage/GroupOperation",data)
        //   .subscribe(res => console.log(res));
        return this.CommonHttpService.globalPostService(this.actionUrl + "api/GroupMessage/GroupOperation", data)
            .then(data => {
                return data;
            });
    }
    public GetGroupUserList(data: any) {
        //     this.http
        //   .post(this.actionUrl + "/api/GroupMessage/GroupOperation",data)
        //   .subscribe(res => console.log(res));
        return this.CommonHttpService.globalPostService(this.actionUrl + "api/GroupMessage/GetGroupUserList", data)
            .then(data => {
                return data;
            });
    }
    public GetGroupUserImageList(data: any) {
        //     this.http
        //   .post(this.actionUrl + "/api/GroupMessage/GroupOperation",data)
        //   .subscribe(res => console.log(res));
        return this.CommonHttpService.globalPostService(this.actionUrl + "api/GroupMessage/GetGroupUserImageList", data)
            .then((data: any) => {
                if (data) {
                    if (!_.isEmpty(data)) {
                        if (data.status == 1) {
                            this.userList = data.result;
                        }
                    }
                }
                return data;
            });
    }

    public createGroups(data: any): Promise<any> {
        return this.CommonHttpService.globalPostService(this.actionUrl + "api/GroupMessage/GroupOperation", data)
            .then(data => {
                return data;
            });
    }
    joinGroup(group: any): void {
        if (this._hubConnection) {
            if (this.checkAndRetryConnection()) {
                this._hubConnection.invoke('JoinGroup', group).catch(err => {
                    console.log("error join group", err);
                });
            }
            else {
                try {
                    this._hubConnection
                        .start();
                }
                catch (ex) {
                    console.log("issue on start connection.");
                }
            }

        }
    }
    GeneralNotification(notification: any): void {
        if (this._hubConnection) {
            if (this.checkAndRetryConnection()) {
                this._hubConnection.invoke('GeneralNotification', notification).catch(err => {
                    console.log("error on gn notification", err);
                });
            }
            else {
                try {
                    this._hubConnection
                        .start();
                }
                catch (ex) {
                    console.log("issue on start connection.");
                }
            }

        }
    }
    taskNotification(taskData: any, add: boolean): void {
        var notificationData = {
            notificationType: "UserAddedInTask",
            employeeId: taskData.employeeId
        };
        this.GeneralNotification(notificationData);
        //var employeeId = this.getOnlineUserList
    }
    public MessageOperation(data: any): Promise<any> {
        return this.CommonHttpService.globalPostService(this.actionUrl + "api/GroupMessage/MessageOperation", data)
            .then(data => {
                return data;
            });
    }
    public TagOperation(data: any): Promise<any> {
        return this.CommonHttpService.globalPostService(this.actionUrl + "api/GroupMessage/TagOperation", data)
            .then(data => {
                return data;
            });
    }
    public taskResponsibilitesUpdated(type?) {
        this.taskResponsibilitesSubject.next(true);
    }
    gettaskResponsibilitesUpdates(): Observable<any> { // obserbe new messages will oberb from subriber component ( inside of OnInit)
        return this.taskResponsibilitesSubject.asObservable();
    }
    checkAndRetryConnection(): boolean {
        var connected = false;
        var temphub: any = this._hubConnection;
        var connection: any = temphub.connection;
        if (connection.connectionState == 1) {
            connected = true;
        }
        else {
            this._hubConnection.stop();
            connected = false;
        }
        return connected;
    }
    leaveGroup(group: string): void {
        if (this._hubConnection) {
            this._hubConnection.invoke('LeaveGroup', group).catch(err => {
                console.log("error on leave group", err);
            });;
        }
    }
    SendGroupMessage(messageObject: any): void {
        if (this._hubConnection) {
            if (this.checkAndRetryConnection()) {
                try {
                    this._hubConnection.invoke('SendGroupMessage', messageObject).catch(err => {
                        console.log("error on send groupmessage", err);
                    });;
                }
                catch (e) {
                    console.log("error", e);
                }
            }
            else {
                try {
                    this._hubConnection
                        .start();
                }
                catch (ex) {
                    console.log("issue on start connection.");
                }
                console.log("Chat server disconnected.");
            }

        }
    }
    SendPrivateMessage(messageObject: any): void {
        if (this._hubConnection) {
            if (this.checkAndRetryConnection()) {
                try {
                    this._hubConnection.invoke('SendPrivateMessage', messageObject).catch(err => {
                        console.log("error on sending private message", err);
                    });
                }
                catch (e) {
                    console.log("error", e);
                }
            }
            else {
                try {
                    this._hubConnection
                        .start();
                }
                catch (ex) {
                    console.log("issue on start connection.");
                }
                console.log("Chat server disconnected.");
            }


        }
    }
    checkConnectionState(): Observable<any> {
        return this.connectionEstablished.asObservable();
    }
    getunreadMsgCount(): Observable<any> { // obserbe new messages will oberb from subriber component ( inside of OnInit)
        return this.unreadMsgCountSubject.asObservable();
    }
    getSingleUnreadMsgCount(): Observable<any> { // obserbe new messages will oberb from subriber component ( inside of OnInit)
        return this.SingleunreadMsgCountSubject.asObservable();
    }

    getNewMessages(): Observable<any> { // obserbe new messages will oberb from subriber component ( inside of OnInit)
        return this.Receivemessage.asObservable();
    }
    getNotification(): Observable<any> {
        return this.ReceiveNotification.asObservable();
    }
    getReceivePrivateMessages(): Observable<any> { // obserbe new messages will oberb from subriber component ( inside of OnInit)
        return this.ReceivePrivatemessage.asObservable();
    }
    getOldMessages(): Observable<any> { // obserbe selectmodule will oberb from subriber component ( inside of OnInit)
        return this.ReceiveMessageHistory.asObservable();
    }
    getOnlineUserList(): Observable<any> {
        return this.ReceiveOnlineUserActivity.asObservable();
    }
    getAllOnlineUserList(): Observable<any> {
        return this.ReceiveAllOnlineUserList.asObservable();
    }
    public init() {
        this.createConnection();
        setTimeout(() => {
            this._hubConnection.on('ShowUsersOnlineOffLine', (data: any) => {
                console.log("ShowUsersOnlineOffLine: ", data);
                this.ReceiveOnlineUserActivity.next(data);
            });
            this._hubConnection.on('ShowAllUsersOnline', (data: any) => {
                console.log("ShowAllUsersOnlineOffLine: ", data);
                this.ReceiveAllOnlineUserList.next(data);
            });
            this._hubConnection.on('Send', (data: any) => {
                console.log("Message received: ", data);
            });
            this._hubConnection.on('SendPrivateMessage', (res: any) => {
                console.log('receivedPrivateMsg');
                console.log(res);
                if (res.type == "PVT_MSG") {
                    this.ReceivePrivatemessage.next(res.data);
                }

                //  this.Receivemessage.emit(data);
            });
            this._hubConnection.on('SendGroupMessage', (data: any) => {
                console.log('received group message');
                console.log(data);
                this.Receivemessage.next(data);
                //  this.Receivemessage.emit(data);
            });
            this._hubConnection.on('SendGroupNotification', (data: any) => {
                console.log('received group notification');
                console.log(data);
                this.ReceiveNotification.next(data);
                //  this.Receivemessage.emit(data);
            });
            this._hubConnection.on('JoinGroup', (data: string) => {
                console.log('received group join info');
                console.log(data);
            });

            this._hubConnection.on('LeaveGroup', (data: string) => {
                console.log('group leaving recieved data from the hub');
                console.log(data);
            });

            this._hubConnection.on('sendReceiveHistory', (data, members) => {
                var respone = {
                    messages: data,
                    members: members
                }
                console.log('recieved history from the hub');
                this.ReceiveMessageHistory.next(respone);
                console.log(data);
            });
            this._hubConnection.on('GeneralNotification', (data) => {
                console.log('recieved notification');
                this.ReceiveNotification.next(data);
                if (data.type = "ResponsibilityUpdated") {

                }
                console.log(data);
            });
            this._hubConnection.on('MPGroupUpdates', (data) => {
                var notification: any = data;
                var onSameModule = false;
                var selectedLego = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
                var userinfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
                if (notification.notificationType == 'USERRIGHTS_update') {
                    if (notification.data == selectedLego) {
                        onSameModule = true;
                    }
                }
                else if (notification.notificationType == 'EMPRIGHTS_update') {
                    if (notification.data.employeeId != userinfo.EmployeeId) {
                        if (this.queryParamsObject['mode'] == 'E') {
                            onSameModule = true;
                        }
                    }
                }
                else {
                    if (!_.isEmpty(notification.data)) {

                        var exist = _.find(notification.data, (g) => {
                            return (g.legoId == selectedLego)
                        });
                        if (!_.isEmpty(exist)) {
                            onSameModule = true;
                        }
                    }
                }
                if (onSameModule == true) {
                    if (notification.notificationType == 'EMPRIGHTS_update') {
                        var tab_querystring = _.clone(this.queryParamsObject);
                        tab_querystring['t'] = 'stab_details_processinfo';
                        this.router.navigate(['/details'], { queryParams: tab_querystring });
                    }
                    else {
                        this.ModuleService.setModules();
                    }
                    this.MessageService.add({ severity: 'info', summary: 'Info', detail: "Your rights have been updating please wait for a moment.." });
                }
                console.log('MPGroupUpdates notification');
            });

            this.startConnection();
        }, 2000);
    }

    private createConnection() {
        // var options: any = {
        //     skipNegotiation: true,
        //     transport: signalR.HttpTransportType.None
        // };
        var options = {
            //skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
            // logging: signalR.LogLevel.Trace,
            //   accessTokenFactory: () => accessToken
        };
        this._hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(this.hubUrl, options)
            .configureLogging(signalR.LogLevel.Information)
            .build();
        this._hubConnection.serverTimeoutInMilliseconds = 30000;
    }
    private startConnection(): void {
        this._hubConnection
            .start()
            .then((connectionData) => {
                this.userInfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
                this.connectionIsEstablished = true;
                console.log('Hub connection started', connectionData);
                var conn_req = {
                    employeeId: this.userInfo.EmployeeId,
                    userName: this.userInfo.username,
                    companyId: this.userInfo.CompanyId,
                    options: 1
                };
                this._hubConnection.invoke('OnConnectedAsync', conn_req).then(() => {
                    this.connectionEstablished.next(true);
                }).catch(err => {
                    console.log("error on gn notification", err);
                });

            })
            .catch(err => {
                console.error(err.toString());
                this.abortConnection();
                this.connectionIsEstablished = false;
                this.connectionEstablished.next(false);
                console.log('Error while establishing connection, retrying...');
                if (this.retryAttempt > 0) {
                    this.retryAttempt -= 1;
                    setTimeout(() => this.startConnection(), 5000);
                }

            });
    }

    public abortConnection(): void {
        if (this._hubConnection) {
            if (this.checkAndRetryConnection()) {
                try {
                    var data = {
                        employeeId: this.userInfo.EmployeeId,
                        userName: this.userInfo.username,
                        companyId: this.userInfo.CompanyId,
                        options: 1
                    };
                    this._hubConnection.invoke('OnDisconnected', data).then(() => {
                        this._hubConnection.stop();
                    }).catch(err => {
                        console.log("error on abort connection", err);
                    });
                }
                catch (ex) {
                }
            }
        }
    }
    // private registerOnServerEvents(): void {
    //     this._hubConnection.on('Send', (data: any) => {
    //       console.log('Data received:' + data);
    //       this.messageReceived.emit(data);
    //     });
    //   }
}