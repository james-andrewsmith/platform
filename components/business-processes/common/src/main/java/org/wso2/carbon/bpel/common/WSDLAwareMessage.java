/*
 * Copyright (c) 2010, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.wso2.carbon.bpel.common;

import org.apache.axiom.om.OMElement;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.w3c.dom.Element;

import javax.xml.namespace.QName;
import java.util.HashMap;
import java.util.Map;

/**
 * Representation of WSDL input message to the HumanTask
 */
public class WSDLAwareMessage {
    private static Log log = LogFactory.getLog(WSDLAwareMessage.class);

    private Map<String, OMElement> headerParts = new HashMap<String, OMElement>();
    private Map<String, OMElement> bodyParts = new HashMap<String, OMElement>();

    private boolean isRPC = false;
    private String operationName;
    private QName portTypeName;

    private int tenantId;

    public void addBodyPart(String partName, OMElement partElement) {
        bodyParts.put(partName, partElement);
    }

    public void addHeaderPart(String partName, OMElement partElement) {
        headerParts.put(partName, partElement);
    }

    public Element getBodyPart(String partName) {
        return OMUtils.toDOM(bodyParts.get(partName));
    }

    public Element getHeaderPart(String partName) {
        return OMUtils.toDOM(headerParts.get(partName));
    }

    public Map<String, OMElement> getBodyParts() {
        return bodyParts;
    }

    public Map<String, OMElement> getHeaderParts() {
        return headerParts;
    }

    public boolean isRPC() {
        return isRPC;
    }

    public void setRPC(boolean RPC) {
        isRPC = RPC;
    }

    public String getOperationName() {
        return operationName;
    }

    public void setOperationName(String operationName) {
        this.operationName = operationName;
    }

    public QName getPortTypeName() {
        return portTypeName;
    }

    public void setPortTypeName(QName portTypeName) {
        this.portTypeName = portTypeName;
    }

    public int getTenantId() {
        return tenantId;
    }

    public void setTenantId(int tenantId) {
        this.tenantId = tenantId;
    }

    public Map<String, Element> getBodyPartElements() {
        Map<String, Element> messageBodyParts = new HashMap<String, Element>();

        for (Map.Entry<String, OMElement> part : bodyParts.entrySet()) {
            messageBodyParts.put(part.getKey(), OMUtils.toDOM(part.getValue()));
        }

        return messageBodyParts;
    }

    public Map<String, Element> getHeaderPartElements() {
        Map<String, Element> messageHeaderParts = new HashMap<String, Element>();

        for (Map.Entry<String, OMElement> part : headerParts.entrySet()) {
            messageHeaderParts.put(part.getKey(), OMUtils.toDOM(part.getValue()));
        }

        return messageHeaderParts;
    }
}
