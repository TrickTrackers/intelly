
/** represent chat message class */
/**
 * chat message models
 * @export
 * @class ChatMessage
 */
export class ChatMessage {

  user: string;
  message: string;
  room: string;

  /**
   * Creates an instance of ChatMessage.
   * @param  {string} [user=''] 
   * @param  {string} [message=''] 
   * @param  {string} [room=''] 
   * @memberof ChatMessage
   */
  constructor(user: string = '', message: string = '', room: string = '') {
    this.user = user;
    this.message = message;
    this.room = room;
  }
}

/**
 * chat group
 * @export
 * @class ChatGroup
 */
export class ChatGroup {

  users: any;
  groupname: string;

  /**
   * Creates an instance of ChatGroup.
   * @param  {*} user 
   * @param  {string} [groupname=''] 
   * @memberof ChatGroup
   */
  constructor(user: any, groupname: string = '') {
    this.users = user;
    this.groupname = groupname;
  }
}

/**
 * message detail members
 * @export
 * @class MessageDetails
 */
export class MessageDetails {

   messageId : number;
  messageContent: string;
  fromId: number;
  toId: number;
  toName: string;
  messageType: number;
  ViewedDate: string;
  createdDate: string;
  modifyDate: string;
  options: number;
  /**
   * Creates an instance of MessageDetails.
   * @param  {number} messageId 
   * @param  {string} [messageContent=''] 
   * @param  {number} fromId 
   * @param  {number} toId 
   * @param  {number} messageType 
   * @param  {string} [ViewedDate=''] 
   * @param  {string} [createdDate=''] 
   * @param  {string} [modifyDate=''] 
   * @param  {number} options 
   * @memberof MessageDetails
   */
  constructor(messageId: number, messageContent: string = '',fromId:number,toId : number,messageType : number,
  ViewedDate : string='',createdDate : string='',modifyDate : string='',options: number) {
    this.messageId = messageId;
    this.messageContent = messageContent;
    this.fromId = fromId;
    this.toId = toId;
    this.messageType = messageType;
    this.ViewedDate = ViewedDate;
    this.createdDate = createdDate;
    this.modifyDate = modifyDate;

    this.options = options;
  }
}