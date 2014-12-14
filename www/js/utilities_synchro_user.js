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
         * Fonction création de compte sur le site sauvages de paca retourne UID TODO
         *  
         ****/
   
        //Détruire la base utilisateur ou vider 
     
        synchroUser.prototype.registerUser = function(mail,name) {
            var self = this;
            var user = {
                        "mail": mail, 
                        "conf_mail": mail,
                        "name": name,
                        "account" :{        
                            "mail": mail, 
                            "conf_mail": mail,
                            "name": name,
                           }
                       }
            return $.ajax({
                     type: "POST",
                     url: SERVICE_SAUVAGESPACA + '/observation/obs_user',
                     dataType: 'json',
                     data: JSON.stringify(user),
                     contentType: 'application/json',
                        error: function (jqXHR, textStatus, errorThrown) {
                            if (jqXHR.status === 406) {
                               app.globals.currentUser.unset('name');
                            }
                            alert(errorThrown);
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
        synchroUser.prototype.printCreateAccount = function(emailUser,nameUser){
            var msg = _.template(
                  "<form role='form form-inline'>"+
                   "<div class='form-group'>"+
                   "		<p>Le compte "+ emailUser +" n'existe pas.<br/> Voulez vous le créer ?</p>"+
                   "</div>"+
                   "<button type='submit' class='btn btn-success'>Créer le compte</button>"+
                   "<button type='reset' class='btn btn-default pull-right'>Modifier l'email</button>"+
                  "</form>"					
                );
            sauvages.notifications.createAccount(msg(),emailUser,nameUser);
        };




        /***
         * Fonction affiche modal recupération d'un compte existant sur le web
         *  
         ****/
        synchroUser.prototype.printRetrieveAccount = function(userDrupal,dfd){
            $('body').removeClass('disabled');
            var msg = _.template(
                  "<form role='form form-inline'>"+
                   "<div class='form-group'>"+
                   "		<p>Le compte "+ userDrupal +" existe sur Sauvages de Paca.<br/> Voulez vous récupérer ce compte ?</p>"+
                   "</div>"+
                   "<button type='submit' class='btn btn-success'>Recupérer le compte</button>"+
                   "<button type='reset' class='btn btn-default pull-right'>Modifier l'email</button>"+
                  "</form>"					
                );
            sauvages.notifications.retrieveAccount(msg(),dfd);
        };

        /***
         * Fonction affiche modal recupération d'un compte existant sur le web
         *  
         ****/
        synchroUser.prototype.printSynchroRetrieveAccount = function(userDrupal){
            var msg = _.template(
                  "<form role='form form-inline'>"+
                   "<div class='form-group'>"+
                   "		<p>Le compte "+ userDrupal.mail +" existe sur Sauvages de Paca.<br/> Voulez vous récupérer ce compte ?</p>"+
                   "</div>"+
                   "<button type='submit' class='btn btn-success'>Recupérer le compte</button>"+
                   "<button type='reset' class='btn btn-default pull-right'>Modifier l'email</button>"+
                  "</form>"					
                );
            sauvages.notifications.synchroRetrieveAccount(msg(),userDrupal);
        };

        /***
         * Fonction qui retoune le numéro de status de l'erreur ajax
         *  
         ****/
        synchroUser.prototype.errorStatus = function(status,emailUser,nameUser){
            console.log(status);
            switch(status) {
                case 404:
                    this.printCreateAccount(emailUser,nameUser);
                    break;
                default:
                    console.log(status);
            }
        };
    
        /***
         * Fonction de test du mail du site sauvages de paca
         *  
         ****/
        synchroUser.prototype.synchroMailExisteDrupal = function(emailUser, nameUser) {
            var self = this;
            return $.ajax({
                    type: "GET",
                    url: SERVICE_SAUVAGESPACA + '/observation/obs_user/retrieve',
                    data: 'mail='+ emailUser,
                    contentType: 'application/x-www-form-urlencoded',
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                        self.errorStatus(jqXHR.status,emailUser,nameUser);
                    },
                    success: function (data) {
                        // affiche c'est votre compte ? et propose de mettre à jour l'app
                        this.printRetrieveAccount(emailUser);
                        ////update Tuser with uid and name
                        //app.globals.currentUser.set('uid',data.uid)
                        //.save();
                        //app.globals.currentUser.set('name',data.name)
                        //.save();
                    }
                });                 
        };


        /***
         * Fonction de test du mail du site sauvages de paca
         *  
         ****/
        synchroUser.prototype.mailExisteDrupal = function(emailUser, nameUser) {
            var self = this;
            return $.ajax({
                    type: "GET",
                    url: SERVICE_SAUVAGESPACA + '/observation/obs_user/retrieve',
                    data: 'mail='+ emailUser,
                    contentType: 'application/x-www-form-urlencoded',
                    error: function (jqXHR, textStatus, errorThrown) {
                    },
                    success: function (data) {
                    }
                });                 
        };

        /***
         * Fonction de test du pseudo du site sauvages de paca
         *  
         ****/
        synchroUser.prototype.nameExisteDrupal = function(nameUser) {
            var dfd = $.Deferred();
            var self = this;
            return $.ajax({
                    type: "POST",
                    url: SERVICE_SAUVAGESPACA + '/observation/obs_user/retrievename?name='+ nameUser,
                    contentType: 'application/x-www-form-urlencoded',
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                        
                        //lancer update du nom
                    },
                    success: function (data) {
                        alert('pseudo existe');
                        //le pseudo existe dejà remettre le champ à la valeur de la bd
                    }
                });                 
        };

        /***
         * Fonction de MAJ du pseudo sur le site sauvages de paca
         *  
         ****/

        synchroUser.prototype.updateDrupalName = function(uid,email,name) {
            var user = {
                        "name": name,
                        "mail": email,
                        "account" :{        
                            "name": name,
                            "mail": email
                           }
                       }
            var self = this;
            return $.ajax({
                    type: "PUT",
                    url: SERVICE_SAUVAGESPACA + '/observation/obs_user/uid='+uid,
                     dataType: 'json',
                     data: JSON.stringify(user),
                     contentType: 'application/json',
                        error: function (jqXHR, textStatus, errorThrown) {
                            if (jqXHR.status === 406) {
                               app.globals.currentUser.unset('name');
                            }
                            alert(errorThrown);
                        },
                        success: function (data) {
                        }
                });                 
        };

        synchroUser.prototype.updateDrupal = function(uid,email,name) {
            //var name = app.globals.currentUser.get('name');
            var user = {
                        "name": name,
                        "mail": email,
                        "account" :{        
                            "mail": email,
                            "name": name,
                           }
                       }
            var self = this;
            return $.ajax({
                    type: "PUT",
                    url: SERVICE_SAUVAGESPACA + '/observation/obs_user/uid='+uid,
                     dataType: 'json',
                     data: JSON.stringify(user),
                     contentType: 'application/json',
                        error: function (jqXHR, textStatus, errorThrown) {
                            if (jqXHR.status === 406) {
                               app.globals.currentUser.unset('email');
                            }
                            alert(errorThrown);
                        },
                        success: function (data) {
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
        }

        /***
         * Fonction de test if this type of recompense exits
         *  
         ****/
        synchroUser.prototype.testRecompenseExist= function (recompense){
            var self = this;
            var isRecompense = app.globals.collectionRecompense.findWhere({"title": recompense.filename});
            if(!isRecompense) self.saveFileImg(recompense);
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
                app.globals.collectionRecompense.add(file);
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
            app.globals.collectionRecompense.add(file);
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
            var self = this;
            var compteur = 0;
            //TODO Pourquoi
            var MyBase = app.dao.baseDAOBD;
            MyBase.populateTruncateSQLTable();
            app.globals.collectionClassementNational.reset();
            _.each(data, function(item){
                var currentClassement = new app.models.ClassementDataValue();
                currentClassement.set({name : item.name, score : item.score , uid : item.uid, rank : item.rank });
                currentClassement.save({success: compteur += 1});
                app.globals.collectionClassementNational.add(currentClassement);
                if (compteur == data.length) {
                    self.dataEnBase();
                }
            })

        }

        /***
         * Fonction de synchro view données retourne collection
         *  
         ****/
        synchroUser.prototype.dataEnBase = function(collection) {
            var dfd = $.Deferred();
            dfd.resolve(); 
            return dfd.promise();   
        };



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
                    success: function (data) {
                        self.saveClassement(data)
                    }
                });                 
        };

      /***
         * Fonction de récupération de Mon classement drupal
         *  
         ****/
        synchroUser.prototype.retrieveMyClassementDrupal = function($uid) {
            var self = this;
            return $.ajax({
                    type: "POST",
                    url: SERVICE_SAUVAGESPACA + '/observation/ns_score/get_my_classement/'+$uid,
                    contentType: 'application/x-www-form-urlencoded',
                       error: function (jqXHR, textStatus, errorThrown) {
                        //TODO gestion des erreurs avec errorThrown : ERR_CONNECTION_TIMED_OUT
                           console.log(errorThrown);
                           console.log(jqXHR);

                       },
                    success: function (data) {return data}
                });                 
        };


        /***
         * Fonction delete table Trecompense
         *  
         ****/
        synchroUser.prototype.deleteTrecompense = function() {
            app.globals.collectionRecompense.reset();
            _.each(app.globals.collectionRecompense.models,function(item) {
                item.destroy();
            });
        };
       
        /***
         * Fonction de récupération de l'objet user 
         *  
         ****/
        synchroUser.prototype.saveUID = function($uid) {
            app.globals.currentUser.set('uid',$uid).save();
        }

        /***
         * Fonction de récupération drupal
         *  
         ****/
        synchroUser.prototype.retrieveDrupal = function($uid) {
            this.retrieveRecompenseDrupal($uid);
            this.retrieveMyClassementDrupal($uid);
        }

        /***
         * Fonction de lancement de la synchro 
         *  
         ****/
        synchroUser.prototype.lanceSynchro = function() {
            //pas besoin de compte pour avoir le classement national
            this.retrieveClassementDrupal();
            var self = this;
            var emailUser = app.globals.currentUser.get('email');
            var uidUser = app.globals.currentUser.get('uid');
            var name =  app.globals.currentUser.get('name');
            var valEmail = validatorsEmail(emailUser);
            if (valEmail === true) {
                // test si il y a un uid dans la table user
                if ( !uidUser || uidUser === 'undefined') {
                    self.synchroMailExisteDrupal(emailUser,name).done(function(newUser){
                        self.retrieveDrupal(newUser.uid);
                        self.saveUID(newUser.uid);
                    })
                }else{
                    self.retrieveDrupal(uidUser);
                }
            }
        }
    }
    return synchroUser;
}) ();