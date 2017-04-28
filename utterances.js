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

addEventListener('message', function (event) {
    var data = event.data;
    if (data && data.type === 'resize' && data.height) {
        iframe.style.minHeight = data.height + "px";
    }
});
var options = {};
var script = document.currentScript;
var attributes = script.attributes;
for (var i = 0; i < attributes.length; i++) {
    var attribute = attributes.item(i);
    options[attribute.name] = attribute.value;
}
options.url = location.href;
options.origin = location.origin;
options.pathname = location.pathname.substr(1).replace(/\.\w+$/, '');
options.title = document.title;
var descriptionMeta = document.querySelector("meta[name='description']");
options.description = descriptionMeta ? descriptionMeta.content : '';
var page = script.src.replace(/utterances(?:\.min)?\.js(?:$|\?)/, '/embed/index.min.html');
var iframe = document.createElement('iframe');
iframe.classList.add('utterances');
iframe.setAttribute('allowtransparency', 'true');
iframe.src = page + "?" + param(options);
script.insertAdjacentElement('afterend', iframe);

}());
