/*
 * Instagram's proxy API - demo web application scripts.
 * By Francisco Diaz :: picssel.com
 * Rev: March 2015
 */
;var rest = "./RESTapi.php"; // API's path
var dataRequest = {};
// process data request - call API
function processRequest(dataRequest) {
    var url = rest + "?" + dataRequest.type + "=" + dataRequest.param;
    jQuery.ajax({
        cache : false,
        dataType : "json", // or jsonp
        url : url,
        success : function (response) {
            dataRequest.type == "user" ?
            processUserData(dataRequest, response)
             :
            processMediaData(dataRequest, response);
        },
        error : function (xhr, status, error) {
            var msg = "Error : " + xhr.responseText + "";
            processError(msg);
        }
    });
}
// process user data
function processUserData(dataRequest, response) {
    var user = response.entry_data.UserProfile[0].user;
    jQuery("#tableProfilePic").find("tbody").append('<tr><td class="profilePic"><div class="img"><img src="' + user.profile_picture + '" alt="user\'s profile picture" /></div></td></tr>');
    var _basic = {}, _detailed = {};
    _basic.user_name = user.username;
    _basic.media_posts = formatNumber(user.counts.media);
    _basic.followed_by = formatNumber(user.counts.followed_by);
    _basic.follows = formatNumber(user.counts.follows);
    _detailed.user_ID = user.id;
    _detailed.full_name = user.full_name;
    _detailed.biography = user.bio;
    _detailed.website = '<a href="' + user.website + '" target="_blank">' + user.website + '</a>';
    _detailed.is_a_private_user = response.entry_data.UserProfile[0].relationship.is_private ? "yes" : "no";
    _detailed.is_a_verified_user = user.isVerified ? "yes" : "no";
    _detailed.is_an_advertiser = response.entry_data.UserProfile[0].isAdvertiser ? "yes" : "no";
    _detailed.is_staff = response.entry_data.UserProfile[0].isStaff ? "yes" : "no";
    _detailed.country_code = response.country_code;
    // add basic info rows
    for (var b in _basic) {
        if (_basic.hasOwnProperty(b)) {
            var row = '<tr><td class="infoType">' + b.replace(/\_/g, "&nbsp;") + '</td><td class="infoData">' + _basic[b] + '</td></tr>'
                jQuery("#tableUserData").append(row);
        }
    }
    // add detailed info rows
    if (dataRequest.detailed) {
        for (var d in _detailed) {
            if (_detailed.hasOwnProperty(d)) {
                var row = '<tr><td class="infoType">' + d.replace(/\_/g, "&nbsp;") + '</td><td class="infoData">' + _detailed[d] + '</td></tr>'
                    jQuery("#tableUserData").append(row);
            }
        }
    }
    // add recent media posts (4)
    if (dataRequest.showmedia) {
        var media = response.entry_data.UserProfile[0].userMedia;
        if (media.length > 0) {
            var row = '<tr><td class="infoType">Recent media (4)</td><td></td></tr>';
            jQuery("#tableUserData").append(row);
            var _image = "",
            _medialength = media.length > 4 ? 4 : media.length;
            for (var i = 0; i < _medialength; i++) {
                var _media = {};
                _media.type = media[i].type != null ? media[i].type : "unavailable";
                _media.link = media[i].link != null ? media[i].link : "";
                _media.shortcode = _media.link.substring(24, _media.link.length - 1);
                _media.location = media[i].location != null ? (media[i].location.name != null ? media[i].location.name : "unavailable") : "unavailable";
                _media.locationmap = "";
                if (media[i].location != null) {
                    if (media[i].location.latitude != null && media[i].location.longitude != null) {
                        _media.locationmap = ' - See location in <a class="fancybox fancybox.iframe" href="https://maps.google.com/maps?f=q&q=' + media[i].location.latitude + ',' + media[i].location.longitude + '&output=embed">Google maps</a>';
                    }
                }
                _media.thumbnail = media[i].images.thumbnail.url != null ? media[i].images.thumbnail.url : "";
                _media.caption = media[i].caption != null ? (media[i].caption.text != null ? media[i].caption.text : "media") : "media";
                _media.likes = media[i].likes != null ? (media[i].likes.count != null ? formatNumber(media[i].likes.count) : "unavailable") : "unavailable";
                _media.comments = media[i].comments != null ? (media[i].comments.count != null ? formatNumber(media[i].comments.count) : "unavailable") : "unavailable";
                _image += '<div class="img left"><a href="' + _media.link + '" target="_blank"><img src="' + _media.thumbnail + '" alt="' + _media.caption + '" /></a><br /><strong>type</strong> : ' + _media.type + '<br /><strong>shortcode</strong> : ' + _media.shortcode + '<br /><strong>likes</strong> : ' + _media.likes + '<br /><strong>comments</strong> : ' + _media.comments + '<br /><strong>location</strong> : ' + _media.location + _media.locationmap + '</div>';
            }
            var row = '<tr><td colspan="2" class="cf">' + _image + '</td></tr>';
            jQuery("#tableUserData").append(row);
        } else {
            // if user is private or hasn't any posts
            var row = '<tr><td class="infoType">recent media</td><td class="infoData">This user has not media to show</td></tr>';
            jQuery("#tableUserData").append(row);
        }
    }
    jQuery(".userinfo").fadeIn(400);
    jQuery(".loading").fadeOut(100);
}
// process media data
function processMediaData(dataRequest, response) {
    var media = response.entry_data.DesktopPPage[0].media;
    jQuery("#tableImage").find("tbody").append('<tr><td class="profilePic"><div class="img"><img style="max-width: 150px;" src="' + media.display_src + '" alt="media thumbnail" /></div></td></tr>');
    var _basic = {}, _detailed = {};
    _basic.type = media.is_video ? "video" : "image";
    _basic.user_name = media.owner.username;
    _basic.user_id = media.owner.id;
    if (media.is_video) {
        _basic.path_to_media = '<a href="' + media.video_url + '" target="_blank">' + media.video_url + '</a>';
    }
    _basic.likes = formatNumber(media.likes.count);
    _basic.caption = media.caption != null ? media.caption : "";
    _basic.date = new Date(1000 * media.date).toString();
    _detailed.media_ID = media.id;
    _detailed.is_user_private = media.owner.is_private ? "yes" : "no";
    _detailed.high_640x640 = '<a href="' + media.display_src + '" target="_blank">' + media.display_src + '</a>';
    _detailed.country_code = response.country_code;
    // add basic info rows
    for (var b in _basic) {
        if (_basic.hasOwnProperty(b)) {
            var row = '<tr><td class="infoType">' + b.replace(/\_/g, "&nbsp;") + '</td><td class="infoData">' + _basic[b] + '</td></tr>'
                jQuery("#tableMediaData").append(row);
        }
    }
    // add detailed info rows
    if (dataRequest.detailed) {
        for (var d in _detailed) {
            if (_detailed.hasOwnProperty(d)) {
                var row = '<tr><td class="infoType">' + d.replace(/\_/g, "&nbsp;") + '</td><td class="infoData">' + _detailed[d] + '</td></tr>'
                    jQuery("#tableMediaData").append(row);
            }
        }
    }
    if (dataRequest.generateCode) {
        if (media.is_video) {
            var _videoCode = '<video style="max-width: 100%;" width="640" height="640" preload="none" poster="' + media.display_src + '" src="' + media.video_url + '"></video>';
            var row = '<tr><td class="infoType">HTML5 video code</td>' +
                '<td class="infoData"><textarea readonly class="generatedHTML">' + _videoCode + '</textarea></td></tr>';
            jQuery("#tableMediaData").append(row);
            var row = '<tr><td class="infoType">player output :<br />mediaelement.js</td><td class="infoData">' + _videoCode + '</td></tr>';
            jQuery("#tableMediaData").append(row);
            initMEJS(); // show video code in MEJS
        } else {
            var row = '<tr><td class="infoType">Generated HTML code</td>' +
                '<td class="infoData">Media is not a video</td></tr>';
            jQuery("#tableMediaData").append(row);
        }
    }
    jQuery(".mediainfo").fadeIn(400);
    jQuery(".loading").fadeOut(100);
}
// if we want to process imageURL (not active for this demo)
function processImageData(dataRequest, response) {
    // here process the returned headers for the imageURL
}
function processError(msg) {
    jQuery(".error").find(".innerSection").html("<p>" + msg + "</p>").end().fadeIn(400);
    jQuery(".loading").fadeOut(100);
}
function formatNumber(_number) {
    _number += '';
    n = _number.split('.');
    n1 = n[0];
    n2 = n.length > 1 ? '.' + n[1] : '';
    var _regex = /(\d+)(\d{3})/;
    while (_regex.test(n1)) {
        n1 = n1.replace(_regex, '$1' + ',' + '$2');
    }
    return n1 + n2;
}
// initialize mediaelement.js
function initMEJS() {
    jQuery("#tableMediaData").find('video').mediaelementplayer({
        videoWidth : "100%",
        videoHeight : "100%"
    });
}
jQuery(document).ready(function () {
    "use strict";
    jQuery("#getData")
    .on("focusin", ".param", function () {
        jQuery(".error").fadeOut(400);
        jQuery(this).val() == "" ? jQuery(".param").val("") : jQuery(this).val();
        if (jQuery(this).hasClass("iuserName") && jQuery(this).val() == "") {
            jQuery(".forUsersOnly")
            .find("input")
            .prop('checked', false)
            .end()
            .fadeIn(600);
            jQuery(".forMediaOnly").hide();
        } else if (jQuery(this).hasClass("iuserName") && jQuery(this).val() != "") {
            jQuery(".forUsersOnly").fadeIn(600);
            jQuery(".forMediaOnly").hide();
        } else if (jQuery(this).hasClass("mediaID") && jQuery(this).val() == "") {
            jQuery(".forMediaOnly")
            .find("input")
            .prop('checked', false)
            .end()
            .fadeIn(600);
            jQuery(".forUsersOnly").hide();
        } else if (jQuery(this).hasClass("mediaID") && jQuery(this).val() != "") {
            jQuery(".forUsersOnly").hide();
            jQuery(".forMediaOnly").fadeIn(600);
        } else {
            jQuery(".forUsersOnly").hide();
            jQuery(".forMediaOnly").hide();
        }
    })
    .on("submit", function (e) {
        e.preventDefault();
        jQuery(".error").fadeOut(400);
        jQuery(".loading").fadeIn(100);
        // reset tables
        jQuery(".userinfo, .mediainfo").hide();
        jQuery("#tableProfilePic, #tableUserData, #tableImage, #tableMediaData")
        .find("tbody").find("tr").remove();
        if (jQuery("#iuserName").val() == "" && jQuery("#mediaID").val() == "") {
            var msg = "Error : You didn't request any data";
            processError(msg);
            return false;
        } else if (jQuery("#iuserName").val() != "") {
            dataRequest.type = "user";
            var username = jQuery("#iuserName").val();
            if (username.indexOf("//instagram.com/") > -1) {
                username = jQuery("#iuserName").val().split("//instagram.com/")[1];
                username = username.indexOf("/") > -1 ? username.split("/")[0] : username;
            }
            dataRequest.param = username;
            dataRequest.detailed = jQuery("#showDetails").is(":checked") ? true : false;
            dataRequest.showmedia = jQuery("#showMedia").is(":checked") ? true : false;
            processRequest(dataRequest);
        } else {
            dataRequest.type = "media";
            var shortcode = jQuery("#mediaID").val();
            if (shortcode.indexOf("//instagram.com/p/") > -1) {
                shortcode = jQuery("#mediaID").val().split("//instagram.com/p/")[1];
                shortcode = shortcode.indexOf("/") > -1 ? shortcode.split("/")[0] : shortcode;
            }
            dataRequest.param = shortcode;
            dataRequest.detailed = jQuery("#showDetails").is(":checked") ? true : false;
            dataRequest.generateCode = jQuery("#generateCode").is(":checked") ? true : false;
            processRequest(dataRequest);
        }
    });
    jQuery(".fancybox").fancybox();
}); // ready