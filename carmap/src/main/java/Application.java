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

//package com.solace.demos.cloudfoundry.scaling.aggregator;

import org.springframework.http.HttpStatus;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.*;
import org.springframework.web.bind.annotation.*;

import org.springframework.cloud.Cloud;
import org.springframework.cloud.CloudFactory;
import com.solace.labs.spring.cloud.core.SolaceMessagingInfo;

import com.solacesystems.jcsmp.Browser;
import com.solacesystems.jcsmp.BrowserProperties;
import com.solacesystems.jcsmp.BytesXMLMessage;
import com.solacesystems.jcsmp.JCSMPException;
import com.solacesystems.jcsmp.Topic;
import com.solacesystems.jcsmp.JCSMPFactory;
import com.solacesystems.jcsmp.JCSMPProperties;
import com.solacesystems.jcsmp.JCSMPSession;
import com.solacesystems.jcsmp.JCSMPStreamingPublishEventHandler;
import com.solacesystems.jcsmp.TextMessage;
import com.solacesystems.jcsmp.XMLMessageProducer;
import com.solacesystems.jcsmp.Queue;
import com.solacesystems.jcsmp.EndpointProperties;

@Configuration
//@ComponentScan
@RestController
@EnableAutoConfiguration
public class Application {

	static private JCSMPSession session;
    static private Queue listenQueue;
    static private Browser myBrowser;

    @RequestMapping(value = "/cars", method = RequestMethod.GET)
    String getCars() throws JCSMPException {
		System.out.println("Entering getCars");

        BytesXMLMessage rx_msg = null;
        String response = "[\n";
        int i=0;

        while (i < 50 && (rx_msg = myBrowser.getNext()) != null) {
            System.out.println("Browser got message... dumping:");
            System.out.println(rx_msg.dump());

            String body = "";
            if (rx_msg.hasAttachment()) {
                byte[] attachment = new byte[rx_msg.getAttachmentContentLength()];
                rx_msg.readAttachmentBytes(attachment);
                body = new String(attachment);
            }
            System.out.println("Body: " + body);
            if (i > 0)
                response += ",\n";
            response += body;

            System.out.print("Removing message from queue...");
            myBrowser.remove(rx_msg);
            System.out.println("Message removed");

            i++;
        }
        response += "\n]";
        System.out.println("Finished browsing.");

        return response;
    }

    public static void main(String[] args) throws JCSMPException {
        CloudFactory cloudFactory = new CloudFactory();
        Cloud cloud = cloudFactory.getCloud();

        SolaceMessagingInfo solaceMessagingServiceInfo = (SolaceMessagingInfo) cloud
                .getServiceInfo("solace-messaging-demo-instance");

        if (solaceMessagingServiceInfo == null) {
            System.out.println("Did not find instance of 'solace-messaging' service");
            System.out.println("************* Aborting Solace initialization!! ************");
            return;
        }

		final JCSMPProperties properties = new JCSMPProperties();
		properties.setProperty(JCSMPProperties.HOST, solaceMessagingServiceInfo.getSmfHost());
		properties.setProperty(JCSMPProperties.VPN_NAME, solaceMessagingServiceInfo.getMsgVpnName());
		properties.setProperty(JCSMPProperties.USERNAME, solaceMessagingServiceInfo.getClientUsername());
		properties.setProperty(JCSMPProperties.PASSWORD, solaceMessagingServiceInfo.getClientPassword());

        System.out.println("Vpn: " + solaceMessagingServiceInfo.getMsgVpnName());
        System.out.println("User: " + solaceMessagingServiceInfo.getClientUsername());
        System.out.println("Passwd: " + solaceMessagingServiceInfo.getClientPassword());

        session = JCSMPFactory.onlyInstance().createSession(properties);
        session.connect();

        EndpointProperties provision = new EndpointProperties();
        provision.setPermission(EndpointProperties.PERMISSION_DELETE);
        provision.setAccessType(EndpointProperties.ACCESSTYPE_EXCLUSIVE);
        provision.setQuota(100);

        listenQueue = JCSMPFactory.onlyInstance().createQueue("cars");
        session.provision(listenQueue, provision, JCSMPSession.FLAG_IGNORE_ALREADY_EXISTS);

        Topic topic = JCSMPFactory.onlyInstance().createTopic("geo/coord/>");
        try { 
            // subscribe to "geo/coord/%s" 
            session.addSubscription(listenQueue, topic, JCSMPSession.WAIT_FOR_CONFIRM);
        } catch (Exception e) {}

        BrowserProperties br_prop = new BrowserProperties();
        br_prop.setEndpoint(listenQueue);
        br_prop.setTransportWindowSize(50);
        br_prop.setWaitTimeout(150);
        myBrowser = session.createBrowser(br_prop);

        System.out.println("************* Solace initialized correctly!! ************");

        SpringApplication.run(Application.class, args);
    }
}
