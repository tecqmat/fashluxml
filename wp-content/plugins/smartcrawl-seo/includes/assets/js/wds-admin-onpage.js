;(function ($) {

	var selectors = {
		title_field: ':text[name*="[title-"]',
		desc_field: 'textarea[name*="[metadesc-"]',
		preview: '.wds-preview-container'
	};

	/**
	 * Wraps a raw notice string with appropriate markup
	 *
	 * @param {String} str Raw notice
	 *
	 * @return {String} Notice markup
	 */
	function to_warning_string(str) {
		if (!str) return '';
		var template = Wds.tpl_compile(Wds.template('onpage', 'notice'));
		return template({
			message: str
		});
	}

	/**
	 * Handles tab switching title&meta preview update dispatch
	 */
	function tab_preview_change() {
		var $tab_section = $(".wds-vertical-tab-section:visible"),
			$accordion = $('.sui-accordion', $tab_section),
			trigger_change = function ($container) {
				var $text = $container.find(selectors.title_field),
					$preview = $container.find(selectors.preview);

				if ($text.length && $preview.data('showingDefault')) {
					render_preview_change.apply($text.get(), arguments);
				}
			};

		if ($accordion.length) {
			$accordion.find('.sui-accordion-item').each(function () {
				trigger_change($(this));
			});
		} else if ($('[data-type="static-homepage"]', $tab_section).length) {
			load_static_homepage_preview();
		} else {
			trigger_change($tab_section);
		}
	}

	function load_static_homepage_preview() {
		var $container = $('[data-type="static-homepage"]'),
			$preview = $container.find(".wds-preview-container");

		if (!$preview.data('showingDefault')) {
			return;
		}

		$preview.addClass("wds-preview-loading");
		$.post(ajaxurl, {
			action: "wds-onpage-preview",
			type: $container.data("type"),
			_wds_nonce: _wds_onpage.nonce
		}, 'json').done(function (rsp) {
			var status = (rsp || {}).status || false,
				html = (rsp || {}).markup || false;

			if (status && !!html) {
				$preview.replaceWith(html);
			}
		}).always(function () {
			$preview.removeClass("wds-preview-loading");
		});
	}

	/**
	 * Handles change/keyup event title&meta preview update dispatch
	 */
	function render_preview_change() {
		var $target_field = $(this),
			$container = $target_field.closest('[data-type]'),
			$preview = $container.find(selectors.preview),
			$title = $container.find(selectors.title_field),
			$meta = $container.find(selectors.desc_field);

		if ($title.length > 1 || $meta.length > 1) {
			return;
		}

		$preview.addClass("wds-preview-loading");

		return $.post(ajaxurl, {
			action: "wds-onpage-preview",
			type: $container.data("type"),
			title: $title.val(),
			description: $meta.val(),
			_wds_nonce: _wds_onpage.nonce
		}, 'json')
			.done(function (rsp) {
				var status = (rsp || {}).status || false,
					html = (rsp || {}).markup || false,
					warnings = (rsp || {}).warnings || {}
				;

				if (status && !!html) {
					$preview.replaceWith(html);
				}

				if ((warnings || {}).title) {
					$title.next(".wds-notice").remove();
					$title.after(to_warning_string(warnings.title));
				}
				if ((warnings || {}).description) {
					$meta.next(".wds-notice").remove();
					$meta.after(to_warning_string(warnings.description));
				}
			})
			.always(function () {
				$preview.removeClass("wds-preview-loading");
			});
	}

	function toggle_archive_status() {
		var $checkbox = $(this),
			$accordion_section = $checkbox.closest('.sui-accordion-item'),
			disabled_class = 'sui-accordion-item--disabled',
			open_class = 'sui-accordion-item--open';

		if (!$checkbox.is(':checked')) {
			$accordion_section.removeClass(open_class).addClass(disabled_class);
		}
		else {
			$accordion_section.removeClass(disabled_class);
		}
	}

	function save_static_home_settings() {
		var $button = $(this),
			form_data = $(':input', '#tab_static_homepage').serialize(),
			params = add_query_params(form_data, {
				action: "wds-onpage-save-static-home",
				_wds_nonce: _wds_onpage.nonce
			});

		$button.addClass('sui-button-onload');
		$.post(ajaxurl, params, 'json').done(function (rsp) {
			$button.removeClass('sui-button-onload');
			window.location.href = add_query_params(window.location.href, {
				"settings-updated": "true"
			});
		});
	}

	function add_query_params(base, params) {
		return base + '&' + $.param(params);
	}

	function init_onpage() {
		$(document).on("input propertychange", ":text, textarea", _.debounce(render_preview_change, 1000));
		$(document).on("wds_vertical_tabs:tab_change", ".wds-vertical-tabs", tab_preview_change);
		$(document).on('click', '.wds-save-static-home-settings', save_static_home_settings);

		// Also update on init, because of potential hash change
		window.Wds.macro_dropdown();
		window.Wds.vertical_tabs();

		var $tab_status_checkboxes = $('.sui-accordion-item-header input[type="checkbox"]');
		$tab_status_checkboxes.each(function () {
			toggle_archive_status.apply($(this));
		});
		$tab_status_checkboxes.change(toggle_archive_status);
	}

	function handle_accordion_item_click() {
		var $accordion_item = $(this).closest('.sui-accordion-item');

		// Keep one section open at a time
		$('.sui-accordion-item--open').not($accordion_item).removeClass('sui-accordion-item--open');
	}

	function update_sitemap_warning() {
		var $checkbox = $(this);
		var $notice = $checkbox
			.closest('.wds-toggle')
			.find('.sui-description .sui-notice');

		if (!$notice.length) {
			return;
		}

		$notice.toggleClass('hidden', $checkbox.is(':checked'));
	}

	function init() {
		init_onpage();
		$('.sui-accordion-item-header')
			.off('click.sui.accordion')
			.on('click.sui.accordion', handle_accordion_item_click);
		Wds.hook_conditionals();
		$('[value^="meta_robots-noindex-"]').on('change', update_sitemap_warning);
	}

	// Boot
	$(init);

})(jQuery);
