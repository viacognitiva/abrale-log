require('dotenv-safe').load();

var Cloudant = require('cloudant');
var express = require('express');
var fs = require('fs');
var request=require('request');
var http = require("http");

var app = express();
app.set('port', process.env.PORT || 2000);

var protocol = process.env.NODE_ENV == 'production' ? "https" : "http" ;

var cloudant_url = process.env.CLOUDANT_URL;
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
var user = process.env.CLOUDANT_USER;
var password = process.env.CLOUDANT_PASSWORD;

if(process.env.VCAP_SERVICES) {

    services = JSON.parse(process.env.VCAP_SERVICES);

    if(services.cloudantNoSQLDB) {
        cloudant_url = services.cloudantNoSQLDB[0].credentials.url;
        user = services.cloudantNoSQLDB[0].credentials.username;
        password = services.cloudantNoSQLDB[0].credentials.password;
    }
}

var dbname = process.env.CLOUDANT_DB;
var dbuser = process.env.CLOUDANT_DBUSER;
var cloudantDB = Cloudant({url:cloudant_url, account:user, password:password});
db = cloudantDB.db.use(dbname);
dbUser = cloudantDB.db.use(dbuser);

var cloudant = {

    get : function(req, res) {

        var id = req.params.id;
        console.log('id ='+id);

        db.get(id, function(err, data) {
            res.status(200).json(data);
        });
    },

    getUsuarios : function(req, res){

        dbUser.list({include_docs:true},function(err, data) {
            if(err){
                return console.log('[dbUser.getUsuarios] ', err.message);
                res.status(500);
            }
            res.status(200).json(data);
        });

    },

    insertLogs : function (req, res) {

        var dados = {
            conversation_id: req.body.conversation_id,
            messageWatson: req.body.messageWatson,
            messageUser:req.body.messageUser,
            intencao:req.body.intencao,
            data : dataNow
        }

        var dataNow = new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"});

        db = cloudantDB.db.use(dbname);

        db.insert(dados,'doc_'+req.body.conversation_id+'_'+new Date().getTime(), function(err, body, header) {
            if (err) {
                return console.log('[db.insert] ', err.message);
            }
            console.log('Documents is inserted');
            res.status(201).json(body);
        });
    },

    insertWorkspace : function (req, res) {

        db = cloudantDB.db.use('workspace');

        var dados = {
            nome:req.body.nome,
            workspaceId: req.body.workspaceId,
            username: req.body.username,
            password: req.body.password,
            status:'ativo',
            selecionado: 'false'
        }

        db.insert(dados, function(err, body, header) {
            if (err) {
                return console.log('[db.insert] ', err.message);
            }
            console.log('insertWorkspace - Documents is inserted');
            res.status(201).json(body);
        });

    },

    listWorkspace : function (req, res) {

        db = cloudantDB.db.use('workspace');
        db.index({name:'_id', type:'json', index:{fields:['status']}});

        var query = { selector: { status: 'ativo' }};

        db.find(query, function(err, data) {
            if (err) {
                return console.log('[db.listWorkspace] ', err.message);
            }
            res.status(201).json(data);
        });

    },

    getWorkspaceSelecionada : function (req, res) {

        db = cloudantDB.db.use('workspace');
        db.index( {name:'_id', type:'json', index:{fields:['selecionado']}});

        var query = { selector: { selecionado: 'true' }};
        db.find(query, function(err, data) {
            if (err) {
                return console.log('[db.getWorkspaceSelected] ', err.message);
            }
            res.status(201).json(data);
        });
    },

    updateSelectWorkspace : function (req, res) {

        db = cloudantDB.db.use('workspace');
        db.index( {name:'_id', type:'json', index:{fields:['status']}});

        var query = { selector: { status: 'ativo' }};

        db.find(query, function(err, data) {

            if (err) {
                return console.log('[db.updateSelectWorkspace] ', err.message);
            }

            var condicao = false;

            for(var i = 0; i < data.docs.length;i++){

                if(data.docs[i]._id==req.params.id){

                    data.docs[i].selecionado='true';

                    db.insert(data.docs[i], function(err, data) {
                        if (err) return console.log(err.message);
                        console.log('update completed: ' + data);
                        res.status(200).json(data)
                    });

                } else {

                    if(data.docs[i].selecionado=='true'){

                        data.docs[i].selecionado='false';

                        db.insert(data.docs[i], function(err, data) {
                            if (err) return console.log(err.message);
                                console.log('update completed: ' + data);
                            }
                        );
                    }

                }
            }

        });
    },

    login : function (req,res,callback) {

        db = cloudantDB.db.use('usuario');
        var query = { selector: { nome: req.body.username , senha: req.body.password}};

        db.find(query, function(err, data) {
            if (err) {
                return console.log('error ao buscar usuario login] ', err.message);
            }
            callback(data);
        });
    },

    insertLogTreinamento : function (callback) {

        var fullUrl = protocol + "://localhost:" + app.get('port') + "/api/logconversation/";

        request.get(fullUrl,function(err,resp,body){

            if(err){
                console.log(" insertLogTreinamento : "+JSON.parse(body));
            }

            var dataLog = JSON.parse(body);
            db = cloudantDB.db.use(dbname);
            var cpDataLog = [];

            for(var i = 0; i < dataLog.logs.length;i++){

                dataLog.logs[i]._id=dataLog.logs[i].request_timestamp + "_" + dataLog.logs[i].request.input.text;
                dataLog.logs[i].treinado=false;
                dataLog.logs[i].ativo=true;

                if(dataLog.logs[i].request.input.text.length!=0){
                    cpDataLog.push(dataLog.logs[i]);
                }
            }

            // operations(update/delete/insert) on the database em batch
            db.bulk({docs:cpDataLog}, function(err, body) {
                console.log(body);
            });

        });
    },

    getPrcAcuracidade : function (req, res) {

        db = cloudantDB.db.use(dbname);
        db.index( {name:'_id', type:'json', index:{fields:['ativo']}});

        var jsonParam = {};
        var query = { selector: { ativo: true }};

        db.find(query, function(err, data) {

            if (err) {
                return console.log('[db.getPrcAcuracidade] ', err.message);
            }

            jsonParam.x = data.docs.length;
            var query2 = { selector: { treinado: true }};

            db.find(query2, function(err1, data1) {
                if (err1) {
                    return console.log('[db.getPrcAcuracidade] ', err1.message);
                }

                jsonParam.y=data1.docs.length;
                var text = '{ "acuracidade" : '+((jsonParam.y/jsonParam.x)*100)+'}';

                if(!isNaN(text.acuracidade)){
                    var obj1 = JSON.parse(text);
                    res.status(200).json(obj1);
                } else {
                    return console.log('[db.getPrcAcuracidade] - Error acuracidade');
                }

            });

        });
    },

    getLogTreinamento : function (req, res){

        db = cloudantDB.db.use(dbname);
        db.index( {name:'_id', type:'json', index:{fields:['ativo']}});
        var query = { selector: { ativo: true }};

        db.find(query, function(err, data) {
            if (err) {
                return console.log('[db.getLogTreinamento] ', err.message);
            }
            res.status(201).json(data);
        });
    },

    atualizaStatusTreinamento : function (req, res){

        db = cloudantDB.db.use(dbname);
        const id =  req.body.idLog;
        db.index( {log_id: 'log_id', type:'json', index:{fields:['log_id']}});
        var query = { selector: { log_id: id }};

        db.find(query, function(err, data) {

            if (err) {
                return console.log('[db.atualizaStatusTreinamento] ', err.message);
            }

            data.docs[0].treinado=true;

            db.insert(data.docs[0], function(err, data) {

                if (err) return console.log(err.message);
                console.log('update completed: ' + data);
                res.status(201).json(data);
            });

        });

    }
};

module.exports = cloudant;