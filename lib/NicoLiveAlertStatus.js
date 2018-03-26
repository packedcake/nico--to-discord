"use strict"

var NicoLiveAlertStatus = function(status) {
    this.status = status;
}
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
function getJSON(url) {
        var resp ;
        var xmlHttp ;

        resp  = '' ;
        xmlHttp = new XMLHttpRequest();

        if(xmlHttp != null)
        {
            xmlHttp.open( "GET", url, false );
            xmlHttp.send( null );
            resp = xmlHttp.responseText;
        }

        return resp ;
}
function retrivecomids(){
   
    var raw_json=getJSON(process.env.gdocsJSON);
    
    var json=JSON.parse(raw_json);
    
   var ids_raw=json.feed.entry;
    var ids=new Array(ids_raw.length);
    
    for(var i=0;i<ids_raw.length;i++){
    if(ids_raw[i].title.type =='text' ){
      ids[i]=ids_raw[i].title.$t;
    }
    }
    
    return ids;
   
}
NicoLiveAlertStatus.prototype = {
    getCommunityIds : function() {
      if(process.env.env_switch==0){
        if(this.status.communities.hasOwnProperty('community_id')) {
            return this.status.communities.community_id;
        }
      }
      else if(process.env.env_switch==1)
              {
              var comids= retrivecomids();
                return comids;
              }
        return [];
    },
     
    getCommentServerData : function() {
        return this.status.ms;
    },
    getUserHash: function() {
        return this.status.user_hash;
    }
    
}

module.exports = NicoLiveAlertStatus;