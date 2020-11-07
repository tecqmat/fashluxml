import Post from './post';
import wp from 'wp';
import _ from '_';
import Config_Values from './config-values';
import String_Utils from './string-utils';

class MacroReplacement {
	/**
	 * @param postObjectFetcher {PostObjectFetcher}
	 */
	constructor(postObjectFetcher) {
		this.fetcher = postObjectFetcher;
	}

	/**
	 * @param date {Date}
	 * @param format {string}
	 */
	format_date(date, format) {
		return wp.date.dateI18n(format, date);
	}

	/**
	 * @param {Post} post
	 */
	get_excerpt_or_trimmed_content(post) {
		return this.get_trimmed_excerpt(
			post.get_excerpt(),
			post.get_content()
		);
	}

	get_trimmed_excerpt(excerpt, content) {
		let string = !!excerpt ? excerpt : content,
			metadesc_max_length = Config_Values.get('metadesc_max_length', 'metabox');

		// Strip all HTML tags
		string = String_Utils.strip_html(string);
		// Normalize whitespace
		string = String_Utils.normalize_whitespace(string);

		let shortcode_position = string.indexOf('[');
		if (shortcode_position && shortcode_position < metadesc_max_length) {
			// Remove shortcodes but keep the content
			string = String_Utils.remove_shortcodes(string);
		}
		// TODO: Encode any HTML entities like > and <

		return this.truncate_meta_description(string, metadesc_max_length);
	}

	truncate_meta_description(string, metadesc_max_length) {
		return String_Utils.truncate_string(string, metadesc_max_length);
	}

	/**
	 * @param text
	 * @param {Post} post
	 */
	replace(text, post) {
		let fetcher = this.fetcher;
		let load_required = {
			"%%name%%": () => {
				return new Promise((resolve, reject) => {
					fetcher.fetch_author_data(post.get_author_id())
						.then((author) => {
							let name = author && author.name
								? author.name
								: '',
								macro = {"%%name%%": name};
							resolve(macro);
						})
						.catch(reject);
				});
			},
			"%%category%%": (matches, field = 'name', first_only = false) => {
				return new Promise((resolve, reject) => {
					fetcher.fetch_category_data(post.get_category_ids())
						.then((categories) => {
							let category_names = this.get_term_macro_value(categories, field, first_only),
								macro = {};

							if (matches && matches.length) {
								macro[matches[0]] = category_names;
							}

							resolve(macro);
						})
						.catch(reject);
				});
			},
			"%%tag%%": (matches, field = 'name', first_only = false) => {
				return new Promise((resolve, reject) => {
					fetcher.fetch_tag_data(post.get_tag_ids())
						.then((tags) => {
							let tags_names = this.get_term_macro_value(tags, field, first_only),
								macro = {};

							if (matches && matches.length) {
								macro[matches[0]] = tags_names;
							}

							resolve(macro);
						})
						.catch(reject);
				});
			}
		};

		load_required['%%ct_(desc_){0,1}([a-z_]*)%%'] = (matches) => {
			let field = 'name';
			if (matches.length === 3 && matches[1] === 'desc_') {
				field = 'description';
			}

			let taxonomy = matches[2];
			if (taxonomy === 'category') {

				let category = load_required['%%category%%'];
				return category(matches, field, true);

			} else if (taxonomy === 'post_tag') {

				let tag = load_required['%%tag%%'];
				return tag(matches, field, true);
			}

			return new Promise((resolve, reject) => {
				fetcher
					.fetch_taxonomy_terms(taxonomy, post.get_taxonomy_terms(taxonomy))
					.then((terms) => {
						let term_names = this.get_term_macro_value(terms, field, true),
							macro = {};

						if (matches && matches.length) {
							macro[matches[0]] = term_names;
						}

						resolve(macro);
					})
					.catch(reject);
			});
		};

		let promises = [];
		Object.keys(load_required).forEach((macro) => {
			let callback = load_required[macro],
				all_matches = [...text.matchAll(macro)];

			if (all_matches && all_matches.length) {
				all_matches.forEach((match) => {
					if (match && match.length) {
						promises.push(callback(match));
					}
				});
			}
		});

		return new Promise((resolve, reject) => {
			Promise
				.all(promises)
				.then((loaded) => {
					loaded.push(this.get_replacements(post));

					let replacements = loaded.reduce((result, current) => {
						return Object.assign(result, current);
					}, {});

					Object.keys(replacements).forEach((macro_key) => {
						let regex = new RegExp(macro_key, 'g');
						text = text.replace(regex, replacements[macro_key]);
					});

					// Strip out any remaining unrecognized macros
					let unrecognizedMacrosRegex = new RegExp('%%[a-zA-Z_]*%%', 'g');
					text = text.replace(unrecognizedMacrosRegex, '');

					resolve(text);
				})
				.catch(reject);
		});
	}

	get_term_macro_value(terms, field, first_only) {
		if (!Array.isArray(terms)) {
			terms = [];
		}

		terms = _.sortBy(terms, (term) => {
			return term.name;
		});

		let values = terms.reduce(function (result, item) {
			if (item.hasOwnProperty(field)) {
				result.push(item[field]);
			}
			return result;
		}, []);

		return first_only && values.length
			? values[0]
			: values.join(', ');
	}

	get_replacements(post) {
		let dateFormat = Config_Values.get('date_format', 'metabox'),
			timeFormat = Config_Values.get('time_format', 'metabox');
		return {
			"%%id%%": post.get_id(),
			"%%title%%": post.get_title(),
			"%%excerpt%%": this.get_excerpt_or_trimmed_content(post),
			"%%excerpt_only%%": post.get_excerpt(),
			"%%modified%%": this.format_date(post.get_modified(), 'Y-m-d H:i:s'),
			"%%date%%": this.format_date(post.get_date(), dateFormat),
			"%%userid%%": post.get_author_id(),
			"%%caption%%": post.get_excerpt(),
			"%%sep%%": this.get_global('sep'),
			"%%sitename%%": this.get_global('sitename'),
			"%%sitedesc%%": this.get_global('sitedesc'),
			'%%page%%': this.get_global('page'),
			'%%pagetotal%%': this.get_global('pagetotal'),
			'%%pagenumber%%': this.get_global('pagenumber'),
			'%%spell_pagenumber%%': this.get_global('spell_pagenumber'),
			'%%spell_pagetotal%%': this.get_global('spell_pagetotal'),
			'%%spell_page%%': this.get_global('spell_page'),
			"%%currenttime%%": this.format_date(new Date(), timeFormat),
			"%%currentdate%%": this.format_date(new Date(), dateFormat),
			"%%currentmonth%%": this.format_date(new Date(), 'F'),
			"%%currentyear%%": this.format_date(new Date(), 'Y'),
		};
	}

	get_global(key) {
		return Config_Values.get(['replacements', key], 'metabox');
	}
}

export default MacroReplacement;
