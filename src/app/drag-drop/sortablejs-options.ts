/**
 * extend sortablejs options
 * @export
 * @interface SortablejsOptions
 */
export interface SortablejsOptions {
  group?: string | {
    name?: string;
    pull?: boolean | 'clone' | Function;
    put?: boolean | string[] | Function;
    revertClone?: boolean;
  };
  sort?: boolean;
  delay?: number;
  touchStartThreshold?: number;
  disabled?: boolean;
  store?: {
    get: (sortable: any) => any[];
    set: (sortable: any) => any;
  };
  animation?: number;
  handle?: string;
  filter?: any;
  draggable?: string;
  ghostClass?: string;
  chosenClass?: string;
  dataIdAttr?: string;
  forceFallback?: boolean;
  fallbackClass?: string;
  fallbackOnBody?: boolean;
  scroll?: boolean | HTMLElement;
  scrollSensitivity?: number;
  scrollSpeed?: number;
  preventOnFilter?: boolean;
  fromScreen?:string;
  supportPointer?:boolean;
  /**
   * draggable element css class
   * @type string
   * @memberof SortablejsOptions
   */
  dragClass?: string;
  /**
   * show/hide arrow icons
   * @type boolean
   * @memberof SortablejsOptions
   */
  showArrowNavigator?:boolean;
  dragRootContainerId ?:string;
  /**
   * set auto scroll speed
   * @type number
   * @memberof SortablejsOptions
   */
  AutoscrollSpeed?:number;
  fallbackTolerance?: number;
  dragoverBubble?:boolean;
  setData?: (dataTransfer: any, draggedElement: any) => any;
  onStart?: (event: any) => any;
  onEnd?: (event: any,originalEvent: any) => any;
  onAdd?: (event: any) => any;
  onAddOriginal?: (event: any) => any;
  onUpdate?: (event: any) => any;
  onSort?: (event: any) => any;
  onRemove?: (event: any) => any;
  onFilter?: (event: any) => any;
  onMove?: (event: any) => boolean;
  scrollFn?: (offsetX: any, offsetY: any, originalEvent: any) => any;
  onChoose?: (event: any) => any;
  onUnchoose?: (event: any) => any;
  onClone?: (event: any) => any;
}
