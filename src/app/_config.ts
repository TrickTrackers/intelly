export var component_config =
  {
    cktool_config: {
      toolbarGroups: [
        { "name": "basicstyles", "groups": ["basicstyles"] },
        { "name": "links", "groups": ["links"] },
        { "name": "paragraph", "groups": ["list", "blocks", 'align'] },
        { "name": "document", "groups": ["mode"] },
        //{"name":"insert","groups":["insert"]},
        { "name": "styles", "groups": ["styles"] },
        //{"name":"about","groups":["about"]},
        { "name": 'clipboard', "groups": ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] }
      ],
      removeButtons: 'Underline,Strike,Subscript,Superscript,Anchor,Styles,Specialchar,Save,newpage,preview,Clipboard,Image,Flash,Source',
      //removePlugins : 'elementspath,save,font,clipboard,source,newpage,preview,templates,maximize,showblocks,image,flash,table,about,others,insert,forms,mode,print,smiley,specialchar,iframe,spellchecker,selection,find,PageBreak,div'    
      //height: '450px',
      height: '365px'
      //width : '1050px'
    },
    cktool_config_full: {
      toolbarGroups: [ 
        {"name":"undo","groups":["undo"]},
        { "name": "basicstyles", "groups": ["basicstyles"] },
        { "name": "colors" },        
        { "name": 'clipboard', "groups": ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },
        { "name": "indent","groups": ["indent", "indentblock"] },
        //{ "name": "paragraph", "groups": ["list", "blocks", 'align', 'bidi', 'JustifyBlock'] },
        { "name": 'paragraph', "groups": [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph', 'justify' ] },
        { "name": "links", "groups": ["links"] },
        { "name": "document", "groups": ["mode"] },
        //{"name":"about","groups":["about"]},
        { "name": 'insert', "groups" : [ 'HorizontalRule'] },
        { "name": "styles", "groups": ["styles", "cleanup"] },
      ],
      removeButtons: 'Save,newpage,Clipboard,Image,Flash,Source, Image,Flash,Table,Smiley,SpecialChar,PageBreak,Iframe, Language',
      removePlugins : 'resize, div',
      //removePlugins : 'elementspath,save,font,clipboard,source,newpage,preview,templates,maximize,showblocks,image,flash,table,about,others,insert,forms,mode,print,smiley,specialchar,iframe,spellchecker,selection,find,PageBreak,div'    
      //height: '450px',
      height : 'calc( 50vh )',
      //width : '1050px'
      startupFocus : true,
    },
    cktool_config_comment: {
      toolbarGroups: [
        { "name": "basicstyles", "groups": ["basicstyles"] },
        { "name": "indent","groups": ["indent", "indentblock"] },
        // { "name": "links", "groups": ["links"] },
        // { "name": "paragraph", "groups": ["list", "blocks", 'align'] },
        // { "name": "document", "groups": ["mode"] },
      //  {"name":"insert","groups":["insert"]},
      { "name": 'paragraph', "groups": [ 'list', 'indent']},
        // { "name": "styles", "groups": ["styles"] },
        // //{"name":"about","groups":["about"]},
        // { "name": 'clipboard', "groups": ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] }
      ],
      removeButtons: 'Strike,Subscript,Superscript,Anchor,Styles,Specialchar,Save,newpage,preview,Clipboard,Image,Flash,Source',
      //removePlugins : 'elementspath,save,font,clipboard,source,newpage,preview,templates,maximize,showblocks,image,flash,table,about,others,insert,forms,mode,print,smiley,specialchar,iframe,spellchecker,selection,find,PageBreak,div'    
      //height: '450px',
      height: '150px'
      //width : '1050px'
    },
  };
