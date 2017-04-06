var mySessionProperties = null;
var mySession = null;

var sessionEventCb; // forward declaration
var messageEventCb; // forward declaration

var replyReceivedCb; // forward declaration
var replyFailedCb; // forward declaration

var solace_ready = 0;

function send(topic_string, xmlData, binaryData) {
  if (!solace_ready) { return; };
  try {
    var msg = solace.SolclientFactory.createMessage();
    var topic = solace.SolclientFactory.createTopic(topic_string);
    msg.setDestination(topic);
    msg.setDeliveryMode(solace.MessageDeliveryModeType.DIRECT);
    msg.setElidingEligible(true);
    if (xmlData != null) msg.setXmlContent(xmlData);
    msg.setBinaryAttachment(binaryData);
    mySession.send(msg);
  } catch(error) {
    log("Send error: " + error.toString());
  }
}

messageEventCb = function (session, message) {
};

function connect(connectedCB) {
  var factoryProps = new solace.SolclientFactoryProperties();
  factoryProps.logLevel = solace.LogLevel.WARN;
  solace.SolclientFactory.init(factoryProps);
  try {
    mySessionProperties = new solace.SessionProperties();
    mySessionProperties.connectTimeoutInMsecs = 2000;
    mySessionProperties.readTimeoutInMsecs = 2000;
    mySessionProperties.keepAliveIntervalsLimit = 10;
    //mySessionProperties.userName = "gpsgenerator";
    mySessionProperties.userName = "default";
    mySessionProperties.vpnName = "test-vpn";
    //mySessionProperties.vpnName = "geo-demo-vmr";
    mySessionProperties.password = "default";
    mySessionProperties.url = "http://172.16.192.155:8080";
    //mySessionProperties.url = "http://151.237.234.149:8080";
    //mySessionProperties.url = "http://52.7.45.6:80";
console.log("iam here");
    mySession = solace.SolclientFactory.createSession(mySessionProperties,
    new solace.MessageRxCBInfo(function(session, message) {
        messageEventCb(session, message);
      }, this),
      new solace.SessionEventCBInfo(function(session, event) {
        sessionEventCb(session, event);
      }, this));
    mySession.connect();
console.log("here2");
  } catch (error) {
console.log("Solace Error: " + error.toString());
    log("Solace Error: " + error.toString());
  }
}

sessionEventCb = function (session, event) {
console.log("event!  "+ event.infoStr);
  if (event.sessionEventCode === solace.SessionEventCode.UP_NOTICE) {
    log("<font color=\"green\">Connected<BR>");
    solace_ready = 1;
  } else if (event.sessionEventCode === solace.SessionEventCode.SUBSCRIPTION_OK) {
  } else if (event.sessionEventCode === solace.SessionEventCode.SUBSCRIPTION_ERROR) {
    log("Failed to add subscription");
  } else if (event.sessionEventCode === solace.SessionEventCode.LOGIN_FAILURE) {
    log("Failed to login to appliance:" + event.infoStr, true);
  } else if (event.sessionEventCode === solace.SessionEventCode.CONNECTING) {
    log("<font color=\"orange\">Connecting...</font><BR>");
  } else if (event.sessionEventCode === solace.SessionEventCode.DISCONNECTED) {
    log("Session is disconnected", false);
    solace_ready = 0;
    //connect();
  } else {
    log("Session failure!", false);
  }
};
