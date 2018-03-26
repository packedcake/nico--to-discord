"use strict";
Object.prototype.values = function(){var o=this;var r=[];for(var k in o) if(o.hasOwnProperty(k)){r.push(o[k])}return r};
Object.prototype.keys   = function(){var o=this;var r=[];for(var k in o) if(o.hasOwnProperty(k)){r.push(  k )}return r};
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
function httpGet(theUrl)
{
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}
function Get(yourUrl){
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseText;          
}
Object.values = function (obj) {
    var vals = [];
    for( var key in obj ) {
        if ( obj.hasOwnProperty(key) ) {
            vals.push(obj[key]);
        }
    }
    return vals;
}
class NicoLiveAlert {
    constructor () {
        this.request = require('request');
        this.net = require('net');
        this.xmlParseString = require('xml2js').parseString;
        this.nicoLiveAlertStatus = require('./NicoLiveAlertStatus');
    }
    login (email, password, callback) {
        this.request.post({
            url : 'https://secure.nicovideo.jp/secure/login?site=nicolive_antenna',
            form: {'mail': email, 'password': password}
        }, (err, res, body) => {
            if(err) return callback(err);
            this.xmlParseString(body, {explicitArray: false}, function(err, result) {
                if(err) return callback(err);
                if ( result.nicovideo_user_response.$.status === 'fail' ) {
                    switch(result.nicovideo_user_response.error.code) {
                        case '1':
                            return callback(Error('authorizeException! wrong mail or password'));
                        default:
                            return callback(Error('authorize error.'));
                    }
                }
                // 認証チケット
                var ticket = result.nicovideo_user_response.ticket;
                return callback(null, ticket);
            });
        });
    }
    getAlertStatus (ticket, callback) {
        this.request.post({
            url: 'http://live.nicovideo.jp/api/getalertstatus',
            form: { ticket : ticket }
        }, (err, res, body) => {
            if( err ) return callback(err);
            this.xmlParseString(body, {explicitArray: false}, (err, result) => {
                if(err) return callback(err);
                if ( result.getalertstatus.$.status === 'fail' ) {
                    switch(result.getalertstatus.error.code) {
                        case 'incorrect_account_data':
                            return callback(Error('incorrect account data.'));
                        default:
                            return callback(Error('getalertstatus error.'));
                    }
                }

                return callback(null, new this.nicoLiveAlertStatus(result.getalertstatus));
            });
        });
    }
    connectCommentServer (alert_status, callback) {
        var server_config = alert_status.getCommentServerData();
        var socket = this.net.connect(+server_config.port, server_config.addr);
        socket.setEncoding('utf-8');
        socket.on('connect', function(){
            socket.write('<thread thread="'+ server_config.thread + '" version="20061206" res_from="-1"/>\0');
        });
        socket.on('error', function(err) {
            callback(err);
        });
        
        callback(null, socket);
    }
  
  retrievePlayerstatus(live_id){
    
      var raw_json= getJSON('http://api.ce.nicovideo.jp/liveapi/v1/video.info?__format=json&v=lv'+ live_id);
     
      
      var  data   = JSON.parse(raw_json);
       var vdata=data.nicolive_video_response.video_info.video.title;
      var   cdata=data.nicolive_video_response.video_info.community.name;
      var thumbdata=data.nicolive_video_response.video_info.community.thumbnail;
      var udata_raw=data.nicolive_video_response.video_info.video.user_id;
      var titledata=data.nicolive_video_response.video_info.video.title;
      var descdata=data.nicolive_video_response.video_info.video.description;
      var tagdata_raw=data.nicolive_video_response.video_info.livetags.free;
      var tagdata;
    console.log(tagdata_raw);
    var client = require('cheerio-httpcli');

    var result=client.fetchSync('http://ext.nicovideo.jp/thumb_user/'+udata_raw);
      var udata_title=result.$('title').text();
      
      var udata_title_str=udata_title.toString();
      
      var udata_cut=udata_title_str.split(/さん/);
        var udata=udata_cut[0];
    if(typeof tagdata_raw !='undefined'){
       tagdata=tagdata_raw.values();
    }
   else{
     tagdata= [[]];
     tagdata[0][0]="タグが設定されていません";
      
    }
    
    var outdata=[udata,cdata,titledata,descdata,thumbdata];
    
    
   
    for(var i=0;i<tagdata[0].length;i++){
       outdata[i+5]=tagdata[0][i];      
     }
    if(typeof outdata[6] =='undefined') outdata[6]="";
    if(typeof outdata[7] =='undefined') outdata[7]="";
    return outdata;
  }
  

}
module.exports = new NicoLiveAlert;