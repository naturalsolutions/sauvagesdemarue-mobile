/*
 * Traitements et Tests avant l'envoi aux Web Services de Tela Botanica et Drupal NS pour répondre au protocol Sauvages de ma rue.
 * Variables:
 * - idRue = identifiant de la rue (l'envoi des obs Sauvages est attaché à une rue)
 * - cParcours = objet parcours
 * - cObservation = collection d'observations à envoyer
 *
 * Dependances :
 * - backbone.js, twitter bootstrap
 */


var NS = window.NS || {};

NS.SendOBS = (function() {
    "use strict";

    var sendObs = function (idRue,cParcours,cObservation) {
      this.idRue = idRue;
      this.cParcours = cParcours;
      this.cObservation = cObservation;
    };
    
    /***
     * Fonction de récupération de la collection Observation à partir de l'id de la rue 
     *  
     ****/

    /***
     * Fonction de récupération de la collection (ou model?) parcours à partir de l'id de la rue 
     *  
     ****/

    /***
     * View du Modal de confirmation de l'envoi des observations 
     *  
     ****/

    sendObs.prototype.confirmModal = function() {
        var dfd = $.Deferred();
        var connect = checkConnection();
        if (connect === '2G' || connect === 'Cell' || connect === 'wifi' || connect === true){
            var self = this;
            var msg = _.template(
                  "<form role='form form-inline'>"+
                   "<div class='form-group'>"+
                   "		<p>L'envoi des observations requiert une connexion à haut débit (H+, 4G, wifi).</p>"+
                   "</div>"+
                   "<button type='submit' id='submitEmail' class='btn btn-primary'>Envoyer vos données !</button>"+
                  "</form>"					
                );
            var confirmationModal = new NS.UI.NotificationModal({
                type: '',
                title: 'Êtes-vous vous connecté à un réseau à haut débit ?',
                message:  msg(),
                delay: '',
                btnLabel: '',
                onClose: function() {
                   $('#nodal').modal('hide');
                   $('#nodal').remove();
                   $('.modal-backdrop').remove();
                   $('body').removeClass('modal-open');
                    dfd.reject();
                }
            });
            confirmationModal.$el.on('submit', 'form', _.bind(function(evt) {
               evt.preventDefault();
               $('#nodal').modal('hide');
               $('#nodal').remove();
               $('.modal-backdrop').remove();
               $('body').removeClass('modal-open');
                dfd.resolve();
            }, confirmationModal));
            //$('#myModal').on('hidden.bs.modal', function () {
            //   $('#nodal').modal('hide');
            //   $('#nodal').remove();
            //   $('.modal-backdrop').remove();
            //   $('body').removeClass('modal-open');
            //});
        }else if(connect === 'inconnu'||connect === "none" || connect === false || connect === undefined){
            sauvages.notifications.connection();
            dfd.reject();
        }else if (connect === '4G' || connect === '3G') {
            dfd.resolve();
        }
        return dfd.promise();
    };


    /***
     * Fonction de recherche de commune à partir des coordonnées géographiques 
     *  
     ****/
    sendObs.prototype.appelServiceCommuneTela = function (latParcours,longParcours,callback){
        if (latParcours && longParcours) {
          var serviceCommune,
          lat = latParcours,
          lng = longParcours;
          
          var url_service = SERVICE_NOM_COMMUNE_URL;
          var urlNomCommuneFormatee = url_service.replace('{lat}', lat).replace('{lon}', lng);
          var jqxhr = $.ajax({
           url : urlNomCommuneFormatee,
           type : 'GET',
           dataType : 'jsonp',
           success : function(data) {
            console.log('NOM_COMMUNE found.');
            console.log(data['nom']);
            console.log(data['codeINSEE']);
            serviceCommune = data;
            if(typeof callback === "function") callback(serviceCommune);
           }
          });
        } else {
          console.log("Cette observation n'a pas d'information de géolocalisation.")
        }
    };

    /***
     * Fonction création de compote sur le site sauvages de paca retourne UID
     *  
     ****/

    
    sendObs.prototype.registerUser = function(mail, callback) {
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
     *  Fonction d'envoie des observations à l'utilitaire de Web Services.
     * ***/

    sendObs.prototype.envoiUtilitaireWS = function (idRue,cParcours,cObservation){
        var self = this;
        var dfd = $.Deferred();
        var obsTosend ;
        var emailUser;
        var uidUser;
        var dfdCollection = $.Deferred();
        var dfdCompteNS = $.Deferred();
        this.confirmModal().done(function(){
            if (typeof cObservation === "undefined") {
              var myObsColl = new app.models.OccurenceDataValuesCollection();
              myObsColl.fetch({
                success: function(data) {
                  var results = data.where({'fk_rue':idRue});
                  cObservation = new Backbone.Collection(results);
                  dfdCollection.resolve();
                }
              });
            }else{
              dfdCollection.resolve();
            }
            
            dfdCollection.done(function(){
              var currentUser = new app.models.User({'id': 1});
              currentUser.fetch({
                success: function(data) {
                  emailUser = data.get('email');
                  uidUser = data.get('uid');
                  var valEmail = validatorsEmail(emailUser);
                  if (typeof(emailUser) !== 'undefined' && emailUser.length !== 0 && valEmail === true) {
                    // test si il y a un uid dans la table user
                    if (typeof uidUser === 'undefined' || !uidUser) {
                        var wsNSsynchro = new NS.SynchroUser();
                        wsNSsynchro.mailExisteDrupal(data.get('email')).done(function(newUser){
                            data.set('uid',newUser.uid).save().done(function(){
                                uidUser = newUser.uid;
                                dfdCompteNS.resolve()
                            })
                        });

                    }else{dfdCompteNS.resolve()};
                    var latParcours = cParcours.get('begin_latitude');												
                    var longParcours = cParcours.get('begin_longitude');												
                    self.appelServiceCommuneTela(latParcours,longParcours,function(serviceCommune){                      
                        app.utils.queryData.getObservationsTelaWSFormated(idRue)
                            .done(
                              function(dataWS) {
                                if (dataWS.length !== 0 ) {
                                  //Send to tela via cel ws
                                  var wstela = new NS.WSTelaAPIClient(SERVICE_SAISIE_URL, TAG_IMG, TAG_OBS, TAG_PROJET);
                                  wstela.sendSauvageObservation(dataWS, cObservation, cParcours, emailUser,serviceCommune).done(function() {
                                    setTimeout(function(){$('#content').scrollTop(0);},100);
                                    dfd.resolve();
                                  });
                                    setTimeout(function(){$('#content').scrollTop(0);},100);
                                }else{
                                  alert("Il n'y a pas d'observations à envoyer.");
                                  dfd.reject();
                                }		
                              }
                            )
                            .fail(function(msg) {
                              console.log(msg);
                              dfd.reject();
                            });
                            dfd.done(function(){                     
                                dfdCompteNS.done(function(){
                                    app.utils.queryData.getObservationsPacaWSFormated(idRue)
                                        .done(function(dataWSpaca){
                                           var wspaca = new NS.WSDrupalAPIClient(SERVICE_SAUVAGESPACA);                            
                                            wspaca.sendSauvageObservation(dataWSpaca, cObservation, cParcours, uidUser,serviceCommune).done(function() {
                                                console.log(' envoi effectué vers sauvages de paca');
                                            })
                                        });                        
                                });
                            });
                        });
                  }else{
                    var newUser = new app.models.User();
                    var msg = _.template(
                      "<form role='form form-inline'>"+
                       "<div class='form-group'>"+
                       "		<p>Ajouter votre email, vous permettra de retrouver vos observations sur le site Sauvages de ma Rue.</p>"+
                       '	<div class="input-group input-group-lg">'+
                       '  <span class="input-group-addon"><span class="glyphicon glyphicon-user"></span></span>'+
                       "		<label for='InputEmail' class='sr-only'>Adresse email</label>"+
                       "		<input type='email' class='form-control' id='InputEmail' placeholder='Entrer votre email'>"+
                       "	</div>"+
                       "</div>"+
                       "<button type='submit' id='submitEmail' class='btn btn-primary'>Valider</button>"+
                      "</form>"					
                     );
                    sauvages.notifications.email(msg(),newUser,idRue,cParcours);
                    $('.modal-footer').addClass("hide");
                    dfd.reject();
                  }
                }
              });
            })
        });
        return dfd.promise();
    };
    return sendObs;
}) ();
