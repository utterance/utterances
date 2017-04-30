(function () {
'use strict';

function param(obj) {
    var parts = [];
    for (var name_1 in obj) {
        if (obj.hasOwnProperty(name_1)) {
            parts.push(encodeURIComponent(name_1) + "=" + encodeURIComponent(obj[name_1]));
        }
    }
    return parts.join('&');
}

var script = document.currentScript;
var attrs = {};
for (var i = 0; i < script.attributes.length; i++) {
    var attribute = script.attributes.item(i);
    attrs[attribute.name] = attribute.value;
}
attrs.url = location.href;
attrs.origin = location.origin;
attrs.pathname = location.pathname.substr(1).replace(/\.\w+$/, '');
attrs.title = document.title;
var descriptionMeta = document.querySelector("meta[name='description']");
attrs.description = descriptionMeta ? descriptionMeta.content : '';
var page = script.src.replace(/\/utterances(\.min)?\.js(?:$|\?)/, '/embed/index$1.html');
var iframe = document.createElement('iframe');
iframe.classList.add('utterances');
iframe.setAttribute('allowtransparency', 'true');
iframe.src = page + "?" + param(attrs);
script.insertAdjacentElement('afterend', iframe);
script.parentElement.removeChild(script);
addEventListener('message', function (event) {
    var data = event.data;
    if (data && data.type === 'resize' && data.height) {
        iframe.style.minHeight = data.height + "px";
    }
});

}());
