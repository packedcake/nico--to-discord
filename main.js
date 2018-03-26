// Response for Uptime Robot
const http = require('http');
http.createServer(function(request, response)
{
	response.writeHead(200, {'Content-Type': 'text/plain'});
	response.end('Discord bot is active now \n');
}).listen(3000);

// Discord bot implements
const discord = require('discord.js');
const client = new discord.Client();
//const embed = new discord.RichEmbed()
const hook = new discord.WebhookClient(process.env.discord_webhook_id, process.env.discord_webhook_token);

// This is called as, for instance:

//nicoliveAlertImplements
var NicoLiveAlert = require('./lib/NicoLiveAlert');
var NicoLiveAlertChatParser = require('./lib/NicoLiveAlertChatParser');

process.on('unhandledRejection', console.dir);


var domain = require('domain');
var d = domain.create();

d.on('error', function(err) {
    console.log('error: '+ err);
});


var async = require('async');
async.waterfall([
  function(next) {
    NicoLiveAlert.login(process.env.NICONICO_LOGIN_MAIL, process.env.NICONICO_LOGIN_PASS, function(err, ticket) {
      next(err, ticket);
    });
  },
  function(ticket, next) {
    NicoLiveAlert.getAlertStatus(ticket, function(err, alert_status) {
      next(err, alert_status);
    });
  },
  function(alert_status, next) {
    NicoLiveAlert.connectCommentServer(alert_status, function(err, socket) {

      if(err) { next(err) }

      socket.on('connect', function() {
        console.log('connect alert server.');
        
      });
       
      socket.on('data', function(data) {
          var nico_live_alert_chat_parser;
         var comids;
 
          nico_live_alert_chat_parser = new NicoLiveAlertChatParser(data, alert_status.getCommunityIds());
        
        var in_community_ids;
        if(process.env.env_switch==0){
          in_community_ids = nico_live_alert_chat_parser.retriveInCommunityIds();
          if(!in_community_ids.length) {
              return;
          }
        }
         else if(process.env.env_switch==1){
          in_community_ids=nico_live_alert_chat_parser.retrivecomids();
         }
          var live_ids = nico_live_alert_chat_parser.retriveLiveIds(in_community_ids);
        
       
        
          live_ids.forEach(function(live_id) {
            var prev_post_text;
              var stream_info=NicoLiveAlert.retrievePlayerstatus(live_id);
      
            console.log(stream_info[0]+"//info[0]");
            console.log(stream_info[1]+"//info[1]");
            console.log(stream_info[2]+"//info[2]");
            console.log(stream_info[4]+"//info[4]");
            console.log(stream_info[5]+"//info[5]");
            console.log(stream_info[6]+"//info[6]");
            console.log(stream_info[7]+"//info[7]");
            var post_text = stream_info[0]+ "さんが"+stream_info[1]+ "で配信を開始しました"+"\n"+ "http://live2.nicovideo.jp/watch/lv" + live_id;
            
	          
            if(prev_post_text != post_text){
              if(process.env.custom_embed==0){
              hook.send(post_text);
              }
              else if(process.env.custom_embed==1){
                var post_text_cut=post_text.split("\n",1);
        client.channels.find("name",process.env.text_channel_name).send(post_text_cut[0]);
    const embed = new discord.RichEmbed()
    .setColor(0xFFFFFB)
    .setTitle(stream_info[2])
    .setAuthor(stream_info[2], "https://www.google.com/s2/favicons?domain=http://live.nicovideo.jp/?header")
    .setURL('http://live2.nicovideo.jp/watch/lv'+live_id)
    .setDescription(stream_info[3])
    .setTimestamp()
    .setThumbnail(stream_info[4])
    .addField("タグ", stream_info[5]+" "+stream_info[6]+" "+stream_info[7], true)
    .setFooter("ママエアロ");    
    client.channels.find("name",process.env.text_channel_name).send({embed});
              // hook.send(ce(
    //"#FFFFFB", null, info[2],info[3],null,null,null, null,false));
                  }
              else{
                hook.send("error");
                  }
                }
          prev_post_text=post_text;
            }
          );
     
      });

    });
  }
], d.intercept(function(result){

}));

//以下、完全にbotテスト用
client.on('ready', message =>
{
	console.log('bot is ready!');
  
});

client.on('message', message =>
{
	if(message.isMemberMentioned(client.user))
	{
		message.reply( '呼びましたか？' );
		return;
	}
 
  if(message.content=='ping'){
     message.channel.send('ふがふがさんがほげほげで放送を開始しました');
    const embed = new discord.RichEmbed()
    .setColor(0x00AE86)
    .setTitle("test")
    .setAuthor("放送タイトル", "https://www.google.com/s2/favicons?domain=http://live.nicovideo.jp/?header")
    
    .setURL('http://live.nicovideo.jp/watch/lv312032363')
     .setDescription("放送説明文")
    .setTimestamp()
   .setThumbnail('https://secure-dcdn.cdn.nimg.jp/comch/community-icon/64x64/co2307887.jpg')
    .addField("タグ", "タグ一覧", true)
    .setFooter("ママエアロ");    
    message.channel.send({embed});
  }
  if(message.content.includes('!add')){
    //var txt=message.content.split(" ");
    message.channel.send("aaa");
  }
  
});

if(process.env.DISCORD_BOT_TOKEN == undefined)
{
	console.log('please set ENV: DISCORD_BOT_TOKEN');
	process.exit(0);
}

client.login(process.env.DISCORD_BOT_TOKEN );

"use strict";

