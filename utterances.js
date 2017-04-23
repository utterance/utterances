(function () {
'use strict';

/*

MODES

- reactions widget
- comments widget

QUERY STRING OPTIONS

- issue title (uniquely identify the comment set)
- issue body (optional)
or
- existing issue id

CONFIG

- polling
- permitted reactions
- stylesheet url

HOSTING

iframe, allowtransparency

GITHUB API

use conditional requests: https://developer.github.com/v3/#conditional-requests


DISPLAYING COMMENTS

find the issue matching the criteria
if it exists, fetch the comments
if it does not exist, show no comments

POLLING

if polling is enabled, periodically fetch comments or the issue.

COMMENTING

- github oauth
- existence of utterances.json file
-

to comment, we need a github oauth token and we need the id of the issue to comment on.

first have the user sign-in.

fetch(``)
*/

}());
