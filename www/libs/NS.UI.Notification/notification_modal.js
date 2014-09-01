/*
 * Notification system for Backbone applications.
 * 
 * Depends on:
 * - Twitter Bootstrap
 */

var NS = window.NS || {};

NS.UI = (function(ns) {
    "use strict";

    ns.NotificationModalList = Backbone.View.extend({
        tagName: 'div',
        className: 'notification-modal',
        id: 'myModal',

        initialize: function(options) {
            $('body').append(this.el);
        }
    });

    ns.NotificationModal = Backbone.View.extend({
        templateSrc:    '<div id="nodal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"> '+
                        '   <div class="modal-dialog">'+
                        '       <div class="modal-content">'+
                        '           <div class="modal-header alert-<%= data.type %>"> '+
                        '               <button type="button" class="close-lg btn btn-lg pull-right" data-dismiss="modal" aria-hidden="true"><span class="glyphicon glyphicon-remove-circle"></button> '+
                        '               <h3 id="myModalLabel"><%= data.title %></h3> '+
                        '           </div> '+
                        '       <div class="modal-body"> '+
                        '           <p><%= data.message%></p> '+
                        '       </div> '+
                        '       <% if (data.btnLabel !== "") { %> '+
                        '	<div class="modal-footer"> '+
                        '           <button id="modal-close" class="btn  btn-primary" data-dismiss="modal" aria-hidden="true"><%= data.btnLabel %></button> '+
                        '       </div> <% } %>'+
                        '    </div>'+
                        '   </div>'+
                        '</div>',

        initialize: function(options) {
            this.options = _.defaults(options || {}, {
                type: 'error',
                title: 'Error',
                message: 'An error occured',
                btnLabel : 'close',
                delay: 7
            });
            this.render();
        },
  
        render: function() {
            var self = this;
            $('#myModal').empty();    
            var data = _.pick(this.options, 'type', 'title', 'message', 'btnLabel');
            var $html = $(_.template(this.templateSrc, data, {variable: 'data'}));
            this.setElement($html);
            $('div.notification-modal').append(this.el);
            //Add callback yo btn
            if (self.options.onClick) { 
             $('#modal-close').click(self.options.onClick());
            }
            $('#nodal').modal('show');
            if (typeof(this.options.delay) === 'number' && this.options.delay > 0) {
                setTimeout(function() {
                    $('#nodal').modal('hide');
                    if (self.options.onClose) self.options.onClose();
                }, self.options.delay*1000);
            }
            $('#myModal').on('hidden.bs.modal', function () {
               $('#nodal').modal('hide');
               $('#nodal').remove();
               $('.modal-backdrop').remove();
               $('body').removeClass('modal-open');
            });
        }
    });

    return ns;
})(NS.UI || {});
