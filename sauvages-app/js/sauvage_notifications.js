
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
       app.route.navigate('taxonlist/:all', {trigger: true});
       },
      
     });
   },
   sauvages.sendToTelaWSSuccess = function email() {
      new NS.UI.NotificationModal({
         type: 'success',
         title: 'Observation envoyée',
         message: 'L\'envoi des observations s\'est bien déroulé.',
         delay: 1,
         btnLabel: ''
      });
   },
   sauvages.sendToTelaWSFail = function email() {
      new NS.UI.NotificationModal({
         type: 'error',
         title: 'Observation envoyée',
         message: 'Une erreur s\'est produite, les observations n\'ont pu être envoyées',
         delay: 2,
         btnLabel: ''
      });
   },
   sauvages.email = function email(msg) {
      var v = new NS.UI.NotificationModal({
         type: 'error',
         title: 'Ajouter votre email',
         message: msg,
         delay: '',
         btnLabel: 'Terminer'
      });
      v.$el.on('submit', 'form', _.bind(function(evt) {
         evt.preventDefault();
         var user = app.globals.currentUser;
         var currentEmail = this.$el.find('input[type="email"]').val();
         user.get('userId','1');
         user.set('email',currentEmail).save;
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
				 },
				
			});
	}
  
  
  return sauvages;
})(sauvages.notifications|| {});
