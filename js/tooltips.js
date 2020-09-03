// This is Deckbox's Tooltip code.
// Original Source: https://deckbox.org/help/tooltips
// I modified it to work with Scryfall's links.

if (typeof Deckbox == "undefined") Deckbox = {};
Deckbox.ui = Deckbox.ui || {};

 Deckbox.ui.Tooltip = function(className, type) {
    this.el = document.createElement('div');
    this.el.className = className + ' ' + type;
    this.type = type;
    this.el.style.display = 'none';
    document.body.appendChild(this.el);
    this.br = document.createElement('br');
    this.tooltips = {};
};

Deckbox.ui.Tooltip.prototype = {
    showImage: function(posX, posY, image) {
        this.el._shown = true;
        if (image.complete) {
            this.el.innerHTML = '';
            this.el.appendChild(image);
        } else {
            this.el.innerHTML = 'Loading...';
            image.onload = function() {
                var self = Deckbox._.tooltip('image');
                self.el.innerHTML = '';
                image.onload = null;
                self.el.appendChild(image);
                self.move(posX, posY);
            }
        }
        this.el.style.display = '';
        this.move(posX, posY);
    },

    hide: function() {
        this.el._shown = false;
        this.el.style.display = 'none';
    },

    move: function(posX, posY) {
        // The tooltip should be offset to the right so that it's not exactly next to the mouse.
        posX += 15;
        posY -= this.el.offsetHeight / 3;

        // Remeber these for when (if) the register call wants to show the tooltip.
        this.posX = posX; 
        this.posY = posY;
        if (this.el.style.display === 'none') return;

        var pos = Deckbox._.fitToScreen(posX, posY, this.el);

        this.el.style.top = pos[1] + "px";
        this.el.style.left = pos[0] + "px";
    },
};

Deckbox.ui.Tooltip.hide = function() {
    Deckbox._.tooltip('image').hide();
    Deckbox._.tooltip('text').hide();
};

Deckbox._ = {
    pointerX: function(event) {
        var docElement = document.documentElement,
            body = document.body || { scrollLeft: 0 };

        return event.pageX ||
            (event.clientX +
             (docElement.scrollLeft || body.scrollLeft) -
             (docElement.clientLeft || 0));
    },

    pointerY: function(event) {
        var docElement = document.documentElement,
            body = document.body || { scrollTop: 0 };

        return  event.pageY ||
            (event.clientY +
             (docElement.scrollTop || body.scrollTop) -
             (docElement.clientTop || 0));
    },

    scrollOffsets: function() {
        return [
            window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
            window.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
        ];
    },

    viewportSize: function() {
        let ua = navigator.userAgent, rootElement;
        if (ua.indexOf('AppleWebKit/') > -1 && !document.evaluate) {
            rootElement = document;
        } else if (Object.prototype.toString.call(window.opera) === '[object Opera]' && window.parseFloat(window.opera.version()) < 9.5) {
            rootElement = document.body;
        } else {
            rootElement = document.documentElement;
        }

        // IE8 in quirks mode returns 0 for these sizes
        const size = [rootElement.clientWidth, rootElement.clientHeight];
        if (size[1] === 0) {
            return [document.body.clientWidth, document.body.clientHeight];
        } else {
            return size;
        }
    },

    fitToScreen: function(posX, posY, el) {
        const scroll = Deckbox._.scrollOffsets(), viewport = Deckbox._.viewportSize();

        posX = posX - 5;

        /* If it's too high, we move it down. */
        if (posY - scroll[1] < 0) {
            posY += scroll[1] - posY + 5;
        }
        /* If it's too low, we move it up. */
        if (posY + el.offsetHeight - scroll[1] > viewport[1]) {
            posY -= posY + el.offsetHeight + 5 - scroll[1] - viewport[1];
        }

        return [posX, posY];
    },

    addEvent: function(obj, type, fn) {
        if (obj.addEventListener) {
            if (type === 'mousewheel') obj.addEventListener('DOMMouseScroll', fn, false);
            obj.addEventListener( type, fn, false );
        } else if (obj.attachEvent) {
            obj["e"+type+fn] = fn;
            obj[type+fn] = function() { obj["e"+type+fn]( window.event ); };
            obj.attachEvent( "on"+type, obj[type+fn] );
        }
    },

    removeEvent: function(obj, type, fn) {
        if (obj.removeEventListener) {
            if(type === 'mousewheel') obj.removeEventListener('DOMMouseScroll', fn, false);
            obj.removeEventListener( type, fn, false );
        } else if (obj.detachEvent) {
            obj.detachEvent( "on"+type, obj[type+fn] );
            obj[type+fn] = null;
            obj["e"+type+fn] = null;
        }
    },

    loadJS: function(url) {
        var s = document.createElement('s' + 'cript');
        s.setAttribute("type", "text/javascript");
        s.setAttribute("src", url);
        document.getElementsByTagName("head")[0].appendChild(s);
    },

    loadCSS: function(url) {
        var s = document.createElement("link");
        s.type = "text/css";
        s.rel = "stylesheet";
        s.href = url;
        document.getElementsByTagName("head")[0].appendChild(s);
    },

    needsTooltip: function(el) {
        if (el.getAttribute && el.getAttribute('data-tt')) return true;

        let href;
        if (!el || !(el.tagName === 'A') || !(href = el.getAttribute('id'))) return false;
        if (el.className.match('no_tt')) return false;
        return href.match(/^https?:\/\/[^\/]*\/(mtg)\/.+/);
    },

    tooltip: function(which)  {
        if (which === 'image') return this._iT = this._iT || new Deckbox.ui.Tooltip('deckbox_i_tooltip', 'image');
        if (which === 'text') return this._tT = this._tT || new Deckbox.ui.Tooltip('deckbox_t_tooltip', 'text');
    },

    target: function(event) {
        var target = event.target || event.srcElement || document;
        /* check if target is a textnode (safari) */
        if (target.nodeType === 3) target = target.parentNode;
        return target;
    }
};

