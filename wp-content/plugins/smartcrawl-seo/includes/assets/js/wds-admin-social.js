(function ($) {
	window.Wds = window.Wds || {};

	function init() {
		window.Wds.hook_conditionals();
		window.Wds.hook_toggleables();
		window.Wds.media_url($('.wds-media-url'));
		window.Wds.vertical_tabs();
	}

	$(init);
})(jQuery);
