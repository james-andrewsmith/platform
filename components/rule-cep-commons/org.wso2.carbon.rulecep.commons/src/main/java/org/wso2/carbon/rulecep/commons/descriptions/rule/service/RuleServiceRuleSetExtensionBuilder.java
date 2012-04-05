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
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.rulecep.commons.CommonsConstants;
import org.wso2.carbon.rulecep.commons.LoggedRuntimeException;
import org.wso2.carbon.rulecep.commons.descriptions.XPathFactory;
import org.wso2.carbon.rulecep.commons.descriptions.rule.RuleSetDescription;
import org.wso2.carbon.rulecep.commons.descriptions.service.ExtensibleConfiguration;
import org.wso2.carbon.rulecep.commons.descriptions.service.ExtensionBuilder;

/**
 * ConfigurationExtensionBuilder for building extensions in the rule set configuration used in the rule service
 */
public class RuleServiceRuleSetExtensionBuilder implements ExtensionBuilder {

    private static Log log = LogFactory.getLog(RuleServiceRuleSetExtensionBuilder.class);

    public void build(ExtensibleConfiguration extensibleConfiguration,
                      OMElement ruleSet, XPathFactory xPathFactory) {

        if (!(extensibleConfiguration instanceof RuleSetDescription)) {
            throw new LoggedRuntimeException("Invalid rule configuration," +
                    "expect RuleSetDescription.", log);
        }
        RuleSetDescription description = (RuleSetDescription) extensibleConfiguration;

        String ruleKey = ruleSet.getAttributeValue(CommonsConstants.ATT_KEY_Q);
        if (ruleKey != null && !"".equals(ruleKey)) {
            description.setKey(ruleKey.trim());
        } else {
            String path = ruleSet.getAttributeValue(CommonsConstants.ATT_PATH_Q);
            if (path != null && !"".equals(path)) {
                description.setPath(path);
            } else {
                OMElement inLinedSource = ruleSet.getFirstElement();
                if (inLinedSource == null) {
                    String inLinedText = ruleSet.getText();
                    if (inLinedText == null || "".equals(inLinedText.trim())) {
                        throw new LoggedRuntimeException("The rule set source cannot be found " +
                                "from either in-lined or key. It is required.", log);
                    } else {
                        description.setRuleSource(inLinedText.trim());
                    }
                } else {
                    description.setRuleSource(inLinedSource);
                }
            }
        }
    }
}

