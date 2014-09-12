
var NS = window.NS || {};

NS.WSDrupalAPIClient = (function() {
    "use strict";

    var wsDrupalApiClient = function (basePath) {
      this.basePath = basePath;
      this.defaultObs = {'date' : '', 'notes' :  '',
        'nom_sel' : '','num_nom_sel' : '','nom_ret' :'','num_nom_ret' : '','num_taxon' : '-1','famille' : '','referentiel' :'bdtfx',
        'latitude' : '','longitude' : '','commune_nom' :'','commune_code_insee' :'','lieudit' : '','station' : '',
        'milieu' :''};
    };
    
    /***
     * Fonction envoie par POST un ensemble d'obs aux services de tela
     *  formate les données de l'observation pour le POST
     ****/
    wsDrupalApiClient.prototype.sendSauvageObservation = function (obsToSend, cObservation, cParcours, uidUser,serviceCommune){
       // $('body').addClass('loading disabled');
        var dfd = $.Deferred();
        var observations =new Object();
        var dfdObs = $.Deferred();
        var idp = obsToSend[0].idp;
        this.treatObservations(obsToSend, cObservation,dfdObs,uidUser,serviceCommune);
           
        //Quand toutes les données sont envoyées et les obs MAJ (sended == 1) alors
        // MAJ des parcours (state == 2) et resolve du deferred
        dfdObs.done(
            _.bind(function (status) {
                console.log('when finished dfd.resolve obser per rue');
                
                this.cParcours.set('state',3);
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
              //  $('body').removeClass('loading disabled');
              return dfd.reject();
            }
        );
        return dfd.promise();
    };
    /***
     *  Fonction qui traite les observations et les envoie une par une.
     * ***/
    wsDrupalApiClient.prototype.treatObservations= function(obsToSend,cObservation, dfdObs,uidUser,serviceCommune){
        var currentobs = obsToSend.pop();
        
        var obs = _.defaults(currentobs, this.defaultObs);
        var dfdImage = $.Deferred();
        //Pour l'instant on envoie pas les images
        //if(obs.img === null || obs.img === "" || obs.img === "undefined"){
          var observations = this.formatObsToSend(obs,uidUser,serviceCommune);
          dfdImage.resolve(observations);
        //}else{
        //   this.encodeImg(obs,obs.ido,uidUser,dfdImage,serviceCommune);               
        //}         
        var self = this,
        context = {
            'ido' :  currentobs.ido, 'uidUser':uidUser,'cObservation' : cObservation, 'obsToSend':obsToSend, 'dfdObs':dfdObs , 'serviceCommune':serviceCommune
        };
        dfdImage.done(_.bind(function(observations) {
            self.sendToNSWS(observations, this.ido)
                .done(_.bind(function() {
                    if (this.obsToSend.length > 0) {
                      console.log ('traite obs suivante');
                      //traite l'obs suivante
                      self.treatObservations(this.obsToSend, this.cObservation, this.dfdObs, this.uidUser,this.serviceCommune);
                    }
                    else {
                      //Super c'est fini
                      this.dfdObs.resolve();
                    } 
                }, this))
                .fail(function(error) {
                    dfdObs.reject();
                    console.log( "dfdsendNSWS "+error.code );
                });
        }, context)).fail(function(error) {
            dfdObs.reject();
            console.log('dfdimage'+error);
        });
       
    };

    /***
     *  Fonction qui encode en base64 une image
     * ***/
    //wsTelaApiClient.prototype.encodeImg= function (obs,id,userEmail,dfdImage,serviceCommune){
    //    if (navigator.camera) {
    //        //mobile
    //        var imageURI = obs.img;
    //        var failSystem = function(error) {
    //            console.log("failed with error code: " + error.code);
    //            dfdImage.reject();
    //        };
    //        var failFile = function(error) {
    //            console.log("failed with error code: " + error.code);
    //            dfdImage.reject();
    //        };
    //        
    //        var self = this;
    //        var gotFileEntry = _.bind(function(fileEntry) {
    //            console.log("got image file entry: " +  fileEntry.toURL());
    //            fileEntry.file( _.bind(function(file) {
    //                var reader = new FileReader();
    //                reader.onloadend = _.bind(function(evt) {
    //                   console.log("Read complete!");
    //                   this.obs.image_b64 = evt.target.result;
    //                   this.obs.image_nom = this.file.name;
    //                   var observations = this.self.formatObsToSend(this.obs,this.userEmail,this.serviceCommune);
    //                   this.dfdImage.resolve(observations);
    //                }, _.extend(this, {file: file}));
    //                reader.readAsDataURL(file);
    //            }, this), failFile);
    //        }, {
    //            self: this,
    //            obs: obs,
    //            dfdImage: dfdImage,
    //            userEmail: userEmail,
    //            serviceCommune : serviceCommune
    //        });
    //        window.resolveLocalFileSystemURL(imageURI, gotFileEntry, failSystem);
    //    }else{
    //        obs.image_b64 = obs.img;
    //        obs.image_nom = 'image-obs' + id;
    //        var observations = this.formatObsToSend(obs,userEmail,serviceCommune);
    //        dfdImage.resolve(observations);
    //    }
    //};

    
     /***
     * Fonction qui formate une observation en vue de son envoie vers tela
     * ***/
    wsDrupalApiClient.prototype.formatObsToSend= function (obs,uidUser,serviceCommune){
        var observations = new Object();                     
        //Traitement de l'observation pour correspondre à la table obs du drupal de sauvages

        var myDate = new Date(obs.date).getTime()/1000;

        var observations =          {
                    'uid': uidUser,
                    'num_taxon_eflore': obs.num_nom_sel,
                    'nom_scientifique' :  obs.nom_ret,
                    'notes': obs.note,
                    'commune_nom':serviceCommune.nom ,
                    'commune_code_insee':serviceCommune.codeINSEE,           
                    'rue': obs.lieudit ,
                    'region': obs.station,                    
                    'milieu':obs.milieu ,
                    'date': myDate ,
                    'latitude': obs.latitude,
                    'longitude':obs.longitude
                  };
                        
        //if (obs.image_b64) {
        //    //Ajout des champs images
        //    json.image_nom = obs.image_nom;
        //    json.image_b64 = obs.image_b64;
        //    //Ajout des champs images dans l'objet obs par défaut
        //    this.defaultObs.image_nom = obs.image_nom;
        //    this.defaultObs.image_b64 = obs.image_b64;
        //}
        
        obs = _.omit(obs, 'ido');
        obs = _.omit(obs, 'idp');
        obs = _.omit(obs, 'img');
        
        //Ajout des données supplémentaires associées à sauvages
        //@TODO gestion des undefined
        //var additionalValues = _.difference(_.keys(obs), _.keys(this.defaultObs));
        //
        //this.defaultObs = _.omit(this.defaultObs, 'image_nom');
        //this.defaultObs = _.omit(this.defaultObs, 'image_b64');
        //
        //var idAd;
        //for (idAd in additionalValues) {
        //    if (! json['obs_etendue']) json['obs_etendue'] = new Array();
        //    json['obs_etendue'].push({ 'cle': additionalValues[idAd], 'label': additionalValues[idAd], 'valeur' : obs[additionalValues[idAd]] });
        //}
        //     
        //observations['obsId1'] = json;
            
        ////@TODO traiter la réponse
        ////Gestion des deferreds
        //observations['projet'] = this.tagprojet;
        //observations['tag-obs'] = this.tagobs;
        //observations['tag-img'] = this.tagimg;
        //
        //observations['utilisateur'] = {
        //    'id_utilisateur': null,
        //    'prenom': null,
        //    'nom': null,
        //    'courriel': userEmail
        //}
        return observations;
    };
    
    /***
    * Fonction génère la requete  POST d'envoie d'une obs aux services de tela
    * ***/
    wsDrupalApiClient.prototype.sendToNSWS= function (obs, id_obs) {
        var msg = '';
        var erreurMsg = '';
        return $.ajax({
            url : this.basePath +"/observation/obs",
            type : 'POST',
            data : JSON.stringify(obs),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            success : function(data,textStatus,jqXHR){},
            error : function(jqXHR, textStatus, errorThrown) {
                sauvages.notifications.sendToTelaWSFail('Erreur Ajax de type : ' + textStatus + '\n' + errorThrown + '\n');
                msg = 'Erreur indéterminée. Merci de contacter le responsable.';
                erreurMsg += 'Erreur Ajax de type : ' + textStatus + '\n' + errorThrown + '\n';
                try {
                 var reponse = jQuery.parseJSON(jqXHR.responseText);
                 if (reponse != null) {
                  $.each(reponse, function (cle, valeur) {
                   erreurMsg += valeur + '\n';
                  });
                 }
                } catch(e) {
                 erreurMsg += 'L\'erreur n\'était pas en JSON.';
                }
                console.log(erreurMsg);
            }
      });
     // return $.Deferred().resolve();
    }

    return wsDrupalApiClient;
}) ();
