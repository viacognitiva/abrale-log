require('dotenv-safe').load();

var request=require('request');
var express = require('express');
var app = express();
app.set('port', process.env.PORT || 2000);

var username = process.env.USERNAME;
var password = process.env.PASSWORD;
var apiHostname = process.env.APIHOSTNAME;
var workspacesId = process.env.WORKSPACE_ID;
var protocol = process.env.NODE_ENV == 'production' ? "https" : "http" ;

var logConversation = {

    get : function(req,res) {

        const baseQuery = '/conversation/api/v1/workspaces/'+ workspacesId +'/logs';
        const version = 'version=2017-05-26';
        const fullUrl = 'https://' + username + ':' + password + '@' + apiHostname + baseQuery + '?' +version;
        console.log('logConversation.get');

        request.get(fullUrl,function(err,resp,body){

            if(err){
                console.log(" logConversation.get Error: "+JSON.parse(body));
            }

            res.status(200).json(JSON.parse(body));

        });
    },

    getEntidades : function(req,res) {

        const baseQuery = '/conversation/api/v1/workspaces/' + workspacesId + '/entities';
        const version = 'version=2017-05-26&export=false&include_count=false';
        const fullUrl = 'https://' + username + ':' + password + '@' + apiHostname + baseQuery + '?' +version;
        console.log(fullUrl);

        request.get(fullUrl,function(err,resp,body){

            if(err){
                console.log(" logConversation.getEntidades Error: "+JSON.parse(body));
            }
            res.status(200).json(JSON.parse(body));

        });
    },

    getIntencoes : function(req,res) {

        const baseQuery = '/conversation/api/v1/workspaces/' + workspacesId + '/intents';
        const version = 'version=2017-05-26&export=false&include_count=false';
        const fullUrl = 'https://' + username + ':' + password + '@' + apiHostname + baseQuery + '?' +version;
        console.log(fullUrl);

        request.get(fullUrl,function(err,resp,body){

            if(err){
                console.log(" logConversation.getIntencoes Error: "+JSON.parse(body));
            }

            res.status(200).json(JSON.parse(body));

        });
    },

    treinaIntencao : function(req,res) {

        const intent =  req.body.intencao;
        const baseQuery = '/conversation/api/v1/workspaces/' + workspacesId + '/intents/${intent}/examples';
        const version = 'version=2017-05-26';
        const fullUrl = 'https://' + username + ':' + password + '@' + apiHostname + baseQuery + '?' +version;
        console.log(fullUrl);

        request.post({
            headers: { "Content-Type": "application/json"},
            url: fullUrl,
            body:  { "text":req.body.message},
            json:true
        }, function(err,resp,body){
            if(err){
                console.log(" logConversation.treinaIntencao Error: "+body);
            }
            res.status(200).json(body);
        });
    },

    treinaEntidade : function(req,res) {

        const entity =  req.body.entidade;
        const baseQuery = '/conversation/api/v1/workspaces/' + workspacesId + '/entities/' + entity +'/values';
        const version = 'version=2017-05-26';
        const fullUrl = 'https://' + username + ':' + password + '@' + apiHostname + baseQuery + '?' +version;

        request.post(
            {
                headers: {"Content-Type":"application/json"},
                url: fullUrl,
                body: {"value": req.body.valor,"metadata": {},},
                json:true
            },
            function(err,resp,body){
                if(err){
                    console.log(" logConversation.treinaIntencao Error: "+body);
                }
                res.status(200).json(body);
            }
        );
    },

    getEntidadeValue : function(req,res) {

        const entity=req.params.entity;
        const baseQuery = '/conversation/api/v1/workspaces/' + workspacesId + '/entities/' + entity + '/values';
        const version = 'version=2017-05-26&export=false&include_count=false';
        const fullUrl = 'https://' + username + ':' + password + '@' + apiHostname + baseQuery + '?' +version;

        request.get(fullUrl,function(err,resp,body){
            if(err){
                console.log(" logConversation.getEntidadeValue Error: "+JSON.parse(body));
            }
            res.status(200).json(JSON.parse(body));
        });
    },

    criarSinonimo : function(req,res) {

        const entity =  req.body.entidade;
        const value =  req.body.valor;

        const baseQuery = '/conversation/api/v1/workspaces/' + workspacesId + '/entities/' + entity + '/values/' + value + '/synonyms';
        const version = 'version=2017-05-26';
        const fullUrl = 'https://' + username + ':' + password + '@' + apiHostname + baseQuery + '?' +version;

        request.post(
            {
                headers: { "Content-Type": "application/json"},
                url: fullUrl,
                body: {"synonym": req.body.sinonimo},
                json:true
            },

            function(err,resp,body){
                if(err){
                    console.log(" logConversation.criarSinonimoo Error: "+body);
                }
                res.status(200).json(body);
            }
        );
    }
}

module.exports = logConversation;