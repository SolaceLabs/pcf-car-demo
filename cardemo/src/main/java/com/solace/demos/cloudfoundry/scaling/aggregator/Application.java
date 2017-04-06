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

package com.solace.demos.cloudfoundry.scaling.aggregator;

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

import com.solacesystems.jcsmp.JCSMPException;
import com.solacesystems.jcsmp.Topic;
import com.solacesystems.jcsmp.JCSMPFactory;
import com.solacesystems.jcsmp.JCSMPProperties;
import com.solacesystems.jcsmp.JCSMPSession;
import com.solacesystems.jcsmp.JCSMPStreamingPublishEventHandler;
import com.solacesystems.jcsmp.TextMessage;
import com.solacesystems.jcsmp.XMLMessageProducer;

@Configuration
@ComponentScan
@RestController
@EnableAutoConfiguration
public class Application {
	
	static private JCSMPSession session;

    //@RequestMapping("/")
    //String home() {
    //    return "Hello World!";
    //}

    @RequestMapping(value = "/car/new/{carId}/{driverName}", method = RequestMethod.POST)
    public ResponseEntity<?> newCar(
                                @PathVariable("carId") String carId,
                                @PathVariable("driverName") String driverName) throws JCSMPException {
		System.out.println("Entering car/new: " + carId + "/" + driverName);

        Topic topic = JCSMPFactory.onlyInstance().createTopic("car/new/" + carId + "/" + driverName);
        XMLMessageProducer prod = session.getMessageProducer(new JCSMPStreamingPublishEventHandler() {
            public void responseReceived(String messageID) {
                System.out.println("Producer received response for msg: " + messageID);
            }
            public void handleError(String messageID, JCSMPException e, long timestamp) {
                System.out.printf("Producer received error for msg: %s@%s - %s%n",
                        messageID,timestamp,e);
            }
        });
        TextMessage msg = JCSMPFactory.onlyInstance().createMessage(TextMessage.class);
        msg.setText("");
        prod.send(msg,topic);
        System.out.println("Successfully published message on topic: "+topic.toString());

        return new ResponseEntity<>("{}", HttpStatus.OK);
    }

    @RequestMapping(value = "/car/fault/{carId}/{fault}", method = RequestMethod.POST)
    public ResponseEntity<?> faultCar(
                                @PathVariable("carId") String carId,
                                @PathVariable("fault") String fault) throws JCSMPException {
		System.out.println("Entering car/fault: " + carId + "/" + fault);

        Topic topic = JCSMPFactory.onlyInstance().createTopic("car/fault/" + carId + "/" + fault);
        XMLMessageProducer prod = session.getMessageProducer(new JCSMPStreamingPublishEventHandler() {
            public void responseReceived(String messageID) {
                System.out.println("Producer received response for msg: " + messageID);
            }
            public void handleError(String messageID, JCSMPException e, long timestamp) {
                System.out.printf("Producer received error for msg: %s@%s - %s%n",
                        messageID,timestamp,e);
            }
        });
        TextMessage msg = JCSMPFactory.onlyInstance().createMessage(TextMessage.class);
        msg.setText("");
        prod.send(msg,topic);
        System.out.println("Successfully published message on topic: "+topic.toString());

        return new ResponseEntity<>("{}", HttpStatus.OK);
    }

    @RequestMapping(value = "/car/clear/{carId}", method = RequestMethod.POST)
    public ResponseEntity<?> clearFault(
                                @PathVariable("carId") String carId) throws JCSMPException {
		System.out.println("Entering car/clear: " + carId);

        Topic topic = JCSMPFactory.onlyInstance().createTopic("car/clear/" + carId);
        XMLMessageProducer prod = session.getMessageProducer(new JCSMPStreamingPublishEventHandler() {
            public void responseReceived(String messageID) {
                System.out.println("Producer received response for msg: " + messageID);
            }
            public void handleError(String messageID, JCSMPException e, long timestamp) {
                System.out.printf("Producer received error for msg: %s@%s - %s%n",
                        messageID,timestamp,e);
            }
        });
        TextMessage msg = JCSMPFactory.onlyInstance().createMessage(TextMessage.class);
        msg.setText("");
        prod.send(msg,topic);
        System.out.println("Successfully published message on topic: "+topic.toString());

        return new ResponseEntity<>("{}", HttpStatus.OK);
    }

    @RequestMapping(value = "/car/remove/{carId}", method = RequestMethod.POST)
    public ResponseEntity<?> removeCar(
                                @PathVariable("carId") String carId) throws JCSMPException {
		System.out.println("Entering car/remove: " + carId);

        Topic topic = JCSMPFactory.onlyInstance().createTopic("car/remove/" + carId);
        XMLMessageProducer prod = session.getMessageProducer(new JCSMPStreamingPublishEventHandler() {
            public void responseReceived(String messageID) {
                System.out.println("Producer received response for msg: " + messageID);
            }
            public void handleError(String messageID, JCSMPException e, long timestamp) {
                System.out.printf("Producer received error for msg: %s@%s - %s%n",
                        messageID,timestamp,e);
            }
        });
        TextMessage msg = JCSMPFactory.onlyInstance().createMessage(TextMessage.class);
        msg.setText("");
        prod.send(msg,topic);
        System.out.println("Successfully published message on topic: "+topic.toString());

        return new ResponseEntity<>("{}", HttpStatus.OK);
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

        session = JCSMPFactory.onlyInstance().createSession(properties);
        session.connect();

        System.out.println("************* Solace initialized correctly!! ************");
        System.out.println("Vpn: " + solaceMessagingServiceInfo.getMsgVpnName());
        System.out.println("User: " + solaceMessagingServiceInfo.getClientUsername());
        System.out.println("Passwd: " + solaceMessagingServiceInfo.getClientPassword());

        SpringApplication.run(Application.class, args);
    }
}
