/*
 * Test si l'utilisateur existe sur le Drupal NS.
 * Variables:
 * - 
 *
 * Dependances :
 * - backbone.js
 */


var NS = window.NS || {};

NS.SynchroUser = (function() {
    "use strict";

    var synchroUser = function () {
        var dfd = $.Deferred();

        /***
         * Fonction création de compte sur le site sauvages de paca retourne UID
         *  
         ****/
        
        synchroUser.prototype.registerUser = function(mail) {
            var self = this;
            var user = {
                       "mail": mail, 
                       "conf_mail": mail,
                       "account" :{        
                           "mail": mail, 
                           "conf_mail": mail,
                           }
                       }
            return $.ajax({
                     type: "POST",
                     url: SERVICE_SAUVAGESPACA + '/observation/obs_user',
                     dataType: 'json',
                     data: JSON.stringify(user),
                     contentType: 'application/json',
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(errorThrown);
                        },
                    success: function (data) {
                        self.saveUID(data.uid);
                    }
                 });                 
        };


        /***
         * Fonction affiche modal création de compte sur le web
         *  
         ****/
        synchroUser.prototype.printCreateAccount = function(emailUser){
            var msg = _.template(
                  "<form role='form form-inline'>"+
                   "<div class='form-group'>"+
                   "		<p>Le compte "+ emailUser +" n'existe pas.<br/> Voulez vous le créer ?</p>"+
                   "</div>"+
                   "<button type='submit' class='btn btn-success'>Créer le compte</button>"+
                   "<button type='reset' class='btn btn-default pull-right'>Modifier l'email</button>"+
                  "</form>"					
                );
            sauvages.notifications.createAccount(msg(),emailUser);
        };

        /***
         * Fonction qui retoune le numéro de status de l'erreur ajax
         *  
         ****/
        synchroUser.prototype.errorStatus = function(status,emailUser){
            console.log(status);
            switch(status) {
                case 404:
                    this.printCreateAccount(emailUser);
                    break;
                default:
                    console.log(status);
            }
        };
    
        /***
         * Fonction de test du mail du site sauvages de paca
         *  
         ****/
        synchroUser.prototype.mailExisteDrupal = function(emailUser, callback) {
            var self = this;
            return $.ajax({
                    type: "GET",
                    url: SERVICE_SAUVAGESPACA + '/observation/obs_user/retrieve',
                    data: 'mail='+ emailUser,
                    contentType: 'application/x-www-form-urlencoded',
                       error: function (jqXHR, textStatus, errorThrown) {
                           console.log(errorThrown);
                           self.errorStatus(jqXHR.status,emailUser);
                       },
                    success: function (data) {
                        console.log(data);
                    }
                });                 
        };

        /***
         * Fonction de traitements des récompenses récupérées sur le web
         *  
         ****/
        synchroUser.prototype.treatementRecompense = function(data) {
            var self = this;
            _.each(data, function(item){
                self.testRecompenseExist(item);
                //self.saveFileImg(item);
            })
            console.log(data);
        }

        /***
         * Fonction de test if this type of recompense exits
         *  
         ****/
        synchroUser.prototype.testRecompenseExist= function (recompense){
            var self = this;
            var recompenses = new app.models.RecompensesDataValuesCollection();
            recompenses.fetch({success: function(collection) {
                var isRecompense = collection.findWhere({"title": recompense.filename});
                if(!isRecompense) self.saveFileImg(recompense);
                }
            });
        }
        /***
         * Fonction de traitements des badges
         *  
         ****/
        synchroUser.prototype.saveFileImg= function (recompense){
            if (navigator.camera) {
                var self = this;
                //The directory to store data
                var store;                  
                //URL of our asset
                var getURL = recompense.uri_full;
                //File name of our important data file we didn't ship with the app
                var fileName = recompense.filename;       
                store = cordova.file.dataDirectory+'/badge/';
                //Check for the file. 
                window.resolveLocalFileSystemURL(store + fileName, self.resolveLocalFileSuccess, self.downloadFile(getURL,store,fileName));
                //save recompense in db
                this.saveInDB(store,fileName);
            }else{
                //save recompense and file base64
                var file = new app.models.RecompensesDataValue();
                file.set({title : recompense.filename, picture : recompense.uri_full });
                file.save();
            }
        }
        /***
         * Fonction save recompense in data base
         *  
         ****/
        synchroUser.prototype.saveInDB = function(store,filename) {
            console.log('save in db'+ store +filename);
            var file = new app.models.RecompensesDataValue();
            file.set({title : filename, picture : store + filename });
            file.save({success: console.log(filename)});
        }

        /***
         * Fonction (success resolveLocalFileSystemURL) le fichier à été trouvé 
         *  
         ****/
        synchroUser.prototype.resolveLocalFileSuccess = function(store,fileName) {
            console.log('Le fichier existe déjà !');
        }

        /***
         * Fonction (error resolveLocalFileSystemURL) download file badge
         *  
         ****/
        synchroUser.prototype.downloadFile = function(getURL, store,fileName) {
            var self = this;
            var fileTransfer = new FileTransfer();
            console.log("About to start transfer");
            fileTransfer.download(getURL, store + fileName, 
              function(entry) {
                console.log("Success!");
              }, 
              function(err) {
                console.log("Error");
                console.dir(err);
              });
        }

        /***
         * Fonction save classement in data base
         *  
         ****/
        synchroUser.prototype.saveClassement = function(data) {
            console.log('save in db'+ data);
            var self = this;
            var MyBase = app.dao.baseDAOBD;
            console.log('après ma base' + MyBase );
            MyBase.populateTruncateSQLTable();
            _.each(data, function(item){
            var currentClassement = new app.models.ClassementDataValue();
            currentClassement.set({name : item.name, score : item.score });
            currentClassement.save({success: console.log('classement')});
            })

        }

        /***
         * Fonction de récupération des récompenses drupal
         *  
         ****/
        synchroUser.prototype.retrieveRecompenseDrupal = function(uidUser) {
            var self = this;
            return $.ajax({
                    type: "GET",
                    url: SERVICE_SAUVAGESPACA + '/observation/ns_recompense/'+uidUser,
                    contentType: 'application/x-www-form-urlencoded',
                       error: function (jqXHR, textStatus, errorThrown) {
                           console.log(errorThrown);
                       },
                    success: function (data) {self.treatementRecompense(data)}
                });                 
        };


        /***
         * Fonction de récupération du classement drupal
         *  
         ****/
        synchroUser.prototype.retrieveClassementDrupal = function() {
            var self = this;
            return $.ajax({
                    type: "POST",
                    url: SERVICE_SAUVAGESPACA + '/observation/ns_score/get_classement',
                    contentType: 'application/x-www-form-urlencoded',
                       error: function (jqXHR, textStatus, errorThrown) {
                           console.log(errorThrown);
                       },
                    success: function (data) {self.saveClassement(data)}
                });                 
        };


        /***
         * Fonction delete table Trecompense
         *  
         ****/
        synchroUser.prototype.deleteTrecompense = function() {
				var recompenses = new app.models.RecompensesDataValuesCollection();
            recompenses.fetch({success: function(cRecompense) {
                _.each(cRecompense.models,function(item) {
                    item.destroy();
                });
            }});
        };
       
        /***
         * Fonction de récupération de l'objet user 
         *  
         ****/
        synchroUser.prototype.saveUID = function($uid) {
            var self = this;
            var currentUser = new app.models.User({'id': 1});
            currentUser.fetch({
                success: function(data) {
                    data.set('uid',$uid).save();
                }
            });
        }

        /***
         * Fonction de récupération drupal TODO
         *  
         ****/
        synchroUser.prototype.retrieveDrupal = function($uid) {
            //var self = this;
            this.retrieveRecompenseDrupal($uid);
            this.retrieveClassementDrupal();
            //this.retrieveMyClassementDrupal($uid);
        }

        /***
         * Fonction de récupération du mail et uid dans la base de l'appli 
         *  
         ****/
        synchroUser.prototype.mailExiste = function() {
            var self = this;
            var currentUser = new app.models.User({'id': 1});
            currentUser.fetch({
                success: function(data) {
                    var emailUser = data.get('email');
                    var uidUser = data.get('uid');
                    var valEmail = validatorsEmail(emailUser);
                    if (typeof(emailUser) !== undefined && emailUser.length !== 0 && valEmail === true) {
                        // test si il y a un uid dans la table user
                        if ( !uidUser || uidUser === 'undefined') {
                                self.mailExisteDrupal(emailUser).done(function(newUser){
                                self.retrieveDrupal(newUser.uid);
                                //self.retrieveRecompenseDrupal(newUser.uid);
                            })
                        }else{
                            self.retrieveDrupal(uidUser);
                            //self.retrieveRecompenseDrupal(uidUser);
                        }
                    }
                }
            });
        }
      //  return dfd.promise();
    }
    return synchroUser;
}) ();