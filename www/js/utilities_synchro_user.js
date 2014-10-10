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
         * Fonction création de compote sur le site sauvages de paca retourne UID
         *  
         ****/
        
        synchroUser.prototype.registerUser = function(mail) {
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
                    success: function (data) {console.log(data)}
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
                    success: function (data) {console.log(data)}
                });                 
        };

        /***
         * Fonction de traitements des récompenses récupérées sur le web
         *  
         ****/
        synchroUser.prototype.treatementRecompense = function(data) {
            console.log(data);
        }

        /***
         * Fonction de test du mail du site sauvages de paca
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
                    if (typeof(emailUser) !== 'undefined' && emailUser.length !== 0 && valEmail === true) {
                        // test si il y a un uid dans la table user
                        if (uidUser.length === 0 || uidUser === 'undefined') {
                            self.mailExisteDrupal(emailUser).done(function(newUser){
                                self.retrieveRecompenseDrupal(newUser.uid);
                                data.set('uid',newUser.uid).save();
                            })
                        }else{
                            self.retrieveRecompenseDrupal(uidUser);
                        }
                    }
                }
            });
        }
        return dfd.promise();
    }
    return synchroUser;
}) ();