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
package org.wso2.carbon.rulecep.commons.descriptions.rule.service;

import org.apache.axiom.om.OMElement;
import org.wso2.carbon.rulecep.commons.CommonsConstants;
import org.wso2.carbon.rulecep.commons.descriptions.QNameFactory;
import org.wso2.carbon.rulecep.commons.descriptions.XPathFactory;
import org.wso2.carbon.rulecep.commons.descriptions.rule.RuleSetDescription;
import org.wso2.carbon.rulecep.commons.descriptions.rule.RuleSetDescriptionFactory;
import org.wso2.carbon.rulecep.commons.descriptions.service.ExtensionBuilder;

import javax.xml.namespace.QName;

/**
 * Creates <code>RuleServiceExtensionDescription<code> instants from an XML
 */
public class RuleServiceExtensionDescriptionFactory {


    public static RuleServiceExtensionDescription create(OMElement configuration,
                                                         XPathFactory xPathFactory,
                                                         ExtensionBuilder extensionBuilder) {

        final RuleServiceExtensionDescription description = new RuleServiceExtensionDescription();
        QName parentQName = configuration.getQName();
        QNameFactory qNameFactory = QNameFactory.getInstance();

        // rule set
        QName parameterQName = qNameFactory.createQName(CommonsConstants.ELE_RULESET,
                parentQName);
        OMElement parameterElem = configuration.getFirstChildWithName(parameterQName);
        if (parameterElem != null) {
            RuleSetDescription ruleSetDescription =
                    RuleSetDescriptionFactory.create(parameterElem, xPathFactory, extensionBuilder);
            if (ruleSetDescription != null) {
                description.setRuleSetDescription(ruleSetDescription);
            }
        }
        return description;
    }
}
