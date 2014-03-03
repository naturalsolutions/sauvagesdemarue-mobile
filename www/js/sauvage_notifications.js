
var sauvages = window.sauvages|| {};

sauvages.notifications = (
function() {
   "use strict";
         sauvages.messages = {
                 'save': 'Enregistrer',
                 'begin_street': 'Début du parcours',
                 'end_street':'Fin du parcours',
         },
		
	 sauvages.gpsNotStart = function gpsNotStart() {
		 var myModal = new NS.UI.NotificationModal({
				type: 'error',
				title: 'GPS not start',
				message: 'wait',
				delay: 1,
				btnLabel: '',
			});
         },
	
	 sauvages.finParcours = function finParcours() {
			var myModal = new NS.UI.NotificationModal({
				type: 'success',
				title: 'Rue sauvegardée',
				message: 'Retrouver vos données dans "Mes observations"<br/> N\'oublier pas de les partager <br/>',
				delay: '',
				btnLabel: 'Nouvelle rue',
				onClick: function() {
					app.route.navigate('addParcours/new', {trigger: true});
					},
			});
         },
	
   sauvages.obsSaveSuccess = function obsSaveSuccess() {
     new NS.UI.NotificationModal({
      type: 'success',
      title: 'Observation sauvegardée',
      message: 'Félicitations !',
      delay: 1,
      btnLabel: '', 
      onClose: function() {
       app.route.navigate('identification', {trigger: true});
       },
      
     });
   },
   sauvages.sendToTelaWSSuccess = function email() {
      new NS.UI.NotificationModal({
         type: 'success',
         title: 'Observation envoyée',
         message: 'L\'envoi des observations s\'est bien déroulé.',
         delay: 1,
         btnLabel: '',
          onClose: function() {
            $('#nodal').modal('hide');
            $('#nodal').remove();
            $('.modal-backdrop').remove();
         }
      });
   },
   sauvages.sendToTelaWSFail = function email() {
      new NS.UI.NotificationModal({
         type: 'error',
         title: 'Observation envoyée',
         message: 'Une erreur s\'est produite, les observations n\'ont pu être envoyées',
         delay: 2,
         btnLabel: '',
         onClose: function() {
            $('#nodal').modal('hide');
            $('#nodal').remove();
            $('.modal-backdrop').remove();
         }
      });
   },
   sauvages.email = function email(msg) {
      var v = new NS.UI.NotificationModal({
         type: 'warning',
         title: 'Ajouter votre email.',
         message: msg,
         delay: '',
         btnLabel: 'Annuler'
      });
      v.$el.on('submit', _.bind(function(evt) {
         evt.preventDefault();
           var currentEmail = this.$el.find('input[type="email"]').val();
            var currentUser = new app.models.User({
               'userId': 1,
               'email':currentEmail
            });
            currentUser.save();
            $('#nodal').modal('hide');
            $('#nodal').remove();
            $('.modal-backdrop').remove();
      }, v))
   },
   sauvages.helpKey = function helpKey(criteriaName,criteriaValues) {
      new NS.UI.NotificationModal({
         type: 'success',
         title: criteriaName,
         message: criteriaValues,
         delay: '',
         btnLabel: '', 
         onClose: function() {
          app.route.navigate('taxonlist', {trigger: true});
          }
      });
	},
  sauvages.finDeProtocol = function finDeProtocol(msg) {
			var v = new NS.UI.NotificationModal({
				type: 'warning',
				title: 'Voulez-vous terminer votre parcours ?',
				message:  msg,
				delay: '',
				btnLabel: '', 
			});
   v.$el.on('submit', 'form', _.bind(function(evt) {
      evt.preventDefault();
      $('#nodal').modal('hide');
      $('#nodal').remove();
      $('.modal-backdrop').remove();
   }, v))
   v.$el.on('reset', 'form', _.bind(function(evt) {
      evt.preventDefault();
      $('#nodal').modal('hide');
      $('#nodal').remove();
      $('.modal-backdrop').remove();
      app.route.navigate('taxonlist', {trigger: true});
   }, v))
	},
   sauvages.finDeProtocolHorsParcours = function finDeProtocol(msg, derObsLat, derObslong , parcours) {
			var v = new NS.UI.NotificationModal({
				type: 'warning',
				title: 'Pour envoyer vos observations, vous devez avoir terminé votre parcours. Voulez-vous terminer votre parcours ?',
				message:  msg,
				delay: '',
				btnLabel: '', 
			});
   v.$el.on('submit', 'form', _.bind(function(evt) {
      evt.preventDefault();
      parcours.set('end_latitude' , derObsLat );
      parcours.set('end_longitude' , derObslong);
      parcours.set('end_datetime' ,  new Date().format("yyyy-MM-dd h:mm:ss"));
      parcours.save();
      $('#nodal').modal('hide');
      $('#nodal').remove();
      $('.modal-backdrop').remove();
      
   }, v))
   v.$el.on('reset', 'form', _.bind(function(evt) {
      evt.preventDefault();
      $('#nodal').modal('hide');
      $('#nodal').remove();
      $('.modal-backdrop').remove();
   }, v))
	}

  
  return sauvages;
})(sauvages.notifications|| {});
