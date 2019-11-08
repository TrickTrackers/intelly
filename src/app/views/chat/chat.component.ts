import { Component, NgZone, OnInit, Input, EventEmitter, Output, OnChanges, OnDestroy, SimpleChanges, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ChatGroup } from './../../Models/chatmessage.model';
import { DbGroupService } from './../../services/appservices/dbChatService';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as $ from 'jquery';
import { AppConstant } from './../../app.constant';
import { LocalStorageService } from './../../shared/local-storage.service';
import { MasterService } from './../../services/master.service';
import { Subscription } from 'rxjs/Subscription';
import { TabView, TabPanel } from 'primeng/primeng';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';
import { MessageService } from 'primeng/components/common/messageservice';
// import { ScrollToService } from '../../scrolls/scrollTo.service';
import { DomSanitizer } from '@angular/platform-browser';
import { setTimeout } from 'timers';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush
})

export class ChatComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild("chatTabview") chatTabview: TabView;
  @ViewChild("SysteimTabPane") SysteimTabPane: TabPanel;
  @ViewChild(ContextMenuComponent) public contextMenu: ContextMenuComponent;
  @Input() currentTab = null;
  @Input() TabType = 'SYS_TAB';
  chatGroup: ChatGroup;
  canSendMessage: boolean;
  groupname: string;
  searchgroupname: string;
  systemGroupName: string;
  MessageContent: string;
  TaskMessageContent: string;
  PrivateMessageContent: string;
  systemTabMessageContent: string;
  display_addMessageTag: boolean = false;
  groupList: any = [];
  userList: any = [];
  onlineUserList: any = [];
  privateMessageList: any = [];
  filteredUserMultiple: any = [];
  taggedMessageDetails: any = [];
  selectedTabIndex = -1;
  selectedGroupTabIndex = -1;
  selectedprivateTabIndex = -1;
  showPvtMessages = false;
  selectedPrivateUser: any = {};
  selectedGroup: any = {};
  selectedModuleId = 0;
  systemTabHeader = "";
  selectedTagName: string = "";
  selectedMessage: any = null;
  selectedTaskIndex = -1;
  AddSelectedTag = null;
  lazyLoadPageLimit = 1000;
  tempGroupLabelName = "";
  public userInfo: any;
  myemployeeId: any;
  public searchusername = "";
  public employeeList = [];
  private _subscriptions = new Subscription();
  private dotnetFullDateFormat = AppConstant.API_CONFIG.DATE.dotnetFullDateFormat;
  private apiFullDateFormat = AppConstant.API_CONFIG.ANG_DATE.apiTSFormat;
  public systemTabChatGroups: any = [];
  private showsystemTabReplyMsg: boolean = false;
  private selectedReplyToSysTabMsg: any;
  public isreply: boolean = false;
  public selectedTagInfo: any = [];
  public unreadPvtMsgCountData: any;
  public chatRightMenuAction = [
    {
      html: (item) => {
        return `<span class="context-icon">
            <i class="fa fa-mail-reply"></i>
        </span>
        <span class="context-title">Reply</span>`;
      },
      click: (event) => {
        console.log("reply to", event);
        this.setReplyTo(event.item);
        return;
      },
      enabled: (item) => true,
      visible: (item) => true,
    },
    {
      html: (item) => {
        return `<span class="context-icon">
            <i class="fa fa-trash-o"></i>
        </span>
        <span class="context-title">Delete</span>`;
      },
      click: (event) => {

      },
      enabled: (item) => {
        var enabled = true;

        return enabled;
      },
      visible: (item) => true,
    },
    {
      html: (item) => {
        return `<span class="context-icon">
            <i class="fa fa-tags"></i>
        </span>
        <span class="context-title">Tag</span>`;
      },
      click: (event) => {

      },
      enabled: (item) => {
        var enabled = true;
        return enabled;
      },
      visible: (item) => true,
    }
  ];
  sidebarMenuitems: any = [
    {
      label: 'Messages',
      icon: 'fa fa-wechat',
      expanded: true,
      items: [
        {
          label: 'Sub Module',
          icon: 'fa fa-tags ',
          id: 0,
          type: "SYS_TAB",
        },
        {
          label: 'Work Flow',
          icon: 'fa fa-tags ',
          id: 1,
          type: "SYS_TAB",
        },
        {
          label: 'Connections',
          icon: 'fa fa-tags ',
          id: 2,
          type: "SYS_TAB",
        },
        {
          label: 'Documents',
          icon: 'fa fa-tags ',
          id: 3,
          type: "SYS_TAB",
        },
        {
          label: 'Strategy',
          icon: 'fa fa-tags ',
          id: 4,
          type: "SYS_TAB",
        },
        {
          label: 'Assessment',
          icon: 'fa fa-tags ',
          id: 5,
          type: "SYS_TAB",
        },
        {
          label: 'Performance',
          icon: 'fa fa-tags ',
          id: 6,
          type: "SYS_TAB",
        },
        {
          label: 'Collaboration',
          icon: 'fa fa-tags ',
          id: 7,
          type: "SYS_TAB",
        },
        {
          label: 'Details',
          icon: 'fa fa-tags ',
          id: 8,
          type: "SYS_TAB",
        },
        {
          label: 'All',
          icon: 'fa fa-tags ',
          id: 9,
          type: "SYS_TAB",
        }
      ]
    },
    {
      label: 'Tasks',
      icon: 'fa fa fa-tasks',
      expanded: true,
      items: [

      ]
    },
    {
      label: 'Tags',
      icon: 'fa fa fa-bookmark',
      expanded: true,
      items: [

      ]
    }];
  constructor(
    public DbGroupService: DbGroupService,
    private LocalStorageService: LocalStorageService,
    private _ngZone: NgZone,
    private MasterService: MasterService,
    private contextMenuService: ContextMenuService,
    private messageService: MessageService,
    // private ScrollToService: ScrollToService,
    private datePipe: DatePipe,
    private _sanitizer: DomSanitizer,
    private cd: ChangeDetectorRef
  ) {
    this.userInfo = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.USERINFO);
    this.myemployeeId = parseInt(this.userInfo.EmployeeId);
    this.selectedModuleId = this.LocalStorageService.getItem(AppConstant.API_CONFIG.LOCALSTORAGE.SelectedModuleId);
    this.systemTabChatGroups = [
      { sysTabid: 0, labelName: "Submodules", messages: [] },
      { sysTabid: 1, labelName: "Work Flow", messages: [] },
      { sysTabid: 2, labelName: "Connections", messages: [] },
      { sysTabid: 3, labelName: "Documents", messages: [] },
      { sysTabid: 4, labelName: "Strategy", messages: [] },
      { sysTabid: 5, labelName: "Assessment", messages: [] },
      { sysTabid: 6, labelName: "Performance", messages: [] },
      { sysTabid: 7, labelName: "Collaboration", messages: [] },
      { sysTabid: 8, labelName: "Details", messages: [] },
      { sysTabid: 9, labelName: "All", messages: [] },
    ];
    this.systemGroupName = "#company" + this.userInfo.CompanyId;
  }

  changeGroupTab(tabindex) {
    this.selectedTabIndex = tabindex;
  }
  public ngOnChanges(changes: SimpleChanges): void {
    for (let propName in changes) {
      let change = changes[propName];
      if (propName == "currentTab") {
        console.log(changes);

      }
    }
  }
  ngOnInit() {
    this.getEmployeeList();
    this.getGroupList();
    setTimeout(() => {
      this.subscribeToEvents();
      //this.DbGroupService.init();
      this.loadSystemTab();
      var req = {
        userId: parseInt(this.userInfo.EmployeeId),
        options: 2
      }
      this.crudTagOperation(req);
      this.loadTaskList();
    }, 1000);
    if (this.DbGroupService.connectionIsEstablished == true) {
      this.canSendMessage = true;
    }
    //   this.DbGroupService.getNewMessages().subscribe(updates => {
    //     // this.cartcount = count;
    //     console.log("Module updates(submodulepage):", updates);
    //     this.getTreeModules();
    // });

  }
  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    this.cd.detach();
  }
  onselectSystemTab(event, item, idx) {
    this.selectedTaskIndex = -1;
    $(".sidebar_navlink").each(function (index) {
      $(this).removeClass('active');
    });
    this.TabType = item.type;
    if (this.TabType == "SYS_TAB") {
      this.currentTab = item.id;
      this.loadSystemTab();
    }
    else if (this.TabType == "CUS_TASKS") {
      this.currentTab = item.id;
      this.selectedTaskIndex = idx;
      this.loadTasksMessages();
    }
    else if (this.TabType == "CUS_TAG") {
      this.selectedTagInfo = item;
      this.loadTaggedMessages(item);

    }
    $(event.currentTarget).addClass('active');
  }
  setReplyTo(message) {
    // style change 
    this.isreply = true;
    this.selectedReplyToSysTabMsg = message;
    this.showsystemTabReplyMsg = true;
    $("#systemTabMessageContent").focus();
  }
  closeReplyMsg() {
    this.showsystemTabReplyMsg = false;
    this.selectedReplyToSysTabMsg = {};
  }
  loadSystemTab() {

    switch (this.currentTab) {
      case 0:
        this.systemTabHeader = "submodules";
        break;
      case 1:
        this.systemTabHeader = "Work Flow";
        break;
      case 2:
        this.systemTabHeader = "Connections";
        break;
      case 3:
        this.systemTabHeader = "Documents";
        break;
      case 4:
        this.systemTabHeader = "Strategy";
        break;
      case 5:
        this.systemTabHeader = "Assessment";
        break;
      case 6:
        this.systemTabHeader = "Performance";
        break;
      case 7:
        this.systemTabHeader = "Collaboration";
        break;
      case 8:
        this.systemTabHeader = "Details";
        break;
      default:
        this.currentTab = 9;
        this.systemTabHeader = "All";
        break;
    }
    this.chatTabview.tabs[2].header = this.systemTabHeader;
    this.OnSystemTabChange();
    // this.chatTabview.tabs = [...this.chatTabview.tabs];
    $("#sidebar_panelmenu #" + this.currentTab).addClass('active');
    console.log(this.chatTabview);
  }

  getdisplayMessageTag(selectedMessage, overlayPanel, $event) {
    this.selectedMessage = selectedMessage;
    //this.display_addMessageTag = true;
    overlayPanel.toggle($event)
  }
  loadTasksMessages() {
    // this.selectedTaskIndex=t
    var req = {
      fromId: parseInt(this.userInfo.EmployeeId),
      toId: this.currentTab,
      moduleId: this.selectedModuleId,
      messageType: 3,
      options: 8
    };
    this.DbGroupService.MessageOperation(req)
      .then((res: any) => {
        this.sidebarMenuitems[1].items[this.selectedTaskIndex].messages = [];
        if (res.status == 1) {
          // this.systemTabChatGroups[this.currentTab].messages = res.result;
          console.log("raw messages", res.result);
          this.unFlatternMessages(this.sidebarMenuitems[1].items[this.selectedTaskIndex].messages, _.cloneDeep(res.result));
        }
        else {
          //  tasks.messages = [];
        }
      }, error => {
        console.log("Error Happend");

      })
  }
  OnSelectTagMessage(event, overlayPanel) {
    console.log(event);
    var selectedTag = event.data;
    var req = {
      tagId: selectedTag.id, // user id
      messageId: this.selectedMessage.messageId,
      fromId: parseInt(this.userInfo.EmployeeId),
      createdDate: moment(new Date(), this.dotnetFullDateFormat),
      options: 10
    };
    this.DbGroupService.MessageOperation(req)
      .then((res: any) => {
        this.AddSelectedTag = null;
        if (res.status == 1) {
          // this.systemTabChatGroups[this.currentTab].messages = res.result;
          // console.log("tagged messages", res.result);
          // var tag = _.find(this.sidebarMenuitems[1],(t)=>{
          //   return (t.id = selectedTag.id)
          // })
          // if(! _.isEmpty(tag))
          // {
          //   tag.messages.push(res.result[0]);
          // }

        }
        else {
          this.taggedMessageDetails = [];
        }
        overlayPanel.hide();
      }, error => {
        console.log("Error Happend");

      });
  }
  loadTaggedMessages(item) {
    this.taggedMessageDetails = [];
    this.chatTabview.tabs[2].header = item.label;

    var req = {
      tagId: item.id, // user id
      options: 9
    };
    this.DbGroupService.MessageOperation(req)
      .then((res: any) => {
        if (res.status == 1) {
          // this.systemTabChatGroups[this.currentTab].messages = res.result;
          console.log("tagged messages", res.result);
          this.unFlatternMessages(this.taggedMessageDetails, _.cloneDeep(res.result));
        }
        else {
          //  this.taggedMessageDetails = [];
        }
      }, error => {
        console.log("Error Happend");

      });
  }
  getEmployeeList() {
    var req = {
      "companyId": this.userInfo.CompanyId,
      "options": 5
    };
    this.DbGroupService.GetGroupUserImageList(req)
      .then((res: any) => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              //this.unreadPvtMsgCountData = this.DbGroupService.getunreadCount();
              console.log("Employee List", this.onlineUserList);
              // this.userList = this.MasterService.formatDataforDropdown("userName",_.cloneDeep(res.result),"");
              this.userList = _.cloneDeep(res.result);
              this.onlineUserList = _.filter(_.cloneDeep(res.result), (emp: any) => {
                emp.messages = [];
                emp.notificationCount = 0;
                emp.isActive = false;
                emp.cId = 0;
                emp.connectionID = "";
                emp.isOnline = false;
                emp.employeeId = emp.userId;
                return (emp.userId != this.userInfo.EmployeeId)
              });
              if (this.onlineUserList.legnth > 0) {
                // setTimeout(() => {
                //   this.OnPrivatechatChange(this.onlineUserList[0]);
                // }, 3000);

              }
              // this.userList=res.result;
              this.unreadPvtMsgCountData = this.DbGroupService.getunreadCount();
              this.formatUnreadCount();
            }
          }

        }
      }, error => {
        console.log("Error Happend");

      })
  }
  getGroupUserList(group: any) {
    var req = {
      "groupId": group.groupId,
      "options": 4
    };
    this.DbGroupService.GetGroupUserList(req)
      .then((res: any) => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              group.groupMembers = res.result;
            }
          }

        }
      }, error => {
        console.log("Error Happend");

      })
  }
  getGroupList() {
    var req = {
      companyId: this.userInfo.CompanyId,
      groupOwnerId: this.userInfo.EmployeeId,
      options: 1
    };
    this.DbGroupService.getAllGroups(req)
      .then((res: any) => {
        if (res.status == 1) {
          this.groupList = res.result;
          console.log("group list: ", res);
          // this.OnGroupChange(0);

        }
      }, error => {
        console.log("Error Happend");

      })
  }
  CreateGroup() {
    this.groupname = _.trim(this.groupname);
    if (this.groupname != "") {
      var req = {
        groupName: this.groupname,
        GroupAccessType: 1,
        companyId: this.userInfo.CompanyId,
        groupOwnerId: this.userInfo.EmployeeId,
        moduleId: this.selectedModuleId,
        options: 3
      };
      this.DbGroupService.createGroups(req)
        .then(res => {
          if (res.status == 1) {
            console.log("group added: ", res.result);
            var groupdetails = res.result[0];
            var selfuser = _.find(this.userList, (em) => {
              return (em.userId == this.userInfo.EmployeeId)
            })
            if (!_.isEmpty(selfuser)) {
              groupdetails.groupMembers = [];
              groupdetails.groupMembers.push(selfuser);
            }
            this.groupList.push(groupdetails);
            // this._subscriptions.unsubscribe();
            // this.DbGroupService.init();
            //  this.subscribeToEvents();
            // setTimeout(() => {
            //   this.OnGroupChange(this.groupList.length - 1);
            // }, 500);
            this.groupname = "";
          }
        }, error => {
          console.log("Error Happend");
        });
    }
  }
  deleteGroup(group) {
    console.log(group)
    var req = {
      groupId: group.groupId,
      groupOwnerId: this.userInfo.EmployeeId,
      options: 8
    };
    this.DbGroupService.getAllGroups(req)
      .then((res: any) => {
        if (res.status == 1) {
          //this.groupList = res.result;
          var index = _.findIndex(this.groupList, (g) => {
            return (g.groupId == group.groupId)
          })
          this.groupList.splice(index, 1);
          this.groupList = [...this.groupList];
          if (this.groupList.length > 0) {
            this.OnGroupChange(0);
          }
          else {
            this.selectedGroupTabIndex = -1;
          }

        }
      }, error => {
        console.log("Error Happend");

      });
  }
  EditGroupsetFocus(group: any) {
    group.isEditable = true;
    this.tempGroupLabelName = _.clone(group.labelName);
    setTimeout(() => {
      $("#renamegroup_" + group.groupId).focus();
    }, 100);
  }
  EditGroup(group) {
    group.labelName = _.trim(group.labelName);
    if (group.labelName != "") {
      var req = {
        groupId: group.groupId,
        groupName: group.labelName,
        groupOwnerId: this.userInfo.EmployeeId,
        options: 9
      };
      this.DbGroupService.getAllGroups(req)
        .then((res: any) => {
          if (res.status == 1) {
            var g = res.result;
            group.groupName = g.labelName;
          }
          else {
            group.labelName = _.trim(this.tempGroupLabelName);
          }
        }, error => {
          console.log("Error Happend");
          group.labelName = _.trim(this.tempGroupLabelName);

        });
    }
    else {
      group.labelName = _.trim(this.tempGroupLabelName);
    }
    group.isEditable = false;
    this.tempGroupLabelName = "";
  }
  OnGroupChange(index) {
    this.selectedGroupTabIndex = index;
    this.selectedGroup = this.groupList[index];
    var req = {
      groupId: this.selectedGroup.groupId,
      groupName: this.selectedGroup.groupName,
      companyId: this.userInfo.CompanyId,
      moduleId: this.selectedGroup.moduleId,
      userId: this.userInfo.EmployeeId,
    };
    if (this.canSendMessage) {
      this.DbGroupService.joinGroup(req);
    }
    else {
      this.DbGroupService.init();
    }
    setTimeout(() => {
      var grpchat_panel = $("#grpchat_panel .msg_body_outer");
      grpchat_panel.scrollTop(grpchat_panel.prop("scrollHeight"));
    }, 500);
    // this.getGroupUserList(group);
  }
  OnSystemTabChange() {
    var offset = this.systemTabChatGroups[this.currentTab].messages.length;
    var req = {
      fromId: parseInt(this.userInfo.EmployeeId),
      toId: this.currentTab,
      moduleId: this.selectedModuleId,
      messageType: 2,
      options: 8,
      limit: this.lazyLoadPageLimit,
      offset: offset
    };
    this.DbGroupService.MessageOperation(req)
      .then((res: any) => {
        this.systemTabChatGroups[this.currentTab].messages = [];
        if (res.status == 1) {
          // this.systemTabChatGroups[this.currentTab].messages = res.result;
          console.log("raw messages", res.result);
          _.each(res.result, (msg) => {

          })
          this.unFlatternMessages(this.systemTabChatGroups[this.currentTab].messages, _.cloneDeep(res.result));
        }

      }, error => {
        this.systemTabChatGroups[this.currentTab].messages = [];
        console.log("Error Happend");

      })
  }
  selectTag() {

  }
  loadTaskList() {
    // this.TagOperation(3, null)
    var req = {
      userId: parseInt(this.userInfo.EmployeeId),
      moduleId: this.selectedModuleId,
      options: 3
    }
    this.crudTagOperation(req)
  }
  EditTagProcess() {
    this.selectedTagInfo.isEditable = true;
    setTimeout(() => {
      $("#renametag_" + this.selectedTagInfo.id).focus();
    }, 100);
  }
  deleteTag(item) {
    var req = {
      tagId: item.id,
      userId: parseInt(this.userInfo.EmployeeId),
      options: 5
    };
    if (!_.isEmpty(req)) {
      this.crudTagOperation(req);
    }
  }

  EditTag(item) {
    var req = {
      tagId: item.id,
      tagName: item.label,
      options: 4
    };
    if (!_.isEmpty(req)) {
      this.crudTagOperation(req);
      this.selectedTagInfo.isEditable = false;
    }
  }

  TagOperation(options, selectedTag) {
    if (this.selectedTagName != "" && this.selectedTagName != null && this.selectedTagName != undefined) {
      var req = {
        tagName: this.selectedTagName,
        userId: parseInt(this.userInfo.EmployeeId),
        moduleId: this.selectedModuleId,
        createdDate: moment(new Date(), this.dotnetFullDateFormat),
        options: 1
      };
      if (!_.isEmpty(req)) {
        this.crudTagOperation(req);
      }
    }
  }
  crudTagOperation(req) {
    this.DbGroupService.TagOperation(req)
      .then((res: any) => {
        if (res.status == 1) {
          if (req.options == 1 || req.options == 2 || req.options == 5) {
            var tagId = (req.tagId != undefined && req.tagId != null) ? req.tagId : 0;
            this.formatTags(res.result, req.options, tagId);
          }
          if (req.options == 3) { // load task list
            this.formatTaskList(res.result);
          }
        }
        this.selectedTagName = "";
      }, error => {
        console.log("Error Happend");
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Tag operation failed." });
      })
  }
  formatTaskList(tags) {
    this.sidebarMenuitems[1].items = [];
    _.each(tags, (t) => {
      var formatedTag: any = {
        label: t.tagName,
        icon: 'fa fa-tasks',
        id: t.tagId,
        type: "CUS_TASKS",
        command: ($event) => {
          // this.delete();
          console.log("tag event", $event);
        },
        messages: []
      };
      this.sidebarMenuitems[1].items.push(formatedTag);
    });

  }
  formatTags(tags, option?, tagId?) {
    // if (option == 5) {
    //   if (tagId != 0) {
    //     var index = _.findIndex(this.sidebarMenuitems[2].items, (g) => {
    //       return (g.id == tagId)
    //     })
    //     this.sidebarMenuitems[2].items.splice(index, 0);
    //   }
    // }
    // else {
    _.each(tags, (t) => {
      var formatedTag = {
        label: t.tagName,
        icon: 'fa fa fa-bookmark',
        id: t.tagId,
        type: "CUS_TAG",
        command: ($event) => {
          // this.delete();
          console.log("tag event", $event);
        },
        messages: []
      };
      this.sidebarMenuitems[2].items.push(formatedTag);
    });
    // }

  }
  OnPrivatechatChange(index) {
    this.selectedprivateTabIndex = index;
    this.showPvtMessages = true;
    this.selectedPrivateUser = this.onlineUserList[index];
    this.onlineUserList[index].notificationCount = 0;
    this.DbGroupService.removeUnreadCount(this.onlineUserList[index].employeeId);
    // this.selectedPrivateUser = selectedUser;
    var req = {
      fromId: parseInt(this.userInfo.EmployeeId),
      toId: this.selectedPrivateUser.userId,
      moduleId: this.selectedModuleId,
      messageType: 0,
      options: 7
    };
    this.DbGroupService.MessageOperation(req)
      .then((res: any) => {
        if (res.status == 1) {
          this.selectedPrivateUser.messages = res.result;
          var unreadMsg = _.filter(this.selectedPrivateUser.messages, (msg) => {
            return (msg.isViewed == 0);
          });
          setTimeout(() => {
            var pvtUser_panel = $("#pvtUser_panel .msg_body_outer");
            pvtUser_panel.scrollTop(pvtUser_panel.prop("scrollHeight"));
            if (!_.isEmpty(unreadMsg)) {
              if (unreadMsg.length > 0) {
                var formated = _.map(unreadMsg, (m) => {
                  return m.messageId
                })
                this.updateMessageAsViewed(formated);
              }
            }
          }, 500);

        }
      }, error => {
        console.log("Error Happend");

      });
    $("#private_chat .chat_list").each(function (element) {
      $(this).removeClass("active_chat");
    });
    if ($("#private_chat .chat_list").length > 0) {
      $($("#private_chat .chat_list")[index]).addClass("active_chat");
    }
  }
  sendGroupMessage(group) {
    if (this.canSendMessage) {
      var msg = {
        MessageContent: this.MessageContent,
        fromId: parseInt(this.userInfo.EmployeeId),
        toId: group.groupId,
        toName: group.groupName,
        moduleId: this.selectedModuleId,
        messageType: 1,
        isTagged: 0,
        isViewed: 0,
        // messageType : "",
        createdDate: moment(new Date(), this.dotnetFullDateFormat),
        options: 1
      };
      this.DbGroupService.SendGroupMessage(msg);
      this.MessageContent = "";
    }
    else {
      this.DbGroupService.init();
    }

  }
  sendSystemGroupMessage(messagetype) {
    if (this.canSendMessage) {
      var replyTo = 0;
      if (this.showsystemTabReplyMsg == true) {
        replyTo = this.selectedReplyToSysTabMsg.messageId;
        this.isreply = false;
      }
      var msg = {
        MessageContent: this.systemTabMessageContent,
        fromId: parseInt(this.userInfo.EmployeeId),
        toId: this.currentTab,
        toName: this.systemGroupName,
        moduleId: this.selectedModuleId,
        replyTo: replyTo,
        messageType: messagetype, // system tab message type
        isTagged: 0,
        isViewed: 0,
        // messageType : "",
        createdDate: this.datePipe.transform(new Date(), this.apiFullDateFormat),
        options: 1
      };
      this.DbGroupService.SendGroupMessage(msg);
      this.systemTabMessageContent = "";
    }
    else {
      this.DbGroupService.init();
    }

  }

  sendPrivateMessage(user: any) {
    if (this.canSendMessage) {
      var msg = {
        MessageContent: this.PrivateMessageContent,
        fromId: parseInt(this.userInfo.EmployeeId),
        toId: user.userId,
        fromName: this.userInfo.username,
        toName: user.userName,
        moduleId: this.selectedModuleId,
        replyTo: 0,
        messageType: 0,
        isTagged: 0,
        isViewed: 0,
        createdDate: this.datePipe.transform(new Date(), this.apiFullDateFormat),
        options: 1
      };
      this.DbGroupService.SendPrivateMessage(msg);
      this.MessageContent = "";
      this.PrivateMessageContent = "";
    }
    else {
      this.DbGroupService.init();
    }

  }
  public filterUserMultiple(event, group) {
    let query = event.query;
    let filtered: any[] = [];
    if (query != undefined && query != null) {
      filtered = _.filter(this.userList, (user) => {
        return (user.displayName.toLowerCase().indexOf(query.toLowerCase()) == 0);
      })
    }

    // for(let i = 0; i < this.userList.length; i++) {
    //     let user = this.userList[i];
    //     if(user.userName.toLowerCase().indexOf(query.toLowerCase()) == 0) {
    //         filtered.push(user);
    //     }
    // }
    this.filteredUserMultiple = filtered;
  }
  public onFocusAutocomplete(component: any) {
    this.filteredUserMultiple = this.userList;
    // component.show();
    $(component.dropdownButton.nativeElement).click()
  }
  public addRemoveGroupUsers(addorremove, selectedUser, group) {
    var req: any = {
      "groupId": group.groupId,
      "userId": selectedUser.userId
    };
    if (addorremove == true) {
      req.options = 6;
    }
    else if (addorremove == false) {
      req.options = 7;
    }
    this.DbGroupService.GetGroupUserList(req)
      .then((res: any) => {
        if (res) {
          if (!_.isEmpty(res)) {
            if (res.status == 1) {
              var groupMembers = res.result;
              //groupMembers = _.uniqBy(groupMembers, 'employeeId');
              group.groupMembers = groupMembers;
              if (addorremove == true) {
                var notificationData = {
                  notificationType: "UserAddedInGroup",
                  userName: selectedUser.userName,
                  data: group
                };
                this.DbGroupService.GeneralNotification(notificationData);
              }
            }
          }

        }
      }, error => {
        console.log("Error Happend");

      })
    console.log("addRemoveGroupUsers", selectedUser);
  }
  private updateMessageAsViewed(messages) {
    var multiMessageIds = _.join(messages, ',');
    var req = {
      MultiMessageIds: multiMessageIds,
      options: 11
    };
    this.DbGroupService.MessageOperation(req)
      .then((res: any) => {
        console.log("msg view status updated.");
      });
  }
  private subscribeToEvents(): void {

    this._subscriptions.add(
      this.DbGroupService.checkConnectionState().subscribe((ConnectionState) => {
        if (ConnectionState == false) {
          setTimeout(() => {
            // this.DbGroupService.init();
          }, 1000);
        }
        this.canSendMessage = ConnectionState;
      })
    );
    this._subscriptions.add(this.DbGroupService.getunreadMsgCount().subscribe(countData => {
      // this.cartcount = count;
      this.unreadPvtMsgCountData = countData;
      this.formatUnreadCount();
    }));
    // this._subscriptions.add(
    //   this.DbGroupService.connectionEstablished.subscribe((ConnectionState) => {
    //     this.canSendMessage = ConnectionState;
    //   })
    // );
    //subscribe group notification
    this._subscriptions.add(
      this.DbGroupService.getNotification().subscribe((notification: any) => {
        switch (notification.type) {
          case "USERONLINE":
            if (this.userInfo.employeeId != notification.data.employeeId) {
              console.log("User comes online", notification.data);
              var empIdx = _.findIndex(this.onlineUserList, (u) => {
                return (u.userId == notification.data.employeeId)
              });
              if (empIdx > -1) {
                this.onlineUserList[empIdx].isOnline = true;
                this.onlineUserList[empIdx].connectionID = notification.data.connectionID;
                setTimeout(() => {
                  if (this.cd !== null &&
                    this.cd !== undefined &&
                    !(this.cd["ChangeDetectorRef"])) {
                    this.cd.detectChanges();
                  }
                }, 250);
              }
            }
            break;
          case "UserAddedInGroup":
            console.log("User added in group", notification.data);
            this.messageService.add({ severity: 'Success', summary: 'Group Info', detail: "you have joined the group #" + notification.data.labelName });
            var groupInfo: any = notification.data;
            // delete groupInfo.groupMembers;
            this.groupList.push(groupInfo);
            setTimeout(() => {
              if (this.cd !== null &&
                this.cd !== undefined &&
                !(this.cd["ChangeDetectorRef"])) {
                this.cd.detectChanges();
              }
            }, 250);
            break;
          case "UserDisconnected":
            if (this.userInfo.employeeId != notification.data.employeeId) {
              var empIdx = _.findIndex(this.onlineUserList, (u) => {
                return (u.userId == notification.data.employeeId)
              });
              if (empIdx > -1) {
                this.onlineUserList[empIdx].isOnline = false;
                this.onlineUserList[empIdx].connectionID = notification.data.connectionID;
                setTimeout(() => {
                  if (this.cd !== null &&
                    this.cd !== undefined &&
                    !(this.cd["ChangeDetectorRef"])) {
                    this.cd.detectChanges();
                  }
                }, 250);
              }
            }
            break;
          case "UserAddedInTask":
            this.loadTaskList();
            break;
          default:
            break;
        }

      })
    );
    // subscribe online/offline user activity
    this._subscriptions.add(
      this.DbGroupService.getAllOnlineUserList().subscribe((listdata: any) => {
        // this._ngZone.run(() => {
        console.log("All users on line");
        var changesOccured = false;
        _.each(listdata, (o) => {
          var empIdx = _.findIndex(this.onlineUserList, (u) => {
            return (u.userId == o.employeeId)
          });
          if (empIdx > -1) {
            this.onlineUserList[empIdx].isOnline = true;
            this.onlineUserList[empIdx].connectionID = o.connectionID;
            changesOccured = true;
          }
        });
        if (changesOccured) {
          setTimeout(() => {
            if (this.cd !== null &&
              this.cd !== undefined &&
              !(this.cd["ChangeDetectorRef"])) {
              this.cd.detectChanges();
            }
          }, 250);
        }
      })
    );
    // subscribe online/offline user activity
    this._subscriptions.add(
      this.DbGroupService.getOnlineUserList().subscribe((listdata: any) => {
        if (!_.isEmpty(listdata)) {
          var onlineUser = _.filter(this.onlineUserList, (employee) => {
            return (employee.userId == listdata.employeeId)
          });
          if (!_.isEmpty(onlineUser)) {
            onlineUser.isOnline = true;
            onlineUser.connectionID = listdata.connectionID;
          };
        }
      })
    );
    // receive private message
    this._subscriptions.add(
      this.DbGroupService.getReceivePrivateMessages().subscribe((messageData: any) => {
        console.log("private message received: ", messageData);
        var messageUserId = messageData.fromId;
        var sameSender = false;
        if (messageData.fromId == this.userInfo.EmployeeId) {
          messageUserId = messageData.toId;
          sameSender = true;
        }
        var emp_index = _.findIndex(this.onlineUserList, (me) => {
          return (messageUserId == me.userId)
        });
        var employee = this.onlineUserList[emp_index];
        if (!_.isEmpty(employee)) {
          employee.messages.push(messageData);
          employee.messages = [...employee.messages];
          this.onlineUserList = [...this.onlineUserList];
          if (employee.userId == this.selectedPrivateUser.userId && $("#chat_sidebar").hasClass("chatbar_display") == true) {
            var idx = _.findIndex(this.onlineUserList, (e) => {
              return (e.userId == employee.userId)
            })
            this.selectedPrivateUser = this.onlineUserList[idx];
            this.selectedPrivateUser.messages = [...this.selectedPrivateUser.messages];
            employee.notificationCount = 0;
            setTimeout(() => {
              if (this.cd !== null &&
                this.cd !== undefined &&
                !(this.cd["ChangeDetectorRef"])) {
                this.cd.detectChanges();
              }
            }, 250);
            setTimeout(() => {
              var pvtUser_panel = $("#pvtUser_panel .msg_body_outer");
              pvtUser_panel.scrollTop(pvtUser_panel.prop("scrollHeight"));
            }, 500);
            // this.showPvtMessages=false;
            // setTimeout(() => {
            //   this.showPvtMessages=true;
            // }, 1000);
          }
          else if (!sameSender) {
            employee.notificationCount += 1;
            // employee.notificationCount = _.sumBy(employee.messages, function (o) { return o.isViewed == 0; }) || 0;
            // var c = _.filter(employee.messages, function (o) { return o.isViewed == 0; }) || [];
            // employee.notificationCount = c.length || 0;
            this.DbGroupService.setunreadCount(employee, messageData);
            //this.DbGroupService.setSingleUnreadCount(employee,messageData);
            //     setTimeout(() => {

            //        if ( this.cd !== null &&
            //          this.cd !== undefined &&
            //          !(this.cd["ChangeDetectorRef"]) ) {
            // //                    setTimeout(() => {
            // //   if ( this.cd !== null &&
            // //     this.cd !== undefined &&
            // //     !(this.cd["ChangeDetectorRef"]) ) {
            // //         this.cd.detectChanges();
            // // }
            // // },250);
            //      }
            //      },250);

          }


          if (!sameSender && messageData.fromId == this.selectedPrivateUser.userId) {
            this.updateMessageAsViewed([messageData.messageId]);
          }
        }
      })
    );
    //subscribe messages
    this._subscriptions.add(
      this.DbGroupService.getNewMessages().subscribe((res: any) => {
        // this._ngZone.run(() => {
        var messageData = res.data;
        var changesOccured = false;
        if (res.type == "PVT_GROUP_MSG") {
          if (messageData.status == 1) {
            var Msgs: any = messageData.result[0];
            Msgs.replyMsgs = [];
            var gIdx = _.findIndex(this.groupList, (g) => {
              return (g.groupId == Msgs.toId)
            });
            if (gIdx > -1) {
              var group = this.groupList[gIdx];
              if (!_.isEmpty(group)) {
                if (_.isEmpty(group.messages)) {
                  group.messages = [];
                }
                group.messages.push(Msgs);
                changesOccured = true;
              }
              if (Msgs.toId == this.selectedGroup.groupId) {
                if (changesOccured) {
                  setTimeout(() => {
                    if (this.cd !== null &&
                      this.cd !== undefined &&
                      !(this.cd["ChangeDetectorRef"])) {
                      this.cd.detectChanges();
                    }
                  }, 250);
                }

                var grpchat_panel = $("#grpchat_panel .msg_body_outer");
                grpchat_panel.scrollTop(grpchat_panel.prop("scrollHeight"));
              }
            }
          }
        }
        else if (res.type == "SYS_GROUP_MSG") {
          var Msgs: any = messageData.result[0];

          if (Msgs.moduleId == this.selectedModuleId) {
            if (this.isDuplicatedMessage(Msgs, this.systemTabChatGroups[Msgs.toId].messages)) {
              if (Msgs.replyTo != null && Msgs.replyTo != 0) {
                this.pushReplyToMessage(Msgs, this.systemTabChatGroups[Msgs.toId].messages);
                changesOccured = true;
              }
              else {
                Msgs.replyMsgs = [];
                this.systemTabChatGroups[Msgs.toId].messages.push(Msgs);
                changesOccured = true;
              }
              this.systemTabChatGroups[Msgs.toId].messages = [...this.systemTabChatGroups[Msgs.toId].messages];
            }
            if (this.currentTab == Msgs.toId) {
              if (changesOccured) {
                setTimeout(() => {
                  if (this.cd !== null &&
                    this.cd !== undefined &&
                    !(this.cd["ChangeDetectorRef"])) {
                    this.cd.detectChanges();
                  }
                }, 250);
              }
              setTimeout(() => {
                var pvtUser_panel = $("#systemMessagePanel");
                pvtUser_panel.scrollTop(pvtUser_panel.prop("scrollHeight"));
              }, 100);
            }
          }
          this.selectedReplyToSysTabMsg = {};
          this.showsystemTabReplyMsg = false;
        }
        else if (res.type == "CUS_TASKS") {
          var Msgs: any = messageData.result[0];

          if (Msgs.moduleId == this.selectedModuleId) {
            var task = _.find(this.sidebarMenuitems[1].items, (task) => {
              return (task.id == Msgs.toId)
            });
            //this.sidebarMenuitems[1].items
            if (!_.isEmpty(task)) {
              if (this.isDuplicatedMessage(Msgs, task.messages)) {
                if (Msgs.replyTo != null && Msgs.replyTo != 0) {
                  this.pushReplyToMessage(Msgs, task.messages);
                }
                else {
                  Msgs.replyMsgs = [];
                  task.messages.push(Msgs);
                }
                this.selectedReplyToSysTabMsg = {};
                this.showsystemTabReplyMsg = false;
                this.sidebarMenuitems[1].items = [...this.sidebarMenuitems[1].items];
              }
            }
          }
          this.selectedReplyToSysTabMsg = {};
          this.showsystemTabReplyMsg = false;
        }

        // });
      })
    );
    // recieive history 
    this._subscriptions.add(
      this.DbGroupService.getOldMessages().subscribe((response: any) => {
        // this._ngZone.run(() => {
        var messageData = response.messages;
        var memberData = response.members;
        var group: any = this.groupList[this.selectedGroupTabIndex];
        if (messageData.status == 1) {
          var Msgs = messageData.result;

          if (!_.isEmpty(group)) {
            group.messages = Msgs;
            //  this.groupList = [...this.groupList];
          }
        }
        if (memberData.status == 1) {
          var data = memberData.result;

          if (!_.isEmpty(group)) {

            group.groupMembers = data;
            //  this.groupList = [...this.groupList];
          }
        }
        // });
      })
    );
    this._subscriptions.add(
      this.DbGroupService.gettaskResponsibilitesUpdates().subscribe((response: any) => {
        this.loadTaskList();
      })
    );
  }
  formatUnreadCount() {
    _.each(this.onlineUserList, (emp) => {
      var emp_exist = _.find(this.unreadPvtMsgCountData, (e) => {
        return (e.fromId == emp.employeeId)
      }) || 0;
      if (!_.isEmpty(emp_exist)) {
        emp.notificationCount = emp_exist.unreadcount;
      }
    });
    this.onlineUserList = [...this.onlineUserList];
  }
  isDuplicatedMessage(msg, prevMessages) {
    return _.isEmpty(_.find(prevMessages, (m) => { return m.messageId == msg.messageId }));
  }
  pushReplyToMessage(msg, prevMessages) {
    var old_message = _.find(prevMessages, (msg) => {
      return (msg.messageId == msg.replyTo)
    });
    if (!_.isEmpty(old_message)) {
      if (old_message.replyMsgs == undefined || old_message.replyMsgs == null || (_.isEmpty(old_message.replyMsgs))) {
        old_message.replyMsgs = [];
      }
      old_message.replyMsgs.push(msg);
    }
  }
  unFlatternMessages(target, arr) {
    var mappedArr = {},
      arrElem,
      mappedElem: any;
    for (var i = 0; i < arr.length; i++) {
      arrElem = arr[i];
      mappedArr[arrElem.messageId] = arrElem;
      mappedArr[arrElem.messageId]['replyMsgs'] = [];
    }
    for (var messageId in mappedArr) {
      if (mappedArr.hasOwnProperty(messageId)) {
        mappedElem = mappedArr[messageId];

        if (mappedElem.replyTo != null && mappedElem.replyTo != 0 && mappedElem.replyTo != undefined
          && mappedArr[mappedElem['replyTo']] != undefined && mappedArr[mappedElem['replyTo']]) {
          mappedArr[mappedElem['replyTo']]['replyMsgs'].push(mappedElem);
        }
        // If the element is at the root level, add it to first level elements array.
        else {
          // mappedElem.childCount = children.length;
          target.push(mappedElem);
        }


      }
    }
    // return formatedMsgs;
  }
  lazyLoadMessages($event, tabType) {
    var scrollTop = $($event.target).scrollTop();
    if (scrollTop <= 0) {
      console.log("scroll top reached", $event);
      if (tabType == "SYS_TAB") {
        this.OnSystemTabChange();
      }
      if (tabType == "CUS_TASKS") {
        this.loadTasksMessages();
      }
    }
  }
  deletemessage(messages, TabType) {
    if (this.userInfo.EmployeeId == messages.fromId) {
      var req = {
        messageId: messages.messageId,
        fromId: parseInt(this.userInfo.EmployeeId),
        createdDate: moment(new Date(), this.dotnetFullDateFormat),
        options: 5
      };
      this.DbGroupService.MessageOperation(req)
        .then((res: any) => {
          this.AddSelectedTag = null;
          if (res.status == 1) {
            if (TabType == "SYS_TAB") {
              this.loadSystemTab();
            }
            else if (TabType == "CUS_TASKS") {
              this.loadTasksMessages();
            }
            else if (TabType == "CUS_TAG") {
              this.loadTaggedMessages(this.selectedTagInfo);
            }
            else if (TabType == "GRP_MSG") {
              var index = _.findIndex(this.groupList[this.selectedGroupTabIndex].messages, (m) => {
                return (m.messageId == messages.messageId)
              });
              if (index > -1) {
                this.groupList[this.selectedGroupTabIndex].messages.splice(index, 1);
                this.groupList[this.selectedGroupTabIndex].messages = [...this.groupList[this.selectedGroupTabIndex].messages];
              }

            }
            // this.systemTabChatGroups[this.currentTab].messages = res.result;
            // console.log("tagged messages", res.result);
            // var tag = _.find(this.sidebarMenuitems[1],(t)=>{
            //   return (t.id = selectedTag.id)
            // })
            // if(! _.isEmpty(tag))
            // {
            //   tag.messages.push(res.result[0]);
            // }

          }
          else {
            this.taggedMessageDetails = [];
          }
        }, error => {
          console.log("Error Happend");

        });
    }
    else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Permission denied." });
    }
    console.log("delete message", messages);
  }
  getUserPhoto(photoStringBye, external?, data?) {
    // this._ngZone.run( () => {
    if (external == true) {
      var emp = _.find(this.userList, (emp) => {
        return (emp.userId == data.fromId)
      });
      if (!_.isEmpty(emp)) {
        photoStringBye = emp.photoStringByte;
      }
    }
    if (photoStringBye == "" || photoStringBye == null || photoStringBye == undefined) {
      photoStringBye = "assets/images/default-profile.png";
    }
    return this._sanitizer.bypassSecurityTrustResourceUrl(photoStringBye);
    // });
  }
  getScrollmeHeight(scroll) {
    if (scroll.scrollHeight > 0) {
      return scroll.scrollHeight;
    }
  }
  scrollToTop(element) {
    //     this.ScrollToService.scrollTo(element).subscribe(data => {
    //       console.log('next');
    //       console.log(data);
    // }, error => {
    //       console.error('error');
    //       console.log(error);
    // }, () => {
    //       console.log('complete');
    // });
  }
  onTabChange(tabevent) {
    if (this.canSendMessage != true) {
      this._subscriptions.unsubscribe();
      this.DbGroupService.init();
      this.subscribeToEvents();
    }
  }
}
