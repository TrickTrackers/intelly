export class undoRedoMapperModel {

    action: string;
    sub_action: string;
    curorIndex: number;
    lego : any;
    legoId: number;
    old_parentid : number;
    new_parentid : number;
    old_position : number;
    new_position : number;
    old_level : number;
    new_level: number;
  
    constructor(action: string = '',sub_action: string = '', curorIndex: number = 0,lego : any= {}, legoId: number = 0, old_parentid: number = 0, new_parentid: number = 0, 
    old_position: number = 0, new_position: number = 0, old_level: number = 0, new_level: number = 0) {
      this.action = action;
      this.sub_action = action;
      this.curorIndex = curorIndex;
      this.lego = lego;
      this.legoId = legoId;
      this.old_parentid = old_parentid;
      this.new_parentid = new_parentid;
      this.old_position = old_position;
      this.new_position = new_position;
      this.old_level = old_level;
      this.new_level = new_level;
    }
  }