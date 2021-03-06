/*!
 * @project: <synergixe - SynLMS/SynAccounts>
 * @file: <cdv_js.js>
 * @author: <https://team.synergixe.ng>
 * @created: <04/03/2015>
 * @desc: {this is a framework library meant to structure application development}
 * @remarks: {library script}
 * @contributors: {@patrick, @alico, @mercury, @chris, @dominic}
 */	

/**!
 * Inspired by Nicolas Zakas (front-end engineer at Yahoo)
 * Authored by Ifeora Okechukwu Patrick (https://twitter.com/isocroft)
 * $cdvjs Framework Core 
 * Codedev� Copyright (c) 2015. All rights reserved 
 * Version 0.0.2
 */
 
 
   /**
             // for JSKlascik 
             
       (function(w){
             
          var returnObj,
             
          
             
          obj = {
             constructor:function(){
                 // code goes here
             },
             poof:function(){
                    while(this.length){
                        this.pop();
                    }
                    return this.length;
             },
             length:0,
             toArray:function(){
             return [].slice.call(this);
             },
             push:function(item){
             var ln =this.length;
             if(item && "nodeType" in item){
             this[ln++] = item;
             }
             this.length = ln;
             },
             pop:function(){
             var ln = this.length,
             item = this[--ln];
             delete this[ln];
             this.length = ln;
             return item;
             },
             get:function(index){
                 var ln = this.length,
                 isNotNan = Number(index || {}); // Nan is a "falsey" value
                 return isNotNan? (index < 0? this[ln + index] : this[index]) : this.toArray();
            }
        };
             
         returnObj = w["jsk"] = obj;
             
         return returnObj;
             
        }(this));
        
        
             frappe.request.url = '/';
             
             
             frappe.call = function(opts) {
             var args = $.extend({}, opts.args);
             if (opts.module && opts.page) {
             args.cmd = opts.module + '.page.' + opts.page + '.' + opts.page + '.' + opts.method;
             } else if (opts.doc) {
             $.extend(args, {
             cmd: "runserverobj",
             docs: frappe.get_doc(opts.doc.doctype, opts.doc.name),
             method: opts.method,
             args: opts.args,
             });
             } else if (opts.method) {
             args.cmd = opts.method;
             }
             return frappe.request.call({
             type: opts.type || "POST",
             args: args,
             success: opts.callback,
             error: opts.error,
             always: opts.always,
             btn: opts.btn,
             freeze: opts.freeze,
             show_spinner: !opts.no_spinner,
             progress_bar: opts.progress_bar,
             async: opts.async,
             url: opts.url || frappe.request.url,
             });
             }
             
             
             frappe.request.call = function(opts) {
             frappe.request.prepare(opts);
             opts.args._type = opts.type;
             var statusCode = {
             200: function(data, xhr) {
             if (typeof data === "string")
             data = JSON.parse(data);
             opts.success_callback && opts.success_callback(data, xhr.responseText);
             },
             404: function(xhr) {
             msgprint(__("Not found"));
             },
             403: function(xhr) {
             if (xhr.responseJSON && xhr.responseJSON._server_messages) {
             var _server_messages = JSON.parse(xhr.responseJSON._server_messages);
             if (_server_messages.indexOf(__("Not permitted"))!==-1) {
             return;
             }
             }
             msgprint(__("Not permitted"));
             },
             417: function(data, xhr) {
             if (typeof data === "string")
             data = JSON.parse(data);
             opts.error_callback && opts.error_callback(data, xhr.responseText);
             },
             501: function(data, xhr) {
             if (typeof data === "string")
             data = JSON.parse(data);
             opts.error_callback && opts.error_callback(data, xhr.responseText);
             },
             500: function(xhr) {
             msgprint(__("Server Error: Please check your server logs or contact tech support."))
             opts.error_callback && opts.error_callback();
             frappe.request.report_error(xhr, opts);
             }
             };
             var ajax_args = {
             url: opts.url || frappe.request.url,
             data: opts.args,
             type: 'POST',
             dataType: opts.dataType || 'json',
             async: opts.async
             };
             frappe.last_request = ajax_args.data;
             if (opts.progress_bar) {
             var interval = null;
             $.extend(ajax_args, {
             xhr: function() {
             var xhr = jQuery.ajaxSettings.xhr();
             interval = setInterval(function() {
             if (xhr.readyState > 2) {
             var total = parseInt(xhr.getResponseHeader('Original-Length') || 0) || parseInt(xhr.getResponseHeader('Content-Length'));
             var completed = parseInt(xhr.responseText.length);
             var percent = (100.0 / total * completed).toFixed(2);
             opts.progress_bar.css('width', (percent < 10 ? 10 : percent) + '%');
             }else{
             opts.progress_bar.css('width', (10) + '%');
             }
             }, 50);
             frappe.last_xhr = xhr;
             return xhr;
             },
             complete: function() {
             opts.progress_bar.css('width', '100%');
             clearInterval(interval);
             }
             })
             }
             return $.ajax(ajax_args).always(function(data, textStatus, xhr) {
             if (typeof data === "string") {
             data = JSON.parse(data);
             }
             if (data.responseText) {
             var xhr = data;
             data = JSON.parse(data.responseText);
             }
             frappe.request.cleanup(opts, data);
             if (opts.always)
             opts.always(data);
             }).done(function(data, textStatus, xhr) {
             var status_code_handler = statusCode[xhr.statusCode().status];
             if (status_code_handler) {
             status_code_handler(data, xhr);
             }
             }).fail(function(xhr, textStatus) {
             var status_code_handler = statusCode[xhr.statusCode().status];
             if (status_code_handler) {
             status_code_handler(xhr);
             } else {
             opts.error_callback && opts.error_callback(xhr);
             }
             });
             }
             frappe.request.prepare = function(opts) {
             if (opts.btn)
             $(opts.btn).set_working();
             if (opts.show_spinner)
             frappe.set_loading();
             if (opts.freeze)
             frappe.dom.freeze();
             for (key in opts.args) {
             if (opts.args[key] && ($.isPlainObject(opts.args[key]) || $.isArray(opts.args[key]))) {
             opts.args[key] = JSON.stringify(opts.args[key]);
             }
             }
             if (!opts.args.cmd&&!opts.url) {
             console.log(opts)
             throw "Incomplete Request";
             }
             opts.success_callback = opts.success;
             opts.error_callback = opts.error;
             delete opts.success;
             delete opts.error;
             }
             frappe.request.cleanup = function(opts, r) {
             if (opts.btn)
             $(opts.btn).done_working();
             if (opts.show_spinner)
             frappe.done_loading();
             if (opts.freeze)
             frappe.dom.unfreeze();
             if (r.session_expired || frappe.get_cookie("sid") === "Guest") {
             if (!frappe.app.logged_out) {
             localStorage.setItem("session_lost_route", location.hash);
             msgprint(__('Session Expired. Logging you out'));
             frappe.app.logout();
             }
             return;
             }
             if (r._server_messages&&!opts.silent) {
             r._server_messages = JSON.parse(r._server_messages)
             msgprint(r._server_messages);
             }
             if (r.exc) {
             r.exc = JSON.parse(r.exc);
             if (r.exc instanceof Array) {
             $.each(r.exc, function(i, v) {
             if (v) {
             console.log(v);
             }
             })
             } else {
             console.log(r.exc);
             }
             };
             if (r._debug_messages) {
             console.log("-")
             console.log("-")
             console.log("-")
             if (opts.args) {
             console.log("<<<< arguments ");
             console.log(opts.args);
             console.log(">>>>")
             }
             $.each(JSON.parse(r._debug_messages), function(i, v) {
             console.log(v);
             });
             console.log("<<<< response");
             delete r._debug_messages;
             console.log(r);
             console.log(">>>>")
             console.log("-")
             console.log("-")
             console.log("-")
             }
             if (r.docs || r.docinfo) {
             frappe.model.sync(r);
             }
             if (r.__messages) {
             $.extend(frappe._messages, r.__messages);
             }
             frappe.last_response = r;
             }
             frappe.request.report_error = function(xhr, request_opts) {
             var data = JSON.parse(xhr.responseText);
             if (data.exc) {
             var exc = (JSON.parse(data.exc) || []).join("\n");
             delete data.exc;
             } else {
             var exc = "";
             }
             if (exc) {
             var error_report_email = (frappe.boot.error_report_email || []).join(", ");
             var error_message = '<div>\
             <pre style="max-height: 300px; margin-top: 7px;">' + exc + '</pre>'
             + '<p class="text-right"><a class="btn btn-default report-btn">\
             <i class="icon-fixed-width icon-envelope"></i> '
             + __("Report this issue") + '</a></p>'
             + '</div>';
             request_opts = frappe.request.cleanup_request_opts(request_opts);
             var msg_dialog = msgprint(error_message);
             msg_dialog.msg_area.find(".report-btn").toggle(error_report_email ? true : false).on("click", function() {
             var error_report_message = ['<h5>Please type some additional information that could help us reproduce this issue:</h5>', '<div style="min-height: 100px; border: 1px solid #bbb; \
             border-radius: 5px; padding: 15px; margin-bottom: 15px;"></div>', '<hr>', '<h5>Route</h5>', '<pre>' + frappe.get_route_str() + '</pre>', '<hr>', '<h5>Error Report</h5>', '<pre>' + exc + '</pre>', '<hr>', '<h5>Request Data</h5>', '<pre>' + JSON.stringify(request_opts, null, "\t") + '</pre>', '<hr>', '<h5>Response JSON</h5>', '<pre>' + JSON.stringify(data, null, '\t') + '</pre>'].join("\n");
             var communication_composer = new frappe.views.CommunicationComposer({
             subject: 'Error Report',
             recipients: error_report_email,
             message: error_report_message,
             doc: {
             doctype: "User",
             name: user
             }
             });
             communication_composer.dialog.$wrapper.css("z-index", cint(msg_dialog.$wrapper.css("z-index")) + 1);
             });
             }
             };
             frappe.request.cleanup_request_opts = function(request_opts) {
             var doc = (request_opts.args || {}).doc;
             if (doc) {
             doc = JSON.parse(doc);
             $.each(Object.keys(doc), function(i, key) {
             if (key.indexOf("password")!==-1 && doc[key]) {
             doc[key] = "*****";
             }
             });
             request_opts.args.doc = JSON.stringify(doc);
             }
             return request_opts;
             };;
             frappe.re_route = {};
             frappe.route_titles = {};
             frappe.route_history = [];
             frappe.view_factory = {};
             frappe.view_factories = [];
             frappe.route = function() {
             if (frappe.re_route[window.location.hash]) {
             var re_route_val = frappe.get_route_str(frappe.re_route[window.location.hash]);
             var cur_route_val = frappe.get_route_str(frappe._cur_route);
             if (decodeURIComponent(re_route_val) === decodeURIComponent(cur_route_val)) {
             window.history.back();
             return;
             } else {
             window.location.hash = frappe.re_route[window.location.hash];
             }
             }
             frappe._cur_route = window.location.hash;
             route = frappe.get_route();
             frappe.route_history.push(route);
             if (route[0] && frappe.views[route[0] + "Factory"]) {
             if (!frappe.view_factory[route[0]])
             frappe.view_factory[route[0]] = new frappe.views[route[0] + "Factory"]();
             frappe.view_factory[route[0]].show();
             } else {
             frappe.views.pageview.show(route[0]);
             }
             if (frappe.route_titles[window.location.hash]) {
             document.title = frappe.route_titles[window.location.hash];
             }
             }
             frappe.get_route = function(route) {
             return frappe.get_route_str(route).split('/')
             }
             frappe.get_prev_route = function() {
             if (frappe.route_history && frappe.route_history.length > 1) {
             return frappe.route_history[frappe.route_history.length-2];
             } else {
             return [];
             }
             }
             frappe.get_route_str = function(route) {
             if (!route)
             route = window.location.hash;
             if (route.substr(0, 1) == '#')
             route = route.substr(1);
             if (route.substr(0, 1) == '!')
             route = route.substr(1);
             route = $.map(route.split('/'), function(r) {
             try {
             return decodeURIComponent(r);
             } catch (e) {
             if (e instanceof URIError) {
             return r;
             } else {
             throw e;
             }
             }
             }).join('/');
             return route;
             }
             frappe.set_route = function() {
             if (arguments.length === 1 && $.isArray(arguments[0])) {
             arguments = arguments[0];
             }
             route = $.map(arguments, function(a) {
             if ($.isPlainObject(a)) {
             frappe.route_options = a;
             return null;
             } else {
             return a ? encodeURIComponent(a) : null;
             }
             }).join('/');
             window.location.hash = route;
             frappe.app.set_favicon();
             }
             frappe.set_re_route = function() {
             var tmp = window.location.hash;
             frappe.set_route.apply(null, arguments);
             frappe.re_route[tmp] = window.location.hash;
             };
             frappe._cur_route = null;
             $(window).on('hashchange', function() {
             frappe.route_titles[frappe._cur_route] = document.title;
             if (window.location.hash == frappe._cur_route)
             return;
             if (cur_dialog && cur_dialog.hide_on_page_refresh)
             cur_dialog.hide();
             frappe.route();
             });;
             $(document).ready(function() {
             frappe.assets.check();
             frappe.provide('frappe.app');
             $.extend(frappe.app, new frappe.Application());
             });
             frappe.Application = Class.extend({
             init: function() {
             this.load_startup();
             },
             load_startup: function() {
             var me = this;
             if (window.app) {
             return frappe.call({
             method: 'startup',
             callback: function(r, rt) {
             frappe.provide('frappe.boot');
             frappe.boot = r;
             if (frappe.boot.user.name === 'Guest' || frappe.boot.user.user_type === "Website User") {
             window.location = 'index';
             return;
             }
             me.startup();
             }
             });
             } else {
             this.startup();
             }
             },
             startup: function() {
             this.load_bootinfo();
             if (user != "Guest")
             this.set_user_display_settings();
             this.make_nav_bar();
             this.set_favicon();
             this.setup_keyboard_shortcuts();
             this.run_startup_js();
             if (frappe.boot) {
             if (localStorage.getItem("session_lost_route")) {
             window.location.hash = localStorage.getItem("session_lost_route");
             localStorage.removeItem("session_lost_route");
             }
             }
             this.make_page_container();
             frappe.route();
             $(document).trigger('startup');
             this.start_notification_updates();
             $(document).trigger('app_ready');
             },
             set_user_display_settings: function() {
             frappe.ui.set_user_background(frappe.boot.user.background_image, null, frappe.boot.user.background_style);
             },
             load_bootinfo: function() {
             if (frappe.boot) {
             frappe.modules = frappe.boot.modules;
             this.check_metadata_cache_status();
             this.set_globals();
             this.sync_pages();
             if (frappe.boot.timezone_info) {
             moment.tz.add(frappe.boot.timezone_info);
             }
             if (frappe.boot.print_css) {
             frappe.dom.set_style(frappe.boot.print_css)
             }
             } else {
             this.set_as_guest();
             }
             },
             check_metadata_cache_status: function() {
             if (frappe.boot.metadata_version != localStorage.metadata_version) {
             localStorage.clear();
             console.log("Cleared Cache - New Metadata");
             frappe.assets.init_local_storage();
             }
             },
             start_notification_updates: function() {
             var me = this;
             setInterval(function() {
             me.refresh_notifications();
             }, 30000);
             $(document).trigger("notification-update");
             $(document).on("session_alive", function() {
             me.refresh_notifications();
             })
             },
             refresh_notifications: function() {
             if (frappe.session_alive) {
             return frappe.call({
             method: "frappe.core.doctype.notification_count.notification_count.get_notifications",
             callback: function(r) {
             if (r.message) {
             $.extend(frappe.boot.notification_info, r.message);
             $(document).trigger("notification-update");
             }
             },
             no_spinner: true
             });
             }
             },
             set_globals: function() {
             user = frappe.boot.user.name;
             user_fullname = frappe.user_info(user).fullname;
             user_defaults = frappe.boot.user.defaults;
             user_roles = frappe.boot.user.roles;
             user_email = frappe.boot.user.email;
             sys_defaults = frappe.boot.sysdefaults;
             },
             sync_pages: function() {
             if (localStorage["page_info"]) {
             frappe.boot.allowed_pages = [];
             page_info = JSON.parse(localStorage["page_info"]);
             $.each(frappe.boot.page_info, function(name, p) {
             if (!page_info[name] || (page_info[name].modified != p.modified)) {
             delete localStorage["_page:" + name];
             }
             frappe.boot.allowed_pages.push(name);
             });
             } else {
             frappe.boot.allowed_pages = keys(frappe.boot.page_info);
             }
             localStorage["page_info"] = JSON.stringify(frappe.boot.page_info);
             },
             set_as_guest: function() {
             user = {
             name: 'Guest'
             };
             user = 'Guest';
             user_fullname = 'Guest';
             user_defaults = {};
             user_roles = ['Guest'];
             user_email = '';
             sys_defaults = {};
             },
             make_page_container: function() {
             if ($("#body_div").length) {
             $(".splash").remove();
             frappe.temp_container = $("<div id='temp-container' style='display: none;'>").appendTo("body");
             frappe.container = new frappe.views.Container();
             }
             },
             make_nav_bar: function() {
             if (frappe.boot) {
             frappe.frappe_toolbar = new frappe.ui.toolbar.Toolbar();
             }
             },
             logout: function() {
             var me = this;
             me.logged_out = true;
             return frappe.call({
             method: 'logout',
             callback: function(r) {
             if (r.exc) {
             console.log(r.exc);
             return;
             }
             me.redirect_to_login();
             }
             })
             },
             redirect_to_login: function() {
             window.location.href = '/';
             },
             set_favicon: function() {
             var link = $('link[type="image/x-icon"]').remove().attr("href");
             $('<link rel="shortcut icon" href="' + link + '" type="image/x-icon">').appendTo("head");
             $('<link rel="icon" href="' + link + '" type="image/x-icon">').appendTo("head");
             },
             setup_keyboard_shortcuts: function() {
             $(document).keydown("meta+g ctrl+g", function(e) {
             frappe.ui.toolbar.search.show();
             return false;
             }).keydown("meta+s ctrl+s", function(e) {
             e.preventDefault();
             if (cur_frm) {
             cur_frm.save_or_update();
             } else if (frappe.container.page.save_action) {
             frappe.container.page.save_action();
             }
             return false;
             }).keydown("esc", function(e) {
             var open_row = $(".grid-row-open");
             if (open_row.length) {
             var grid_row = open_row.data("grid_row");
             grid_row.toggle_view(false);
             }
             return false;
             }).keydown("ctrl+down meta+down", function(e) {
             var open_row = $(".grid-row-open");
             if (open_row.length) {
             var grid_row = open_row.data("grid_row");
             grid_row.toggle_view(false, function() {
             grid_row.open_next()
             });
             return false;
             }
             }).keydown("ctrl+up meta+up", function(e) {
             var open_row = $(".grid-row-open");
             if (open_row.length) {
             var grid_row = open_row.data("grid_row");
             grid_row.toggle_view(false, function() {
             grid_row.open_prev()
             });
             return false;
             }
             }).keydown("ctrl+n meta+n", function(e) {
             var open_row = $(".grid-row-open");
             if (open_row.length) {
             var grid_row = open_row.data("grid_row");
             grid_row.toggle_view(false, function() {
             grid_row.grid.add_new_row(grid_row.doc.idx, null, true);
             });
             return false;
             }
             })
             },
             run_startup_js: function() {
             if (frappe.boot.startup_js)
             eval(frappe.boot.startup_js);
             }
             });
             frappe.defaults = {
             get_user_default: function(key) {
             var d = frappe.boot.user.defaults[key];
             if ($.isArray(d))
             d = d[0];
             return d;
             },
             get_user_defaults: function(key) {
             var d = frappe.boot.user.defaults[key];
             if (!$.isArray(d))
             d = [d];
             return d;
             },
             get_global_default: function(key) {
             var d = sys_defaults[key];
             if ($.isArray(d))
             d = d[0];
             return d;
             },
             get_global_defaults: function(key) {
             var d = sys_defaults[key];
             if (!$.isArray(d))
             d = [d];
             return d;
             },
             set_default: function(key, value, callback) {
             if (typeof value == "string")
             value = JSON.stringify(value);
             frappe.boot.user.defaults[key] = value;
             return frappe.call({
             method: "frappe.client.set_default",
             args: {
             key: key,
             value: value
             },
             callback: callback || function(r) {}
             });
             },
             get_default: function(key) {
             var value = frappe.boot.user.defaults[key];
             if (value) {
             try {
             return JSON.parse(value)
             } catch (e) {
             return value;
             }
             }
             },
             get_user_permissions: function() {
             return frappe.defaults.user_permissions;
             },
             set_user_permissions: function(user_permissions) {
             if (!user_permissions)
             return;
             frappe.defaults.user_permissions = $.extend(frappe.defaults.user_permissions || {}, user_permissions);
             }
             };
             frappe.template = {
             compiled: {},
             debug: {}
             };
             frappe.template.compile = function(str) {
             if (str.indexOf("'")!==-1) {
             console.log("Warning: Single quotes (') may not work in templates");
             }
             if (!frappe.template.compiled[str]) {
             fn_str = "var p=[],print=function(){p.push.apply(p,arguments)};" + "with(obj){p.push('" +
             str.replace(/[\r\t\n]/g, " ").split("{%").join("\t").replace(/((^|%})[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%}/g, "',$1,'").split("\t").join("');").split("%}").join("\np.push('").split("\r").join("\\'")
             + "');}return p.join('');";
             frappe.template.debug[str] = fn_str;
             try {
             frappe.template.compiled[str] = new Function("obj", fn_str);
             } catch (e) {
             console.log("Error in Template:");
             console.log(fn_str);
             if (e.lineNumber) {
             console.log("Error in Line " + e.lineNumber + ", Col " + e.columnNumber + ":");
             console.log(fn_str.split("\n")[e.lineNumber-1]);
             }
             }
             }
             return frappe.template.compiled[str];
             };
             frappe.render = function(str, data) {
             return frappe.template.compile(str)(data);
             };;
             frappe.templates["print_template"] = '<!DOCTYPE html> <html lang="en">   <head>     <meta charset="utf-8">     <meta http-equiv="X-UA-Compatible" content="IE=edge">     <meta name="viewport" content="width=device-width, initial-scale=1">     <meta name="description" content="">     <meta name="author" content="">     <title>{%= title %}</title>     <link href="{%= frappe.urllib.get_base_url() %}/assets/frappe/css/bootstrap.css" rel="stylesheet"> 	<style> 		{%= frappe.boot.print_css %} 	</style>   </head>   <body> 	  <div class="print-format-gutter"> 		  <div class="print-format"> 	        {%= content %} 		  </div> 	  </div>   </body> </html> ';
             frappe.templates["list_info_template"] = '{% if (tags.length) { %} 	<span style="margin-right: 10px;" class="list-tag-preview"> 		{%= tags.join(", ") %}</span> {% } %} {% if (comments.length) { %} 	<a style="margin-right: 10px;" href="#Form/{%= doctype %}/{%= encodeURIComponent(data.name) %}" 		title="{%= comments[comments.length-1].comment %}"> 		<i class="icon-comments"></i> {%= comments.length %} 	</a> {% } %} {% if (assign.length) { %} 	{% for (var i=0, l=assign.length; i<l; i++) { %} 		<span class="filterable" data-filter="_assign,like,%{%= assign[i] %}%"> 			{%= frappe.avatar(assign[i], "avatar-xs") %}</span> 	{% }%} {% } %} {%= comment_when(data.modified) %} ';
             frappe.provide('frappe.widgets.form');
             frappe.provide('frappe.widgets.report');
             frappe.provide('frappe.utils');
             frappe.provide('frappe.model');
             frappe.provide('frappe.user');
             frappe.provide('frappe.session');
             frappe.provide('_f');
             frappe.provide('_p');
             frappe.provide('_r');
             frappe.provide('_startup_data')
             frappe.provide('locals')
             frappe.provide('locals.DocType')
             frappe.settings.no_history = 1;
             var NEWLINE = '\n';
             var user = null;
             var user = null;
             var user_defaults = null;
             var user_roles = null;
             var user_fullname = null;
             var user_email = null;
             var user_img = {};
             var pscript = {};
             var _f = {};
             var _p = {};
             var _r = {};
             var FILTER_SEP = '\1';
             var frms = {};
             var cur_frm = null;
             var pscript = {};;
             frappe.utils.full_name = function(fn, ln) {
             return fn + (ln ? ' ' : '') + (ln ? ln : '')
             }
             function fmt_money(v, format) {
             return format_number(v, format);
             }
             function toTitle(str) {
             var word_in = str.split(" ");
             var word_out = [];
             for (w in word_in) {
             word_out[w] = word_in[w].charAt(0).toUpperCase() + word_in[w].slice(1);
             }
             return word_out.join(" ");
             }
             function is_null(v) {
             if (v === null || v === undefined || cstr(v).trim() === "")
             return true;
             }
             function set_value_in(ele, v, ftype, fopt, doc) {
             $(ele).html(frappe.format(v, {
             fieldtype: ftype,
             options: fopt
             }, null, doc));
             return;
             }
             var $s = set_value_in;
             function copy_dict(d) {
             var n = {};
             for (var k in d)
             n[k] = d[k];
             return n;
             }
             function replace_newlines(t) {
             return t ? t.replace(/\n/g, '<br>') : '';
             }
             function validate_email(txt) {
             return frappe.utils.validate_type(txt, "email");
             }
             function validate_spl_chars(txt) {
             return frappe.utils.validate_type(txt, "alphanum")
             }
             function cstr(s) {
             if (s == null)
             return '';
             return s + '';
             }
             function nth(number) {
             number = cint(number);
             var s = 'th';
             if ((number + '').substr(-1) == '1')
             s = 'st';
             if ((number + '').substr(-1) == '2')
             s = 'nd';
             if ((number + '').substr(-1) == '3')
             s = 'rd';
             return number + s;
             }
             function esc_quotes(s) {
             if (s == null)
             s = '';
             return s.replace(/'/, "\'");
             }
             var crop = function(s, len) {
             if (s.length > len)
             return s.substr(0, len-3) + '...';
             else
             return s;
             }
             var strip = function(s, chars) {
             if (s) {
             var s = lstrip(s, chars)
             s = rstrip(s, chars);
             return s;
             }
             }
             var rstrip = function(s, chars) {
             if (!chars)
             chars = ['\n', '\t', ' '];
             var last_char = s.substr(s.length-1);
             while (in_list(chars, last_char)) {
             var s = s.substr(0, s.length-1);
             last_char = s.substr(s.length-1);
             }
             return s;
             }
             function repl(s, dict) {
             if (s == null)
             return '';
             for (key in dict) {
             s = s.split("%(" + key + ")s").join(dict[key]);
             }
             return s;
             }
             var $r = repl;
             function replace_all(s, t1, t2) {
             return s.split(t1).join(t2);
             }
             function keys(obj) {
             var mykeys = [];
             for (var key in obj)
             mykeys[mykeys.length] = key;
             return mykeys;
             }
             function values(obj) {
             var myvalues = [];
             for (var key in obj)
             myvalues[myvalues.length] = obj[key];
             return myvalues;
             }
             function has_words(list, item) {
             if (!item)
             return true;
             if (!list)
             return false;
             for (var i = 0, j = list.length; i < j; i++) {
             if (item.indexOf(list[i])!=-1)
             return true;
             }
             return false;
             }
             function has_common(list1, list2) {
             if (!list1 ||!list2)
             return false;
             for (var i = 0, j = list1.length; i < j; i++) {
             if (in_list(list2, list1[i]))
             return true;
             }
             return false;
             }
             var inList = in_list;
             function add_lists(l1, l2) {
             return [].concat(l1).concat(l2);
             }
             function docstring(obj) {
             return JSON.stringify(obj);
             };
             function $btn(parent, label, onclick, style, css_class, is_ajax) {
             if (css_class === 'green')
             css_class = 'btn-info';
             return new frappe.ui.Button({
             parent: parent,
             label: label,
             onclick: onclick,
             style: style,
             is_ajax: is_ajax,
             css_class: css_class
             }).btn;
             }
             function empty_select(s) {
             if (s.custom_select) {
             s.empty();
             return;
             }
             if (s.inp)
             s = s.inp;
             if (s) {
             var tmplen = s.length;
             for (var i = 0; i < tmplen; i++)
             s.options[0] = null;
             }
             }
             function sel_val(s) {
             if (s.custom_select) {
             return s.inp.value ? s.inp.value : '';
             }
             if (s.inp)
             s = s.inp;
             try {
             if (s.selectedIndex < s.options.length)
             return s.options[s.selectedIndex].value;
             else
             return '';
             } catch (err) {
             return '';
             }
             }
             function add_sel_options(s, list, sel_val, o_style) {
             if (s.custom_select) {
             s.set_options(list)
             if (sel_val)
             s.inp.value = sel_val;
             return;
             }
             if (s.inp)
             s = s.inp;
             for (var i = 0, len = list.length; i < len; i++) {
             var o = new Option(list[i], list[i], false, (list[i] == sel_val ? true : false));
             if (o_style)
             $y(o, o_style);
             s.options[s.options.length] = o;
             }
             }
             var $n = '\n';
             function set_title(t) {
             document.title = (frappe.title_prefix ? (frappe.title_prefix + ' - ') : '') + t;
             }
             function $a(parent, newtag, className, cs, innerHTML, onclick) {
             if (parent && parent.substr)
             parent = $i(parent);
             var c = document.createElement(newtag);
             if (parent)
             parent.appendChild(c);
             if (className) {
             if (newtag.toLowerCase() == 'img')
             c.src = className
             else
             c.className = className;
             }
             if (cs)
             $y(c, cs);
             if (innerHTML)
             c.innerHTML = innerHTML;
             if (onclick)
             c.onclick = onclick;
             return c;
             }
             function $a_input(p, in_type, attributes, cs) {
             if (!attributes)
             attributes = {};
             var $input = $(p).append('<input type="' + in_type + '">').find('input:last');
             for (key in attributes)
             $input.attr(key, attributes[key]);
             var input = $input.get(0);
             if (cs)
             $y(input, cs);
             return input;
             }
             function $dh(d) {
             if (d && d.substr)
             d = $i(d);
             if (d && d.style.display.toLowerCase() != 'none')
             d.style.display = 'none';
             }
             function $ds(d) {
             if (d && d.substr)
             d = $i(d);
             var t = 'block';
             if (d && in_list(['span', 'img', 'button'], d.tagName.toLowerCase()))
             t = 'inline'
             if (d && d.style.display.toLowerCase() != t)
             d.style.display = t;
             }
             function $di(d) {
             if (d && d.substr)
             d = $i(d);
             if (d)
             d.style.display = 'inline';
             }
             function $i(id) {
             if (!id)
             return null;
             if (id && id.appendChild)
             return id;
             return document.getElementById(id);
             }
             function $w(e, w) {
             if (e && e.style && w)
             e.style.width = w;
             }
             function $h(e, h) {
             if (e && e.style && h)
             e.style.height = h;
             }
             function $bg(e, w) {
             if (e && e.style && w)
             e.style.backgroundColor = w;
             }
             function $y(ele, s) {
             if (ele && s) {
             for (var i in s)
             ele.style[i] = s[i];
             };
             return ele;
             }
             function make_table(parent, nr, nc, table_width, widths, cell_style, table_style) {
             var t = $a(parent, 'table');
             t.style.borderCollapse = 'collapse';
             if (table_width)
             t.style.width = table_width;
             if (cell_style)
             t.cell_style = cell_style;
             for (var ri = 0; ri < nr; ri++) {
             var r = t.insertRow(ri);
             for (var ci = 0; ci < nc; ci++) {
             var c = r.insertCell(ci);
             if (ri == 0 && widths && widths[ci]) {
             c.style.width = widths[ci];
             }
             if (cell_style) {
             for (var s in cell_style)
             c.style[s] = cell_style[s];
             }
             }
             }
             t.append_row = function() {
             return append_row(this);
             }
             if (table_style)
             $y(t, table_style);
             return t;
             }
             function append_row(t, at, style) {
             var r = t.insertRow(at ? at : t.rows.length);
             if (t.rows.length > 1) {
             for (var i = 0; i < t.rows[0].cells.length; i++) {
             var c = r.insertCell(i);
             if (style)
             $y(c, style);
             }
             }
             return r
             }
             function $td(t, r, c) {
             if (r < 0)
             r = t.rows.length + r;
             if (c < 0)
             c = t.rows[0].cells.length + c;
             return t.rows[r].cells[c];
             }
             frappe.urllib = {
             get_arg: function(name) {
             name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
             var regexS = "[\\?&]" + name + "=([^&#]*)";
             var regex = new RegExp(regexS);
             var results = regex.exec(window.location.href);
             if (results == null)
             return "";
             else
             return decodeURIComponent(results[1]);
             },
             get_dict: function() {
             var d = {}
             var t = window.location.href.split('?')[1];
             if (!t)
             return d;
             if (t.indexOf('#')!=-1)
             t = t.split('#')[0];
             if (!t)
             return d;
             t = t.split('&');
             for (var i = 0; i < t.length; i++) {
             var a = t[i].split('=');
             d[decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
             }
             return d;
             },
             get_base_url: function() {
             var url = window.location.href.split('#')[0].split('?')[0].split('desk')[0];
             if (url.substr(url.length-1, 1) == '/')
             url = url.substr(0, url.length-1)
             return url
             }
             }
             get_url_arg = frappe.urllib.get_arg;
             get_url_dict = frappe.urllib.get_dict;;
             function $c(command, args, callback, error, no_spinner, freeze_msg, btn) {
             return frappe.request.call({
             args: $.extend(args, {
             cmd: command
             }),
             success: callback,
             error: error,
             btn: btn,
             freeze: freeze_msg,
             show_spinner: !no_spinner
             })
             }
             function $c_obj(doc, method, arg, callback, no_spinner, freeze_msg, btn) {
             if (arg && typeof arg != 'string')
             arg = JSON.stringify(arg);
             args = {
             cmd: 'runserverobj',
             args: arg,
             method: method
             };
             if (typeof doc == 'string') {
             args.doctype = doc;
             } else {
             args.docs = doc
             }
             return frappe.request.call({
             args: args,
             success: callback,
             btn: btn,
             freeze: freeze_msg,
             show_spinner: !no_spinner
             });
             }
             
             */
        
          /*
                     @font-face {
                     font-family: 'Open Sans';
                     font-style: normal;
                     font-weight: 300;
                     src: local('Open Sans Light'), local('OpenSans-Light'), url(http://fonts.gstatic.com/s/opensans/v10/DXI1ORHCpsQm3Vp6mXoaTaRDOzjiPcYnFooOUGCOsRk.woff) format('woff');
                     }
                     @font-face {
                     font-family: 'Open Sans';
                     font-style: normal;
                     font-weight: 400;
                     src: local('Open Sans'), local('OpenSans'), url(http://fonts.gstatic.com/s/opensans/v10/cJZKeOuBrn4kERxqtaUH3bO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');
                     }

 */
 
 
