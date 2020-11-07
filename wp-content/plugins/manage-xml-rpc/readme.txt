=== Plugin Name ===
Contributors: brainvireinfo
Donate link: http://www.brainvire.com
Tags: xmlrpc, XML-RPC, disable xml-rpc, disable xmlrpc, security, xmlrpc.php attack, brute force attacks, XML-RPC API, secure xmlrpc, control xml-rpc, xml-rpc pingback, xml-rpc ip, block xml-rpc
Requires at least: 4.0
Tested up to: 5.3
Stable tag: 5.3
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Enable/Disable XML-RPC for all or based on IP list, also you can control pingback and Unset X-Pingback from HTTP headers.

== Description ==

You can now disable XML-RPC to avoid Brute force attack for given IPs or can even enable access for some IPs. XML-RPC on WordPress is actually an API that gives developers who build mobile apps, desktop apps and other services, the ability to talk to a WordPress site. The XML-RPC API that WordPress provides gives developers, a way to write applications (for you) that can do many of the things that you can do when logged into WordPress via the web interface.

= Features =

Block XML-RPC by following way.

* Disable pingback.ping, pingback.extensions.getPingbacks and Unset X-Pingback from HTTP headers, that will block bots to access specified method.
* Disable/Block XML-RPC for all users.
* Enable XML-RPC based on IP list.
* Disable XML-RPC based on IP list.


== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Use the 'XML-RPC Settings' screen to configure the plugin.



== Frequently Asked Questions ==

= Do I need to take a backup of my existing .htaccess file =

Yes, it's preferable to take a backup of existing .htaccess file. 

= What if .httaccess file doesn't have writeable permission? =

You can copy and paste new rule in your .htaccess file from plugin setting page.

== Screenshots ==

1. screenshot-1.png
2. screenshot-2.png

== Changelog ==

= 1.0 =
* Beta release with basic testing.