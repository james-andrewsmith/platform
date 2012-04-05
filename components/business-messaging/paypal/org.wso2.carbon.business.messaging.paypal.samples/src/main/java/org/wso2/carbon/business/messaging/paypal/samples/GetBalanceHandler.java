/*
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *   * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */

package org.wso2.carbon.business.messaging.paypal.samples;

import org.apache.axiom.om.OMAbstractFactory;
import org.apache.axiom.om.OMElement;
import org.apache.axiom.om.OMFactory;
import org.apache.axiom.om.OMNamespace;
import org.apache.axiom.om.xpath.AXIOMXPath;

/**
 * A class that can create messages to, and parse replies from our sample Paypal
 * service
 */
public class GetBalanceHandler{

	/**
	 * <pre>
	 * Create a new custom quote request with a body as follows
	 * 		&lt;urn:GetBanalceRequest xmlns:urn=&quot;http://services.samples&quot;&gt;
	 * 			&lt;urn:Version&gt;The number of the PayPal SOAP API version&lt;/urn:Version&gt;
	 * 			&lt;urn:Username&gt;Your API username&lt;/urn:Username&gt;
	 * 			&lt;urn:Password&gt;Your API password&lt;/urn:Password&gt;
	 * 			&lt;urn:Signature&gt;Your API signature&lt;/urn:Signature&gt;
	 * 		&lt;/urn:GetBanalceRequest&gt;
	 * 		
	 * </pre>
	 * 
	 * @param version
	 *            Version of the paypal service API you are invoking.
	 * @param username
	 *            Your API username, which is auto-generated by PayPal when you
	 *            apply for a digital certificate to use the PayPal SOAP API..
	 * @param password
	 *            Your API password, which you specify when you apply for a
	 *            digital certificate to use the PayPal SOAP API.
	 * @param signature
	 *            Your API signature, if you use one instead of an API
	 *            Certificate.
	 * @return OMElement for SOAP body
	 */

	public OMElement createRequestPayload(String version,
			String username, String password, String signature) {
		OMFactory factory = OMAbstractFactory.getOMFactory();
		OMNamespace ns = factory.createOMNamespace("http://wso2.services.samples",
				"ns");

		OMElement chkPriceElem = factory.createOMElement("GetBanalceRequest",
				ns);
		OMElement versionElem = factory.createOMElement("Version", ns);
		OMElement usernameElem = factory.createOMElement("Username", ns);
		OMElement passwordElem = factory.createOMElement("Password", ns);
		OMElement signatureElem = factory.createOMElement("Signature", ns);

		versionElem.setText(version);
		usernameElem.setText(username);
		passwordElem.setText(password);
		signatureElem.setText(signature);

		chkPriceElem.addChild(versionElem);
		chkPriceElem.addChild(usernameElem);
		chkPriceElem.addChild(passwordElem);
		chkPriceElem.addChild(signatureElem);

		return chkPriceElem;
	}

	/**
	 * Digests the standard StockQuote response and extracts the last trade
	 * price from the following
	 * 
	 * <pre>
	 * &lt;GetBalanceResponse xmlns=&quot;urn:ebay:api:PayPalAPI&quot;&gt; 
	 * &lt;Timestamp&gt;2010-02-12T09:32:45Z&lt;/Timestamp&gt;
	 * ... 
	 * &lt;Balance currencyID=&quot;USD&quot;&gt;100.00&lt;/Balance&gt;
	 * ...
	 * &lt;/GetBalanceResponse&gt;
	 * </pre>
	 * 
	 * @param result
	 * @return
	 * @throws javax.xml.stream.XMLStreamException
	 * 
	 */
	public static String parseGetBalanceResponse(OMElement result)
			throws Exception {

		AXIOMXPath xPath = new AXIOMXPath("//m:Balance");
		xPath.addNamespace("m", "urn:ebay:api:PayPalAPI");
		// xPath.add("m", "http://www.w3.org/2001/XMLSchema-instance");
		// xPath.addNamespace("xsi",
		// "http://www.w3.org/2001/XMLSchema-instance");
		OMElement last = (OMElement) xPath.selectSingleNode(result);
		if (last != null) {
			// return String.format("%s %s", last.getText(), last.getAttribute(
			// new QName("currencyID")).getAttributeValue());
			return String.format("%s %s", last.getText(), "");
		} else {
			throw new Exception("Unexpected response : " + result);
		}
	}
}
