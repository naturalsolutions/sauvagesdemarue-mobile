(function ($) {
    $.fn.uncheckableRadio = function () {

      this.each(function () {
           var radio = this;
                $('label[for="' + radio.id + '"]').add(radio).bind('mousedown',function () {
                    $(radio).data('wasChecked', radio.checked);
					
                });

                $('label[for="' + radio.id + '"]').add(radio).bind('click',function () {
                    if ($(radio).data('wasChecked')){
                        radio.checked = false;
												$(this).parent().removeClass("RadioCustomOn");
										}else{
												radio.checked = true;
												var $boxes = $(this).parent().parent().children();
												$boxes.removeClass("RadioCustomOn");
												$(this).removeClass("RadioCustomOn");
												$(this).parent().addClass("RadioCustomOn");
									}
                });
           });
		   return this;
    };
})(jQuery);
