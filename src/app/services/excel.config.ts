
export const ExcelConfig = {

    EXCEL_TYPE: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  
    EXCEL_EXTENSION: '.xlsx',
  
    headerStyle: {
      fill: {fgColor: {rgb: "	2F5497"}},
      font: {name: 'Arial', sz:10, bold: true, color:{rgb: 'FFFFFFFF'}},
      alignment: { wrapText: true, vertical: 'bottom', horizontal: 'center' }
    },
  
    dateStyle: {
      font: {name: 'Arial', sz:10},
      alignment: { wrapText: false, vertical: 'bottom', horizontal: 'center' }
    },
  
    currencyStyle: {
      font: {name: 'Arial', sz:10},
      alignment: { wrapText: false, vertical: 'bottom', horizontal: 'right' }
    },
  
    textStyle: {
      font: {name: 'Arial', sz:10},
      alignment: { wrapText: true, vertical: 'top', horizontal: 'left' }
    },
  
    generalStyle: {
      font: {name: 'Arial', sz:10},
      alignment: { wrapText: true, vertical: 'top', horizontal: 'left' }
    },
  
    dateFmt: 'mm/dd/yyyy',
    // dateFmt: 'yyyy/mm/dd',
    currencyFmt: '$#,##0.00;[Red]($#,##0.00)'
  };
  