"use strict";
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
class NicoLiveAlertChatParser {
    constructor(chatData ,community_ids) {
        this.chatData = chatData;
        this.community_ids = community_ids;
        this.cheerio = require('cheerio');
    }
    retriveInCommunityIds() {
        var input_ids = this.chatData.match(/((co|ch)\d+)/g); // コミュニティ番号抜き出し
        if(input_ids === null) return [];
        
        var ids = [];
        for(var i = 0; i < input_ids.length; i++) {
            // 指定しているコミュニティ一覧に存在するか
            var index = this.community_ids.indexOf(input_ids[i]);
            if(index !== -1) {
                ids.push(input_ids[i]);
            }
        }
        
        if(!ids.length) return [];
        return ids;
    }
  retrivecomids(){
   
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
    retriveLiveIds(community_ids) {
        var ids = [];
        var $ = this.cheerio.load(this.chatData);
        $('chat').each(function(index, elem) {
            var chat_values = $(elem).text().split(',');
          
            if(chat_values.length >= 2 && community_ids.indexOf(chat_values[1]) !== -1) {
                ids.push(chat_values[0]);
            }
        });
        return ids;
    }
    
}

module.exports = NicoLiveAlertChatParser;