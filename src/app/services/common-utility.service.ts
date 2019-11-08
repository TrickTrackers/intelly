import { Injectable } from '@angular/core';
import { LocalStorageService } from '../shared/local-storage.service';
import { AppConstant } from '../app.constant';
@Injectable()
export class CommonUtilityService {

  constructor(private LocalStorageService : LocalStorageService) { }

  IDGenerator(length,returnType) {
    if(length == null || length == undefined || typeof length == "string")
    {
        length=8;
    }
    var timestamp = +new Date;
    var _getRandomInt = function( min, max ) {
       return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
    }
    var ts = timestamp;
    if(returnType == 's')
    {
       // ts=ts.toString()
        var tss = timestamp.toString();
    var parts = tss.split( "" ).reverse();
    var id;
    for( var i = 0; i < length; ++i ) {
       var index = _getRandomInt( 0, parts.length - 1 );
       id += parts[index];	 
    }
    }
    else if(returnType == 'n'){
        id = ts;
    }
    
    
    return id;
    
}
isMobileDevice() {
    var isMob=false;
    var isMobile = {
      Android: function () {
        return navigator.userAgent.match(/Android/i);
      },
      BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
      },
      iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
      },
      Windows: function () {
        return navigator.userAgent.match(/IEMobile/i);
      },
      any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
      }
    };
    if( isMobile.any() ) {
      isMob=true;
    }
    this.LocalStorageService.addItem(AppConstant.API_CONFIG.LOCALSTORAGE.ISMOBILEDEV, isMob);
    return isMob;
  }
  isIE11Browser(){
    var isIE11= false;
    var objAgent = navigator.userAgent;
    if (objAgent.indexOf("MSIE ") != -1 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      console.log("Your are using IE browser,switch chorme,Firefox or Edge for better performance");
      isIE11=true;
    }
    return isIE11;
  }
}
