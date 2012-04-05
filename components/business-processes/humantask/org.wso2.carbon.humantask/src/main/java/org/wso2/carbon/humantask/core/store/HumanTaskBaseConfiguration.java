/*
 * Copyright (c) 2011, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

package org.wso2.carbon.humantask.core.store;

import org.apache.axis2.engine.AxisConfiguration;
import org.w3c.dom.Attr;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.wso2.carbon.humantask.*;
import org.wso2.carbon.humantask.core.HumanTaskConstants;
import org.wso2.carbon.humantask.core.utils.HumanTaskNamespaceContext;

import javax.wsdl.Definition;
import javax.wsdl.PortType;
import javax.xml.namespace.QName;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Base class for Task and Notification definitions. Contains the common properties of Tasks and Notifications.
 */
public abstract class HumanTaskBaseConfiguration {

    public static enum ConfigurationType {
        TASK,
        NOTIFICATION
    }

    // Target namespace of human interaction document
    private String targetNamespace;

    // WSDL definition which describes the task/notification interface(This can also hold the response interface def).
    private Definition wsdl;

    // Human Interactions definition which contains tasks and notifications
    private HumanInteractionsDocument humanInteractionsDocument;

    // This will be the default expression language for the human tasks.
    // At the runtime this property will be overridden by expression language
    // settings from the nearest scope.
    private String defaultExpressionLanguage = HumanTaskConstants.WSHT_EXP_LANG_XPATH20;

    // Namespace context of the task/notification
    private HumanTaskNamespaceContext namespaceContext = new HumanTaskNamespaceContext();

    private String humanTaskArtifactName;

    // Whether this is a task or notification
    private boolean task;

    private AxisConfiguration tenantAxisConf;

    private String packageName;



    public HumanTaskBaseConfiguration(){}


    public HumanTaskBaseConfiguration(HumanInteractionsDocument humanInteractionsDocument,
                                      String targetNamespace,
                                      String humanTaskArtifactName,
                                      AxisConfiguration tenantAxisConf,
                                      boolean task, String packageName) {
        this.humanInteractionsDocument = humanInteractionsDocument;
        this.targetNamespace = targetNamespace;
        this.humanTaskArtifactName = humanTaskArtifactName;
        this.task = task;
        this.tenantAxisConf = tenantAxisConf;
        this.packageName = packageName;

        if (humanInteractionsDocument.getHumanInteractions().getExpressionLanguage() != null) {
            this.defaultExpressionLanguage = humanInteractionsDocument.getHumanInteractions().
                    getExpressionLanguage().trim();
        }
    }

    public String getTargetNamespace() {
        return targetNamespace;
    }

    public HumanInteractionsDocument getHumanInteractionsDocument() {
        return humanInteractionsDocument;
    }

    public String getExpressionLanguage() {
        return defaultExpressionLanguage;
    }

    public void setDefaultExpressionLanguage(String defaultExpressionLanguage) {
        this.defaultExpressionLanguage = defaultExpressionLanguage;
    }

    public String getHumanTaskArtifactName() {
        return humanTaskArtifactName;
    }

    public void setHumanTaskArtifactName(String humanTaskArtifactName) {
        this.humanTaskArtifactName = humanTaskArtifactName;
    }

    public HumanTaskNamespaceContext getNamespaceContext() {
        return namespaceContext;
    }

    public void setNamespaceContext(HumanTaskNamespaceContext namespaceContext) {
        this.namespaceContext = namespaceContext;
    }

    public Definition getWSDL() {
        return wsdl;
    }

    public void setWSDL(Definition wsdl) {
        this.wsdl = wsdl;
    }

    public boolean isTask(){
        return task;
    }

    public AxisConfiguration getTenantAxisConf() {
        return tenantAxisConf;
    }

    public abstract QName getPortType();

    public abstract String getOperation();

    public abstract QName getName();

    public abstract QName getServiceName();

    public abstract String getPortName();

    public abstract TPriorityExpr getPriorityExpression();

    protected Definition findWSDLDefinition(List<Definition> wsdls, QName portType, String operation){
         for (Definition wsdl : wsdls) {
            PortType port;
            if ((port = wsdl.getPortType(portType)) != null) {
                if (port.getOperation(operation, null, null) != null) {
                    return wsdl;
                }
            }
        }
        return null;
    }

    public static void populateNamespace(Element root, HumanTaskNamespaceContext nsCtx) {
        if (root == null) {
            throw new IllegalArgumentException("Task element cannot be null.");
        }

        if (root.getParentNode() != null && root.getParentNode().getNodeType() == Node.ELEMENT_NODE) {
            populateNamespace((Element) root.getParentNode(), nsCtx);
        }

        NamedNodeMap attributes = root.getAttributes();
        for (int i = 0; i < attributes.getLength(); ++i) {
            Attr attribute = (Attr) attributes.item(i);
            if (!attribute.getName().startsWith("xmlns:")) {
                continue;
            }
            String prefix = attribute.getLocalName();
            String uri = attribute.getValue();

            nsCtx.register(prefix, uri);
        }

        Attr defaultNs = root.getAttributeNode("xmlns");
        if (defaultNs != null) {
            nsCtx.register("", defaultNs.getTextContent());
        }
    }

    public Map<String, QName> getLogicalPeopleGroupParams(String name) {
        Map<String, QName> params = new HashMap<String, QName>();
        TLogicalPeopleGroup[] logicalPeopleGroups = humanInteractionsDocument.
                getHumanInteractions().getLogicalPeopleGroups().getLogicalPeopleGroupArray();
        for (TLogicalPeopleGroup lpg : logicalPeopleGroups) {
            if (lpg.getName().equals(name)) {
                TParameter[] paramsArray = lpg.getParameterArray();
                for (TParameter param : paramsArray) {
                    params.put(param.getName(), param.getType());
                }
            }
        }
        return params;
    }

    public String getPackageName() {
        return packageName;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    public abstract TPresentationElements getPresentationElements();

    /**
     * Deadline configuration of task.
     * @return The task deadlines.
     */
    public abstract TDeadlines getDeadlines();

    public abstract ConfigurationType getConfigurationType();

    public boolean isValidPart(String partName) {
        return wsdl.getPortType(getPortType()).getOperation(getOperation(), null, null).
                getInput().getMessage().getPart(partName) != null;
    }
}