!function(win, name, bigfactory){
             
            if(win[name]){
                   console.log(name+" object already defined!");
                   return;
            }

            if(!('radians' in Math)){
                Math.radians = function(degrees){
                    return (degrees * Math.PI / 180);
                }     
            }

            if(!('degrees' in Math)){
                Math.degrees = function(radians){
                    return (radians * 180 / Math.PI);
                }     
            }
			 
			win["TaskRunner"] = (function(){
			                       // Constructor
                                   function Task(e, t) {
                                       this.handler = e,
                                       this.args = t;
                                   }
                                   // Public method - {run}
                                   Task.prototype.run = function(con) {
                                       if ("function" == typeof this.handler){
                                             return this.handler.apply(con, this.args);
                                       }else {
                                            var scriptSource = "" + this.handler;
                                            return eval(scriptSource);
                                       }
                                   };
                             
                                   var tasksCount = [], nextHandle = 1, tasksByHandle = {}, currentlyRunningATask=false;
                             
                             
                             return {
							 
							        addTask:function(){
									     var self = this;
									     return self.addFromSetImmediateArguments.call(self, arguments, self.title);
									},
                             
                                    addFromSetImmediateArguments:function(e, k){
                                         var t = e[0], n = slice.call(e, 1), r = new Task(t, n), i;
										 if(typeof k === "string"){
										     tasksCount.push({task:k});
										 }
										 i = nextHandle++;
										 tasksByHandle[i] = r;
                                         return i;
                                    },
									
									getTasksCount:function(){
									    return tasksCount.length;
									},
                             
                                    runIfPresent:function(e, afterTask){
								            e*=1;
                                            if (currentlyRunningATask){
                                                      win.setTimeout(function() {
                                                            this["TaskRunner"].runIfPresent(e, afterTask);
                                                      }, 10);
                                            }else {
                                                 var self = this, t = tasksByHandle[e];
                                                 if(t && t instanceof Task){
                                                       currentlyRunningATask=!0;
                                                       try {
                                                           var y = t.run();
														   if(y && typeof y.promise == "function"){
														       if(y.promise().promise && typeof y.then == "function"){
															        y.then(function(result){
																        if(typeof afterTask === "function"){
										                                    afterTask(result);
									                                    }
																		currentlyRunningATask=!1;
																		//y = null;
																    });
															   }else{
															      throw new Error("TaskRunner: fake promise found!");
															   }
														   }else{
														        currentlyRunningATask=!1;
														   }
                                                       }finally {
                                                            self.remove(e);
                                                       }
                                                   }
                                            }
                                    },
                             
                                    remove: function(e) {
                                             delete tasksByHandle[e];
											 tasksCount.splice(e-1);
                                    }
                                }
                             
            }());
             
         
             
             var ob = ({}),
			     hOwn = ob.hasOwnProperty,
                 toStr = ob.toString,
				 d = win.document,
                 slice = [].slice,
                 push = [].push,
				 isNullOrUndefined = function(subject){ return (subject === null || subject === undefined); }
                 concat = [].concat,
                 execs = [];
             
                  execs.push(function(){
                             
							 "use strict";
				            
							// Add custom routines	
							 Object.empty = function(){
							 
							 };
							 
                             Object.keyExists = function(d,key){
                            	    return !!d[key] && hOwn.call(d, key);
                             };
							
			                 Object.getKeyCount = function(d, all){ 
			     	                     var count=0;
										 for(var n in d){
										    if(!all && Object.keyExists(d, n))
			     	   	                         count++;
											else
                                                 count++;											
										 } 
			     	                     return count;
			                 };
							
                             Object.clearKeys = function(d){
                             	      for(var n in d){
									     if(Object.keyExists(d, n))
                             	      	       delete d[n];
                             	      }
                             };
                             
                            
                             // Shim missing functionality for ES5 global Generics
                           
                             Object.create = Object.create || function (fi) {

                                           if (typeof (fi) != 'object' && typeof (fi) != 'function') {
                                                                return;
                                           }

                                           var j = new Function();

                                           j.prototype = fi;

                                           return (new j());

                             }

                            Object.keys = Object.keys || function (fu){
                                            if (typeof (fu) != 'object' && typeof (fu) != 'function') {
                                                                          return;
                                            }
                                            var j = [];
                                            for (var k in fuc) {
                                                  if(hOwn.call(fuc, k)) {
                                                        j.push(k)
                                                  }
                                            }
                                            var l = !ob.propertyIsEnumerable('toString'), 
											    m = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'prototypeIsEnumerable', 'constructor'];

                                            if(l) {
                                                 for (var n = 0; n < m.length; n++) {
                                                        var o = m[n];
                                                        if(hOwn.call(fuc, o)) {
                                                             j.push(o);
                                                        }
                                                 }
                                            }
                                            return j;
                            }

   
                            Array.filter = Array.filter || function (arr, func, i) {
                                      if (!(arr instanceof Array) && typeof(func) != 'function') { return; }
                                      var f, x = arr, n = [];
                                      for (d = 0; d < x.length; ++d){

                                              f = x[d];

                                            if (func.call(i, f, d, x) === true){
                                                    n.push(f);
                                            }
                                      }
                                   return n;
                            }
    


    
                             String.replace = String.replace || function (a, RE, out) {
                                             if (typeof(this) == 'function') {
                                                     this.apply(ob, new Array(arguments));
                                             }
                                             if (typeof (a) != 'object') {
											        return; 
											 }
                                             var Comp = [];
                                             for (var i = 0; i < a.length; i++){
                                                         Comp[i] = a[i].replace(RE, out);
                                             }
                                             if (Comp) { return Comp; }
                                             return null;
                            }
    
    
                            Array.isArray = Array.isArray || function (arr) {
                                   return arr && (arr instanceof Array);
                            }
							
							Array.isArrayLike = function(obj){
							     
								 if(isNullOrUndefined(obj)){
								     return false;
								 }
								  
								   if("length" in obj){
								   
								        if((obj.window) || (typeof obj === "function")){
										    return false;
										}
									 
									    return "NaN" !== String((Math.max(parseInt((obj).length), -1)));
										 
								   }	 
								 
								  return false;
								  
							}
							
							/* Tempoaray definitions */
							Array.inArray = Array.inArray || function(arr, arrElem) {
                                           for (var i = 0; i < arr.length; i++) {
                                               if (arr[i] === arrElem) return true;
                                           }
                                           return false;
                            }
							
							
							if(!Array.prototype.indexOf){
							    Array.prototype.indexOf = function(arrElem) {
                                           for (var i = 0; i < this.length; i++) {
                                               if (this[i] === arrElem) return i;
                                           }
                                           return -1;
                                }
							}	
							
							Object.each = function (obj, iterator, context) {
                             var key, length, temp, results; 
							 
                             if (obj) {
                             if (typeof obj === "function") {
							  results = (function(){});
                             for (key in obj) {
                             // Need to check if hasOwnProperty exists,
                             // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
                             if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || hOwn.call(obj,key))) {
                                  temp = iterator.call(context, obj[key], key, obj);
								  if(!isNullOrUndefined(temp))
								      results[key] = temp;
                             }
                             }
                             } else if (Array.isArray(obj) || Array.isArrayLike(obj)) {
                             var isPrimitive = typeof obj !== 'object'; 
							 results =  [];
                             for (key = 0, length = obj.length; key < length; key++){
                             if (isPrimitive || key in obj) {
                                  temp = iterator.call(context, obj[key], key, obj);
								  if(!isNullOrUndefined(temp))
								       results.push(temp);
                             }
                             }
                             } else if (obj.forEach) {
							      results = [];
                                  obj.forEach(function(){ 
								        temp = iterator.apply(this, slice.call(arguments)); 
										if(!isNullOrUndefined(temp))
								            results.push(temp);
								  }, context);
                             } else {
							  results = {};
                             for (key in obj) {
                             if (obj.hasOwnProperty(key)) {							       
                                    temp = iterator.call(context, obj[key], key, obj);
								    if(!isNullOrUndefined(temp))
									    results[key] = temp;
                             }
                             }
                             }
                             }
                             return (results)? results : obj;
                             }
   
							// Mozilla Firefox has refused to implement {outerHTML} & {innerText}, even in version 30.0.
							// These properties are well supported by other major browsers, including IE4+
							// dunno why Firefox has to be the odd one out, but here is a shim for all that !:-(
							
							
							      if(!win.document.all && win.cyrpto && Object.defineProperty){
								      if ((Element && Element.prototype) || (HTMLElement && HTMLElement.prototype)){
									     alert("it's true oooooo!");
                                         Object.defineProperty(Element.prototype,
 											   "innerText",
 											 {
											  get:function(){ 
											      return this.innerHTML.replace(/<\w+\/?>/g, "").replace(/<\/\w+>/g, "") 
											  }, 
											  set:function(str){ 
											       this.innerHTML = this.innerHTML.replace(/^.*$/, str); 
											  }, 
											  configurable:true,
											  enumerable: true,
                                              writable: true											  
										 });
                                    
									     Object.defineProperty(Element.prototype,
 											   "outerHTML",
 											 {
											  get:function(){ 
											      var j = d.createElement("body");
												  j.appendChild(this.cloneNode(true));
											      return j.innerHTML; 
											  }, 
											  set:function(str){ 
											       this.parentNode && this.parentNode.replaceChild(this, d.createDocumentFragment(str).firstChild); 
											  }, 
											  configurable:true,
											  enumerable: true, 
											  writable: true
										 });
									  }	 
								  }
							
                             
							 // Shim missing functionality in ES5 global Constructors
							 
                            var proto,
                                pT = 'prototype',
				                constrMap = {
                                     A:Array,
                                     S:String,
                                     F:Function
                             },
                             getCstor = function(d){ return d && !hOwn.call(d, "constructor") && d.constructor;  },
							 looper = function(name){
							 
							     return function(val, key, dmap){
                                     if(this[key]){
                                         ;
                                     }else{
                                         this[key] = val;
                                     }
                                 }
							 },
                             addToPrototype = function(defMap, proto, n){
                                  Object.each(defMap, looper(n), proto);
                             },
                             definitions = {
							       A:{
                                          
                                    map:function (h, i){
                                        if (typeof h != 'function') {
                                                 return;
                                        }
  
                                        var j, k = this.length, l = new Array(k);

                                        for (j = 0; j < k; ++j) {

                                              if (j in this) {
                                                    l[j] = h.call(i, this[j], j, this);
                                              }
                                        }
                                             return l;
                                    },
    

                                    some:function (h, i) {
                                                if(typeof (h) != 'function'){
                                                    return;
                                                }

                                                var j = new (ob.constructor)(this), k = j.length;

                                                for (var l = 0; l < k; l++) {

                                                   if(l in j){

                                                       if (h.call(i, j[l], l, j)) {
                                                              return true;
                                                       }
                                                   }
                                                }
                                                return false;
                                    },
  
                                    copy:function (init, length) {
                                            init = parseInt(init) || 0;
                                            if (init < 0) init = this.length + init;
                                            length = parseInt(length) || (this.length - init);
                                            var newArray = [];
                                            for (var i = 0; i < length; i++) newArray[i] = this[init++];
                                            return newArray;
                                    },
									
                                    reduceRight:function (fun) {
                                                var len = this.length;
                                                if(typeof fun != "function" && len == 0 && arguments.length == 1){
                                                              return;
                                                }
                                                var i = len - 1;
                                                       if (arguments.length >= 2) {
                                                            var rv = arguments[1];
                                                       }else {
                                                            do {
                                                               if (i in this){
                                                                      rv = this[i--];
                                                                      break;
                                                               }
                                                               if (--i < 0) return;
                                                           }while (true);
                                                       }
                                                       for (; i >= 0; i--){
                                                             if (i in this){
                                                                    rv = fun.call(null, rv, this[i], i, this);
                                                             }
                                                       }
                                                        return rv;
                                    },
									indexOf:function(arrElem) {
                                           for (var i = 0; i < this.length; i++) {
                                               if (this[i] === arrElem) return i;
                                           }
                                           return -1;
                                    },
									
                                    forEach:function(f, i) {
                                          return (this.map.call(this, f, i));
                                    },
									
                                    lastIndexOf:function (arlm) {
                                            for (var u = this.length - 1; u > -1; u--){
                                                  if (this[u] === arlm){
                                                           return u;
                                                  }
                                            }
											return -1;
                                    },
                                    assoc:function (arrKeys){
                                           if (!arreys || !(arrKeys instanceof Array)) return;
                                               var obj = {}, len = (this.length === arrKeys.length) ? this.length : arrKeys.length;
                                               for (var i = 0; i < len; i++) obj[arrKeys[i]||""+i] = this[i];
                                                  return obj;
                                    },
									every:function (h, i){
                                           if (typeof (h) != 'function') {
                                                          return;
                                           }
                                           var j = new ob.constructor, k = j.length;

                                          for (var l = 0; l < k; l++) {
                                                if (l in j) {
                                                    if (!h.call(i, j[l], l, j)) {
                                                          return false;
                                                    }
                                                }
                                          }
                                          return true;
                                    }
    
                                  },
				  S:{
                                      trim:function(){
                                          return (this.replace(/(^\s+(.*))/, function(match, m1, m2, offset, str){ // IE4+ can sure handle this!!
                                           	return  m2.replace(/\s+$/,"");  
                                           }));
                                      },
                                      endsWith:function(suffix){
                                      	
                                      	if(!suffix.length){return true;} 
                                      	if(suffix.length>this.length){return false;} 
                                      	return(this.substr(this.length-suffix.length)==suffix);
                                      	
                                      },
                                      trimRight:function(){
                                            return this.replace(/^\s+/, "");
                                      },
                                      startsWith:function(prefix){
                                      	     if(!prefix.length){return true;} 
                                      	     if(prefix.length>this.length){return false;} 
                                      	     return(this.substr(0,prefix.length)==prefix);
                                      }
                                  },
                                  F:{       
                                     bind:function(){
                                                   var fn = this,
                                                   args = [].slice.call(arguments),
                                                   object = args.shift();
                                                   return fn.apply(object, args.concat([].slice.call(arguments)));
                                     }
                                  }
                                  
                             },
							 i;
                             
                             
                             for(i in definitions){
                             	   proto = constrMap[i];
                             	   proto = proto[pT];
                                   addToPrototype(definitions[i], proto, i);
                             }
              
                             definitions = addToPrototype = i = looper = constrMap = getCstor = proto = null;
                            
                   }, function(global){
                         
                         "use strict";
						 
			 // Shim functionality for 'requestAnimationFrame'
                             
                         for(var a=["webkit","moz","ms"], m=0; m<a.length && !window.requestAnimationFrame; ++m){
                             var l=a[m];
                             global.requestAnimationFrame = global[l+"RequestAnimationFrame"];
                             global.cancelAnimationFrame = global[l+"CancelAnimationFrame"]||global[l+"CancelRequestAnimationFrame"]
                        }
                             
                        if(/iP(ad|hone|od).*OS 6/.test(global.navigator.userAgent)||!global.requestAnimationFrame||!global.cancelAnimationFrame){
                             var k=0;
                             global.requestAnimationFrame=function(a, e){
                                    var c=Date.now()||(new Date).getTime(),
                                    f = Math.max(k+16,c);
                                    return setTimeout(function(){
                                               a(k=f)
                                    },f-c);
                             };
							 
                             global.cancelAnimationFrame=clearTimeout;
                             
                       }
     
                             
                  }, function(global){
                  	
                  	 "use strict";
                     // Shim functionality for 'setImmediate'
                             
                        function canUseNextTick() { /* for NodeJS env */
                                return "object" == typeof process && "[object process]" === toStr.call(process)
                        }
                        function canUseMessageChannel() {
                             return !!global.MessageChannel
                        }
                        function canUsePostMessage() {
                             if (!global.postMessage || global.importScripts)
                             return !1;
                             var g=!0, t = global.onmessage;
                             return global.onmessage = function(e) { g=!1 }, global.postMessage("[null]", "*"), global.onmessage = t, g
                        }
                             
                        function canUseReadyStateChange() {
                             return "document"in global && "onreadystatechange"in global.document.createElement("script")
                        }
                        function installNextTickImplementation(e) {
                             e.setImmediate = function() {
                                  var e = TaskRunner.addFromSetImmediateArguments(arguments);
                                  return process.nextTick(function() { TaskRunner.runIfPresent(e); }), e
                             }
                        }
                        function installMessageChannelImplementation(e) {
                             var t = new global.MessageChannel;
                             t.port1.onmessage = function(e) {
                                var t = e.data;
                                TaskRunner.runIfPresent(t)
                             }, e.setImmediate = function() {
                                  var e = TaskRunner.addFromSetImmediateArguments(arguments);
                                  return t.port2.postMessage(e, "*"), e;
                             }
                        }
                             
                             
                        function installReadyStateChangeImplementation(e) {
                             e.setImmediate = function() {
                                  var e = TaskRunner.addFromSetImmediateArguments(arguments), t = global.document.createElement("script");
                                  return t.onreadystatechange = function() {
                                      TaskRunner.runIfPresent(e), t.onreadystatechange = null, t.parentNode.removeChild(t), t = null
                                  }, global.document.documentElement.appendChild(t), e
                             }
                        }
						
						function installPostMessageImplementation(e){
						       global.onmessage = function(e){
							      var t = e.data;
								  TaskRunner.runIfPresent(t);
							   },
						       e.setImmediate = function(){
							       var e = TaskRunner.addFromSetImmediateArguments(arguments);
								   return global.postMessage(e.toString(), "*"), e;
							   }
						}
                             
                        function installSetTimeoutImplementation(e) {
                             e.setImmediate = function() {
                                 var e = TaskRunner.addFromSetImmediateArguments(arguments);
                                 return global.setTimeout(function() { TaskRunner.runIfPresent(e); }, 0), e;
                             }
                        }
                             
                    
                             
                             
                             if (!global.setImmediate) {
                                  var attachTo = "function" === typeof Object.getPrototypeOf && "setTimeout" in Object.getPrototypeOf(global) ? Object.getPrototypeOf(global) : global;
                                      canUseNextTick() ? installNextTickImplementation(attachTo) : canUsePostMessage() ? installPostMessageImplementation(attachTo) : canUseMessageChannel() ? installMessageChannelImplementation(attachTo) : canUseReadyStateChange() ? installReadyStateChangeImplementation(attachTo) : installSetTimeoutImplementation(attachTo), attachTo.clearImmediate = function(j){ TaskRunner.remove(j); }
                             }

                             
                 
                  });
             
                  for(var y=0; y < execs.length; y++){
             
                      execs[y].call(null, win);
             
                  }
				  
				  var supportsCheckTable = {
                        "webgl": "return 'WebGLRederingContext' in window && (document.createElement('canvas').getContext('experimental-webgl') || document.createElement('canvas').getContext('webgl'));",
                        "template":"return 'context' in document.createElement('template');",
			            "localstorage":"var x; \
                                       try{ \
                                         x = typeof Storage !== 'undefined' && 'localStorage' in window && window['localStorage'] !== null; \
                                       }catch(ex){ \
                                           x = !(window.location.protocol.indexOf('file:') > -1) && false; \
                                       } \
                                       return x;", 
			            "touchgesture":"return 'ontouchstart' in window"
                  },
				  
				  tests = function(feature){
				       var x, __func, all = {};
				       for(x in supportsCheckTable){
                           if(hOwn.call(supportsCheckTable, x)){
				              __func = new Function(supportsCheckTable[x]);
                              all[x] = (__func)();
                          }
                       }
					   return (feature)? all[feature] : all;
				  },
             
                  __wap = win[name] = bigfactory(win, hOwn, toStr, slice, tests);
				  
                     // __func__ = "[function(){ return (#); }.bind(window)][0]";
             
                  __wap.HTML5Supports = tests();
          
                   
             
                   execs = concat = push = d = x = null; // free some memory...
             
             
             }(this, "$cdvjs", function(w, $h, $s, $sl, $UAtests, undefined){
               
               // No need for "use strict"; cos we'll be disobeying some rules here!!
               
                var cdvjs,
				
		   doc = w.document,
               
                  nav = w.navigator,
               
                  loc = w.location,
               
                  regex = /(?:(file|http|ws|ssh|https|ftp)\:\/\/(?:\/)?)?([^\/]+)(?:\/([^\/]+))\/((?:#[\w]+)?[^\.]+\.[a-zA-Z]+)?/g,
               
                  UriRgx = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
               
                  b64array = "ABCDEFGHIJKLMNOP"+
                             "QRSTUVWXYZabcdef"+
                             "ghijklmnopqrstuv"+
                             "wxyz0123456789+/=",
                  pkey =     "ABCDEFGHIJKLMN"+
                             "OPQRSTUVWYZ0123456789ab"+
                             "cdefghijklmnopqrstuvwxyz@ ,"+
                             "!#$%^*/?><:;+_-=.",
               
                 avf = "0123456789abcdef",
               
                 pM = 'postMessage',
             
                 cI = 'clientInformation',
               
                 aEL = 'addEventListener',
               
                 rEL = 'removeEventListener',
               
                 aE = 'attchEvent',
             
                 cE = 'createElement',
				 
				 aC = 'appendChild',
				 
				 oD = 'ownerDocument',
               
                 dE = 'detachEvent',
             
                 gETN = 'getElementsByTagName',
				 
				 cTN = 'createTextNode',
               
                 dEm = 'documentElement',
				 
				 nT = 'nodeType',
				 
				 nN = 'nodeName',
				 
				 oP = 'offsetParent',
               
                 dM = 'documentMode',
                 
                 noop = function(){},
				 
				 rAllFunc = /^(?:[\r|\r?\n|\s]*)function(?:[\r|\r?\n|\s]*)(?:([^\r\n\s]+?)|)(?:[\r|\r?\n|\s]*)\((?:[\r|\r?\n|\s]*)([^\)]*)(?:[\r|\r?\n|\s]*)\)(?:[\r|\r?\n|\s]*)\{(.*)\}(?:[\r|\r?\n|\s]*)$/ig,
				 
				 CreateMSXMLDocument = function(){
				 
				       var progIDs=[
                            	   'Msxml2.DOMDocument.3.0',
                            	   'Msxml2.DOMDocument',
                            	   "Msxml2.DOMDocument.6.0", 
                                   "Msxml2.DOMDocument.5.0", 
                                   "Msxml2.DOMDocument.4.0", 
                                   "MSXML2.DOMDocument", 
                                   "MSXML.DOMDocument"
                            	];
                            	       
                            if(w.ActiveXObject){
                            	for(var i=0;i<progIDs.length;i++){
                            	       	try{
                            	       	      return (new ActiveXObject(progIDs[i]));
                            	        } catch(ex){ }
                            	}
							}	
				 },
                 
                 futuresStates = {
                      STARTED:0,
                      AWAIT:1,
                      RESOLVED:2,
                      REJECTED:3
                 },
                 formatOptions = function(opts){
                      var options = {};
                      (String(opts).split(",")).forEach(function(key){
                                options[key] = true;
                      });
					  options.savedData = !1;
                      return options;
                },
                 Routines = function(opts){
	
                   var options = formatOptions(opts),
                       fireStart,
                       fireEnd,
                       index,
                       fired,
                       firing,
                       pending = [],
                       queue = options.multiple && [],
                       fire = function(data){
                             options.savedData = !fire.$decline && options.save && data; // save it only when we are not rejecting {fire.$decline != true}!
                             fired = true;
                             firing = true; // firing has begun!
                             index = fireStart || 0;
                             fireEnd = pending.length;
                             for(fireStart = 0; index < fireEnd; index++){
                                  setTimeout(pending[index].bind(data[0], data[1]), 50); // fire asynchronously (Promises/A+ spec requirement)
                             }
                             firing = false; // firing has ended!
        
                             if(queue){ // deal with the queue if it exists and has any contents...
                                 if(queue.length){
								     return fire(queue.shift()); // fire on the {queue} items recursively
                                 }
                                  // if queue is empty.... then end [flow of control] at this point!
                             }
        
                             fire.$decline = false;
							 
					if(options.savedData){
						if(options.unpack){
						    // clear our {pending} list and free up some memeory!!
							pending.length = 0; // saves the reference {pending} and does not replace it!
						}
					}
                };
	
	return {
    add:function(){
        var len = 0;
        if(pending){ // if not disbaled
            
            var start = pending.length;
            (function add(args){
             
                   args.forEach(function(arg){
				          var type = typeof arg;
                          
                          if(type == "function"){
                            //if(!fired){  this seems to be the reason for not triggering on late activation!!
                                len = pending.push(arg);
                            //}
                          }else{
                             if(!!arg && arg.length && typeof arg != "string")
                                 add([].slice.call(arg)); // inspect recursively
                          }
                   });
             
             }([].slice.call(arguments)));
            
            
			if( fired ){ // if we have already run the {pending} list of routines at least once, ...
				   if(options.join){
					  fireStart = start; 
					  fireEnd = len; // update info again...
					  fire.$decline = true;
					  fire( options.savedData ); // fire with the saved data 
					  this.disable();
					  
				   }  
			}
            
            
        }
        return len;
    },
    hasFn:function(fn){
	    var result = false;
        Object.each(pending, function(val){
		     if(typeof fn === "function" && fn === val)
			      result = true;
		}, this);
		return result;
    },
    hasList:function(){
        return !!pending; // [false] only when the disabled(); method has been called!!
    },
    fireWith:function(/* context, args */){
        if(pending && (!fired || queue)){
            var args = arguments.length && [].slice.call(arguments) || [null, 0];
            //,context = args.splice(0, 1) || [];
            //args = [context[0], args];
            
            if(firing){ // we are currently iterating on the {pending} list of routines
                queue.push( args ); // queue assets for recursive firing within {fire} function later
            }else{
                fire( args );
            }
        }
    },
    disable:function(){
	    if(!options.savedData){
             pending = queue = undefined;
	    }
    }
  };
    
},
  // Implementation of the Promises/A+ spec 
Futures = function(){
	
    var defTracks = {
        resolve:['done', 'RESOLVED', Routines(['join', 'save'])],
        reject:['fail', 'REJECTED', Routines(['join','save'])],
        notify:['progress', 'AWAIT', Routines(['join', 'multiple'])]
    },
    self = this,
    keys = Object.keys(defTracks),
    setter = function(dx, arr,  forPromise){
        var drop = (dx != "notify");
        if(!arr.length && !forPromise) return defTracks[dx][2].fireWith;
        return (!forPromise)? function(){
            if(self.state >= 0 && self.state <=1){
                self.state = futuresStates[defTracks[dx][1]];
            }
            defTracks[dx][2].fireWith(self === this? self : this, [].slice.call(arguments));
            if(drop){
			    defTracks[arr[0]][2].disable();
                defTracks[arr[1]][2].disable();
			    switch(dx){	
				   case "reject":
				   case "resolve":
				      self.state = futuresStates[defTracks[dx][1]];
				   break;
			    }	
			}
            return true;
        } : function(){
            if(self.state >= 0 && self.state <=1){
                defTracks[dx][2].add.apply(self, [].slice.call(arguments));
            }
            return self;
        } ;
    },
    i = 0,
    ax = keys.slice(),
    d,
    promise = {};
    
    
    // using a closure to define a function on the fly...
    for(d in defTracks){
        if($h.call(defTracks, d)){
            keys.splice(i++, 1);
            self[d] = setter(d, keys);
            self[d+"With"] = setter(d, []);
            promise[defTracks[d][0]] = setter(d, [], true);
            keys = ax.slice();
        }
    }
    
    
    promise.state = futuresStates.STARTED;
	
    promise.always = function(){
        return this.done.apply(self, arguments).fail.apply(self, arguments);
    };
	
    promise.promise = function(obj){
        if(obj && typeof obj == "object" && !obj.length){
            for(var i in promise){
                if($h.call(promise, i)){
                    obj[i] = promise[i];
                }
            }
            return obj;
        }
        return promise;
    };
	
    promise.then = function(/* fnDone, fnFail, fnProgress */){
        var ret, args = [].slice.call(arguments);
        args.forEach(function(item, i){
                     item = (typeof item == "function") && item;
                     self[defTracks[keys[i]][0]](function(){
					       var rt;
					       try{ // Promises/A+ specifies that errors should be conatined and returned as value of rejected promise
                               rt = item && item.apply(this, arguments);
                           }catch(e){ 
						       rt = this.reject(e);
						   }finally{
						       if(rt && typeof rt.promise == "function")
                                    ret = rt.promise();						   
						   }	   
                     });
        });
        return self.promise(ret);
    };
	
    promise.isResolved = function(){
        return !defTracks['reject'][2].hasList();
    };
    promise.isRejected = function(){
        return !defTracks['resolve'][2].hasList();
    };
    promise.pipe = promise.then;
    
    promise.promise(self);
    
    Futures.STARTED = futuresStates.STARTED;
    Futures.AWAITING = futuresStates.AWAIT;
    Futures.RESOLVED = futuresStates.RESOLVED;
    Futures.REJECTED = futuresStates.REJECTED;
    
    
    setter = ax = d = i = null; // avoid leaking memory with each call to Futures constructor!!
    
	// enforce new!
	return (self instanceof Futures)? self : new Futures();
},
             
                 onload = w[aEL] || w[aE],
             
                 offload = w[rEL] || w[dE],

                 haspost =  !!w[pM],
             
                 isIE6 = !!w[cI] && w[cI].appVersion.match(/\s*MSIE\s*6/),
               
                 isIE = !!doc[dM] || isIE6,
				 
				 undoEvent = function(evt, fn, c){
				     try{
                           offload.apply((c||w), ((isIE  && (doc[dM] || 5) < 9) ? ["on"+evt, fn] :  [evt, fn, false]));
                     }catch(_ignore){
					 
					 }
				 },
             
                 doEvent = function(evt, fn, c){
           
                     try{
					  
                          onload.apply((c||w), ((isIE && (doc[dM] || 6) < 9) ? ["on"+evt, fn] :  [evt, fn, false]));
                     }catch(_ignore){  }
             
                 },
                 Delegate = {}, 
                 
                 __Namespace = function(name){
                 	this.__typeName=name;
                 
                 },
                 _create=function(targets){
                 	  var delegate=function(){
                 	  	   if(targets.length==2){
                 	  	   	  return targets[1].apply(targets[0],arguments);
                 	  	   	
                 	  	   } else{
                 	  	   	for(var i=0;i<targets.length;i+=2){
                 	  	   		targets[i+1].apply(targets[i],arguments);
                 	  	   		
                 	  	   	} return null;
                 	  	   	
                 	  	   }
                 	  	
                 	  };
                 	  delegate.invoke=delegate;
                 	  delegate._targets=targets;
                 	  return delegate;
                 },
				 /* @REM: almost done!! -- "cachestore" */
				 generateFunction = function(funcStr){
                          var fbits = rAllFunc.exec(funcStr);
						  if(!fbits){
						     return funcStr;
						  }
						  
                          if(funcStr.indexOf("[native code]") === -1){
                                return (new Function(fbits[2], fbits[3]));
                          }else{
						       return (fbits[1])? w[fbits[1]] : noop;
						  }
						   
						  return noop;
				 },		   
                 extendObj = function(Obj1, Obj2, deep, transformCallback) {
				            var temp;
                            for (var prop in Obj2){
                               if('hasOwnProperty' in Obj2){
							          
                                   if (Obj2.hasOwnProperty(prop) && !($h.call(Obj1, prop))){
								       if(deep && Obj2[prop] && typeof(Obj2[prop]) === "object" && !('length' in Obj2[prop])){
									          Obj1[prop] = extendObj((Obj1[prop] || {}), Obj2[prop], deep, transformCallback);
                                       }
									   temp = (transformCallback)? transformCallback(Obj2[prop], prop) : Obj2[prop];
                                       Obj1[prop] = (Array.isArray(temp))? $sl.call(temp) : temp ;  // copy the property or method from [Obj2] to [Obj1] if [Obj1] does not have it!
                                   }
                                   if(Obj2.hasOwnProperty(prop) && $h.call(Obj1, prop)){
								       if(deep && Obj2[prop] && typeof(Obj2[prop]) === "object" && !('length' in Obj2[prop])){
									          Obj1[prop] = extendObj((Obj1[prop] || {}), Obj2[prop], deep, transformCallback);
                                       }
                                       temp = (transformCallback)? transformCallback(Obj2[prop], prop) : Obj2[prop];
                                       Obj1[prop] = (Array.isArray(temp))? $sl.call(temp) : temp ; // update [Obj1] using values from [Obj2] if [Obj1] does have it!
                                   }
                               }else{ // since window/DOM [Obj1] object in IE 8 does not support 'hasOwnProperty' method!!!
                                      if($h.call(Obj2, prop) && !Obj1[prop]){
									          temp = (transformCallback)? transformCallback(Obj2[prop], prop) : Obj2[prop];
                                              Obj1[prop] = (temp)? temp : Obj2[prop];
                                      }
                               }
                           }
                           return Obj1;
                 },
				
                 Type = {};
				 
				 // Logger interface
				 
				 function Logger(config){

					   this.config = config || {};
					   this.localDriver = window.console;
					   this.remoteDriver = this.config.driver; 
					   this.currentErrorObj = null;
					   this.promiseObj = null;

					   var self = this;
					   var hasW3CEvent = ('addEventListener' in window);
					   var hasWHATWGEvent = ('onerror' in window);
					   var original = hasWHATWGEvent && window.onerror;

					   if(hasW3CEvent){
						  this.promiseObj = new Futures(); // Futures is my custom Promises/A+ implementation
						  window.addEventListener('error', function(event){
							 setTimeout(function(){ 
							   if(self.currentErrorObj === null){
								   self.currentErrorObj = event.error;
								   if(!('message' in self.currentErrorObj)){
										self.currentErrorObj.message = event.message;
								   }
							   }
							   self.promiseObj.resolve(self.currentErrorObj.stack);
							 },1); // delay the event until all synchronously handled events finish executing 
						  });
					   }
					   
					   if(hasWHATWGEvent){
						 window.onerror = function(message, source, lineNumber, columNumber, errObj){
						   if(self.currentErrorObj === null){
							   self.currentErrorObj = errObj || null;
						   } 
					  
						   var bound = self.log.bind(self, 'error', {
							  message:message,
							  file:source,
							  lineNumber:lineNumber,
							  columnNumber:columNumber
						   }); 
						  

						   if(!self.currentErrorObj || hasW3CEvent){ // if this evaluates to true, it means we are to wait for the W3C event
							  self.promiseObj.then(bound, function(val){ 
									self.promiseObj = val; 
							  });
						   }else{
							   // clear the timeout
							   if(self.promiseObj){
								  self.promiseObj.reject(null);
							   }
							   if(self.currentErrorObj){
								   bound(self.currentErrorObj.stack);
							   }
						   }
						};   
					  }
					  return this;
                 };

				Logger.prototype.log = function(logType, details, stack){
				  if(!this.config.disabled && this.defaultDriver){
					this.defaultDriver[logType](details.message, details.file + "\n\n" + details.lineNumber + "\n\n" + details.columNumber, stack);
				   }
				   if(this.config.env === "local" 
						&& !this.config.disabled
						&& (this.currentErrorObj instanceof Error)){
						this.dispatchToScreen(this.config.screen_dispatch);
						//original && original();
				   }
				}

				Logger.prototype.dispatchToScreen = function(can_dispatch){
					 if(can_dispatch){
						alert(this.currentErrorObj.toString());
					 }
				}

				Logger.prototype.disable = function(localLogOff){
					this.config['disabled'] = true;
				}

				Logger.prototype.setConfig = function(key, value){
				   this.config[key] = value;
				   return true;
				}
                 
                __Namespace.prototype={ 
                	  __namespace:true,
                	  getName:function(){
                	  	 return this.__typeName;
                	  }
                	
                };	
 
                 
                 Delegate.Null = function(){};
                 
                 Delegate.create=function(object,method){
                 	   if(!object){
                 	   	method.invoke=method;
                 	   	return method;
                 	   	
                 	   } 
                 	   return _create([object,method]);
                 	
                 };
                 
                 Delegate.combine=function(delegate1,delegate2){
                 	    if(!delegate1){
                 	    	  
                 	    	  if(!delegate2._targets){
                 	    	  	return Delegate.create(null,delegate2);
                 	    	  	
                 	    	  } 
                 	       return delegate2;
                 	    } 
                 	    
                 	    if(!delegate2){
                 	    	
                 	    	if(!delegate1._targets){
                 	    		return Delegate.create(null,delegate1);
                 	    		
                 	    	} 
                 	    	return delegate1;
                 	    	
                 	    } 
                 	    var targets1=delegate1._targets?delegate1._targets:[null,delegate1],
                 	        targets2=delegate2._targets?delegate2._targets:[null,delegate2];
                 	        return Delegate._create(targets1.concat(targets2));
                 	
                 }

                 Delegate.remove=function(delegate1,delegate2){
                 	
                 	if(!delegate1||(delegate1===delegate2)){
                 		return null;
                 		
                 	}
                 	
                 	if(!delegate2){
                 		
                 		return delegate1;
                 		
                 	} 
                 	
                 	var targets=delegate1._targets,
                                      object=null,
                                	method;
                 	
                 	if(delegate2._targets){
                 		object=delegate2._targets[0];
                 		method=delegate2._targets[1];
                 		
                 	} else{
                 		method=delegate2;
                 		
                 	}
                 	
                 	for(var i=0;i<targets.length;i+=2){
                 		
                 		if((targets[i]===object)&&(targets[i+1]===method)){
                 			if(targets.length==2){
                 				return null;
                 				
                 			} 
                 			targets.splice(i,2);
                 			return _create(targets);
                 			
                 		}
                 		
                 	} 
                 	return delegate1;
                 	
                 }

                 Delegate.createExport = function(delegate,multiUse){var name='__'+(new Date()).valueOf();Delegate[name]=function(){if(!multiUse){Delegate.deleteExport(name);} delegate.apply(null,arguments);};return name;}

                 Delegate.deleteExport = function(name){if(Delegate[name]){delete Delegate[name];}}

                 Delegate.clearExport = function(name){if(Delegate[name]){Delegate[name]=Delegate.Null;}}
                 
                 
                 Type.createNamespace = function(name, asGlobal){
                 	  if(!w.__namespaces){
                 	  	 w.__namespaces={};
                 	  	
                 	  } 
                 	  if(!w.__rootNamespaces){
                 	  	 w.__rootNamespaces=[];
                 	  	
                 	  } 
                 	  
                 	  if(w.__namespaces[name]){
                 	  	return;
                 	  } 
                 	  
                 	  var base, part, nso, ns = asGlobal?w:(base = {}),
                 	  nameParts=name.split('.');
                 	  
                 	  for(var i=0;i<nameParts.length;i++){
                 	  	  part=nameParts[i];
                 	  	  nso=ns[part];
                 	  	  
                 	  	  if(!nso){
                 	  	  	ns[part] = (nso = asGlobal? (new __Namespace(nameParts.slice(0,i+1).join('.'))) : {});
                 	  	  	 if(i==0 && asGlobal){
                 	  	  	 	 w.__rootNamespaces.push(nso);
                 	  	  	 	
                 	  	  	 }
                 	  	  	
                 	  	  } 
                 	  	  ns=nso;
                 	  	
                 	  } 
                 	  
                 	 if(asGlobal){ 
                 	       w.__namespaces[name] = ns;
                 	 }else{
                 	 	return base;
                 	 }
                 	
                 };
                 
                 Type.createEnum = function(){
                 	
                 };
                 
                 Type.hasRootNamespace = function(name){
                 	return !!w.__rootNamespace[name];
                 };
               
                 var Service = (function(){
                       // Private data
                       var _type = "single",
					       _transformToTrace = function(lns, fn, jump){
						        for(var i=0, len = lns.length; i < len; i++){
									if(lns[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)){
									       fn(lns[i], i);
										   if(jump) i++;
									}
							    }
						   },
                           makeNode = function(){
                                 return {data:null, next:null};
                           },
						   watchCount = function(ob){
                                 ob.count = ob.keys.length;
                                 if(!ob.isBound()){ // if the stack is outside its bounds
	                                     throw "::STACK_BOUNDS_ERROR - Cannot update stack object";
	                             }
                           },
                           updatePointer = function(ob){
                                 ob.pointer = ob.keys[0];
	                             watchCount(ob);
                           },
                           keyGen = function() {
                                   return ("00" + (Math.random()*Math.pow(10,4) << 0).toString(36)).slice(-4)
                           };
    

                        // Constructors
                        function StringBuilder(){
                        	var me = this,
							privateopts = {
                        		
                        	},
                        	settings = extendObj(privateopts, opts),
                            buffer = [];
    
    
                             me.append = function(string){
                                      buffer.push(string);
                                      return me;
                             }
    
                             me.appendBuffer = function(bufferToAppend){
                                  buffer = buffer.concat(bufferToAppend);
                             }
    
                             me.toString = function(){
                                      return buffer.join("");
                             }
    
                             me.getLength = function(){
                                    return buffer.length;
                             }
    
                             me.flush = function(){
                                    buffer.length = 0;
                             }
    
                        };
                        
                        function Stack(obj, limit){
                           // REM: a stack is a LIFO data structure
                           this.elements = []; // init assoc array OR linear hash table;
                           this.keys = [];
                           this.count = this.keys.length;
                           this.limit = (typeof limit == "number" && limit) || 10;
                           this.owner = obj || window.document;
   
                           this.pointer = null;
							
                        	var privateopts = {
                        		
                        	},
                        	settings = extendObj(privateopts, this);
                        	
                        	return (!(this instanceof Stack))? new Stack(arguments) : this;
                        }
                        
                        
                        Stack.prototype.peek = function(){
                                return this.elements[this.pointer];
                        }
   
                        Stack.prototype.push = function(value){
                                this.keys.unshift(keyGen()); // key to be generated randomly by a hash generator!!
		                        updatePointer(this);
		                        this.elements[this.pointer] = (value !== null && value); // creating linear hash table
		                        return this.count;
                        } 
   
                        Stack.prototype.pop = function(){
                                var item = this.elements[(this.pointer === this.keys.shift() && this.pointer)];
		                        updatePointer(this);
		                        this.elements.slice(1, this.count);
		                        return (item)? item : null;
                        }
   
                        Stack.prototype.empty = function(){
	                             this.elements.length = 0;
                        }
						
						Stack.prototype.isEmpty = function(){
						    return (this.elements.length === 0);
						}
   
                        Stack.prototype.duplicate = function(val){
                                 this.push(val);
	                             this.push(val);
                        }
   
                        Stack.prototype.swap = function(){
   
                        }
   
                        Stack.prototype.rotate = function(){
   
                        }
   
                        Stack.prototype.isBound = function(){
                             return (this.count >= 0 && this.count <= this.limit);
                        }

                        
                        function LinkedList(limit, type){
                               this.type = type || _type;
                               this.limit = limit || (1e+1000000000000);
                               this.start = null;
                               this.size = -1;
                        	 
							 var privateopts = {
                        		isSealed:false,
								isFrozen:false,
								isGenerator:false
                        	 },
                        	 settings = extendObj(privateopts, this);
                        	
                        	return (!(this instanceof LinkedList))? new LinkedList(arguments) : this;
                        }
                        
                        LinkedList.prototype.add = function(d){
                                if(!d || typeof d == "undefined"){
                                         return false;
                                }
                                if(!this.isEmpty()){
                                      this.end.next = makeNode();
                                      this.end = this.end.next;
                                }else{
                                      this.start = makeNode();
                                      this.end = this.start;
                                }
                                      this.end.data = d;
                                      ++(this.size);
                                      return true;
                        }

                        LinkedList.prototype.sort = function(uporder){ // uporder:Boolean->Ascending or Descending
                                var art = this.toArray(),
                                    len = art.length;
                                    art.sort(function(a, b){
                                          return (uporder? (a - b)  : (b - a) );
                                    });
                                    this.clear();
                                    this.fromArray(art);
                        };

                        LinkedList.prototype.fromArray = function(arr){
                                        var i = 0;
                                        while(i !== arr.length){
                                            if(!this.add(arr[i])){
                                                throw new Error("");
                                            }
                                            ++i;
                                        }
                                        i = null;
                        };

                        LinkedList.prototype.getSize = function(){
                                 return (this.size+1);
                        };

                        LinkedList.prototype.get = function(i){
                                 i = parseInt(i);
                                 var index = -1,
                                   current = this.start;
                                   while(current  != null){
                                        ++index;
                                        if(index != i){
                                              current = current.next;
                                        }else{
                                              break;
                                        }
                                   }
                                index = null;
                                return current.data;
                        };

                        LinkedList.prototype.remove = function(d){
                             if(!d || typeof d == "undefined"){
                                    return false;
                             }
                             var current = this.start,
                             previous = this.end.next;
    
                            while(current !== null){
                                if(d === current.data){
                                     // deal with the first node
                                     if(current === this.start){
                                          this.start.next = previous;
                                          this.start = current.next;
                                          return true;
                                     }
                                     if(current === this.end){
                                          this.end = previous;
                                     }
                                     previous.next = current.next
                                }
                                previous = current;
                                current = current.next;
                            }
                            return false;
                        };

                        LinkedList.prototype.isEmpty = function(){
                            return (this.start === null);
                        };

                        LinkedList.prototype.toArray = function(){
                               var arr = [],
                               current = this.start;
                               while(current !== null){
                                     arr.push(current.data);
                                     current = current.next;
                                }
                                return arr;
                        };
       
                        LinkedList.prototype.clear = function(){
                                var current = this.end.next;
                                while(current !== this.end){
                                      current = this.start;
                                      this.start = current.next;
                                      current.next = this.end.next;
                                }
                                this.start = null; // signal emptiness of the list
                                (this.size)=-1;
                        };
       
                        LinkedList.prototype.iterateWith = function(f, context){
                                 if(typeof f != "function"){
                                       throw new Error("invalid argument");
                                 }
                                 var i = 0, current = this.start;
                                 while(current !== null){
                                       f.call(context, current.data, i++);
                                       current = current.next;
                                 }
                        };

                        LinkedList.prototype.insertAsFirst = function(d){
                             // Need to make sure that {d} is not in the list to start with
                             if(this.remove(d)){
                                  throw new Error("Invalid operation on list ");
                             }
                             var temp = makeNode();
                             temp.next = this.start;
                             temp.data = d;
                             this.start = temp;
                        };

                        LinkedList.prototype.getLastIndex = function(){
                              return this.size;
                        };
       
                        LinkedList.prototype.insertAfter = function(t, d){
                              var temp,
                              current = this.start;
       
                              while(current !== null){
                                  if(current.data === t){
                                           continue;
                                  }
                              }
                        };

                        
                        function TreeNode(value){
                              this.isParent = false;  // every node starts out without having children
                              this.hasParent = false; // every node starts out without having a parent
                              this.value = value;
                              this.key = null; // may or may not be used (depends on client code use of the <TreeNode>)
                              this.isLeaf = true;
    
                              this.children = new LinkedList();
    
                              var privateopts = {
                                  isSealed:false,
								  isFrozen:false,
								  isGenerator:false
                              },
                              settings = extendObj(privateopts, this);
    
                              return (!(this instanceof TreeNode))? new TreeNode(arguments) : this;
    
                        }


                        TreeNode.prototype.addChild =  function(/* <TreeNode> */child){
                                if(child === null || !(child instanceof TreeNode)){
                                     throw new Error("TREE_ERROR: child is not valid <TreeNode>!");
                                }
    
                                if(child.hasParent){
                                     throw new Error("TREE_ERROR: child <TreeNode> already has a parent!");
                                }
    
                                if(!this.isParent){
                                      this.isParent = true; // Since the node has at least one child now, it is now a parent!!
                                      this.isLeaf = false; // Since the node has at least one child now, it cannot be a leaf!!
                                }
    
                                child.hasParent = true;
                                this.children.add(child);
                        }

                        TreeNode.prototype.getChildren = function(){
                                 return this.children.toArray();
                        }

                        TreeNode.prototype.childCount = function(){
                                 return this.children.getSize();
                        };

                        TreeNode.prototype.getChild = function(index){
                                 return this.children.get(index);
                        };


                        function Tree(value){
                              if(!value || typeof value == "undefined"){
                                    throw new Error("Invalid argument passed to <Tree>");
                              }
                              this.node = new TreeNode(value);
    
                              var privateopts = {
                                  isSealed:false,
								  isFrozen:false,
								  isGenerator:false
                              },
                              settings = extendObj(privateopts, this);
    
                              return (!(this instanceof Tree))? new Tree(arguments) : this;
                        }

                        Tree.prototype.attachTree = function(/* <Tree> */tree){
                              this.node.addChild(tree.node);
                        }

                        Tree.prototype.clone = function(){
                              var tree = new Tree(this.value);  
                                  tree.node = this.node; 
                                  return tree;
                        }

                        
                        
                        function Queue(){
                               // REM: a queue is a FIFO data structure
                               this.elements = new Array();
                               this.pointer = 0;

                        	var privateopts = {
                        		isSealed:false,
								isFrozen:false,
								isGenerator:false
                        	},
                        	settings = extendObj(privateopts, this);
                        	
                        	return (!(this instanceof Queue))? new Queue(arguments) : this;
                        };
                        
                        Queue.prototype.peek = function(){
                               return this.elements[0];    
                        };

                        Queue.prototype.dequeue = function(){
                               if(!this.isEmpty()){
                                    return (this.elements.shift());    
                               }else{ 
                                    throw Error("QUEUE_ERROR: Invalid Operation");
                               }
    
                        };

                        Queue.prototype.enqueue = function(element){    
                               this.elements.push(element);
                        };

                        Queue.prototype.isEmpty = function(){    
                               return (this.elements.length === 0); 
                        };

                        Queue.prototype.size = function(){
                               return (this.elements.length);    
                        };

                        Queue.prototype.empty = function(){ 
                               this.elements.length = 0;    
                               return this.isEmpty();
                        };


                        Queue.prototype.toArray = function(limit){   
                           return [].slice.call(this.elements, limit);    
                        };
                        
                        function BinaryHeap(){
						
						
                        	var privateopts = {
                        		isSealed:false,
								isFrozen:false,
								isGenerator:false
                        	},
                        	settings = extendObj(privateopts, opts);
                        
                        	return (!(this instanceof BinaryHeap))? new BinaryHeap(arguments) : this;
                        }
                        
                        function ModuleError(y) {
                            
                            this.name = 'ModuleError';
                            this.message = y;
                            this.stack = Error(y).stack;
                            this.framesToPop = 2;
                            
                            return this;
                        }
                        
                        function BackEndServiceError(o){
                            this.name = 'BackEndServiceError';
                            this.message = o;
                            this.stack = Error(o).stack;
                            this.framesTopPop = 1;
                            
                            return this;
                        }
                        
                        function Graph(){
                        	
                        }
                    
                      
                      BinaryHeap.prototype = {
                      	
                      }
					  
					  var ErrorInterface = {
					  
					      getStackTrace : function(){
						      var lines = null,
							      callStack = [],
								  currentFunction = null,
								  defaultt = [0, 'ananymous'],
								  fname = null,
								  stack = this.stack,
								  mssge = this.message,
							      isCallStackPopulated = false;
							  
							      if(stack){ // Firefox & Chrome
								     lines = stack.split('\n');
									 _transformToTrace(lines, function(line, key){
									        callStack.push(line);
									 });
									 // remove bottom trace
									 callStack.shift();
									 // set flag
									 isCallStackPopulated = true;
								  }else if(mssge){
								       if(window.opera){
									        lines = mssge.split('\n');
								             _transformToTrace(lines, function(line, key){
											      var entry = line;
                                                  if(lines[key+1]){
												      entry += ' at ' + lines[key+1];
												  }					
                                                  callStack.push(entry);												  
											 }, true);
											 // remove bottom trace
											 callStack.shift();
											 // set flag
											 isCallStackPopulated = true;
										}	 
								  }
								  
								  if(!isCallStackPopulated){ // IE & Safari
								       currentFunction = arguments.callee.caller;
									   while(currentFunction){
									       fname =  (rAllFunc.exec(currentFunction.toString()) || defaultt)[1];
										   callStack.push(fname);
										   currentFunction = currentFunction.caller;
									   }
								  }
								  
								  return callStack.join('\n\n');
						  }
					  }
                      
					  Error.prototype.getStackTrace = ErrorInterface.getStackTrace;
					  
                      ModuleError.prototype = Object.create(Error.prototype);
                      ModuleError.prototype.constructor = ModuleError;
					  
					  
                      BackEndServiceError.prototype = Object.create(Error.prototype);
                      BackEndServiceError.prototype.constructor = BackEndServiceError;
                        
                       var Service = function(mode){
                            this.mode = mode;
                            return this;
                       };
                          
                        // Static vars    
                       Service.MODERRORSRVC = 3;
                            
                       Service.BCKENDERRORSRVC = 2;    
  
                       Service.DATASTRUCTSRVC = {
                       	   Stack:-1,
                       	   LinkedList:-2,
                       	   Queue:-3,
                       	   Heap:-4,
                       	   Tree:-5
                       }
                
                       Service.provider = function(s){
                         
                            // provides error_messaging services and data structure services only
                            
                            switch(s){
                            	case -5:
                            	   return Tree;
                            	break;
                            	case -4:
                            	  return BinaryHeap;	
                            	break;
                            	case -3:
                            	  return Queue;	
                            	break;	
                            	case -2:
                            	  return LinkedList;	
                            	break;
                            	case -1:
                            	   return Stack;	
                            	break;
                            	case 0:
                            	   return null;	
                            	break;
                            	case 1:
                            	   return Graph;	
                            	break;
                            	case 2:
                            	   return BackEndServiceError;	
                            	break;	
                                case 3:
                                   return ModuleError;
                                break;
                            }
                
                       };
                               
                       return Service;
                
                }()),
               
                  // Borrowing from the CommonJS modules definition's spec...
                
                    rq,
                
                    df,
                
                    modules = {},
					
					eventsconfig = {"CACHE_EVENTS":{"onstore":{eventsSet:false,promiseReturned:false},"oncollect":{promiseReturned:false,promiseReturned:false}}}
                
                    widgets = {},
                    
                    resources = {},
                    
                    resourceSettings = {},
                
                    hasBeenBuilt = {},
                
                    requireGraph = [],
                
                    build = function(id, o){
                
                        var module, exports, factory;
                
                         if(modules[id]){
                
                                module = modules[id];
                
                                    if(modules[id].factory){
                
                                          factory = module.factory;
                
                                    }else{
                
                                           return true;
                
                                    };
            
                
                                    module.exports = factory.call(null, rq, o);
                
                                    delete module.factory;
                
                                    requireGraph.splice(requireGraph.indexOf(id), 1);
               
                
                           }else{
                
                               return false;
                
                           }
                
                    };
                
                    df = function(id, fn){
                
                               var local;
                
                               if(!(id in modules)){
                
                                   if(id.indexOf(".") > -1){
                
                                         local = Type.createNamespace(id);
                
                                   }else{
             
                                         local = {};
                
                                   }
                
                                   modules[id] = {exports:local, id:id, factory:fn};
                
                               }else{
                
                                      throw "cdvjs define error due to: '"+id+" utility definiton already exists!'";
                
                                }
                
                    };
                
                    rq = function(id, bind){
                
                               var rgx, t, expose, temp = [];
               
			                   if(id.indexOf(":") > -1){
							        temp = id.split(":");
									id = temp[0];
							   }
               
                               if(modules[id]){
                
                                     if(requireGraph.indexOf(id) === -1 || !(modules[id].factory)){
                
                                           requireGraph.push(id);
                
                                     }else{
                
                                           requireGraph.reverse();
                
                                           t = "cycle in require graph: "+requireGraph.join("->")+"->"+id;
                
                                           requireGraph.length = 0;  // maintain the reference!
                
                                           delete modules[id];
                
                                           throw t;
                
                                     }
                
                                     if(modules[id].factory){
                
                                            hasBeenBuilt[id] = true;
                
                                      };
                
                                       build(id, bind);
               
                                       if(!bind){
									   
									      if(temp.length !== 2){
               
                                                 return modules[id].exports;
												 
										  }else{
										          
												 
											  return Object.each((modules[id].exports), function(val, key, obj){
												         var self = this; 
														
														  if(self.indexOf(key) > -1){
														 
														     return function(){
															 
															      return val.apply(obj, $sl.call(arguments));
																  
															 }
															 
														  } 
														 
														 return null;
														 
											  }, (temp[1]));
										  }		 
               
                                       }
               
                                       return null;
                
                                }else{
                
                                      throw "cdvjs require error due to: '"+id+" utility module not found'";
                
                                }
                
                  };
             
                  //var svc = new Service();  TODO: erase this line
             
                  df("executionEnvironment", function(a){
                     
                         "use strict";
                     
                         var g=!!(typeof w !== 'undefined' && doc && doc[cE]);
                     
                     
                         return {
                                canUseDOM: g,
                                canUseWorkers: typeof Worker !== 'undefined',
                                canUseEventListeners: g&&!!(onload),
                                canUseViewport: g&&!!w.screen,
                                isInWorker:!g
                          };
                     
                   });
				   
				   df("stringsearcher", function(p){
				           
						"use strict";   
						
						    var U = p('utils:unique_array,multi_array'),
							
						     formatCallback = function(item, query, formatkey, splitQuery){
							     if(!!splitQuery){
								      Object.each(splitQuery, function(val, key){
									      item = item.replace(new RegExp(val+'(?!\<)','gi'), formatkey.join(val));
									  });
									  return item;
								 }else{
								     return item.replace(new RegExp('('+query+')', 'i'), function(original){
	                                                return (formatkey.join(original));
	                                 });
								 }
							 },
							 
							 getformatKey = function(format){
							     var formatMap = {
								   "italics":['<i>','</i>'],
								   "bold":['<b>','</b>'],
								   "underline":['<u>','</u>'],
								   "undefined":['',''],
								   "null":['','']
								 }
								 return formatMap[String(format)];
							 };
						   
						return  {

						    edit_distance:function(){
								 /*
									## STRING-EDIT DISTANCE ##
									Prof. Vladamir Levenshtien (implementation of Levenshtien's distance algorithm - code coming soon)
								 */	
						    },
                            					 
							complete_string_diff:function(query1, query2, editcost){
							      /*
								    ## ##
								     Prof. Myer (implentaton of Myer's diff algorithm - code coming soon)
								  */
							},
							complete_string_patch:function(query1, query2){
							
							},
							// var fg = S.complete_char_search(["apple", "banana", "oranges", "avacardo", "pineapple"], "ap", "italics"); --> ["apple", "pineapple"]
							complete_char_search:function(items, query, format){ 
	                                        var needle, chunks; 
											chunks = items.filter(function(haystack){
													      needle = (query || "").toLowerCase();
													      haystack = (haystack || "").toLowerCase();
														  var n = -1, i = 0, l;
														 
														   for(;l = needle[i++];){
																if(!~(n = haystack.indexOf(l, n+1))){
																		return false;
																}
														   }
													       return true;
											});
											return (!format)? chunks :  chunks.map(function(chunk){
											    return formatCallback(chunk, query, getformatKey(format), null);
											});
							},
							
							fuzzy_char_search:function(items, query, options, format){
							            // ##FUZZY STRING MATCHING##
										options = options || {};
										if(query && query == "*"){
										    return items;
										}
										var needles = (query || "").split(''), allMatch = !!options.allMatch, tip = (options.tip || ""), chunks;
										    // flatten the multi-dimesional array
									        chunks = ([].concat.apply([], needles.map(function(needle){
									                return items.filter(function(haystack){
											            needle = needle.toLowerCase();
													    haystack = (typeof haystack != "string" ? haystack[options.tip] : haystack.toLowerCase());
													    var l;
													    if(!~(l = haystack.indexOf(needle))){
													         return false;
													    }
													    return true;   
											        });
											})));
										    if(allMatch){
											    chunks = U.multi_array(chunks, tip); 
          									}else{
											    chunks = U.unique_array(chunks, tip);
                                            }
                                            return (!format)? chunks :  chunks.map(function(chunk){
											    return formatCallback(chunk, query, getformatKey(format), needles);
											});											
							},
	   
                            fuzzy_word_search:function(items, key){
											return function filter(query){
													var words = query.toLowerCase().split(" ");
															return items.filter(function(item){
																var normalizedTerm = (item[key] || item).toLowerCase();
																	 return words.every(function(word){
																		  return (normalizedTerm.indexOf(word) > -1);
																	 });
															});
											}
                            }

                        };
				   });
             
                   df("performance", function(r) {
                      
			                "use strict";
						 
                            var g = r("executionEnvironment");
								
                            if (g.canUseDOM){
                                 var n=Date.now?Date.now():+new Date,r=(w.performance||w.msPerformance||w.webkitPerformance),t=[],a={},i=function(e,n){for(var r=0,a=t.length,i=[];a>r;r++)t[r][e]==n&&i.push(t[r]);return i},o=function(e,n){for(var r,a=t.length;a--;)r=t[a],r.entryType!=e||void 0!==n&&r.name!=n||t.splice(a,1)};r.now||(r.now=r.webkitNow||r.mozNow||r.msNow||function(){return(Date.now?Date.now():+new Date)-n}),r.navigation||(r.navigation={type:"_request"}),r.timing||(r.timing={"loadEventEnd":0,"responseEnd":0,"fetchStart":0,"redirectStart":0,"requestStart":0,"unloadEventStart":0,"unloadEventEnd":0,"connectStart":0,"connectEnd":0,"navigationStart":0}),r.mark||(r.mark=r.webkitMark||function(e){var n={name:e,entryType:"mark",startTime:r.now(),duration:0};t.push(n),a[e]=n}),r.measure||(r.measure=r.webkitMeasure||function(e,n,r){n=a[n].startTime,r=a[r].startTime,t.push({name:e,entryType:"measure",startTime:n,duration:r-n})}),r.getEntriesByType||(r.getEntriesByType=r.webkitGetEntriesByType||function(e){return i("entryType",e)}),r.getEntriesByName||(r.getEntriesByName=r.webkitGetEntriesByName||function(e){return i("name",e)}),r.clearMarks||(r.clearMarks=r.webkitClearMarks||function(e){o("mark",e)}),r.clearMeasures||(r.clearMeasures=r.webkitClearMeasures||function(e){o("measure",e)}); return r; // eslint-disable-line
                            }else{
                                 return null;
                            }

                   });
				   
				   
				   df("emitter", function(r){
				      
					     "use strict";
						 
				      var handlers = {}, 
					  
						  reparate = function(array){
								 var obj = {};
								 Object.each(array, 
									 function(val){ 
										 this[val.name] = val.result;  
									 }, 
								 obj);
								 return obj;
						  },
						 
						  timers = {},
				 
				          queues = {},
				 
				          getDelay = function(num){
					          return Math.ceil(1 + Math.random() * num);
			              },
						  
						  normaliseScope = function(e){
						     return (e.indexOf('->', 0) > 0)? e.split('->', 2) : [];
						  };
						 
						    return {
						 
                                emit:function(evt){
								    
								    var scope, f=-1, res=[], nx, base = {}, set, data = [].slice.call(arguments, 1), ah = false;
									
									scope = normaliseScope(evt);
									
									if(scope.length){
									    evt = scope[0];
										scope[0] = String(ah);
										ah = handlers[evt];
									}else{
									    scope.push([]);
									    ah = handlers[evt];
								    }	
									
                                    if(ah){
                                        while(f < ah.length - 1){
										    f=f+1;
										    nx = ah[f]["name"];
										    if(!!scope[0][0]){
											   if(scope[1] === nx)
											        scope[0] = true;											  
											   else
                                                    continue; 	  
											}
                                            res.unshift({result:ah[f]["fn"].apply(ah[f]["cxt"], data), name:nx});
											if(res[0].result === null || typeof res[0].result === "undefined"){
											     res.shift();
											}
											if(scope[0] === true){
											    break;
											}
						                } 
                                    }else{
									   // throw new Error(); ...hold the thought
									}
			                        f=0; 
									/*  ----> USAGE:
									        var $e = $cdvjs.Application.command("emitter"); 
									        $e.on("subject:onstore", 
											       function(data){ 
												         ... 
													     this.notify(data);
												   }, 
											        {
												      notify:function(){ ... },
													  addObserver:function(){ ... }
												    }
											);
									        var ty = $e.emit("onstore", true); 
									        var details = ty.onstore["subject"];
                                                OR											
											var details = ty.onstore["0"]
											
											.....
											
											var ty = $e.emit("onstore->subject", {});
											var details = ty.onstore;
											if(details){
											    ty = details.subject;
											}
									*/
									
									base[evt] = (res.length)? reparate(res) : null;
							        return base;
                                },
                                on:function(evt, callback, context){ 
                                      var name, self = this, scope = (evt.indexOf(":") > -1)? evt.split(":", 2) : evt;
                                        if(typeof evt != "string" || typeof callback != "function"){
			                                        return;
			                            }
										evt = (typeof scope === "string")? scope  : scope[1];
			                            // initialise (where necessary)
			                            if(!Object.keyExists(handlers, evt)){ 
                                                handlers[evt] = []; 
                                        }
										
										name = (Array.isArray(scope))? scope[0] : ""+handlers[evt].length; 
			  
			                            // capture all props for handler
			                            handlers[evt].push({
										        name:name,
			                                    cxt:context,
			                                    fn:callback,
					                            timestamp:(new Date).getTime() // just for sorting purposes... 
			                            });
			  
			                            // rearrange in order of entry/insertion
			                            handlers[evt].sort(function(a, b){
			                                   a.timestamp - b.timestamp;
			                            });
			  
                                        return self; // chaining
                                },
								once:function(evt, callback, context){
								
								},
                                has:function(evt){
                                        return (!evt)? !!evt : handlers.hasOwnProperty(evt);
                                },
                                poof:function(){
                                       handlers = {};
                                },
								emitList:function(events, data, context){
								      var result = {}, scope, ev;
								      if(Array.isArray(events)){
									      for(var d=0; d < events.length; d++){
										      ev = events[d];
										      scope = (normaliseScope(ev)[0] || ev);
										      result[scope] = this.emit(ev, data, context)[scope];
										  }	 
									  }	
                                      result;									  
								},
								queue:function(event, data){ 
											var self = this, queue = queues[event], event = event;
											
											if(Array.isArray(queue)){
											    ;
											}else{
											    queue = queues[event] = [];
											}
											
											queue.push(data);
											queue.lastLength = queue.length;
											queues[event] = queue;
											return {
												emitWhenFree:function(context){
												   var _self = this, evt = event, timer = timers[evt];
												   if(Array.isArray(timer) && timer.length){
													   ;
												   }else{
												       timer = timers[evt] = [];
												   }
												   
												   //console.log('llll ----- '+evt+' hhhhh ----- '+_self+' mmmmm '+data);
												   timer[timer.length] = setTimeout(function setup(){
														var tick = false, _queue = queues[evt];
														//console.log(_queue.lastLength+'queue '+_queue+'ppppppppp '+_queue.length);
														if(Array.isArray(_queue) && _queue.length){
															if(_queue.length === _queue.lastLength){
																_self.emit(evt, context, _queue.length);
																tick = true;
															}   
														}
														setup.delay = ((setup.delay * 2) || 500);
														if(Array.isArray(timers[evt]) && timers[evt].length)
														    timers[evt][timers[evt].length] = setTimeout(setup, (tick? getDelay(setup.delay) : getDelay(setup.delay = (setup.delay/2))));
												   }, 300);
												   timers[evt] = timer;						   
												},
												flush:function(){
													self.flush();
												},
												emit:function(evt, context, num){
												    var _queue = queues[evt];
													self.emit(evt, (_queue.shift()), context);
													_queue.lastLength = _queue.length;
													if(_queue.length === 0){
													     num = _queue.length;
														delete queues[evt];
													}else{
													    queues[evt] = _queue;
														queues[evt].splice(num, 1);
													}	
														if(timers[evt][num]){
														    clearTimeout(timers[evt][num]);
															timers[evt].splice(num, 1);
															console.log('e deeeeeeeey!');
															if(timers[evt] && timers[evt].length == 0){
														         delete timers[evt];
															}else{
															     timers[evt].splice(num, 1);
															}	 
														}  
													
												}
											}
								 },
								 flush:function(){
								      /* code coming soon */
								 },
                                 off:function(evt, target){
                                   var hj = [], self = this;
                                   if(handlers[evt]){
								       if(target === null || typeof target == "undefined"){
                                            delete handlers[evt];
									   }else{
									        Array.filter(handlers[evt], function(v, k){
											      if(v && v.name === target){
												      return (!!hj.push(k)); 
												  }
											});
									        Object.each(hj, function(v){
											       this.splice(v, 1);
											}, handlers[evt]);
									   }
                                            									   
                                   }
								   return self; // chaining
                                 }
                            };
				   
				   });
				   
				   df("sessstore", function(r){

							"use strict";
							
							
							
							return {
								 store:function(){
								 
								 },
								 collect:function(){
								 
								 },
								 drop:function(){
								 
								 }
							}
	               });
             
                   df("tools", function(r){
                      
                      "use strict";
                      
                      var JSON = w.JSON || {},
					      Loc = w.location;
                      
                       return {
					   
					         is_node:function(o){
                                    return o && o[oD] && o[nT] && o[nT] > 0;
                             },
							 
                             add_event:function(evt, fn, ctx){
							       doEvent(evt, fn, ctx);
							 },
							 
							 get_origin:function(){
							      return (Loc.origin || Loc.prototcol + "//" + Loc.host);
							 },
							 
							 remove_event:function(evt, fn, ctx){
							     undoEvent(evt, fn, ctx);
							 },
							 
							 next_element : function(elem){
									 var nr = elem.parentNode, n = elem.nextSibling;
									if (n && nr.childNodes.length > 1){ 
										while (n !== null) {
											if (n.nodeType == 1) return n;
											if (n.nodeType == 3) n = n.nextSibling;
											if (n.nodeType == 9) return n.children.item(0).ownerDocument;			
										}
										return null;
									}
	                         },
							 
							 prev_element : function(elem){
									if(!this.is_node(elem)){
										  return null;
									}
									var pr = elem.parentNode, n = elem.previousSibling;
									if (n && pr.childNodes.length > 1){ 
										while (n !== null){
											if (n.nodeType == 1) return n;
											if (n.nodeType == 3) n = n.previousSibling;
											if (n.nodeType == 9) return n.children.item(0).ownerDocument;			
										}
										return null;
									}			
							 },
							 trigger_event : function(target, eType, detail, globale){
									   // the target must be a DOM node
									   if(!this.is_node(target) 
                                                                  || target !== document 
                                                                        || target !== window){
										  return false;
									   }
										var t, evt = (('CustomEvent' in globale) && !globale.document.documentMode ? new CustomEvent(eType) : globale.document.createEventObject()),
											dispatch = target[ (globale.document.documentMode || (globale.execScript && String(globale.execScript).indexOf("native") > -1)) ? "fireEvent" : "dispatchEvent" ];
							 
									   if(typeof detail === "object"){
											// set expando properties on event object
											for(t in detail){
											   if((({}).hasOwnProperty.call(detail, t))){
												   evt[t] = detail[t];
											   }
											}
									   }
									   // Actually, including support for IE6 here ;)
									   dispatch.apply(target, ((globale.document.documentMode && ((globale.execScript || {}).toString()).indexOf("native") > -1) ? ["on"+eType , evt] : [evt])); 
									   return true;
						     },
							 
							 to_html_entities:function(str) {
                                   var div = d[cE]('div'),
                                       text = d[cTN](str);
                                       div[aC](text);
                                       return div.innerHTML;	
                             },
							 
							 str_camelize : function(str, delim){
                                      var rx = new RegExp(delim+"(.)","g");
                                      return s.replace(rx, function (m, m1){
                                             return m1.toUpperCase()
                                      });
                            },
							
							get_root_url : function(){
                                  var rootUrl = d.location.protocol+'//'+(d.location.hostname||d.location.host);
                                    if (d.location.port||false) {
                                         rootUrl += ':'+document.location.port;
                                    }
                                    rootUrl += '/';
                                    return rootUrl;
                            },

                            str_decamelize :function(str, delim){
                                return str.replace(/([A-Z])/g, delim+"$1").toLowerCase();
                            },

                            clone:function(obj){ 
							        var res; 
									    if(obj){ 
									        switch(this.type(obj).substring(0, 3)){
 										         case "arr": 
												    res = $sl.call(obj); 
												 break; 
												 case "obj": 
												    res = extendObj({}, obj, true); 
												 break; 
												 case "str": 
												   res = new String(obj);  
												 break; 
												 case "num": 
												    res = new Number(obj);
		 										 break; 
												 case "fun": 
												    res = (new Function(" return ("+String(obj)+")"))(); 
												 break;
												 case "boo": 
												    res = new Boolean(obj); 
												 break; 
												 default: 
												    res = new Object(obj); 
												 break;  
											}  
									    } return res; 
							},
							eval_script:function(cod){ 
							       var evl = (w.execScript && w.execScript.bind(w) || (function(d){ return (w["eval"].call(w, cod) || new Function("return ("+cod+")")); }));  if(!/\.js$/i.test(cod)){ return evl(cod.trim()); } },
                            is_empty_obj:function(ob){ 
							        for(var t in ob){ return false; } return true;
							},           
                            is_simple_obj:function(ob){ 
							     if(!ob) return false;  
								     return (!!ob.constructor && !$h.call(ob, 'constructor') && String(ob).indexOf('Object]') == 8); 
							},
							is_doc_node:function(c){
							         return (c && (this.eval_script(c)).nodeType && (this.eval_script(c)).nodeType === d.nodeType); 
							}, 
							
                            is_window:function(g){ 
							        return (g && (g.frames || g.frameElement || g.window)!==null && w["eval"].call(w, g) === w); 
							},
							
							deflate:function(obj, x){ 
							    var i, enms, remove = function(o, xs){
								     if(Array.isArray(o)){
									    o.splice(Number(xs), 1);
									 }else{
									    delete o[xs];
									 }
								}; 
								if(this.type(obj) == "object"){ 
								    if(x && this.type=="string"){ 
									     remove(obj);  
								    }else{ 
									    enms = (obj.toString["$$enums"] || []);
									    for(i=0; i < enms.length;i++) 
										      if($h.call(obj, enms[i]))
										              remove(obj, enms[i]);  
								    } 
								}
							 },
							 
                             inflate:function(obj, obj2, deep, trans){
							       var k;
                                   if(typeof obj2 === "object"){
								        obj2.toString = function(){
										     return (Array.isArray(this)? ([]).toString() : ({}).toString());
										}
										obj2.toString["$$enums"] = Object.keys(obj2);
								   } 							 
							       k = extendObj(obj, obj2, deep, trans);
								   return k;
							 }, 
							 
                             is_node_disconnected:function(obj){
                                    return (obj && this.is_node(obj) && obj[oP] !== undefined && obj[oP] === null); 
                             },     

                             is_win_fullscreen:function (){
                                   return w.screen.height === (d[dEm].scrollHeight) && w.screen.width === (d[dEm].scrollWidth);
                             },
							 
                             get_window_center_position:function(a, b) {
                                           var c, d, e;
                                           isIE ? (c = w.screenLeft, d = "undefined" !== typeof w.screen.availWidth ? w.screen.availWidth : w.screen.width, e = "undefined" !== typeof w.screen.availHeight ? w.screen.availHeight : w.screen.height) : (c = "undefined" !== typeof w.screenX ? w.screenX : w.screenLeft, d = "undefined" !== typeof w.outerWidth ? w.outerWidth : doc.documentElement.clientWidth, e = "undefined" !== typeof w.outerHeight ? w.outerHeight : doc.documentElement.clientHeight - 22);
                                           c = parseInt(c + d / 2 - a / 2, 10);
                                           e = parseInt(0 + (e - b) / 2.5, 10);
                                           return "left=" + c + ",top=" + e;
								
                             },
                             mirror_object : function(){
							 
							 },
							 markup_to_dom :(function(){
                                    var div = doc[cE]('div');
                                    return function(html){
                                          div.innerHTML = html;
                                          var elem = div.firstChild;
                                          div.removeChild(elem);
                                          return elem;
                                    };
                             })(),
							 json_to_query:function(json, temp, prefixDone){
							           var self = this,
									    uristrings = [],
                                        prefix = '&',
                                        add = function(nextObj, i){
                                           var nextTemp = temp 
                                                ? (/\[\]$/.test(temp)) // prevent double-encoding
                                                ? temp
                                                    : temp+'['+i+']'
                                                      : i;
                                          if ((nextTemp != 'undefined') && (i != 'undefined')) {  
                                              uristrings.push(
                                                 (typeof nextObj === 'object') 
                                                    ? self.json_to_query(nextObj, nextTemp, true)
                                                       : ($s.call(nextObj) === '[object Function]')
                                                          ? encodeURIComponent(nextTemp) + '=' + encodeURIComponent(nextObj())
                                                            : encodeURIComponent(nextTemp) + '=' + encodeURIComponent(nextObj)                                                          
                                             );
                                          }
                                       }; 

                                      if (!prefixDone && temp) {
                                           prefix = (/\?/.test(temp)) ? (/\?$/.test(temp)) ? '' : '&' : '?';
                                           uristrings.push(temp);
                                           uristrings.push(self.json_to_query(json));
                                      } else if (($s.call(json) === '[object Array]') && (typeof json != 'undefined') ) {
                                          // we wont use a for-in-loop on an array (performance)
                                          for (var i = 0, len = json.length; i < len; ++i){
                                                  add(json[i], i);
                                          }
                                      } else if ((typeof json != 'undefined') && (json !== null) && (typeof json === "object")){
                                          // for anything else but a scalar, we will use for-in-loop
                                          for (var i in json){
                                                  add(json[i], i);
                                          }
                                      } else {
                                           uristrings.push(encodeURIComponent(temp) + '=' + encodeURIComponent(json));
                                      }

                                       return uristrings.join(prefix)
                                                   .replace(/^&/, '')
                                                      .replace(/%20/g, '+'); 

							 },
		                     query_to_json:function(query, asParsed){
		              	            var t=0, part = [], jstr ="{";
		              	                   query = query || "";
		              	                   if(typeof query !== "string"){
		              	    	                 return;
		              	                   }
		              	                   query = query.trim().replace(/\?|\;/,"");
		              	                   query = !!query.length? query.split("&") : part;
		              	    
		              	                   while(query.length != t){
		              	    	               part = query.shift();
		              	    	               part = part.split("=");
		              	    	               jstr += "\""+part[0]+"\":\""+unescape(part[1])+"\""+(query.length!=t? "," : "}")
		              	                   }
		              	    
		              	                   return (asParsed)? this.json_parse(jstr) : jstr ;
		                    },			 
			                import_css_file:function(cfile){
                                                var url = doc.location.href,
                                                prtc = (doc.location.protocol === "https:"),
	                                            indx = prtc ? 7 : 6,
                                                baseURL = url.substring(0 , url.indexOf('/', indx+1));
                                                if(doc.createStyleSheet) {
                                                     doc.createStyleSheet(baseURL+cfile);
                                                }else {
                                                     var styles = "@import url('"+ baseURL+cfile +"');";
                                                     var newSS=doc[cE]('link');
                                                      newSS.rel='stylesheet';
                                                      newSS.href='data:text/css,'+escape(styles);
                                                      doc[gETN]("head")[0].appendChild(newSS);
                                                }
                            },
                            add_stylesheet:function(ruleset, selector){
                                  var sheet = (function(){
                                       var style = doc[cE]('style');
                                       // Webkit hack :)
                                       style.appendChild(doc.createTextNode(""));
                                       doc[gETN] ("head")[0].appendChild(style);
                                       return style.sheet;
                                  }());
                                  if(!sheet){
                                     return;
                                  }
                                  if('insertRule' in sheet){
                                     sheet.insertRule(selector + " {" + ruleset + "} ");
                                  }else if('addRule' in sheet){   
                                     sheet.addRule(selector, ruleset);
                                  }   
                            },
                            get_class_nodes: function(selector, parent){
                                    parent = parent || doc;

                                    var elements;

						if (doc.createStyleSheet) {
                                         if (doc.styleSheets.length) { // IE requires you check against the length as it bugs out otherwise
                                                style = doc.styleSheets[0];
                                         } else {
                                                style = doc.createStyleSheet();
                                         }

                                         // split selector on comma because IE7 doesn't support comma delimited selectors
                                         var selectors = selector.split(/\s*,\s*/),
                                                indexes = [],
                                                index;
                                         for (i = 0; i < selectors.length; i++) {
                                                // create custom (random) style rule and add it to elements
                                                index = style.rules.length;
                                                indexes.push(index);
                                                style.addRule(selectors[i], 'aybabtu:pa', index);
                                         }

                                         // get all child nodes (document object has bugs with childNodes)
                                         if (parent === doc) {
                                                nodes = parent.all;
                                         } else {
                                                nodes = parent.childNodes;
                                         }

                                         elements = [];

                                         // cycle through all elements until we find the ones with our custom style rule
                                         for (i = 0, length = nodes.length; i < length; i++) {
                                                node = nodes[i];
                                                if (node.nodeType === 1 && node.currentStyle.aybabtu === 'pa') {
                                                       elements.push(node);
                                                }
                                         }

                                         // remove the custom style rules we added (go backwards through loop)
                                         for (i = indexes.length - 1; i >= 0; i--) {
                                                style.removeRule(indexes[i]);
                                         }
                                      }else{
                                            if('getElementsByClassName' in parent){
                                                elements = [].slice.call(parent.getElementsByClassName(selector));
                                            }
                                      } 
                                  return elements;      
				    },
      			    get_name_nodes:function(){
      				
      			    },
                            open_window:function(a, b, c, f){
                                 var d, e;
                                 "undefined" === typeof f && (f = "menubar=0,toolbar=0,resizable=0,width="+((c && c[0]) || '960')+",height="+((c && c[1]) || '710')+",scrollbar=0");  // '678'
                                 d = f.split("width=")[1].split(",")[0];
                                 e = f.split("height=")[1].split(",")[0];
                                 f = f + "," + this.get_window_center_position(d, e);
                                 if ((a = w.open(a, b, f)) && a.focus)
                                    return a.focus(), a;
                            },	
                            sprintf:function(h) {
                                    for (var i = [], j = 1, k = arguments.length; j < k; j++)
                                    i.push(arguments[j]);
                                    var l = 0;
                                  return h.replace(/%s|%d/g, function(m){
                                       var e = i[l++];
                                        if(m == '%d' && typeof e == "number"){
                                                   return e;
                                        }else if(m == '%s' && typeof e == "string"){
                                                   return e;
                                        }
                                        return 'e';
                                  });
                            },
							type:function(obj){
                                    var regz = /\[object\s{1}(\w+)\]/;
                                    if(obj) return $s.call(obj).match(regz)[1].toLowerCase();
                            },
							strip_tags:function(htmlstr){
							    var hold; 
								if(typeof(htmlstr) == "string")
								      hold = htmlstr.replace(/<.*?>/ig, "").replace(/<\/.*>/ig,"");
									 
							    return String(hold);
							},
                            get_head:function() {
                                 return (doc[gETN]("head") || [null])[0] || (doc[gETN]("body") || [null])[0] || doc[gETN]("script")[0].parentNode;
                            },
					html_entitify:function(h){
					     var txa = doc[cE]("textarea");
						 if(txa.insertAdjacentHTML){
						    txa.insertAdjacentHTML("afterbegin", h);
							return txa.innerHTML;
						 }
					},			
					css_matches:function(e, s){
					     if(e && e.matchesSelector){
						     return e.matchesSelector(s);
						 }else if(e.matches){
						     return e.matches(s);
						 }
					},	
                            json_stringify: function(d){ 
							    var t = !d? null : d;
							    return (typeof JSON.stringify == "function")?  JSON.stringify(t) : t + 1;
                            },  
                            json_parse: function(d){ 
							     var t = !d? "null" : d; 
							     return (typeof JSON.parse == "function")?  JSON.parse(t) : (new Function("return "+t))(); // this is always called in the context of the window 
                            },
                            get_time_string:function(type){ // If you pass "MMDDYY" you can get the full date.
                                  var today_date = new Date();
                                    var date_str;
                                     var timeMarker;
                                     var timeMinute;
                                        if (today_date.getHours() < 12) {
                                               timeMarker = "AM";
                                        }else{
                                               timeMarker = "PM";
                                        }
                                        if (today_date.getMinutes() < 10) {
                                              timeMinute = "0" + today_date.getMinutes();
                                        }else {
                                              timeMinute = today_date.getMinutes();
                                        }
                                        if (type == "MMDDYY") {
                                              date_str = ((today_date.getMonth() + 1) + "/" + today_date.getDate() + "/" + today_date.getFullYear() + " - " + today_date.getHours() + ":" + timeMinute + " " + timeMarker);
                                        }else{
                                              var mseconds = String(today_date.getMilliseconds());
                                                if(mseconds.length < 2) {
                                                    mseconds += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                                                }else if(mseconds.length < 3) {
                                                    mseconds += "&nbsp;&nbsp;";
                                                }
                                                var seconds = today_date.getSeconds().toString();
                                                if(seconds.length == 1) {
                                                       seconds = "0" + seconds;
                                                }
                                            date_str = (today_date.getHours() + ":" + timeMinute + ":" + seconds + ":" + mseconds + " " + timeMarker);
                                        }
                                        return date_str;
                            },
                            xml_parse:function(markup, isX){
                            	var xmlDOM, domParser;
									    
										xmlDOM = CreateMSXMLDocument();
									
                                        if(xmlDOM){		
										
										     xmlDOM.async=true;
                            	       	     xmlDOM.loadXML(markup);
                            	       	     if(isX){ 
											      xmlDOM.setProperty('SelectionLanguage','XPath');
										     }
											 
                            	       	}   
								
                                       if(!xmlDOM){								 
                            	       	
                            	            if(w.DOMParser){
                            	       	      
                            	       	      	    domParser = new w.DOMParser();
													try{
                            	       	      	        xmlDOM = domParser.parseFromString(markup, 'text/xml');
													}catch(ex){
													    xmlDOM = domParser.parseFromString("<parseerror><errorcode>-1</errorcode><reason>Unknown Error</reason></parseerror>", 'text/xml');
													}	
                            	       	    
                            	            } 
									   }
									   
                            	       domParser = null;
                            	       return xmlDOM;
                            	
                            },                            
                            create_xml_doc: function(rootName, nodeText){
                            	rootName = rootName || "";
                            	var rootNode, xmlDoc = null;
                                if (d.implementation && d.implementation.createDocument) {
                                      xmlDoc = d.implementation.createDocument("", rootName, null);
									  try{ // trap Document Syntax Error 
									     if(xmlDoc)
  									        xmlDoc.documentElement.innerHTML = nodeText;
									  }catch(ex){}	  
                                }
								 
								if(!xmlDoc){
									    xmlDoc = CreateMSXMLDocument();
                                        if(xmlDOM && rootName){
                                                   rootNode = xmlDoc.createElement(rootName);
												   if(nodeText){
												      rootNode.appendChild(xmlDoc.createTextNode(nodeText));
												   }
                                                   xmlDoc.appendChild(rootNode);
                                        }
								}
								
								if(nodeText){
								   ;
								}
								
                                return xmlDoc;
                            },
			                dom_to_json:function(xmlDoc, escapeSpecials){
  
                                  var result, 
								      depth = 0, 
									  Allwhitespace = /^(?:[\s]*)$/, 
									  json="", 
									  jsonstart="{ ", 
									  jsonend=" }", 
									  separator=",", 
									  atrprefix = '"$attrs":{', atrsuffix = '}', 
									  comments = [], 
									  text = [], 
									  attr=[];

                                      function TraverseByCallback(n_arr, root, callback){  // only element nodes involved!  

                                           if(n_arr.length > 0){
										       // flatten array of XMLDOM/HTMLDOM nodes if the array is not empty
                                               n_arr = [].concat.apply([], n_arr); 
                                           }
										   
                                           var children = (root.childNodes || []), 
										       u = 0, 
											   child, 
											   levl = (Number(callback.requestLevel) || 0), len;
      
                                               json+='"'+root.nodeName.toLowerCase()+'":';

                                               if(children !== null){
                                                      children = [].slice.call(children);
                                                      len = children.length;
                                                      json+=jsonstart.trim();
                                                       if(typeof callback == "function" && (callback(root.attributes) === true)){ // collect all attributes on [child] + [callback] must return literal true;
           	                                                n_arr.push(root);
                                                       }
                                                       if(len){
                                                           for(;child = children[u]; u++){
                                                                if(child && child.nodeType){ // need to make sure to avoid : object maynot be a DOM Node OR DOMException -> HierarchyRequestError (in some cases - webkit)
             	 
                                                                    if(child.nodeType === 1){ // we found an element node!! "#element"
                                                                        if(child.hasChildNodes()){ // descend only when we have children
                          	                                                 ++depth;
                          	                                                 n_arr.push(child); // collect on children 
                                                                        }
                                                                        json+=separator; // add the separator to demacate each child
                                                                        TraverseByCallback(n_arr, child, callback); // recurse again!!
                                                                    } 
                                                                    if(child.nodeType === 8){  // we found a comment node!! "#comment"
                                                                          comments.push(child.nodeValue);
                                                                    } 
                                                                    if(child.nodeType === 3){ // we found a text node!! "#text"
                                                                            if(!Allwhitespace.test(child.nodeValue)){
                                                                                 json+=separator;
                                                                                 text.push(child.nodeValue.replace(/([\t\r\n\b]+)/g, ""));
                                                                                 json+='"' + (child.nodeName.replace(/^\#/, "$")) + '":"' + (escapeSpecials? child.nodeValue.replace(/(["'&~<>])/g,"\\\$1") : child.nodeValue ) + '"';
                                                                            }
                                                                    }
                                                                    if(child.nodeType === 10){ // we found a doctype node - Not so good!! "#doctype"
                                                                            continue; // simply ignore...
                                                                    }   
                                                                }
                                                                if((u+1) === len){
	                                                                  json+=jsonend.trim();
                                                                }
                                                            }
                                                        }else{
	                                                          json+=jsonend.trim();
                                                        }
                                               }else{ 
                                                      if(root.nodeType !== 9){ // make sure it's not a document!!
                                                            n_arr.push(root);
                                                      }   
                                               }

                                            return [json, n_arr, comments, text, attr]; // base case scenario!
                                       }

                                    function readAttr(attrs){
	                                     var len = attrs.length, atr, val;
	                                         json+=atrprefix;
	                                         for(var t=0; t < len;t++){
	                                             	atr = attrs[t]; 
													val = atr.nodeValue.replace(/[\r\n\f\b\t]+/, '');
													if(val.indexOf('\\') > -1){
														if(!!val.match(/\\(?=[a-z0-9])/))
														      val = val.replace(/\\/g, '/');
													}
	                                                json+= (atr.specified)? '"' + atr.nodeName.replace(/\s+/, '') + '":"' + unescape(val) + '"' : '"null":null';
	                                                if((t+1) != len){
	                                                     json+=separator;
	                                                }
	                                                attr.push(atr);
	                                         }
	                                         json+=atrsuffix;
                                             // for IE ... we need to take away nulls due to the fact that
											 // IE7/8 always return all possible attributes... specified or not!
	                                         return true;
                                    }

                                    result = TraverseByCallback([], xmlDoc.documentElement, function(nodes){
	                                               return readAttr(nodes);
                                    });

                                    result[0] = (jsonstart+(result[0])+jsonend)

                                    return result;

                            },
                            is_obj: function(a) {
                                return null !== a && "object" === typeof a
                            },
							is_func:function(a){
							    return null !== a && "function" === typeof a
							},
                            str_replace:function(a, b, c) {
                                   return a.split(b).join(c)
                            },
                            json_escape_string:function(a){
                                  var b, c, d = [   
                                     [/\\/g, "\\\\"],
                                     [/\t/g, "\\t"],
                                     [/\n/g, "\\n"],
                                     [/\f/g, "\\f"],
                                     [/\r/g, "\\r"],
                                      [/\x08/g, "\\b"],
									  [/\"/g, '\\"'],
                                      [/\x09/g, "\\t"],
                                      [/\x0a/g, "\\n"],
                                      [/\x0c/g, "\\f"],
                                      [/\x0d/g, "\\r"]
                                      ];
                                     for (c = 0; c < d.length; c += 1)
                                           b = d[c], a = a.replace(b[0], b[1]);
                                                 
                                     return a = a.replace(/[\x00-\x07\x0b\x0e-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, function(a) {
                                                               return "\\u" + ("0000" + ( + a.charCodeAt(0)).toString(16)).slice(-4)
                                     });
                            }
                      
                      };
                   
                   });
               
                   df("utils", function(r){
                      
                       "use strict";
                  
                    return {
					
                      is_even:function(num){
                            return (!this.is_nan(parseInt(num)))? (num % 2) === 0 : false;
                      },
                      is_url:function(url, ext){
                           var match = UriRgx.exec(url);
                           return (ext && typeof ext == "string")? match && match[4] === "."+ext : match[0] === url;
                      },
                      parse_url:function(a) {
                           a = UriRgx.exec(a);
                           for (var d = {}, c = 14, b = "source protocol authority userInfo user password host port relative path directory file query anchor".split(" "); c--;)
                           d[b[c]] = a[c] || "";
                      
                           d.queryKey = {};
                           d[b[12]].replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(a, c, b) {
                                       c && (d.queryKey[c] = b)
                                       });
                           return d;
                      },
					  
                      in_array:function(arr, tgt){
                           var i;
                           for(i in arr){
                              if(tgt === arr[i]) return true;
                           }
                           return false;
                      },
					  
                      get_all_indexof : function(str, c){
                             var f = [-2]; // the start index is -2(since -2+1 should give us a good start index for 'indexOf' method!!)
                               function loadArrayWithIndex(_str, _c, _f){
                                    var dice = _f.length - 1, index = _f[dice], radix = _str.indexOf(_c, index+1);
                                        if(radix > -1){ // check to see if we found [_c]
                                            _f.push(radix); // if true,  fill up the array with the index at which [_c] was found
                                            return loadArrayWithIndex(_str, _c, _f); // recurse again...
                                       }else{
                                            return _f.splice(1,_f.length - 1); // base case scenario for recursive calls...
                                       }
                                }
                                return loadArrayWithIndex(str, c, f);	// begin recursive calls...
                      },
					  // remove multi occuring items from array 
                      unique_array:function(ar, t){
                                var a, i, j, c, m;
                                a = [];
                                o: // label 'o'
                                  for (i = 0; i < ar.length; ++i) {
                                        for (j = 0; j < a.length; ++j){
										     c = !!t? a[j][t] : a[j];
											 m = !!t? ar[i][t] : ar[i];
										     if (c == m) continue o
										}	 
                                        a.push(ar[i]);
                                  }
                                return a;
                      },
					  // remove single ocurring items from array
					  multi_array: function(ar,  t){
					            var a, b, n, k, v, x;
								a = [];
								b = [];
								for(var k=0;k < ar.length; k++){
								     for(n = 0;n < a.length; n++){
									       v = !!t? a[n][t] : a[n];
										   x = !!t? ar[k][t] : ar[k];
									       if(v == x){
									            b.push(a[n]);
									       }
									 }
                                     a.push(ar[k]);									 
								}
							return b;	
					  },
					  
                      reverse_string:function(initstr){
                                var rev = "";
                                if(this.type(initstr) === 'string'){
                                      for(var s = (initstr.length - 1); s >= 0; s--){
                                           rev += initstr[s];
                                      }
                                     return rev;
                                 }
                                 return rev;
                      },
					  
                      type:function(obj){
                             var regz = /\[object\s{1}(\w+)\]/;
                             if(obj) return $s.call(obj).match(regz)[1].toLowerCase();
                      },
					  
                      splitify:function (list, delim, len, pair){
                             //if(delim && delim.length > 1) throw new Error("splitify: argument 2 must be of type char");
                             delim = String(delim);
                      
                             list = list+(delim || '');
                             len = len || list.length;
                             var  findex = list.indexOf(delim),
                             lindex = list.lastIndexOf(delim),
                             ints,
                             start = 0,
                             sublen,
                             substrs  = null,
                             hlist = [];
                      
                             switch(delim){
                                case "null":
                                case "":
                                for(;;){
                                     if(pair !== undef){
                                           hlist.push(list.substring(w.Math.min(len, start), (start+=pair))); // split only using {pair}
                                     }else{
                                           //hlist.push(list.charAt(start++)); // split characters
                                           hlist = list.split("");
                                     }
                      
                                     if(start == len)
                                           break;
                                     }
                                     break;
                      
                                     default:
                                         while(findex < lindex){
                                              substrs = list.substring(start, findex);
                                              ints = hlist.push(substrs);
                                              start = findex + 1;
                                              findex = list.indexOf(delim, start);
                                              if(ints == (len - 1)) break;
                                         }
                                         hlist.push(list.substring(start, findex));
                                         break;
                             }
                      
                            return hlist;
                      },
					  
                      handle_query:function(aspect,url){
                               // variable hoisting
                               url = url || doc.location.search;
                      
                               if(typeof(aspect) == "string"){
                                          url = url.replace(/^\?/,"");
                                          var q = url.split("&");
                                             for(var k=0; k < q.length; k++){
                                                   if(q[k].indexOf(aspect) != -1)
                                                         return w.decodeURIComponent(q[k].substring(q[k].indexOf("=")+1));
                                             }
                               }
                      
                               return null;
                      },
					  
                      add_hex:function(c1, c2, len){
                              var hexStr;
                              len = len || 0;
                              if(typeof c2 == "string")
                                     hexStr = (parseInt(c1, 16) + parseInt(c2, 16)).toString(16);
                              else
                                     hexStr = (parseInt(c1, 16)+ 0x01).toString(16);
                      
                               while (hexStr.length < len) { 
							       hexStr = '0' + hexStr; // Zero padding.
							   } 
                                          return hexStr;
                      },
					  
                      from_hex:function(hex, base){
                                if(!/^([0-9a-fA-F]+)$/.test(hex)) return 0;
                                    return (0x000000 | parseInt(hex , (base || 16)));
                      },
					  
                      from_rgba:function(rgbcolor, opac){
                              if(rgbcolor.indexOf('#') == 0) return rgbcolor;
                              var rgx = /^rgba?\(((?:[\d]{1,3}(\,)?)+)(\d*\.\d+)?\)$/,
                              match = (rgbcolor.match(rgx)[1]).split(','),
                              rgb = '#' + 
                                  this.from_decimal(match[0], 16) +
                                  this.from_decimal(match[1], 16) +
                                  this.from_decimal(match[2], 16) +
                                  '';
                      
                              return rgb;
                     },
					 
                     sub_hex:function(c1, c2, len){
                                var hexStr;
                                len = len || 0;
                                if(typeof c2 == "string")
                                       hexStr = (parseInt(c1, 16) - parseInt(c2, 16)).toString(16);
                                else
                                       hexStr = (parseInt(c1, 16)+ 0x01).toString(16);
                      
                                 while (hexStr.length < len) { hexStr = '0' + hexStr; } // Zero padding.
                                        return hexStr;
                     },
					 
                     to_hex:function(bi, limit){
                                return b.Math.max(0, b.Math.min(b.parseInt(bi, 16), (limit || 255)));
                     },
					 
                     to_rgba:function(hexcolor, opac){
                      
                                  var regex = /^\#([a-fA-F0-9]+)$/,
                                  match = hexcolor.match(regex),
                                  rgba = "";
                      
                                  if(type(match) != "array") return;
                      
                                        match = this.splitify(match[1], "", null, 2);
                      
                                       rgba = ((opac)? "rgba(" : "rgb(") + 
                                                this.to_hex(match[0]) + "," + 
                                                this.to_hex(match[1]) + "," + 
                                                this.to_hex(match[2]) + ((opac)? ","+opac : '') + ")";
                      
                                 return rgba; 
                     },
                     
					 to_binary:function(basenum){
                            if(typeof(basenum) == 'number'){
                                 var remainder = [], i = 0, quot = basenum;
                                
								 do{
                                   remainder[i] = Math.floor(quot % 2);
                                   quot = quot / 2;
                                   i++;
                                 }while(quot >= 1);
                                       
							     return remainder.reverse().join('');
                            }
                      },
					  
                      create_32binary_string:function(nMask) {
                               for (var nFlag = 0, nShifted = nMask, sMask = ""; nFlag < 32; nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
                               return sMask;
                      },
					  
                      add_bin:function(/* Varargs */){
                                 var t = sum = 0, vlp=[];
                                 for(; t < arguments.length; t++){ 
                                        vlp[t] = parseInt(arguments[t], 2);
                                        sum += vlp[t];
                                 }
                                 return parseInt(this.to_binary(sum), 2);
                      },
					  
                      low_decipher:function(hashtext){
                                   var keylength = hashtext.length,
                                   plaintext = '', index = '', point = '', b = 1;
                      
                                   for(; b < hashtext.length;b++){
                                            if(this.is_even(b)){
                                                  index = pkey.indexOf(hashtext.charAt(b));
                                                  point = (index > -1)? index + 3 : -1;
                                                  plaintext += (!!pkey.charAt(point)) ? pkey.charAt(point) : pkey.charAt(pkey.length-1) ;
                                            }
                                    }
                                    return plaintext;
                      },
					  
                      low_encipher:function(plaintext){
                                      var plaintext = plaintext || null;
                                      if(!plaintext) return;
                                      var textlength = plaintext.length, pset = (textlength+1),
                                      charArray = (this.get_random(true, pset)).split(''),
                                      validkey = this.reverse_string(pkey), hashstr = '', index = '',
                                      u = 0, point = '', AP = function(n){ -1 + (((++n) - 1) * 2) };
                      
                                      for(;u < pset; u++){
                                            index = validkey.indexOf(plaintext.charAt(u));
                                            if(!(this.is_even(Math.abs(AP(u)))) && !!charArray.length)
                                            hashstr +=  charArray.shift();
                      
                                         if(u < textlength && index){
                                            point = (index > -1)? index + 3 : -1;
                                            hashstr +=  (!!validkey.charAt(point)) ? validkey.charAt(point) : validkey.charAt(3);
                                         }
                                      }
                                      return hashstr;
                      },
					  
                      encodify:function(input, asHex){
                      var hex="",r=0,l = (typeof input == "string") && input.length;
                      while(r < l){
                      
                      // if(/[\/\\@\#]/.test(input.charAt(r))){ ; }
                       
                      hex+= (asHex?'\\x':'\\u') + input[r].charCodeAt(0).toString(16).toUpperCase();
                      r++;
                      }
                      hex = (this.is_url(input))? unescape(hex).replace('\\x','%').replace("%20", "+") : hex;
                      return hex;
                      },
                      camelize:function(str, delim){
                           var rx = new RegExp(delim+"(.)","g");
                           return str.replace(rx, function (m, m1){
                                       return m1.toUpperCase();
                            });
                      },
                      decamelize:function(str, delim){
                          return str.replace(/([A-Z])/g, delim+"$1").toLowerCase();
                      },
                      base64_encode : w.btoa || function(encode, asImage){
								  var input = encode;
								  var base64 = "";
								  var hex = "";
								  var chr1, chr2, chr3 = "";
								  var enc1, enc2, enc3, enc4 = "";
								  var i = 0;
								  var src = "data:image;base64,";
								  
								  do {
								  chr1 = input.charCodeAt(i++);
								  chr2 = input.charCodeAt(i++);
								  chr3 = input.charCodeAt(i++);
								  
								  enc1 = chr1 >> 2;
								  enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
								  enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
								  enc4 = chr3 & 63;
								  
								  if (this.is_nan(chr2)) {
								  enc3 = enc4 = 64;
								  } else if (this.is_nan(chr3)) {
								  enc4 = 64;
								  }
								  
								  base64  = base64  +
								  b64array.charAt(enc1) +
								  b64array.charAt(enc2) +
								  b64array.charAt(enc3) +
								  b64array.charAt(enc4);
								  chr1 = chr2 = chr3 = "";
								  enc1 = enc2 = enc3 = enc4 = "";
								  } while (i < input.length);
								  
								  return (asImage)? (src + base64) : base64;
                      },
                      get_uniq_key:function(plaintext){
                                   var i =0, len = plaintext.length, revtext = this.reverse_string(plaintext), charCodes = [],
                                   tchars = [], valtext ="", randSet;
                                   for(; i < len; i++){
                                         charCodes.push(revtext.charCodeAt(i));
                                         tchars.push(b.String.fromCharCode(parseInt(('0x'+charCodes[i]), 16) & parseInt('0000FF', 16)));
                                    }
                      
                                    randSet = this.get_random(true, 10);
                                    for(i=0; i < tchars.length; i++){
                                            valtext+=randSet.charAt(i)+tchars.shift();
                                    }
                                    return valtext;
                      },
					  
                      pluck:function(){
                                   return 12354;
                      },
					  
                      to_ymd:function(date, delim){
                                if(date && date instanceof Date){
                                var y = date.getYear()+1900,
                                m = date.getMonth()+1,
                                d = date.getDay();
                                if(!delim || typeof delim == "undefined")
                                       delim = "/";
                                       return (y + delim + (m < 10? "0"+m:m) + delim + (d < 10? "0"+d:d));
                                }
                                return y+delim+m+delim+d;
                      },
					  
                      from_decimal:function(dec, base){
					         var stack = [],
                                    digits = avf.toUpperCase(),
                                    mod , result = "";
                            if(!this.is_nan(parseInt(dec))){
                                    
                                if(base && typeof base == "number"){
                                    if(base > digits.length){
                                            throw new Error("base too high");
                                    }
                                   
								   while(dec != 0){
                                            mod = dec % base;
                                            dec = dec % base;
                                            stack.push(mod);
                                   }
                        
						           while(stack.length != 0){
                                            result += digits[stack.pop()]; // easy mapping
                                   }
                         
                                }
                                return result;
                            }
							 return result;
                         },
						 
                         is_nan:function(x){
                                 return (x && typeof x !== "undefined")?  x !== x : true;
                         },
						 
                         base64_decode: w.atob || function(decode){
                         var input = decode;
                         var output = "";
                         var hex = "";
                         var chr1, chr2, chr3 = "";
                         var enc1, enc2, enc3, enc4 = "";
                         var i = 0;
                         
                         do {
                         enc1 = b64array.indexOf(input.charAt(i++));
                         enc2 = b64array.indexOf(input.charAt(i++));
                         enc3 = b64array.indexOf(input.charAt(i++));
                         enc4 = b64array.indexOf(input.charAt(i++));
                         
                         chr1 = (enc1 << 2) | (enc2 >> 4);
                         chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                         chr3 = ((enc3 & 3) << 6) | enc4;
                         
                         output = output + w.String.fromCharCode(chr1);
                         
                         if (enc3 != 64) {
                         output = output + w.String.fromCharCode(chr2);
                         }
                         if (enc4 != 64) {
                         output = output + w.String.fromCharCode(chr3);
                         }
                         
                         chr1 = chr2 = chr3 = "";
                         enc1 = enc2 = enc3 = enc4 = "";
                         
                         } while (i < input.length);
                         return output;
                         },	
                         get_random:function(useText, len, range){
                                      if(typeof(useText) != "boolean") return null;
                         
                                       range = range || 10;
                                       range = (range > 10)? 10 : range;
                                       len   = (len > 10)? 10 : len; // TODO: repetition is introduced for length greater than "10" so deal with this
                                       var rand = function(num) { return (num) ? (w.Math.ceil(w.Math.random() * range) + num) : w.Math.round(w.Math.random() * range); },
                                       uni = function(){  return w.String.fromCharCode((rand(65) + rand(91)) / 2); },
                                       randList = [rand()],
                                       num = 0,x;
                         
                                       jump:
                                             for(x = 1; randList.length < len; x++){    
                                                     num = b.Math.floor(b.Math.random() * range);
                                                     if(this.in_array(randList, num))
                                                                continue jump;
                                                     else
                                                              randList.push(num);              
                                             }
                         
                                             if(useText){
                                                   var list = randList.map(function(n){ return n.toString(); });
                                                    for(var t=0; t < list.length; t++)
                                                          if(this.is_even(t)) list.splice(t, 1, uni()); 
                         
                                                        return list.reverse().join('');
                                              }   
                         
                                          return (randList.reverse().join('')).substring(0, len);
                         },
                         get_utc_date_string: function(a) {
                                       var d = new Date;
                                       a && d.setTime(d.getTime() + 36E5 * a);
                                       a = "" + d.getUTCFullYear();
                                       var b = d.getUTCMonth(), b = 10 <= b ? b: "0" + b, d = d.getUTCDate();
                                       return [a, b, 10 <= d ? d: "0" + d].join("")
                         },
						 
                         normalize_url: function(a) {
                                    return a.toLowerCase()
                         },
                         insert_crumb_trails : function(elem, color, delimeter, url) {
                                    var URL = url || doc.location.href,
                                     match = regex.exec(URL),
                                     div = elem, // must be a DOM Node 
                                     indent = '2%',
                                     disabled = 'onclick="return false;"';
                                     aPref = '<a href="',
                                     aBefore = '" style="">',
                                     aAfter = '</a>',
                                     protocol = match[1], // {http} OR {https} OR {ftp} and in some cases {file}
                                     host = match[2], // {localhost} OR {www.example.com} OR {example.com}
                                     subUrl = (host == "localhost") ? match[3] + '/' : '', // {any sub folder that follows after the host address}
                                     originUrl = protocol + '://' + host + '/' + ((subUrl != '') ? '' : match[3] + '/'),
                                     components = match[match.length - 1].split('/'),
                                     lindex = components.length - 1,
                                     file = components[lindex],
                                     filing = file + aBefore.replace(/""(?=\>)/, '"color:'+color+'"');
                                     txt = 'You are here:&nbsp;&nbsp;&nbsp;' + aPref + originUrl + ((components.length == 1)? subUrl + filing : subUrl + aBefore) + 'home' + aAfter;
                      
                                     components = (/(\.aspx?|\.html?|\.php|\.jsp(#[\w]+)?)$/.test(components[lindex])) ? components.slice(0, lindex) : components; // get rid of the file part of the url - NOW!!
                      
                               for(var i = 0; i < components.length; i++) {
                                      if (components[i].length > 0){
                                            if(match[0] == URL){ // check if we have a equality for initial match...
                                                 subUrl = subUrl + components[i]	 + '/';
                                                 txt = txt + '&nbsp; ' + delimeter + ' &nbsp;'  + aPref +
                                                 originUrl + ((i != components.length - 1)? subUrl + aBefore : subUrl + filing) +
                                                 components[i].replace(/[-_]/g, ' ').toLowerCase() + aAfter;
                                            }
                                       }
                                }
                                    txt = (txt.lastIndexOf(delimeter) > -1) ? this.reverse_string(this.reverse_tring(txt).replace(this.reverse_string(aPref), this.reverse_string('<a '+disabled+' href="'))) : txt.replace(aPref,'<a '+disabled+' href="');
                                    div.innerHTML = '<span style="display:inline-block;width:100%;font-size:xx-small;height:auto !important;text-indent:'+((indent)? (indent+'px') : '0px')+';line-height:1.1;vertical-align:middle;">' + txt + '</span>';
                          },
                          high_encipher:function(a, b) { // args: high_encipher(plaintext, cryptkey);
                               var c, d, e, f, g, l;
                               a = "cdv" + a;
                               b = b || "";
                               g = [];
                              for (c = 0; 256 > c; c += 1)
                                    g[c] = c;
                                    for (c = d = 0; 256 > c; c += 1)
                                        d = (d + g[c] + a.charCodeAt(c%a.length))%256, e = g[c], g[c] = g[d], g[d] = e;
                                  d = c = 0;
                                  l = "";
                                  for (f = 0; f < b.length; f += 1)
                                        c = (c + 1)%256, d = (d + g[c])%256, e = g[c], g[c] = g[d], g[d] = e, l += w.String.fromCharCode(b.charCodeAt(f)^g[(g[c] + g[d])%256]);
                                   e = [];
                                 for (c = 0; 256 > c; c += 1)
                                       e[c] = avf.charAt(c>>4) + avf.charAt(c & 15);
                                 d = [];
                                 for (c = 0; c < l.length; c += 1)
                                       d[c] = e[l.charCodeAt(c)];
                                         return d.join("")
                          }
                
                      }
                  
                  });
               
                  df("cookiestore", function(r){
                       
					   var _hasCookie = navigator.cookieEnabled;
					   
                       return {
                       	  set_cookie:function (name, value, expires, secure, widenDomain) {
                                       // the [expire] parameter should reflect the number of days for the cookie to be set
                                       if(!!expires) {
                                            var exp, date = new Date(), domain;
                                            if(typeof (expires) == 'number'){
											      date.setTime(date.getTime() - (1000 * 24 * 60 * 60 * expires))
												  exp = date.toGMTString();
                                            }
                                        } 
										
										domain = (widenDomain? doc.domain.replace(/^[a-z]+/, '') : doc.domain);
										
                                        if((secure)){
                                               doc.cookie = name + "=" + escape(value) + (exp ? "; expires=" + exp + ";": ";") + " path=/; domain=" + domain + "; secure=" + secure;
                                               return true;
                                        }else{
                                               doc.cookie = name + "=" + escape(value) + (exp ? "; expires=" + exp + ";": ";") + "; path=/; domain=" + domain;
                                               return true;
                                        }
				                      return false; 
                          },
                       	  get_cookie:function (ckname) {
                                    var c, val = ckname + "=",
                                    result = doc.cookie.split(';');
                                    for (var i = 0; i < result.length; i++) {
                                           c = result[i];
                                           while (c.charAt(0) == ' ')
                                               c = c.substring(1, c.length);
                                               if(c.indexOf(val) == 0)
                                                     return unescape(c.substring(val.length, c.length));
                                    }
                                    return false;
                          },
                       	  set_static_cookie:function (name, value) {
						           var isHttps = (location.protocol.indexOf('https') > -1);
                                   //set this cookie for 15 years from now
                                   var exp = 365 * 15;
                                   this.set_cookie(name, value, exp, isHttps);
                          },
                       	  unset_cookie:function(name, widenDomain){
						        var isHttps = (location.protocol.indexOf('https') > -1);
                                if(!!doc.cookie) {
                                     var fx = (!!this.get_cookie(name));
                                     if(fx){
                                         this.set_cookie(name, "", -1, isHttps, widenDomain);
						                 return true;
                                     }
					                 return false;
                                }  
				                return false; 
				
                          }
                       };	
                  });
				  
				  df("encryptx", function(r){
				      
					    return {
						
						};
				  });
				  
                  df("cachestore", function(r){
 
                      "use strict";
 
                      /* @TODO: this cache store cannot recieve store value types of "Function"  & "RegExp" for now... need to fill this in later... */
				      var $tl = r("tools"),
					      $e = r("emitter"),
					      ph = "push",
					      keysmapid = "CDV349i2698496638210",
					      _isLocal = $UAtests("localstorage"),
						  _keys = {},
						  lStorage = {},
						  _cached = {},
					      $ck = !(_isLocal) && r("cookiestore"); 
						  
					   
					    if(_isLocal){
						      
							  lStorage.pushItem = (function(key, value) {
							        this.setItem(key, value);
						      }).bind(localStorage);
						
                              lStorage.getObject = (function(key) {
							        var dx = $tl && $tl.json_parse(this.getItem(key));
									return dx;
                              }).bind(localStorage);
							  
							  lStorage.removeItem = (function(key) {
							        return this.removeItem(key);
                              }).bind(localStorage);
							  
							  lStorage.setObject = (function(key, value) {
                                    this.pushItem(key, $tl && $tl.json_stringify(value));
                              });			  
							  
                        }
						
					 var exists = function(key) {
                          return $h.call(_keys, key);
                     };	
					 
					 var _retrieveKeys = function(){
					         var t;				     
							 if(_isLocal){
							     _keys = lStorage.getObject(keysmapid);
							 }else{
							     _keys = $tl.json_parse($ck && $ck.get_cookie(keysmapid));
							 }
							 
							 if(!_keys){
							    _keys = {};
								_cached = {};
							 }
							 
						     for(t in _keys){
							     if(exists(t)){
							         _cached[t] = true;
								 }	
							 }	 
					  };
						
					  _retrieveKeys();  

                      var _serialize = function(opts) {
                         if ($s.call(opts) === "[object Object]") {
                              return (opts);
                         }else{
                              return $s.call(opts);
                         }
                      };
					  
					  var _storeKeys = function(key){
					       if(_isLocal){
						       lStorage.removeItem(keysmapid);
						       lStorage.setObject(keysmapid, _keys);
						   }else{
						       if($ck){
							       $ck.unset_cookie(keysmapid);
							       $ck.set_static_cookie(keysmapid, $tl.json_stringify(_keys));
							   }
						   }
					       
						   if(key)
						      _cached[key] = true;
					  };
					  
                      var _remove = function(key) {
                         var bind, set;
                          if(exists(key)){
                                bind = _keys[key];
							   
                                if(_isLocal){
                                      lStorage.removeItem(bind);
								}else{
                                      $ck && $ck.unset_cookie(bind);
                                }
								
								delete _cached[key];
							    delete _keys[key];
							   
							    _storeKeys(null);
                          }
                      };
					  
                      var _removeAll = function() {
                               _cached = {};		 
                                  for(var t in _keys){
								      if(exists(t)){
								            if(_isLocal){
							                      lStorage.removeItem(_keys[t]);
							                }else{
                                                  $ck && $ck.unset_cookie(_keys[t]);
									        }
                                      } 									 
                                  }; 
                               _keys = {};
							   _storeKeys(null);
                     };
					 
					 var _handleError =  function(ex, def){
					     if(ex instanceof Error){
						      if(eventsconfig["CACHE_EVENTS"].promiseReturned){
							      def.reject(ex);
							  }else{
							      def = null;
							      throw ex;
							  }
						 }
					 };
					 
                     var put = function(key, obj){
					        var _ex, _rt, _deffr = new Futures(), _keybind, _sp = typeof(key), method = "", _tp = typeof(obj);
							
                            if(_sp !== "string"){
							    _handleError(new Error("CACHE_ERROR:: - cache key is not a string"), _deffr);
								return;
							}
							
							if (!exists(key)){
							        _keybind = (($tl.get_time_string())+"|"+_tp+"|"+(String(Array.isArray(obj))));
                                    _keys[key] = _keybind;
                            }else{
							    _handleError(new Error("CACHE_ERROR:: - cache key override not allowed"), _deffr);
								return;
							}
							
							if(_tp === "object"){
                                _ex = $tl.inflate((Array.isArray(obj)? [] : {}), obj, true, function(item){ 
								            if(typeof item === "function"){ 
											     return String(item); 
											} 
											return item; 
									  });
								
								if(!$ck)
								    method = "setObject";	  
                            }else{
							    _ex = String(obj);
								if(!$ck)
								   method = "pushItem";
							}
							
						  _rt = $e.emit("onstore", _ex);
						  
						  if(_rt && _rt.onstore){
						      _ex = _rt.onstore["0"] || _rt.onstore.result;
						  }
						  
                          if(_isLocal){  
                                try {
                                    lStorage[method](_keybind, _ex);  
                                }catch (ex) { 
                                     if(ex.name === 'QUOTA_EXCEEDED_ERR' || ex.message.indexOf(" ") > -1){
                                                 _handleError(new Error("CACHE_ERROR:: - maximum cache limit exceeded"), _deffr);
                                                 return;
                                     }
                                     _handleError(new Error("CACHE_ERROR:: - cache value not a string"), _deffr);
                                }
                           }else{
						        try{
                                    $ck && $ck.set_static_cookie(_keybind, _ex, false);
							    }catch(ex){
								
								}	 
                           }
						   
						   _storeKeys(key);
						   _deffr.resolve([key, obj]);
                           return key;
                    };
    
                    var purge = function() {
                           if (arguments.length > 0){
                                _remove(arguments[0]);
                           }else {
                                _removeAll();
                           }
                          return Object.getKeyCount(_cached);
                    };
					
					var purgeOut = function(){
					      if(_isLocal){
						       localStorage.clear();
						  }
					};
    
                    var searchKeys = function(str) {
                         var t, 
						     keys = [],
                             rStr = new RegExp('\\b' + str + '\\b', 'i');
							 
                             for(t in _keys){
							    if(exists(t)){
                                    if(t.match(rStr)){
                                         keys[ph](t);
                                    }
								}	
                             };
                            return keys;
                     };
					
                     var get = function(key){
					      
                           var val, x, fc, _ex,  _tp, _sp = typeof(key);
                          
						    if(_sp === "string"){
							    if(exists(key)){
						             x = _keys[key];
								}else{
								    return null;
								}
                            }else{
							     throw "CACHE_ERROR:: - cache key is not a string";
								 return;
							}
            
			                fc = (x.split("|"));
							
							_tp = fc[1];
							
							if(_isLocal)
							    _ex = (_tp === "object")? lStorage.getObject(x) : localStorage.getItem(x); 
							   
							if(_tp === "object"){ 
							        val = $tl.inflate((fc[2]==="true"? [] : {}), _ex, true, function(item){
								            if(typeof item === "string"){
											     return generateFunction(item);
											}
								            return item; 
						            });
							}else{
							     if(!_ex)
							        _ex = $tl.json_parse($ck && $ck.get_cookie(x));	

                                 val = _ex;									
							}
							
                            return val;
                     };
					 
                     var getKey = function(opts){
                          return _serialize(opts);
                     };
    
	                 var getAllKeys = function() {					
						  return Object.keys(_keys);
                     };						
					  
                      return {
                            store: put,
                            has_key: exists,
                            drop: purge,
							flush: purgeOut,
                            related_keys: searchKeys,
                            collect: get,
                            get_key: getKey,
                            get_keys: getAllKeys
                     };
				  
	        });
                 
            
			
			df("browser", function(r, o){
				  
				    "use strict";
                   
                     var local={name:"",ver:0};
                           /*_t = r("tools"),
                           _uas = nav.userAgent.toLowerCase(),
                           isTrident = () && !!(local.engine = "Trident"),
                           isSafWebkit = () && !!(local.engine = "Webkit"),
                           isChrWebkit = () && !!(local.engine = "Webkit"),
                           isGecko = () && !!(local.engine = "Gecko"),
                           isOpera = () && !!(local.engine = "Presto"),
                           isKHTML = () && !!(local.engine = "Webkit")
                     
                     
                     
                      function classifyBody(e){
                            var b = doc[gETN]("body")[0];
                            if(isTrident){
                     
                            }else if(isGecko){
                     
                            }else if(isChrWebkit){
                     
                            }
                       }
                     
                       _t.add_event("load", classifyBody); */
                  
                       return local;
                     
                  });
             
               
             
                  df("channel", function(r){
                     
                     var interval_id = null,
                     
                     cache_burst = 1,
                     
                     last_hash = null,
                     
					 $tl = r("tools:trigger_event");
                     
                
                    return {
					 
                        recieve_message:function(callb, source_url){
					        
							var attached_callback = null;
						   
						    if(callb && typeof callb === 'function' && !attached_callback){
                                
								attached_callback = function(e){
								     if(!source_url || (e.source === w)){
									     // return 0;
									 }
									 
                                     if((typeof source_url === 'string' && e.origin !== source_url)
                                      || ($s.call(source_url) === "[object Function]" && source_url(e.origin))){
									        console && console.log("+++++++++++++++++++++++++ okay poi! "+source_url+" +++ "+e.origin);
									    	// return 0;
                                     }
									 
									if(!('data' in e)){
									    // dealing with IE6/7
									    e.data = this.name;
									} 
									
									if(e.data !== "[null]") // Our 'setImmediate' test code above should be subdued!  
                                        callb.call(e.source, e.data, e.origin);
                                };
                          }
						  
                          if(haspost){
                             
								if(w[aEL]){
									w[callb ? aEL : rEL]('message', attached_callback, !1);
								}else{
									w[callb ? aE : dE]('onmessage', attached_callback);
								}
                     
                         }else{
						     
							 // especially for IE 6, 7
							 if(w[aE]){
							     w[aE]('onwindowmessage', attached_callback);
							 }
						 }
                     },
                     post_message:function(msg, target_url, target){
                            if(!target_url){
                                return;
                            }
                     
                            target = target || w;
							
                            if(haspost){
                                    target[pM](String(msg), target_url.replace(/([^:]+:\/\/\/?[^\/]+).*/, '$1'));
                            }else if(target_url){
                                    //
									setTimeout(function(){
									   if(target.parent)
							                ;//target.parent.name = target.name;
									   try{
									      target.name = ('name' in target.top) ? String(msg) : '';
								          $tl.trigger_event(target, 'windowmessage', {source:target, origin:target.location.toString().slice(0, -1), piece:temp}, target);
									   }catch(e){
									       if(e.message.toLowerCase().indexOf('permission denied') > 0){
									          ; // error due to - iframe/sub-frame window came from another domain
											    // make use of hashing - onhashchange event
										   } 
										   /** MORE CODE HERE */
									   }	  
									},1);	
                            }
                        }
                    }
                 });
             
             
                 df("hashchange", function(r){
                     
                      var local = {},
                      ahc = "add_hash_change",
                      rhc = "remove_hash_change";
                      if("onhashchange" in w){
                      if(w[aEL]){
                         local[ahc] = function(fn, before){
				          w[aEL]('hashchange', fn, before);
                      };
                          local[rhc] = function(fn){
				          w[rEL]('hashchange', fn);
                      };
                      return local;
                      }else if(w[aE]){
                      var hc = doc[dM] && doc[dM] === 8 ? 'onhashChange' : 'onhashchange';
                      local[ahc] = function(fn, before){
					     if(w[hc]){
				            w[aE](hc, fn);
						 }else{
						    fn.$$tag = true;
						    w[hc] = fn;
						 }	
                      };
                      local[rhc] = function(fn){
					     if(w[hc].$$tag){
						    w[hc].$$tag = null;
							w[hc] = null;
						 }else{
				            w[dE](hc, fn);
						 }	
                      };
                      return local;
                      }
                      }
                      var interval,
                      hashChangeFuncs = [],
                      oldHref = location.href;
                      local[ahc] = function(fn, before){
                          if(typeof(fn) == "function"){
                               hashChangeFuncs[before?'unshift':'push'](fn);
                          }
                      };
                          local[rhc] = function(fn){
                          for(var i = hashChangeFuncs.length-1;i>=0;i--){
                              if(hashChangeFuncs[i] === fn){
                                    hashChangeFuncs.splice(i, 1);
                              }
                          }
                      }
                      interval = setInterval(function(){
                                             var newHref = document.URL;
                                             if(oldHref !== newHref){
                                                       w["setTimeout"](function(){
                                                                 var _oldHref = oldHref;
                                                                 oldHref = newHref;
                                                                 for(var i=0; i<hashChangeFuncs[i].length;i++){
                                                                               hashChangeFuncs[i].call(win, {
                                                                                         type:"hashchange",
                                                                                         newURL:newHref,
                                                                                         oldURL:_oldHref
                                                                                });
                                                                 }
                                                                 
                                                        }, 0);
                                             }
                      }, 50);
                      
                      return local;
                
                   });
               
                   //(rq("browser"));
                   
                   
             var Glob = {},

                 AccessControl = function(owner, bindSettings, core){
             	
             	   var _owner = owner,
             	       core = core, // variable hoisting...
             	       checkMask = function(mask){
             	       	    if(!mask || typeof mask != "string"){
             	   	           return {"main":""};	
             	   	     }
             	   	
             	   	     if(mask.indexOf(":")){
             	   	            mask = mask.split(":");	
             	   	      }
             	  
             	   	     return Array.isArray(mask) && mask.length>1? {"main":mask[0],"sub":mask[1]} : {"main":String(mask)}; 
             	       },
             	       settings;
             	       
             	   this.bindSettings = bindSettings;
             	   
             	   this.getResource = function(name){
             	   	     if(!name || typeof name == "undefined"){
                            name =  "";
                       }
                       console.log("inside getResource fetching... >"+name);
                       console.log("reading main target... >"+resources[name]);
             	        settings = this.bindSettings? resourceSettings[name] : {};
                      //console.log("setting is : "+settings["mustRequest"]);
             	        if(name in resources && $h.call(resources, name)){
             	             if(settings.globale){
                                console.log("globale is true!");
             	             	 if(settings.globale === true || settings.globale[_owner]){
             	                       if(settings.mustRequest){
                                          console.log("mustRequest is true!");
                                          console.log("object def _owner: "+ _owner);
                                          console.log("object def resources: "+resources);
             	                            return resources[name]; 	
             	                       } 
             	             	 }  
             	             }else{
             	             	   if(settings.globale === false || settings.globale === null){
             	             	         core.throwError("cdvjs module resource-require-action error due to: '"+owner+"' module does not have access right to resource "+name);
             	             	   }
             	             }
             	             return null;
             	        }	 
             	   }
             	   
             	   this.setResouceValue = function(mask, value){
             	   	mask = checkMask(mask);
             	   	var sub = mask["sub"];
             	   	mask = mask["main"];
             	   	settings = this.bindSettings? resourceSettings[mask] : {};
             	        if(mask in resources && $h.call(resources, mask)){	
             	   	      if(settings.static === true){
             	   		     core.throwError("cdvjs module resource-value-change-action error due to: '"+owner+"' module does not have write access tp resource "+mask);
             	              }else{
             	   		  if(sub){
             	   		        resources[mask][sub] = value;
             	   		   }	 
             	   	      }
             	        }
             	   }
             	   
             	   this.getResourceValue = function(mask){
             	   	mask = checkMask(mask);
             	   	var sub = mask["sub"];
             	   	mask = mask["main"];
             	   	settings = this.bindSettings? resourceSettings[mask.main] : {};
             	   	if(mask in resources && $h.call(resources, mask)){
             	   		if(settings.globale){
             	   		     if(sub){
             	   		     	  return resources[mask][sub];
             	   		     }	
             	   		}else{
             	   		      core.throwError("cdvjs module resource-value-change-action error due to: '"+owner+"' module does not have write access tp resource "+mask);	
             	   		}
             	   	}
             	   }
             	   
             	   this.extendResource = function(name, value){
             	   	     if(!name || typeof name == "undefined"){
                            name =  "";
                       }
             	        settings = this.bindSettings? resourceSettings[name] : {};
             	        if(! $h.call(resources, name)){
             	        	
             	        }
             	   }
				   
				   this.getOwnModuleName = function(){
				      return _owner;
				   }
				   
				   this.getAllModuleNames = function(){
				       return Array.filter(Object.keys(widgets), function(val){
					       return val != _owner;
					   });
				   }
				   
				   this.setMessage = function(name, message){
				        return widgets[name] && widgets[name].message(message);
				   }
             	   
             	   return this;
             },
                
              __ = cdvjs = {
                
                    Application:{
               
			             logger: new Logger({env:"local",driver:"",disabled:false}),
			             
                         registerModule: function(name, arr, callback, manualActivation){ // [manualActivation] is an optional boolean parameter used to let $cdvjs know to omit it activation when activateAllModules() is called
               
                                    var self  = this,
                                        ignoreContainer = false,
                                        SandBox = {appid:['cdvjs'], logger:this.logger},
										_block = null;
             
			                        if(typeof manualActivation != "boolean"){
									     manualActivation = false;
									}
			                        
                                    if(!callback || typeof callback == "undefined"){
									        manualActivation = !!callback;
									        callback = arr;
										    arr = name;
                                            name = "";
                                            ignoreContainer = true;
                                    }
             
                                    if(typeof callback != "function" || typeof name != "string"){
                                              throw new TypeError("cdvjs module register error due to: 'incompatible types found as arguments!'");
                                    }
             
                                    if(/\s+/g.test(name)){
             
                                             self.throwError("cdvjs module register error due to: 'bad module name found as first argument!'");
             
                                    }

             
                                  try{
                
                                      arr.forEach(function(md){
                                                  
                                          if(md === "*"){
                                                  
                                               SandBox["window"] = w;
                                                  
                                               return;
                                          }
                                            
                                          try{
                                             
                                             SandBox[md] = self.command(md);
                                                       
                                          }catch(e){
                                                
                                             SandBox[md] = w[md] || null;
                                                       
                                          }
                                                
                                       });
									   
                                       if(ignoreContainer){
             
                                               callback.call(self, SandBox);
             
                                               ignoreContainer = false;
             
                                       }else{
                
                                              _block = callback.apply(self, [SandBox, new AccessControl(name, true, __)]);
											  
											  _block.$$defer = manualActivation;
											  
											  widgets[name] = _block;
             
                                       }
                
                                   }catch(e){
                
                                         self.throwError("cdvjs module register error due to: '"+e.message+"'");
                
                                   }finally{
               
                                         self = null; // prevent memory leaks
               
                                   }
                
               
                         },
                
                         listModules: function(toConsole){
               
                                var h = [], len = Object.getKeyCount(widgets);
               
                                for(var i in widgets){
               
                                    if($h.call(widgets, i)){
               
                                        h[len] =  {name:i,isActive:(widgets[i].active||false)};
               
                                    }
                                    
                                    --len;

                                }
               
                                if(!!w.console && toConsole){
               
                                    console.log("modules:  "+h.toString());
               
                                    return;
               
                               }
               
                               return h;
               
                         },
                         
                         loadResource:function(name, value, settings){
                         	if(!$h.call(resources, name)){
                                      resources[name] = value || {};
                                      console.log("registering data... >"+value.trackerObj+" : "+resources[name]);
                         	}
                         	
                         	if(!$h.call(resourceSettings, name)){
                         	      resourceSettings[name] = settings;
                                  console.log("registering data settings... >"+settings+" : "+resourceSettings[name]);
                         	      return true;
                         	}
                         	
                         	return false;
                         },
                
                         deactivateModule: function(name){
             
                               name = name || "unknown";
             
                               delete widgets["unknown"];
                
                               if((name in widgets)){
               
                                      if(widgets[name].active){
               
                                           widgets[name].active = false;
										   
										   widgets[name].stop();
               
                                      }
               
                                      widgets[name].destroy();  // properly reclaim memory
                
                                      delete widgets[name];
             
                               }else{
             
                                     throw "cdvjs module deregister error due to: '"+name+" module not found in registry'";
                
                               }
                
                         },
                
                         extendDefinitions:function(id, fn){
                
                                   df.call(Service, id, fn);
                
                         },
                
                         activateModule:function(name, obj){
             
                                 obj = obj || {};
             
                                 if(!widgets[name].active){
               
                                       widgets[name].active = true;
                                       
                                        if(widgets[name].defineVars){
                                                  	
                                          	widgets[name].defineVars();
                                          	
                                          	// delete widgets[name].defineVars;
                                        }
                                                  
                                       widgets[name].init(obj[name]);
             
                                   }
             
                
                         },
               
                         activateAllModules:function(obj, callback){
               
			                    obj = obj || {};
			   
                                for(var i in widgets){
                                      
									  
                                      if($h.call(widgets, i) && !widgets[i].$$defer){
               
                                           if(!widgets[i].active){
               
                                                  widgets[i].active = true;
                                                  
                                                  if(widgets[i].defineVars){
                                                  	
                                                  	   widgets[i].defineVars.call(widgets[i]);
                                                  	
                                                  	   // delete widgets[i].defineVars;
                                                  }
               
                                                  widgets[i].init.call(widgets[i], obj[i]);
               
                                           }else{
               
                                                  continue;
               
                                           }
               
                                      }
               
                                }
								
					  if(callback){
					     
                                   setImmediate(callback, [1,2]);
					  }
             
                         },
               
                         deactivateAllModules:function(suspend){
             
                                       for(var i in widgets){
               
                                             if($h.call(widgets, i)){
               
                                                    if(widgets[i].active){
               
                                                         if(!suspend){
                                                        
                                                            widgets[i].active = false;
               
                                                            widgets[i].stop();
                                                         }
														 
														 widgets[i].destroy();
               
                                                     }else{
               
                                                             continue;
               
                                                     }

               
                                             }
               
                                        }
               
             
            
                               //doEvent("unload", unload);
               
                         },
						 
						 configCommand: function(obj){
						 
						       if(typeof obj === "object" && $h.call(obj, "hasOwnProperty")){
							         /* Object.each(obj, function(){
									     
									  });*/
							   }
						 },
               
                         command:function(id, o){
               
                                if(o){
               
                                       this.extendCore(o, {});
               
                                       return rq(id, __[o]);
               
                                }

               
                                return rq(id);
             
                         },
             
                         throwError:function(msg){
             
                              var Err = Service.provider(Service.MODERRORSRVC);
             
                              throw (new Err(msg));
             
                         },
                         
                         getDataStruct: function(name){
                              var serviceMap = {
                              	  "Queue":-3,
                              	  "Tree":-5,
                              	  "LinkedList":-2,
                              	  "Stack":-1,
                              	  "":0
                              };
                              name =  name  || "";
                              return Service.provider(serviceMap[name]);
                              
                         },
             
                         extendCore: function(id, target, fn){
               
                                __[id] = target;
								
				                typeof fn == "function" && fn.call(this, __);
               
                         },
               
                         deactivateModule: function(name, suspend){
               
                             if(widgets[name].active){
							 
                                if(!suspend){
								
                                      widgets[name].active = false;
               
                                      widgets[name].stop();
									  
							    }		  
               
                             }
               
                         },
               
                    },
					 
		            getVersion:function(){
		        	        return '0.0.1';
		            },
		      
	                Delegate:Delegate,
	              
	                Futures:Futures,
               
                    createClass:function(className, konstructor, classMembers){
                            
                            if(!Glob){
                            	  Type.createNamespace("Class.Package", true);
                            	  Glob = w["Class"].prototype; // ["Class"] is a Namespace Object!!
                            }
                            if(!Glob[className]){  
                                Glob[className] = typeof konstructor == "function"? konstructor : noop;
                                Glob[className].prototype = Object.create(classMembers, {get:function(){ }, set:function(){ }});
                            }
               
                     },
					 extendClassDirect:function(konstructor, funcOrObj){
					     var obj = (typeof funcOrObj == "function") ? funcOrObj.prototype : funcOrObj; 
					     return (konstructor.prototype = obj) != null;
					 },
                     extendClass:function(name, classFn){
					       var newExtend, availClass, argsNum;
                     	   if(typeof name != "string" || !Glob[name]){
                     	   	   return false;
                     	   }
						   availClass = Glob[name];
                     	   if(classFn instanceof Function){
                     	   	    newExtend = (typeof availClass == "function") && (function(){
								       var args = $sl.call(arguments);
                     	   		        classFn.apply(this, []);
                     	   		        return this.constructor.apply(this, args);
                     	   	    });
							    if(newExtend){
                     	         	newExtend.prototype = Object.create(classFn.prototype, {});
									argsNum = availClass.length;
                     	   	        Glob[name] = function(){
									       return newExtend.apply(availClass.prototype, $sl.call(arguments, 0, argsNum));
									};
              				    }	 
                     	   }else if(classFn instanceof Object){
						        Object.each(classFn, function(val, key){
								   this[key] = val;
								},availClass.prototype);
								Glob[name].prototype = availClass.prototype;
						   }
						    return true;
                     },
                     getClass:function(name){
                     	 return !!Glob[name] ? Glob[name] : null;
                     }
        
            
                }
                
                return cdvjs;
});
