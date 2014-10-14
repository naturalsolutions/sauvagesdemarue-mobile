
var NS = window.NS || {};

NS.WSTelaAPIClient = (function() {
    "use strict";

    var wsTelaApiClient = function (basePath, tagimg, tagobs, tagprojet) {
      this.basePath = basePath;
      this.tagimg = tagimg;
      this.tagobs = tagobs;
      this.tagprojet = tagprojet;
      this.defaultObs = {'date' : '', 'notes' :  '',
        'nom_sel' : '','num_nom_sel' : '','nom_ret' :'','num_nom_ret' : '','num_taxon' : '-1','famille' : '','referentiel' :'bdtfx',
        'latitude' : '','longitude' : '','commune_nom' :'','commune_code_insee' :'','lieudit' : '','station' : '',
        'milieu' :'','abondance' : '','phenologie' :'','certitude' :''};
    };
    
    /***
     * Fonction envoie par POST un ensemble d'obs aux services de tela
     *  formate les données de l'observation pour le POST
     ****/
    wsTelaApiClient.prototype.sendSauvageObservation = function (obsToSend, cObservation, cParcours, userEmail,serviceCommune){
        $('body').addClass('loading disabled');
        //$('body').append("<button class='annulerEnvoi' type=''>Annuler</button>");
        var dfd = $.Deferred();
        var observations =new Object();
        var dfdObs = $.Deferred();
        var idp = obsToSend[0].idp;
        this.treatObservations(obsToSend, cObservation,dfdObs,userEmail,serviceCommune);
           
        //Quand toutes les données sont envoyées et les obs MAJ (sended == 1) alors
        // MAJ des parcours (state == 2) et resolve du deferred
        dfdObs.done(
            _.bind(function (status) {
                console.log('when finished dfd.resolve obser per rue');
                
                this.cParcours.set('state',2);
                this.cParcours.save().done(
                    function (a) {
                        return dfd.resolve();
                    }
                );
                $('body').removeClass('loading disabled');
            }, {'idp':idp, 'cParcours':cParcours})
        );
        
        dfdObs.fail( 
            function (status) {
                $('body').removeClass('loading disabled');
                return dfd.reject();
            }
        );
        return dfd.promise();
    };
    /***
     *  Fonction qui traite les observations et les envoie une par une.
     * ***/
    wsTelaApiClient.prototype.treatObservations= function(obsToSend,cObservation, dfdObs,userEmail,serviceCommune){
        
        var currentobs = obsToSend.pop();
        var obs = _.defaults(currentobs, this.defaultObs);
        var dfdImage = $.Deferred();
        if(obs.img === null || obs.img === "" || obs.img === "undefined"){
            var observations = this.formatObsToSend(obs,userEmail,serviceCommune);
            dfdImage.resolve(observations);
        }else{
            this.encodeImg(obs,obs.ido,userEmail,dfdImage,serviceCommune);               
        }          
        var self = this,
        context = {
            'ido' :  currentobs.ido, 'userEmail':userEmail,'cObservation' : cObservation, 'obsToSend':obsToSend, 'dfdObs':dfdObs , 'serviceCommune':serviceCommune
        };
        dfdImage.done(_.bind(function(observations) {
            self.sendToTelaWS(observations, this.ido)
                .done(_.bind(function() {
                    // Mise a jour de l'obs sended = 1
                    this.cObservation.get(this.ido).set('sended',1);
                    this.cObservation.get(this.ido).save().done(
                        _.bind(function() {
                            if (this.obsToSend.length > 0) {
                                
                                console.log ('reste ' + this.obsToSend.length + 'obs');
                                //traite l'obs suivante
                                self.treatObservations(this.obsToSend, this.cObservation, this.dfdObs, this.userEmail,this.serviceCommune);
                            }
                            else {
                                //Super c'est fini
                                console.log ('super');
                                this.dfdObs.resolve();
                            }
                        }, this)    
                    )           
                }, this))
                .fail(function(error) {
                    dfdObs.reject();
                    console.log( "dfdsendTelaWS"+error.code );
                });
        }, context)).fail(function(error) {
            dfdObs.reject();
            console.log('dfdimage'+error);
        });
       
    };

    /***
     *  Fonction qui encode en base64 une image
     * ***/
    wsTelaApiClient.prototype.encodeImg= function (obs,id,userEmail,dfdImage,serviceCommune){
        if (navigator.camera) {
            //mobile
            var imageURI = obs.img;
            var failSystem = function(error) {
                console.log("failed with error code: " + error.code);
                dfdImage.reject();
            };
            var failFile = function(error) {
                console.log("failed with error code: " + error.code);
                dfdImage.reject();
            };
            
            var self = this;
            var gotFileEntry = _.bind(function(fileEntry) {
                console.log("got image file entry: " +  fileEntry.toURL());
                fileEntry.file( _.bind(function(file) {
                    var reader = new FileReader();
                    reader.onloadend = _.bind(function(evt) {
                       console.log("Read complete!");
                       this.obs.image_b64 = evt.target.result;
                       this.obs.image_nom = this.file.name;
                       var observations = this.self.formatObsToSend(this.obs,this.userEmail,this.serviceCommune);
                       this.dfdImage.resolve(observations);
                    }, _.extend(this, {file: file}));
                    reader.readAsDataURL(file);
                }, this), failFile);
            }, {
                self: this,
                obs: obs,
                dfdImage: dfdImage,
                userEmail: userEmail,
                serviceCommune : serviceCommune
            });
            window.resolveLocalFileSystemURL(imageURI, gotFileEntry, failSystem);
        }else{
            obs.image_b64 = obs.img;
            obs.image_nom = 'image-obs' + id;
            var observations = this.formatObsToSend(obs,userEmail,serviceCommune);
            dfdImage.resolve(observations);
        }
    };

    
     /***
     * Fonction qui formate une observation en vue de son envoie vers tela
     * ***/
    wsTelaApiClient.prototype.formatObsToSend= function (obs,userEmail,serviceCommune){
        var observations = new Object();

        var obslieudit = obs.lieudit.toString().split(',');

        //Traitement de l'observation
        var json = {
            'date' : obs.date, 
            'notes' : (obs.ido === -1) ? 'rue sans observation; '+obs.notes: obs.notes,
            'nom_sel' : obs.nom_ret ,
            'num_nom_sel' : obs.num_nom_sel,
            'nom_ret' : obs.nom_ret,
            'num_nom_ret' : obs.num_nom_ret,
            'num_taxon' : obs.num_taxon,
            'famille' : obs.famille ,
            'referentiel' : obs.referentiel ,
            'latitude' : (obs.latitude !== null) ? obs.latitude : obs.latitudeDebutRue,
            'longitude' : (obs.longitude !== null) ? obs.longitude : obs.longitudeDebutRue,
            'commune_nom' :serviceCommune.nom,
            'commune_code_insee' : serviceCommune.codeINSEE,
            'lieudit' : obslieudit[0] ,
            'station' : obslieudit[0] ,
            'milieu' : obs.milieu,
            'abondance' : obs.abondance,
            'phenologie' : obs.phenologie,
            'certitude' : obs.certitude
        };
                        
        if (obs.image_b64) {
            //Ajout des champs images
            json.image_nom = obs.image_nom;
            json.image_b64 = obs.image_b64;
            //Ajout des champs images dans l'objet obs par défaut
            this.defaultObs.image_nom = obs.image_nom;
            this.defaultObs.image_b64 = obs.image_b64;
        }
        
        obs = _.omit(obs, 'ido');
        obs = _.omit(obs, 'idp');
        obs = _.omit(obs, 'img');
        
        //Ajout des données supplémentaires associées à sauvages
        //@TODO gestion des undefined
        var additionalValues = _.difference(_.keys(obs), _.keys(this.defaultObs));
        
        this.defaultObs = _.omit(this.defaultObs, 'image_nom');
        this.defaultObs = _.omit(this.defaultObs, 'image_b64');

        var idAd;
        for (idAd in additionalValues) {
            if (! json['obs_etendue']) json['obs_etendue'] = new Array();
            json['obs_etendue'].push({ 'cle': additionalValues[idAd], 'label': additionalValues[idAd], 'valeur' : obs[additionalValues[idAd]] });
        }
             
        observations['obsId1'] = json;
            
        //@TODO traiter la réponse
        //Gestion des deferreds
        observations['projet'] = this.tagprojet;
        observations['tag-obs'] = this.tagobs;
        observations['tag-img'] = this.tagimg;
        
        observations['utilisateur'] = {
            'id_utilisateur': null,
            'prenom': null,
            'nom': null,
            'courriel': userEmail
        }
        return observations;   
    };
    

    /***
    * Fonction génère la requete  POST d'envoie d'une obs aux services de tela
    * ***/
    wsTelaApiClient.prototype.sendToTelaWS= function (obs, id_obs) {
        var msg = '';
        var erreurMsg = '';
      //  return $.ajax({
      //      url : this.basePath,
      //      type : 'POST',
      //      data : obs,
      //      dataType : 'json',
      //      success : function(data,textStatus,jqXHR){
      //          sauvages.notifications.sendToTelaWSSuccess();
      //      },
      //      error : function(jqXHR, textStatus, errorThrown) {
      //          sauvages.notifications.sendToTelaWSFail('Erreur Ajax de type : ' + textStatus + '\n' + errorThrown + '\n');
      //          msg = 'Erreur indéterminée. Merci de contacter le responsable.';
      //          erreurMsg += 'Erreur Ajax de type : ' + textStatus + '\n' + errorThrown + '\n';
      //          try {
      //           var reponse = jQuery.parseJSON(jqXHR.responseText);
      //           if (reponse != null) {
      //            $.each(reponse, function (cle, valeur) {
      //             erreurMsg += valeur + '\n';
      //            });
      //           }
      //          } catch(e) {
      //           erreurMsg += 'L\'erreur n\'était pas en JSON.';
      //          }
      //          console.log(erreurMsg);
      //      }
      //});
      return $.Deferred().resolve();
    }

    return wsTelaApiClient;
}) ();
