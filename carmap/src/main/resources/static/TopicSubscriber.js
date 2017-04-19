/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * Solace Systems Web Messaging API for JavaScript
 * PublishSubscribe tutorial - Topic Subscriber
 * Demonstrates subscribing to a topic for direct messages and receiving messages
 */

/*jslint es6 browser devel:true*/
/*global solace*/
var flatTires = 0;
var brokenLights = 0;
var engineTroubles = 0;
var okCars = 1;
var totalConnectedCars = 1;

var TopicSubscriber = function (topicName) {
    "use strict";
    var subscriber = {};
    subscriber.session = null;
    subscriber.topicName = topicName;
    subscriber.subscribed = false;
    
    var cars = {};
    var curZIndex = 1;


    //http://ecmanaut.blogspot.hk/2006/07/encoding-decoding-utf8-in-javascript.html
    function decode_utf8(s) {
        return decodeURIComponent(escape(s));
    }

    function encode_utf8(s) {
        return unescape(encodeURIComponent(s));
    }


    // Logger
    var logger = [];
    subscriber.log = function (line) {
        var now = new Date();
        var time = [('0' + now.getHours()).slice(-2), ('0' + now.getMinutes()).slice(-2), ('0' + now.getSeconds()).slice(-2)];
        var timestamp = '[' + time.join(':') + '] ';
        //console.log(timestamp + line);
        //var logTextArea = document.getElementById('log');
        logger.push(timestamp + line);
        if (logger.length > 100) logger.shift();  // trim it to 50
        //logTextArea.value += timestamp + line + '\n';
        //logTextArea.value = logger.join('\n');
        //logTextArea.scrollTop = logTextArea.scrollHeight;
    };

    subscriber.log('\n*** Subscriber to topic "' + subscriber.topicName + '" is ready to connect ***');
   
/*
    // Callback for message events
    subscriber.messageEventCb = function (session, message) {
        var topic = message.getDestination().getName();
        var msgType;
        var t = message.getType();
        if (t == solace.MessageType.BINARY) {
            msgType = "BINARY";
            subscriber.log('Received '+msgType+' message: topic="'+message.getDestination().getName()+'", payload="' + message.getBinaryAttachment() + '"');
        } else if (t == solace.MessageType.TEXT) {
            msgType = "TEXT";
            subscriber.log('Received '+msgType+' message: topic="'+message.getDestination().getName()+'", text="' + message.getSdtContainer().getValue() + '"');
        } else {
            msgType = "other";
            subscriber.log('Received '+msgType+' message: topic="'+message.getDestination().getName()+'", payload="' + message.getBinaryAttachment() + '"');
        }
        if (message.getDestination().getName().indexOf('geo/coord') == 0 &&  message.getBinaryAttachment() != null) {
            // use indexOf == 0 instead of startsWith() b/c that's not supported on older IE
            var payload;
            if (msgType == 'BINARY') {
                try {
                    payload = JSON.parse(decode_utf8(message.getBinaryAttachment()));
                } catch(e) {
                    subscriber.log(e);
                    return;
                }
            } else if (msgType == 'TEXT') {  // in case someone sends text message
                try {
                    payload = JSON.parse(message.getSdtContainer().getValue());
                } catch(e) {
                    subscriber.log(e);
                    return;
                }
            } else {
                subscriber.log("Received invalid formatted message");
            }
            //if (payload.fault != 'OK')
                //alert(payload.fault);
            addMarker(payload,map);
            return;
        }
       
    };
*/

    var humanCarIcon = {url:"96px_Pivotal-Demo_car-marker_green-marker-blue-convertible-fine.png", anchor:{x:21,y:60}};
    var autoCarIcon = {url:"72px_Pivotal-Demo_car-marker_gray-marker-black-car-fine.png", anchor:{x:21,y:60}};
    var tireFaultIcon = {url:"96px_Pivotal-Demo_car-marker_red-marker-blown-tire.png", anchor:{x:21, y:60}};
    var lightFaultIcon = {url:"96px_Pivotal-Demo_car-marker_red-marker-broken-taillight.png", anchor:{x:21, y:60}};
    var engineFaultIcon = {url:"96px_Pivotal-Demo_car-marker_red-marker-busted-engine.png", anchor:{x:21, y:60}};

// payload should contain "lat, lng, name, (all original) and new one fault 

    // Adds a marker to the map.
    function addMarker(payload, map) {
        var location = {lat: payload.lat*1, lng: payload.lng*1};
        // Add the marker at the clicked location, and add the next-available label
        // from the array of alphabetical characters.
        var marker;
        var name = payload.name;
        var id = payload.id;
        var autoGen = payload.autoGen;
        if (!(id in cars)) {
            cars[id] = {};
            if (autoGen == 0)
            {
                cars[id]["name"] = name;
                marker = new MarkerWithLabel({
                    map: map,
                    draggable: false,
                    raiseOnDrag: false,
                    labelContent: (autoGen == 1) ? "" : name,
                    labelAnchor: new google.maps.Point(60, -10),
                    labelClass: "labels", // the CSS class for the label
                    labelStyle: {opacity: 0.8},
                    optimized: false,
                });
            }
            else
            {
                marker = new google.maps.Marker({
                  position: location,
                  map: map,
                  title: 'Robo car'
                });
            }
            cars[id]["marker"] = marker;
            if (autoGen == 1)
                cars[id]["marker"].setIcon(autoCarIcon);
            else
                cars[id]["marker"].setIcon(humanCarIcon);

            // create an info window, and associate with this marker
            cars[id]["info"] = new google.maps.InfoWindow();
            google.maps.event.addListener(marker, 'click', function() {
                cars[id]["info"].open(map,marker);
            });
            marker.setAnimation(google.maps.Animation.DROP);
        } else {
            marker = cars[id]["marker"];
            //marker.setAnimation(google.maps.Animation.BOUNCE);
        }
        // already exists... update it!
        marker.setZIndex(curZIndex++);
        marker.setPosition(location);
        if (marker.getOpacity() == 0) {  // i.e. had faded out
            marker.setMap(map);
        }
        // make sure it's fully opaque, and update the timestamp
        marker.setOpacity(1.0);
        cars[id]["timestamp"] = Date.now();
        cars[id].fault = payload.fault;

        // NEW: update teh marker based on fault status
        if (payload.fault == "OK") {
            if (autoGen == 1)
                cars[id]["marker"].setIcon(autoCarIcon);
            else
                cars[id]["marker"].setIcon(humanCarIcon);
        }
        else if (payload.fault == "Flat Front Tire" || payload.fault == "Flat Rear Tire")
            cars[id]["marker"].setIcon(tireFaultIcon);
        else if (payload.fault == "Light Burnt Out")
            cars[id]["marker"].setIcon(lightFaultIcon);
        else // Engine Trouble
            cars[id]["marker"].setIcon(engineFaultIcon);

        // this builds an HTML string for the popup info window when you click on the marker
        var infoContent = '<p><b>Name:</b> '+name+'<br/>';
        infoContent += '<b>ID:</b> '+id+'<br/>';
        infoContent += '<b>Position:</b> '+location["lat"].toFixed(6)+', '+location["lng"].toFixed(6)+'<br/>';
        // add any other fields in the payload  besides name, lat, lng
        for (var key in payload) {
            // skip loop if the property is from prototype
            if (!payload.hasOwnProperty(key)) continue;
            if (key == 'name' || key == 'id' || key == 'lat' || key == 'lng') continue;  // skip if one of these
            infoContent += '<b>'+key+':</b> '+payload[key]+'<br/>';
        }
        infoContent += '</p>';
        cars[id]["info"].setContent(infoContent);
        //setTimeout(function(){ marker.setAnimation(null); },100);
        return marker;
    }
    
     // this function will slowly fade out a car if it hasn't "ticked" in a certain amount of time 
    function fadeMarkers() {
        //console.log("Current num cars: "+Object.keys(cars).length);
        for (var key in cars) {
            // skip loop if the property is from prototype
            if (!cars.hasOwnProperty(key)) continue;
            var timestamp = cars[key]["timestamp"];
            if (Date.now() - timestamp > 120000) {  // disappears after 120 seconds
                cars[key]["marker"].setOpacity(0);
                cars[key]["marker"].setMap(null);  // makes the label disappear
                delete cars[key];
            } else if (Date.now() - timestamp > 60000) {
                cars[key]["marker"].setOpacity(0.5);
                cars[key]["info"].close();  // if it's open
            }
        }
        setTimeout(fadeMarkers,30000);  // run again in 30 seconds -- this makes it into a loop
    }
    
    fadeMarkers();  // kick off the looping check for old markers

/*
    // Callback for session events
    subscriber.sessionEventCb = function (session, event) {
        subscriber.log(event.toString());
        if (event.sessionEventCode === solace.SessionEventCode.UP_NOTICE) {
            subscriber.log('=== Successfully connected and ready to subscribe. ===');
            subscriber.subscribe();
        } else if (event.sessionEventCode === solace.SessionEventCode.CONNECTING) {
            subscriber.log('Connecting...');
            subscriber.subscribed = false;
        } else if (event.sessionEventCode === solace.SessionEventCode.DISCONNECTED) {
            subscriber.log('Disconnected.');
            subscriber.subscribed = false;
            if (subscriber.session !== null) {
                subscriber.session.dispose();
                subscriber.session = null;
            }
        } else if (event.sessionEventCode === solace.SessionEventCode.SUBSCRIPTION_ERROR) {
            subscriber.log('Cannot subscribe to topic: ' + event.correlationKey);
        } else if (event.sessionEventCode === solace.SessionEventCode.SUBSCRIPTION_OK) {
            if (subscriber.subscribed) {
                subscriber.subscribed = false;
                subscriber.log('Successfully unsubscribed from topic: ' + event.correlationKey);
            } else {
                subscriber.subscribed = true;
                subscriber.log('Successfully subscribed to topic: ' + event.correlationKey);
                subscriber.log('=== Ready to receive messages. ===');
            }
        }
    };
*/

    // Establishes connection to Solace router
    subscriber.run = function () {
            var xhr = new XMLHttpRequest();
            subscriber.log('About to open connection...');
            xhr.open('GET', "cars", true);
            subscriber.log('About to issue GET...');
            xhr.send();
            subscriber.log('Send called');
            //xhr.addEventListener("readystatechange", processRequest, false);
            //subscriber.log('Event listener added');

            xhr.onreadystatechange = function() {
                subscriber.log('onreadystatechange called with readyState=' + this.readyState
                        + ', status=' + this.status );
                if (this.readyState === 4 && this.status === 200) {
                    var response = JSON.parse(this.responseText);
                    //alert(this.responseText);

                    var i = 0;
                    for (i in response) {
                        var car = response[i];
                        addMarker(car,map);
                    }
                    if (i == 0)
                        setTimeout(subscriber.run,2000);  // run again in 5 seconds -- this makes it into a loop
                    else
                    {
                        //alert("car not null. cars returned: " + i);
                        setTimeout(subscriber.run,100);  // run again immediately
                    }

                    flatTires = 0;
                    brokenLights = 0;
                    engineTroubles = 0;
                    okCars = 0;

                    var j = 0;
                    for (j in cars) {
                        var car = cars[j];
                        switch (car.fault) {
                            case "OK":
                                okCars++;
                                break;
                            case "Flat Front Tire":
                                flatTires++;
                                break;
                            case "Flat Rear Tire":
                                flatTires++;
                                break;
                            case "Light Burnt Out":
                                brokenLights++;
                                break;
                            default: // Engine Trouble
                                engineTroubles++;
                        }
                    }

                    totalConnectedCars = okCars + flatTires + brokenLights + engineTroubles;
                    updateChart();
                }
            }

/*
        if (subscriber.session !== null) {
            subscriber.log('Already connected and ready to subscribe.');
        } else {
            //var host = document.getElementById('host').value;
            //var vpn = document.getElementById('vpn').value;
            //var user = document.getElementById('user').value;
            //var pw = document.getElementById('password').value;
            var host = "10.244.0.3:7000";
            var vpn = "v003";
            var user = "v003.cu000017";
            var pw = "16698a80-0381-422d-a69e-aa6fb30eb273";
            if (host) {
                subscriber.connectToSolace(host,vpn,user,pw);
                subscriber.subscribe();
            } else {
                subscriber.log('Cannot connect: please specify the Solace router web transport URL.');
            }
        }
*/
    };

/*
    subscriber.connectToSolace = function (host,vpn,user,pw) {
        subscriber.log('Connecting to Solace router web transport URL ' + host + '.');
        var sessionProperties = new solace.SessionProperties();
        sessionProperties.url = 'ws://' + host;
        // NOTICE: the Solace router VPN name
        sessionProperties.vpnName = vpn;
        subscriber.log('Solace router VPN name: ' + sessionProperties.vpnName);
        // NOTICE: the client username
        sessionProperties.userName = user;
        if (pw != "") sessionProperties.password = pw;
        subscriber.log('Client username: ' + sessionProperties.userName);
        subscriber.session = solace.SolclientFactory.createSession(
            sessionProperties,
            new solace.MessageRxCBInfo(function (session, message) {
                // calling callback for message events
                subscriber.messageEventCb(session, message);
            }, subscriber),
            new solace.SessionEventCBInfo(function (session, event) {
                // calling callback for session events
                subscriber.sessionEventCb(session, event);
            }, subscriber)
        );
        try {
            subscriber.session.connect();
        } catch (error) {
            subscriber.log(error.toString());
        }
    };

    // Gracefully disconnects from Solace router
    subscriber.disconnect = function () {
        subscriber.log('Disconnecting from Solace router...');
        if (subscriber.session !== null) {
            try {
                subscriber.session.disconnect();
                subscriber.session.dispose();
                subscriber.session = null;
            } catch (error) {
                subscriber.log(error.toString());
            }
        } else {
            subscriber.log('Not connected to Solace router.');
        }
    };

    // Subscribes to topic on Solace Router
    subscriber.subscribe = function () {
        if (subscriber.session !== null) {
            if (subscriber.subscribed) {
                subscriber.log('Already subscribed to "' + subscriber.topicName + '" and ready to receive messages.');
            } else {
                subscriber.log('Subscribing to topic: ' + subscriber.topicName);
                try {
                    subscriber.session.subscribe(
                        solace.SolclientFactory.createTopic(subscriber.topicName),
                        true, // generate confirmation when subscription is added successfully
                        subscriber.topicName, // use topic name as correlation key
                        10000 // 10 seconds timeout for this operation
                    );
                } catch (error) {
                    subscriber.log(error.toString());
                }
            }
        } else {
            subscriber.log('Cannot subscribe because not connected to Solace router.');
        }
    };

    // Unsubscribes from topic on Solace Router
    subscriber.unsubscribe = function () {
        if (subscriber.session !== null) {
            if (subscriber.subscribed) {
                subscriber.log('Unsubscribing from topic: ' + subscriber.topicName);
                try {
                    subscriber.session.unsubscribe(
                        solace.SolclientFactory.createTopic(subscriber.topicName),
                        true, // generate confirmation when subscription is removed successfully
                        subscriber.topicName, // use topic name as correlation key
                        10000 // 10 seconds timeout for this operation
                    );
                } catch (error) {
                    subscriber.log(error.toString());
                }
            } else {
                subscriber.log('Cannot unsubscribe because not subscribed to the topic "' + subscriber.topicName + '"');
            }
        } else {
            subscriber.log('Cannot unsubscribe because not connected to Solace router.');
        }
    };
*/

    return subscriber;
};