// Bind the listeners
(function() {
    function ontouchstart(event) {
        const el = Deckbox._.target(event);
        if (!Deckbox._.needsTooltip(el)) return;
        el._touch = true;
    }

    function onmouseover(event) {
        const el = Deckbox._.target(event);
        if (!Deckbox._.needsTooltip(el)) return;

        el._mo = true;

        let posX = Deckbox._.pointerX(event);
        let posY = Deckbox._.pointerY(event);

        if (el.id.match('/(mtg)/')) {
            showImage(el, el.id + '/tooltip', posX, posY);
        }
    }

    function click(event) {
        const el = Deckbox._.target(event);
        if (Deckbox._.needsTooltip(el)) {
            if (!el._touch) return; // on touch devices click shows tooltip

            let posX = Deckbox._.pointerX(event);
            let posY = Deckbox._.pointerY(event);

            if (el.id.match('/(mtg)/')) {
                let a = document.createElement("a");
                a.className = "no_tt";
                a.href = el.href;
                a.target = "_blank";
                a.innerHTML = "More Details";
                showImage(el, el.id + '/tooltip', posX, posY);
            }

            event.preventDefault();
            event.stopPropagation();
        } else {
            // we clicked something else, hide tooltips if necessary
            setTimeout(function() {
                Deckbox._.tooltip('image').hide();
                Deckbox._.tooltip('text').hide();
            }, 200);
        }
    }

    function showImage(el, url, posX, posY) {
        const img = document.createElement('img');
        url = url.replace(/\?/g, ""); /* Problematic with routes on server. */
        img.src = url;

        // wait 100 ms, if we didn't already mouseout of this element, we show the mouseover tooltip
        setTimeout(function() {
            if (el._mo) Deckbox._.tooltip('image').showImage(posX, posY, img);
        }, 200);
    }

    function onmousemove(event) {
        let el = Deckbox._.target(event), posX = Deckbox._.pointerX(event), posY = Deckbox._.pointerY(event);
        if (Deckbox._.needsTooltip(el)) {
            Deckbox._.tooltip('image').move(posX, posY);
        }
    }

    function onmouseout(event) {
        let el = Deckbox._.target(event);
        if (el._mo) {
            el._mo = false;
            Deckbox._.tooltip('image').hide();
        }
    }

    Deckbox._.addEvent(document, 'touchstart', ontouchstart);
    Deckbox._.addEvent(document, 'mouseover', onmouseover);
    Deckbox._.addEvent(document, 'mousemove', onmousemove);
    Deckbox._.addEvent(document, 'mouseout', onmouseout);
    Deckbox._.addEvent(document, 'click', click);
    Deckbox._.loadCSS('https://deckbox.org/assets/external/deckbox_tooltip.css');
})();
