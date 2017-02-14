/*!
 * scrollsWith v1.0.0 (https://falk-m.de)
 * Copyright 2011-2017 falk-m.de
 * Released under an MIT-style license.
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function($) {
    
    var VERSION = "1.0.0",
        PLUGIN_NS = 'scollswith_plugin';
        
    /**
    * The default configuration, and available options to configure
    */
    
    var defaults = {
        dummy_attr: 'data-sidebar-dummy',
        bottom_dummy_attr: 'data-sidebar-bottom',
        attr_value: null,
        margin_top: 0,
        fixedClass: 'fixed',
        minWidth: 200,
    };

    $.fn.scrollsWith = function(method) {
        var $this = $(this),
          plugin = $this.data(PLUGIN_NS);

        //Check if we are already instantiated and trying to execute a method
        if (plugin && typeof method === 'string') {
          if (plugin[method]) {
            return plugin[method].apply(plugin, Array.prototype.slice.call(arguments, 1));
          } else {
            $.error('Method ' + method + ' does not exist on jQuery.scollsWith');
          }
        }
        //Else update existing plugin with new options hash
        else if (plugin && typeof method === 'object') {
            plugin['option'].apply(plugin, arguments);
        }

        //Else not instantiated and trying to pass init object (or nothing)
        else if (!plugin && (typeof method === 'object' || !method)) {
           return init.apply(this, arguments);
        }

        return $this;
    };
    
    /**
    * The version of the plugin
    * @readonly
    */
    $.fn.scrollsWith.version = VERSION;
    
    //Expose our defaults so a user could override the plugin defaults
    $.fn.scrollsWith.defaults = defaults;
    
       /**
   * Initialise the plugin for each DOM element matched
   * This creates a new instance of the main scrollsWith class for each DOM element, and then
   * saves a reference to that instance in the elements data property.
   * @internal
   */
  function init(options) {

        if (!options) {
          options = {};
        }

        //pass empty object so we dont modify the defaults
        options = $.extend({}, $.fn.scrollsWith.defaults, options);

        //For each element instantiate the plugin
        return this.each(function() {
        var $this = $(this); 

          //Check we havent already initialised the plugin
          var plugin = $this.data(PLUGIN_NS);

          if (!plugin) {
            plugin = new scrollsWith(this, options);
            $this.data(PLUGIN_NS, plugin);
          }
        });
    }
    
    function scrollsWith(element, options){
        var me = this;
        
        var uid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        //take a local/instacne level copy of the options - should make it this.options really...
        var options = $.extend({}, options);

        var data = {
            max_top: 0,
            max_bottom: 0,
            left: 0,
            width: 0,
            fixed: false,
            enable_fixed: false,
        };

        //jQuery wrapped element for this instance
        var $element = $(element);
        var $dummy = null;
        var $dummy_bottom = null;
        
        var event_resize = function(){
            var scrollTop = $( window ).scrollTop();

            $( window ).off('scroll.' + uid);
            if($(window).width() > options.minWidth && $(window).height() > $element.height() + (2 * options.margin_top)) {
                    $(window).on('scroll.' + uid, function() { scoll_event(); });
                    data.enable_fixed = true;
            } else {
                data.enable_fixed = false;
            }

            //offset bilden
            data.max_top = $dummy.offset().top;
            data.left = $dummy.offset().left;
            data.width = $dummy.width();
            
            data.max_bottom = $dummy_bottom.offset().top + $dummy_bottom.height();
            scoll_event();
        };

        var scoll_event = function(){
            var scrollTop = $( window ).scrollTop();
           
            //sidebar positionieren
            if(!data.enable_fixed){
                 //wenn fixed aber auflösung zu klein, dann lösen
                if(data.fixed){
                    console.log("unfix sidebar");
                    $element.removeClass(options.fixedClass);
                    $element.removeAttr("style");
                    data.fixed = false;
                }
                return;
            }
            else if(data.fixed && data.max_top - options.margin_top > scrollTop){
                //lösen
                console.log("unfix sidebar");
                $element.removeClass(options.fixedClass);
                $element.removeAttr("style");
                data.fixed = false;
                return;
            }
            else if (!data.fixed && data.max_top - options.margin_top < scrollTop){
                //fixen
                console.log("fix sidebar");
                $element.addClass(options.fixedClass);
                data.fixed = true;
            }
            else if (!data.fixed){
                return;
            }

            //positionieren
            $element.css({
                    position: 'fixed',
                    top: options.margin_top,
                    left: data.left,
                    width: data.width
                });

            if(data.max_bottom - scrollTop < $element.height() + options.margin_top){
                $element.css({
                    top: data.max_bottom - scrollTop - $element.height()
                });
            }
        };
        
        var construct = function (){
            
            options.attr_value = options.attr_value || $element.attr("id");
            
            $dummy = $("[" + options.dummy_attr + "='" + options.attr_value + "']");
            $dummy_bottom = $("[" + options.bottom_dummy_attr + "='" + options.attr_value + "']");
            
            if($dummy.length == 0 || $dummy_bottom.length == 0){
                console.log("element for scollsWith not available");
                return;
            }
            
            $(window).on('resize.' + uid, function() { event_resize(); });
            $(window).on('orientationchange.' + uid, function() { event_resize(); });
            event_resize();
        };

        //init
        construct();
    }

}));