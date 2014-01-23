
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
     //@TODO catcher les erreurs ajax
    wsTelaApiClient.prototype.sendSauvageObservation = function (obsToSend, cObservation, cParcours){
        $("body").find("a,button").addClass("disabled");
        $("#content").append("<img id='dataloader-img' src='css/images/ajax-loader.gif'/>");
        var dfd = $.Deferred();
        var observations =new Object();
        //Traitement parcours par parcours
        var obsPerParcours = _.groupBy(obsToSend,function(item,key,list){
            console.log(item.idp);   
            return item.idp;
        });
        var dfdObs= [];
        var nbSavePerObs = new Array();
        var nbObsSent;
        var nbObsTheorique;
        for (var idp in obsPerParcours) {
            //Test si les rues sont vides, modifier la requete si confirmation de Tela de ne pas les envoyer
            if(obsPerParcours[idp][0].ido !== -1){
                if(obsPerParcours[idp][0].longitudeFinRue !== "undefined" && obsPerParcours[idp][0].latitudeFinRue !== "undefined"){
                nbSavePerObs[idp] = {'nbObsTheorique' : obsPerParcours[idp].length, 'nbObsSent': 0};
                for (var id in obsPerParcours[idp]) {
                    var obs = _.defaults(obsPerParcours[idp][id], this.defaultObs);
                    var dfdImage = $.Deferred(),
                    dfdObservation = $.Deferred();
                    dfdObs.push(dfdObservation);
        
                    if(obs.img === null || obs.img === ""){
                        var observations = this.formatObsToSend(obs);
                        dfdImage.resolve(observations);
                    }else{
                        if (navigator.camera) {
                        //mobile
                            var imageURI = obs.img;
                            if(device.platform === 'iOS'){var imageURI = 'file://' + obs.img;}
                            console.log(imageURI);
                            var failSystem = function(error) {
                                console.log("failed with error code: " + error.code);
                                dfdImage.reject();
                            };
                            var failFile = function(error) {
                                console.log("failed with error code: " + error.code);
                                dfdImage.reject();
                            };
                            
                            var self = this;
                            var gotFileEntry = function(fileEntry) {
                                console.log("got image file entry: " +  fileEntry.fullPath);
                                fileEntry.file( function(file) {
                                    var reader = new FileReader();
                                    reader.onloadend = function(evt) {
                                       console.log("Read complete!");
                                       obs.image_b64 = evt.target.result;
                                       obs.image_nom = file.name;
                                       var observations = self.formatObsToSend(obs);
                                       dfdImage.resolve(observations);
                                    };
                                    reader.readAsDataURL(file);
                                }, failFile);
                            };
                            window.resolveLocalFileSystemURI(imageURI, gotFileEntry, failSystem);
                            }else{
                                obs.image_b64 = obs.img;
                                obs.image_nom = 'image-obs' + id;
                                var observations = this.formatObsToSend(obs);
                                dfdImage.resolve(observations);
                            }                
                    }
        
                    var self = this;
                    dfdImage.done(function(observations) {
                  self.sendToTelaWS(observations, obsPerParcours[idp][id].ido)
                    .done(_.bind(function() {
                        // Mise a jour de l'obs sended = 1
                        this.nbSavePerObs[this.idp]['nbObsSent'] += 1
                        if (this.ido !== -1 ) {
                            this.cObservation.get(this.ido).set('sended',1);
                            this.dfdObs.push(this.cObservation.get(this.ido).save());
                        }
                        else {
                            this.dfdObs.push(new $.Deferred().resolve());
                        }
                        dfdObservation.resolve();
                    }, {
                        'nbSavePerObs':nbSavePerObs, 'ido' :  obsPerParcours[idp][id].ido, 
                        'idp' : idp, 'cObservation' : cObservation, 'dfdObs' : dfdObs
                        }
                    ))
                    .fail(function() {
                        var self = this;
                        dfdObservation.reject();
                        console.log( "error" );
                        console.log (self.nbSavePerObs[this.idp]['nbObsSent']  + '/' + self.nbSavePerObs[this.idp]['nbObsSent'] );
                    });
                    }).fail(function() {
                        dfdObservation.reject();
                    });
            }
                }else{
                    alert("La rue " + obsPerParcours[idp][0].lieudit + " n'est pas terminée.");
                    app.route.navigate('addParcours', {trigger: true}); 
                }
            }else{
                alert("La rue " + obsPerParcours[idp][0].lieudit + " ne contient pas d'observation à partager.");   
            }       
        }
        //Quand toutes les données sont envoyées et les obs MAJ (sended == 1) alors
        // MAJ des parcours et resolve du deferred
        $.when.apply(this, dfdObs).then(
            function (status) {
              var dfdParcours= [];
              console.log('when finished dfd.resolve obser per rue');
              for (var idp in nbSavePerObs) {
                if (nbSavePerObs[idp]['nbObsSent'] == nbSavePerObs[idp]['nbObsTheorique']) {
                    cParcours.get(obsPerParcours[idp][0].idp).set('sended',1);
                    dfdParcours.push(cParcours.get(obsPerParcours[idp][0].idp).save());
                }   
              }
                $('#dataloader-img').remove();
                $("body").find("a,button").removeClass("disabled");
              $.when.apply(this, dfdParcours).then(
                function (a) {
                    return dfd.resolve();
                }
              );
            },
            
            function (status) {
                $('#dataloader-img').remove();
                $("body").find("a,button").removeClass("disabled");
                return dfd.reject();
            }
        );
        return dfd.promise();
    };

    /***
     *  Fonction qui encode en base64 une image
     * ***/
    wsTelaApiClient.prototype.encodeImg= function (){
    };
    
     /***
     * Fonction qui formate une observation en vue de son envoie vers tela
     * ***/
    wsTelaApiClient.prototype.formatObsToSend= function (obs){
        var observations = new Object();
                       
        //Traitement de l'observation
        var json = {
            'date' : obs.date, 
            'notes' : (obs.ido === -1) ? 'rue sans observation; '+obs.note: obs.note,
            'nom_sel' : obs.nom_sel,
            'num_nom_sel' : obs.num_nom_sel,
            'nom_ret' : obs.nom_ret,
            'num_nom_ret' : obs.num_nom_ret,
            'num_taxon' : obs.num_taxon,
            'famille' : obs.famille ,
            'referentiel' : obs.referentiel ,
    
            'latitude' : (obs.latitude !== null) ? obs.latitude : obs.latitudeDebutRue,
            'longitude' : (obs.longitude !== null) ? obs.longitude : obs.longitudeDebutRue,
            'commune_nom' : obs.commune_nom,
            'commune_code_insee' : obs.commune_code_insee,
            'lieudit' : obs.lieudit,
            'station' : obs.station,
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
        var idAd;
        for (idAd in additionalValues) {
            if (! json['obs_etendue']) json['obs_etendue'] = new Array();
            json['obs_etendue'].push({ 'cle': additionalValues[idAd], 'label': additionalValues[idAd], 'valeur' : obs[additionalValues[idAd]] });
        }
             
        observations['obsId1'] = json;
             
        //@TODO traiter la réponse
        //Gestion des defereds
        observations['projet'] = this.tagprojet;
        observations['tag-obs'] = this.tagobs;
        observations['tag-img'] = this.tagimg;
        //@TODO gestion des données utilisateurs
        observations['utilisateur'] = {
            'id_utilisateur': null,
            'prenom': null,
            'nom': null,
            'courriel': app.globals.currentUser.get('email')
        }
        console.log(app.globals.currentUser.get('email'));
        return observations;   
    };
    
    /***
    * Fonction génère la requete  POST d'envoie d'une obs aux services de tela
    * ***/
    wsTelaApiClient.prototype.sendToTelaWS= function (obs, id_obs) {
        var msg = '';
        var erreurMsg = '';
        return $.ajax({
            url : this.basePath,
            type : 'POST',
            data : obs,
            dataType : 'json',
            success : function(data,textStatus,jqXHR){
                sauvages.notifications.sendToTelaWSSuccess();
            },
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
      //return $.Deferred().resolve();
    }

    return wsTelaApiClient;
}) ();
